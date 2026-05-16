# Submittal Tracker

A tool for managing construction submittal requirements extracted from PDF specifications.

## Overview

The Submittal Tracker allows users to:
1. Upload PDF specification files
2. Automatically extract submittal requirements using AI (Ollama/Qwen 3.5)
3. Manage extracted items in an editable grid
4. Track status of each submittal (pending, submitted, approved, rejected, not_required)

## Features

### Database Schema
- **submittal_checklists**: Stores uploaded PDF specs and extraction metadata
- **submittal_items**: Individual submittal requirements extracted from specs

### API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/projects/:projectId/submittals/upload` | Upload PDF spec file |
| POST | `/api/projects/:projectId/submittals/extract` | Extract submittals from PDF using AI |
| GET | `/api/projects/:projectId/submittals` | Get all checklists with items |
| GET | `/api/projects/:projectId/submittals?checklistId=X` | Get specific checklist |
| POST | `/api/projects/:projectId/submittals/items` | Add new submittal item manually |
| PUT | `/api/projects/:projectId/submittals/:itemId` | Update submittal item |
| DELETE | `/api/projects/:projectId/submittals/:itemId` | Delete submittal item |

### Frontend UI
- Drag & drop PDF upload zone
- File upload status and info display
- "Extract Submittals" button (AI-powered)
- Editable grid with columns:
  - Section | Subsection | Type | Description | Details | Status | Notes | Actions
- Add row button for manual entries
- Save all changes button
- Project selector dropdown
- Auto-sort by spec_section, then spec_subsection

## Setup

### 1. Database Migration

Run the migration to create the required tables:

```bash
# Option A: Using drizzle-kit push (interactive)
npm run db:push

# Option B: Manual SQL (run against your PostgreSQL database)
psql $DATABASE_URL -f drizzle/0000_add_submittal_tables.sql
```

### 2. Environment Variables

Ensure the following environment variables are set:

```bash
# Required
DATABASE_URL=postgresql://user:password@host:5432/dbname

# For AI extraction (optional but recommended)
OLLAMA_API_KEY=your-api-key-here
```

### 3. Dependencies

The following packages are required:

```bash
npm install pdf-parse
```

## Usage

### Access the UI

Navigate to: `/projects/[projectId]/submittals`

Example: `http://localhost:3000/projects/proj-1/submittals`

### Workflow

1. **Upload PDF**: Drag & drop or click to upload a CSI specification PDF
2. **Extract**: Click "Extract Submittals" to use AI to parse the 1.5 SUBMITTALS section
3. **Review**: Review extracted items in the grid
4. **Edit**: Modify any fields as needed (section numbers, descriptions, etc.)
5. **Track**: Update status as submittals progress through review
6. **Add**: Manually add items that weren't auto-extracted

## File Storage

Uploaded PDFs are stored locally at:
```
/public/uploads/submittals/[projectId]/[timestamp]_[filename].pdf
```

For production, consider using cloud storage (S3, Vercel Blob, etc.).

## AI Extraction

The extraction service:
1. Parses PDF text using `pdf-parse`
2. Finds the "1.5 SUBMITTALS" section in CSI format
3. Calls Ollama Cloud API (Qwen 3.5) to extract structured data
4. Returns JSON array of submittal items

### Prompt Template

The AI is prompted to look for:
- Product data
- Shop drawings
- Samples
- Test reports
- Certificates
- Warranties
- Maintenance data

## Technical Details

- **Framework**: Next.js 16 App Router
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **PDF Parsing**: pdf-parse library
- **AI Model**: Ollama Qwen 3.5 (cloud)
- **Styling**: Tailwind CSS
- **TypeScript**: Full type safety throughout

## Future Enhancements

- [ ] Cloud storage integration (S3, Vercel Blob)
- [ ] Bulk status updates
- [ ] Export to CSV/Excel
- [ ] Email notifications for status changes
- [ ] Integration with project management tools
- [ ] OCR for scanned PDFs
- [ ] Multi-language support
- [ ] Attachment support (link actual submittal documents)
