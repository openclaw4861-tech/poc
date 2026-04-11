import { NextRequest, NextResponse } from 'next/server';
import { schedulingDb as db } from '@/lib/db/scheduling';
import { taskDependencies } from '@/lib/db/scheduling-schema';
import { eq } from 'drizzle-orm';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [row] = await db
      .delete(taskDependencies)
      .where(eq(taskDependencies.id, parseInt(id)))
      .returning() as any[];
    if (!row) {
      return NextResponse.json({ success: false, error: 'Dependency not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: row });
  } catch (error) {
    console.error('DELETE /api/scheduling/dependencies/[id] error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}