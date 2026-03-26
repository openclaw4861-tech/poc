import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { measurements, glassLites, type NewMeasurement, type NewGlassLite } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET - Fetch all measurements or filter by jobName
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobName = searchParams.get('jobName');

    let result;
    if (jobName) {
      // Fetch measurements for a specific job
      result = await db.query.measurements.findMany({
        where: (m, { eq }) => eq(m.jobName, jobName),
        with: {
          glassLites: true,
        },
        orderBy: (m, { desc }) => desc(m.measuredAt),
      });
    } else {
      // Fetch all measurements
      result = await db.query.measurements.findMany({
        with: {
          glassLites: true,
        },
        orderBy: (m, { desc }) => desc(m.measuredAt),
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

// POST - Create a new measurement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      jobName,
      frameNumber,
      numberOfLites,
      glassBiteTop,
      glassBiteBottom,
      glassBiteLeft,
      glassBiteRight,
      glassType,
      glassThickness,
      mullionWidth,
      frameNotes,
      photoUrl,
      photoCaption,
      levelToHeadLeft,
      levelToHeadRight,
      levelToSillLeft,
      levelToSillRight,
      plumbToLeftHead,
      plumbToRightHead,
      plumbToLeftSill,
      plumbToRightSill,
      measuredBy,
      measuredAt,
      notes,
    } = body;

    // Calculate frame dimensions
    const totalFrameHeight = (
      parseFloat(levelToHeadLeft) + parseFloat(levelToSillLeft) +
      parseFloat(levelToHeadRight) + parseFloat(levelToSillRight)
    ) / 2;

    const totalFrameWidth = (
      parseFloat(plumbToLeftHead) + parseFloat(plumbToRightHead) +
      parseFloat(plumbToLeftSill) + parseFloat(plumbToRightSill)
    ) / 2;

    // Check for out-of-square
    const heightDiff = Math.abs(
      (parseFloat(levelToHeadLeft) + parseFloat(levelToSillLeft)) -
      (parseFloat(levelToHeadRight) + parseFloat(levelToSillRight))
    );
    const widthDiff = Math.abs(
      (parseFloat(plumbToLeftHead) + parseFloat(plumbToLeftSill)) -
      (parseFloat(plumbToRightHead) + parseFloat(plumbToRightSill))
    );
    const squarenessVariance = Math.max(heightDiff, widthDiff);
    const isOutOfSquare = squarenessVariance > 0.25;

    // Insert measurement - use explicit type to satisfy drizzle-orm
    const measurementData: NewMeasurement = {
      jobName: jobName as string,
      frameNumber: frameNumber as string,
      numberOfLites: numberOfLites as number,
      glassBiteTop: glassBiteTop as string,
      glassBiteBottom: glassBiteBottom as string,
      glassBiteLeft: glassBiteLeft as string,
      glassBiteRight: glassBiteRight as string,
      glassType: glassType as string,
      glassThickness: glassThickness as string,
      mullionWidth: mullionWidth as string | null,
      frameNotes: frameNotes as string | null,
      photoUrl: photoUrl as string | null,
      photoCaption: photoCaption as string | null,
      levelToHeadLeft: levelToHeadLeft as string,
      levelToHeadRight: levelToHeadRight as string,
      levelToSillLeft: levelToSillLeft as string,
      levelToSillRight: levelToSillRight as string,
      plumbToLeftHead: plumbToLeftHead as string,
      plumbToRightHead: plumbToRightHead as string,
      plumbToLeftSill: plumbToLeftSill as string,
      plumbToRightSill: plumbToRightSill as string,
      totalFrameWidth: totalFrameWidth.toString(),
      totalFrameHeight: totalFrameHeight.toString(),
      isOutOfSquare: isOutOfSquare,
      squarenessVariance: squarenessVariance.toString(),
      measuredBy: measuredBy as string,
      measuredAt: new Date(measuredAt),
      notes: notes as string | null,
    };

    const [newMeasurement] = await db.insert(measurements).values(measurementData).returning();

    // Calculate glass sizes and insert lites
    const glassBiteTotal = parseFloat(glassBiteLeft) + parseFloat(glassBiteRight);
    let liteWidth: number;
    let liteHeight: number;

    if (numberOfLites === 1) {
      // Single lite
      liteWidth = totalFrameWidth - glassBiteTotal;
      liteHeight = totalFrameHeight - (parseFloat(glassBiteTop) + parseFloat(glassBiteBottom));
      
      await db.insert(glassLites).values({
        measurementId: newMeasurement.id,
        liteNumber: 1,
        width: liteWidth.toString(),
        height: liteHeight.toString(),
        widthDecimal: liteWidth.toString(),
        heightDecimal: liteHeight.toString(),
        glassType: glassType as string,
        glassThickness: glassThickness as string,
        liteNotes: frameNotes as string | null,
      });
    } else {
      // Multiple lites with mullions
      const totalMullionWidth = (numberOfLites - 1) * parseFloat(mullionWidth || '0.25');
      const availableWidth = totalFrameWidth - glassBiteTotal - totalMullionWidth;
      liteWidth = availableWidth / numberOfLites;
      liteHeight = totalFrameHeight - (parseFloat(glassBiteTop) + parseFloat(glassBiteBottom));

      const litesToInsert: NewGlassLite[] = [];
      for (let i = 0; i < numberOfLites; i++) {
        litesToInsert.push({
          measurementId: newMeasurement.id,
          liteNumber: i + 1,
          width: liteWidth.toString(),
          height: liteHeight.toString(),
          widthDecimal: liteWidth.toString(),
          heightDecimal: liteHeight.toString(),
          glassType: glassType as string,
          glassThickness: glassThickness as string,
          liteNotes: frameNotes as string | null,
        });
      }

      await db.insert(glassLites).values(litesToInsert);
    }

    // Fetch the complete measurement with lites
    const completeMeasurement = await db.query.measurements.findFirst({
      where: (m, { eq }) => eq(m.id, newMeasurement.id),
      with: {
        glassLites: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: completeMeasurement,
    });
  } catch (error) {
    console.error('Error saving measurement:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save measurement' },
      { status: 500 }
    );
  }
}

