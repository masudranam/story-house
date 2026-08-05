# StoryHouse API Contract (v1)

Authoritative HTTP contract for the NestJS backend and the Angular API layer. Base path: **`/api/v1`**. JSON only, camelCase keys, ISO-8601 UTC dates. Swagger UI at `/api/docs` must match this file exactly.

Conventions (see `.claude/rules/20-rest-api.md`): list responses are `{ "data": [...], "meta": { "page", "limit", "totalItems", "totalPages" } }`; errors are `{ "statusCode", "message", "error" }`; JWT guard is global, public routes are marked **Public**.

## Auth — `/auth`

| Method & path | Access | Request | Success | Errors |
|---|---|---|---|---|
| `POST /auth/signup` | Public | `{ name, username, email, password }` | **201** `User` | 400 validation; 409 duplicate username/email |
| `POST /auth/login` | Public | `{ identifier, password }` — identifier = username **or** email | **200** `{ accessToken, refreshToken, user: User }` | 400; 401 bad credentials (same message for unknown user vs wrong password) |
| `POST /auth/refresh` | Public | `{ refreshToken }` | **200** `{ accessToken, refreshToken }` (rotation: old refresh token is revoked) | 401 invalid/expired/revoked |
| `POST /auth/logout` | Bearer | `{ refreshToken }` | **204** (revokes the refresh token) | 401 |

Validation: `username` `/^[a-z0-9_]{3,30}$/` (one rule for signup **and** login — legacy had two conflicting regexes); `password` min 8 chars; `name` 1–100 chars; `email` valid format. Access token TTL 15m, refresh 7d. Token is a bare JWT — **no** `"Bearer "` prefix inside the value (legacy embedded it). Every `/auth` route is rate-limited and may additionally return **429** `Too Many Requests`. Refresh tokens are strictly single-use (atomic rotation — concurrent reuse loses).

## Users — `/users`

