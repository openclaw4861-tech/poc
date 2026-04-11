import { NextRequest, NextResponse } from 'next/server';
import { schedulingDb as db } from '@/lib/db/scheduling';
import { tasks, taskDependencies } from '@/lib/db/scheduling-schema';
import { eq, sql } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idNum = parseInt(id);
    const body = await request.json();
    const {
      name, startDate, endDate, durationDays, percentComplete,
      sortOrder, parentTaskId,
      indent, outdent,
      predecessorTaskId, predecessorType, predecessorLagDays, removePredecessor,
    } = body;

    const taskArr = await db.select().from(tasks).where(eq(tasks.id, idNum)).limit(1);
    const task = taskArr[0];
    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    // ── Cascade helper: get successor task IDs + their dep info ────────────────
    async function getSuccessorDepInfo(predId: number) {
      const rows = await db.execute(sql`
        SELECT td.task_id, td.type, td.lag_days, t.start_date, t.end_date, t.duration_days
        FROM scheduling_task_dependencies td
        JOIN scheduling_tasks t ON t.id = td.task_id
        WHERE td.depends_on_task_id = ${predId}
      `);
      return rows.rows as Array<{
        task_id: number; type: string; lag_days: number;
        start_date: Date; end_date: Date; duration_days: number;
      }>;
    }

    async function cascadeDates(predId: number, predStart: Date, predEnd: Date) {
      const successors = await getSuccessorDepInfo(predId);
      for (const s of successors) {
        let newStart = new Date(s.start_date);
        let newEnd = new Date(s.end_date);
        let changed = false;

        const lag = s.lag_days ?? 0;
        if (s.type === 'FS') {
          const requiredStart = new Date(predEnd);
          requiredStart.setDate(requiredStart.getDate() + lag);
          if (requiredStart >= newStart) {
            const delta = requiredStart.getTime() - newStart.getTime();
            newStart = requiredStart;
            newEnd = new Date(newEnd.getTime() + delta);
            changed = true;
          }
        } else if (s.type === 'SS') {
          const refStart = new Date(predStart);
          refStart.setDate(refStart.getDate() + lag);
          if (refStart >= newStart) {
            const delta = refStart.getTime() - newStart.getTime();
            newStart = refStart;
            newEnd = new Date(newEnd.getTime() + delta);
            changed = true;
          }
        } else if (s.type === 'FF') {
          const refEnd = new Date(predEnd);
          refEnd.setDate(refEnd.getDate() + lag);
          if (refEnd > newEnd) {
            const dur = newEnd.getTime() - newStart.getTime();
            newEnd = refEnd;
            newStart = new Date(refEnd.getTime() - dur);
            changed = true;
          }
        } else if (s.type === 'SF') {
          const refEnd = new Date(predEnd);
          refEnd.setDate(refEnd.getDate() + lag);
          if (refEnd >= newStart) {
            const delta = refEnd.getTime() - newStart.getTime();
            newStart = refEnd;
            newEnd = new Date(newEnd.getTime() + delta);
            changed = true;
          }
        }

        if (changed) {
          const newDur = Math.max(1, Math.ceil((newEnd.getTime() - newStart.getTime()) / 86400000));
          await db.update(tasks).set({
            startDate: newStart, endDate: newEnd, durationDays: newDur, updatedAt: new Date(),
          }).where(eq(tasks.id, s.task_id));
          await cascadeDates(s.task_id, newStart, newEnd);
        }
      }
    }

    // ── Indent ───────────────────────────────────────────────────────────────
    if (indent) {
      const allTasksArr = await db.select().from(tasks)
        .where(eq(tasks.projectId, task.projectId))
        .orderBy(tasks.sortOrder, tasks.id);
      const currentIdx = allTasksArr.findIndex(t => t.id === idNum);
      if (currentIdx > 0) {
        const newParent = allTasksArr[currentIdx - 1];
        // Prevent circular parentage
        let check: (typeof allTasksArr)[number] | null = newParent;
        let ok = true;
        while (check) {
          if (check.id === idNum) { ok = false; break; }
          check = check.parentTaskId
            ? allTasksArr.find(t => t.id === check!.parentTaskId) ?? null
            : null;
        }
        if (ok) {
          await db.update(tasks).set({ parentTaskId: newParent.id, updatedAt: new Date() }).where(eq(tasks.id, idNum));
        }
      }
      const updated = await db.select().from(tasks).where(eq(tasks.id, idNum)).limit(1);
      return NextResponse.json({ success: true, data: updated[0] });
    }

    // ── Outdent ──────────────────────────────────────────────────────────────
    if (outdent) {
      await db.update(tasks).set({ parentTaskId: null, updatedAt: new Date() }).where(eq(tasks.id, idNum));
      const updated = await db.select().from(tasks).where(eq(tasks.id, idNum)).limit(1);
      return NextResponse.json({ success: true, data: updated[0] });
    }

    // ── Normal update ───────────────────────────────────────────────────────
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = String(name);
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (durationDays !== undefined) updateData.durationDays = Number(durationDays);
    if (percentComplete !== undefined) updateData.percentComplete = Number(percentComplete);
    if (sortOrder !== undefined) updateData.sortOrder = Number(sortOrder);
    if (parentTaskId !== undefined) updateData.parentTaskId = parentTaskId ? Number(parentTaskId) : null;

    await db.update(tasks).set(updateData).where(eq(tasks.id, idNum));

    // ── Predecessor management ──────────────────────────────────────────────
    if (removePredecessor) {
      await db.delete(taskDependencies).where(eq(taskDependencies.taskId, idNum));
    } else if (predecessorTaskId !== undefined) {
      await db.delete(taskDependencies).where(eq(taskDependencies.taskId, idNum));
      await db.insert(taskDependencies).values({
        taskId: idNum,
        dependsOnTaskId: Number(predecessorTaskId),
        type: predecessorType || 'FS',
        lagDays: predecessorLagDays ?? 0,
      });
    }

    // ── Cascade on date change ──────────────────────────────────────────────
    if (startDate !== undefined || endDate !== undefined) {
      const refreshed = await db.select().from(tasks).where(eq(tasks.id, idNum)).limit(1);
      if (refreshed[0]) {
        await cascadeDates(refreshed[0].id, refreshed[0].startDate, refreshed[0].endDate);
      }
    }

    const updated = await db.select().from(tasks).where(eq(tasks.id, idNum)).limit(1);
    return NextResponse.json({ success: true, data: updated[0] });

  } catch (error) {
    console.error('PUT /api/scheduling/tasks/[id] error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db.delete(tasks).where(eq(tasks.id, parseInt(id))).returning();
    if (!result.length) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('DELETE /api/scheduling/tasks/[id] error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
