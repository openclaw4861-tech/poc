import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { visitors } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Get or create visitor count
    let result = await db.select().from(visitors).limit(1);
    
    if (result.length === 0) {
      // Initialize visitor count
      await db.insert(visitors).values({ count: 1 });
      return NextResponse.json({ count: 1 });
    }
    
    return NextResponse.json({ count: result[0].count });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch visitor count' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Increment visitor count
    const result = await db.select().from(visitors).limit(1);
    
    if (result.length === 0) {
      // Initialize if doesn't exist
      await db.insert(visitors).values({ count: 1 });
      return NextResponse.json({ count: 1 });
    }
    
    // Update count
    const newCount = result[0].count + 1;
    await db
      .update(visitors)
      .set({ count: newCount, updatedAt: new Date() })
      .where(sql`id = ${result[0].id}`);
    
    return NextResponse.json({ count: newCount });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to increment visitor count' },
      { status: 500 }
    );
  }
}
