# Backend rules — NestJS

Applies to everything under `backend/`.

## Architecture

- One feature module per resource: `src/modules/{auth,users,stories,comments,likes}/`, each containing `*.controller.ts`, `*.service.ts`, `dto/`, and `entities/` (response models). Shared code lives in `src/common/` (guards, decorators, filters, interceptors, pipes) and `src/config/`. Prisma access goes through `src/prisma/prisma.service.ts` (global module).
- Controllers are thin: route + DTO + service call + Swagger decorators. No business logic, no Prisma calls, no try/catch for control flow.
- Services own business logic and throw NestJS `HttpException` subclasses (`NotFoundException`, `ForbiddenException`, `ConflictException`, ...). They receive typed params, never `req`/`res`.
- No repository layer on top of Prisma — the Prisma client *is* the repository. Extract query helpers into the service only when reused.
- Constructor injection only; no `@Inject()` string tokens unless unavoidable; no circular deps (`forwardRef` is a design smell — restructure instead).

## DTOs & validation

- Every request body/query has a DTO class in the module's `dto/` folder using `class-validator` + `class-transformer`. Global `ValidationPipe` with `{ whitelist: true, forbidNonWhitelisted: true, transform: true }` in `main.ts`.
- Update DTOs use `PartialType(CreateXDto)` from `@nestjs/swagger` (keeps Swagger metadata).
- Pagination/filter DTOs share a base `PaginationQueryDto` in `src/common/dto/`.
- Response DTOs (entities) are classes with `@ApiProperty` and `@Exclude()` on sensitive fields; controllers return these, never raw Prisma objects.

## Config & security

- All env access through `@nestjs/config` with a validated schema (fail fast on missing vars) — never `process.env` outside `src/config/`.
- Required env vars are documented in `.env.example` (placeholders only, never real values).
- `helmet`, CORS restricted to the frontend origin from config, and request rate limiting (`@nestjs/throttler`) on `/auth/*`.
- Passwords hashed with `bcrypt` (cost ≥ 10). JWT via `@nestjs/jwt` + Passport strategies (`jwt`, refresh token strategy). Secrets from config only.

## Naming & style

- Files: `stories.controller.ts`, `stories.service.ts`, `create-story.dto.ts`, `story.entity.ts`. Classes: `StoriesController`, `CreateStoryDto`. kebab-case files, PascalCase classes, camelCase members.
- Strict TypeScript (`strict: true`); no `any`, no non-null assertions to silence errors, no `as unknown as`.
- Async/await everywhere; no floating promises (`@typescript-eslint/no-floating-promises` stays on).
- Prettier + ESLint configs at `backend/` root are the law; don't inline-disable rules without a comment explaining why.

## Definition of done for a backend task

lint + `tsc --noEmit` + tests green, Swagger complete for touched routes, `docs/API_CONTRACT.md` still accurate, `.env.example` updated if config changed.
