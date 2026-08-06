# StoryHouse Migration Plan — Express/React → NestJS/Angular

**Status: COMPLETE** (2026-08-06). All 76 tasks across 14 phases are done and verified; `legacy/` has been deleted.

**This file is now a historical record, not a task list.** It documents what was decided, what each phase verified, and why the new behavior differs from the old app where it does. The "Decisions (settled)" section below still binds — don't relitigate it. For live work, `docs/API_CONTRACT.md` is the authoritative contract and `.claude/rules/` are the conventions.

Derived from a full audit of the legacy codebase (5 parallel deep-reads + gap analysis, 2026-08-04). The legacy app has **serious security holes** (public endpoint returning all bcrypt hashes, unauthenticated mass-delete endpoints, hardcoded JWT secret fallback, no admin route guard) — the rewrite fixes these by design; they are documented in the contract's "deliberately removed" section and must not be ported.

## Decisions (settled — don't relitigate)

1. **IDs stay UUID** (all legacy PKs are UUIDv4 except the accidental integer PK on likes; `Like` becomes a composite PK `(userId, storyId)`).
2. **`Auth` table merges into `User.passwordHash`** — it only ever held the bcrypt hash. `passwordChangedAt` replaces the never-updated `passLastModificationTime`.
3. **`Story.description` → `Story.content`** (it was always the body, not a summary). `lastModifierId`/`lastModificationTime` dropped — `updatedAt` covers it.
4. **`role` becomes enum `Role { USER, ADMIN }`** — legacy numeric 0/1; the unused, misspelled `SUPPER_ADMIN (2)` (which had *fewer* rights than admin) is dropped.
5. **No data migration.** The legacy DB was dev-only (bulk-seeded fake users, schema created by a long-disabled `sequelize.sync`). Fresh Prisma migrations + idempotent seed.
6. **New auth model**: short-lived access token (15m) + rotating refresh tokens persisted (hashed) in a `RefreshToken` table. Legacy had a single 30m token, no refresh, no logout.
7. **Comments stay flat** (legacy nesting field was vestigial). Comment edits now bump `updatedAt`.
8. **Like/comment counts ship inside story responses** (grouped `_count` query) — fixes the legacy N+1 shape and removes 3 like endpoints.
9. Frontend naming: the UI says **"stories"** everywhere (legacy UI mixed "posts"/"stories").

## Target Prisma schema (implement in Phase 1)

```prisma
enum Role { USER ADMIN }

model User {
  id                String    @id @default(uuid()) @db.Uuid
  name              String    @db.VarChar(100)
  username          String    @unique @db.VarChar(30)
  email             String    @unique @db.VarChar(254)
  passwordHash      String    @map("password_hash")
  role              Role      @default(USER)
  passwordChangedAt DateTime? @map("password_changed_at")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")
  stories           Story[]
  comments          Comment[]
  likes             Like[]
  refreshTokens     RefreshToken[]
  @@map("users")
}

model RefreshToken {
  id        String    @id @default(uuid()) @db.Uuid
  tokenHash String    @unique @map("token_hash")
  userId    String    @map("user_id") @db.Uuid
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime  @map("expires_at")
  revokedAt DateTime? @map("revoked_at")
  createdAt DateTime  @default(now()) @map("created_at")
  @@index([userId])
  @@map("refresh_tokens")
}

model Story {
  id        String    @id @default(uuid()) @db.Uuid
  title     String    @db.VarChar(200)
  content   String
  authorId  String    @map("author_id") @db.Uuid
  author    User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  comments  Comment[]
  likes     Like[]
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  @@index([authorId])
  @@index([createdAt])
  @@map("stories")
}

model Comment {
  id        String   @id @default(uuid()) @db.Uuid
  content   String   @db.VarChar(2000)
  storyId   String   @map("story_id") @db.Uuid
  story     Story    @relation(fields: [storyId], references: [id], onDelete: Cascade)
  authorId  String   @map("author_id") @db.Uuid
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  @@index([storyId])
  @@index([authorId])
  @@map("comments")
}

model Like {
  userId    String   @map("user_id") @db.Uuid
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  storyId   String   @map("story_id") @db.Uuid
  story     Story    @relation(fields: [storyId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now()) @map("created_at")
  @@id([userId, storyId])
  @@index([storyId])
  @@map("likes")
}
```

