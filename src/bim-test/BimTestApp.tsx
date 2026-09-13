"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getCachedFragments, setCachedFragments } from "./cache";
import {
  BIM_TEST_VERSIONS,
  PUBLIC_SAMPLE_IFC_LABEL,
  PUBLIC_SAMPLE_IFC_URL,
} from "./constants";
import { createViewer, type ViewerController } from "./createViewer";
import { cacheKey, formatMb, getJsHeapMb } from "./format";
import type {
  BimFileFormat,
  ColorByMode,
  ColorLegendEntry,
  InteractionMode,
  IssuePin,
  LengthReading,
  LoadMetrics,
  PersistableRun,
  SelectedElementInfo,
  StoreyEntry,
} from "./types";

async function persistRun(run: PersistableRun): Promise<string | null> {
  try {
    const response = await fetch("/api/bim-test/runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(run),
    });
    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      return body.error ?? `HTTP ${response.status}`;
    }
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : "Failed to persist metrics";
  }
}

export default function BimTestApp() {
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<ViewerController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("Initializing viewer…");
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<InteractionMode>("select");
  const [multiSelect, setMultiSelect] = useState(false);
  const [selection, setSelection] = useState<SelectedElementInfo[]>([]);
  const [colorMode, setColorMode] = useState<ColorByMode>("none");
  const [legend, setLegend] = useState<ColorLegendEntry[]>([]);
  const [storeys, setStoreys] = useState<StoreyEntry[]>([]);
  const [clips, setClips] = useState<{ id: string; enabled: boolean }[]>([]);
  const [measurements, setMeasurements] = useState<LengthReading[]>([]);
  const [issues, setIssues] = useState<IssuePin[]>([]);
  const [issueTitle, setIssueTitle] = useState("");
  const [issueComment, setIssueComment] = useState("");
  const [metrics, setMetrics] = useState<LoadMetrics | null>(null);
  const [metricsNote, setMetricsNote] = useState("");
  const [mobilePanel, setMobilePanel] = useState<"tools" | "props" | "hidden">(
    "tools",
  );

  const refreshSideData = useCallback(() => {
    const viewer = viewerRef.current;
    if (!viewer) {
      return;
    }
    void viewer.listStoreys().then(setStoreys);
    setClips(viewer.listClips());
    setMeasurements(viewer.listMeasurements());
    setIssues(viewer.listIssues());
  }, []);

  useEffect(() => {
    const host = canvasHostRef.current;
    if (!host) {
      return;
    }
    let cancelled = false;
    void createViewer(host, {
      onSelection: (items) => {
        if (!cancelled) {
          setSelection(items);
        }
      },
    }).then((viewer) => {
      if (cancelled) {
        viewer.dispose();
        return;
      }
      viewerRef.current = viewer;
      setReady(true);
      setStatus("Pick a local .ifc / .frag, or load the public sample.");
    });
    return () => {
      cancelled = true;
      viewerRef.current?.dispose();
      viewerRef.current = null;
    };
  }, []);

  const applyMode = useCallback((next: InteractionMode) => {
    setMode(next);
    viewerRef.current?.setMode(next);
  }, []);

  const handleLoaded = useCallback(
    async (next: LoadMetrics) => {
      setMetrics(next);
      refreshSideData();
      setStatus(
        next.fromCache
          ? `Loaded ${next.fileName} from IndexedDB cache.`
          : `Loaded ${next.fileName}.`,
      );
      const persistError = await persistRun({
        userAgent: navigator.userAgent,
        fileName: next.fileName,
        fileSizeMb: next.fileSizeMb,
        format: next.format,
        conversionTimeMs: next.conversionTimeMs,
        timeToFirstRenderMs: next.timeToFirstRenderMs,
        elementCount: next.elementCount,
        triangleCount: next.triangleCount,
        jsHeapMb: next.jsHeapMb,
        avgFps: next.avgFps,
        notes: next.notes || null,
      });
      if (persistError) {
        setMetricsNote(`Metrics shown locally only: ${persistError}`);
      } else {
        setMetricsNote("Run saved to Neon (name/size/timings/counts only).");
      }
    },
    [refreshSideData],
  );

  const loadBytes = useCallback(
    async (
      bytes: Uint8Array,
      fileName: string,
      fileSizeBytes: number,
      format: BimFileFormat,
      fromCache: boolean,
      conversionTimeMs: number | null,
    ) => {
      const viewer = viewerRef.current;
      if (!viewer) {
        return;
      }
      setBusy(true);
      setProgress(5);
      try {
        const result = await viewer.load({
          bytes,
          fileName,
          fileSizeBytes,
          format,
          fromCache,
          conversionTimeMs,
          onProgress: setProgress,
        });
        setLegend([]);
        setColorMode("none");
        setSelection([]);
        await handleLoaded(result);
      } catch (error) {
        setStatus(
          `Load failed: ${error instanceof Error ? error.message : "unknown error"}`,
        );
      } finally {
        setBusy(false);
        setProgress(0);
      }
    },
    [handleLoaded],
  );

  const cacheLoadedFragments = useCallback(async (file: File) => {
    const viewer = viewerRef.current;
    if (!viewer) {
      return;
    }
    try {
      const buffer = await viewer.getFragmentsBuffer();
      if (!buffer) {
        return;
      }
      await setCachedFragments(cacheKey(file), buffer);
    } catch {
      setStatus((prev) => `${prev} (IndexedDB cache write skipped)`);
    }
  }, []);

  const onFile = useCallback(
    async (file: File) => {
      const lower = file.name.toLowerCase();
      const format: BimFileFormat | null = lower.endsWith(".frag")
        ? "frag"
        : lower.endsWith(".ifc") || lower.endsWith(".ifczip")
          ? "ifc"
          : null;
      if (!format) {
        setStatus("Please pick a .ifc or .frag file.");
        return;
      }

      setBusy(true);
      setStatus(`Reading ${file.name}…`);
      try {
        const key = cacheKey(file);
        if (format === "ifc") {
          const cached = await getCachedFragments(key);
          if (cached) {
            setStatus("Found cached fragments — skipping IFC conversion.");
            await loadBytes(
              new Uint8Array(cached),
              file.name.replace(/\.ifc(zip)?$/i, ".frag"),
              file.size,
              "frag",
              true,
              null,
            );
            return;
          }
        }

        const buffer = await file.arrayBuffer();
        if (format === "ifc") {
          const viewer = viewerRef.current;
          if (!viewer) {
            return;
          }
          setStatus("Converting IFC → fragments in the browser…");
          const conversionStart = performance.now();
          const result = await viewer.load({
            bytes: new Uint8Array(buffer),
            fileName: file.name,
            fileSizeBytes: file.size,
            format: "ifc",
            fromCache: false,
            conversionTimeMs: null,
            onProgress: setProgress,
          });
          result.conversionTimeMs = Math.round(performance.now() - conversionStart);
          setLegend([]);
          setColorMode("none");
          setSelection([]);
          await handleLoaded(result);
          await cacheLoadedFragments(file);
        } else {
          await loadBytes(
            new Uint8Array(buffer),
            file.name,
            file.size,
            "frag",
            false,
            null,
          );
        }
      } catch (error) {
        setStatus(
          `File read failed: ${error instanceof Error ? error.message : "unknown error"}`,
        );
      } finally {
        setBusy(false);
      }
    },
    [cacheLoadedFragments, handleLoaded, loadBytes],
  );

  const onPickFiles = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (file) {
        void onFile(file);
      }
    },
    [onFile],
  );

  const loadPublicSample = useCallback(async () => {
    setBusy(true);
    setStatus(`Fetching public sample ${PUBLIC_SAMPLE_IFC_LABEL}…`);
    try {
      const response = await fetch(PUBLIC_SAMPLE_IFC_URL);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const buffer = await response.arrayBuffer();
      const fakeFile = new File([buffer], "school_str.ifc", {
        type: "application/octet-stream",
      });
      await onFile(fakeFile);
    } catch (error) {
      setStatus(
        `Public sample fetch failed: ${error instanceof Error ? error.message : "unknown"}`,
      );
      setBusy(false);
    }
  }, [onFile]);

  const copyIds = useCallback(async () => {
    const ids = viewerRef.current?.getSelectedExpressIds() ?? [];
    const text = ids.join(",");
    try {
      await navigator.clipboard.writeText(text);
      setStatus(`Copied ${ids.length} express ID(s).`);
    } catch {
      setStatus(`IDs: ${text || "(none)"}`);
    }
  }, []);

  const onColorChange = useCallback(async (next: ColorByMode) => {
    setColorMode(next);
    const entries = (await viewerRef.current?.colorBy(next)) ?? [];
    setLegend(entries);
  }, []);

  const runFps = useCallback(async () => {
    const viewer = viewerRef.current;
    if (!viewer || !metrics) {
      return;
    }
    setBusy(true);
    setStatus("Scripted 10s orbit — measuring average FPS…");
    try {
      const fps = await viewer.runOrbitFps(10);
      const updated: LoadMetrics = {
        ...metrics,
        avgFps: fps,
        jsHeapMb: getJsHeapMb(),
        notes: `${metrics.notes} Orbit FPS captured.`.trim(),
      };
      setMetrics(updated);
      const persistError = await persistRun({
        userAgent: navigator.userAgent,
        fileName: updated.fileName,
        fileSizeMb: updated.fileSizeMb,
        format: updated.format,
        conversionTimeMs: updated.conversionTimeMs,
        timeToFirstRenderMs: updated.timeToFirstRenderMs,
        elementCount: updated.elementCount,
        triangleCount: updated.triangleCount,
        jsHeapMb: updated.jsHeapMb,
        avgFps: updated.avgFps,
        notes: updated.notes,
      });
      setStatus(
        persistError
          ? `FPS ${fps.toFixed(1)}. Persist failed: ${persistError}`
          : `Average orbit FPS ${fps.toFixed(1)} (saved).`,
      );
    } finally {
      setBusy(false);
    }
  }, [metrics]);

  const saveIssue = useCallback(async () => {
    const viewer = viewerRef.current;
    if (!viewer) {
      return;
    }
    if (selection.length === 0) {
      setStatus("Select an element before pinning an issue.");
      return;
    }
    const pin = await viewer.createIssue(issueTitle, issueComment);
    setIssues(viewer.listIssues());
    setIssueTitle("");
    setIssueComment("");
    setStatus(`Saved issue “${pin.title}”.`);
  }, [issueComment, issueTitle, selection.length]);

  const versions = useMemo(
    () =>
      Object.entries(BIM_TEST_VERSIONS)
        .map(([name, version]) => `${name}@${version}`)
        .join(" · "),
    [],
  );

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-slate-100">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900 px-4 py-3">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-sky-400 hover:text-sky-300">
              ← Field Tools
            </Link>
            <h1 className="text-lg font-semibold">BIM model viewer test</h1>
          </div>
          <p className="mt-1 max-w-3xl text-xs text-slate-400">
            Client-only That Open Engine. Local files stay in the browser. Demo
            URL: {PUBLIC_SAMPLE_IFC_URL}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/bim-test/runs"
            className="rounded-md bg-slate-800 px-3 py-1.5 text-sm hover:bg-slate-700"
          >
            Past runs
          </Link>
          <button
            type="button"
            className="rounded-md bg-slate-800 px-3 py-1.5 text-sm md:hidden"
            onClick={() =>
              setMobilePanel((current) =>
                current === "hidden" ? "tools" : "hidden",
              )
            }
          >
            Panels
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside
          className={`${
            mobilePanel === "tools" ? "flex" : "hidden"
          } w-full shrink-0 flex-col gap-4 overflow-y-auto border-r border-slate-800 bg-slate-900/80 p-3 md:flex md:w-80`}
        >
          <section className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Load
            </h2>
            <input
              ref={fileInputRef}
              type="file"
              accept=".ifc,.ifczip,.frag"
              className="block w-full text-xs file:mr-3 file:rounded file:border-0 file:bg-sky-600 file:px-3 file:py-1.5 file:text-white"
              onChange={onPickFiles}
              disabled={!ready || busy}
            />
            <button
              type="button"
              className="w-full rounded-md bg-sky-700 px-3 py-2 text-sm hover:bg-sky-600 disabled:opacity-50"
              onClick={() => void loadPublicSample()}
              disabled={!ready || busy}
            >
              Load public sample IFC
            </button>
            <button
              type="button"
              className="w-full rounded-md bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700 disabled:opacity-50"
              onClick={() => void viewerRef.current?.downloadFragments()}
              disabled={!ready || busy || !metrics}
            >
              Download .frag
            </button>
            {progress > 0 && (
              <div className="h-2 overflow-hidden rounded bg-slate-800">
                <div
                  className="h-full bg-sky-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
            <p className="text-xs text-slate-400">{status}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Interaction
            </h2>
            <div className="grid grid-cols-3 gap-1">
              {(["select", "measure", "clip"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`rounded px-2 py-1.5 text-xs capitalize ${
                    mode === item ? "bg-sky-600" : "bg-slate-800"
                  }`}
                  onClick={() => applyMode(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={multiSelect}
                onChange={(event) => {
                  setMultiSelect(event.target.checked);
                  viewerRef.current?.setMultiSelect(event.target.checked);
                }}
              />
              Multi-select (iPad / extra clicks)
            </label>
            <p className="text-xs text-slate-500">
              Orbit / pan / pinch on the canvas. Tap to select. Ctrl+click adds
              on desktop. Measure: two taps. Clip: tap a face, drag the plane.
            </p>
            <button
              type="button"
              className="w-full rounded bg-slate-800 px-3 py-1.5 text-sm"
              onClick={() => void copyIds()}
            >
              Copy selected IDs
            </button>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Color by property
            </h2>
            <select
              className="w-full rounded bg-slate-800 px-2 py-1.5 text-sm"
              value={colorMode}
              onChange={(event) =>
                void onColorChange(event.target.value as ColorByMode)
              }
            >
              <option value="none">None</option>
              <option value="manufacturer">Manufacturer</option>
              <option value="reference">Reference</option>
            </select>
            <ul className="max-h-36 space-y-1 overflow-auto text-xs">
              {legend.map((entry) => (
                <li key={entry.value} className="flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 rounded-sm"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="truncate">{entry.value}</span>
                  <span className="ml-auto text-slate-500">{entry.count}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Storeys
            </h2>
            <button
              type="button"
              className="text-xs text-sky-400"
              onClick={() => void viewerRef.current?.showAllStoreys().then(refreshSideData)}
            >
              Show all
            </button>
            <ul className="max-h-40 space-y-1 overflow-auto text-sm">
              {storeys.map((storey) => (
                <li key={storey.name}>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={storey.visible}
                      onChange={(event) =>
                        void viewerRef.current
                          ?.setStoreyVisible(storey.name, event.target.checked)
                          .then(refreshSideData)
                      }
                    />
                    <span className="truncate">{storey.name}</span>
                  </label>
                </li>
              ))}
              {storeys.length === 0 && (
                <li className="text-xs text-slate-500">Load a model first.</li>
              )}
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Section cuts
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 rounded bg-slate-800 px-2 py-1.5 text-xs"
                onClick={() =>
                  void viewerRef.current?.addClip().then(refreshSideData)
                }
              >
                Add plane
              </button>
              <button
                type="button"
                className="flex-1 rounded bg-slate-800 px-2 py-1.5 text-xs"
                onClick={() => {
                  viewerRef.current?.deleteAllClips();
                  refreshSideData();
                }}
              >
                Remove all
              </button>
            </div>
            <ul className="space-y-1 text-xs">
              {clips.map((clip, index) => (
                <li key={clip.id} className="flex items-center gap-2">
                  <span>Plane {index + 1}</span>
                  <label className="ml-auto flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={clip.enabled}
                      onChange={(event) => {
                        viewerRef.current?.setClipEnabled(
                          clip.id,
                          event.target.checked,
                        );
                        refreshSideData();
                      }}
                    />
                    on
                  </label>
                  <button
                    type="button"
                    className="text-red-400"
                    onClick={() =>
                      void viewerRef.current
                        ?.removeClip(clip.id)
                        .then(refreshSideData)
                    }
                  >
                    remove
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Measure (feet-inches)
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 rounded bg-slate-800 px-2 py-1.5 text-xs"
                onClick={() => {
                  applyMode("measure");
                  void viewerRef.current?.createMeasurement().then(refreshSideData);
                }}
              >
                Pick point
              </button>
              <button
                type="button"
                className="flex-1 rounded bg-slate-800 px-2 py-1.5 text-xs"
                onClick={() => {
                  viewerRef.current?.clearMeasurements();
                  refreshSideData();
                }}
              >
                Clear
              </button>
            </div>
            <ul className="text-sm">
              {measurements.map((item) => (
                <li key={item.id}>{item.label}</li>
              ))}
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Issue pin (BCF)
            </h2>
            <input
              className="w-full rounded bg-slate-800 px-2 py-1.5 text-sm"
              placeholder="Title"
              value={issueTitle}
              onChange={(event) => setIssueTitle(event.target.value)}
            />
            <textarea
              className="w-full rounded bg-slate-800 px-2 py-1.5 text-sm"
              placeholder="Comment"
              rows={2}
              value={issueComment}
              onChange={(event) => setIssueComment(event.target.value)}
            />
            <button
              type="button"
              className="w-full rounded bg-amber-700 px-3 py-1.5 text-sm hover:bg-amber-600"
              onClick={() => void saveIssue()}
            >
              Save pin + viewpoint
            </button>
            <button
              type="button"
              className="w-full rounded bg-slate-800 px-3 py-1.5 text-sm"
              onClick={() =>
                void viewerRef.current?.exportBcf().then((result) => {
                  setStatus(result.note);
                })
              }
            >
              Export .bcf
            </button>
            <ul className="max-h-40 space-y-2 overflow-auto text-xs">
              {issues.map((issue) => (
                <li key={issue.topicGuid} className="rounded bg-slate-800 p-2">
                  <button
                    type="button"
                    className="text-left text-sky-300"
                    onClick={() =>
                      void viewerRef.current?.restoreIssue(issue.topicGuid)
                    }
                  >
                    {issue.title}
                  </button>
                  <div className="text-slate-400">{issue.comment}</div>
                  {issue.snapshotUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={issue.snapshotUrl}
                      alt=""
                      className="mt-1 max-h-20 rounded"
                    />
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-2 pb-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Metrics
            </h2>
            {metrics ? (
              <dl className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                <dt className="text-slate-500">File</dt>
                <dd className="truncate">{metrics.fileName}</dd>
                <dt className="text-slate-500">Size</dt>
                <dd>{formatMb(metrics.fileSizeMb)}</dd>
                <dt className="text-slate-500">Format</dt>
                <dd>{metrics.format}</dd>
                <dt className="text-slate-500">Conversion</dt>
                <dd>
                  {metrics.conversionTimeMs === null
                    ? "n/a"
                    : `${metrics.conversionTimeMs} ms`}
                </dd>
                <dt className="text-slate-500">First render</dt>
                <dd>
                  {metrics.timeToFirstRenderMs === null
                    ? "n/a"
                    : `${metrics.timeToFirstRenderMs} ms`}
                </dd>
                <dt className="text-slate-500">Elements</dt>
                <dd>{metrics.elementCount ?? "n/a"}</dd>
                <dt className="text-slate-500">Triangles</dt>
                <dd>{metrics.triangleCount ?? "n/a"}</dd>
                <dt className="text-slate-500">JS heap</dt>
                <dd>{formatMb(metrics.jsHeapMb)}</dd>
                <dt className="text-slate-500">Avg FPS</dt>
                <dd>
                  {metrics.avgFps === null ? "not run" : metrics.avgFps.toFixed(1)}
                </dd>
              </dl>
            ) : (
              <p className="text-xs text-slate-500">Load a model to record a run.</p>
            )}
            <button
              type="button"
              className="w-full rounded bg-slate-800 px-3 py-1.5 text-sm disabled:opacity-50"
              onClick={() => void runFps()}
              disabled={!metrics || busy}
            >
              Run 10s orbit FPS
            </button>
            <p className="text-xs text-slate-500">{metricsNote}</p>
            <p className="text-[10px] leading-relaxed text-slate-600">{versions}</p>
          </section>
        </aside>

        <main className="relative min-w-0 flex-1">
          <div
            ref={canvasHostRef}
            className="absolute inset-0 touch-none"
            style={{ touchAction: "none" }}
          />
          {!ready && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
              Starting client-only viewer…
            </div>
          )}
        </main>

        <aside
          className={`${
            mobilePanel === "props" ? "flex" : "hidden"
          } w-full shrink-0 flex-col overflow-y-auto border-l border-slate-800 bg-slate-900/80 p-3 md:flex md:w-80`}
        >
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Selection
            </h2>
            <button
              type="button"
              className="text-xs text-sky-400 md:hidden"
              onClick={() => setMobilePanel("tools")}
            >
              Tools
            </button>
          </div>
          {selection.length === 0 && (
            <p className="text-sm text-slate-500">
              Tap an element. Multi-select + copy IDs for a comma-separated
              express ID list.
            </p>
          )}
          {selection.map((item) => (
            <article
              key={`${item.modelId}-${item.localId}`}
              className="mb-4 rounded-md border border-slate-800 p-2"
            >
              <div className="text-sm font-medium">{item.entityType}</div>
              <div className="text-xs text-slate-400">#{item.expressId}</div>
              <div className="text-xs">
                <span className="text-slate-500">GlobalId </span>
                {item.globalId || "—"}
              </div>
              <div className="text-xs">
                <span className="text-slate-500">Name </span>
                {item.name || "—"}
              </div>
              <table className="mt-2 w-full text-xs">
                <tbody>
                  {item.properties.map((row, index) => (
                    <tr
                      key={`${row.psetName}-${row.name}-${index}`}
                      className={row.highlight ? "bg-amber-900/40" : undefined}
                    >
                      <td className="pr-2 align-top text-slate-500">
                        {row.psetName}
                      </td>
                      <td className="pr-2 align-top">{row.name}</td>
                      <td className="align-top">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>
          ))}
          <button
            type="button"
            className="mt-auto rounded bg-slate-800 px-3 py-2 text-sm md:hidden"
            onClick={() => setMobilePanel("tools")}
          >
            Back to tools
          </button>
        </aside>
      </div>

      <button
        type="button"
        className="fixed bottom-4 right-4 z-20 rounded-full bg-sky-600 px-4 py-2 text-sm shadow md:hidden"
        onClick={() =>
          setMobilePanel((current) => (current === "props" ? "tools" : "props"))
        }
      >
        {mobilePanel === "props" ? "Tools" : "Properties"}
      </button>
    </div>
  );
}
