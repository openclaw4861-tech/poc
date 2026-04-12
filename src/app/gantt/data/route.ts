import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { getAllTasks, getAllLinks } from '@/db/actions';
import { tasks, links } from '@/db/schema';

export async function GET() {
  try {
    const [taskList, linkList] = await Promise.all([
      getAllTasks(),
      getAllLinks()
    ]);

    // Convert the data to SVAR format
    const formattedTasks = taskList.map(t => ({
      id: t.id,
      text: t.text,
      start: t.start,
      end: t.end,
      duration: t.duration,
      progress: t.progress,
      type: t.type,
      parent: t.parent,
      orderId: t.order_id
    }));

    const formattedLinks = linkList.map(l => ({
      id: l.id,
      source: l.source,
      target: l.target,
      type: l.type
    }));

    return NextResponse.json({
      tasks: formattedTasks,
      links: formattedLinks
    });
  } catch (error) {
    console.error('GET /gantt/data error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
