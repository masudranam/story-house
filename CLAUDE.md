# StoryHouse

A story-sharing platform: users sign up, publish stories, comment, and like; admins moderate users/stories/comments from an admin panel.

**The repo is mid-rewrite.** Old stack (Express 5 + Sequelize + React/Vite) is being replaced in place by **NestJS 11 + Prisma + PostgreSQL** (`backend/`) and **Angular + Tailwind v4** (`frontend/`). The old code is kept at `legacy/` as read-only reference until parity is proven, then deleted.

@.claude/rules/00-migration-workflow.md
@.claude/rules/20-rest-api.md

## Layout

| Path | Contents |
|---|---|
| `backend/` | NestJS API (rules: `backend/CLAUDE.md`) |
| `frontend/` | Angular app (rules: `frontend/CLAUDE.md`) |
| `legacy/` | Old Express + React app — **never edit, reference only** |
| `docs/MIGRATION_PLAN.md` | Authoritative task list — work top-to-bottom, keep checkboxes current |
| `docs/API_CONTRACT.md` | Authoritative HTTP contract for both sides |

If `legacy/` doesn't exist yet, Phase 0 of the plan (move + scaffold) hasn't run.

## Commands (run inside the workspace folder, not repo root)

- Backend: `npm run start:dev` · `npm run lint` · `npx tsc --noEmit` · `npm test` · `npx prisma migrate dev` / `validate` / `db seed` — Swagger UI at `/api/docs`
- Frontend: `npm start` · `npm run lint` · `npm run build` · `npm test`

## Project automation already in place

- **Skills**: `/migrate-next` (execute next plan phase end-to-end), `/nest-module <name>`, `/ng-feature <name>`, `/parity-check [area]`.
- **Agents**: `legacy-analyst` (how did the old app behave?), `nest-backend-dev`, `angular-frontend-dev`, `migration-reviewer` (run after each phase).
- **Hooks** (`.claude/hooks/`): Prettier auto-format on edit; destructive git commands always prompt; Stop is blocked until edited code has been lint/typecheck/tested; session start injects migration progress.
