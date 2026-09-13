-- BIM viewer test metrics. Stores run metadata only — never IFC bytes or property values.
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

CREATE INDEX IF NOT EXISTS "idx_bim_test_runs_created_at" ON "bim_test_runs" ("created_at");
