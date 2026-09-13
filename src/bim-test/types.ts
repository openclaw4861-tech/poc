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
