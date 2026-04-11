import { NextRequest, NextResponse } from 'next/server';
import { schedulingDb as db } from '@/lib/db/scheduling';
import { tasks, taskDependencies, type NewTask } from '@/lib/db/scheduling-schema';
import { eq, asc } from 'drizzle-orm';

/** Cascade engine: propagate date changes forward through the dependency graph. */
async function cascadeTaskDates(changedTaskId: number, changedStart: Date, changedEnd: Date): Promise<void> {
  const deps = await db.query.taskDependencies.findMany({
    where: (d, { eq }) => eq(d.dependsOnTaskId, changedTaskId),
  });

  for (const dep of deps) {
    const successorArr = await db.query.tasks.findMany({
      where: (t, { eq }) => eq(t.id, dep.taskId),
      limit: 1,
    });
    const successor = successorArr[0];
    if (!successor) continue;

    let newSuccessorStart = new Date(successor.startDate);
    let newSuccessorEnd = new Date(successor.endDate);
    let changed = false;

    switch (dep.type) {
      case 'FS': {
        const requiredStart = new Date(changedEnd);
        requiredStart.setDate(requiredStart.getDate() + dep.lagDays);
        if (requiredStart >= newSuccessorStart) {
          const deltaMs = requiredStart.getTime() - newSuccessorStart.getTime();
          newSuccessorStart = requiredStart;
          newSuccessorEnd = new Date(newSuccessorEnd.getTime() + deltaMs);
          changed = true;
        }
        break;
      }
      case 'SS': {
        const refStart = new Date(changedStart);
        refStart.setDate(refStart.getDate() + dep.lagDays);
        if (refStart >= newSuccessorStart) {
          const deltaMs = refStart.getTime() - newSuccessorStart.getTime();
          newSuccessorStart = refStart;
          newSuccessorEnd = new Date(newSuccessorEnd.getTime() + deltaMs);
          changed = true;
        }
        break;
      }
      case 'FF': {
        const refEnd = new Date(changedEnd);
        refEnd.setDate(refEnd.getDate() + dep.lagDays);
        if (refEnd > newSuccessorEnd) {
          const durationMs = newSuccessorEnd.getTime() - newSuccessorStart.getTime();
          newSuccessorEnd = refEnd;
          newSuccessorStart = new Date(refEnd.getTime() - durationMs);
          changed = true;
        }
        break;
      }
      case 'SF': {
        const refEnd = new Date(changedEnd);
        refEnd.setDate(refEnd.getDate() + dep.lagDays);
        if (refEnd >= newSuccessorStart) {
          const deltaMs = refEnd.getTime() - newSuccessorStart.getTime();
          newSuccessorStart = refEnd;
          newSuccessorEnd = new Date(newSuccessorEnd.getTime() + deltaMs);
          changed = true;
        }
        break;
      }
    }

    if (changed) {
      const newDurationDays = Math.max(1, Math.ceil((newSuccessorEnd.getTime() - newSuccessorStart.getTime()) / 86400000));
      await db.update(tasks).set({
        startDate: newSuccessorStart,
        endDate: newSuccessorEnd,
        durationDays: newDurationDays,
        updatedAt: new Date(),
      }).where(eq(tasks.id, successor.id));

      await cascadeTaskDates(successor.id, newSuccessorStart, newSuccessorEnd);
    }
  }
}

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
      constraintType, constraintOffsetDays, sortOrder, parentTaskId,
      // Indent/outdent
      indent, outdent,
      // Predecessor management
      predecessorTaskId, predecessorType, predecessorLagDays, removePredecessor,
    } = body;

    const task = await db.query.tasks.findFirst({ where: (t, { eq }) => eq(t.id, idNum) });
    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    // ── Indent: make this task a child of the task above ──────────────────────
    if (indent) {
      const siblings = await db.query.tasks.findMany({
        where: (t, { eq, and, isNull }) =>
          and(eq(t.projectId, task.projectId), isNull(t.parentTaskId)),
        orderBy: [asc(tasks.sortOrder), asc(tasks.id)],
      });
      const allTasks = await db.query.tasks.findMany({
        where: (t, { eq }) => eq(t.projectId, task.projectId),
        orderBy: [asc(tasks.sortOrder), asc(tasks.id)],
      });
      const currentIdx = allTasks.findIndex(t => t.id === idNum);
      if (currentIdx > 0) {
        const newParent = allTasks[currentIdx - 1];
        // Don't let a task become its own child or descendant
        let check: (typeof allTasks)[number] | null = newParent;
        let ok = true;
        while (check) {
          if (check.id === idNum) { ok = false; break; }
          check?.parentTaskId
            ? allTasks.find(t => t.id === check?.parentTaskId)
            : undefined;
        }
        if (ok) {
          await db.update(tasks).set({ parentTaskId: newParent.id, updatedAt: new Date() }).where(eq(tasks.id, idNum));
        }
      }
      const updated = await db.query.tasks.findFirst({ where: (t, { eq }) => eq(t.id, idNum) });
      return NextResponse.json({ success: true, data: updated });
    }

    // ── Outdent: remove parent — become root level ─────────────────────────────
    if (outdent) {
      await db.update(tasks).set({ parentTaskId: null, updatedAt: new Date() }).where(eq(tasks.id, idNum));
      const updated = await db.query.tasks.findFirst({ where: (t, { eq }) => eq(t.id, idNum) });
      return NextResponse.json({ success: true, data: updated });
    }

    // ── Normal field update ────────────────────────────────────────────────────
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = String(name);
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (durationDays !== undefined) updateData.durationDays = Number(durationDays);
    if (percentComplete !== undefined) updateData.percentComplete = Number(percentComplete);
    if (constraintType !== undefined) updateData.constraintType = constraintType;
    if (constraintOffsetDays !== undefined) updateData.constraintOffsetDays = Number(constraintOffsetDays);
    if (sortOrder !== undefined) updateData.sortOrder = Number(sortOrder);
    if (parentTaskId !== undefined) updateData.parentTaskId = parentTaskId ? Number(parentTaskId) : null;

    await db.update(tasks).set(updateData).where(eq(tasks.id, idNum));

    const updated = await db.query.tasks.findFirst({ where: (t, { eq }) => eq(t.id, idNum) });

    // ── Predecessor management ─────────────────────────────────────────────────
    if (removePredecessor) {
      await db.delete(taskDependencies).where(eq(taskDependencies.taskId, idNum));
    } else if (predecessorTaskId !== undefined) {
      // Remove existing deps for this task, add new one
      await db.delete(taskDependencies).where(eq(taskDependencies.taskId, idNum));
      await db.insert(taskDependencies).values({
        taskId: idNum,
        dependsOnTaskId: Number(predecessorTaskId),
        type: predecessorType || 'FS',
        lagDays: predecessorLagDays ?? 0,
      });
    }

    // ── Cascade if dates changed ───────────────────────────────────────────────
    if (updated && (startDate !== undefined || endDate !== undefined)) {
      await cascadeTaskDates(updated.id, updated.startDate, updated.endDate);
      const refreshed = await db.query.tasks.findFirst({ where: (t, { eq }) => eq(t.id, idNum) });
      return NextResponse.json({ success: true, data: refreshed });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('PUT /api/scheduling/tasks/[id] error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
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
