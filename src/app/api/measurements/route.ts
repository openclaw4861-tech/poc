import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { measurements, glassLites } from '@/db/schema';

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

    // Insert measurement
    const [newMeasurement] = await db.insert(measurements).values({
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
      totalFrameWidth,
      totalFrameHeight,
      isOutOfSquare,
      squarenessVariance,
      measuredBy,
      measuredAt: new Date(measuredAt),
      notes,
    }).returning();

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
        width: liteWidth,
        height: liteHeight,
        widthDecimal: liteWidth,
        heightDecimal: liteHeight,
        glassType,
        glassThickness,
        liteNotes: frameNotes,
      });
    } else {
      // Multiple lites with mullions
      const totalMullionWidth = (numberOfLites - 1) * parseFloat(mullionWidth || '0.25');
      const availableWidth = totalFrameWidth - glassBiteTotal - totalMullionWidth;
      liteWidth = availableWidth / numberOfLites;
      liteHeight = totalFrameHeight - (parseFloat(glassBiteTop) + parseFloat(glassBiteBottom));

      const litesToInsert = [];
      for (let i = 0; i < numberOfLites; i++) {
        litesToInsert.push({
          measurementId: newMeasurement.id,
          liteNumber: i + 1,
          width: liteWidth,
          height: liteHeight,
          widthDecimal: liteWidth,
          heightDecimal: liteHeight,
          glassType,
          glassThickness,
          liteNotes: frameNotes,
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
