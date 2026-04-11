import { NextRequest, NextResponse } from 'next/server';
import { schedulingDb as db } from '@/lib/db/scheduling';
import { taskDependencies, type NewTaskDependency } from '@/lib/db/scheduling-schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, dependsOnTaskId, type, lagDays } = body;

    if (!taskId || !dependsOnTaskId) {
      return NextResponse.json(
        { success: false, error: 'taskId and dependsOnTaskId are required' },
        { status: 400 }
      );
    }

    const values: NewTaskDependency = {
      taskId: Number(taskId),
      dependsOnTaskId: Number(dependsOnTaskId),
      type: type || 'FS',
      lagDays: lagDays !== undefined ? Number(lagDays) : 0,
    };

    const rows__ = await db.insert(taskDependencies).values(values).returning() as any[]; const row = rows__[0];
    return NextResponse.json({ success: true, data: row }, { status: 201 });
  } catch (error) {
    console.error('POST /api/scheduling/dependencies error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}