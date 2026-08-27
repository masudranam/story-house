---
name: nest-module
description: Scaffold a complete NestJS resource module (controller, service, DTOs, entity, specs, Swagger, wiring) that follows the StoryHouse backend rules. Use when adding a new backend resource/module.
argument-hint: "<resource-name-plural> [notes about fields/relations]"
---

Scaffold a production-complete NestJS module for resource `$ARGUMENTS` under `backend/src/modules/`.

Read first: `.claude/rules/10-backend-nestjs.md`, `.claude/rules/20-rest-api.md`, `.claude/rules/30-prisma.md`, and one existing module (e.g. `stories/`) as the style reference — new modules must be indistinguishable in structure from existing ones.

Generate (kebab-case files, plural module name):
- `<name>.module.ts` — imports PrismaModule implicitly via global module; register in `app.module.ts`.
- `<name>.controller.ts` — thin routes with `@ApiTags`, `@ApiOperation`, `@ApiResponse` per status, `@ApiBearerAuth` on protected routes, `@Public()` only where the contract says so; params via `ParseIntPipe`/`ParseUUIDPipe`.
- `<name>.service.ts` — business logic, Nest exceptions, PrismaService via constructor injection, `select`-discipline, paginated list via `$transaction([findMany, count])`.
- `dto/create-<singular>.dto.ts`, `dto/update-<singular>.dto.ts` (PartialType from `@nestjs/swagger`), `dto/<name>-query.dto.ts` extending the shared `PaginationQueryDto`; class-validator on every property with `@ApiProperty` examples.
- `entities/<singular>.entity.ts` — response model, `@Exclude()` on anything sensitive.
- `<name>.service.spec.ts` + `<name>.controller.spec.ts` per `.claude/rules/50-testing.md`.

If the resource needs a new Prisma model: update `schema.prisma` per the Prisma rules, run `npx prisma migrate dev --name add_<name>`, `npx prisma generate`, and extend `prisma/seed.ts`.

Finish by updating `docs/API_CONTRACT.md` with the new endpoints, then verify: `npm run lint`, `npx tsc --noEmit`, `npm test` in `backend/`. Report results honestly.
