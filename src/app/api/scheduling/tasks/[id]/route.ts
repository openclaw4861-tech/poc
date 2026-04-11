import { NextRequest, NextResponse } from 'next/server';
import { schedulingDb as db } from '@/lib/db/scheduling';
import { tasks } from '@/lib/db/scheduling-schema';
import { eq, asc } from 'drizzle-orm';

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
      indent, outdent,
      predecessorTaskId, predecessorType, predecessorLagDays, removePredecessor,
    } = body;

    const task = await db.query.tasks.findFirst({ where: (t, { eq }) => eq(t.id, idNum) });
    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    // ── Indent ───────────────────────────────────────────────────────────────
    if (indent) {
      const allTasks = await db.query.tasks.findMany({
        where: (t, { eq }) => eq(t.projectId, task.projectId),
        orderBy: [asc(tasks.sortOrder), asc(tasks.id)],
      });
      const currentIdx = allTasks.findIndex(t => t.id === idNum);
      if (currentIdx > 0) {
        const newParent = allTasks[currentIdx - 1];
        let check: (typeof allTasks)[number] | null = newParent;
        let ok = true;
        while (check) {
          if (check.id === idNum) { ok = false; break; }
          check = check.parentTaskId ? allTasks.find(t => t.id === check!.parentTaskId) ?? null : null;
        }
        if (ok) {
          await db.update(tasks).set({ parentTaskId: newParent.id, updatedAt: new Date() }).where(eq(tasks.id, idNum));
        }
      }
      const updated = await db.query.tasks.findFirst({ where: (t, { eq }) => eq(t.id, idNum) });
      return NextResponse.json({ success: true, data: updated });
    }

    // ── Outdent ──────────────────────────────────────────────────────────────
    if (outdent) {
      await db.update(tasks).set({ parentTaskId: null, updatedAt: new Date() }).where(eq(tasks.id, idNum));
      const updated = await db.query.tasks.findFirst({ where: (t, { eq }) => eq(t.id, idNum) });
      return NextResponse.json({ success: true, data: updated });
    }

    // ── Normal field update ─────────────────────────────────────────────────
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

    // ── Predecessor management via taskDependencies ─────────────────────────
    // Import here to avoid schema initialization order issues at module level
    const { taskDependencies } = await import('@/lib/db/scheduling-schema');
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

    const updated = await db.query.tasks.findFirst({ where: (t, { eq }) => eq(t.id, idNum) });
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
