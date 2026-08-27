# Database rules — Prisma + PostgreSQL

Applies to `backend/prisma/**` and any code touching the database.

## Schema conventions

- One `schema.prisma`; models in PascalCase singular (`User`, `Story`, `Comment`, `Like`, `RefreshToken`), mapped to snake_case plural tables with `@@map` (`users`, `stories`, ...); fields camelCase in the client, snake_case columns via `@map`.
- Every model has `id` (autoincrement Int or `uuid()` — pick per plan and stay consistent), `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`.
- Relations always declare both sides with explicit relation fields and `onDelete` behavior chosen deliberately (`Cascade` for owned children like comments/likes of a story; `Restrict`/`SetNull` where history matters). Never rely on the default.
- Uniqueness lives in the database: `@unique` on `User.email` / `User.username`, `@@unique([userId, storyId])` on `Like`. Add `@@index` for every foreign key used in list filters and for sort columns.
- Enums for closed sets (`Role { USER ADMIN }`). No stringly-typed state.

## Migrations

- Schema changes only via `npx prisma migrate dev --name <verb_noun>` — never edit the database or old migration files by hand, never `db push` outside throwaway experiments.
- After any schema change: `npx prisma validate` and `npx prisma generate` must pass, and the migration SQL should be skimmed for surprises (dropped columns, table rewrites) before moving on.
- `prisma/seed.ts` stays runnable (`npx prisma db seed`) and idempotent (upserts). It seeds: one admin, a few users, sample stories/comments/likes.

## Query rules

- All access through the injected `PrismaService`. No `$queryRaw` unless a task explicitly justifies it in a comment.
- Never `SELECT *` into responses: use `select`/`include` to fetch exactly what the response DTO needs — this is also the password-hash firewall.
- List queries: `skip`/`take` driven by the shared pagination DTO, plus a parallel `count` (use `prisma.$transaction([findMany, count])`).
- Multi-write invariants (e.g. create user + refresh token, cascading moderation deletes) use interactive transactions.
- Handle known Prisma error codes centrally (exception filter mapping `P2002` → 409, `P2025` → 404); services shouldn't pattern-match error strings.
