import { NextRequest, NextResponse } from 'next/server';
import { schedulingDb as db } from '@/lib/db/scheduling';
import { tasks, taskDependencies } from '@/lib/db/scheduling-schema';
import { eq, asc } from 'drizzle-orm';

/** Cascade engine: propagate date changes forward through the dependency graph. */
async function cascadeTaskDates(changedTaskId: number, changedStart: Date, changedEnd: Date): Promise<void> {
  // Get all dependencies where the changed task is the predecessor
  const deps = await db.query.taskDependencies.findMany({
    where: (d, { eq }) => eq(d.dependsOnTaskId, changedTaskId),
  });

  for (const dep of deps) {
    const succArr = await db.query.tasks.findMany({
      where: (t, { eq }) => eq(t.id, dep.taskId),
      limit: 1,
    });
    const successor = succArr[0];
    if (!successor) continue;

    let newSuccessorStart = new Date(successor.startDate);
    let newSuccessorEnd = new Date(successor.endDate);
    let changed = false;

    switch (dep.type) {
      case 'FS': {
        const requiredStart = new Date(changedEnd);
        requiredStart.setDate(requiredStart.getDate() + dep.lagDays);
        if (requiredStart > newSuccessorStart) {
          const delta = requiredStart.getTime() - newSuccessorStart.getTime();
          newSuccessorStart = requiredStart;
          newSuccessorEnd = new Date(newSuccessorEnd.getTime() + delta);
          changed = true;
        }
        break;
      }
      case 'SS': {
        const refStart = new Date(changedStart);
        refStart.setDate(refStart.getDate() + dep.lagDays);
        if (refStart > newSuccessorStart) {
          const delta = refStart.getTime() - newSuccessorStart.getTime();
          newSuccessorStart = refStart;
          newSuccessorEnd = new Date(newSuccessorEnd.getTime() + delta);
          changed = true;
        }
        break;
      }
      case 'FF': {
        const refEnd = new Date(changedEnd);
        refEnd.setDate(refEnd.getDate() + dep.lagDays);
        if (refEnd > newSuccessorEnd) {
          newSuccessorEnd = refEnd;
          const duration = newSuccessorEnd.getTime() - newSuccessorStart.getTime();
          newSuccessorEnd = new Date(newSuccessorStart.getTime() + duration);
          // actually: successor_end = refEnd → recalculate start
          const dur = newSuccessorEnd.getTime() - newSuccessorStart.getTime();
          newSuccessorEnd = new Date(newSuccessorStart.getTime() + dur);
          // FF: successor.end = predecessor.end + lag → recalculate start
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
        if (refEnd > newSuccessorStart) {
          const delta = refEnd.getTime() - newSuccessorStart.getTime();
          newSuccessorStart = refEnd;
          newSuccessorEnd = new Date(newSuccessorEnd.getTime() + delta);
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

      // Recurse
      await cascadeTaskDates(successor.id, newSuccessorStart, newSuccessorEnd);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      projectId, parentTaskId, name, startDate, durationDays,
      percentComplete, predecessorTaskId, predecessorType, predecessorLagDays,
      resourceId,
    } = body;

    if (!projectId || !name || !startDate || durationDays === undefined) {
      return NextResponse.json(
        { success: false, error: 'projectId, name, startDate, durationDays are required' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + Number(durationDays));

    const [row] = await db.insert(tasks).values({
      projectId: Number(projectId),
      parentTaskId: parentTaskId ? Number(parentTaskId) : null,
      name: String(name),
      startDate: start,
      endDate: end,
      durationDays: Number(durationDays),
      percentComplete: percentComplete ?? 0,
      constraintType: predecessorType || 'FS',
      constraintOffsetDays: predecessorLagDays ?? 0,
      sortOrder: 0,
    }).returning();

    // Link predecessor dependency if provided
    if (predecessorTaskId && row) {
      await db.insert(taskDependencies).values({
        taskId: row.id,
        dependsOnTaskId: Number(predecessorTaskId),
        type: predecessorType || 'FS',
        lagDays: predecessorLagDays ?? 0,
      });

      // Cascade from the predecessor → this new task
      const pred = await db.query.tasks.findFirst({
        where: (t, { eq }) => eq(t.id, Number(predecessorTaskId)),
      });
      if (pred) {
        await cascadeTaskDates(pred.id, pred.startDate, pred.endDate);
        // Re-fetch this task in case dates were adjusted
        const refreshed = await db.query.tasks.findFirst({
          where: (t, { eq }) => eq(t.id, row.id),
        });
        if (refreshed && (refreshed.startDate.getTime() !== start.getTime() || refreshed.endDate.getTime() !== end.getTime())) {
          return NextResponse.json({ success: true, data: refreshed });
        }
      }
    }

    return NextResponse.json({ success: true, data: row }, { status: 201 });
  } catch (error) {
    console.error('POST /api/scheduling/tasks error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    const allTasks = projectId
      ? await db.query.tasks.findMany({
          where: (t, { eq }) => eq(t.projectId, parseInt(projectId)),
          orderBy: [asc(tasks.sortOrder), asc(tasks.id)],
          with: {
            assignments: { with: { resource: true } },
            dependencies: { with: { dependsOnTask: true } },
          },
        })
      : await db.query.tasks.findMany({
          orderBy: [asc(tasks.sortOrder), asc(tasks.id)],
          limit: 500,
          with: {
            assignments: { with: { resource: true } },
            dependencies: { with: { dependsOnTask: true } },
          },
        });

    return NextResponse.json({ success: true, data: allTasks });
  } catch (error) {
    console.error('GET /api/scheduling/tasks error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
