import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { submittalItems, type NewSubmittalItem } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * POST /api/projects/:projectId/submittals/items
 * Add a new submittal item manually
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await request.json();
    const {
      checklistId,
      specSection,
      specSubsection,
      requirementType,
      description,
      details,
      status,
    } = body;

    // Validate required fields
    if (!checklistId || !description) {
      return NextResponse.json(
        { success: false, error: 'checklistId and description are required' },
        { status: 400 }
      );
    }

    // Verify checklist belongs to project
    const checklist = await db.query.submittalChecklists.findFirst({
      where: (c, { eq, and }) => and(
        eq(c.id, parseInt(checklistId)),
        eq(c.projectId, projectId)
      ),
    });

    if (!checklist) {
      return NextResponse.json(
        { success: false, error: 'Checklist not found or does not belong to this project' },
        { status: 404 }
      );
    }

    // Create new item
    const newItem: NewSubmittalItem = {
      checklistId: parseInt(checklistId),
      specSection: specSection || '1.5',
      specSubsection: specSubsection || null,
      requirementType: requirementType || null,
      description,
      details: details || null,
      status: status || 'pending',
    };

    const [createdItem] = await db.insert(submittalItems).values(newItem).returning();

    return NextResponse.json({
      success: true,
      data: createdItem,
    });
  } catch (error) {
    console.error('Error creating submittal item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create submittal item' },
      { status: 500 }
    );
  }
}
