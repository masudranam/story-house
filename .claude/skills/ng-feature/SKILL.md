---
name: ng-feature
description: Scaffold a lazy-loaded Angular feature (routes, standalone components, signals state, typed API service, guards, Tailwind UI) that follows the StoryHouse frontend rules. Use when adding a new frontend feature area.
argument-hint: "<feature-name> [notes about pages/flows]"
---

Scaffold feature `$ARGUMENTS` under `frontend/src/app/features/`.

Read first: `.claude/rules/40-frontend-angular.md`, `.claude/rules/20-rest-api.md`, `docs/API_CONTRACT.md` for the endpoints involved, and one existing feature (e.g. `stories/`) as the style reference.

Generate:
- `features/<name>/<name>.routes.ts` — child routes with `loadComponent`, route `title` on every page, guards (`authGuard`/`adminGuard`/`guestGuard`) where the contract requires auth; wire into `app.routes.ts` via `loadChildren`.
- One standalone component per page in `features/<name>/pages/`, presentational pieces in `features/<name>/components/`. Every component: `ChangeDetectionStrategy.OnPush`, signals (`signal`/`computed`, `input()`/`output()`), new control flow with `track`, template in `.html` when >15 lines.
- Data access via a typed service in `core/api/` (extend it if the endpoints already exist there — never call HttpClient from components). List pages use the shared paginator + skeleton loader; mutations get optimistic UI where the rules call for it.
- Forms: typed reactive forms, inline validation messages on touched+invalid, pending-disabled submit, server errors mapped to fields.
- UI: Tailwind theme tokens only, mobile-first, dark-variant classes, semantic landmarks, one `h1`, aria-labels on icon buttons, focus-visible rings, `@defer (on viewport)` for below-the-fold blocks, `NgOptimizedImage` for images.

Add specs for anything with logic (services, guards, forms, pagination) per `.claude/rules/50-testing.md`.

Verify: `npm run lint` and `npm run build` in `frontend/` (budget warnings = failures), `npm test` if logic was added. Report results honestly.
