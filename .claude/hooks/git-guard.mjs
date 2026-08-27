#!/usr/bin/env node
/**
 * PreToolUse hook (Bash|PowerShell).
 * Destructive git operations always require an explicit user decision —
 * the hook downgrades them from "allowed" to "ask" so they can never run
 * silently, even in permissive permission modes.
 */
import fs from 'node:fs';

let data = {};
try {
  data = JSON.parse(fs.readFileSync(0, 'utf8') || '{}');
} catch {
  process.exit(0);
}

const cmd = String(data?.tool_input?.command || '');
if (!/\bgit\b/.test(cmd)) process.exit(0);

const RULES = [
  [/git\s+push\b[^\n|;&]*(\s--force\b|\s-f\b)/, 'force push'],
  [/git\s+reset\b[^\n|;&]*--hard/, 'hard reset'],
  [/git\s+clean\b[^\n|;&]*-[A-Za-z]*f/, 'git clean -f (deletes untracked files)'],
  [/git\b[^\n|;&]*--no-verify/, 'skipping git hooks (--no-verify)'],
  [/git\s+rebase\b[^\n|;&]*(\s-i\b|--interactive)/, 'interactive rebase'],
  [/git\s+checkout\b[^\n|;&]*\s--\s/, 'checkout -- (discards working changes)'],
  [/git\s+restore\b(?![^\n|;&]*--staged)/, 'git restore (discards working changes)'],
  [/git\s+branch\b[^\n|;&]*\s-D\b/, 'force branch delete'],
];

for (const [re, label] of RULES) {
  if (re.test(cmd)) {
    console.log(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'ask',
          permissionDecisionReason: `Destructive git operation detected (${label}). This always requires explicit user approval.`,
        },
      }),
    );
    process.exit(0);
  }
}

process.exit(0);