| Method & path | Access | Request | Success | Errors |
|---|---|---|---|---|
| `GET /users/me` | Bearer | — | **200** `User` (incl. email) | 401 |
| `PATCH /users/me` | Bearer | `{ name?, username? }` | **200** `User` | 400; 409 duplicate username |
| `PATCH /users/me/password` | Bearer | `{ currentPassword, newPassword }` | **204** | 400 (new = old, or too weak); 401 wrong current password |
| `DELETE /users/me` | Bearer | — | **204** | 403 if ADMIN (admins can't self-delete — legacy rule kept) |
| `GET /users/:id` | Bearer | uuid param | **200** `PublicUser` (no email) | 404 |
| `GET /users` | **ADMIN** | `?page&limit&search&role` — search matches username OR name OR email (legacy ANDed them: bug, fixed) | **200** `{ data: User[], meta }` | 403 |
| `DELETE /users/:id` | **ADMIN** | uuid param | **204** (cascades stories/comments/likes) | 403 own account; 404 |
| `GET /users/stats` | **ADMIN** | — | **200** `{ totalUsers, totalStories, totalComments, newUsersThisWeek, newStoriesThisWeek }` | 403 |

`User`: `{ id, name, username, email, role: "USER"|"ADMIN", createdAt, updatedAt }`. `PublicUser`: same minus `email`. Password/hash never serialized. Identity always derives from the JWT — no user id in URLs for self-operations (legacy `PATCH /users/change-password/:id` ignored `:id`; the IDOR-shaped route is gone). A successful password change revokes **all** of the user's refresh tokens — other sessions must log in again.

## Stories — `/stories`

| Method & path | Access | Request | Success | Errors |
|---|---|---|---|---|
| `GET /stories` | Public | `?page&limit&search&authorId&sort` — `search` filters title (contains, case-insensitive); `sort` = `createdAt:asc\|desc` (default `desc`) | **200** `{ data: Story[], meta }` | 400 |
| `POST /stories` | Bearer | `{ title, content }` | **201** `Story` | 400; 401 |
| `GET /stories/:id` | Public | uuid param | **200** `Story` (+ `likedByMe` when authenticated) | 404 |
| `PATCH /stories/:id` | Owner | `{ title?, content? }` | **200** `Story` | 403 not owner; 404 |
| `DELETE /stories/:id` | Owner or ADMIN | uuid param | **204** (cascades comments/likes) | 403; 404 |

`Story`: `{ id, title, content, author: PublicUserLite, likesCount, commentsCount, createdAt, updatedAt }` where `PublicUserLite` = `{ id, name, username }`. Counts come from a grouped query (`_count`) — no N+1, and **author email is no longer exposed** (legacy leaked it in every list). Legacy field `description` is renamed `content`; `lastModifierId`/`lastModificationTime` are dropped (`updatedAt` covers it). Editing is owner-only (legacy allowed admin edits the UI never used — deliberate change); moderation = delete.

### Comments under stories

| Method & path | Access | Request | Success | Errors |
|---|---|---|---|---|
| `GET /stories/:id/comments` | Public | `?page&limit` (newest first) | **200** `{ data: Comment[], meta }` | 404 story |
| `POST /stories/:id/comments` | Bearer | `{ content }` (1–2000 chars) | **201** `Comment` | 400; 401; 404 story |

### Likes under stories (idempotent toggle pair)

| Method & path | Access | Success | Errors |
|---|---|---|---|
| `PUT /stories/:id/like` | Bearer | **204** (idempotent — double-like is not an error; legacy 500 'Already liked' is gone) | 401; 404 story |
| `DELETE /stories/:id/like` | Bearer | **204** (idempotent) | 401; 404 story |

Like count and `likedByMe` ship inside `Story` — the legacy `GET /likes/:storyId`, `GET /likes/liked/:storyId` (bare-boolean body) and `GET /likes` (public full-table dump) endpoints have no successors.

## Comments — `/comments` (edit/delete + admin moderation)

| Method & path | Access | Request | Success | Errors |
|---|---|---|---|---|
| `GET /comments` | **ADMIN** | `?page&limit&search&storyId` — search matches content OR author username (legacy sent both params with the same value; unified) | **200** `{ data: Comment[], meta }` | 403 |
| `PATCH /comments/:id` | Owner | `{ content }` | **200** `Comment` | 400; 403; 404 |
| `DELETE /comments/:id` | Owner or ADMIN | uuid param | **204** | 403; 404 |

`Comment`: `{ id, content, storyId, author: { id, name, username }, createdAt, updatedAt }`. Comments are flat (no threading — matches legacy). Comment edits now bump `updatedAt` (legacy had no edit timestamp).

## Additional deliberate changes from legacy behavior

- **Admin can no longer rename other users** (legacy `PUT /users/:id` allowed owner-or-admin). The legacy UI never exposed admin-rename; profile edits are self-service via `PATCH /users/me` (which now also allows editing `name` — legacy couldn't).
- **Story lists sort by `createdAt`**, not legacy's `updatedAt` — editing a story no longer bumps it to the top of the feed.
- **Comment search (content/author) is admin-only** (`GET /comments`); legacy exposed it publicly but only the admin panel used it. Public reads are story-scoped (`GET /stories/:id/comments`).
- **Admin comment/story *editing* is gone** — moderation is delete-only; edits are owner-only.
- `GET /users` (list/search) and `GET /users/stats` require **ADMIN** — legacy served the full user list (with emails!) publicly and stats to any authenticated user.

## Deliberately removed legacy endpoints (security/design fixes — do NOT port)

- `GET /users/auth` — publicly returned **every user's bcrypt hash**.
- `DELETE /users`, `DELETE /stories`, `DELETE /comments` — unauthenticated mass deletes.
- `GET /likes` — unbounded public dump of the likes table.
- XML/HTML/plain content negotiation (`js2xmlparser`) — JSON only now.
- `GET /` hello endpoint → replaced by `GET /api/v1/health` (Public, `{ status: "ok" }`).

## Status-code translation table (legacy → new)

| Legacy behavior | New |
|---|---|
| Business errors as 500 (`{error}` body) — duplicates, bad credentials, not-found, already-liked | 409 / 401 / 404 / 204-idempotent respectively |
| 403 for missing token, 500 for invalid/expired token | 401 for all three |
| 401 for ownership failures ("Unauthorized to perform action") | 403 |
| 200 + `{message}` on deletes | 204, no body |
| Mixed envelopes: `{count,rows}` / `{rows,count}` / `{story}` / raw entity / bare boolean / bare number | Resource or `{data, meta}` — nothing else |
| 404 for empty collections | 200 with empty `data` |
