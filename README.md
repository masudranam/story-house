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
# 1. Database (host port 5434 — this machine's own PostgreSQL owns 5432)
docker compose up -d postgres

# 2. Backend — http://localhost:3000, Swagger at /api/docs
cd backend
cp .env.example .env        # generate the two JWT secrets — see backend/README.md
npm install
npx prisma migrate dev
npx prisma db seed          # optional: admin + sample content
npm run start:dev

# 3. Frontend — http://localhost:4200 (proxies /api to the backend)
cd frontend
npm install
npm start
```

Default seeded login: `admin` / `Password123!` (dev only — see `backend/prisma/seed.ts`).

## Features

Sign up and log in (username **or** email), publish/edit/delete your own stories, comment, and like — with a paginated searchable feed, public profiles, account settings, and an admin panel (dashboard stats, user/story/comment moderation). Rotating refresh tokens keep sessions alive; changing your password signs every other session out immediately.

## Development

- API contract: [docs/API_CONTRACT.md](docs/API_CONTRACT.md) — authoritative for backend and frontend.
- Migration status/plan: [docs/MIGRATION_PLAN.md](docs/MIGRATION_PLAN.md).
- Backend checks: `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run test:e2e` (in `backend/`).
- Frontend checks: `npm run lint`, `npm run build`, `npm test` (in `frontend/`).
- Conventions live in [.claude/rules/](.claude/rules/) and are enforced by hooks; `/migrate-next` drives remaining plan work.
