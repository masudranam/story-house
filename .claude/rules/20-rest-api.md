# REST API standard (backend + frontend must both follow)

The HTTP contract in `docs/API_CONTRACT.md` is authoritative. Any change to it must update that file, the Swagger decorators, and the Angular services in the same task.

## URLs

- Base path: `/api/v1` (set as global prefix + URI versioning in NestJS).
- Resources are plural kebab-case nouns: `/api/v1/stories`, `/api/v1/users`, `/api/v1/auth`.
- No verbs in paths. Actions are expressed by method + resource:
  - `GET /stories` (list, filterable), `GET /stories/:id`, `POST /stories`, `PATCH /stories/:id`, `DELETE /stories/:id`
  - Sub-resources for relations: `GET /stories/:id/comments`, `POST /stories/:id/comments`
  - Likes are a sub-resource toggle owned by the current user: `PUT /stories/:id/like`, `DELETE /stories/:id/like`
  - Auth endpoints: `POST /auth/signup`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`; current user: `GET /users/me`, `PATCH /users/me`, `PATCH /users/me/password`
- Route params validated with `ParseIntPipe`/`ParseUUIDPipe` to match the Prisma ID type.

## Status codes

- 200 read/update, 201 create, 204 delete and like/unlike (no body).
- 400 validation, 401 unauthenticated, 403 authenticated but not allowed (ownership/role), 404 missing resource, 409 conflict (duplicate email/username), 422 only if semantically invalid despite correct shape.
- Never return 200 with an error payload, and never 500 for expected failures.

## Response shape

- Success responses return the resource (or list envelope) directly — no `{ success, message, data }` wrapper.
- List endpoints always paginate: query `?page=1&limit=10&sort=createdAt:desc` plus resource filters; response `{ "data": [...], "meta": { "page", "limit", "totalItems", "totalPages" } }`.
- Errors use the NestJS standard shape `{ "statusCode", "message", "error" }`; `message` is a string array for validation errors. One global exception filter guarantees this — controllers never hand-build error bodies.
- JSON only. camelCase keys. Dates as ISO-8601 UTC strings. Passwords and password hashes never appear in any response (enforce with response DTOs + `ClassSerializerInterceptor` or explicit Prisma `select`).

## Auth

- `Authorization: Bearer <accessToken>` on protected routes. Access token short-lived (15m), refresh token long-lived (7d) — refresh via `POST /auth/refresh`.
- Public routes are the exception, marked explicitly (`@Public()` decorator); the JWT guard is global by default.
- Ownership rules: users may modify only their own stories/comments/profile; `ADMIN` role may moderate (delete) any story/comment and manage users.

## Swagger (required, not optional)

- Every controller: `@ApiTags`. Every route: `@ApiOperation({ summary })` + `@ApiResponse` for each status it can return. Every DTO property: `@ApiProperty` with example. Protected routes: `@ApiBearerAuth()`.
- Swagger UI at `/api/docs`. A route without complete Swagger annotation is an unfinished route.
