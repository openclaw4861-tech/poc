import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { resources } from '@/lib/db/scheduling-schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, type } = body;

    const validTypes = ['CREW', 'EQUIPMENT', 'MATERIAL'];
    if (type && !validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: `type must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = String(name);
    if (type !== undefined) updateData.type = type;

    const [row] = await db
      .update(resources)
      .set(updateData)
      .where(eq(resources.id, parseInt(id)))
      .returning();

    if (!row) {
      return NextResponse.json({ success: false, error: 'Resource not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: row });
  } catch (error) {
    console.error('PUT /api/scheduling/resources/[id] error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [row] = await db.delete(resources).where(eq(resources.id, parseInt(id))).returning();
    if (!row) {
      return NextResponse.json({ success: false, error: 'Resource not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: row });
  } catch (error) {
    console.error('DELETE /api/scheduling/resources/[id] error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}