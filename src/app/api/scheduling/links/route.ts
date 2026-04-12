import { NextRequest, NextResponse } from 'next/server';
import { schedulingDb as db } from '@/lib/db/scheduling';
import { taskDependencies } from '@/lib/db/scheduling-schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const result = await db.select().from(taskDependencies);
    const rows = result ?? [];
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

// Make /links also return raw array (no {success,data} wrapper) to match SVAR expectations
