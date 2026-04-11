import { NextRequest, NextResponse } from 'next/server';
import { schedulingDb as db } from '@/lib/db/scheduling';
import { tasks, type NewTask } from '@/lib/db/scheduling-schema';
import { eq, asc } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      projectId,
      parentTaskId,
      name,
      startDate,
      endDate,
      durationDays,
      percentComplete,
      constraintType,
      constraintOffsetDays,
      sortOrder,
    } = body;

    if (!projectId || !name || !startDate || !endDate || durationDays === undefined) {
      return NextResponse.json(
        { success: false, error: 'projectId, name, startDate, endDate, durationDays are required' },
        { status: 400 }
      );
    }

    const values: NewTask = {
      projectId: Number(projectId),
      parentTaskId: parentTaskId ? Number(parentTaskId) : null,
      name: String(name),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      durationDays: Number(durationDays),
      percentComplete: percentComplete !== undefined ? Number(percentComplete) : 0,
      constraintType: constraintType || 'FS',
      constraintOffsetDays: constraintOffsetDays !== undefined ? Number(constraintOffsetDays) : 0,
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,
    };

    const result = await db.insert(tasks).values(values).returning() as any[];
    const row = result[0];
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

    if (projectId) {
      const result = await db.query.tasks.findMany({
        where: (t, { eq }) => eq(t.projectId, parseInt(projectId)),
        orderBy: [asc(tasks.sortOrder), asc(tasks.id)],
      });
      return NextResponse.json({ success: true, data: result });
    }

    const result = await db.query.tasks.findMany({
      orderBy: [asc(tasks.sortOrder), asc(tasks.id)],
      limit: 500,
    });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('GET /api/scheduling/tasks error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}