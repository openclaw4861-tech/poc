'use client';

import { useState, useEffect } from 'react';

interface GlassLite {
  liteNumber: number;
  width: string;
  height: string;
  widthDecimal: string;
  heightDecimal: string;
  glassType?: string;
  glassThickness?: string;
  liteNotes?: string;
  // Trapezoid glass dimensions
  liteShape?: string;       // 'rectangular' | 'trapezoid-vertical' | 'trapezoid-horizontal' | 'irregular'
  liteBottom?: string;      // bottom edge width
  liteLeft?: string;        // left edge height
  liteRight?: string;       // right edge height
  liteTop?: string;         // top edge width
  liteNotesDetail?: string | null;  // "Bottom corners square", etc.
  liteSlopedEdge?: string | null;  // which edge slopes: 'top' | 'bottom' | 'left' | 'right'
}

interface Measurement {
  id: number;
  jobName: string;
  frameNumber: string;
  numberOfLites: number;
  glassType: string;
  glassThickness: string;
  totalFrameWidth: string;
  totalFrameHeight: string;
  isOutOfSquare: boolean;
  squarenessVariance: string;
  measuredBy: string;
  measuredAt: string;
  frameNotes?: string;
  photoUrl?: string;
  glassBiteTop?: string;
  glassBiteBottom?: string;
  glassBiteLeft?: string;
  glassBiteRight?: string;
  mullionWidth?: string;
  levelToHeadLeft?: string;
  levelToHeadRight?: string;
  levelToSillLeft?: string;
  levelToSillRight?: string;
  plumbToLeftHead?: string;
  plumbToRightHead?: string;
  plumbToLeftSill?: string;
  plumbToRightSill?: string;
  glassLites: GlassLite[];
}

