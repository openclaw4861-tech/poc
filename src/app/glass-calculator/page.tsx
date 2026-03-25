'use client';

import { useState, useEffect } from 'react';

interface GlassLite {
  liteNumber: number;
  width: number;
  height: number;
  widthDecimal: number;
  heightDecimal: number;
  glassType?: string;
  glassThickness?: string;
  liteNotes?: string;
}

interface Measurement {
  id: number;
  jobName: string;
  frameNumber: string;
  numberOfLites: number;
  glassType: string;
  glassThickness: string;
  totalFrameWidth: number;
  totalFrameHeight: number;
  isOutOfSquare: boolean;
  squarenessVariance: number;
  measuredBy: string;
  measuredAt: string;
  frameNotes?: string;
  photoUrl?: string;
  glassLites: GlassLite[];
}

export default function GlassCalculator() {
  // Form state
  const [jobName, setJobName] = useState('');
  const [frameNumber, setFrameNumber] = useState('');
  const [numberOfLites, setNumberOfLites] = useState(1);
  const [glassBite, setGlassBite] = useState(0.375);
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

  // Load jobs on mount
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/measurements');
      const data = await res.json();
      if (data.success) {
        const uniqueJobs = Array.from(new Set(data.data.map((m: Measurement) => m.jobName)));
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

    // Validate inputs
    const requiredFields = [
      { name: 'Job Name', value: jobName },
      { name: 'Frame Number', value: frameNumber },
      { name: 'Measured By', value: measuredBy },
      { name: 'Level to Head (Left)', value: levelToHeadLeft },
      { name: 'Level to Head (Right)', value: levelToHeadRight },
      { name: 'Level to Sill (Left)', value: levelToSillLeft },
      { name: 'Level to Sill (Right)', value: levelToSillRight },
      { name: 'Plumb to Left (Head)', value: plumbToLeftHead },
      { name: 'Plumb to Right (Head)', value: plumbToRightHead },
      { name: 'Plumb to Left (Sill)', value: plumbToLeftSill },
      { name: 'Plumb to Right (Sill)', value: plumbToRightSill },
    ];

    for (const field of requiredFields) {
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

    // Check for squareness
    const notes: string[] = [];
    const heightDiff = Math.abs(
      (measurements.levelToHeadLeft + measurements.levelToSillLeft) -
      (measurements.levelToHeadRight + measurements.levelToSillRight)
    );
    const widthDiff = Math.abs(
      (measurements.plumbToLeftHead + measurements.plumbToLeftSill) -
      (measurements.plumbToRightHead + measurements.plumbToRightSill)
    );
    const squarenessVariance = Math.max(heightDiff, widthDiff);
    const isOutOfSquare = squarenessVariance > 0.25;

    if (isOutOfSquare) {
      notes.push(`⚠️ Frame is out-of-square by ${squarenessVariance.toFixed(3)}" - verify before fabrication`);
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

    // Calculate glass dimensions
    const lites: GlassLite[] = [];
    const glassBiteTotal = glassBite * 2;
    
    if (numberOfLites === 1) {
      const liteWidth = totalFrameWidth - glassBiteTotal;
      const liteHeight = totalFrameHeight - glassBiteTotal;
      
      lites.push({
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
      const totalMullionWidth = (numberOfLites - 1) * mullionWidth;
      const availableWidth = totalFrameWidth - glassBiteTotal - totalMullionWidth;
      const liteWidth = availableWidth / numberOfLites;
      const liteHeight = totalFrameHeight - glassBiteTotal;

      for (let i = 0; i < numberOfLites; i++) {
        lites.push({
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
    }

    setResult({
      id: 0, // Will be set after save
      jobName,
      frameNumber,
      numberOfLites,
      glassType,
      glassThickness,
      totalFrameWidth,
      totalFrameHeight,
      isOutOfSquare,
      squarenessVariance,
      measuredBy,
      measuredAt: new Date().toISOString(),
      frameNotes,
      glassLites: lites,
    });
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
        glassBiteTop: glassBite,
        glassBiteBottom: glassBite,
        glassBiteLeft: glassBite,
        glassBiteRight: glassBite,
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

      const res = await fetch('/api/measurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      
      if (data.success) {
        setResult(data.data);
        setSaved(true);
        fetchJobs(); // Refresh job list
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
    } else if (minDiff < 0.01) {
      return `${whole}"`;
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
                  <div>
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
            <select
              value={numberOfLites}
              onChange={(e) => setNumberOfLites(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>1 Lite</option>
              <option value={2}>2 Lites</option>
              <option value={3}>3 Lites</option>
            </select>
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
              Glass Bite (inches)
            </label>
            <input
              type="number"
              step="0.0625"
              value={glassBite}
              onChange={(e) => setGlassBite(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
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

      {/* Calculate Button */}
      <button
        onClick={calculateGlassSizes}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors mb-6"
      >
        🔧 Calculate Glass Sizes
      </button>

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
                      <td className="py-3 px-3 text-gray-900 font-mono">{formatDimension(lite.width)}</td>
                      <td className="py-3 px-3 text-gray-900 font-mono">{formatDimension(lite.height)}</td>
                      <td className="py-3 px-3 text-gray-600 text-sm">{lite.glassType}</td>
                      <td className="py-3 px-3 text-gray-600 text-sm">
                        {lite.widthDecimal.toFixed(3)}" × {lite.heightDecimal.toFixed(3)}"
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
                Frame varies by {result.squarenessVariance.toFixed(3)}" — verify before fabrication
              </p>
            </div>
          )}

          {result.frameNotes && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-800 mb-2">📝 Frame Notes:</h4>
              <p className="text-sm text-gray-700">{result.frameNotes}</p>
            </div>
          )}

          {/* Save Button */}
          {!saved ? (
            <button
              onClick={saveMeasurement}
              disabled={saving}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? '💾 Saving...' : '💾 Save to Database'}
            </button>
          ) : (
            <div className="bg-green-100 border border-green-300 rounded-lg p-4 text-center">
              <p className="text-green-800 font-semibold">✅ Saved to database!</p>
              <p className="text-sm text-green-700 mt-1">
                Measurement ID: {result.id} | View in "Saved Measurements" above
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
