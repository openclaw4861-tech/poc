# SVAR Gantt Chart Integration

This project now includes a fully functional SVAR React Gantt chart with:
- **Tasks table** - Store project tasks with start/end dates, progress, dependencies
- **Links table** - Define task dependencies (End-to-Start, Start-to-Start, etc.)
- **REST API** - Full CRUD operations for tasks and links
- **Interactive Gantt UI** - Drag-and-drop, zoom, and timeline view

## New Routes

| Route | Description |
|-------|-------------|
| `/` | Home page with tools navigation |
| `/gantt` | SVAR Gantt Chart page |
| `/api/tasks` | Tasks CRUD API |
| `/api/links` | Links CRUD API |

## API Endpoints

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks` | Update a task (supports move operation) |
| DELETE | `/api/tasks` | Delete a task |

### Links

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/links` | Get all links |
| POST | `/api/links` | Create a link |
| PUT | `/api/links` | Update a link |
| DELETE | `/api/links` | Delete a link |

## Database Schema

### Tasks Table

```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  text VARCHAR(255) NOT NULL,
  start VARCHAR(20) NOT NULL,
  end VARCHAR(20) NOT NULL,
  duration INTEGER DEFAULT 0 NOT NULL,
  progress INTEGER DEFAULT 0 NOT NULL,
  type VARCHAR(20),
  parent INTEGER DEFAULT 0 NOT NULL,
  order_id INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

### Links Table

```sql
CREATE TABLE links (
  id SERIAL PRIMARY KEY,
  source INTEGER NOT NULL,
  target INTEGER NOT NULL,
  type VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

## SVAR Gantt Features

- **Timeline View**: Day, week, month scales
- **Task Management**: Create, update, delete tasks
- **Dependencies**: Link tasks with different dependency types (e2s, s2s, e2e, s2e)
- **Drag and Drop**: Move tasks to reorder or change dates
- **Progress Tracking**: Visual progress bars
- **Milestone Support**: Mark important dates as milestones

## Deployment

This project can be deployed to:
- **DigitalOcean App Platform** (current hosting)
- **Vercel** (recommended for Next.js)
- Any Node.js hosting platform

After pushing to `main`, DigitalOcean App Platform will automatically rebuild and deploy.

## Environment Variables

Make sure these are set on your hosting platform:

```bash
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
```

## Testing

1. Navigate to `/gantt` on your deployed site
2. Try creating new tasks
3. Set up task dependencies
4. Drag tasks to reorder
5. Check database for persisted data
