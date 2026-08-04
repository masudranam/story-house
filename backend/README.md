# StoryHouse backend

NestJS 11 + Prisma + PostgreSQL API. The HTTP contract lives in [../docs/API_CONTRACT.md](../docs/API_CONTRACT.md); Swagger UI at `/api/docs` once Phase 1 lands.

```bash
cp .env.example .env      # after Phase 1 introduces it
npm install
npm run start:dev         # http://localhost:3000
```

Checks: `npm run lint` · `npx tsc --noEmit` · `npm test` · `npm run test:e2e` (needs the postgres-test container from ../docker-compose.yml once Prisma lands).
