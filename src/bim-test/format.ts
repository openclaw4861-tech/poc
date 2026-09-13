export function bytesToMb(bytes: number): number {
  return bytes / (1024 * 1024);
}

export function formatMb(mb: number | null): string {
  if (mb === null || !Number.isFinite(mb)) {
    return "n/a";
  }
  return `${mb.toFixed(2)} MB`;
}

/**
 * Model coordinates are feet (Revit IFC export). Convert a length in feet
 * to architectural feet-and-inches, e.g. 12.5 → 12'-6".
 */
export function formatFeetAndInches(feet: number): string {
  if (!Number.isFinite(feet)) {
    return "—";
  }
  const sign = feet < 0 ? "-" : "";
  const abs = Math.abs(feet);
  const wholeFeet = Math.floor(abs);
  const inchesTotal = (abs - wholeFeet) * 12;
  const wholeInches = Math.floor(inchesTotal + 1e-9);
  const frac = inchesTotal - wholeInches;

  const sixteenths = Math.round(frac * 16);
  let inches = wholeInches;
  let numerator = sixteenths;
  let extraFoot = 0;

  if (numerator === 16) {
    inches += 1;
    numerator = 0;
  }
  if (inches === 12) {
    extraFoot = 1;
    inches = 0;
  }

  const feetPart = wholeFeet + extraFoot;
  if (numerator === 0) {
    return `${sign}${feetPart}'-${inches}"`;
  }

  let n = numerator;
  let d = 16;
  while (n % 2 === 0 && d % 2 === 0) {
    n /= 2;
    d /= 2;
  }
  return `${sign}${feetPart}'-${inches} ${n}/${d}"`;
}

export function getJsHeapMb(): number | null {
  const perf = performance as Performance & {
    memory?: { usedJSHeapSize?: number };
  };
  const used = perf.memory?.usedJSHeapSize;
  if (typeof used !== "number" || !Number.isFinite(used)) {
    return null;
  }
  return bytesToMb(used);
}

export function cacheKey(file: Pick<File, "name" | "size" | "lastModified">): string {
  return `${file.name}::${file.size}::${file.lastModified}`;
}
