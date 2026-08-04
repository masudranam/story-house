# frontend/ — Angular app

Target stack: latest stable Angular (standalone + signals + OnPush everywhere) + Tailwind v4. (If this folder still contains the old React app — `vite.config.ts`, `src/App.tsx` — Phase 0 of `docs/MIGRATION_PLAN.md` hasn't run yet; these rules describe the target.)

@../.claude/rules/40-frontend-angular.md
@../.claude/rules/50-testing.md

## Quick reference

- Dev server: `npm start` (proxies `/api` to the backend — see `proxy.conf.json`)
- Definition of done: `npm run lint` + `npm run build` green (budget warnings count as failures), `npm test` when logic changed.
- All HTTP goes through `src/app/core/api/` services typed against `docs/API_CONTRACT.md`; components never touch `HttpClient`.
- UI standard: Tailwind theme tokens, mobile-first, dark-ready, accessible (landmarks, focus rings, aria-labels, keyboard dialogs), skeleton loaders, optimistic likes.
