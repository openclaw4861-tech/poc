import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { getAllTasks, createTask, updateTask, deleteTask, moveTask } from '@/db/actions';
import { tasks } from '@/db/schema';

export async function GET() {
  try {
    const taskList = await getAllTasks();
    return NextResponse.json(taskList);
  } catch (error) {
    console.error('GET /api/tasks error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newTask = await createTask(body);
    return NextResponse.json({ id: newTask.id });
  } catch (error) {
    console.error('POST /api/tasks error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle move operations from SVAR Gantt
    if (body.operation === 'move' && body.mode && body.target) {
      const updatedTask = await moveTask(body.id, 'move', body.mode, body.target);
      return NextResponse.json({ id: updatedTask?.id });
    }
    
    // Regular update
    const updatedTask = await updateTask(body.id, body);
    return NextResponse.json({ id: updatedTask?.id });
  } catch (error) {
    console.error('PUT /api/tasks error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    await deleteTask(body.id);
    return NextResponse.json({});
  } catch (error) {
    console.error('DELETE /api/tasks error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
