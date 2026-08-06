# StoryHouse

**A story-sharing platform — write, publish, and discuss short stories.**

Readers browse a public feed, authors publish and edit their own work, everyone can comment and like, and administrators moderate the community from a dedicated panel. Built as a **NestJS + Prisma + PostgreSQL** API and an **Angular + Tailwind** single-page app.

| | |
|---|---|
| **API** | NestJS 11 · TypeScript strict · PostgreSQL 16 via Prisma 7 · OpenAPI at `/api/docs` |
| **Web** | Angular 21 · standalone + signals + zoneless · Tailwind CSS v4 |
| **Surface** | 25 REST endpoints · 14 routed screens |
| **Tests** | 240 automated tests — 82 API unit, 54 API end-to-end, 104 web unit |
| **Initial bundle** | 317 kB raw / 87 kB transferred, under a 500 kB budget |

> This repository is a **rewrite**. The original app was Express 5 + Sequelize + React/Vite; it was replaced in place against a written API contract, with each deliberate behavioural change recorded rather than silently carried over. The old implementation has been deleted now that parity is proven — it remains in git history, and [docs/](docs/) documents the transition, including every behaviour that was deliberately changed and every endpoint that was deliberately dropped.

---

## Table of contents

- [Tech stack and why](#tech-stack-and-why)
  - [Backend](#backend)
  - [Frontend](#frontend)
  - [Database and tooling](#database-and-tooling)
  - [Things deliberately *not* used](#things-deliberately-not-used)
- [Architecture](#architecture)
  - [Request lifecycle (API)](#request-lifecycle-api)
  - [Data flow (web)](#data-flow-web)
- [Features in detail](#features-in-detail)
- [Screens](#screens)
- [API reference](#api-reference)
- [Data model](#data-model)
- [Security model](#security-model)
- [Performance](#performance)
- [Accessibility](#accessibility)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Commands](#commands)
- [Testing](#testing)
- [Project layout](#project-layout)
- [Engineering conventions](#engineering-conventions)
- [Documentation](#documentation)

---

## Tech stack and why

### Backend

| Choice | Version | Why this, and not something else |
|---|---|---|
| **NestJS** | 11 | The app has real cross-cutting concerns — auth on every route, one error shape, one validation policy, one serialization policy. Nest expresses those as guards / filters / pipes / interceptors applied once globally, instead of middleware repeated per route as in the Express original. Its DI container is also what makes services unit-testable without a running server. |
| **TypeScript (strict)** | 5.7 | `strict: true` with no `any`, no non-null assertions, no `as unknown as`. Types are the first line of defence: a response DTO that cannot structurally hold `passwordHash` cannot leak it. |
| **Prisma** | 7 | Generated, fully typed client — the schema is the single source of truth for both the database and the TypeScript types, so a column rename becomes a compile error rather than a runtime surprise. Its `select` clause is used as a password-hash firewall (see [Security](#security-model)). Migrations are versioned SQL files, reviewable in a diff — unlike Sequelize's `sync()`, which the legacy app relied on. |
| **`@prisma/adapter-pg`** | 7 | Prisma 7 runs on driver adapters. The `pg` pool connects **lazily on first query**, which means unit specs and the health-check e2e boot with no database at all. |
| **PostgreSQL** | 16 | Relational data with hard invariants: one like per user per story is a composite primary key, not application logic; cascade rules are declared in the schema; counts come from indexed aggregates. |
| **Passport + `@nestjs/jwt`** | 11 | Two strategies — `jwt` for access tokens (global guard) and a refresh strategy that reads the token from the request body. Passport's strategy boundary keeps token *verification* out of business code entirely. |
| **bcrypt** | 6 | Deliberately slow password hashing, cost configurable (default 12, floor of 10 enforced by config validation). Also used as a **timing equalizer** on failed logins. |
| **class-validator / class-transformer** | 0.15 / 0.5 | Validation lives on the DTO next to the field it guards, so the rule and the Swagger example never drift. A global `ValidationPipe` with `whitelist` + `forbidNonWhitelisted` + `transform` means unknown properties are a **400**, not silently persisted. |
| **`@nestjs/swagger`** | 11 | Documentation generated from the same decorators that define the routes, so it cannot go stale. A route without complete Swagger annotation is treated as unfinished work. |
| **Joi** (via `@nestjs/config`) | 18 | Environment validation at boot. A missing `JWT_ACCESS_SECRET` or a 12-character secret **fails startup** instead of producing a silently insecure deployment. |
| **helmet** | 8 | Standard security response headers with one line of setup. |
| **`@nestjs/throttler`** | 6 | Rate limiting on `/auth/*` — the endpoints worth brute-forcing. Configurable window and allowance. |
| **Jest + Supertest** | 30 / 7 | Ships with Nest. Unit specs mock at the `PrismaService` boundary (fast, no database); e2e specs drive the **real HTTP pipeline** with Supertest against a disposable database. |

### Frontend

| Choice | Version | Why this, and not something else |
|---|---|---|
| **Angular** | 21 (LTS) | Batteries included — router, typed reactive forms, HTTP client with interceptors, and DI — with no assembly of a third-party stack. Standalone components mean no NgModule ceremony. |
| **Signals** | — | `signal` / `computed` / `resource` are the state primitive throughout. `resource()` in particular ties a fetch to a **key**: when the key changes the data reloads, and when it doesn't, it doesn't. That single property fixed two whole classes of bug present in the legacy app (a late response overwriting what the user was typing; navigating from editing story A to story B and getting A's text). |
| **Zoneless change detection** | — | No `zone.js` in the dependency tree at all. Change detection is driven by signal reads, not by monkey-patched browser APIs — smaller bundle, no stray global patching, and predictable update timing. |
| **`OnPush` everywhere** | — | Enforced on every component (and set as the schematic default in `angular.json`), so a component re-renders only when one of its inputs or signals actually changed. |
| **New control flow** (`@if` / `@for` / `@defer`) | — | Compiled into the template rather than resolved as structural directives, so it's faster and tree-shakeable. `@for` always carries a `track` on a stable id so list updates patch instead of re-creating DOM. `@defer (on viewport)` moves the comment thread out of the initial payload entirely. |
| **Functional guards and interceptors** | — | `authGuard` / `adminGuard` / `guestGuard` and three interceptors are plain functions using `inject()` — trivially unit-testable, no class boilerplate. |
| **Tailwind CSS** | v4 | Utility classes keep styling in the template next to the markup it applies to, and the v4 `@theme` block defines the design tokens (brand palette in **OKLCH**, radii, font stack) so no arbitrary hex value appears anywhere. Perceptually uniform OKLCH means the palette steps are evenly spaced by eye, which matters for the dark variants. |
| **No component library** | — | Deliberate: the whole UI vocabulary is ~10 small local components. This is the single biggest reason the initial bundle is 87 kB transferred. |
| **Vitest** | 4 | The `@angular/build:unit-test` builder's runner. Fast, ESM-native, and shares the build pipeline's transform, so tests compile the same way the app does. |
| **System font stack** | — | No webfont request, therefore no render-blocking network round-trip and no layout shift from a font swap. |

### Database and tooling

| Choice | Why |
|---|---|
| **Docker Compose** for two Postgres instances | `postgres` (port **5434**, persistent volume) for development and `postgres-test` (port **5435**, no volume) for e2e. The test database is *meant* to be destroyed — the e2e global setup resets its schema before every run, so tests can never corrupt development data. Ports are shifted off 5432/5433 because a locally installed PostgreSQL commonly owns those. |
| **Prisma migrations** | Every schema change is `prisma migrate dev --name <verb_noun>`, producing reviewable SQL. Hand-editing the database or old migration files is prohibited by repo rules. |
| **`prisma.config.ts`** | Prisma 7 reads the CLI connection URL from here rather than from `schema.prisma`, and it fails with an actionable message if `DATABASE_URL` is unset. |
| **Idempotent seed** | `prisma/seed.ts` uses fixed UUIDs and `upsert`, so it can be re-run any number of times without duplicating data. |
| **ESLint + Prettier** on both sides | Including `@typescript-eslint/no-floating-promises` (an unawaited promise is a bug, not a style issue) and angular-eslint's **template accessibility rules**, which are treated as errors. |

### Things deliberately *not* used

| Not used | Reason |
|---|---|
| A repository layer over Prisma | The generated Prisma client already *is* the typed repository. A hand-written wrapper would only re-type what it already types. |
| A state-management library (NgRx and friends) | Signals plus one injectable `AuthStore` cover the app's actual shared state — the session. Anything more would be ceremony. |
| A UI component library | See bundle size. Ten local components built on Tailwind cover the entire vocabulary. |
| `httpOnly` cookies for tokens | A conscious trade-off. The refresh token is stored in `localStorage`/`sessionStorage` so the SPA and API stay fully decoupled (no shared-domain or CSRF machinery). The mitigations are that the **access** token is memory-only, refresh tokens are **single-use** and stored server-side only as SHA-256 hashes, and a password change revokes everything. A cookie-based scheme would trade XSS exposure for CSRF exposure; this one is documented rather than accidental. |
| Server-side rendering | The app is behind authentication for most of its surface and has no SEO requirement. |
| Content negotiation (XML/HTML) | The legacy app served XML and HTML variants via `js2xmlparser`. JSON only now. |

---

## Architecture

### Request lifecycle (API)

Applied globally in [`app.setup.ts`](backend/src/app.setup.ts), which is shared verbatim by `main.ts` **and** the e2e tests — so the tests exercise the exact production pipeline, not an approximation of it.

```
HTTP request
   │
   ├─ helmet                    security headers
   ├─ CORS                      restricted to the configured frontend origin
   ├─ /api/v1 prefix            global prefix + URI versioning
   │
   ├─ ThrottlerGuard            (/auth/* only) rate limiting
   ├─ JwtAuthGuard              global; protected by default, @Public() opts out.
   │                            Public routes still attach the user when a valid
   │                            token is present → `likedByMe` on anonymous-capable reads
   ├─ RolesGuard                @Roles(ADMIN) checks
   │
   ├─ ValidationPipe            whitelist + forbidNonWhitelisted + transform
   ├─ ParseUUIDPipe             route params validated before any query runs
   │
   ├─ Controller                route + DTO + service call + Swagger decorators. Nothing else.
   ├─ Service                   business logic, ownership checks, throws HttpExceptions
   ├─ PrismaService             explicit `select` on every query
   │
   ├─ ClassSerializerInterceptor  response entities → JSON
   └─ GlobalExceptionFilter       one error shape; P2002→409, P2025→404, P2003→404
```

Two rules make this hold together: **controllers contain no business logic** (no Prisma calls, no try/catch for control flow), and **services never touch `req`/`res`** — they take typed parameters and throw `NotFoundException` / `ForbiddenException` / `ConflictException`. Nothing hand-builds an error body, which is why the contract's error shape is guaranteed rather than hoped for.

### Data flow (web)

```
Component (signals, OnPush)
   │  reads state from
   ├─ resource({ params, loader })     keyed fetch: key changes → reload; key stable → no refetch
   │
   ├─ core/api/*.api.ts                the only place HttpClient is called
   │      │
   │      └─ HTTP interceptor chain (order is deliberate):
   │            authInterceptor          attaches `Authorization: Bearer <access>`
   │            refreshInterceptor       on 401 → single-flight refresh → retry once
   │            errorToastInterceptor    only status 0 and 5xx become toasts;
   │                                     400/401/403/404/409 belong to the caller
   │
   └─ AuthStore (root singleton)        user + access token signals, sessionReady promise
```

`AuthStore.init()` is *started* at bootstrap but not awaited — the shell renders immediately instead of showing a blank page for two round-trips. Guards await `store.sessionReady` instead, and pages that depend on the viewer (story detail, profile) key their `resource()` on the viewer id so they refetch once the session lands.

---

## Features in detail

### Accounts and sessions

- **Sign up** with name, username, email and password. Usernames are `a–z`, `0–9`, `_`, 3–30 characters; passwords are at least 8 characters; names 1–100. A duplicate username or email returns **409** and is shown inline on the offending field, not as a generic banner. *(The legacy app enforced two different, conflicting username regexes on signup vs. login — one rule now governs both.)*
- **Log in with either your username or your email.** One `identifier` field accepts both.
- **"Keep me logged in"** chooses `localStorage` (survives closing the browser) or `sessionStorage` (per-tab). Every storage access is wrapped — in private mode or with storage blocked, the app degrades to an anonymous session instead of crashing.
- **Silent session renewal.** Access tokens live 15 minutes. On the first 401 from a protected endpoint the app refreshes once and replays the original request, so you're never interrupted mid-action. Concurrent 401s share a **single** refresh request (single-flight), so five parallel requests cannot burn five rotations.
- **Rotating, single-use refresh tokens.** Presenting a refresh token revokes it and issues a new pair. Two concurrent presentations of the same token race on an atomic conditional update — exactly one wins, the other gets a 401.
- **Change your password** — every *other* session is signed out **immediately**, while the session you're using continues working uninterrupted (the endpoint hands back a replacement token pair, which the client swaps in).
- **Delete your account**, cascading to your stories, comments, likes and tokens. Administrators cannot delete their own account.
- **Log out**, which revokes the refresh token **server-side** rather than only forgetting it locally. Idempotent.
- If a refresh ultimately fails, the session is cleared, a toast explains why, and you land on `/login` with a `returnUrl` — a silent logout looks like a broken app.

### Stories

- **Public feed** — anyone, signed in or not, can browse. Paginated 9 per page.
- **Search by title** from the navbar, debounced 350 ms, case-insensitive. The term lives in the URL as `?q=`, so results are shareable and survive a reload. On pages that understand `?q=` (profile, the three admin tables) the search filters **in place**; anywhere else, searching means "find stories" and navigates to the feed with the term rather than dropping it.
- **Sort** newest-first (default) or oldest-first, on `createdAt`. *(Legacy sorted by `updatedAt` and defaulted to oldest-first under a "newest" label, so editing an old story silently jumped it to the top.)*
- **Story detail** shows the full text, author, publication date, an "updated" marker for edited stories, live like count and comment count. It is **genuinely public** — legacy's detail page called auth-only endpoints and replaced the entire page with an error for logged-out readers.
- **Write a story** — title ≤ 200 characters, body required. Authorship comes from the session; the client cannot spoof an author id.
- **Edit your own story.** The editor never shows a blank form that a late response could overwrite, and navigating from editing story A to story B always loads B's text.
- **Delete** your own story; administrators may delete any story. Cascades to its comments and likes. Every delete goes through a real confirmation dialog.
- Each feed card shows an excerpt, author link, relative date, and like/comment counts. Edit and delete controls render only for those actually permitted — and the server enforces it regardless.
- Counts come from a single grouped query (`_count`) on every story read — **no N+1**. Author email is never included. *(Legacy leaked the author's email address in every list response.)*

### Comments

- **Read comments** on any story without an account, newest first, paginated. The whole thread is `@defer (on viewport)` — it is a separate lazy chunk and doesn't load until you scroll to it.
- **Post a comment** when signed in, up to 2000 characters, with inline validation on both the empty and over-length cases.
- **Edit your own comment** inline. Edited comments are marked, and the timestamp is real. *(Legacy had no edit timestamp at all.)*
- **Delete** your own comment; administrators may delete any comment.
- Timestamps show a relative date. *(Legacy showed time-of-day only, so a comment from last March read "14:32".)*

### Likes

- **Like or unlike** any story with one click. The UI paints the new state instantly and rolls back with an explanatory toast if the server rejects it.
- **Idempotent by design** — liking twice counts once, unliking something never liked is not an error. Both return **204**. *(Legacy returned a 500 with "Already liked".)*
- Each viewer sees their own like state (`likedByMe`); the count is identical for everyone, including anonymous readers, because it ships inside the story payload rather than from a separate authenticated call.
- The like state is reset when the detail component is reused for a different story, so you never see the previous story's state.

### Profiles

- **Your profile** shows name, username, email, join date, and your stories — paginated 6 per page and searchable — with quick links to write a story or edit your details.
- **Other people's profiles** show the same **minus the email address**. The API does not send it, so it cannot be exposed by a client mistake. *(Legacy printed `Email :` on every profile, including other people's.)*

### Settings

- **Profile tab** — change your display name and username. Save stays disabled until something actually changes; a taken username is reported inline on the field. *(Legacy could not edit `name` at all.)*
- **Security tab** — change your password with show/hide toggles on both fields, and delete your account behind a confirmation dialog. Reusing your current password as the new one is rejected with a specific message rather than a generic validation error.
- Both tabs are directly linkable (`/settings`, `/settings/security`) and implement the WAI-ARIA tabs pattern, including arrow-key navigation.

### Administration

- **Guarded** — `/admin` requires the `ADMIN` role, enforced by a route guard **and** by every server endpoint independently. *(Legacy gated `/admin` only by hiding a navbar link; any logged-in user could type the URL and use the whole panel.)*
- **Dashboard** — total users, stories and comments, plus new users and new stories this week. Each card links through to its list.
- **Users** — searchable (username **or** name **or** email) and role-filterable table with join dates and role badges. Delete any account except your own.
- **Stories** — searchable, sortable table with author and engagement counts; remove any story.
- **Comments** — search by comment text **or** commenter username, with click-through to the parent story; remove any comment.
- Moderation is **delete-only**. Administrators never edit another person's words, and cannot rename other users. *(Legacy's `PUT /users/:id` allowed admin renames that the UI never exposed.)*
- Every admin action reports its outcome in a toast. *(Legacy admin deletes were silent.)*
- Admin searches actually filter. *(Legacy's admin Users/Posts/Comments searches were either no-ops or self-cancelling — the comments search ANDed `content` and `author` with the same term, so it matched almost nothing.)*

### Throughout

- Responsive from 360 px up, content capped at ~72 rem and centred, sticky navbar, dark-mode tokens from day one.
- Skeleton placeholders while data loads instead of a spinner blocking the page; empty states with a call to action; confirmation dialogs before anything destructive; toasts for outcomes.
- Every page sets its own document title, has exactly one `h1`, and lives inside semantic landmarks.

---

## Screens

| Route | Access | What it does |
|---|---|---|
| `/` | Public | Story feed — search, sort, paginate (9/page) |
| `/stories/:id` | Public | Story detail, likes, deferred comment thread |
| `/stories/new` | Signed in | Write a story |
| `/stories/:id/edit` | Author | Edit a story |
| `/login` | Signed out | Log in with username or email |
| `/signup` | Signed out | Create an account |
| `/profile` | Signed in | Own profile + own stories (6/page, searchable) |
| `/profile/:id` | Signed in | Another user's public profile (no email) |
| `/settings` | Signed in | Profile settings |
| `/settings/security` | Signed in | Password change + account deletion |
| `/admin` | Admin | Dashboard with platform statistics |
| `/admin/users` | Admin | User moderation |
| `/admin/stories` | Admin | Story moderation |
| `/admin/comments` | Admin | Comment moderation |
| `/about` | Public | About the project |
| anything else | Public | 404, inside the app shell |

Every route is **lazy-loaded** via `loadComponent`, and the admin section is a nested child route group behind a single guard.

---

## API reference

Base path **`/api/v1`**. JSON only, camelCase keys, ISO-8601 UTC dates. Interactive documentation at **`/api/docs`**. The authoritative specification — including validation rules, error cases and every deliberate deviation from the legacy API — is [docs/API_CONTRACT.md](docs/API_CONTRACT.md).

**Conventions.** Success responses return the resource directly — no `{ success, message, data }` wrapper. Lists always paginate and always return `{ data: [...], meta: { page, limit, totalItems, totalPages } }`. Errors are always `{ statusCode, message, error }`, where `message` is a string array for validation failures. 200 read/update · 201 create · 204 delete and like/unlike · 400 validation · 401 unauthenticated · 403 authenticated-but-not-allowed · 404 missing · 409 conflict · 429 rate-limited. Never a 200 with an error payload, never a 500 for an expected failure.

### Auth

| Method & path | Access | Body | Success | Errors |
|---|---|---|---|---|
| `POST /auth/signup` | Public | `{ name, username, email, password }` | **201** `User` | 400, 409, 429 |
| `POST /auth/login` | Public | `{ identifier, password }` | **200** `{ accessToken, refreshToken, user }` | 400, 401, 429 |
| `POST /auth/refresh` | Public | `{ refreshToken }` | **200** `{ accessToken, refreshToken }` — old token revoked | 401, 429 |
| `POST /auth/logout` | Bearer | `{ refreshToken }` | **204** | 401, 429 |

### Users

| Method & path | Access | Body / query | Success | Errors |
|---|---|---|---|---|
| `GET /users/me` | Bearer | — | **200** `User` (with email) | 401 |
| `PATCH /users/me` | Bearer | `{ name?, username? }` | **200** `User` | 400, 409 |
| `PATCH /users/me/password` | Bearer | `{ currentPassword, newPassword }` | **200** `{ accessToken, refreshToken }` | 400, 401 |
| `DELETE /users/me` | Bearer | — | **204** | 403 (admin) |
| `GET /users/:id` | Bearer | uuid | **200** `PublicUser` (no email) | 404 |
| `GET /users` | **Admin** | `?page&limit&search&role` | **200** `{ data, meta }` | 403 |
| `DELETE /users/:id` | **Admin** | uuid | **204**, cascades | 403 (self), 404 |
| `GET /users/stats` | **Admin** | — | **200** `Stats` | 403 |

### Stories

| Method & path | Access | Body / query | Success | Errors |
|---|---|---|---|---|
| `GET /stories` | Public | `?page&limit&search&authorId&sort` | **200** `{ data, meta }` | 400 |
| `POST /stories` | Bearer | `{ title, content }` | **201** `Story` | 400, 401 |
| `GET /stories/:id` | Public | uuid | **200** `Story` (+ `likedByMe` when authenticated) | 400, 404 |
| `PATCH /stories/:id` | Owner | `{ title?, content? }` | **200** `Story` | 400, 403, 404 |
| `DELETE /stories/:id` | Owner or Admin | uuid | **204**, cascades | 400, 403, 404 |

### Comments

| Method & path | Access | Body / query | Success | Errors |
|---|---|---|---|---|
| `GET /stories/:id/comments` | Public | `?page&limit` | **200** `{ data, meta }` | 404 |
| `POST /stories/:id/comments` | Bearer | `{ content }` (1–2000) | **201** `Comment` | 400, 401, 404 |
| `PATCH /comments/:id` | Owner | `{ content }` | **200** `Comment` | 400, 403, 404 |
| `DELETE /comments/:id` | Owner or Admin | uuid | **204** | 403, 404 |
| `GET /comments` | **Admin** | `?page&limit&search&storyId` | **200** `{ data, meta }` | 403 |

### Likes and health

| Method & path | Access | Success | Errors |
|---|---|---|---|
| `PUT /stories/:id/like` | Bearer | **204** (idempotent) | 401, 404 |
| `DELETE /stories/:id/like` | Bearer | **204** (idempotent) | 401, 404 |
| `GET /health` | Public | **200** `{ status: "ok" }` | — |

### Payload shapes

```jsonc
User        { id, name, username, email, role: "USER"|"ADMIN", createdAt, updatedAt }
PublicUser  { id, name, username,        role,                 createdAt, updatedAt }   // no email
Story       { id, title, content, author: { id, name, username },
              likesCount, commentsCount, likedByMe?, createdAt, updatedAt }
Comment     { id, content, storyId, author: { id, name, username }, createdAt, updatedAt }
Stats       { totalUsers, totalStories, totalComments, newUsersThisWeek, newStoriesThisWeek }
Error       { statusCode, message: string | string[], error }
```

### Endpoints that existed in the old API and were removed on purpose

| Removed | Why |
|---|---|
| `GET /users/auth` | Publicly returned **every user's bcrypt hash**. |
| `DELETE /users`, `DELETE /stories`, `DELETE /comments` | Unauthenticated bulk deletes of entire tables. |
| `GET /likes` | Unbounded public dump of the likes table. |
| `GET /likes/:storyId`, `GET /likes/liked/:storyId` | Superseded — the count and `likedByMe` ship inside `Story`. |
| `PATCH /users/change-password/:id` | Took a user id in the URL and ignored it. Identity now always comes from the JWT. |

---

## Data model

```
User ──< Story ──< Comment
 │        └──< Like >── User
 └──< RefreshToken
```

All primary keys are UUIDs. Models are PascalCase singular in the Prisma client; tables are snake_case plural; every column maps explicitly.

| Table | Columns of note | Indexes and constraints |
|---|---|---|
| `users` | `name`, `username`, `email`, `password_hash`, `role`, `token_version`, `password_changed_at`, `created_at`, `updated_at` | `@unique` on `username` and `email` — uniqueness lives in the **database**, not in a check-then-insert race |
| `stories` | `title` (≤200), `content`, `author_id` | indexed on `author_id` (list filter) and `created_at` (sort column) |
| `comments` | `content` (≤2000), `story_id`, `author_id`, `updated_at` | indexed on `story_id` and `author_id` |
| `likes` | `user_id`, `story_id`, `created_at` | **composite primary key `(user_id, story_id)`** — one like per person per story is structurally impossible to violate; secondary index on `story_id` |
| `refresh_tokens` | `token_hash` (SHA-256), `user_id`, `expires_at`, `revoked_at` | `@unique` on `token_hash`, indexed on `user_id` |

Cascades are declared explicitly on every relation, never left to a default: deleting a user removes their stories, comments, likes and refresh tokens; deleting a story removes its comments and likes.

`token_version` is an integer counter, incremented on password change. Access tokens carry the value they were minted with, and the guard rejects anything that isn't current. **This is deliberately a version comparison and not a timestamp comparison** — a timestamp check depends on clock resolution and leaves a sub-second window in which a token minted just before the change still passes.

List queries pair `findMany` with a `count` inside `prisma.$transaction([...])` so the page and the total are read consistently. Multi-write invariants (password change + token revocation) use transactions as well.

---

## Security model

- **Passwords** are bcrypt-hashed (cost 12 by default; config validation rejects anything below 10) and never leave the database. Every query that feeds a response names its columns explicitly, so there is no `SELECT *` path by which a hash could reach a serializer.
- **Access tokens** live 15 minutes and exist only in a browser-memory signal — never written to storage. **Refresh tokens** live 7 days, are persisted only as SHA-256 hashes (a database dump doesn't yield usable tokens), and are **single-use**: presenting one rotates it, and a concurrent replay loses an atomic conditional claim rather than minting a second live session.
- **Identity is resolved from the database on every request**, not trusted from the token body. Deleting a user makes their outstanding tokens 401 immediately, and a role change takes effect at once — no stale `ADMIN` claim surviving for the token's lifetime.
- **A password change invalidates every outstanding token** by incrementing `token_version` and revoking all refresh tokens in one transaction, then re-credentials the acting session so the person who initiated it isn't logged out of their own device.
- **Login is uniform for unknown accounts and wrong passwords** — same 401, same message, and **same response time**. The uniform timing is not incidental: when the identifier is unknown, bcrypt still runs against a throwaway hash computed at the configured cost, so response time can't be used to enumerate accounts. (Before this, a known username took ~236 ms and an unknown one ~12 ms.)
- **Authorisation is enforced server-side, always.** The JWT guard is global and protection is the default; public routes are marked explicitly. Role checks live in a guard, ownership checks in services. The UI only decides what to *show* — hiding a button is never the control.
- **Ownership vs. moderation are distinct.** Owners edit and delete their own content; admins may **delete** any story or comment but never edit one, and cannot rename other users or delete themselves.
- **Rate limiting** on `/auth/*` (configurable window and allowance, default 10 requests per minute), `helmet` security headers, and CORS restricted to the configured frontend origin.
- **Configuration fails fast.** Secrets come only from validated environment variables with no fallback values anywhere in the code — the app refuses to boot without them, so there is no way to accidentally run with a default secret. `.env` is git-ignored; `.env.example` carries placeholders only.
- **Input is whitelisted, not merely validated.** `forbidNonWhitelisted` means an unexpected property in a request body is a 400, which closes off mass-assignment.
- **Error bodies never leak internals** — the global filter maps everything to `{ statusCode, message, error }` with an HTTP reason phrase, logs 5xx stacks server-side, and never returns an exception class name.

---

## Performance

Measured on the current build:

| Metric | Value |
|---|---|
| Initial bundle (raw / transferred) | **317.07 kB / 87.45 kB** |
| Budget | 500 kB warning, 1 MB error — treated as a hard failure |
| Lazy chunks | 27, one per feature route plus the deferred comment thread |
| Largest feature chunk | 10.95 kB (settings) |

How it stays there:

- **Every feature route is lazy-loaded**; nothing but the shell, router, auth store and interceptors is in the initial payload.
- **`@defer (on viewport)`** puts the entire comment thread in its own chunk that loads only when the reader scrolls to it.
- **No component library and no webfont.** The design system is Tailwind tokens plus ~10 local components; the font stack is the system stack, so there's no render-blocking font request and no swap-induced layout shift.
- **Zoneless + `OnPush` everywhere** — change detection runs from signal reads, not from patched global APIs.
- **`@for` with `track` on stable ids**, so list updates patch the DOM instead of tearing it down.
- **Keyed `resource()` fetches** — data reloads when its key changes and *only* then, which eliminates both duplicate requests and stale-overwrite races.
- **Debounced search** (350 ms) with `distinctUntilChanged`, so typing a six-letter term is one request, not six.
- **Paginated everything.** No endpoint returns an unbounded collection; `limit` is capped at 100 server-side.
- **Skeleton loaders** rather than a blocking spinner, so the layout is present and stable while data arrives.
- **Optimistic likes** — the button responds immediately and rolls back on failure.
- **No N+1 on the server**: like and comment counts come from a grouped `_count` in the same query as the story, and list endpoints run `findMany` + `count` in one transaction.

---

## Accessibility

Treated as a build requirement — angular-eslint's template a11y rules are enabled and failing them fails the lint.

- Semantic landmarks, a skip-to-content link, and exactly one `h1` per page.
- Visible focus rings on every interactive element (`:focus-visible` styled globally in the theme layer).
- The confirm dialog implements the full modal pattern: `role="dialog"`, labelled by its title, backdrop, **focus trap** cycling within the dialog, Escape to cancel, and focus returned to the invoking element on close. *(The legacy app had three different hand-rolled confirm widgets, one with no question text and none of them focusable.)*
- The account menu and the settings tabs implement the WAI-ARIA menu and tabs patterns, including arrow-key navigation, Escape, and click-outside dismissal.
- `aria-label` on every icon-only button, `alt` on every image, visible labels on every form field with inline validation messages announced on touched-and-invalid.
- Dark-mode tokens throughout; the palette is defined in OKLCH so contrast steps are perceptually even in both themes.
- Usable at 360 px width without horizontal scrolling.

---

## Getting started

**Prerequisites:** Node.js ≥ 20.19, npm, and Docker.

```bash
# 1. Databases — dev on 5434, throwaway test DB on 5435
docker compose up -d postgres postgres-test

# 2. API — http://localhost:3000, docs at /api/docs
cd backend
cp .env.example .env
#    generate the two JWT secrets:
#    node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev

# 3. Web app — http://localhost:4200
cd ../frontend
npm install
npm start
```

The dev server proxies `/api` to the API (`proxy.conf.json`), so there is no base URL to configure on the client.

**Seeded accounts** (development only, from `backend/prisma/seed.ts`): `admin`, `alice`, `bob`, `carol` — all with the password `Password123!`. The seed also creates sample stories, comments and likes, and is safe to re-run.

> The database host ports are 5434/5435 rather than 5432/5433 because those are commonly already taken by a locally installed PostgreSQL.

---

## Environment variables

Every variable is validated by a Joi schema at startup — the API **refuses to boot** on a missing or malformed value rather than starting in a broken or insecure state. Documented with placeholders in `backend/.env.example`. `process.env` is read in exactly one place (`src/config/`); everything else goes through `ConfigService`.

| Variable | Required | Default | Purpose and constraint |
|---|---|---|---|
| `DATABASE_URL` | **yes** | — | PostgreSQL connection string; must be a `postgresql://` or `postgres://` URI |
| `PORT` | no | `3000` | API port; must be a valid port number |
| `CORS_ORIGIN` | no | `http://localhost:4200` | The single browser origin allowed to call the API |
| `JWT_ACCESS_SECRET` | **yes** | — | Access-token signing secret; **minimum 16 characters**, no fallback exists |
| `JWT_ACCESS_TTL` | no | `15m` | Access-token lifetime as a duration string |
| `JWT_REFRESH_SECRET` | **yes** | — | Refresh-token signing secret; minimum 16 characters, generated separately from the access secret |
| `JWT_REFRESH_TTL` | no | `7d` | Refresh-token lifetime |
| `BCRYPT_COST` | no | `12` | Password hashing cost; clamped to 10–15 |
| `THROTTLE_TTL` | no | `60000` | Rate-limit window in ms (minimum 1000) |
| `THROTTLE_LIMIT` | no | `10` | Requests allowed per window on `/auth/*` |
| `TEST_DATABASE_URL` | no | — | Override for the disposable e2e database |

---

## Commands

Run these inside the workspace folder they belong to, not the repository root.

**Backend** (`cd backend`)

| Command | Purpose |
|---|---|
| `npm run start:dev` | Development server with reload; Swagger at `/api/docs` |
| `npm run build` / `npm run start:prod` | Compile / run the compiled output |
| `npm run lint` · `npm run lint:fix` | ESLint (read-only) / autofix |
| `npx tsc --noEmit` | Type check |
| `npm test` · `npm run test:watch` · `npm run test:cov` | Unit tests |
| `npm run test:e2e` | End-to-end tests against the disposable database |
| `npm run db:migrate` | `prisma migrate dev` — create and apply a migration |
| `npm run db:validate` | `prisma validate` — schema sanity check |
| `npm run db:seed` | `prisma db seed` — idempotent development data |

**Frontend** (`cd frontend`)

| Command | Purpose |
|---|---|
| `npm start` | Dev server with the API proxy |
| `npm run build` | Production build; bundle budgets enforced |
| `npm run watch` | Development build in watch mode |
| `npm run lint` | ESLint including template accessibility rules |
| `npm test` | Vitest (`CI=true npm test` for a single run) |

---

## Testing

240 tests in total: **82 API unit** (13 suites), **54 API end-to-end** (6 suites), **104 web unit** (17 suites).

**API unit tests** mock at the `PrismaService` boundary — no database, so they run in seconds. Every service is covered on four axes: happy path, not-found, forbidden (ownership *and* role), and conflict/duplicate. Controllers get lightweight specs that assert route wiring and DTO validation behaviour through a real `ValidationPipe`, rather than re-testing service logic.

**API end-to-end tests** drive the real HTTP pipeline with Supertest, against a disposable database whose schema is reset before every run — they can never touch development data. They cover the full auth cycle (signup → login → refresh → protected route → logout), refresh-token rotation and replay rejection, ownership boundaries, admin-only access, pagination and search, cascade deletes, and the idempotent like toggle.

**Web unit tests** cover the pieces with real logic: the auth store (including single-flight refresh), all three guards and their redirects, the refresh interceptor's retry-once behaviour, reactive forms and their validation messaging, pagination controls, admin tables, optimistic like rollback, and the confirm dialog's focus trap. Assertions are made on rendered output, not on internals. Pure presentation components have no specs — coverage isn't inflated with ceremony.

Test names describe behaviour (`rejects deleting another user's story with 403`). No snapshot tests for JSON APIs, no real network, no real clock dependence, no ordering coupling.

---

## Project layout

```
backend/                     NestJS API
  src/
    main.ts                  bootstrap + Swagger document
    app.setup.ts             the global pipeline, shared by main.ts and the e2e tests
    app.module.ts            module wiring + global guards
    config/                  configuration() and the Joi env schema — the only reader of process.env
    common/
      decorators/            @Public, @Roles, @CurrentUser, @ApiPaginatedResponse
      dto/                   PaginationQueryDto, paginated response helpers
      filters/               GlobalExceptionFilter (one error shape; Prisma code mapping)
      guards/                JwtAuthGuard (global), RolesGuard
      interfaces/            AuthUser
    prisma/                  PrismaService (global module, pg driver adapter)
    modules/
      auth/                  signup · login · refresh · logout, JWT + refresh strategies
      users/                 profile, password change, admin user management, stats
      stories/               CRUD + feed listing
      comments/              story-scoped read/create + owner edit/delete + admin moderation
      likes/                 idempotent like/unlike toggle
    health/                  liveness probe
  prisma/
    schema.prisma            models, enums, indexes, cascade rules
    migrations/              versioned SQL
    seed.ts                  idempotent development data
  test/                      e2e specs + disposable-database setup

frontend/                    Angular app
  src/
    styles.css               Tailwind v4 @theme design tokens + base layer
    test-setup.ts            jsdom shims (IntersectionObserver for @defer)
    app/
      app.config.ts          providers: router, HTTP + interceptor chain, session bootstrap
      app.routes.ts          lazy routes with guards and titles
      core/
        api/                 typed clients mirroring the API contract — the only HttpClient callers
        auth/                AuthStore (signals, single-flight refresh) + token storage
        guards/              authGuard, adminGuard, guestGuard
        interceptors/        bearer token · refresh-on-401 · error toast
        models/              API types
      shared/
        layout/              navbar (search, account menu), footer
        ui/                  button · card · confirm-dialog · empty-state · form-field
                             paginator · skeleton · toast · relative-date pipe
      features/
        auth/  stories/  profile/  settings/  admin/  static/

docs/
  API_CONTRACT.md            authoritative HTTP contract for both sides
  MIGRATION_PLAN.md          the rewrite plan and its settled decisions
```

---

## Engineering conventions

The repository encodes its own standards so they don't depend on anyone remembering them. [`.claude/rules/`](.claude/rules/) holds the conventions — REST contract, NestJS architecture, Prisma schema and query rules, Angular and Tailwind standards, and the testing policy — and hooks enforce the parts that can be checked mechanically: Prettier formats on edit, destructive git commands always prompt, and work cannot be reported complete until the code that changed has passed lint, type-check and tests.

Definition of done, both sides:

- **Backend** — `npm run lint`, `npx tsc --noEmit` and `npm test` green; Swagger complete for every touched route; `docs/API_CONTRACT.md` still accurate; `.env.example` updated if configuration changed; `npx prisma validate` when the schema changed.
- **Frontend** — `npm run lint` and `npm run build` green with **no budget warnings** (they count as failures here), plus `npm test` when logic changed.

---

## Documentation

| Document | Contents |
|---|---|
| **`/api/docs`** | Live Swagger UI — generated from the route decorators, so it cannot drift |
| [docs/API_CONTRACT.md](docs/API_CONTRACT.md) | Authoritative HTTP contract, validation rules, and every deliberate deviation from the legacy API |
| [docs/MIGRATION_PLAN.md](docs/MIGRATION_PLAN.md) | The rewrite, phase by phase — settled decisions and what each phase verified |
| [.claude/rules/](.claude/rules/) | Engineering conventions, enforced by hooks |
| `backend/CLAUDE.md`, `frontend/CLAUDE.md` | Per-workspace quick reference |