Env vars (`backend/.env.example`): `DATABASE_URL`, `PORT`, `JWT_ACCESS_SECRET`, `JWT_ACCESS_TTL=15m`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_TTL=7d`, `BCRYPT_COST=12`, `CORS_ORIGIN=http://localhost:4200`, `THROTTLE_TTL`, `THROTTLE_LIMIT`. (Legacy read `DB_NAME/DB_USER/DB_PASSWORD/DB_HOST/DB_DIALECT`, `SALT`, `JWT_SECRET` with a `'secret'` fallback — all replaced.)

---

## Phase 0 — Restructure the repo

- [x] `git mv backend legacy/backend` and `git mv frontend legacy/frontend` (keeps history; `legacy/` is reference-only from now on)
- [x] `git mv legacy/backend/CLAUDE.md backend/CLAUDE.md` and `git mv legacy/frontend/CLAUDE.md frontend/CLAUDE.md` back out first (they describe the NEW stack) — do this as part of the same move
- [x] Scaffold NestJS 11 into `backend/`: `npx @nestjs/cli new backend` (npm, strict TS), align ESLint+Prettier with repo conventions, remove sample cruft (hello endpoint → `GET /health`; added missing `.gitignore`)
- [x] Scaffold Angular into `frontend/`: **Angular 21 LTS** (`@angular/cli@21` — machine Node 20.20 doesn't meet Angular 22's ≥22.22 requirement; zoneless + vitest defaults), Tailwind v4 via `@tailwindcss/postcss` with starter `@theme` tokens, angular-eslint added, `proxy.conf.json` → `/api` → `http://localhost:3000` wired into `angular.json`, OnPush set as component-schematic default
- [x] Add `docker-compose.yml` at repo root: `postgres:16-alpine` for dev + a `postgres-test` service (or second database) for e2e
- [x] Root `README.md`: one-paragraph project description, prerequisites, how to run both apps
- [x] Verify: both scaffolds install and pass their own lint/build; `legacy/` untouched apart from the moves (backend: lint 0 problems, tsc clean, 1/1 tests; frontend: lint clean, 190 kB build, 2/2 vitest)

## Phase 1 — Backend foundation

