#!/usr/bin/env node
/**
 * PostToolUse hook (Bash|PowerShell).
 * Records that a verification command (lint / typecheck / test / build /
 * prisma validate) ran, so the Stop hook knows edits have been checked.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

let data = {};
try {
  data = JSON.parse(fs.readFileSync(0, 'utf8') || '{}');
} catch {
  process.exit(0);
}

const cmd = String(data?.tool_input?.command || '');

const VERIFY_RE =
  /\b(tsc\b|eslint\b|jest\b|vitest\b|karma\b|ng\s+(build|test|lint)\b|nest\s+build\b|prisma\s+(validate|format|generate|migrate)\b|npm\s+(run\s+)?(test|lint|build|typecheck|check|e2e)\b|pnpm\s+(run\s+)?(test|lint|build|typecheck)\b)/;

if (VERIFY_RE.test(cmd) && data.session_id) {
  const stateFile = path.join(os.tmpdir(), `claude-verify-${data.session_id}.json`);
  let state = { lastCodeEdit: 0, lastVerify: 0 };
  try {
    state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  } catch {}
  state.lastVerify = Date.now();
  try {
    fs.writeFileSync(stateFile, JSON.stringify(state));
  } catch {}
}

process.exit(0);
