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
| `PATCH /users/me/password` | Bearer | `{ currentPassword, newPassword }` | **200** `{ accessToken, refreshToken }` — replacements for the caller | 400 (new = old, or too weak); 401 wrong current password |
| `DELETE /users/me` | Bearer | — | **204** | 403 if ADMIN (admins can't self-delete — legacy rule kept) |
| `GET /users/:id` | Bearer | uuid param | **200** `PublicUser` (no email) | 404 |
| `GET /users` | **ADMIN** | `?page&limit&search&role` — search matches username OR name OR email (legacy ANDed them: bug, fixed) | **200** `{ data: User[], meta }` | 403 |
| `DELETE /users/:id` | **ADMIN** | uuid param | **204** (cascades stories/comments/likes) | 403 own account; 404 |
| `GET /users/stats` | **ADMIN** | — | **200** `{ totalUsers, totalStories, totalComments, newUsersThisWeek, newStoriesThisWeek }` | 403 |

`User`: `{ id, name, username, email, role: "USER"|"ADMIN", createdAt, updatedAt }`. `PublicUser`: same minus `email`. Password/hash never serialized. Identity always derives from the JWT — no user id in URLs for self-operations (legacy `PATCH /users/change-password/:id` ignored `:id`; the IDOR-shaped route is gone). A successful password change signs out **every other session immediately** — it revokes all refresh tokens and bumps the user's `tokenVersion`, which invalidates every previously issued access token (no waiting out the 15-minute TTL). Because that also invalidates the caller's own credentials, the endpoint returns a **replacement token pair**, which the client swaps in; the acting session continues uninterrupted.

Invalidation is a **version comparison, not a timestamp** one: the access token carries `tokenVersion` and the guard rejects any value that isn't current. A timestamp check would depend on clock resolution and leave a sub-second window in which a token minted just before the change still passed.

The JWT guard resolves the principal from the database on every request, so a deleted user's token yields **401** and a role change takes effect at once (no stale `ADMIN` claim).

## Stories — `/stories`

| Method & path | Access | Request | Success | Errors |
|---|---|---|---|---|
| `GET /stories` | Public | `?page&limit&search&authorId&sort` — `search` filters title (contains, case-insensitive); `sort` = `createdAt:asc\|desc` (default `desc`) | **200** `{ data: Story[], meta }` | 400 |
| `POST /stories` | Bearer | `{ title, content }` | **201** `Story` | 400; 401 |
| `GET /stories/:id` | Public | uuid param | **200** `Story` (+ `likedByMe` when authenticated) | 400 malformed uuid; 404 |
| `PATCH /stories/:id` | Owner | `{ title?, content? }` | **200** `Story` | 400 validation/uuid; 403 not owner; 404 |
| `DELETE /stories/:id` | Owner or ADMIN | uuid param | **204** (cascades comments/likes) | 400 malformed uuid; 403; 404 |

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

## Deliberate UI changes from the legacy frontend

Recorded from the Phase 13 parity audit; each is a fix, not a gap:

- **Other users' emails are no longer shown.** Legacy printed `Email :` on every profile, including other people's. Public profiles now omit it entirely (the API doesn't even send it).
- **Story detail is genuinely public.** Legacy's detail page called auth-only like endpoints and replaced the whole page with an error for logged-out readers — the story was unreachable. Likes/counts now come with the story itself.
- **Admin routes are guarded.** Legacy gated `/admin` only by hiding a navbar link; any logged-in user could open the full panel.
- **Search actually filters everywhere.** Legacy's admin Users/Posts/Comments searches were no-ops or self-cancelling (`content` AND `author`); one term now filters each list server-side.
- **Feed sorts by `createdAt`** (labelled Newest/Oldest first, newest by default). Legacy sorted by `updatedAt` and defaulted to oldest-first under a misleading label.
- **Every destructive action confirms in a real dialog** (message, backdrop, focus trap, Escape) and every admin action reports success. Legacy had two inconsistent confirm widgets, one with no question text, and silent admin deletes.
- **Comment timestamps show a date** (relative), not time-only; edited comments are marked.
- **Dead legacy surfaces are not ported**: the unrouted Contact page, the duplicate `UserContext`/`ToastConfig`, `/admin/settings/info`, and the `scrollToComment` router state nothing consumed.
- **Kept deliberately**: admins may delete any user except themselves (legacy hid delete for all admins), and admin moderation is delete-only — admins never edit others' content.

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
