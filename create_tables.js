import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './src/lib/db/schema.ts';

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function main() {
  console.log('Creating tasks table...');
  await db.execute(`
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
    )
  `);
  console.log('✓ tasks table created');

  console.log('Creating links table...');
  await db.execute(`
    CREATE TABLE IF NOT EXISTS "links" (
      "id" serial PRIMARY KEY NOT NULL,
      "source" integer NOT NULL,
      "target" integer NOT NULL,
      "type" varchar(10) DEFAULT 'not null',
      "created_at" timestamp DEFAULT now() NOT NULL
    )
  `);
  console.log('✓ links table created');

  console.log('Creating indexes...');
  await db.execute(`CREATE INDEX IF NOT EXISTS "idx_tasks_parent" ON "tasks" ("parent")`);
  await db.execute(`CREATE INDEX IF NOT EXISTS "idx_tasks_order_id" ON "tasks" ("order_id")`);
  await db.execute(`CREATE INDEX IF NOT EXISTS "idx_links_source" ON "links" ("source")`);
  await db.execute(`CREATE INDEX IF NOT EXISTS "idx_links_target" ON "links" ("target")`);
  console.log('✓ indexes created');

  console.log('Done! Tables created successfully.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
