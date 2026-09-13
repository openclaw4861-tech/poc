import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { desc } from "drizzle-orm";
import { bimTestRuns, type NewBimTestRun } from "@/db/schema";

const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS "bim_test_runs" (
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
);
`;

const CREATE_INDEX_SQL = `
CREATE INDEX IF NOT EXISTS "idx_bim_test_runs_created_at" ON "bim_test_runs" ("created_at");
`;

function getDatabaseUrl(): string | null {
  const url = process.env.DATABASE_URL;
  return url && url.length > 0 ? url : null;
}

async function getClient() {
  const url = getDatabaseUrl();
  if (!url) {
    return null;
  }
  const sql = neon(url);
  await sql.query(CREATE_TABLE_SQL, []);
  await sql.query(CREATE_INDEX_SQL, []);
  return drizzle(sql, { schema: { bimTestRuns } });
}

function isFormat(value: unknown): value is "ifc" | "frag" {
  return value === "ifc" || value === "frag";
}

function asFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function asOptionalInt(value: unknown): number | null {
  const parsed = asFiniteNumber(value);
  return parsed === null ? null : Math.round(parsed);
}

export async function GET() {
  try {
    const db = await getClient();
    if (!db) {
      return NextResponse.json(
        { success: false, error: "DATABASE_URL is not set" },
        { status: 503 },
      );
    }

    const rows = await db
      .select()
      .from(bimTestRuns)
      .orderBy(desc(bimTestRuns.createdAt))
      .limit(200);

    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching BIM test runs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch BIM test runs" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getClient();
    if (!db) {
      return NextResponse.json(
        { success: false, error: "DATABASE_URL is not set" },
        { status: 503 },
      );
    }

    const body: unknown = await request.json();
    if (typeof body !== "object" || body === null) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400 },
      );
    }

    const payload = body as Record<string, unknown>;
    const fileName =
      typeof payload.fileName === "string" ? payload.fileName.trim() : "";
    const format = payload.format;
    const fileSizeMb = asFiniteNumber(payload.fileSizeMb);

    if (!fileName || !isFormat(format) || fileSizeMb === null) {
      return NextResponse.json(
        {
          success: false,
          error: "fileName, format (ifc|frag), and fileSizeMb are required",
        },
        { status: 400 },
      );
    }

    const userAgentHeader = request.headers.get("user-agent") ?? "";
    const userAgent =
      typeof payload.userAgent === "string" && payload.userAgent.length > 0
        ? payload.userAgent
        : userAgentHeader;

    const row: NewBimTestRun = {
      userAgent,
      fileName: fileName.slice(0, 512),
      fileSizeMb: fileSizeMb.toFixed(4),
      format,
      conversionTimeMs: asOptionalInt(payload.conversionTimeMs),
      timeToFirstRenderMs: asOptionalInt(payload.timeToFirstRenderMs),
      elementCount: asOptionalInt(payload.elementCount),
      triangleCount: asOptionalInt(payload.triangleCount),
      jsHeapMb:
        asFiniteNumber(payload.jsHeapMb) === null
          ? null
          : asFiniteNumber(payload.jsHeapMb)!.toFixed(4),
      avgFps:
        asFiniteNumber(payload.avgFps) === null
          ? null
          : asFiniteNumber(payload.avgFps)!.toFixed(2),
      notes: typeof payload.notes === "string" ? payload.notes : null,
    };

    const [created] = await db.insert(bimTestRuns).values(row).returning();
    return NextResponse.json({ success: true, data: created });
  } catch (error) {
    console.error("Error saving BIM test run:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save BIM test run" },
      { status: 500 },
    );
  }
}
