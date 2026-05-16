import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { submittalChecklists, type NewSubmittalChecklist } from '@/db/schema';
import * as fs from 'fs/promises';
import * as path from 'path';

// Force this route to be server-side dynamic
export const dynamic = 'force-dynamic';

/**
 * POST /api/projects/:projectId/submittals/upload
 * Upload a PDF spec file and create a checklist record
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    
    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { success: false, error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    // Create upload directory for this project
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'submittals', projectId);
    await fs.mkdir(uploadDir, { recursive: true });

    // Sanitize filename and create unique name
    const timestamp = Date.now();
    const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${safeFilename}`;
    const filePath = path.join(uploadDir, filename);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.writeFile(filePath, buffer);

    // Create checklist record
    const checklistData: NewSubmittalChecklist = {
      projectId,
      pdfFilePath: `/uploads/submittals/${projectId}/${filename}`,
      pdfUploadedAt: new Date(),
    };

    const [newChecklist] = await db.insert(submittalChecklists).values(checklistData).returning();

    return NextResponse.json({
      success: true,
      data: {
        id: newChecklist.id,
        filename: file.name,
        storedFilename: filename,
        filePath: newChecklist.pdfFilePath,
        uploadedAt: newChecklist.pdfUploadedAt,
      },
    });
  } catch (error) {
    console.error('Error uploading PDF:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload PDF' },
      { status: 500 }
    );
  }
}
