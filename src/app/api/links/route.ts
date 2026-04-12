import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAllLinks, createLink, updateLink, deleteLink } from '@/lib/db/actions';

export async function GET() {
  try {
    const linkList = await getAllLinks();
    return NextResponse.json(linkList);
  } catch (error) {
    console.error('GET /api/links error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newLink = await createLink(body);
    return NextResponse.json({ id: newLink.id });
  } catch (error) {
    console.error('POST /api/links error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const updatedLink = await updateLink(body.id, body);
    return NextResponse.json({ id: updatedLink?.id });
  } catch (error) {
    console.error('PUT /api/links error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    await deleteLink(body.id);
    return NextResponse.json({});
  } catch (error) {
    console.error('DELETE /api/links error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
