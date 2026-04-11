import { NextRequest, NextResponse } from 'next/server';
import { schedulingDb as db } from '@/lib/db/scheduling';
import { resources, type NewResource } from '@/lib/db/scheduling-schema';
import { eq, asc } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, name, type } = body;

    if (!projectId || !name || !type) {
      return NextResponse.json(
        { success: false, error: 'projectId, name, and type are required' },
        { status: 400 }
      );
    }

    const validTypes = ['CREW', 'EQUIPMENT', 'MATERIAL'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: `type must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const values: NewResource = {
      projectId: Number(projectId),
      name: String(name),
      type: type as 'CREW' | 'EQUIPMENT' | 'MATERIAL',
    };

    const rows__ = await db.insert(resources).values(values).returning() as any[]; const row = rows__[0];
    return NextResponse.json({ success: true, data: row }, { status: 201 });
  } catch (error) {
    console.error('POST /api/scheduling/resources error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (projectId) {
      const result = await db.query.resources.findMany({
        where: (r, { eq }) => eq(r.projectId, parseInt(projectId)),
        orderBy: [asc(resources.name)],
      });
      return NextResponse.json({ success: true, data: result });
    }

    const result = await db.query.resources.findMany({
      orderBy: [asc(resources.name)],
      limit: 500,
    });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('GET /api/scheduling/resources error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}