import * as THREE from "three";
import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";
import * as FRAGS from "@thatopen/fragments";
import { FRAGMENTS_WORKER_URL, WEB_IFC_WASM_PATH } from "./constants";
import { formatFeetAndInches, getJsHeapMb } from "./format";
import {
  findPropertyValue,
  ITEM_DATA_CONFIG,
  parseSelectedElement,
} from "./properties";
import type {
  ClipPlaneEntry,
  ColorByMode,
  ColorLegendEntry,
  InteractionMode,
  IssuePin,
  LengthReading,
  LoadMetrics,
  ModelIdMap,
  SelectedElementInfo,
  StoreyEntry,
} from "./types";

export type BimWorld = OBC.SimpleWorld<
  OBC.SimpleScene,
  OBC.OrthoPerspectiveCamera,
  OBC.SimpleRenderer
>;

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  return copy;
}

export interface LoadInput {
  bytes: Uint8Array;
  fileName: string;
  fileSizeBytes: number;
  format: "ifc" | "frag";
  fromCache: boolean;
  conversionTimeMs: number | null;
  onProgress?: (percent: number) => void;
}

const COLOR_PALETTE = [
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#d97706",
  "#7c3aed",
  "#0891b2",
  "#db2777",
  "#4d7c0f",
  "#9333ea",
  "#0f766e",
];

function mergeMaps(a: ModelIdMap, b: ModelIdMap): ModelIdMap {
  const out: ModelIdMap = {};
  for (const [modelId, ids] of Object.entries(a)) {
    out[modelId] = new Set(ids);
  }
  for (const [modelId, ids] of Object.entries(b)) {
    const existing = out[modelId] ?? new Set<number>();
    for (const id of ids) {
      existing.add(id);
    }
    out[modelId] = existing;
  }
  return out;
}

