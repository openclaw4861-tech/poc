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
  // For tapered glass
  widthTop?: string;
  widthBottom?: string;
  heightLeft?: string;
  heightRight?: string;
  isTapered?: boolean;
  squareCorners?: string; // "Top corners square", "Bottom corners square", etc.
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
    setDisplayValue(String(value || ''));
  }, [value]);

  const parseFraction = (input: string): number | null => {
    if (!input || input.trim() === '') return null;
    
    // Handle pure decimals
    if (/^\d+\.?\d*$/.test(input.trim())) {
      return parseFloat(input);
    }

    // Handle fractions: "5 1/4", "1/4", "5-1/4"
    const match = input.trim().match(/^(\d+)?[\s\-]?(\d+)\/(\d+)$/);
    if (match) {
      const whole = parseInt(match[1] || '0');
      const numerator = parseInt(match[2]);
      const denominator = parseInt(match[3]);
      return whole + (numerator / denominator);
    }

    // Handle whole numbers
    if (/^\d+$/.test(input.trim())) {
      return parseInt(input);
    }

    return null;
  };

  const formatToFraction = (decimal: number): string => {
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

    if (whole === 0 && minDiff < 0.01) {
      return closest.fraction;
    } else if (minDiff < 0.01) {
      return `${whole}`;
    } else {
      return `${whole} ${closest.fraction}`;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setDisplayValue(input);
    
    const parsed = parseFraction(input);
    if (parsed !== null) {
      onChange(parsed.toString());
    } else if (input.trim() === '') {
      onChange('');
    }
  };

  const handleBlur = () => {
    const parsed = parseFraction(displayValue);
    if (parsed !== null) {
      const formatted = formatToFraction(parsed);
      setDisplayValue(formatted);
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
    // Ensure glass bites are numbers (not strings) to avoid concatenation
    const lites: GlassLite[] = [];
    const biteTop = Number(glassBiteTop);
    const biteBottom = Number(glassBiteBottom);
    const biteLeft = Number(glassBiteLeft);
    const biteRight = Number(glassBiteRight);
    const mullion = Number(mullionWidth);
    
    if (numberOfLites === 1) {
      // Single lite - ADD glass bite to each side (glass goes into the pocket)
      const liteWidth = totalFrameWidth + biteLeft + biteRight;
      const liteHeight = totalFrameHeight + biteTop + biteBottom;
      
      lites.push({
        liteNumber: 1,
        width: liteWidth.toString(),
        height: liteHeight.toString(),
        widthDecimal: liteWidth.toString(),
        heightDecimal: liteHeight.toString(),
        glassType,
        glassThickness,
        liteNotes: frameNotes,
      });
    } else {
      // Multiple lites with mullions/joints between them
      const numberOfJoints = numberOfLites - 1;
      const totalMullionWidth = numberOfJoints * mullion;
      // Available width = frame width + left bite + right bite - all mullions
      const availableWidth = totalFrameWidth + biteLeft + biteRight - totalMullionWidth;
      const liteWidth = availableWidth / numberOfLites;
      // Height uses top and bottom bites (added)
      const liteHeight = totalFrameHeight + biteTop + biteBottom;

      // Debug logging for multi-lite calculation
      console.log('Multi-lite calculation:', {
        totalFrameWidth,
        biteLeft,
        biteRight,
        mullion,
        numberOfLites,
        numberOfJoints,
        totalMullionWidth,
        availableWidth,
        liteWidth,
      });

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
        notes: frameNotes,
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
                      onClick={() => editMeasurement(measurement)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit this frame"
                    >
                      ✏️
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Glass Bite - Top (inches)
            </label>
            <input
              type="number"
              step="0.0001"
              value={glassBiteTop}
              onChange={(e) => {
                const val = e.target.value;
                setGlassBiteTop(val === '' ? 0 : parseFloat(val));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="0.375"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Glass Bite - Bottom (inches)
            </label>
            <input
              type="number"
              step="0.0001"
              value={glassBiteBottom}
              onChange={(e) => {
                const val = e.target.value;
                setGlassBiteBottom(val === '' ? 0 : parseFloat(val));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="0.375"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Glass Bite - Left (inches)
            </label>
            <input
              type="number"
              step="0.0001"
              value={glassBiteLeft}
              onChange={(e) => {
                const val = e.target.value;
                setGlassBiteLeft(val === '' ? 0 : parseFloat(val));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="0.375"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Glass Bite - Right (inches)
            </label>
            <input
              type="number"
              step="0.0001"
              value={glassBiteRight}
              onChange={(e) => {
                const val = e.target.value;
                setGlassBiteRight(val === '' ? 0 : parseFloat(val));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="0.375"
            />
          </div>

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
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Level to Head (Left)</label>
                  <input
                    type="number"
                    step="0.0625"
                    value={levelToHeadLeft}
                    onChange={(e) => setLevelToHeadLeft(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="inches"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Level to Head (Right)</label>
                  <input
                    type="number"
                    step="0.0625"
                    value={levelToHeadRight}
                    onChange={(e) => setLevelToHeadRight(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="inches"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Level to Sill (Left)</label>
                  <input
                    type="number"
                    step="0.0625"
                    value={levelToSillLeft}
                    onChange={(e) => setLevelToSillLeft(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="inches"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Level to Sill (Right)</label>
                  <input
                    type="number"
                    step="0.0625"
                    value={levelToSillRight}
                    onChange={(e) => setLevelToSillRight(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="inches"
                  />
                </div>
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
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Plumb to Left (Head)</label>
                  <input
                    type="number"
                    step="0.0625"
                    value={plumbToLeftHead}
                    onChange={(e) => setPlumbToLeftHead(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                    placeholder="inches"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Plumb to Right (Head)</label>
                  <input
                    type="number"
                    step="0.0625"
                    value={plumbToRightHead}
                    onChange={(e) => setPlumbToRightHead(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                    placeholder="inches"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Plumb to Left (Sill)</label>
                  <input
                    type="number"
                    step="0.0625"
                    value={plumbToLeftSill}
                    onChange={(e) => setPlumbToLeftSill(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                    placeholder="inches"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Plumb to Right (Sill)</label>
                  <input
                    type="number"
                    step="0.0625"
                    value={plumbToRightSill}
                    onChange={(e) => setPlumbToRightSill(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                    placeholder="inches"
                  />
                </div>
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
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Lite #</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Width</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Height</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Glass Type</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Dimensions (Decimal)</th>
                  </tr>
                </thead>
                <tbody>
                  {result.glassLites.map((lite) => (
                    <tr key={lite.liteNumber} className="border-b border-gray-100">
                      <td className="py-3 px-3 text-gray-900 font-medium">{lite.liteNumber}</td>
                      <td className="py-3 px-3 text-gray-900 font-mono">{formatDimension(parseFloat(lite.width))}</td>
                      <td className="py-3 px-3 text-gray-900 font-mono">{formatDimension(parseFloat(lite.height))}</td>
                      <td className="py-3 px-3 text-gray-600 text-sm">{lite.glassType}</td>
                      <td className="py-3 px-3 text-gray-600 text-sm">
                        {parseFloat(lite.widthDecimal).toFixed(3)}" × {parseFloat(lite.heightDecimal).toFixed(3)}"
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          {result.isOutOfSquare && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-800 mb-2">⚠️ Out of Square:</h4>
              <p className="text-sm text-gray-700">
                Frame varies by {parseFloat(result.squarenessVariance).toFixed(3)}" — verify before fabrication
              </p>
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
