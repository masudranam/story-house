# StoryHouse

A story-sharing platform: sign up, publish stories, comment and like, with an admin panel for moderating users, stories, and comments.

| Folder | Stack |
|---|---|
| `backend/` | NestJS 11 · Prisma · PostgreSQL · Swagger (`/api/docs`) |
| `frontend/` | Angular (standalone + signals) · Tailwind CSS v4 |
| `legacy/` | The previous Express/React implementation — reference only, removed when the migration completes (`docs/MIGRATION_PLAN.md`) |

## Prerequisites

- Node.js ≥ 20.19 and npm
- Docker (for PostgreSQL)

## Run it

```bash
# 1. Database
docker compose up -d postgres

# 2. Backend — http://localhost:3000, Swagger at /api/docs
cd backend
cp .env.example .env        # fill in secrets
npm install
npx prisma migrate dev
npm run start:dev

# 3. Frontend — http://localhost:4200 (proxies /api to the backend)
cd frontend
npm install
npm start
```

## Development

- API contract: [docs/API_CONTRACT.md](docs/API_CONTRACT.md) — authoritative for backend and frontend.
- Migration status/plan: [docs/MIGRATION_PLAN.md](docs/MIGRATION_PLAN.md).
- Backend checks: `npm run lint`, `npx tsc --noEmit`, `npm test` (in `backend/`).
- Frontend checks: `npm run lint`, `npm run build`, `npm test` (in `frontend/`).
