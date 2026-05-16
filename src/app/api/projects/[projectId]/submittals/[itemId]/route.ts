import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { submittalItems, submittalChecklists } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * PUT /api/projects/:projectId/submittals/:itemId
 * Update a submittal item
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; itemId: string }> }
) {
  try {
    const { projectId, itemId } = await params;
    const body = await request.json();

    // Verify item exists and belongs to project
    const item = await db.query.submittalItems.findFirst({
      where: (i, { eq, and }) => and(
        eq(i.id, parseInt(itemId)),
        eq(i.checklistId, submittalChecklists.id)
      ),
      with: {
        checklist: {
          columns: { projectId: true },
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      );
    }

    if (item.checklist.projectId !== projectId) {
      return NextResponse.json(
        { success: false, error: 'Item does not belong to this project' },
        { status: 403 }
      );
    }

    // Update item
    const updateData: Partial<typeof submittalItems.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (body.specSection !== undefined) updateData.specSection = body.specSection;
    if (body.specSubsection !== undefined) updateData.specSubsection = body.specSubsection;
    if (body.requirementType !== undefined) updateData.requirementType = body.requirementType;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.details !== undefined) updateData.details = body.details;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.userNotes !== undefined) updateData.userNotes = body.userNotes;

    const [updatedItem] = await db.update(submittalItems)
      .set(updateData)
      .where(eq(submittalItems.id, parseInt(itemId)))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedItem,
    });
  } catch (error) {
    console.error('Error updating submittal item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update submittal item' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/:projectId/submittals/:itemId
 * Delete a submittal item
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; itemId: string }> }
) {
  try {
    const { projectId, itemId } = await params;

    // Verify item exists and belongs to project
    const item = await db.query.submittalItems.findFirst({
      where: (i, { eq }) => eq(i.id, parseInt(itemId)),
      with: {
        checklist: {
          columns: { projectId: true },
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      );
    }

    if (item.checklist.projectId !== projectId) {
      return NextResponse.json(
        { success: false, error: 'Item does not belong to this project' },
        { status: 403 }
      );
    }

    await db.delete(submittalItems).where(eq(submittalItems.id, parseInt(itemId)));

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting submittal item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete submittal item' },
      { status: 500 }
    );
  }
}
