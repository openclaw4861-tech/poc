# PoC Site

Proof of Concept project built with Next.js, TypeScript, and Tailwind CSS.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Package Manager:** npm
- **Database:** Neon (Serverless Postgres) - _to be configured_
- **ORM:** Drizzle - _to be configured_

## Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/openclaw4861-tech/poc.git
   cd poc
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your actual values (DATABASE_URL, etc.)

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Variables

See `.env.example` for required environment variables:

- `DATABASE_URL` - PostgreSQL connection string (Neon)
- `NODE_ENV` - Environment (`development`, `production`, `test`)

## API Endpoints

### Health Check
`GET /api/health`

Returns server status and timestamp.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-15T20:30:00.000Z",
  "environment": "development"
}
```

## Project Structure

```
poc-site/
├── src/
│   └── app/
│       ├── api/
│       │   └── health/       # Health check endpoint
│       ├── layout.tsx         # Root layout
│       └── page.tsx           # Home page
├── public/                    # Static assets
├── .env.example               # Environment template
├── package.json               # Dependencies
└── README.md                  # This file
```

## Development

- **Dev server:** `npm run dev`
- **Build:** `npm run build`
- **Start production:** `npm start`
- **Lint:** `npm run lint`

## Deployment

This project can be deployed to:
- Vercel (recommended)
- Any Node.js hosting platform
- Docker container

_CI/CD pipeline to be configured._

## Contributing

1. Create a feature branch: `git checkout -b feat/my-feature`
2. Make changes and commit: `git commit -m "feat: add my feature"`
3. Push branch: `git push origin feat/my-feature`
4. Open a Pull Request

## License

MIT
