# Database Setup - Neon + Drizzle ORM

## Overview

This project uses:
- **Neon Database** (serverless Postgres)
- **Drizzle ORM** (TypeScript-first ORM)

## Environment Variables

Make sure `DATABASE_URL` is set in your environment:

```bash
export DATABASE_URL="postgresql://..."
```

## Database Schema

Located in `src/lib/db/schema.ts`:

```typescript
export const visitors = pgTable('visitors', {
  id: serial('id').primaryKey(),
  count: integer('count').notNull().default(0),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

## Available Scripts

```bash
# Push schema changes to database (no migration files)
npm run db:push

# Generate migration files
npm run db:generate

# Apply migrations
npm run db:migrate

# Open Drizzle Studio (database GUI)
npm run db:studio
```

## API Endpoints

### GET /api/visitors
Returns the current visitor count.

**Response:**
```json
{
  "count": 42
}
```

### POST /api/visitors
Increments and returns the visitor count.

**Response:**
```json
{
  "count": 43
}
```

## Landing Page Integration

The landing page automatically:
1. Increments the visitor count on load (POST /api/visitors)
2. Displays the count in a live counter section
3. Shows loading state while fetching

## Database Connection

Connection is managed in `src/lib/db/index.ts` using Neon's serverless driver:

```typescript
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
```

## Next Steps

- Add more tables (users, feedback, etc.)
- Implement proper error handling
- Add caching layer (Redis/Vercel KV)
- Set up automated backups
- Add database monitoring