// PUT - Update an existing measurement
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Measurement ID required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    const {
      jobName,
      frameNumber,
      numberOfLites,
      glassBiteTop,
      glassBiteBottom,
      glassBiteLeft,
      glassBiteRight,
      glassType,
      glassThickness,
      mullionWidth,
      frameNotes,
      photoUrl,
      photoCaption,
      levelToHeadLeft,
      levelToHeadRight,
      levelToSillLeft,
      levelToSillRight,
      plumbToLeftHead,
      plumbToRightHead,
      plumbToLeftSill,
      plumbToRightSill,
      measuredBy,
      measuredAt,
      notes,
    } = body;

    // Calculate frame dimensions
    const totalFrameHeight = (
      parseFloat(levelToHeadLeft) + parseFloat(levelToSillLeft) +
      parseFloat(levelToHeadRight) + parseFloat(levelToSillRight)
    ) / 2;

    const totalFrameWidth = (
      parseFloat(plumbToLeftHead) + parseFloat(plumbToRightHead) +
      parseFloat(plumbToLeftSill) + parseFloat(plumbToRightSill)
    ) / 2;

    // Check for out-of-square
    const heightDiff = Math.abs(
      (parseFloat(levelToHeadLeft) + parseFloat(levelToSillLeft)) -
      (parseFloat(levelToHeadRight) + parseFloat(levelToSillRight))
    );
    const widthDiff = Math.abs(
      (parseFloat(plumbToLeftHead) + parseFloat(plumbToLeftSill)) -
      (parseFloat(plumbToRightHead) + parseFloat(plumbToRightSill))
    );
    const squarenessVariance = Math.max(heightDiff, widthDiff);
    const isOutOfSquare = squarenessVariance > 0.25;

    // Update measurement
    const measurementData = {
      jobName: jobName as string,
      frameNumber: frameNumber as string,
      numberOfLites: numberOfLites as number,
      glassBiteTop: glassBiteTop as string,
      glassBiteBottom: glassBiteBottom as string,
      glassBiteLeft: glassBiteLeft as string,
      glassBiteRight: glassBiteRight as string,
      glassType: glassType as string,
      glassThickness: glassThickness as string,
      mullionWidth: mullionWidth as string | null,
      frameNotes: frameNotes as string | null,
      photoUrl: photoUrl as string | null,
      photoCaption: photoCaption as string | null,
      levelToHeadLeft: levelToHeadLeft as string,
      levelToHeadRight: levelToHeadRight as string,
      levelToSillLeft: levelToSillLeft as string,
      levelToSillRight: levelToSillRight as string,
      plumbToLeftHead: plumbToLeftHead as string,
      plumbToRightHead: plumbToRightHead as string,
      plumbToLeftSill: plumbToLeftSill as string,
      plumbToRightSill: plumbToRightSill as string,
      totalFrameWidth: totalFrameWidth.toString(),
      totalFrameHeight: totalFrameHeight.toString(),
      isOutOfSquare: isOutOfSquare,
      squarenessVariance: squarenessVariance.toString(),
      measuredBy: measuredBy as string,
      measuredAt: new Date(measuredAt),
      notes: notes as string | null,
      updatedAt: new Date(),
    };

    await db.update(measurements).set(measurementData).where(eq(measurements.id, parseInt(id)));

    // Delete existing lites and re-insert
    await db.delete(glassLites).where(eq(glassLites.measurementId, parseInt(id)));

    // Calculate and insert new lites
    const glassBiteTotal = parseFloat(glassBiteLeft) + parseFloat(glassBiteRight);
    let liteWidth: number;
    let liteHeight: number;

    if (numberOfLites === 1) {
      liteWidth = totalFrameWidth + glassBiteTotal;
      liteHeight = totalFrameHeight + (parseFloat(glassBiteTop) + parseFloat(glassBiteBottom));
      
      await db.insert(glassLites).values({
        measurementId: parseInt(id),
        liteNumber: 1,
        width: liteWidth.toString(),
        height: liteHeight.toString(),
        widthDecimal: liteWidth.toString(),
        heightDecimal: liteHeight.toString(),
        glassType: glassType as string,
        glassThickness: glassThickness as string,
        liteNotes: frameNotes as string | null,
      });
    } else {
      const totalMullionWidth = (numberOfLites - 1) * parseFloat(mullionWidth || '0.25');
      const availableWidth = totalFrameWidth + glassBiteTotal - totalMullionWidth;
      liteWidth = availableWidth / numberOfLites;
      liteHeight = totalFrameHeight + (parseFloat(glassBiteTop) + parseFloat(glassBiteBottom));

      const litesToInsert: NewGlassLite[] = [];
      for (let i = 0; i < numberOfLites; i++) {
        litesToInsert.push({
          measurementId: parseInt(id),
          liteNumber: i + 1,
          width: liteWidth.toString(),
          height: liteHeight.toString(),
          widthDecimal: liteWidth.toString(),
          heightDecimal: liteHeight.toString(),
          glassType: glassType as string,
          glassThickness: glassThickness as string,
          liteNotes: frameNotes as string | null,
        });
      }

      await db.insert(glassLites).values(litesToInsert);
    }

    // Fetch the complete measurement with lites
    const completeMeasurement = await db.query.measurements.findFirst({
      where: (m, { eq }) => eq(m.id, parseInt(id)),
      with: {
        glassLites: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: completeMeasurement,
    });
  } catch (error) {
    console.error('Error updating measurement:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update measurement' },
      { status: 500 }
    );
  }
}
