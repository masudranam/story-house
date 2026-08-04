# Testing rules

## Backend (Jest — ships with Nest)

- Every service has a spec covering: happy path, not-found, forbidden (ownership/role), and conflict/duplicate branches. Prisma is mocked at the `PrismaService` boundary (no DB in unit tests).
- Every controller has a lightweight spec: route wiring + DTO validation behavior (use `ValidationPipe` in the test) — not a re-test of service logic.
- One e2e spec per module under `test/` using `@nestjs/testing` + `supertest`, run against a disposable schema (`prisma migrate reset --force` on a test database URL). Auth e2e covers signup → login → refresh → protected route → logout.
- Test names describe behavior: `it('rejects deleting another user's story with 403')`. No snapshot tests for JSON APIs.

## Frontend (unit via ng test)

- Services and guards: test token handling, refresh single-flight, guard redirects.
- Components with logic (forms, pagination, admin tables): test via `TestBed` + harness-style DOM queries; assert on rendered output, not implementation details.
- Pure presentation components don't need specs; don't write ceremony tests to inflate coverage.

## General

- New logic lands with its tests in the same task — plan tasks are not done with failing or skipped tests.
- Never weaken an assertion to make a test pass; fix the code or challenge the test's premise explicitly.
- Deterministic tests only: no real network, no real clock dependence (use fake timers), no test order coupling.
