# StoryHouse backend

NestJS 11 + Prisma 7 + PostgreSQL. The HTTP contract lives in [../docs/API_CONTRACT.md](../docs/API_CONTRACT.md); Swagger UI is served at **`/api/docs`**.

```bash
docker compose -f ../docker-compose.yml up -d postgres   # host port 5434
cp .env.example .env      # then fill in the two JWT secrets (see below)
npm install
npx prisma migrate dev
npx prisma db seed        # admin + 3 users + sample stories/comments/likes
npm run start:dev         # http://localhost:3000
```

`JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are intentionally empty in `.env.example` so a copied file fails fast. Generate them with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Checks

| Command               | Purpose                                                               |
| --------------------- | --------------------------------------------------------------------- |
| `npm run lint`        | ESLint (read-only; `lint:fix` to write)                               |
| `npx tsc --noEmit`    | Type check                                                            |
| `npm test`            | Unit tests (Prisma mocked at the service boundary)                    |
| `npm run test:e2e`    | e2e against the disposable `postgres-test` container (host port 5435) |
| `npm run db:validate` | `prisma validate`                                                     |

Both database containers come from [../docker-compose.yml](../docker-compose.yml). They use ports **5434/5435** because this machine already runs PostgreSQL on 5432/5433.

## Prisma 7 notes

- The datasource URL lives in `prisma.config.ts`, **not** `schema.prisma` (Prisma 7 removed `url` from the schema).
- The runtime client needs a driver adapter — `PrismaService` passes `@prisma/adapter-pg`.
- `tsconfig.build.json` excludes `prisma/` so `dist/main.js` stays the entrypoint.

## Layout

`src/modules/{auth,users,stories,comments,likes}/` (controller · service · dto · entities), shared building blocks in `src/common/`, config in `src/config/`, Prisma access via the global `PrismaService`. Conventions are enforced by [../.claude/rules/10-backend-nestjs.md](../.claude/rules/10-backend-nestjs.md) and [../.claude/rules/30-prisma.md](../.claude/rules/30-prisma.md).

## Auth model

Access token (15m, memory-only on the client) + rotating refresh token (7d, stored sha256-hashed). The JWT guard is global — routes opt out with `@Public()` — and resolves the principal from the database on each request, so deleted users, role changes, and password changes take effect immediately.