// Fractional input component
function FractionalInput({ 
  value, 
  onChange, 
  label, 
  placeholder = "e.g., 5 1/4 or 0.375",
  colorClass = "blue",
  step = "0.0625"
}: { 
  value: string | number; 
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  colorClass?: string;
  step?: string;
}) {
  const [displayValue, setDisplayValue] = useState(String(value || ''));

  useEffect(() => {
    // When value changes from parent (e.g., loading from DB), format it as fraction
    if (value !== undefined && value !== null && value !== '') {
      const num = typeof value === 'number' ? value : parseFloat(String(value));
      if (!isNaN(num)) {
        setDisplayValue(formatToFraction(num));
      } else {
        setDisplayValue(String(value));
      }
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const formatToFraction = (decimal: number): string => {
    const fractions = [
      { decimal: 0.03125, fraction: '1/32' },
      { decimal: 0.0625, fraction: '1/16' },
      { decimal: 0.09375, fraction: '3/32' },
      { decimal: 0.125, fraction: '1/8' },
      { decimal: 0.15625, fraction: '5/32' },
      { decimal: 0.1875, fraction: '3/16' },
      { decimal: 0.21875, fraction: '7/32' },
      { decimal: 0.25, fraction: '1/4' },
      { decimal: 0.28125, fraction: '9/32' },
      { decimal: 0.3125, fraction: '5/16' },
      { decimal: 0.34375, fraction: '11/32' },
      { decimal: 0.375, fraction: '3/8' },
      { decimal: 0.40625, fraction: '13/32' },
      { decimal: 0.4375, fraction: '7/16' },
      { decimal: 0.46875, fraction: '15/32' },
      { decimal: 0.5, fraction: '1/2' },
      { decimal: 0.53125, fraction: '17/32' },
      { decimal: 0.5625, fraction: '9/16' },
      { decimal: 0.59375, fraction: '19/32' },
      { decimal: 0.625, fraction: '5/8' },
      { decimal: 0.65625, fraction: '21/32' },
      { decimal: 0.6875, fraction: '11/16' },
      { decimal: 0.71875, fraction: '23/32' },
      { decimal: 0.75, fraction: '3/4' },
      { decimal: 0.78125, fraction: '25/32' },
      { decimal: 0.8125, fraction: '13/16' },
      { decimal: 0.84375, fraction: '27/32' },
      { decimal: 0.875, fraction: '7/8' },
      { decimal: 0.90625, fraction: '29/32' },
      { decimal: 0.9375, fraction: '15/16' },
      { decimal: 0.96875, fraction: '31/32' },
    ];

    const whole = Math.floor(decimal);
    const frac = decimal - whole;
    
    let closest = fractions[0];
    let minDiff = Math.abs(frac - closest.decimal);
    
    for (const f of fractions) {
      const diff = Math.abs(frac - f.decimal);
      if (diff < minDiff) {
        minDiff = diff;
        closest = f;
      }
    }

    if (whole === 0) {
      // Pure fraction (no whole number)
      return closest.fraction;
    } else if (frac < 0.005) {
      // Fractional part is nearly zero - return just whole number
      return `${whole}`;
    } else {
      // Whole number + fraction
      return `${whole} ${closest.fraction}`;
    }
  };

  const parseFraction = (input: string): number | null => {
    if (!input || input.trim() === '') return null;
    
    const trimmed = input.trim();
    
    // Handle pure decimals (e.g., "5.25", "0.375")
    if (/^\d+\.?\d*$/.test(trimmed)) {
      return parseFloat(trimmed);
    }

    // Handle fractions with space: "5 1/4" or hyphen: "5-1/4"
    const withSpaceOrHyphen = trimmed.match(/^(\d+)[\s\-]+(\d+)\/(\d+)$/);
    if (withSpaceOrHyphen) {
      const whole = parseInt(withSpaceOrHyphen[1]);
      const numerator = parseInt(withSpaceOrHyphen[2]);
      const denominator = parseInt(withSpaceOrHyphen[3]);
      return whole + (numerator / denominator);
    }
    
    // Handle pure fractions: "1/4", "3/8" (NO whole number)
    const pureFraction = trimmed.match(/^(\d+)\/(\d+)$/);
    if (pureFraction) {
      const numerator = parseInt(pureFraction[1]);
      const denominator = parseInt(pureFraction[2]);
      return numerator / denominator;
    }

    // Handle whole numbers
    if (/^\d+$/.test(trimmed)) {
      return parseInt(trimmed);
    }

    return null;
  };



  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setDisplayValue(input);
    // Don't parse yet - wait for blur
  };

  const handleBlur = () => {
    const parsed = parseFraction(displayValue);
    console.log('FractionalInput blur:', { displayValue, parsed });
    if (parsed !== null) {
      onChange(parsed.toString());
      const formatted = formatToFraction(parsed);
      console.log('  → formatted:', formatted);
      setDisplayValue(formatted);
    } else if (displayValue.trim() === '') {
      onChange('');
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-${colorClass}-500 font-mono text-sm`}
        placeholder={placeholder}
      />
      {parseFraction(displayValue) !== null && (
        <p className="text-xs text-gray-500 mt-1">
          = {parseFraction(displayValue)?.toFixed(3)}"
        </p>
      )}
    </div>
  );
}


export default function GlassCalculator() {
  // Form state
  const [jobName, setJobName] = useState('');
  const [frameNumber, setFrameNumber] = useState('');
  const [numberOfLites, setNumberOfLites] = useState(1);
  const [glassBiteTop, setGlassBiteTop] = useState(0.375);
  const [glassBiteBottom, setGlassBiteBottom] = useState(0.375);
  const [glassBiteLeft, setGlassBiteLeft] = useState(0.375);
  const [glassBiteRight, setGlassBiteRight] = useState(0.375);
  const [biteTolerance, setBiteTolerance] = useState(0.0625); // ±1/16" default
  const [glassType, setGlassType] = useState('Annealed');
  const [glassThickness, setGlassThickness] = useState('1/4"');
  const [mullionWidth, setMullionWidth] = useState(0.25);
  const [frameNotes, setFrameNotes] = useState('');
  const [measuredBy, setMeasuredBy] = useState('');
  
  // Level line measurements
  const [levelToHeadLeft, setLevelToHeadLeft] = useState('');
  const [levelToHeadRight, setLevelToHeadRight] = useState('');
  const [levelToSillLeft, setLevelToSillLeft] = useState('');
  const [levelToSillRight, setLevelToSillRight] = useState('');
  
  // Plumb line measurements
  const [plumbToLeftHead, setPlumbToLeftHead] = useState('');
  const [plumbToRightHead, setPlumbToRightHead] = useState('');
  const [plumbToLeftSill, setPlumbToLeftSill] = useState('');
  const [plumbToRightSill, setPlumbToRightSill] = useState('');
  
  // Photo upload
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  // Results
  const [result, setResult] = useState<Measurement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Saved measurements
  const [savedMeasurements, setSavedMeasurements] = useState<Measurement[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [jobs, setJobs] = useState<string[]>([]);

  // Edit mode
  const [editingId, setEditingId] = useState<number | null>(null);

  // Load jobs on mount
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/measurements');
      const data = await res.json();
      if (data.success) {
        const uniqueJobs: string[] = Array.from(new Set(data.data.map((m: Measurement) => m.jobName)));
        setJobs(uniqueJobs);
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    }
  };

  const fetchMeasurementsByJob = async (job: string) => {
    try {
      const res = await fetch(`/api/measurements?jobName=${encodeURIComponent(job)}`);
      const data = await res.json();
      if (data.success) {
        setSavedMeasurements(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch measurements:', err);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateGlassSizes = () => {
    setError(null);
    setResult(null);
    setSaved(false);

    // Validate text fields (not numbers)
    if (!jobName || jobName.trim() === '') {
      setError('Please enter Job Name');
      return;
    }
    if (!frameNumber || frameNumber.trim() === '') {
      setError('Please enter Frame Number');
      return;
    }
    if (!measuredBy || measuredBy.trim() === '') {
      setError('Please enter Measured By');
      return;
    }

    // Validate numeric fields (level/plumb measurements only)
    const numericFields = [
      { name: 'Level to Head (Left)', value: levelToHeadLeft },
      { name: 'Level to Head (Right)', value: levelToHeadRight },
      { name: 'Level to Sill (Left)', value: levelToSillLeft },
      { name: 'Level to Sill (Right)', value: levelToSillRight },
      { name: 'Plumb to Left (Head)', value: plumbToLeftHead },
      { name: 'Plumb to Right (Head)', value: plumbToRightHead },
      { name: 'Plumb to Left (Sill)', value: plumbToLeftSill },
      { name: 'Plumb to Right (Sill)', value: plumbToRightSill },
    ];

    for (const field of numericFields) {
      if (!field.value || field.value.trim() === '') {
        setError(`Please enter ${field.name}`);
        return;
      }
      if (isNaN(parseFloat(field.value))) {
        setError(`${field.name} must be a valid number`);
        return;
      }
    }

    // Parse all measurements
    const measurements = {
      levelToHeadLeft: parseFloat(levelToHeadLeft),
      levelToHeadRight: parseFloat(levelToHeadRight),
      levelToSillLeft: parseFloat(levelToSillLeft),
      levelToSillRight: parseFloat(levelToSillRight),
      plumbToLeftHead: parseFloat(plumbToLeftHead),
      plumbToRightHead: parseFloat(plumbToRightHead),
      plumbToLeftSill: parseFloat(plumbToLeftSill),
      plumbToRightSill: parseFloat(plumbToRightSill),
    };

    // Check for squareness and determine glass type
    const notes: string[] = [];
    const TOLERANCE = 0.0625; // 1/16"
    
    // Calculate frame dimensions
    const leftHeight = measurements.levelToHeadLeft + measurements.levelToSillLeft;
    const rightHeight = measurements.levelToHeadRight + measurements.levelToSillRight;
    const headWidth = measurements.plumbToLeftHead + measurements.plumbToRightHead;
    const sillWidth = measurements.plumbToLeftSill + measurements.plumbToRightSill;
    
    const heightDiff = Math.abs(leftHeight - rightHeight);
    const widthDiff = Math.abs(headWidth - sillWidth);
    const squarenessVariance = Math.max(heightDiff, widthDiff);
    
    let glassTypeNote = '';
    let isOutOfSquare = false;
    
    // Determine glass type
    if (heightDiff <= TOLERANCE && widthDiff <= TOLERANCE) {
      // Within tolerance - rectangular glass
      glassTypeNote = '✅ RECTANGULAR GLASS (within 1/16" tolerance)';
      isOutOfSquare = false;
    } else if (heightDiff <= TOLERANCE && widthDiff > TOLERANCE) {
      // Heights match, widths differ → Horizontal trapezoid
      glassTypeNote = '📐 TRAPEZOID GLASS (horizontal)';
      isOutOfSquare = true;
      notes.push(`${glassTypeNote}: Left/right heights match, head/sill widths differ by ${widthDiff.toFixed(3)}"`);
      notes.push(`   • Square corners: All 4 vertical corners`);
      notes.push(`   • Head width: ${headWidth.toFixed(3)}" | Sill width: ${sillWidth.toFixed(3)}"`);
    } else if (widthDiff <= TOLERANCE && heightDiff > TOLERANCE) {
      // Widths match, heights differ → Vertical trapezoid
      glassTypeNote = '📐 TRAPEZOID GLASS (vertical)';
      isOutOfSquare = true;
      notes.push(`${glassTypeNote}: Head/sill widths match, left/right heights differ by ${heightDiff.toFixed(3)}"`);
      notes.push(`   • Square corners: All 4 horizontal corners`);
      notes.push(`   • Left height: ${leftHeight.toFixed(3)}" | Right height: ${rightHeight.toFixed(3)}"`);
    } else {
      // Both differ - can't make clean trapezoid
      glassTypeNote = '⚠️ OUT OF SQUARE';
      isOutOfSquare = true;
      notes.push(`${glassTypeNote}: Frame cannot be made as clean trapezoid`);
      notes.push(`   • Height variance: ${heightDiff.toFixed(3)}" (L: ${leftHeight.toFixed(3)}" vs R: ${rightHeight.toFixed(3)}")`);
      notes.push(`   • Width variance: ${widthDiff.toFixed(3)}" (Head: ${headWidth.toFixed(3)}" vs Sill: ${sillWidth.toFixed(3)}")`);
      notes.push(`   • ⚠️ VERIFY DIMENSIONS BEFORE FABRICATION`);
    }
    
    if (!isOutOfSquare) {
      notes.push(glassTypeNote);
    }

    // Calculate total frame dimensions
    const totalFrameHeight = (
      measurements.levelToHeadLeft + measurements.levelToSillLeft +
      measurements.levelToHeadRight + measurements.levelToSillRight
    ) / 2;
    const totalFrameWidth = (
      measurements.plumbToLeftHead + measurements.plumbToRightHead +
      measurements.plumbToLeftSill + measurements.plumbToRightSill
    ) / 2;

    // Calculate glass dimensions with individual glass bites per side
    // Determine glass shape based on frame squareness
    // Determine sloped edge based on which dimension differs
    // shape: 'rectangular' | 'trapezoid-vertical' | 'trapezoid-horizontal'
    const shape = (heightDiff > TOLERANCE && widthDiff > TOLERANCE)
      ? 'irregular'  // can't make clean trapezoid
      : heightDiff > TOLERANCE
        ? 'trapezoid-vertical'   // left/right heights differ → top/bottom are sloped
        : widthDiff > TOLERANCE
          ? 'trapezoid-horizontal' // head/sill widths differ → sides are sloped
          : 'rectangular';

    const lites: GlassLite[] = [];
    const biteTop = Number(glassBiteTop);
    const biteBottom = Number(glassBiteBottom);
    const biteLeft = Number(glassBiteLeft);
    const biteRight = Number(glassBiteRight);
    const mullion = Number(mullionWidth);

    // Compute the 4 frame corner positions (outer frame)
    // Left: level-to-head-left + level-to-sill-left (left side total)
    // Right: level-to-head-right + level-to-sill-right (right side total)
    // Head: plumb-to-left-head + plumb-to-right-head (top width)
    // Sill: plumb-to-left-sill + plumb-to-right-sill (bottom width)
    const frameLeft = measurements.levelToHeadLeft + measurements.levelToSillLeft;
    const frameRight = measurements.levelToHeadRight + measurements.levelToSillRight;
    const frameHead = measurements.plumbToLeftHead + measurements.plumbToRightHead;
    const frameSill = measurements.plumbToLeftSill + measurements.plumbToRightSill;

    // Glass corner offsets from frame corners (using bites)
    // Each glass corner is offset inward from the frame corner
    // by the bite on that side
    const gBottom = biteBottom;     // sill-adjacent edge
    const gTop = biteTop;           // head-adjacent edge
    const gLeft = biteLeft;         // left-adjacent edge
    const gRight = biteRight;       // right-adjacent edge

    if (numberOfLites === 1) {
      // Single lite - ADD glass bite to each side (glass goes into the pocket)
      const liteWidth = totalFrameWidth + biteLeft + biteRight;
      const liteHeight = totalFrameHeight + biteTop + biteBottom;

      // For trapezoids, compute per-side glass dimensions
      // Vertical trap (heights differ): left/right heights are different
      const glassLeftHeight = frameLeft + biteTop + biteBottom;
      const glassRightHeight = frameRight + biteTop + biteBottom;
      // Horizontal trap (widths differ): top/bottom widths are different
      const glassTopWidth = frameHead + biteLeft + biteRight;
      const glassBottomWidth = frameSill + biteLeft + biteRight;

      // Determine which 2 corners are square based on where dimensions MATCH
      // Only 2 adjacent corners on the same horizontal edge can be square in a trapezoid
      // Square corners = the horizontal edge where level measurements MATCH
      // Sloped edge = the horizontal edge where level measurements DIFFER
      let squareCornersNote: string | null = null;
      let slopedEdge: string | null = null;
      
      if (shape === 'trapezoid-vertical') {
        // Heights differ, widths match — top or bottom edge slopes
        const levelHeadDiff = Math.abs(measurements.levelToHeadLeft - measurements.levelToHeadRight);
        const levelSillDiff = Math.abs(measurements.levelToSillLeft - measurements.levelToSillRight);
        
        if (levelHeadDiff <= TOLERANCE) {
          // Head measurements match → top corners are square
          squareCornersNote = 'Top corners square';
          slopedEdge = 'bottom';
        } else if (levelSillDiff <= TOLERANCE) {
          // Sill measurements match → bottom corners are square
          squareCornersNote = 'Bottom corners square';
          slopedEdge = 'top';
        } else {
          squareCornersNote = 'Irregular — verify dimensions';
          slopedEdge = 'both';
        }
      } else if (shape === 'trapezoid-horizontal') {
        // Widths differ, heights match — left or right edge slopes
        const plumbHeadDiff = Math.abs(measurements.plumbToLeftHead - measurements.plumbToRightHead);
        const plumbSillDiff = Math.abs(measurements.plumbToLeftSill - measurements.plumbToRightSill);
        
        if (plumbHeadDiff <= TOLERANCE) {
          // Right plumb measurements match → right corners are square
          squareCornersNote = 'Right corners square';
          slopedEdge = 'left';
        } else if (plumbSillDiff <= TOLERANCE) {
          // Left plumb measurements match → left corners are square
          squareCornersNote = 'Left corners square';
          slopedEdge = 'right';
        } else {
          squareCornersNote = 'Irregular — verify dimensions';
          slopedEdge = 'both';
        }
      }

      lites.push({
        liteNumber: 1,
        width: liteWidth.toString(),
        height: liteHeight.toString(),
        widthDecimal: liteWidth.toString(),
        heightDecimal: liteHeight.toString(),
        glassType,
        glassThickness,
        liteNotes: frameNotes,
        // Trapezoid dimensions
        liteShape: shape,
        liteBottom: glassBottomWidth.toString(),
        liteLeft: glassLeftHeight.toString(),
        liteRight: glassRightHeight.toString(),
        liteTop: glassTopWidth.toString(),
        liteNotesDetail: squareCornersNote,
        liteSlopedEdge: slopedEdge,
      });
    } else {
      // Multiple lites with mullions/joints between them
      const numberOfJoints = numberOfLites - 1;
      const totalMullionWidth = numberOfJoints * mullion;
      const availableWidth = totalFrameWidth + biteLeft + biteRight - totalMullionWidth;
      const liteWidth = availableWidth / numberOfLites;
      const liteHeight = totalFrameHeight + biteTop + biteBottom;

      for (let i = 0; i < numberOfLites; i++) {
        lites.push({
          liteNumber: i + 1,
          width: liteWidth.toString(),
          height: liteHeight.toString(),
          widthDecimal: liteWidth.toString(),
          heightDecimal: liteHeight.toString(),
          glassType,
          glassThickness,
          liteNotes: frameNotes,
          liteShape: 'rectangular',
          liteBottom: liteWidth.toString(),
          liteLeft: liteHeight.toString(),
          liteRight: liteHeight.toString(),
          liteTop: liteWidth.toString(),
          liteNotesDetail: null,
        });
      }
    }

    const resultData = {
      id: 0, // Will be set after save
      jobName,
      frameNumber,
      numberOfLites,
      glassType,
      glassThickness,
      totalFrameWidth: totalFrameWidth.toString(),
      totalFrameHeight: totalFrameHeight.toString(),
      isOutOfSquare,
      squarenessVariance: squarenessVariance.toString(),
      measuredBy,
      measuredAt: new Date().toISOString(),
      frameNotes,
      glassLites: lites,
      notes: notes.join('\n'),
    };

    // Debug: log what we're setting as the result
    console.log('Setting result:', {
      squarenessVariance: resultData.squarenessVariance,
      isOutOfSquare: resultData.isOutOfSquare,
      varianceParsed: parseFloat(resultData.squarenessVariance),
    });

    setResult(resultData);
  };

  const saveMeasurement = async () => {
    if (!result) return;
    
    setSaving(true);
    setError(null);

    try {
      const payload = {
        jobName: result.jobName,
        frameNumber: result.frameNumber,
        numberOfLites: result.numberOfLites,
        glassBiteTop: glassBiteTop,
        glassBiteBottom: glassBiteBottom,
        glassBiteLeft: glassBiteLeft,
        glassBiteRight: glassBiteRight,
        glassType: result.glassType,
        glassThickness: result.glassThickness,
        mullionWidth,
        frameNotes: result.frameNotes,
        photoUrl: photoPreview, // In production, this would be uploaded to cloud storage
        photoCaption: photoFile?.name,
        levelToHeadLeft,
        levelToHeadRight,
        levelToSillLeft,
        levelToSillRight,
        plumbToLeftHead,
        plumbToRightHead,
        plumbToLeftSill,
        plumbToRightSill,
        measuredBy: result.measuredBy,
        measuredAt: result.measuredAt,
        notes: (() => {
          const TOLERANCE = 0.0625;
          const leftH = parseFloat(result.levelToHeadLeft || '0') + parseFloat(result.levelToSillLeft || '0');
          const rightH = parseFloat(result.levelToHeadRight || '0') + parseFloat(result.levelToSillRight || '0');
          const headW = parseFloat(result.plumbToLeftHead || '0') + parseFloat(result.plumbToRightHead || '0');
          const sillW = parseFloat(result.plumbToLeftSill || '0') + parseFloat(result.plumbToRightSill || '0');
          const hDiff = Math.abs(leftH - rightH);
          const wDiff = Math.abs(headW - sillW);
          const m = Math.max(hDiff, wDiff);
          const calcNotes: string[] = [];
          if (hDiff <= TOLERANCE && wDiff <= TOLERANCE) {
            calcNotes.push('✅ RECTANGULAR GLASS (within 1/16" tolerance)');
          } else if (hDiff <= TOLERANCE && wDiff > TOLERANCE) {
            calcNotes.push('📐 TRAPEZOID GLASS (horizontal): Head/sill widths differ by ' + wDiff.toFixed(3) + '"');
            calcNotes.push('   • Square corners: All 4 vertical corners');
            calcNotes.push('   • Head: ' + headW.toFixed(3) + '" | Sill: ' + sillW.toFixed(3) + '"');
          } else if (wDiff <= TOLERANCE && hDiff > TOLERANCE) {
            calcNotes.push('📐 TRAPEZOID GLASS (vertical): Left/right heights differ by ' + hDiff.toFixed(3) + '"');
            calcNotes.push('   • Square corners: All 4 horizontal corners');
            calcNotes.push('   • Left: ' + leftH.toFixed(3) + '" | Right: ' + rightH.toFixed(3) + '"');
          } else {
            calcNotes.push('⚠️ OUT OF SQUARE: Frame cannot be made as clean trapezoid');
            calcNotes.push('   • Height variance: ' + hDiff.toFixed(3) + '" | Width variance: ' + wDiff.toFixed(3) + '"');
            calcNotes.push('   • ⚠️ VERIFY DIMENSIONS BEFORE FABRICATION');
          }
          return calcNotes.join('\n');
        })(),
      };

      const url = editingId ? `/api/measurements?id=${editingId}` : '/api/measurements';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      
      if (data.success) {
        setResult(data.data);
        setSaved(true);
        fetchJobs(); // Refresh job list
        fetchMeasurementsByJob(result.jobName); // Refresh saved frames
        
        // Auto-apply defaults for next entry
        if (!editingId) {
          applyDefaultsFromLast();
        }
        setEditingId(null);
      } else {
        setError(data.error || 'Failed to save measurement');
      }
    } catch (err) {
      setError('Failed to save measurement');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Auto-fill defaults from last saved measurement
  const applyDefaultsFromLast = () => {
    if (savedMeasurements.length === 0) return;
    
    const lastMeasurement = savedMeasurements[0]; // Most recent
    
    // Auto-fill job name, measured by, glass specs, bites, and notes
    setJobName(lastMeasurement.jobName);
    setMeasuredBy(lastMeasurement.measuredBy);
    setGlassType(lastMeasurement.glassType);
    setGlassThickness(lastMeasurement.glassThickness);
    setGlassBiteTop(parseFloat(lastMeasurement.glassBiteTop || '0.375'));
    setGlassBiteBottom(parseFloat(lastMeasurement.glassBiteBottom || '0.375'));
    setGlassBiteLeft(parseFloat(lastMeasurement.glassBiteLeft || '0.375'));
    setGlassBiteRight(parseFloat(lastMeasurement.glassBiteRight || '0.375'));
    setFrameNotes(lastMeasurement.frameNotes || '');
    
    // Auto-increment frame number if it has a number at the end
    const match = lastMeasurement.frameNumber.match(/^(.*?)(\d+)$/);
    if (match) {
      const prefix = match[1];
      const num = parseInt(match[2]);
      setFrameNumber(`${prefix}${num + 1}`);
    }
  };

  // Edit existing measurement
  const editMeasurement = (measurement: Measurement) => {
    setEditingId(measurement.id);
    
    // Load all values from the measurement
    setJobName(measurement.jobName);
    setFrameNumber(measurement.frameNumber);
    setNumberOfLites(measurement.numberOfLites);
    setGlassType(measurement.glassType);
    setGlassThickness(measurement.glassThickness);
    setMeasuredBy(measurement.measuredBy);
    setFrameNotes(measurement.frameNotes || '');
    
    // Load glass bites (parse from strings to numbers)
    // Handle cases where value might be stored without leading zero (e.g., ".1875" vs "0.1875")
    const parseBite = (value: string | undefined, defaultValue: number) => {
      if (!value) return defaultValue;
      const parsed = parseFloat(value);
      // If parsed value is > 1, it was likely stored without the decimal (e.g., "1875" instead of "0.1875")
      // This shouldn't happen, but handle it just in case
      return isNaN(parsed) ? defaultValue : parsed;
    };
    
    setGlassBiteTop(parseBite(measurement.glassBiteTop, 0.375));
    setGlassBiteBottom(parseBite(measurement.glassBiteBottom, 0.375));
    setGlassBiteLeft(parseBite(measurement.glassBiteLeft, 0.375));
    setGlassBiteRight(parseBite(measurement.glassBiteRight, 0.375));
    setMullionWidth(parseBite(measurement.mullionWidth, 0.25));
    
    // Load level/plumb measurements
    setLevelToHeadLeft(measurement.levelToHeadLeft || '');
    setLevelToHeadRight(measurement.levelToHeadRight || '');
    setLevelToSillLeft(measurement.levelToSillLeft || '');
    setLevelToSillRight(measurement.levelToSillRight || '');
    setPlumbToLeftHead(measurement.plumbToLeftHead || '');
    setPlumbToRightHead(measurement.plumbToRightHead || '');
    setPlumbToLeftSill(measurement.plumbToLeftSill || '');
    setPlumbToRightSill(measurement.plumbToRightSill || '');
    
    // Clear previous result
    setResult(null);
    setError(null);
    setSaved(false);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  // Delete measurement
  const deleteMeasurement = async (id: number) => {
    if (!confirm('Delete this measurement? This cannot be undone.')) {
      return;
    }
    
    try {
      const res = await fetch(`/api/measurements?id=${id}`, {
        method: 'DELETE',
      });
      
      const data = await res.json();
      
      if (data.success) {
        // Refresh the list
        if (selectedJob) {
          fetchMeasurementsByJob(selectedJob);
        }
        // Clear result if this was the displayed one
        if (result && result.id === id) {
          setResult(null);
        }
      } else {
        alert('Failed to delete measurement');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete measurement');
    }
  };


  // Clear form but keep defaults
  const clearForm = () => {
    // Keep: jobName, measuredBy, glassType, glassThickness, glassBites, frameNotes
    // Clear: frameNumber, level/plumb measurements, result
    setFrameNumber('');
    setLevelToHeadLeft('');
    setLevelToHeadRight('');
    setLevelToSillLeft('');
    setLevelToSillRight('');
    setPlumbToLeftHead('');
    setPlumbToRightHead('');
    setPlumbToLeftSill('');
    setPlumbToRightSill('');
    setResult(null);
    setError(null);
    setSaved(false);
    setEditingId(null);
  };

  const formatDimension = (inches: number) => {
    const fractions = [
      { decimal: 0.0625, fraction: '1/16' },
      { decimal: 0.125, fraction: '1/8' },
      { decimal: 0.1875, fraction: '3/16' },
      { decimal: 0.25, fraction: '1/4' },
      { decimal: 0.3125, fraction: '5/16' },
      { decimal: 0.375, fraction: '3/8' },
      { decimal: 0.4375, fraction: '7/16' },
      { decimal: 0.5, fraction: '1/2' },
      { decimal: 0.5625, fraction: '9/16' },
      { decimal: 0.625, fraction: '5/8' },
      { decimal: 0.6875, fraction: '11/16' },
      { decimal: 0.75, fraction: '3/4' },
      { decimal: 0.8125, fraction: '13/16' },
      { decimal: 0.875, fraction: '7/8' },
      { decimal: 0.9375, fraction: '15/16' },
    ];

    const whole = Math.floor(inches);
    const decimal = inches - whole;
    
    // If decimal is very close to 0, just return whole number
    if (decimal < 0.03) {
      return `${whole}"`;
    }
    
    // If decimal is very close to 1, round up
    if (decimal > 0.97) {
      return `${whole + 1}"`;
    }
    
    // Find closest fraction
    let closest = fractions[0];
    let minDiff = Math.abs(decimal - closest.decimal);
    
    for (const frac of fractions) {
      const diff = Math.abs(decimal - frac.decimal);
      if (diff < minDiff) {
        minDiff = diff;
        closest = frac;
      }
    }

    if (whole === 0) {
      return closest.fraction;
    } else {
      return `${whole} ${closest.fraction}"`;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2 text-gray-900">
        📐 Glass Size Calculator
      </h1>
      <p className="text-gray-600 mb-8">
        Field measurement tool for interior glazing with database storage
      </p>

      {/* View Saved Measurements */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">📂 View Saved Measurements</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Job
            </label>
            <select
              value={selectedJob}
              onChange={(e) => {
                setSelectedJob(e.target.value);
                if (e.target.value) {
                  fetchMeasurementsByJob(e.target.value);
                } else {
                  setSavedMeasurements([]);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
            >
              <option value="">-- Select a job --</option>
              {jobs.map((job) => (
                <option key={job} value={job}>{job}</option>
              ))}
            </select>
          </div>
        </div>

        {savedMeasurements.length > 0 && (
          <div className="mt-4 space-y-3">
            <h3 className="font-medium text-gray-700">Frames in {selectedJob}:</h3>
            {savedMeasurements.map((measurement) => (
              <div
                key={measurement.id}
                className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setResult(measurement)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      Frame {measurement.frameNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      {measurement.numberOfLites} lite{measurement.numberOfLites > 1 ? 's' : ''} | {measurement.glassType} | {measurement.glassThickness}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Measured by {measurement.measuredBy} on {new Date(measurement.measuredAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        editMeasurement(measurement);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit this frame"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMeasurement(measurement.id);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete this frame"
                    >
                      🗑️
                    </button>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {formatDimension(parseFloat(measurement.totalFrameWidth))}" × {formatDimension(parseFloat(measurement.totalFrameHeight))}"
                      </p>
                      {measurement.isOutOfSquare && (
                        <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mt-1">
                          ⚠️ Out of square
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Measurement Form */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">🆕 New Measurement</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Name *
            </label>
            <input
              type="text"
              value={jobName}
              onChange={(e) => setJobName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Acme Corp HQ"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frame Number *
            </label>
            <input
              type="text"
              value={frameNumber}
              onChange={(e) => setFrameNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., A-101"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Measured By *
            </label>
            <input
              type="text"
              value={measuredBy}
              onChange={(e) => setMeasuredBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., J. Smith"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Lites
            </label>
            <input
              type="number"
              min="1"
              value={numberOfLites}
              onChange={(e) => setNumberOfLites(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Glass Type
            </label>
            <select
              value={glassType}
              onChange={(e) => setGlassType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="Annealed">Annealed</option>
              <option value="Tempered">Tempered</option>
              <option value="Laminated">Laminated</option>
              <option value="Heat-Strengthened">Heat-Strengthened</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Glass Thickness
            </label>
            <select
              value={glassThickness}
              onChange={(e) => setGlassThickness(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="1/4&quot;">1/4"</option>
              <option value="3/8&quot;">3/8"</option>
              <option value="1/2&quot;">1/2"</option>
              <option value="1/4&quot; (6mm)">1/4" (6mm)</option>
              <option value="3/8&quot; (10mm)">3/8" (10mm)</option>
            </select>
          </div>

          <FractionalInput
            value={glassBiteTop.toString()}
            onChange={(val) => setGlassBiteTop(val === '' ? 0 : parseFloat(val))}
            label="Glass Bite - Top"
            placeholder="e.g., 3/8"
            colorClass="blue"
          />

          <FractionalInput
            value={glassBiteBottom.toString()}
            onChange={(val) => setGlassBiteBottom(val === '' ? 0 : parseFloat(val))}
            label="Glass Bite - Bottom"
            placeholder="e.g., 3/8"
            colorClass="blue"
          />

          <FractionalInput
            value={glassBiteLeft.toString()}
            onChange={(val) => setGlassBiteLeft(val === '' ? 0 : parseFloat(val))}
            label="Glass Bite - Left"
            placeholder="e.g., 3/8"
            colorClass="blue"
          />

          <FractionalInput
            value={glassBiteRight.toString()}
            onChange={(val) => setGlassBiteRight(val === '' ? 0 : parseFloat(val))}
            label="Glass Bite - Right"
            placeholder="e.g., 3/8"
            colorClass="blue"
          />

          <div className="border-t pt-4 mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ⚙️ Bite Tolerance (± inches)
            </label>
            <input
              type="number"
              step="0.0625"
              value={biteTolerance}
              onChange={(e) => setBiteTolerance(parseFloat(e.target.value) || 0.0625)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="0.0625"
            />
            <p className="text-xs text-gray-500 mt-1">
              Glass bite can vary ±{biteTolerance.toFixed(4)}" from target before taper is needed
            </p>
          </div>
        </div>

        {numberOfLites > 1 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mullion Width (inches)
            </label>
            <input
              type="number"
              step="0.0625"
              value={mullionWidth}
              onChange={(e) => setMullionWidth(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Frame Notes (edge work, polish, etc.)
          </label>
          <textarea
            value={frameNotes}
            onChange={(e) => setFrameNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            rows={2}
            placeholder="e.g., Flat polish all edges, seamed finish"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Photo (frame condition)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
          {photoPreview && (
            <img src={photoPreview} alt="Preview" className="mt-2 max-h-48 rounded-lg border" />
          )}
        </div>
      </div>

      {/* Measurement Input Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Field Measurements</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Level Line */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3 flex items-center">
              <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
              Level Line (Horizontal)
            </h3>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FractionalInput
                  value={levelToHeadLeft}
                  onChange={(val) => setLevelToHeadLeft(val)}
                  label="Level to Head (Left)"
                  placeholder="e.g., 36 1/2"
                  colorClass="blue"
                />
                <FractionalInput
                  value={levelToHeadRight}
                  onChange={(val) => setLevelToHeadRight(val)}
                  label="Level to Head (Right)"
                  placeholder="e.g., 36 1/2"
                  colorClass="blue"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FractionalInput
                  value={levelToSillLeft}
                  onChange={(val) => setLevelToSillLeft(val)}
                  label="Level to Sill (Left)"
                  placeholder="e.g., 36 1/2"
                  colorClass="blue"
                />
                <FractionalInput
                  value={levelToSillRight}
                  onChange={(val) => setLevelToSillRight(val)}
                  label="Level to Sill (Right)"
                  placeholder="e.g., 36 1/2"
                  colorClass="blue"
                />
              </div>
            </div>
          </div>

          {/* Plumb Line */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3 flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              Plumb Line (Vertical)
            </h3>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FractionalInput
                  value={plumbToLeftHead}
                  onChange={(val) => setPlumbToLeftHead(val)}
                  label="Plumb to Left (Head)"
                  placeholder="e.g., 36 1/2"
                  colorClass="green"
                />
                <FractionalInput
                  value={plumbToRightHead}
                  onChange={(val) => setPlumbToRightHead(val)}
                  label="Plumb to Right (Head)"
                  placeholder="e.g., 36 1/2"
                  colorClass="green"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FractionalInput
                  value={plumbToLeftSill}
                  onChange={(val) => setPlumbToLeftSill(val)}
                  label="Plumb to Left (Sill)"
                  placeholder="e.g., 36 1/2"
                  colorClass="green"
                />
                <FractionalInput
                  value={plumbToRightSill}
                  onChange={(val) => setPlumbToRightSill(val)}
                  label="Plumb to Right (Sill)"
                  placeholder="e.g., 36 1/2"
                  colorClass="green"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <button
          onClick={calculateGlassSizes}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          🔧 Calculate Glass Sizes
        </button>
        <button
          onClick={clearForm}
          className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          🔄 Clear Form
        </button>
        <button
          onClick={applyDefaultsFromLast}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          📋 Use Last Defaults
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700 font-medium">⚠️ {error}</p>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            ✅ Glass Cut List — {result.frameNumber}
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total Frame Width</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatDimension(parseFloat(result.totalFrameWidth))}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ({parseFloat(result.totalFrameWidth).toFixed(3)}")
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total Frame Height</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatDimension(parseFloat(result.totalFrameHeight))}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ({parseFloat(result.totalFrameHeight).toFixed(3)}")
              </p>
            </div>
          </div>

          {/* Glass Lites Table */}
          <div className="bg-white rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              Glass Sizes ({result.glassLites.length} lite{result.glassLites.length > 1 ? 's' : ''})
            </h3>
            
            <div className="space-y-3">
              {result.glassLites.map((lite: any) => (
                <div key={lite.liteNumber} className={`border rounded-lg p-4 ${lite.liteShape && lite.liteShape !== 'rectangular' ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-white'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-gray-900">Lite #{lite.liteNumber}</span>
                    <span className="text-sm text-gray-600">{lite.glassType} — {result.glassThickness}</span>
                  </div>
                  
                  {lite.liteShape && lite.liteShape !== 'rectangular' ? (
                    /* Trapezoid display: 3 dimensions + square corners note */
                    <div>
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        {/* Show the 3 non-sloped dimensions */}
                        {lite.liteShape === 'trapezoid-vertical' ? (
                          /* Vertical trap: heights differ → top or bottom is sloped */
                          lite.liteSlopedEdge === 'top' ? (
                            /* Top slopes → show: Bottom, Left, Right */
                            <>
                              <div className="text-center bg-white rounded p-2 border">
                                <div className="text-xs text-gray-500">Bottom</div>
                                <div className="font-mono font-bold text-lg">{formatDimension(parseFloat(lite.liteBottom || lite.width))}"</div>
                              </div>
                              <div className="text-center bg-white rounded p-2 border">
                                <div className="text-xs text-gray-500">Left</div>
                                <div className="font-mono font-bold text-lg">{formatDimension(parseFloat(lite.liteLeft || lite.height))}"</div>
                              </div>
                              <div className="text-center bg-white rounded p-2 border">
                                <div className="text-xs text-gray-500">Right</div>
                                <div className="font-mono font-bold text-lg">{formatDimension(parseFloat(lite.liteRight || lite.height))}"</div>
                              </div>
                            </>
                          ) : (
                            /* Bottom slopes → show: Top, Left, Right */
                            <>
                              <div className="text-center bg-white rounded p-2 border">
                                <div className="text-xs text-gray-500">Top</div>
                                <div className="font-mono font-bold text-lg">{formatDimension(parseFloat(lite.liteTop || lite.width))}"</div>
                              </div>
                              <div className="text-center bg-white rounded p-2 border">
                                <div className="text-xs text-gray-500">Left</div>
                                <div className="font-mono font-bold text-lg">{formatDimension(parseFloat(lite.liteLeft || lite.height))}"</div>
                              </div>
                              <div className="text-center bg-white rounded p-2 border">
                                <div className="text-xs text-gray-500">Right</div>
                                <div className="font-mono font-bold text-lg">{formatDimension(parseFloat(lite.liteRight || lite.height))}"</div>
                              </div>
                            </>
                          )
                        ) : (
                          /* Horizontal trap: widths differ → left or right is sloped */
                          lite.liteSlopedEdge === 'left' ? (
                            /* Left slopes → show: Bottom, Top, Right */
                            <>
                              <div className="text-center bg-white rounded p-2 border">
                                <div className="text-xs text-gray-500">Bottom</div>
                                <div className="font-mono font-bold text-lg">{formatDimension(parseFloat(lite.liteBottom || lite.width))}"</div>
                              </div>
                              <div className="text-center bg-white rounded p-2 border">
                                <div className="text-xs text-gray-500">Top</div>
                                <div className="font-mono font-bold text-lg">{formatDimension(parseFloat(lite.liteTop || lite.width))}"</div>
                              </div>
                              <div className="text-center bg-white rounded p-2 border">
                                <div className="text-xs text-gray-500">Right</div>
                                <div className="font-mono font-bold text-lg">{formatDimension(parseFloat(lite.height))}"</div>
                              </div>
                            </>
                          ) : (
                            /* Right slopes → show: Bottom, Top, Left */
                            <>
                              <div className="text-center bg-white rounded p-2 border">
                                <div className="text-xs text-gray-500">Bottom</div>
                                <div className="font-mono font-bold text-lg">{formatDimension(parseFloat(lite.liteBottom || lite.width))}"</div>
                              </div>
                              <div className="text-center bg-white rounded p-2 border">
                                <div className="text-xs text-gray-500">Top</div>
                                <div className="font-mono font-bold text-lg">{formatDimension(parseFloat(lite.liteTop || lite.width))}"</div>
                              </div>
                              <div className="text-center bg-white rounded p-2 border">
                                <div className="text-xs text-gray-500">Left</div>
                                <div className="font-mono font-bold text-lg">{formatDimension(parseFloat(lite.height))}"</div>
                              </div>
                            </>
                          )
                        )}
                      </div>
                      <div className="text-sm font-medium text-yellow-800 bg-yellow-100 rounded px-3 py-1.5">
                        📐 {lite.liteNotesDetail || 'Trapezoid glass'}
                        {lite.liteNotesDetail && lite.liteNotesDetail !== 'Irregular — verify dimensions' && (
                          <span className="block text-yellow-700 text-xs mt-0.5">
                            (sloped edge: {lite.liteSlopedEdge})
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Rectangular display: width × height */
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center bg-gray-50 rounded p-2 border">
                        <div className="text-xs text-gray-500">Width</div>
                        <div className="font-mono font-bold text-lg">{formatDimension(parseFloat(lite.width))}"</div>
                      </div>
                      <div className="text-center bg-gray-50 rounded p-2 border">
                        <div className="text-xs text-gray-500">Height</div>
                        <div className="font-mono font-bold text-lg">{formatDimension(parseFloat(lite.height))}"</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500 mt-2">
                    {lite.widthDecimal && lite.heightDecimal && (<>Decimal: {parseFloat(lite.widthDecimal).toFixed(3)}" × {parseFloat(lite.heightDecimal).toFixed(3)}"</>)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {result.isOutOfSquare && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-800 mb-2">📐 Out of Square</h4>
              <div className="text-sm text-gray-700 space-y-1">
                {(result as any).notes ? (result as any).notes.split('\n').filter((n: string) => n.trim()).map((note: string, i: number) => (
                  <p key={i}>{note}</p>
                )) : (
                  <p>Frame varies by {parseFloat(result.squarenessVariance).toFixed(3)}" — verify before fabrication</p>
                )}
              </div>
            </div>
          )}

          {result.frameNotes && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-800 mb-2">📝 Frame Notes:</h4>
              <p className="text-sm text-gray-700">{result.frameNotes}</p>
            </div>
          )}

          {/* Save/Update Button */}
          {!saved ? (
            <div className="space-y-3">
              <button
                onClick={saveMeasurement}
                disabled={saving}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
              >
                {editingId ? '✏️ Update Measurement' : '💾 Save to Database'}
              </button>
              {editingId && (
                <button
                  onClick={clearForm}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  ❌ Cancel Edit
                </button>
              )}
            </div>
          ) : (
            <div className="bg-green-100 border border-green-300 rounded-lg p-4 text-center">
              <p className="text-green-800 font-semibold">
                ✅ {editingId ? 'Updated' : 'Saved'} to database!
              </p>
              <p className="text-sm text-green-700 mt-1">
                Measurement ID: {result.id} | View in "Saved Measurements" above
              </p>
              <button
                onClick={clearForm}
                className="mt-3 text-green-700 hover:text-green-900 underline text-sm font-medium"
              >
                ➕ Enter Another Frame
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
