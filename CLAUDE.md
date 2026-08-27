# StoryHouse

A story-sharing platform: users sign up, publish stories, comment, and like; admins moderate users/stories/comments from an admin panel.

**Stack:** **NestJS 11 + Prisma + PostgreSQL** (`backend/`) and **Angular + Tailwind v4** (`frontend/`). The repo was rewritten in place from an Express 5 + Sequelize + React/Vite app; that rewrite is complete and the old code has been deleted (it remains in git history).

@.claude/rules/00-migration-workflow.md
@.claude/rules/20-rest-api.md

## Layout

| Path | Contents |
|---|---|
| `backend/` | NestJS API (rules: `backend/CLAUDE.md`) |
| `frontend/` | Angular app (rules: `frontend/CLAUDE.md`) |
| `docs/API_CONTRACT.md` | **Authoritative** HTTP contract for both sides |
| `docs/MIGRATION_PLAN.md` | Historical record of the rewrite — settled decisions, phase by phase |

## Commands (run inside the workspace folder, not repo root)

- Backend: `npm run start:dev` · `npm run lint` · `npx tsc --noEmit` · `npm test` · `npx prisma migrate dev` / `validate` / `db seed` — Swagger UI at `/api/docs`
- Frontend: `npm start` · `npm run lint` · `npm run build` · `npm test`

## Project automation already in place

- **Skills**: `/nest-module <name>` (scaffold a backend module to the rules), `/ng-feature <name>` (scaffold a frontend feature to the rules).
- **Agents**: `nest-backend-dev`, `angular-frontend-dev`, `migration-reviewer` (adversarial review of completed work).
- **Hooks** (`.claude/hooks/`): Prettier auto-format on edit; destructive git commands always prompt; Stop is blocked until edited code has been lint/typecheck/tested.
