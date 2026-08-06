# StoryHouse frontend

Angular 21 (standalone, zoneless, signals) + Tailwind CSS v4. Consumes the API described in [../docs/API_CONTRACT.md](../docs/API_CONTRACT.md).

```bash
npm install
npm start          # http://localhost:4200 — proxies /api to http://localhost:3000
```

The backend must be running (see [../backend/README.md](../backend/README.md)); `proxy.conf.json` forwards `/api` to it, so there is no API base URL to configure.

## Checks

| Command         | Purpose                                                           |
| --------------- | ----------------------------------------------------------------- |
| `npm run lint`  | ESLint + angular-eslint, including template accessibility rules   |
| `npm run build` | Production build — budget warnings count as failures              |
| `npm test`      | Vitest unit/component tests (`CI=true npm test` for a single run) |

## Layout

```
src/app/
  core/       api services, models, auth store, interceptors, guards
  shared/     dumb UI kit (button, card, form-field, dialog, toast, paginator, skeleton) + layout
  features/   auth · stories · profile · settings · admin · static   (all lazy-loaded)
```

Conventions are enforced by [../.claude/rules/40-frontend-angular.md](../.claude/rules/40-frontend-angular.md): standalone components with `OnPush`, signals for state, new control flow (`@if`/`@for`/`@defer`), `inject()`, Tailwind design tokens from `src/styles.css`, and no component library.

## Auth model

The access token lives only in memory (an `AuthStore` signal). The refresh token is persisted — `localStorage` when "keep me logged in" is checked, otherwise `sessionStorage`. A 401 on a protected call triggers a single-flight refresh and one retry; if that fails the session is cleared and the user is sent to `/login`.
