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
      levelToHeadJoint1, levelToSillJoint1,
      levelToHeadJoint2, levelToSillJoint2,
      levelToHeadJoint3, levelToSillJoint3,
      levelToHeadJoint4, levelToSillJoint4,
      levelToHeadJoint5, levelToSillJoint5,
      levelToHeadJoint6, levelToSillJoint6,
      levelToHeadJoint7, levelToSillJoint7,
      levelToHeadJoint8, levelToSillJoint8,
      levelToHeadJoint9, levelToSillJoint9,
      levelToHeadJoint10, levelToSillJoint10,
      levelToHeadJoint11, levelToSillJoint11,
      levelToHeadJoint12, levelToSillJoint12,
      levelToHeadJoint13, levelToSillJoint13,
      levelToHeadJoint14, levelToSillJoint14,
      levelToHeadJoint15, levelToSillJoint15,
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
      (parseFloat(plumbToLeftHead) + parseFloat(plumbToRightHead)) -
      (parseFloat(plumbToLeftSill) + parseFloat(plumbToRightSill))
    );
    const squarenessVariance = Math.max(heightDiff, widthDiff);
    const isOutOfSquare = squarenessVariance > 0.0625;

    // Convert glass bites to proper decimal strings (ensure leading zero)
    const toDecimalString = (value: any, defaultValue: number = 0.375): string => {
      const num = typeof value === 'number' ? value : parseFloat(value);
      if (isNaN(num)) return defaultValue.toFixed(4);
      return num.toFixed(4);
    };

    // Insert measurement - use explicit type to satisfy drizzle-orm
    const measurementData: NewMeasurement = {
      jobName: jobName as string,
      frameNumber: frameNumber as string,
      numberOfLites: Number(numberOfLites) || 1,
      glassBiteTop: toDecimalString(glassBiteTop, 0.375),
      glassBiteBottom: toDecimalString(glassBiteBottom, 0.375),
      glassBiteLeft: toDecimalString(glassBiteLeft, 0.375),
      glassBiteRight: toDecimalString(glassBiteRight, 0.375),
      glassType: glassType as string,
      glassThickness: glassThickness as string,
      mullionWidth: toDecimalString(mullionWidth, 0.25),
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
      levelToHeadJoint1: (body as any).levelToHeadJoint1 as string || null,
      levelToSillJoint1: (body as any).levelToSillJoint1 as string || null,
      levelToHeadJoint2: (body as any).levelToHeadJoint2 as string || null,
      levelToSillJoint2: (body as any).levelToSillJoint2 as string || null,
      levelToHeadJoint3: (body as any).levelToHeadJoint3 as string || null,
      levelToSillJoint3: (body as any).levelToSillJoint3 as string || null,
      levelToHeadJoint4: (body as any).levelToHeadJoint4 as string || null,
      levelToSillJoint4: (body as any).levelToSillJoint4 as string || null,
      levelToHeadJoint5: (body as any).levelToHeadJoint5 as string || null,
      levelToSillJoint5: (body as any).levelToSillJoint5 as string || null,
      levelToHeadJoint6: (body as any).levelToHeadJoint6 as string || null,
      levelToSillJoint6: (body as any).levelToSillJoint6 as string || null,
      levelToHeadJoint7: (body as any).levelToHeadJoint7 as string || null,
      levelToSillJoint7: (body as any).levelToSillJoint7 as string || null,
      levelToHeadJoint8: (body as any).levelToHeadJoint8 as string || null,
      levelToSillJoint8: (body as any).levelToSillJoint8 as string || null,
      levelToHeadJoint9: (body as any).levelToHeadJoint9 as string || null,
      levelToSillJoint9: (body as any).levelToSillJoint9 as string || null,
      levelToHeadJoint10: (body as any).levelToHeadJoint10 as string || null,
      levelToSillJoint10: (body as any).levelToSillJoint10 as string || null,
      levelToHeadJoint11: (body as any).levelToHeadJoint11 as string || null,
      levelToSillJoint11: (body as any).levelToSillJoint11 as string || null,
      levelToHeadJoint12: (body as any).levelToHeadJoint12 as string || null,
      levelToSillJoint12: (body as any).levelToSillJoint12 as string || null,
      levelToHeadJoint13: (body as any).levelToHeadJoint13 as string || null,
      levelToSillJoint13: (body as any).levelToSillJoint13 as string || null,
      levelToHeadJoint14: (body as any).levelToHeadJoint14 as string || null,
      levelToSillJoint14: (body as any).levelToSillJoint14 as string || null,
      levelToHeadJoint15: (body as any).levelToHeadJoint15 as string || null,
      levelToSillJoint15: (body as any).levelToSillJoint15 as string || null,
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
    // Glass bite is ADDED to daylight opening (glass goes into the pocket)
    const glassBiteTotal = parseFloat(glassBiteLeft) + parseFloat(glassBiteRight);
    const glassBiteHeightTotal = parseFloat(glassBiteTop) + parseFloat(glassBiteBottom);
    const TOLERANCE = 0.0625;

    // Build boundary arrays: boundary 0 = left jamb, boundary N = right jamb
    const leftHeadBoundary = [parseFloat(levelToHeadLeft)];
    const leftSillBoundary = [parseFloat(levelToSillLeft)];
    const rightHeadBoundary = [parseFloat(levelToHeadRight)];
    const rightSillBoundary = [parseFloat(levelToSillRight)];

    for (let j = 1; j <= 15; j++) {
      const lh = (body as any)[`levelToHeadJoint${j}`];
      const ls = (body as any)[`levelToSillJoint${j}`];
      if (lh !== undefined && lh !== null && lh !== '') leftHeadBoundary.push(parseFloat(lh));
      if (ls !== undefined && ls !== null && ls !== '') leftSillBoundary.push(parseFloat(ls));
      if (lh !== undefined && lh !== null && lh !== '') rightHeadBoundary.unshift(parseFloat(lh));
      if (ls !== undefined && ls !== null && ls !== '') rightSillBoundary.unshift(parseFloat(ls));
    }

    const litesToInsert: NewGlassLite[] = [];
    for (let i = 0; i < numberOfLites; i++) {
      const lh = leftHeadBoundary[i];
      const ls = leftSillBoundary[i];
      const rh = rightHeadBoundary[i + 1];
      const rs = rightSillBoundary[i + 1];

      const leftAvg = (lh + ls) / 2;
      const rightAvg = (rh + rs) / 2;
      const liteHeight = ((leftAvg + rightAvg) / 2) + glassBiteHeightTotal;
      const liteWidth = totalFrameWidth + glassBiteTotal;

      const topDiff = Math.abs(lh - rh);
      const bottomDiff = Math.abs(ls - rs);
      const topSquare = topDiff <= TOLERANCE;
      const bottomSquare = bottomDiff <= TOLERANCE;

      let squareCornersNote = 'All corners square';
      let liteShape = 'rectangular';
      if (!topSquare && !bottomSquare) {
        squareCornersNote = 'Top and bottom corners square';
      } else if (!topSquare) {
        squareCornersNote = 'Top corners square';
        liteShape = 'trapezoid-vertical';
      } else if (!bottomSquare) {
        squareCornersNote = 'Bottom corners square';
        liteShape = 'trapezoid-vertical';
      }

      litesToInsert.push({
        measurementId: newMeasurement.id,
        liteNumber: i + 1,
        width: liteWidth.toString(),
        height: liteHeight.toString(),
        widthDecimal: liteWidth.toString(),
        heightDecimal: liteHeight.toString(),
        leftHead: lh.toString(),
        leftSill: ls.toString(),
        rightHead: rh.toString(),
        rightSill: rs.toString(),
        topSquare,
        bottomSquare,
        squareCornersNote,
        liteShape,
        glassType: glassType as string,
        glassThickness: glassThickness as string,
        liteNotes: frameNotes as string | null,
      });
    }

    await db.insert(glassLites).values(litesToInsert);

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
      levelToHeadJoint1, levelToSillJoint1,
      levelToHeadJoint2, levelToSillJoint2,
      levelToHeadJoint3, levelToSillJoint3,
      levelToHeadJoint4, levelToSillJoint4,
      levelToHeadJoint5, levelToSillJoint5,
      levelToHeadJoint6, levelToSillJoint6,
      levelToHeadJoint7, levelToSillJoint7,
      levelToHeadJoint8, levelToSillJoint8,
      levelToHeadJoint9, levelToSillJoint9,
      levelToHeadJoint10, levelToSillJoint10,
      levelToHeadJoint11, levelToSillJoint11,
      levelToHeadJoint12, levelToSillJoint12,
      levelToHeadJoint13, levelToSillJoint13,
      levelToHeadJoint14, levelToSillJoint14,
      levelToHeadJoint15, levelToSillJoint15,
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
      (parseFloat(plumbToLeftHead) + parseFloat(plumbToRightHead)) -
      (parseFloat(plumbToLeftSill) + parseFloat(plumbToRightSill))
    );
    const squarenessVariance = Math.max(heightDiff, widthDiff);
    const isOutOfSquare = squarenessVariance > 0.0625;

    // Convert glass bites to proper decimal strings (ensure leading zero)
    const toDecimalString = (value: any, defaultValue: number = 0.375): string => {
      const num = typeof value === 'number' ? value : parseFloat(value);
      if (isNaN(num)) return defaultValue.toFixed(4);
      return num.toFixed(4);
    };

    // Update measurement
    const measurementData = {
      jobName: jobName as string,
      frameNumber: frameNumber as string,
      numberOfLites: Number(numberOfLites) || 1,
      glassBiteTop: toDecimalString(glassBiteTop, 0.375),
      glassBiteBottom: toDecimalString(glassBiteBottom, 0.375),
      glassBiteLeft: toDecimalString(glassBiteLeft, 0.375),
      glassBiteRight: toDecimalString(glassBiteRight, 0.375),
      glassType: glassType as string,
      glassThickness: glassThickness as string,
      mullionWidth: toDecimalString(mullionWidth, 0.25),
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
      levelToHeadJoint1: (body as any).levelToHeadJoint1 as string || null,
      levelToSillJoint1: (body as any).levelToSillJoint1 as string || null,
      levelToHeadJoint2: (body as any).levelToHeadJoint2 as string || null,
      levelToSillJoint2: (body as any).levelToSillJoint2 as string || null,
      levelToHeadJoint3: (body as any).levelToHeadJoint3 as string || null,
      levelToSillJoint3: (body as any).levelToSillJoint3 as string || null,
      levelToHeadJoint4: (body as any).levelToHeadJoint4 as string || null,
      levelToSillJoint4: (body as any).levelToSillJoint4 as string || null,
      levelToHeadJoint5: (body as any).levelToHeadJoint5 as string || null,
      levelToSillJoint5: (body as any).levelToSillJoint5 as string || null,
      levelToHeadJoint6: (body as any).levelToHeadJoint6 as string || null,
      levelToSillJoint6: (body as any).levelToSillJoint6 as string || null,
      levelToHeadJoint7: (body as any).levelToHeadJoint7 as string || null,
      levelToSillJoint7: (body as any).levelToSillJoint7 as string || null,
      levelToHeadJoint8: (body as any).levelToHeadJoint8 as string || null,
      levelToSillJoint8: (body as any).levelToSillJoint8 as string || null,
      levelToHeadJoint9: (body as any).levelToHeadJoint9 as string || null,
      levelToSillJoint9: (body as any).levelToSillJoint9 as string || null,
      levelToHeadJoint10: (body as any).levelToHeadJoint10 as string || null,
      levelToSillJoint10: (body as any).levelToSillJoint10 as string || null,
      levelToHeadJoint11: (body as any).levelToHeadJoint11 as string || null,
      levelToSillJoint11: (body as any).levelToSillJoint11 as string || null,
      levelToHeadJoint12: (body as any).levelToHeadJoint12 as string || null,
      levelToSillJoint12: (body as any).levelToSillJoint12 as string || null,
      levelToHeadJoint13: (body as any).levelToHeadJoint13 as string || null,
      levelToSillJoint13: (body as any).levelToSillJoint13 as string || null,
      levelToHeadJoint14: (body as any).levelToHeadJoint14 as string || null,
      levelToSillJoint14: (body as any).levelToSillJoint14 as string || null,
      levelToHeadJoint15: (body as any).levelToHeadJoint15 as string || null,
      levelToSillJoint15: (body as any).levelToSillJoint15 as string || null,
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
    // Glass bite is ADDED to daylight opening (glass goes into the pocket)
    const glassBiteTotal = parseFloat(glassBiteLeft) + parseFloat(glassBiteRight);
    const glassBiteHeightTotal = parseFloat(glassBiteTop) + parseFloat(glassBiteBottom);
    const TOLERANCE = 0.0625;

    // Build boundary arrays: boundary 0 = left jamb, boundary N = right jamb
    const leftHeadBoundary = [parseFloat(levelToHeadLeft)];
    const leftSillBoundary = [parseFloat(levelToSillLeft)];
    const rightHeadBoundary = [parseFloat(levelToHeadRight)];
    const rightSillBoundary = [parseFloat(levelToSillRight)];

    for (let j = 1; j <= 15; j++) {
      const lh = (body as any)[`levelToHeadJoint${j}`];
      const ls = (body as any)[`levelToSillJoint${j}`];
      if (lh !== undefined && lh !== null && lh !== '') leftHeadBoundary.push(parseFloat(lh));
      if (ls !== undefined && ls !== null && ls !== '') leftSillBoundary.push(parseFloat(ls));
      if (lh !== undefined && lh !== null && lh !== '') rightHeadBoundary.unshift(parseFloat(lh));
      if (ls !== undefined && ls !== null && ls !== '') rightSillBoundary.unshift(parseFloat(ls));
    }

    const litesToInsert: NewGlassLite[] = [];
    for (let i = 0; i < numberOfLites; i++) {
      // Left boundary = boundary i, Right boundary = boundary i+1
      const lh = leftHeadBoundary[i];
      const ls = leftSillBoundary[i];
      const rh = rightHeadBoundary[i + 1];
      const rs = rightSillBoundary[i + 1];

      // Average height at each boundary side
      const leftAvg = (lh + ls) / 2;
      const rightAvg = (rh + rs) / 2;

      // Per-lite glass dimensions (add glass bite)
      const liteHeight = ((leftAvg + rightAvg) / 2) + glassBiteHeightTotal;
      const liteWidth = totalFrameWidth + glassBiteTotal;

      // Per-lite square check
      const topDiff = Math.abs(lh - rh);
      const bottomDiff = Math.abs(ls - rs);
      const topSquare = topDiff <= TOLERANCE;
      const bottomSquare = bottomDiff <= TOLERANCE;

      // Determine square corners note
      let squareCornersNote = 'All corners square';
      let liteShape = 'rectangular';
      if (!topSquare && !bottomSquare) {
        squareCornersNote = 'Top and bottom corners square';
      } else if (!topSquare) {
        squareCornersNote = 'Top corners square';
        liteShape = 'trapezoid-vertical';
      } else if (!bottomSquare) {
        squareCornersNote = 'Bottom corners square';
        liteShape = 'trapezoid-vertical';
      }

      litesToInsert.push({
        measurementId: parseInt(id),
        liteNumber: i + 1,
        width: liteWidth.toString(),
        height: liteHeight.toString(),
        widthDecimal: liteWidth.toString(),
        heightDecimal: liteHeight.toString(),
        leftHead: lh.toString(),
        leftSill: ls.toString(),
        rightHead: rh.toString(),
        rightSill: rs.toString(),
        topSquare,
        bottomSquare,
        squareCornersNote,
        liteShape,
        glassType: glassType as string,
        glassThickness: glassThickness as string,
        liteNotes: frameNotes as string | null,
      });
    }

    await db.insert(glassLites).values(litesToInsert);

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

// DELETE - Delete a measurement
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Measurement ID required' },
        { status: 400 }
      );
    }

    await db.delete(glassLites).where(eq(glassLites.measurementId, parseInt(id)));
    await db.delete(measurements).where(eq(measurements.id, parseInt(id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting measurement:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete measurement' },
      { status: 500 }
    );
  }
}
