# BIM viewer test report

Client-only `/bim-test` module for PGC Field Tools. Uses That Open Engine to view IFC/fragments in the browser. Model geometry and IFC property values are never uploaded or stored in Neon.

## What was built

- Route `/bim-test` (App Router) with `next/dynamic` + `ssr: false`.
- Past-run list at `/bim-test/runs`.
- Homepage links: Tools dropdown, hero button, Available Tools card.
- Browser-only IFC → Fragments conversion, `.frag` download, IndexedDB cache keyed by name+size+mtime.
- Selection + property panel (entity type, express ID, GlobalId, Name, all property sets). Manufacturer and `Pset_BuildingElementProxyCommon.Reference` are highlighted.
- Multi-select + copy comma-separated express IDs.
- Color by Manufacturer or Reference, with a legend.
- Isolate by `IfcBuildingStorey`.
- Add / enable / remove clipping planes (drag handles come from That Open `SimplePlane`).
- Length measure displayed as feet-and-inches (model units are feet).
- BCF issue pins: title, comment, viewpoint + screenshot, restore camera, export `.bcf`.
- Metrics panel + Neon `bim_test_runs` (name/size/timings/counts only).

## Files

| Path | Role |
| --- | --- |
| `src/app/bim-test/page.tsx` | Server page; dynamic client import |
| `src/app/bim-test/runs/page.tsx` | Past metrics table |
| `src/app/api/bim-test/runs/route.ts` | GET/POST metrics (creates table if missing) |
| `src/bim-test/*` | Viewer module (engine, UI, cache, properties) |
| `scripts/copy-bim-assets.mjs` | postinstall: copy pinned wasm + worker → `/public/bim-test` |
| `public/bim-test/wasm/` | Self-hosted `web-ifc@0.0.77` WASM |
| `public/bim-test/worker/worker.mjs` | Self-hosted `@thatopen/fragments@3.4.7` worker |
| `drizzle/0003_bim_test_runs.sql` | Metrics table |
| `src/db/schema.ts` | `bimTestRuns` |
| `src/app/page.tsx` | Homepage links |

No `.ifc` / `.frag` / `.bcf` model files are committed (see `.gitignore`).

## Exact versions (pinned, no ^ or ~)

| Package | Version |
| --- | --- |
| `@thatopen/components` | 3.4.8 |
| `@thatopen/components-front` | 3.4.4 |
| `@thatopen/fragments` | 3.4.7 |
| `web-ifc` | 0.0.77 |
| `three` | 0.182.0 |
| `camera-controls` | 3.1.2 |
| `@types/three` (dev) | 0.182.0 |

`three@0.182.0` is the lowest 0.18x release that satisfies every peer (`>=0.182.0`). `camera-controls@3.1.2` is the lowest (and current) 3.1.x that satisfies `>=3.1.2`. `@thatopen/ui` / `@thatopen/ui-obc` were not added; panels are Tailwind.

`postinstall` copies WASM/worker from the installed `node_modules` versions and refuses to copy if `web-ifc` ≠ 0.0.77 or `@thatopen/fragments` ≠ 3.4.7.

## Public sample IFC

Documented demo URL (fetched in the browser only; never stored on this server):

`https://thatopen.github.io/engine_components/resources/ifc/school_str.ifc`

Source: That Open `engine_components` tutorial resources (`school_str.ifc`). The “Load public sample IFC” button `fetch`es this URL on the client and converts it locally. Project/client models must be picked as local files.

## API mismatches / doc gaps

Trusted installed `.d.ts` when docs disagreed.

1. **Docs recommend `FragmentsManager.getWorker()` (unpkg blob URL).** Requirement is to self-host. `.d.ts` documents that `init(workerURL)` accepts any URL. We pass `/bim-test/worker/worker.mjs`.
2. **Docs show IfcLoader WASM on unpkg.** `.d.ts` `IfcFragmentSettings.wasm` is `{ path, absolute, logLevel? }`. We set `autoSetWasm: false` and `path: "/bim-test/wasm/"`.
3. **`LengthMeasurement` units are metric only** (`"mm" \| "cm" \| "m" \| "km"` on `MeasureToUnitMap.length` and `Line.units`). There is no feet unit. World length is already feet (Revit export). We set `Measurement.valueFormatter` (present on `.d.ts`, not emphasized in the tutorial) to `formatFeetAndInches`.
4. **`ItemAttribute.value` is typed as `any` in `@thatopen/fragments`.** Our code immediately treats it as `unknown` and never uses `any` in first-party files.
5. **Highlighter multi-select is only `ctrlKey` / `shiftKey` / `none`.** No “always accumulate” flag. iPad uses a Multi-select checkbox that merges maps after `onHighlight`.
6. **Measure/clip tutorials use `dblclick`.** iPad cannot rely on that. Pointer tap (no drag) also calls `create()`.
7. **`BCFTopics.export()` returns `Promise<Blob>`.** Tutorial treats it as a real `.bcf` zip. If export throws, we write a JSON fallback and record the gap. Confirm the blob in Solibri/BIMCollab before calling this production-ready.
8. **Docs Highlighter examples use `PostproductionRenderer`.** We use `SimpleRenderer` to reduce iOS memory. Selection/clip/measure `.d.ts` do not require postproduction.
9. **Classifier docs use `@thatopen/ui` tables.** We read `classifier.list.get("Levels")` and `Hider.set` directly.

