'use client';

import { useState } from 'react';

interface GlassLite {
  liteNumber: number;
  width: number;
  height: number;
}

interface CalculationResult {
  id: string;
  frameNumber: string;
  totalWidth: number;
  totalHeight: number;
  lites: GlassLite[];
  glassBite: number;
  notes: string[];
  timestamp: number;
}

// Fractional input component
function FractionalInput({ 
  value, 
  onChange, 
  label, 
  placeholder = "e.g., 5 1/4 or 0.375",
  colorClass = "blue"
}: { 
  value: string; 
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  colorClass?: string;
}) {
  const [displayValue, setDisplayValue] = useState(value);

  const parseFraction = (input: string): number | null => {
    if (!input || input.trim() === '') return null;
    
    // Handle pure decimals (e.g., "5.25")
    if (/^\d+\.?\d*$/.test(input.trim())) {
      return parseFloat(input);
    }

    // Handle fractions: "5 1/4", "1/4", "5-1/4", etc.
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
    
    // Find closest fraction
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
      <label className="block text-sm text-gray-600 mb-1">
        {label}
      </label>
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-${colorClass}-500 font-mono`}
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
  const [frameNumber, setFrameNumber] = useState('');
  const [numberOfLites, setNumberOfLites] = useState(1);
  const [glassBite, setGlassBite] = useState('0.375');
  
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
  
  // Mullion width (for multi-lite frames)
  const [mullionWidth, setMullionWidth] = useState('0.25');
  
  // Saved results
  const [savedResults, setSavedResults] = useState<CalculationResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const parseInput = (val: string): number | null => {
    if (!val || val.trim() === '') return null;
    const parsed = parseFloat(val);
    return isNaN(parsed) ? null : parsed;
  };

  const calculateGlassSizes = () => {
    setError(null);

    // Validate inputs
    const inputs = {
      frameNumber,
      levelToHeadLeft: parseInput(levelToHeadLeft),
      levelToHeadRight: parseInput(levelToHeadRight),
      levelToSillLeft: parseInput(levelToSillLeft),
      levelToSillRight: parseInput(levelToSillRight),
      plumbToLeftHead: parseInput(plumbToLeftHead),
      plumbToRightHead: parseInput(plumbToRightHead),
      plumbToLeftSill: parseInput(plumbToLeftSill),
      plumbToRightSill: parseInput(plumbToRightSill),
      glassBite: parseInput(glassBite),
      mullionWidth: parseInput(mullionWidth),
    };

    if (!inputs.frameNumber || inputs.frameNumber.trim() === '') {
      setError('Please enter Frame Number');
      return;
    }

    for (const [key, val] of Object.entries(inputs)) {
      if (key === 'frameNumber' || key === 'mullionWidth') continue;
      if (val === null) {
        setError(`Please enter valid measurements for all fields`);
        return;
      }
    }

    // Check for squareness
    const notes: string[] = [];
    
    // Height check: does left side = right side?
    const leftHeight = inputs.levelToHeadLeft! + inputs.levelToSillLeft!;
    const rightHeight = inputs.levelToHeadRight! + inputs.levelToSillRight!;
    const heightDiff = Math.abs(leftHeight - rightHeight);

    // Width check: does head width = sill width?
    const headWidth = inputs.plumbToLeftHead! + inputs.plumbToRightHead!;
    const sillWidth = inputs.plumbToLeftSill! + inputs.plumbToRightSill!;
    const widthDiff = Math.abs(headWidth - sillWidth);

    if (heightDiff > 0.0625) {
      notes.push(`⚠️ Out of square: Left height (${leftHeight.toFixed(3)}") ≠ Right height (${rightHeight.toFixed(3)}") — diff: ${heightDiff.toFixed(3)}"`);
    }
    if (widthDiff > 0.0625) {
      notes.push(`⚠️ Out of square: Head width (${headWidth.toFixed(3)}") ≠ Sill width (${sillWidth.toFixed(3)}") — diff: ${widthDiff.toFixed(3)}"`);
    }

    // Calculate totals
    const totalHeight = inputs.levelToHeadLeft! + inputs.levelToSillLeft!;
    const totalWidth = inputs.plumbToLeftHead! + inputs.plumbToRightHead!;

    // Calculate glass dimensions
    const lites: GlassLite[] = [];
    
    if (numberOfLites === 1) {
      const avgHeight = (
        (inputs.levelToHeadLeft! + inputs.levelToSillLeft!) +
        (inputs.levelToHeadRight! + inputs.levelToSillRight!)
      ) / 2;
      const avgWidth = (
        (inputs.plumbToLeftHead! + inputs.plumbToRightHead!) +
        (inputs.plumbToLeftSill! + inputs.plumbToRightSill!)
      ) / 2;

      lites.push({
        liteNumber: 1,
        width: avgWidth - (2 * inputs.glassBite!),
        height: avgHeight - (2 * inputs.glassBite!),
      });
    } else {
      const avgHeight = (
        (inputs.levelToHeadLeft! + inputs.levelToSillLeft!) +
        (inputs.levelToHeadRight! + inputs.levelToSillRight!)
      ) / 2;
      const avgWidth = (
        (inputs.plumbToLeftHead! + inputs.plumbToRightHead!) +
        (inputs.plumbToLeftSill! + inputs.plumbToRightSill!)
      ) / 2;

      const totalMullionWidth = (numberOfLites - 1) * inputs.mullionWidth!;
      const availableWidth = avgWidth - (2 * inputs.glassBite!) - totalMullionWidth;
      const liteWidth = availableWidth / numberOfLites;
      const liteHeight = avgHeight - (2 * inputs.glassBite!);

      for (let i = 0; i < numberOfLites; i++) {
        lites.push({
          liteNumber: i + 1,
          width: liteWidth,
          height: liteHeight,
        });
      }

      notes.push(`Mullion width: ${inputs.mullionWidth!.toFixed(3)}" × ${numberOfLites - 1}`);
    }

    const result: CalculationResult = {
      id: Date.now().toString(),
      frameNumber: inputs.frameNumber,
      totalWidth,
      totalHeight,
      lites,
      glassBite: inputs.glassBite!,
      notes,
      timestamp: Date.now(),
    };

    setSavedResults([result, ...savedResults]);

    // Clear form
    setFrameNumber('');
    setLevelToHeadLeft('');
    setLevelToHeadRight('');
    setLevelToSillLeft('');
    setLevelToSillRight('');
    setPlumbToLeftHead('');
    setPlumbToRightHead('');
    setPlumbToLeftSill('');
    setPlumbToRightSill('');
  };

  const deleteResult = (id: string) => {
    if (confirm('Delete this entry?')) {
      setSavedResults(savedResults.filter(r => r.id !== id));
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
        Field measurement tool for interior glazing — enter fractions naturally (e.g., 5 1/4 or 3/16)
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Configuration */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Frame Configuration</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frame Number / Tag
                </label>
                <input
                  type="text"
                  value={frameNumber}
                  onChange={(e) => setFrameNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., A-101, 2W-15"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Lites
                </label>
                <select
                  value={numberOfLites}
                  onChange={(e) => setNumberOfLites(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={1}>1 Lite (Single)</option>
                  <option value={2}>2 Lites (Double)</option>
                  <option value={3}>3 Lites (Triple)</option>
                </select>
              </div>

              <FractionalInput
                value={glassBite}
                onChange={setGlassBite}
                label="Glass Bite"
                placeholder="e.g., 3/8"
              />
            </div>

            {numberOfLites > 1 && (
              <div className="mt-4">
                <FractionalInput
                  value={mullionWidth}
                  onChange={setMullionWidth}
                  label="Mullion Width"
                  placeholder="e.g., 1/4"
                />
              </div>
            )}
          </div>

          {/* Measurements */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
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
                      onChange={setLevelToHeadLeft}
                      label="Level to Head (Left)"
                      placeholder="e.g., 36 1/2"
                      colorClass="blue"
                    />
                    <FractionalInput
                      value={levelToHeadRight}
                      onChange={setLevelToHeadRight}
                      label="Level to Head (Right)"
                      placeholder="e.g., 36 3/4"
                      colorClass="blue"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FractionalInput
                      value={levelToSillLeft}
                      onChange={setLevelToSillLeft}
                      label="Level to Sill (Left)"
                      placeholder="e.g., 36 1/4"
                      colorClass="blue"
                    />
                    <FractionalInput
                      value={levelToSillRight}
                      onChange={setLevelToSillRight}
                      label="Level to Sill (Right)"
                      placeholder="e.g., 36 1/8"
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
                      onChange={setPlumbToLeftHead}
                      label="Plumb to Left (Head)"
                      placeholder="e.g., 24"
                      colorClass="green"
                    />
                    <FractionalInput
                      value={plumbToRightHead}
                      onChange={setPlumbToRightHead}
                      label="Plumb to Right (Head)"
                      placeholder="e.g., 24 1/16"
                      colorClass="green"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FractionalInput
                      value={plumbToLeftSill}
                      onChange={setPlumbToLeftSill}
                      label="Plumb to Left (Sill)"
                      placeholder="e.g., 24"
                      colorClass="green"
                    />
                    <FractionalInput
                      value={plumbToRightSill}
                      onChange={setPlumbToRightSill}
                      label="Plumb to Right (Sill)"
                      placeholder="e.g., 24 1/8"
                      colorClass="green"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateGlassSizes}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            🔧 Calculate & Save
          </button>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-medium">⚠️ {error}</p>
            </div>
          )}
        </div>

        {/* Saved Results - Right Column */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              📋 Cut List ({savedResults.length})
            </h2>

            {savedResults.length === 0 ? (
              <p className="text-gray-500 text-sm">No entries yet. Calculate your first frame to start building your cut list.</p>
            ) : (
              <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                {savedResults.map((result) => (
                  <div key={result.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900">{result.frameNumber}</h3>
                      <button
                        onClick={() => deleteResult(result.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                    
                    <div className="text-sm space-y-1 text-gray-700">
                      <p><strong>Frame:</strong> {formatDimension(result.totalWidth)} × {formatDimension(result.totalHeight)}</p>
                      {result.lites.map(lite => (
                        <p key={lite.liteNumber}>
                          <strong>Lite {lite.liteNumber}:</strong> {formatDimension(lite.width)} × {formatDimension(lite.height)}
                        </p>
                      ))}
                      <p className="text-xs text-gray-500">Bite: {formatDimension(result.glassBite)}</p>
                    </div>

                    {result.notes.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-300">
                        {result.notes.map((note, idx) => (
                          <p key={idx} className="text-xs text-yellow-700">{note}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {savedResults.length > 0 && (
              <button
                onClick={() => {
                  const csv = savedResults.map(r => 
                    r.lites.map(l => 
                      `${r.frameNumber},Lite ${l.liteNumber},${l.width.toFixed(3)},${l.height.toFixed(3)}`
                    ).join('\n')
                  ).join('\n');
                  
                  const blob = new Blob([`Frame,Lite,Width,Height\n${csv}`], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `glass-cutlist-${new Date().toISOString().slice(0,10)}.csv`;
                  a.click();
                }}
                className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
              >
                📥 Export CSV
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gray-100 border border-gray-200 rounded-lg p-6 mt-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">📋 How to Use</h3>
        <ol className="space-y-2 text-gray-700">
          <li><strong>1.</strong> Enter measurements using fractions: 5 1/4, 36 3/8, 1/16, etc.</li>
          <li><strong>2.</strong> System auto-converts to decimal on blur (5 1/4 → 5.25)</li>
          <li><strong>3.</strong> Click "Calculate & Save" to add to cut list</li>
          <li><strong>4.</strong> Review saved entries in right panel — click 🗑️ to delete</li>
          <li><strong>5.</strong> Export CSV when done for shop/office records</li>
        </ol>
      </div>
    </div>
  );
}
