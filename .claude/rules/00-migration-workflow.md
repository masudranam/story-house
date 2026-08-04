# Migration workflow (always applies)

StoryHouse is being rewritten in place: `backend/` → NestJS 11 + Prisma + PostgreSQL, `frontend/` → Angular (latest LTS) + Tailwind. The old Express/React code lives in `legacy/` during the migration and is **reference material only**.

## Ground rules

- `docs/MIGRATION_PLAN.md` is the single source of truth for what to do next. Work top-to-bottom through unchecked tasks. Check off (`- [x]`) every task you complete **in the same turn you complete it**.
- Never edit anything under `legacy/`. Read it to answer "how did the old app behave?" — then implement the behavior properly in the new stack. Do not copy legacy code style, response envelopes, or naming mistakes into the new code.
- Feature parity is defined by `docs/API_CONTRACT.md` (endpoints + behavior) and the UI inventory in the plan — not by line-by-line translation. Fix documented legacy quirks; don't reproduce them.
- One plan task = one coherent, verified change. Don't start a task you can't verify.
- The migration is finished only when `legacy/` can be deleted with nothing lost. If you discover behavior in `legacy/` that the plan/contract missed, add it to the plan as a new task instead of silently skipping it.

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
