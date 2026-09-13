import Link from "next/link";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { desc } from "drizzle-orm";
import { bimTestRuns } from "@/db/schema";

export const dynamic = "force-dynamic";

async function loadRuns() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    return { error: "DATABASE_URL is not set", rows: [] as typeof bimTestRuns.$inferSelect[] };
  }
  try {
    const sql = neon(url);
    await sql.query(
      `CREATE TABLE IF NOT EXISTS "bim_test_runs" (
        "id" SERIAL PRIMARY KEY,
        "user_agent" TEXT NOT NULL,
        "file_name" VARCHAR(512) NOT NULL,
        "file_size_mb" DECIMAL(12, 4) NOT NULL,
        "format" VARCHAR(8) NOT NULL,
        "conversion_time_ms" INTEGER,
        "time_to_first_render_ms" INTEGER,
        "element_count" INTEGER,
        "triangle_count" INTEGER,
        "js_heap_mb" DECIMAL(12, 4),
        "avg_fps" DECIMAL(8, 2),
        "notes" TEXT,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
      )`,
      [],
    );
    const db = drizzle(sql, { schema: { bimTestRuns } });
    const rows = await db
      .select()
      .from(bimTestRuns)
      .orderBy(desc(bimTestRuns.createdAt))
      .limit(200);
    return { error: null, rows };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to load runs",
      rows: [] as typeof bimTestRuns.$inferSelect[],
    };
  }
}

function shortAgent(value: string): string {
  if (value.includes("iPad")) {
    return "iPad Safari / iOS";
  }
  if (value.includes("Chrome")) {
    return "Chrome";
  }
  if (value.includes("Safari")) {
    return "Safari";
  }
  if (value.includes("Firefox")) {
    return "Firefox";
  }
  return value.slice(0, 48);
}

export default async function BimTestRunsPage() {
  const { error, rows } = await loadRuns();

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold text-blue-600">BIM test runs</h1>
          <div className="flex gap-4 text-sm">
            <Link href="/bim-test" className="text-blue-600 hover:underline">
              Open viewer
            </Link>
            <Link href="/" className="text-gray-600 hover:underline">
              Home
            </Link>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <p className="mb-6 text-sm text-gray-600">
          One row per load/orbit run. Columns are file name, size, timings, and
          counts — never IFC property values or file bytes.
        </p>
        {error && (
          <div className="mb-4 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {error}
          </div>
        )}
        <div className="overflow-x-auto rounded-lg bg-white shadow">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-3 py-2">When</th>
                <th className="px-3 py-2">Device</th>
                <th className="px-3 py-2">File</th>
                <th className="px-3 py-2">MB</th>
                <th className="px-3 py-2">Fmt</th>
                <th className="px-3 py-2">Conv ms</th>
                <th className="px-3 py-2">Render ms</th>
                <th className="px-3 py-2">Elems</th>
                <th className="px-3 py-2">Tris</th>
                <th className="px-3 py-2">Heap MB</th>
                <th className="px-3 py-2">FPS</th>
                <th className="px-3 py-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-gray-500" colSpan={12}>
                    No runs yet. Load a model on /bim-test to create a row.
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-gray-100">
                  <td className="whitespace-nowrap px-3 py-2">
                    {row.createdAt instanceof Date
                      ? row.createdAt.toISOString()
                      : String(row.createdAt)}
                  </td>
                  <td className="px-3 py-2">{shortAgent(row.userAgent)}</td>
                  <td className="px-3 py-2">{row.fileName}</td>
                  <td className="px-3 py-2">{row.fileSizeMb}</td>
                  <td className="px-3 py-2">{row.format}</td>
                  <td className="px-3 py-2">{row.conversionTimeMs ?? "—"}</td>
                  <td className="px-3 py-2">{row.timeToFirstRenderMs ?? "—"}</td>
                  <td className="px-3 py-2">{row.elementCount ?? "—"}</td>
                  <td className="px-3 py-2">{row.triangleCount ?? "—"}</td>
                  <td className="px-3 py-2">{row.jsHeapMb ?? "—"}</td>
                  <td className="px-3 py-2">{row.avgFps ?? "—"}</td>
                  <td className="max-w-xs truncate px-3 py-2" title={row.notes ?? ""}>
                    {row.notes ?? ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
