---
name: parity-check
description: Audit feature parity between the legacy app and the new NestJS/Angular implementation for a given area (or the whole app). Use before deleting legacy code, after finishing a phase, or when the user asks "did we miss anything?".
argument-hint: "[area: auth|users|stories|comments|likes|admin|all]"
---

Audit parity for `$ARGUMENTS` (default: `all`).

1. Build the **legacy inventory** for the area by launching the `legacy-analyst` agent: every endpoint (method, path, params, filters, status codes, permissions) and every user-visible UI capability (pages, actions, admin functions, form validations).
2. Build the **new inventory** from the actual new code: `backend/src/modules/**` routes + `frontend/src/app/**` routes/pages. Read code, not docs — the point is what exists, not what's claimed.
3. Diff the two three-ways:
   - **Missing** — legacy capability with no new equivalent (the critical list).
   - **Changed on purpose** — behavior that differs because `docs/API_CONTRACT.md` or the plan deliberately fixed a legacy quirk. Cite where the change is documented; if it isn't documented, it's a finding.
   - **New-only** — additions beyond legacy (fine, just list them).
4. Also check the meta-artifacts: every new endpoint present in `docs/API_CONTRACT.md` and Swagger; every required env var in `.env.example`.

Output a parity report: per-capability table (legacy → new → status), the Missing list ranked by user impact, and a recommendation — either "safe to consider this area done/delete legacy for it" or the concrete tasks to add to `docs/MIGRATION_PLAN.md`. Add genuinely missed items to the plan as new unchecked tasks (that is part of this skill's job).
