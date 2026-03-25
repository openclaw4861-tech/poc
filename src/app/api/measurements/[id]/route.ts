import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { measurements } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const jobName = searchParams.get('jobName');
    const frameNumber = searchParams.get('frameNumber');
    const id = searchParams.get('id');

    let result;

    if (id) {
      // Get single measurement by ID
      result = await db.query.measurements.findFirst({
        where: (m, { eq }) => eq(m.id, parseInt(id)),
        with: {
          glassLites: true,
        },
      });
    } else if (jobName) {
      // Get all measurements for a job
      result = await db.query.measurements.findMany({
        where: (m, { eq }) => eq(m.jobName, jobName),
        orderBy: [desc(measurements.measuredAt)],
        with: {
          glassLites: true,
        },
      });
    } else if (frameNumber) {
      // Get measurements by frame number (across all jobs)
      result = await db.query.measurements.findMany({
        where: (m, { eq }) => eq(m.frameNumber, frameNumber),
        orderBy: [desc(measurements.measuredAt)],
        with: {
          glassLites: true,
        },
      });
    } else {
      // Get all measurements (limited to 100)
      result = await db.query.measurements.findMany({
        limit: 100,
        orderBy: [desc(measurements.measuredAt)],
        with: {
          glassLites: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching measurements:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch measurements' },
      { status: 500 }
    );
  }
}
