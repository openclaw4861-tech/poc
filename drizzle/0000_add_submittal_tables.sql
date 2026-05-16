-- Migration: add_submittal_tables
-- Created: 2026-05-16

-- Create submittal_checklists table
CREATE TABLE IF NOT EXISTS "submittal_checklists" (
  "id" SERIAL PRIMARY KEY,
  "project_id" VARCHAR(255) NOT NULL,
  "pdf_file_path" VARCHAR(500) NOT NULL,
  "pdf_uploaded_at" TIMESTAMP NOT NULL,
  "extracted_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index on project_id
CREATE INDEX IF NOT EXISTS "idx_submittal_project_id" ON "submittal_checklists" ("project_id");

-- Create submittal_items table
CREATE TABLE IF NOT EXISTS "submittal_items" (
  "id" SERIAL PRIMARY KEY,
  "checklist_id" INTEGER NOT NULL REFERENCES "submittal_checklists"("id") ON DELETE CASCADE,
  "spec_section" VARCHAR(50) NOT NULL,
  "spec_subsection" VARCHAR(50),
  "requirement_type" VARCHAR(100),
  "description" TEXT NOT NULL,
  "details" TEXT,
  "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
  "user_notes" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes on submittal_items
CREATE INDEX IF NOT EXISTS "idx_submittal_checklist_id" ON "submittal_items" ("checklist_id");
CREATE INDEX IF NOT EXISTS "idx_submittal_spec_section" ON "submittal_items" ("spec_section");
