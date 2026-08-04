#!/usr/bin/env node
/**
 * SessionStart hook.
 * Injects current migration progress (from docs/MIGRATION_PLAN.md) into
 * context so every session knows exactly where the NestJS/Angular rewrite
 * stands without being told.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const planPath = path.join(root, 'docs', 'MIGRATION_PLAN.md');

let out = '';
try {
  const plan = fs.readFileSync(planPath, 'utf8');
  const lines = plan.split(/\r?\n/);
  const done = lines.filter((l) => /^\s*-\s*\[[xX]\]/.test(l)).length;
  const open = lines.filter((l) => /^\s*-\s*\[ \]/.test(l)).length;

  let phase = '';
  let nextTask = '';
  let currentHeading = '';
  for (const l of lines) {
    const h = l.match(/^#{2,3}\s+(.*)/);
    if (h) currentHeading = h[1].trim();
    const t = l.match(/^\s*-\s*\[ \]\s+(.*)/);
    if (t && !nextTask) {
      nextTask = t[1].trim();
      phase = currentHeading;
    }
  }

  if (done + open > 0) {
    out =
      `StoryHouse migration progress: ${done}/${done + open} tasks complete. ` +
      (nextTask
        ? `Next open task (${phase}): "${nextTask}". `
        : 'All plan tasks are checked off. ') +
      'The authoritative plan is docs/MIGRATION_PLAN.md — keep its checkboxes up to date as work completes. Use /migrate-next to continue the migration.';
  }
} catch {
  // No plan yet — stay silent.
}

if (out) {
  console.log(
    JSON.stringify({
      hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: out },
    }),
  );
}
process.exit(0);
