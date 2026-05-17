import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { submittalChecklists, submittalItems } from '@/db/schema';
import { eq } from 'drizzle-orm';
import * as fs from 'fs/promises';
import * as path from 'path';

// Force this route to be server-side dynamic
export const dynamic = 'force-dynamic';

/**
 * DELETE /api/projects/:projectId/submittals/:checklistId
 * Delete a checklist and its associated PDF file
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; checklistId: string }> }
) {
  try {
    const { projectId, checklistId } = await params;

    // Find the checklist
    const checklist = await db.query.submittalChecklists.findFirst({
      where: (c, { eq }) => eq(c.id, parseInt(checklistId)),
    });

    if (!checklist) {
      return NextResponse.json(
        { success: false, error: 'Checklist not found' },
        { status: 404 }
      );
    }

    if (checklist.projectId !== projectId) {
      return NextResponse.json(
        { success: false, error: 'Checklist does not belong to this project' },
        { status: 403 }
      );
    }

    // Delete associated items first
    await db.delete(submittalItems).where(eq(submittalItems.checklistId, parseInt(checklistId)));

    // Delete the checklist record
    await db.delete(submittalChecklists).where(eq(submittalChecklists.id, parseInt(checklistId)));

    // Delete the PDF file
    if (checklist.pdfFilePath) {
      const relativePath = checklist.pdfFilePath.startsWith('/')
        ? checklist.pdfFilePath.substring(1)
        : checklist.pdfFilePath;
      const filePath = path.join(process.cwd(), 'public', relativePath);

      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.error('Error deleting PDF file:', err);
        // Continue even if file deletion fails - the DB record is already deleted
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Checklist and PDF deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting checklist:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete checklist' },
      { status: 500 }
    );
  }
}
