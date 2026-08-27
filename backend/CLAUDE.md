# backend/ — NestJS API

Target stack: NestJS 11 + Prisma + PostgreSQL + Swagger + Jest. (If this folder still contains the old Express app — `app.ts`, `controller/`, `repository/` — Phase 0 of `docs/MIGRATION_PLAN.md` hasn't run yet; these rules describe the target.)

@../.claude/rules/10-backend-nestjs.md
@../.claude/rules/30-prisma.md
@../.claude/rules/50-testing.md

## Quick reference

- Dev server: `npm run start:dev` (Swagger at `http://localhost:3000/api/docs`)
- Definition of done: `npm run lint` + `npx tsc --noEmit` + `npm test` green, Swagger complete, `docs/API_CONTRACT.md` accurate, `.env.example` current.
- DB workflow: edit `prisma/schema.prisma` → `npx prisma migrate dev --name <verb_noun>` → `npx prisma validate` → update `prisma/seed.ts` if models changed.
- The HTTP surface must match `docs/API_CONTRACT.md` and `.claude/rules/20-rest-api.md` exactly.
