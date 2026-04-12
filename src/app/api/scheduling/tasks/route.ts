import { NextRequest, NextResponse } from 'next/server';
import { schedulingDb as db } from '@/lib/db/scheduling';
import { tasks } from '@/lib/db/scheduling-schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    let rows;
    if (projectId) {
      const result = await db.execute(sql`
        SELECT id, project_id, parent_task_id, name, start_date, end_date,
               duration_days, percent_complete, constraint_type, constraint_offset_days,
               sort_order, created_at, updated_at
        FROM scheduling_tasks
        WHERE project_id = ${parseInt(projectId)}
        ORDER BY sort_order ASC, id ASC
      `);
      rows = (result as any).rows ?? [];
    } else {
      const result = await db.select().from(tasks);
      rows = result ?? [];
    }

    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error('GET /api/scheduling/tasks error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}