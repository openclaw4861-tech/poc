import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { submittalChecklists, submittalItems } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

/**
 * GET /api/projects/:projectId/submittals
 * Get all checklists with their items for a project
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const { searchParams } = new URL(request.url);
    const checklistId = searchParams.get('checklistId');

    let checklists;

    if (checklistId) {
      // Get specific checklist
      const checklist = await db.query.submittalChecklists.findFirst({
        where: (c, { eq }) => eq(c.id, parseInt(checklistId)),
        with: {
          items: {
            orderBy: (i, { asc }) => [asc(i.specSection), asc(i.specSubsection)],
          },
        },
      });

      checklists = checklist ? [checklist] : [];
    } else {
      // Get all checklists for project
      checklists = await db.query.submittalChecklists.findMany({
        where: (c, { eq }) => eq(c.projectId, projectId),
        with: {
          items: {
            orderBy: (i, { asc }) => [asc(i.specSection), asc(i.specSubsection)],
          },
        },
        orderBy: (c, { desc }) => desc(c.pdfUploadedAt),
      });
    }

    return NextResponse.json({
      success: true,
      data: checklists,
    });
  } catch (error) {
    console.error('Error fetching submittals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submittals' },
      { status: 500 }
    );
  }
}
