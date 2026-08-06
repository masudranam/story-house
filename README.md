# StoryHouse

**A story-sharing platform — write, publish, and discuss short stories.**

Readers browse a public feed, authors publish and edit their own work, everyone can comment and like, and administrators moderate the community from a dedicated panel. Built as a NestJS API and an Angular single-page app.

---

## Table of contents

- [Features](#features)
- [Screens](#screens)
- [API surface](#api-surface)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Commands](#commands)
- [Data model](#data-model)
- [Security model](#security-model)
- [Project layout](#project-layout)
- [Testing](#testing)
- [Documentation](#documentation)

---

## Features

### Accounts and sessions
- **Sign up** with name, username, email and password. Usernames are `a–z`, `0–9`, `_`, 3–30 characters; passwords are at least 8. Duplicate username or email is rejected with a clear inline message.
- **Log in with either your username or your email** — one field, either identifier.
- **"Keep me logged in"** decides whether your session survives closing the browser (persistent vs. per-tab storage). The access token itself is never written to storage.
- **Silent session renewal.** Access tokens are short-lived; the app renews them in the background on the first 401 and retries the request once, so you are not interrupted mid-action.
- **Change your password** — every *other* session is signed out immediately, while the session you're using continues working.
- **Delete your account**, which removes your stories, comments and likes with it. Administrators cannot delete their own account.
- **Log out**, which revokes the refresh token server-side rather than only forgetting it locally.

### Stories
- **Public feed** — anyone, signed in or not, can browse published stories. Paginated 9 per page.
- **Search by title** from the navbar. The term lives in the URL (`?q=`), so results are shareable and survive a reload.
- **Sort** newest-first (default) or oldest-first.
- **Story detail** shows the full text, author, publication date, an "updated" marker for edited stories, like count and comment count.
- **Write a story** with a title (≤ 200 chars) and body. Authorship comes from your session — it cannot be spoofed by the client.
- **Edit your own story.** Opening the editor never shows a blank form that a slow response could overwrite, and editing a second story always loads that story's text.
- **Delete** your own story; administrators may delete any story. Deleting cascades to its comments and likes.
- Each card shows an excerpt, author link, relative date, and like/comment counts, with edit/delete offered only to those permitted.

### Comments
- **Read comments** on any story without an account, newest first, paginated.
- **Post a comment** when signed in (up to 2000 characters, with inline validation).
- **Edit your own comment** inline; edited comments are marked, and the edit timestamp is real.
- **Delete** your own comment; administrators may delete any comment.

### Likes
- **Like or unlike** any story with one click. The UI updates instantly and rolls back if the server rejects it.
- **Idempotent** — liking twice counts once, unliking something you never liked is not an error.
- Each viewer sees their own like state; the count is the same for everyone, including anonymous readers.

### Profiles
- **Your profile** shows your name, username, email, join date, and your stories (paginated, searchable), with quick links to write a story or edit your details.
- **Other people's profiles** show the same minus the email address — contact details are never exposed to other users.

### Settings
- **Profile tab** — change your display name and username. Save stays disabled until something actually changes; a taken username is reported inline.
- **Security tab** — change your password (with show/hide toggles on both fields) and delete your account behind a confirmation dialog.
- Both tabs are directly linkable (`/settings`, `/settings/security`) and keyboard-navigable.

### Administration
- **Guarded** — `/admin` requires the `ADMIN` role, enforced on both the client route and every server endpoint.
- **Dashboard** — total users, stories and comments, plus new users and new stories this week; each card links to its list.
- **Users** — searchable, role-filterable table with join dates and role badges. Delete any account except your own.
- **Stories** — searchable, sortable table with author and engagement counts; remove any story.
- **Comments** — search by comment text *or* commenter username, with click-through to the parent story; remove any comment.
- Moderation is **delete-only**: administrators never edit another person's words.

### Throughout
- Responsive from 360 px up, dark-mode ready, and keyboard accessible: skip-to-content link, semantic landmarks, visible focus rings, labelled controls, ARIA dialogs with focus traps, and arrow-key menus and tabs.
- Skeleton placeholders while data loads, empty states with a call to action, confirmation dialogs before anything destructive, and toast notifications for outcomes.
- Lazy-loaded routes and viewport-deferred comments keep the initial bundle small.

---

## Screens

| Route | Access | What it does |
|---|---|---|
| `/` | Public | Story feed — search, sort, paginate |
| `/stories/:id` | Public | Story detail, likes, comments |
| `/stories/new` | Signed in | Write a story |
| `/stories/:id/edit` | Author | Edit a story |
| `/login`, `/signup` | Signed out | Authentication |
| `/profile`, `/profile/:id` | Signed in | Own / another user's profile |
| `/settings`, `/settings/security` | Signed in | Profile and security settings |
| `/admin` | Admin | Dashboard |
| `/admin/users`, `/admin/stories`, `/admin/comments` | Admin | Moderation |
| `/about` | Public | About the project |
| anything else | Public | 404, inside the app shell |

---

## API surface

Base path `/api/v1`. Interactive documentation at **`/api/docs`** (Swagger). The authoritative specification is [docs/API_CONTRACT.md](docs/API_CONTRACT.md).

| Method & path | Access | Purpose |
|---|---|---|
| `POST /auth/signup` | Public | Create an account |
| `POST /auth/login` | Public | Exchange credentials for tokens |
| `POST /auth/refresh` | Public | Rotate the refresh token |
| `POST /auth/logout` | Bearer | Revoke a refresh token |
| `GET /users/me` · `PATCH /users/me` | Bearer | Read / update own profile |
| `PATCH /users/me/password` | Bearer | Change password, receive replacement tokens |
| `DELETE /users/me` | Bearer | Delete own account |
| `GET /users/:id` | Bearer | Public profile (no email) |
| `GET /users` · `DELETE /users/:id` · `GET /users/stats` | Admin | User management and platform statistics |
| `GET /stories` · `POST /stories` | Public / Bearer | List and publish |
| `GET /stories/:id` · `PATCH` · `DELETE` | Public / Author / Author-or-admin | Read, edit, remove |
| `GET /stories/:id/comments` · `POST` | Public / Bearer | Read and add comments |
| `PATCH /comments/:id` · `DELETE /comments/:id` | Author / Author-or-admin | Edit and remove |
| `GET /comments` | Admin | Moderation search |
| `PUT /stories/:id/like` · `DELETE` | Bearer | Like / unlike (idempotent) |
| `GET /health` | Public | Liveness probe |

Responses return the resource directly; lists use `{ data, meta }`. Errors are always `{ statusCode, message, error }`.

---

## Tech stack

| Layer | Choice |
|---|---|
| API | NestJS 11, TypeScript strict mode |
| Database | PostgreSQL 16 via Prisma 7 |
| Auth | Passport JWT — access + rotating refresh tokens, bcrypt hashing |
| Docs | Swagger / OpenAPI, generated from decorators |
| Web | Angular 21 — standalone components, signals, zoneless change detection |
| Styling | Tailwind CSS v4 with design tokens; no component library |
| Tests | Jest + Supertest (API), Vitest + TestBed (web) |

---

## Getting started

**Prerequisites:** Node.js ≥ 20.19, npm, and Docker.

```bash
# 1. Databases (dev on 5434, throwaway test DB on 5435)
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

The web app proxies `/api` to the API, so there is no base URL to configure.

**Seeded accounts** (development only, from `backend/prisma/seed.ts`): `admin`, `alice`, `bob`, `carol` — all with the password `Password123!`. The seed also creates sample stories, comments and likes, and is safe to re-run.

> The database ports are 5434/5435 rather than the usual 5432/5433 because those are commonly already taken by a locally installed PostgreSQL.

---

## Environment variables

All are validated at startup — the API refuses to boot on a missing or malformed value. Documented in `backend/.env.example`.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | API port (default 3000) |
| `CORS_ORIGIN` | Allowed browser origin (default `http://localhost:4200`) |
| `JWT_ACCESS_SECRET` | Signing secret for access tokens — **required, no default** |
| `JWT_ACCESS_TTL` | Access token lifetime (default `15m`) |
| `JWT_REFRESH_SECRET` | Signing secret for refresh tokens — **required, no default** |
| `JWT_REFRESH_TTL` | Refresh token lifetime (default `7d`) |
| `BCRYPT_COST` | Password hashing cost (default 12) |
| `THROTTLE_TTL` / `THROTTLE_LIMIT` | Rate-limit window and allowance for `/auth/*` |
| `TEST_DATABASE_URL` | Optional override for the e2e database |

---

## Commands

**Backend** (`cd backend`)

| Command | Purpose |
|---|---|
| `npm run start:dev` | Development server with reload |
| `npm run lint` / `lint:fix` | Lint (read-only) / autofix |
| `npx tsc --noEmit` | Type check |
| `npm test` | Unit tests |
| `npm run test:e2e` | End-to-end tests against the disposable database |
| `npm run db:migrate` / `db:seed` / `db:validate` | Prisma workflow |

**Frontend** (`cd frontend`)

| Command | Purpose |
|---|---|
| `npm start` | Dev server with API proxy |
| `npm run lint` | ESLint incl. template accessibility rules |
| `npm run build` | Production build (bundle budgets enforced) |
| `npm test` | Vitest (`CI=true npm test` for one run) |

---

## Data model

```
User ──< Story ──< Comment
 │        └──< Like >── User
 └──< RefreshToken
```

| Table | Notable columns |
|---|---|
| `users` | unique `username` / `email`, `password_hash`, `role` (`USER`/`ADMIN`), `token_version`, `password_changed_at` |
| `stories` | `title`, `content`, `author_id`, indexed on author and creation date |
| `comments` | `content`, `story_id`, `author_id`, `updated_at` |
| `likes` | composite primary key `(user_id, story_id)` — one like per person per story |
| `refresh_tokens` | SHA-256 `token_hash`, `expires_at`, `revoked_at` |

Deleting a user removes their stories, comments, likes and tokens; deleting a story removes its comments and likes. Every relation declares its cascade explicitly.

---

## Security model

- **Passwords** are bcrypt-hashed (cost 12 by default) and never leave the database — every query that feeds a response names its columns explicitly.
- **Access tokens** live 15 minutes in browser memory only. **Refresh tokens** live 7 days, are stored only as SHA-256 hashes, and are **single-use**: presenting one rotates it, and a concurrent replay loses an atomic claim rather than minting a second session.
- **Identity is resolved from the database on every request**, so deleting a user or changing a role takes effect immediately instead of lingering for the token's lifetime.
- **Password changes invalidate outstanding tokens** by bumping a version counter — an integer comparison with no clock-skew window — while handing the acting session replacement credentials.
- **Login is uniform** for unknown accounts and wrong passwords, in both message and response time, so it cannot be used to enumerate accounts.
- **Authorisation** is enforced server-side: protected by default with explicit public routes, role checks for administration, and ownership checks for editing. The UI only decides what to *show*.
- **Rate limiting** on `/auth/*`, `helmet` security headers, and CORS restricted to the configured origin.
- Secrets come from validated configuration only; no fallback values exist in code, and `.env` is git-ignored.

---

## Project layout

```
backend/          NestJS API
  src/modules/    auth · users · stories · comments · likes
  src/common/     guards, decorators, filters, shared DTOs
  src/config/     validated configuration (the only reader of process.env)
  prisma/         schema, migrations, seed
  test/           end-to-end suites
frontend/         Angular app
  src/app/core/     API clients, models, auth store, interceptors, guards
  src/app/shared/   UI kit and layout
  src/app/features/ auth · stories · profile · settings · admin · static
docs/             API contract and migration plan
legacy/           previous Express + React implementation (reference only)
```

---

## Testing

The suites cover behaviour, not implementation: ownership and role rules, token rotation and revocation, validation boundaries, pagination and search, optimistic UI rollback, and accessibility affordances such as dialog focus traps.

End-to-end API tests run against a disposable database that is reset before each run, so they never touch development data.

---

## Documentation

| Document | Contents |
|---|---|
| [docs/API_CONTRACT.md](docs/API_CONTRACT.md) | Authoritative HTTP contract for both sides |
| [docs/MIGRATION_PLAN.md](docs/MIGRATION_PLAN.md) | Rewrite plan and status |
| [.claude/rules/](.claude/rules/) | Engineering conventions, enforced by hooks |
| `backend/README.md`, `frontend/README.md` | Per-workspace details |

`legacy/` holds the previous Express + React implementation. It is kept as a reference until the rewrite is signed off and is not part of the build.
