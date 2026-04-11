import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { projects, tasks, resources } from '@/lib/db/scheduling-schema';
import { eq, asc } from 'drizzle-orm';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await db.query.projects.findFirst({
      where: (p, { eq }) => eq(p.id, parseInt(id)),
    });
    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }
    const projectTasks = await db.query.tasks.findMany({
      where: (t, { eq }) => eq(t.projectId, parseInt(id)),
      orderBy: [asc(tasks.sortOrder), asc(tasks.id)],
    });
    const projectResources = await db.query.resources.findMany({
      where: (r, { eq }) => eq(r.projectId, parseInt(id)),
      orderBy: [asc(resources.name)],
    });
    return NextResponse.json({
      success: true,
      data: { ...project, tasks: projectTasks, resources: projectResources },
    });
  } catch (error) {
    console.error('GET /api/scheduling/projects/[id] error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description } = body;
    const [row] = await db
      .update(projects)
      .set({ name, description, updatedAt: new Date() })
      .where(eq(projects.id, parseInt(id)))
      .returning();
    if (!row) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: row });
  } catch (error) {
    console.error('PUT /api/scheduling/projects/[id] error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [row] = await db.delete(projects).where(eq(projects.id, parseInt(id))).returning();
    if (!row) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: row });
  } catch (error) {
    console.error('DELETE /api/scheduling/projects/[id] error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}