function flattenIds(map: ModelIdMap): number[] {
  const ids: number[] = [];
  for (const set of Object.values(map)) {
    for (const id of set) {
      ids.push(id);
    }
  }
  return ids;
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function snapshotToUrl(bytes: Uint8Array | undefined): string | null {
  if (!bytes) {
    return null;
  }
  const blob = new Blob([toArrayBuffer(bytes)], { type: "image/png" });
  return URL.createObjectURL(blob);
}

export interface ViewerCallbacks {
  onSelection: (items: SelectedElementInfo[]) => void;
  onProgress?: (percent: number) => void;
  onError?: (message: string) => void;
}

export interface ViewerController {
  world: BimWorld;
  components: OBC.Components;
  container: HTMLElement;
  load: (input: LoadInput) => Promise<LoadMetrics>;
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

export async function createViewer(
  container: HTMLElement,
  callbacks: ViewerCallbacks,
): Promise<ViewerController> {
  const components = new OBC.Components();
  const worlds = components.get(OBC.Worlds);
  const world = worlds.create<
    OBC.SimpleScene,
    OBC.OrthoPerspectiveCamera,
    OBC.SimpleRenderer
  >();

  world.scene = new OBC.SimpleScene(components);
  world.scene.setup();
  world.scene.three.background = new THREE.Color("#111827");
  world.renderer = new OBC.SimpleRenderer(components, container);
  world.camera = new OBC.OrthoPerspectiveCamera(components);
  await world.camera.controls.setLookAt(40, 24, 40, 0, 4, 0);
  components.init();
  components.get(OBC.Grids).create(world);

  world.camera.controls.smoothTime = 0.12;
  world.camera.controls.draggingSmoothTime = 0.12;

  const fragments = components.get(OBC.FragmentsManager);
  fragments.init(FRAGMENTS_WORKER_URL);

  world.camera.controls.addEventListener("update", () => {
    fragments.core.update();
  });

  fragments.list.onItemSet.add(({ value: model }) => {
    model.useCamera(world.camera.three);
    world.scene.three.add(model.object);
    void fragments.core.update(true);
  });

  fragments.core.models.materials.list.onItemSet.add(({ value: material }) => {
    if (!("isLodMaterial" in material && material.isLodMaterial)) {
      material.polygonOffset = true;
      material.polygonOffsetUnits = 1;
      material.polygonOffsetFactor = Math.random();
    }
  });

  const ifcLoader = components.get(OBC.IfcLoader);
  await ifcLoader.setup({
    autoSetWasm: false,
    wasm: {
      path: WEB_IFC_WASM_PATH,
      absolute: true,
    },
  });

  components.get(OBC.Raycasters).get(world);

  const highlighter = components.get(OBF.Highlighter);
  highlighter.setup({
    world,
    selectMaterialDefinition: {
      color: new THREE.Color("#facc15"),
      opacity: 1,
      transparent: false,
      renderedFaces: 0,
    },
  });
  highlighter.multiple = "ctrlKey";
  highlighter.zoomToSelection = false;

  const clipper = components.get(OBC.Clipper);
  clipper.enabled = false;
  clipper.config.size = 6;

  const measurer = components.get(OBF.LengthMeasurement);
  measurer.world = world;
  measurer.color = new THREE.Color("#38bdf8");
  measurer.enabled = false;
  measurer.snappings = [FRAGS.SnappingClass.POINT];
  OBF.Measurement.valueFormatter = (value: number) => formatFeetAndInches(value);

  const classifier = components.get(OBC.Classifier);
  const hider = components.get(OBC.Hider);
  const bcfTopics = components.get(OBC.BCFTopics);
  bcfTopics.setup({
    author: "bim-test@pgc.local",
    types: new Set(["Issue", "Coordination", "Information"]),
    statuses: new Set(["Open", "In Progress", "Closed"]),
    users: new Set(["bim-test@pgc.local"]),
    version: "3",
  });
  const viewpoints = components.get(OBC.Viewpoints);
  viewpoints.world = world;
  const marker = components.get(OBF.Marker);
  marker.threshold = 24;
  marker.autoCluster = false;

  let multiSelect = false;
  let mode: InteractionMode = "select";
  let mergingSelection = false;
  const issues: IssuePin[] = [];
  const storeyVisibility = new Map<string, boolean>();

  highlighter.events.select.onHighlight.add(async (modelIdMap) => {
    if (mergingSelection) {
      return;
    }
    let map = modelIdMap;
    if (multiSelect) {
      mergingSelection = true;
      map = mergeMaps(highlighter.selection.select, modelIdMap);
      await highlighter.highlightByID("select", map, true);
      mergingSelection = false;
    }
    const items = await readSelection(map);
    callbacks.onSelection(items);
  });

  highlighter.events.select.onClear.add(() => {
    if (!mergingSelection) {
      callbacks.onSelection([]);
    }
  });

  const pointer = { x: 0, y: 0, down: false, moved: false };

  container.addEventListener(
    "pointerdown",
    (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.down = true;
      pointer.moved = false;
    },
    { passive: true },
  );

  container.addEventListener(
    "pointermove",
    (event) => {
      if (!pointer.down) {
        return;
      }
      const dx = event.clientX - pointer.x;
      const dy = event.clientY - pointer.y;
      if (dx * dx + dy * dy > 64) {
        pointer.moved = true;
      }
    },
    { passive: true },
  );

  container.addEventListener("pointerup", () => {
    const wasTap = pointer.down && !pointer.moved;
    pointer.down = false;
    if (!wasTap) {
      return;
    }
    if (mode === "measure" && measurer.enabled) {
      void measurer.create();
    }
    if (mode === "clip" && clipper.enabled) {
      void clipper.create(world);
    }
  });

  container.addEventListener("dblclick", () => {
    if (mode === "measure" && measurer.enabled) {
      void measurer.create();
    }
    if (mode === "clip" && clipper.enabled) {
      void clipper.create(world);
    }
  });

  async function disposeModels(): Promise<void> {
    for (const [modelId] of fragments.list) {
      fragments.core.disposeModel(modelId);
    }
    storeyVisibility.clear();
  }

  async function readSelection(map: ModelIdMap): Promise<SelectedElementInfo[]> {
    const items: SelectedElementInfo[] = [];
    for (const [modelId, localIds] of Object.entries(map)) {
      const model = fragments.list.get(modelId);
      if (!model || localIds.size === 0) {
        continue;
      }
      const data = await model.getItemsData([...localIds], ITEM_DATA_CONFIG);
      data.forEach((entry, index) => {
        const localId = [...localIds][index];
        if (typeof localId === "number") {
          items.push(parseSelectedElement(modelId, localId, entry));
        }
      });
    }
    return items;
  }

  async function firstModel(): Promise<FRAGS.FragmentsModel | null> {
    const iterator = fragments.list.values();
    const first = iterator.next();
    return first.done ? null : first.value;
  }

  async function countGeometry(): Promise<{
    elementCount: number | null;
    triangleCount: number | null;
  }> {
    const model = await firstModel();
    if (!model) {
      return { elementCount: null, triangleCount: null };
    }
    try {
      const ids = await model.getItemsIdsWithGeometry();
      const elementCount = ids.length;
      if (elementCount > 40000) {
        return { elementCount, triangleCount: null };
      }
      const meshes = await model.getItemsGeometry(ids);
      let triangles = 0;
      for (const itemMeshes of meshes) {
        for (const mesh of itemMeshes) {
          if (mesh.indices) {
            triangles += Math.floor(mesh.indices.length / 3);
          }
        }
      }
      return { elementCount, triangleCount: triangles };
    } catch {
      return { elementCount: null, triangleCount: null };
    }
  }

  async function waitForFirstFrame(): Promise<void> {
    await fragments.core.update(true);
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
  }

  const load: ViewerController["load"] = async (input) => {
    const loadStarted = performance.now();
    const notes: string[] = [];
    await disposeModels();
    highlighter.clear();

    const modelId = input.fileName.replace(/\.(ifc|ifczip|frag)$/i, "") || "model";

    if (input.format === "ifc") {
      await ifcLoader.load(input.bytes, false, modelId, {
        processData: {
          progressCallback: (progress) => {
            const percent = progress <= 1 ? progress * 100 : progress;
            input.onProgress?.(Math.max(0, Math.min(100, percent)));
          },
        },
      });
    } else {
      input.onProgress?.(40);
      await fragments.core.load(input.bytes, { modelId });
      input.onProgress?.(90);
    }

    await waitForFirstFrame();
    const timeToFirstRenderMs = Math.round(performance.now() - loadStarted);
    const counts = await countGeometry();

    try {
      await classifier.byIfcBuildingStorey({ classificationName: "Levels" });
      const levels = classifier.list.get("Levels");
      if (levels) {
        for (const [name] of levels) {
          storeyVisibility.set(name, true);
        }
      }
    } catch (error) {
      notes.push(
        `Storey classification failed: ${error instanceof Error ? error.message : "unknown"}`,
      );
    }

    const model = await firstModel();
    if (model) {
      const box = model.box;
      if (!box.isEmpty()) {
        await world.camera.controls.fitToBox(box, true);
      }
    }

    input.onProgress?.(100);

    return {
      fileName: input.fileName,
      fileSizeMb: input.fileSizeBytes / (1024 * 1024),
      format: input.format,
      conversionTimeMs: input.format === "ifc" ? input.conversionTimeMs : null,
      timeToFirstRenderMs,
      elementCount: counts.elementCount,
      triangleCount: counts.triangleCount,
      jsHeapMb: getJsHeapMb(),
      avgFps: null,
      notes: [
        input.fromCache ? "Loaded from IndexedDB cache (conversion skipped)." : "",
        ...notes,
      ]
        .filter(Boolean)
        .join(" "),
      fromCache: input.fromCache,
    };
  };

  const controller: ViewerController = {
    world,
    components,
    container,
    load,
    getFragmentsBuffer: async () => {
      const model = await firstModel();
      if (!model) {
        return null;
      }
      return model.getBuffer(false);
    },
    downloadFragments: async () => {
      const model = await firstModel();
      if (!model) {
        return;
      }
      const buffer = await model.getBuffer(false);
      const name = `${model.modelId}.frag`;
      downloadBlob(new Blob([buffer], { type: "application/octet-stream" }), name);
    },
    setMode: (next) => {
      mode = next;
      highlighter.enabled = next === "select";
      measurer.enabled = next === "measure";
      clipper.enabled = next === "clip";
    },
    setMultiSelect: (enabled) => {
      multiSelect = enabled;
    },
    getSelectedExpressIds: () => {
      return flattenIds(highlighter.selection.select);
    },
    colorBy: async (colorMode) => {
      const model = await firstModel();
      if (!model) {
        return [];
      }
      await model.resetColor(undefined);
      if (colorMode === "none") {
        await fragments.core.update(true);
        return [];
      }

      const ids = await model.getItemsIdsWithGeometry();
      const data = await model.getItemsData(ids, ITEM_DATA_CONFIG);
      const groups = new Map<string, number[]>();
      data.forEach((entry, index) => {
        const info = parseSelectedElement(model.modelId, ids[index] ?? 0, entry);
        const value =
          colorMode === "manufacturer"
            ? findPropertyValue(info.properties, "Manufacturer")
            : findPropertyValue(
                info.properties,
                "Reference",
                "Pset_BuildingElementProxyCommon",
              ) || findPropertyValue(info.properties, "Reference");
        const key = value || "(none)";
        const list = groups.get(key) ?? [];
        const localId = ids[index];
        if (typeof localId === "number") {
          list.push(localId);
          groups.set(key, list);
        }
      });

      const legend: ColorLegendEntry[] = [];
      let i = 0;
      for (const [value, localIds] of groups) {
        const hex = COLOR_PALETTE[i % COLOR_PALETTE.length] ?? "#64748b";
        i += 1;
        await model.setColor(localIds, new THREE.Color(hex));
        legend.push({ value, color: hex, count: localIds.length });
      }
      await fragments.core.update(true);
      return legend.sort((a, b) => b.count - a.count);
    },
    listStoreys: async () => {
      const levels = classifier.list.get("Levels");
      if (!levels) {
        return [];
      }
      const entries: StoreyEntry[] = [];
      for (const [name] of levels) {
        entries.push({
          name,
          visible: storeyVisibility.get(name) ?? true,
        });
      }
      return entries.sort((a, b) => a.name.localeCompare(b.name));
    },
    setStoreyVisible: async (name, visible) => {
      const levels = classifier.list.get("Levels");
      const group = levels?.get(name);
      if (!group) {
        return;
      }
      const map = await group.get();
      await hider.set(visible, map);
      storeyVisibility.set(name, visible);
      await fragments.core.update(true);
    },
    showAllStoreys: async () => {
      await hider.set(true);
      for (const name of storeyVisibility.keys()) {
        storeyVisibility.set(name, true);
      }
      await fragments.core.update(true);
    },
    addClip: async () => {
      clipper.enabled = true;
      await clipper.create(world);
    },
    removeClip: async (id) => {
      await clipper.delete(world, id);
    },
    deleteAllClips: () => {
      clipper.deleteAll();
    },
    listClips: () => {
      const planes: ClipPlaneEntry[] = [];
      for (const [id, plane] of clipper.list) {
        planes.push({ id, enabled: plane.enabled });
      }
      return planes;
    },
    setClipEnabled: (id, enabled) => {
      const plane = clipper.list.get(id);
      if (plane) {
        plane.enabled = enabled;
      }
    },
    createMeasurement: async () => {
      measurer.enabled = true;
      await measurer.create();
    },
    clearMeasurements: () => {
      measurer.list.clear();
    },
    listMeasurements: () => {
      const readings: LengthReading[] = [];
      for (const line of measurer.list) {
        readings.push({
          id: line.id,
          feet: line.value,
          label: formatFeetAndInches(line.value),
        });
      }
      return readings;
    },
    createIssue: async (title, comment) => {
      const selection = highlighter.selection.select;
      const selected = await readSelection(selection);
      const viewpoint = viewpoints.create({ title });
      viewpoint.world = world;
      await viewpoint.updateCamera(true);
      const guids = selected.map((item) => item.globalId).filter(Boolean);
      if (guids.length > 0) {
        viewpoint.selectionComponents.add(...guids);
      }

      const topic = bcfTopics.create({
        title: title || "Untitled issue",
        description: comment,
        type: "Issue",
        status: "Open",
      });
      topic.viewpoints.add(viewpoint.guid);
      if (comment.trim().length > 0) {
        topic.createComment(comment, viewpoint.guid);
      }

      let markerId: string | null = null;
      try {
        const boxes = await fragments.getBBoxes(selection);
        if (boxes[0] && !boxes[0].isEmpty()) {
          const center = boxes[0].getCenter(new THREE.Vector3());
          const pin = document.createElement("div");
          pin.textContent = "📍";
          pin.style.fontSize = "22px";
          pin.style.lineHeight = "1";
          pin.style.filter = "drop-shadow(0 1px 2px rgba(0,0,0,0.5))";
          markerId = marker.create(world, pin, center, true);
        }
      } catch {
        markerId = null;
      }

      const snapshot = viewpoints.snapshots.get(viewpoint.snapshot);
      const pinRecord: IssuePin = {
        topicGuid: topic.guid,
        viewpointGuid: viewpoint.guid,
        title: topic.title,
        comment,
        createdAt: topic.creationDate.toISOString(),
        snapshotUrl: snapshotToUrl(snapshot),
        markerId,
        expressIds: selected.map((item) => item.expressId),
      };
      issues.push(pinRecord);
      return pinRecord;
    },
    restoreIssue: async (topicGuid) => {
      const pin = issues.find((item) => item.topicGuid === topicGuid);
      if (!pin) {
        return;
      }
      const viewpoint = viewpoints.list.get(pin.viewpointGuid);
      if (!viewpoint) {
        return;
      }
      await viewpoint.go({ transition: true, applyVisibility: false });
    },
    listIssues: () => [...issues],
    exportBcf: async () => {
      try {
        const blob = await bcfTopics.export();
        const looksZip = blob.type.includes("zip") || blob.size > 20;
        downloadBlob(blob, "bim-test-issues.bcf");
        return {
          ok: looksZip,
          note: looksZip
            ? "Exported BCFTopics blob as .bcf."
            : "Export produced a small blob; verify it opens in a BCF tool.",
        };
      } catch (error) {
        const fallback = {
          issues: issues.map((item) => ({
            title: item.title,
            comment: item.comment,
            createdAt: item.createdAt,
            expressIds: item.expressIds,
          })),
        };
        downloadBlob(
          new Blob([JSON.stringify(fallback, null, 2)], {
            type: "application/json",
          }),
          "bim-test-issues.fallback.json",
        );
        return {
          ok: false,
          note: `BCFTopics.export failed (${error instanceof Error ? error.message : "unknown"}). Wrote JSON fallback.`,
        };
      }
    },
    runOrbitFps: async (seconds = 10) => {
      const model = await firstModel();
      const box = model?.box ?? new THREE.Box3(
        new THREE.Vector3(-10, 0, -10),
        new THREE.Vector3(10, 10, 10),
      );
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3()).length();
      const radius = Math.max(size * 0.55, 8);
      const height = center.y + Math.max(size * 0.2, 4);
      const start = performance.now();
      const duration = seconds * 1000;
      let frames = 0;
      await new Promise<void>((resolve) => {
        const step = async () => {
          const elapsed = performance.now() - start;
          const t = elapsed / duration;
          const angle = t * Math.PI * 2;
          const x = center.x + Math.cos(angle) * radius;
          const z = center.z + Math.sin(angle) * radius;
          await world.camera.controls.setLookAt(
            x,
            height,
            z,
            center.x,
            center.y,
            center.z,
            false,
          );
          frames += 1;
          if (elapsed >= duration) {
            resolve();
            return;
          }
          requestAnimationFrame(() => {
            void step();
          });
        };
        void step();
      });
      return frames / seconds;
    },
    dispose: () => {
      highlighter.dispose();
      components.dispose();
    },
  };

  return controller;
}
