const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

const migration = `
-- Create tasks table
CREATE TABLE IF NOT EXISTS "tasks" (
  "id" serial PRIMARY KEY NOT NULL,
  "text" varchar(255) DEFAULT 'not null',
  "start" varchar(20),
  "end" varchar(20),
  "duration" integer DEFAULT 0 NOT NULL,
  "progress" integer DEFAULT 0 NOT NULL,
  "type" varchar(20),
  "parent" integer DEFAULT 0 NOT NULL,
  "order_id" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create links table
CREATE TABLE IF NOT EXISTS "links" (
  "id" serial PRIMARY KEY NOT NULL,
  "source" integer NOT NULL,
  "target" integer NOT NULL,
  "type" varchar(10) DEFAULT 'not null',
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "idx_tasks_parent" ON "tasks" ("parent");
CREATE INDEX IF NOT EXISTS "idx_tasks_order_id" ON "tasks" ("order_id");
CREATE INDEX IF NOT EXISTS "idx_links_source" ON "links" ("source");
CREATE INDEX IF NOT EXISTS "idx_links_target" ON "links" ("target");
`;

async function apply() {
  try {
    await sql(migration);
    console.log('Migration applied successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error applying migration:', error.message);
    process.exit(1);
  }
}

apply();
