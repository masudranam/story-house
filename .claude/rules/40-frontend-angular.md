# Frontend rules — Angular + Tailwind

Applies to everything under `frontend/`.

## Angular baseline

- Latest stable Angular via `ng new` (standalone, no NgModules). Strict mode on. Zoneless change detection if the scaffolded version supports it as stable; otherwise `provideZoneChangeDetection({ eventCoalescing: true })`.
- Standalone components only, `changeDetection: ChangeDetectionStrategy.OnPush` on **every** component. No exceptions.
- Signals are the state primitive: `signal`/`computed`/`effect` for local state, `input()`/`output()`/`model()` instead of decorators, `toSignal()` to bridge HttpClient observables at the edge. No RxJS state soup in components; RxJS stays inside services where streams genuinely help.
- New control flow only: `@if`, `@for` (always with `track`), `@switch`, `@defer`. Never `*ngIf`/`*ngFor`.
- `inject()` over constructor injection in components/services.

## Structure

```
src/app/
  core/            # singletons: api services, auth store, interceptors, guards
  shared/          # dumb reusable UI (button, card, dialog, toast, paginator, skeleton)
  features/
    auth/  stories/  profile/  settings/  admin/  static/   # one folder per feature, lazy-loaded
```
- Routes: `app.routes.ts` lazy-loads every feature via `loadChildren`/`loadComponent`. Guards: `authGuard`, `adminGuard`, `guestGuard` as functional guards. Route-level `title` set for every page.
- One generated/typed API layer in `core/api/` mirroring `docs/API_CONTRACT.md`; components never call `HttpClient` directly.
- Functional interceptors: attach bearer token, refresh-on-401 (single-flight), map API errors to user-friendly toasts.

## Performance (this is a headline requirement)

- Lazy load all feature routes; `@defer (on viewport)` for below-the-fold sections (comments, footer widgets).
- `@for` track expressions on stable ids; `NgOptimizedImage` for every `<img>`; explicit width/height to avoid CLS.
- Skeleton loaders (shared component) instead of spinner-blocking whole pages; optimistic UI for likes.
- Debounced (300–400ms) signal/RxJS search inputs; paginated lists never fetch-all.
- Keep initial bundle lean: no component library; build UI with Tailwind + small shared components. Check `ng build` budget warnings — they are errors for us.

## Tailwind & UX

- Tailwind v4 with `@theme` design tokens in `styles.css`: brand palette, spacing, radius, font stack. Use the tokens — no arbitrary hex values sprinkled in templates.
- Consistent component vocabulary: cards, buttons (primary/ghost/danger), form fields with visible labels + inline validation messages on touched+invalid, empty states with a call-to-action, confirm dialog for destructive actions, toast notifications for outcomes.
- Responsive mobile-first: every page usable at 360px, content max-width ~72rem centered, sticky navbar, dark-mode-ready color tokens (`dark:` variants) from day one.
- Accessibility is not optional: semantic landmarks, one `h1` per page, focus-visible rings, `aria-label` on icon buttons, keyboard-operable dialogs (focus trap + Escape), `alt` text everywhere.
- Reactive forms (typed) for all inputs; submit buttons disable while pending; server errors surface next to the relevant field when possible.

## Style

- Files: `story-card.component.ts`, `stories.service.ts`, kebab-case; selectors `app-*`.
- Templates > ~15 lines go in a separate `.html` file. No inline styles; Tailwind classes in templates, `@apply` only in genuinely shared CSS.
- ESLint (angular-eslint) + Prettier at `frontend/` root; template a11y lint rules enabled and honored.
