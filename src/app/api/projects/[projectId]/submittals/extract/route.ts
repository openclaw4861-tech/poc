import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { submittalChecklists, submittalItems, type NewSubmittalItem } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { parsePdf } from '@/lib/pdf-parser';
import { extractSubmittals } from '@/lib/submittal-extractor';
import * as path from 'path';

// Force this route to be server-side dynamic
export const dynamic = 'force-dynamic';

/**
 * POST /api/projects/:projectId/submittals/extract
 * Extract text from uploaded PDF and use AI to parse submittal requirements
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const body = await request.json();
    const { checklistId } = body;

    if (!checklistId) {
      return NextResponse.json(
        { success: false, error: 'checklistId is required' },
        { status: 400 }
      );
    }

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

    // Parse PDF
    const pdfPath = path.join(process.cwd(), 'public', checklist.pdfFilePath);
    const parseResult = await parsePdf(pdfPath);

    if (!parseResult.success || !parseResult.text) {
      return NextResponse.json(
        { success: false, error: parseResult.error || 'Failed to parse PDF' },
        { status: 500 }
      );
    }

    // Extract submittals using AI
    const extractionResult = await extractSubmittals(parseResult.text);

    if (!extractionResult.success || !extractionResult.items) {
      return NextResponse.json(
        { success: false, error: extractionResult.error || 'Failed to extract submittals' },
        { status: 500 }
      );
    }

    // Insert extracted items
    const itemsToInsert: NewSubmittalItem[] = extractionResult.items.map(item => ({
      checklistId: parseInt(checklistId),
      specSection: item.specSection,
      specSubsection: item.specSubsection || null,
      requirementType: item.requirementType || null,
      description: item.description,
      details: item.details || null,
      status: 'pending',
    }));

    if (itemsToInsert.length > 0) {
      await db.insert(submittalItems).values(itemsToInsert);
    }

    // Update checklist extractedAt timestamp
    await db.update(submittalChecklists)
      .set({ extractedAt: new Date() })
      .where(eq(submittalChecklists.id, parseInt(checklistId)));

    return NextResponse.json({
      success: true,
      data: {
        checklistId: checklist.id,
        itemsExtracted: itemsToInsert.length,
        pageCount: parseResult.pageCount,
      },
    });
  } catch (error) {
    console.error('Error extracting submittals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to extract submittals' },
      { status: 500 }
    );
  }
}
