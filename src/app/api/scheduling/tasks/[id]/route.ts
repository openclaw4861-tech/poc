import { NextRequest, NextResponse } from 'next/server';
import { schedulingDb as db } from '@/lib/db/scheduling';
import { tasks } from '@/lib/db/scheduling-schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      startDate,
      endDate,
      durationDays,
      percentComplete,
      constraintType,
      constraintOffsetDays,
      sortOrder,
      parentTaskId,
    } = body;

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

    const result = await (db as any)
      .update(tasks)
      .set(updateData)
      .where(eq((tasks as any).id, parseInt(id)))
      .returning() as any[];
    const row = result[0];

    if (!row) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: row });
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
    const result = await (db as any)
      .delete(tasks)
      .where(eq((tasks as any).id, parseInt(id)))
      .returning() as any[];
    const row = result[0];
    if (!row) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: row });
  } catch (error) {
    console.error('DELETE /api/scheduling/tasks/[id] error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}