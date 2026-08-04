---
name: migrate-next
description: Execute the next unchecked phase of the StoryHouse migration plan end-to-end - implement, verify, adversarially review, and check off. Use when the user says "continue the migration", "next phase", or invokes /migrate-next.
argument-hint: "[optional: specific phase or task to jump to]"
---

Drive one migration phase from `docs/MIGRATION_PLAN.md` to completion.

1. **Locate the work.** Read `docs/MIGRATION_PLAN.md`. Target = `$ARGUMENTS` if given, otherwise the first phase containing unchecked tasks. Read every unchecked task in that phase plus the phase's "verify" notes. If a prerequisite phase has unchecked tasks, stop and report instead of skipping ahead.

2. **Gather behavior facts.** If the phase ports legacy behavior, ask the `legacy-analyst` agent for the relevant endpoint/UI semantics up front (one focused question per area, not "explain everything"). Cross-check with `docs/API_CONTRACT.md` — the contract wins over legacy quirks.

3. **Implement.** Backend work goes to `nest-backend-dev` patterns, frontend to `angular-frontend-dev` patterns (delegate to those agents for large phases; implement directly for small ones). Respect all `.claude/rules/*.md`. Keep `docs/API_CONTRACT.md`, Swagger, and `.env.example` in sync as part of the same change.

4. **Verify.** Run the phase's checks in the affected workspace(s): backend `npm run lint`, `npx tsc --noEmit`, `npm test` (+ `npx prisma validate` on schema changes); frontend `npm run lint`, `npm run build` (+ `npm test` on logic). Fix failures before proceeding.

5. **Review.** Launch the `migration-reviewer` agent on the completed phase. Fix every FAIL finding and re-verify. Do not proceed past a FAIL verdict.

6. **Close out.** Check off (`- [x]`) the completed tasks in `docs/MIGRATION_PLAN.md`. Report: tasks done, verification output summary (honest pass/fail), reviewer verdict, deviations from plan, and what the next phase is. Do NOT commit unless the user asked.