## Known Revit export quirks (not treated as loader bugs)

- Units are **feet**.
- ~89 `IfcCurtainWall` entities may be empty shells; members hang off storeys.
- Many `IfcBuildingElementProxy`.
- No base quantities / `Qto_` sets expected.

## Metrics table (fill on device)

Neon table `bim_test_runs`. Columns: user agent, file name, size MB, format, conversion ms, time-to-first-render ms, element count, triangle count, JS heap MB (null on Safari), average FPS for a scripted 10s orbit, notes. No property values or file bytes.

| Device | Browser | Format | File | Size MB | Conv ms | TTFRms | Elements | Tris | Heap MB | Avg FPS | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Desktop | Chrome | IFC | | | | | | | | | |
| Desktop | Chrome | FRAG | | | | | | | | | |
| iPad | Safari | IFC | | | | | | | | | |
| iPad | Safari | FRAG | | | | | | | | | |

Use **Run 10s orbit FPS** after load, then check `/bim-test/runs`. Safari heap is expected `n/a` (`performance.memory` is Chrome-only).

## Bundle size (`/bim-test`)

Recorded from `next build` First Load JS for the bim-test route (fill after CI/local build):

| Route | Approx. JS | Notes |
| --- | --- | --- |
| `/bim-test` | **~7.0 MB** first load (6.57 MB dynamic That Open/three chunks + ~0.43 MB shared Next/React) | Engine is in the `BimTestApp` dynamic import only |
| `/bim-test/runs` | ~0.2 KB page chunk + shared | Server table; no engine |

Static `/public` assets (not JS bundle): `web-ifc.wasm` 1.24 MB, `web-ifc-mt.wasm` 1.25 MB, `worker.mjs` 3.19 MB. Total extra download on first viewer init ≈ 5.7 MB.

## Workarounds

- **WASM / worker:** `postinstall` and `prebuild` copy exact installed files into `public/bim-test` (needed because the Docker `deps` stage runs `npm ci` before `COPY . .`). Runtime never hits unpkg/jsDelivr. Only `worker.mjs` is copied (not the min bundle).
- **Next config:** `transpilePackages` for That Open / three / camera-controls. Webpack aliases `three/webgpu` and `three/tsl` because That Open imports those subpaths and webpack does not honor `three` package `exports` the same way as Vite. `fallback.fs/path/crypto = false`. `serverExternalPackages` stays `pdf-parse` only (`web-ifc` cannot be both transpiled and external). Next 16 defaults to Turbopack and errors if a `webpack` function exists without a `turbopack` config — `dev` / `build` scripts pass `--webpack`.
- **SSR:** Next 16 forbids `next/dynamic({ ssr: false })` inside Server Components. `src/app/bim-test/page.tsx` is a thin server page that renders `BimTestPageClient.tsx` (`"use client"` + `dynamic(..., { ssr: false })`). `BimTestApp` dynamically `import()`s `createViewer` so the chrome renders before the ~7 MB engine chunk. Next 16 blocks `/_next/*` from `127.0.0.1` when the server is bound as `localhost` unless `allowedDevOrigins` includes it.
- **WebGL:** `SimpleRenderer` needs a GPU/WebGL context. Headless Chrome without GPU reports `Error creating WebGL context` in the status line; the chrome still renders. Real desktop/iPad Safari must have WebGL enabled.
- **iOS memory:** `SimpleRenderer` (no postproduction composer); triangle counting skipped above 40k geometry items; convert-once + IndexedDB `.frag` cache; prefer loading `.frag` on iPad after a desktop conversion.
- **Touch:** canvas `touch-action: none`; `camera-controls` orbit / pan / pinch; tap-to-select via Highlighter mouse events (iOS synthesizes them); measure/clip also on tap.
- **DB:** API and runs page `CREATE TABLE IF NOT EXISTS` so DigitalOcean does not need a separate migrate step. If `DATABASE_URL` is missing, the viewer still works and metrics stay on-screen.

## What to change before production Hub use

1. Do not ship this as the Hub viewer without auth, project scoping, and a fragments pipeline that runs **once** (not per session) — still client-side or a trusted worker, never persist IFC bytes/properties to Neon.
2. Replace the public school sample with an internal, non-confidential sample or no sample at all.
3. Pre-convert Revit IFC → `.frag` for iPad; do not expect large IFC conversion to survive Safari memory limits.
4. Confirm `BCFTopics.export()` blobs open in the BCF tools the field uses; add viewpoint component GUIDs + clipping serialization tests.
5. Decide whether `PostproductionRenderer` / outline/SAO is worth the iPad cost.
6. Map express ID vs fragments `localId` against a known Revit export (we display `expressID` when present, else `localId`).
7. Add automated Playwright smoke (load public sample, select, measure) on desktop Chrome.
8. Pin and audit That Open upgrades together (`components` / `components-front` / `fragments` / `web-ifc` / `three`).
9. Production metrics should be opt-in and should still never store property values.
10. Consider a dedicated fragments worker origin with correct COOP/COEP if you later enable `SharedArrayBuffer`.