- [x] Config: `@nestjs/config` with validated env schema (fail fast, Joi); `src/config/{configuration,env.validation}.ts`; `.env.example` with every var
- [x] Prisma: `schema.prisma` as specified, `init` migration applied, generated client, global `PrismaModule`/`PrismaService` with shutdown hooks — **Prisma 7 notes**: datasource URL lives in `prisma.config.ts` (not the schema), runtime uses the `@prisma/adapter-pg` driver adapter, seed command configured in `prisma.config.ts`; `tsconfig.build.json` excludes `prisma/` so `dist/main.js` stays the entrypoint
- [x] `main.ts`: global prefix `api` + URI versioning `v1` (via shared `src/app.setup.ts` used by main + e2e), global `ValidationPipe { whitelist, forbidNonWhitelisted, transform }`, `helmet`, CORS from config, `ClassSerializerInterceptor`
- [x] Global exception filter: NestJS standard error shape everywhere; maps Prisma `P2002` → 409, `P2025` → 404
- [x] Shared: `PaginationQueryDto` + `PaginatedDto`/`buildMeta`, `@Public()` + `@CurrentUser()` + `@Roles()` decorators (guards wired in Phase 2)
- [x] Swagger at `/api/docs` (title, version, bearer auth scheme); `GET /api/v1/health` (Public) — verified serving live
- [x] Seed: `prisma/seed.ts` idempotent upserts (1 admin, 3 users, 3 stories, 3 comments, 4 likes) + `db:seed`/`db:migrate`/`db:validate` scripts; ran twice, no duplicates
- [x] Verify: lint 0 problems + `tsc --noEmit` clean + unit 1/1 + e2e 1/1; `prisma validate` OK; app booted against dockerized Postgres (host port **5434** — this machine's native PostgreSQL owns 5432/5433; test DB moved to 5435), health + Swagger + 404 shape verified over HTTP

## Phase 2 — Auth module

- [x] `POST /auth/signup` per contract (unified username regex `/^[a-z0-9_]{3,30}$/`, password min 8, bcrypt cost from config, 409 on duplicate via central P2002 mapping)
- [x] `POST /auth/login` (identifier = username OR email; uniform 401; returns `{accessToken, refreshToken, user}` — bare JWT, no "Bearer " inside the value)
- [x] Refresh-token persistence (sha256 hash), `POST /auth/refresh` with single-use rotation + revocation, `POST /auth/logout` (204, idempotent)
- [x] Passport strategies (`jwt`, `jwt-refresh` via body field); `JwtAuthGuard` **global** (APP_GUARD) with `@Public()` opt-out; `RolesGuard` global for `@Roles(ADMIN)` routes
- [x] `@nestjs/throttler` rate limiting on `/auth/*` (guard on AuthController; limits from env)
- [x] Unit specs (hash storage, enumeration-safe 401s by message AND timing, atomic single-use rotation incl. double-spend, revocation, idempotent logout) + `test/auth.e2e-spec.ts` (11 e2e tests) against `postgres-test` (5435) with `TEST_DATABASE_URL` support (guarded: refuses non-`storyhouse_test` URLs); `prisma migrate reset --force` in jest globalSetup — **user consented 2026-08-05 to Prisma 7's AI-guardrail for resetting the disposable test DB** (recorded in `test/global-setup.ts`)
- [x] Verify: lint 0 problems + tsc clean + unit 16/16 + e2e 12/12; Swagger complete for all 4 routes

## Phase 3 — Users module

- [x] `GET/PATCH /users/me`, `PATCH /users/me/password` (401 wrong current, 400 same-as-old, **revokes all refresh tokens** — contract updated), `DELETE /users/me` (403 for ADMIN)
- [x] `GET /users/:id` → PublicUser (no email); 404; ParseUUIDPipe → 400 on malformed ids
- [x] ADMIN: `GET /users` (paginated; `search` = username OR name OR email — fixes legacy AND bug and the name→username copy-paste bug; `role` filter), `DELETE /users/:id` (403 own account), `GET /users/stats` (incl. the two "new this week" counters)
- [x] Response entities enforcing the password-hash firewall (explicit Prisma `select` maps: `userEntitySelect`, `publicUserSelect`)
- [x] Unit specs (15) per testing rules + users e2e (10 tests incl. session-revocation-on-password-change)
- [x] Verify: lint 0 problems + tsc clean + unit 31/31 + e2e 22/22; contract + Swagger accurate

## Phase 4 — Stories module

- [x] `GET /stories` (Public): pagination, `search` on title (single param — legacy accepted `title` from one page and `search` from another), `authorId` filter, `sort=createdAt:asc|desc` (invalid sort → 400), author lite + `_count` likes/comments (no N+1)
- [x] `POST /stories` (author from JWT; client-supplied authorId rejected by forbidNonWhitelisted), `GET /stories/:id` (Public, `likedByMe` when authenticated — JwtAuthGuard now does optional auth on `@Public()` routes), `PATCH` (owner only, admin edit rejected per contract), `DELETE` (owner or ADMIN) — 403 vs 404 correctly split
- [x] Service spec (13: counts mapping, likedByMe branches, ownership/moderation matrix) + controller spec (route wiring + StoriesQueryDto validation per rule 50) + stories e2e (14 tests)
- [x] Verify: lint 0 problems + tsc clean + full backend unit 76/76 + e2e 53/53; e2e asserts no author email in any story response

## Phase 5 — Comments module

- [x] `GET /stories/:id/comments` (Public, paginated newest-first) + `POST /stories/:id/comments` (404 unknown story) — nested `StoryCommentsController`
- [x] `PATCH /comments/:id` (owner only — admin edit 403, bumps `updatedAt`), `DELETE /comments/:id` (owner or ADMIN)
- [x] ADMIN `GET /comments` (search = content OR author username, `storyId` filter, paginated envelope)
- [x] Service spec (10) + controller specs for both controllers (wiring + DTO validation per rule 50) + e2e (12)
- [x] Verify: lint 0 problems + tsc clean + full backend unit 76/76 + e2e 53/53

## Phase 6 — Likes + backend parity gate

- [x] `PUT /stories/:id/like` / `DELETE /stories/:id/like` — idempotent 204s via upsert/deleteMany (no "Already liked" errors), 404 unknown story
- [x] `likedByMe` + counts confirmed on story detail (e2e: double-like counts once, per-viewer likedByMe, anonymous omits the field); service spec (4) + controller spec + e2e (5)
- [x] `prisma/seed.ts` already ships realistic demo content since Phase 1 (3 authored stories, comments, likes) — verified idempotent
- [x] Ran `/parity-check` for the whole backend against `legacy/backend` (2026-08-05): all 27 legacy endpoints/capabilities mapped — implemented, improved, or documented as deliberately dropped (3 previously-implicit drops now recorded in the contract's "Additional deliberate changes": admin-rename-user, updatedAt feed sort, public comment search). No missing-capability tasks needed.
- [x] Verify: full backend suite green (lint 0, tsc clean, unit 76/76, e2e 53/53); every route Swagger-complete; contract file accurate

## Phase 7 — Frontend foundation

- [x] Tailwind v4 `@theme` tokens in `styles.css` (brand palette 50–900, danger/success, radius, font stack, dark-ready), base layer (focus-visible rings, body defaults, shared input styling)
- [x] `core/`: models mirroring `docs/API_CONTRACT.md` (`User`/`PublicUser`/`Story`/`Comment`/`Stats`/`Page<T>`/`AuthSession`), one typed API service per resource (`auth`, `users`, `stories`, `comments`); signals auth store (`user`, `isAuthenticated`, `isAdmin`) with refresh-token persistence (rememberMe → local vs session storage; **access token never persisted**) + `init()` session restore via `provideAppInitializer`
- [x] Functional interceptors: bearer attach (skips public auth endpoints); **401-triggered** single-flight refresh with retry-once then logout+redirect (the legacy app treated HTTP 500 as session expiry — explicitly NOT ported, and a spec asserts 500 doesn't refresh); error→toast mapping for 5xx/network only
- [x] Guards: `authGuard` (returnUrl), `adminGuard` (legacy had NO admin route guard — any user could open `/admin`), `guestGuard`
- [x] `shared/`: button (primary/ghost/danger + loading), card, form-field (real label association — legacy's inputs had none), confirm-dialog (focus trap + Escape + dismissible backdrop button, replaces legacy's 3 duplicate confirms), toast service + host (aria-live), paginator, skeleton, empty-state
- [x] App shell: sticky navbar (brand, 350ms-debounced `?q=` search hidden on auth routes, avatar menu with admin link for admins), footer; lazy `app.routes.ts` with a `title` on every route (13 lazy chunks); 404 page **inside** the shell (legacy's rendered outside the layout)
- [x] Verify: lint clean (incl. template a11y rules), build 283.83 kB initial (budget 500 kB), `npm test` 32/32 — auth store single-flight/storage/init, refresh interceptor (retry-once, no-loop, 500-ignored), guards, confirm-dialog a11y, paginator, shell landmarks

## Phase 8 — Auth feature

- [x] `/login` (identifier + password, show/hide password, remember-me → refresh-token storage choice, guestGuard) and `/signup` (typed reactive forms, inline validation mirroring the contract's rules: username `^[a-z0-9_]{3,30}$`, password ≥ 8, email format; 409 and 400-array server errors surfaced inline, not as toasts)
- [x] Post-login redirect handling (`returnUrl`), logout flow with toast
- [x] Verify: lint clean + build 291.73 kB + 11 new specs (43/43 frontend tests) covering empty-submit blocking, validation messages, 401-inline-not-toast, rememberMe storage, redirect targets

## Phase 9 — Stories feature

- [x] Feed `/` : paginated card grid (9/page), URL-driven search (`?q=` from the navbar) and `?page=`, newest/oldest sort, skeleton grid while loading, empty state with CTA, delete via confirm dialog
- [x] Detail `/stories/:id`: story, author link, like button (**optimistic with rollback on failure**, disabled when logged out), comments section (paginated, add/inline-edit/delete with confirm) loaded with `@defer (on viewport)`
- [x] Create `/stories/new` + edit `/stories/:id/edit` (authGuard; prefill from the API; no legacy "no changes" double-submit bug)
- [x] Owner/admin action visibility identical to backend permissions (owner edits; owner **or** admin deletes — admin edit is not offered, matching the contract)
- [x] Verify: lint clean + build 311.30 kB + 13 new specs (56/56 frontend tests) covering optimistic like/rollback/unlike, permission visibility, excerpt truncation, aria-labels, not-found state

## Phase 10 — Profile & settings features

- [x] `/profile` (own: info card with email + Edit profile + New story) and `/profile/:id` (public view — reads the no-email public endpoint) with the user's stories grid (paginated 6/page, searchable via `?q=`, owner/admin delete)
- [x] `/settings` with tabs: profile (name + username edit, save disabled until dirty, 409 inline) and security (change password with 401/400 mapping + "signs out other sessions" notice; delete account behind a confirm dialog — hidden for admins since the backend forbids admin self-deletion)
- [x] Verify: lint clean + build 311.75 kB + 12 new specs (68/68 frontend tests)

## Phase 11 — Admin feature

- [x] `/admin` behind `adminGuard` with a nested layout route + its own sub-nav (dashboard/users/stories/comments), each child lazy with its own title
- [x] Dashboard: clickable stat cards from `GET /users/stats` **including** the two "new this week" stats the legacy UI fetched but never displayed
- [x] Users: paginated accessible table (caption + scoped headers), role filter + `?q=` search, delete with confirm — the signed-in admin's own row shows "You" and offers no delete (the backend 403s it)
- [x] Stories + comments moderation: search, sort, paginate, delete with confirm; comment rows link through to their story
- [x] Verify: lint clean + build 313.67 kB + admin-users specs (104/104 frontend tests) covering self-row protection, delete+reload, role filtering, table a11y

## Phase 12 — Polish, a11y, performance

- [x] Session invalidation on password change — **enforced**, via a `User.tokenVersion` counter rather than the `passwordChangedAt` timestamp. `JwtStrategy` resolves the principal from the database each request and rejects any token whose version isn't current. A first attempt compared `iat` against `passwordChangedAt`; the final review proved that wall-clock approach left a sub-second hole (its own e2e passed or failed depending on machine speed). An integer compare has no window. Because the change also invalidates the caller's credentials, `PATCH /users/me/password` now returns a replacement token pair (contract updated, client swaps it in) so the acting session survives — the UI's "other sessions were signed out" is now literally true. Bonus: a deleted user's token yields 401 and role changes take effect at once. Covered by 4 strategy unit tests, 2 service unit tests, and an e2e that runs two concurrent sessions through the change.

- [x] A11y pass: **skip-to-content link**, semantic landmarks (header/main/footer/nav), verified single `h1` per page (admin children use `h2` under the layout's `h1`), aria-labels on every action button, keyboard-operable dialog (focus trap + Escape) and avatar menu, `:focus-visible` rings globally, real label↔input associations (broken throughout legacy), scoped table headers + captions, `aria-live` toasts
- [x] Performance pass: route-level code splitting confirmed (lazy chunk per feature), initial bundle **317.07 kB** vs the 500 kB budget with zero budget warnings, `@defer (on viewport)` for comments, skeletons instead of blocking spinners, debounced search, paginated lists. `NgOptimizedImage` is **not applicable** — the UI ships no `<img>` (avatars are initial-letter tiles), so there is nothing to optimize; revisit if imagery is added
- [x] Dark mode via tokens (`dark:` variants throughout, driven by `prefers-color-scheme`); mobile-first layouts (single-column grids, wrapping toolbars) usable at 360px
- [x] Consistent copy — all UI text written fresh; none of the legacy typos ("seccessful", "succesfully", "udpate", "Failed error to change password") were carried over
- [x] Verify: lint clean (incl. template a11y rules) + build green + 104/104 frontend tests; no `*ngIf`/`*ngFor` anywhere; OnPush on all 30 application components

## Phase 13 — Final parity gate & legacy removal

- [x] `/parity-check all` — backend audited 2026-08-05 (all 27 legacy endpoints mapped); **frontend UI audited 2026-08-06** against a full legacy capability inventory: every user-facing capability is implemented or documented as a deliberate change in the contract's "Deliberate UI changes from the legacy frontend" section. Legacy capabilities intentionally **not** ported are all dead/broken code (unrouted Contact page, dead `UserContext`/`ToastConfig`, `/admin/settings/info`, unread `scrollToComment` state). Parity gap found and closed during the audit: password show/hide toggles on the change-password form.
- [x] `migration-reviewer` agent full-app **PASS** (2026-08-06, HEAD `3cacdad`): gates re-run independently — backend lint 0 / tsc clean / 82 unit / 54 e2e / prisma valid; frontend lint clean / 104 tests / 317.07 kB with no budget warning. The reviewer re-tested the session-invalidation fix live (two concurrent sessions, change completed in 903 ms — inside the old grace window — other session dead on both credentials) and ran a 45-assertion regression sweep across every module with zero mismatches.
- [x] READMEs rewritten for the new stack (root: real run steps + seeded login + feature summary; backend: Prisma 7 notes, port rationale, secret generation; frontend: proxy/auth model/checks). `.env.example` verified to cover every var in the Joi schema (diff = empty). Swagger complete: 25/25 routes carry `@ApiOperation`, every controller `@ApiTags`.
- [x] Deleted `legacy/` — user gave explicit go-ahead 2026-08-06. 137 tracked files removed via `git rm -r` (recoverable from history). Dangling references cleaned up in the same change: the migration-workflow rule reframed as a post-migration rule, root `CLAUDE.md` layout table and automation list updated, `README.md` layout tree and closing note updated, `Edit(legacy/**)` dropped from `.claude/settings.json`. Migration-only tooling whose subject no longer exists was removed with it — the `legacy-analyst` agent, the `/parity-check` and `/migrate-next` skills, and the SessionStart migration-progress hook; the three remaining agents had their `legacy/` directives stripped. Prose describing *how the old app behaved* is kept everywhere it explains a design decision.
- [x] Plan status header updated to "complete"
