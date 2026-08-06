# Workflow (always applies)

StoryHouse is **NestJS 11 + Prisma + PostgreSQL** (`backend/`) and **Angular + Tailwind v4** (`frontend/`). The rewrite from the original Express/React app is complete; `docs/MIGRATION_PLAN.md` records how it was done and every decision that was settled along the way.

## Ground rules

- `docs/API_CONTRACT.md` is the authoritative HTTP contract. Changing behavior means updating that file, the Swagger decorators, and the Angular API services **in the same task** — never one without the others.
- `docs/MIGRATION_PLAN.md` is a historical record now. Don't add tasks to it; it documents what was decided and why, and its "Decisions (settled)" section still binds — don't relitigate those.
- One task = one coherent, verified change. Don't start a task you can't verify.
- Deliberate departures from the original app's behavior are catalogued in the contract's "Deliberate UI changes" and "Deliberately removed legacy endpoints" sections. Those were fixes. Don't reintroduce the behavior they replaced.

## Verification (non-negotiable, enforced by a Stop hook)

Before reporting any task done:
- Backend: `npm run lint`, `npx tsc --noEmit`, and `npm test` (in `backend/`), plus `npx prisma validate` when the schema changed.
- Frontend: `npm run lint` and `npm run build` (in `frontend/`), plus `npm test` when logic changed.
- If a check fails, fix it or report the failure verbatim. Never claim success without running the checks.

## Environment

- Windows 11; PowerShell 5.1 has no `&&` — chain with `;` or use the Bash tool.
- Run npm scripts from the workspace folder they belong to (`backend/` or `frontend/`), not the repo root.
- Never read or print `.env` contents. `backend/.env.example` documents required variables — keep it updated whenever a new env var is introduced.
- Commit only when asked. Migration commits follow `feat(scope): message` conventional style.
