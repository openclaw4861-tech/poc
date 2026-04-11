import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import {
  projects,
  tasks,
  taskDependencies,
  resources,
  taskAssignments,
  type NewProject,
} from '@/lib/db/scheduling-schema';
import { eq, asc } from 'drizzle-orm';

export async function GET() {
  try {
    const result = await db.query.projects.findMany({
      orderBy: [asc(projects.createdAt)],
    });
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('GET /api/scheduling/projects error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;
    if (!name) {
      return NextResponse.json({ success: false, error: 'name is required' }, { status: 400 });
    }
    const values: NewProject = {
      name: String(name),
      description: description ? String(description) : null,
    };
    const [row] = await db.insert(projects).values(values).returning();
    return NextResponse.json({ success: true, data: row }, { status: 201 });
  } catch (error) {
    console.error('POST /api/scheduling/projects error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}