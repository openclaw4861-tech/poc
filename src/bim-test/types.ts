import type * as OBC from "@thatopen/components";

export type BimFileFormat = "ifc" | "frag";

export type ColorByMode = "none" | "manufacturer" | "reference";

export type InteractionMode = "select" | "measure" | "clip";

export interface PropertyRow {
  psetName: string;
  name: string;
  value: string;
  highlight: boolean;
}

export interface SelectedElementInfo {
  modelId: string;
  localId: number;
  expressId: number;
  entityType: string;
  globalId: string;
  name: string;
  properties: PropertyRow[];
}

export interface ColorLegendEntry {
  value: string;
  color: string;
  count: number;
}

export interface StoreyEntry {
  name: string;
  visible: boolean;
}

export interface ClipPlaneEntry {
  id: string;
  enabled: boolean;
}

export interface LengthReading {
  id: string;
  feet: number;
  label: string;
}

export interface IssuePin {
  topicGuid: string;
  viewpointGuid: string;
  title: string;
  comment: string;
  createdAt: string;
  snapshotUrl: string | null;
  markerId: string | null;
  expressIds: number[];
}

export interface LoadMetrics {
  fileName: string;
  fileSizeMb: number;
  format: BimFileFormat;
  conversionTimeMs: number | null;
  timeToFirstRenderMs: number | null;
  elementCount: number | null;
  triangleCount: number | null;
  jsHeapMb: number | null;
  avgFps: number | null;
  notes: string;
  fromCache: boolean;
}

export interface PersistableRun {
  userAgent: string;
  fileName: string;
  fileSizeMb: number;
  format: BimFileFormat;
  conversionTimeMs: number | null;
  timeToFirstRenderMs: number | null;
  elementCount: number | null;
  triangleCount: number | null;
  jsHeapMb: number | null;
  avgFps: number | null;
  notes: string | null;
}

export interface BimTestRunRow {
  id: number;
  userAgent: string;
  fileName: string;
  fileSizeMb: string;
  format: string;
  conversionTimeMs: number | null;
  timeToFirstRenderMs: number | null;
  elementCount: number | null;
  triangleCount: number | null;
  jsHeapMb: string | null;
  avgFps: string | null;
  notes: string | null;
  createdAt: string;
}

export type ModelIdMap = OBC.ModelIdMap;

/** Engine handle used by the React chrome. Kept here so the UI chunk does not import That Open. */
export interface ViewerHandle {
  load: (input: {
    bytes: Uint8Array;
    fileName: string;
    fileSizeBytes: number;
    format: BimFileFormat;
    fromCache: boolean;
    conversionTimeMs: number | null;
    onProgress?: (percent: number) => void;
  }) => Promise<LoadMetrics>;
  downloadFragments: () => Promise<void>;
  getFragmentsBuffer: () => Promise<ArrayBuffer | null>;
  setMode: (mode: InteractionMode) => void;
  setMultiSelect: (enabled: boolean) => void;
  getSelectedExpressIds: () => number[];
  colorBy: (mode: ColorByMode) => Promise<ColorLegendEntry[]>;
  listStoreys: () => Promise<StoreyEntry[]>;
  setStoreyVisible: (name: string, visible: boolean) => Promise<void>;
  showAllStoreys: () => Promise<void>;
  addClip: () => Promise<void>;
  removeClip: (id?: string) => Promise<void>;
  deleteAllClips: () => void;
  listClips: () => ClipPlaneEntry[];
  setClipEnabled: (id: string, enabled: boolean) => void;
  createMeasurement: () => Promise<void>;
  clearMeasurements: () => void;
  listMeasurements: () => LengthReading[];
  createIssue: (title: string, comment: string) => Promise<IssuePin>;
  restoreIssue: (topicGuid: string) => Promise<void>;
  listIssues: () => IssuePin[];
  exportBcf: () => Promise<{ ok: boolean; note: string }>;
  runOrbitFps: (seconds?: number) => Promise<number>;
  dispose: () => void;
}
