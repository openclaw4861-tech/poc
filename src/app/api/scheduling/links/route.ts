import { NextRequest, NextResponse } from 'next/server';
import { schedulingDb as db } from '@/lib/db/scheduling';
import { taskDependencies } from '@/lib/db/scheduling-schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    let result;
    if (projectId) {
      result = await db.execute(sql`
        SELECT td.id, td.task_id, td.depends_on_task_id, td.type, td.lag_days
        FROM scheduling_task_dependencies td
        JOIN scheduling_tasks t ON t.id = td.task_id
        WHERE t.project_id = ${parseInt(projectId)}
      `);
    } else {
      result = await db.select().from(taskDependencies);
    }

    const rows = Array.isArray(result) ? result : (result as any).rows ?? [];
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error('GET /api/scheduling/links error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, dependsOnTaskId, type, lagDays } = body;

    if (!taskId || !dependsOnTaskId) {
      return NextResponse.json({ success: false, error: 'taskId and dependsOnTaskId required' }, { status: 400 });
    }

    const [row] = await db.insert(taskDependencies).values({
      taskId: Number(taskId),
      dependsOnTaskId: Number(dependsOnTaskId),
      type: type || 'FS',
      lagDays: lagDays !== undefined ? Number(lagDays) : 0,
    }).returning() as any[];

    return NextResponse.json({ success: true, data: row }, { status: 201 });
  } catch (error) {
    console.error('POST /api/scheduling/links error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
