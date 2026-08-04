#!/usr/bin/env node
/**
 * Stop hook.
 * If source code was edited this session and no verification command
 * (lint / typecheck / test / build) has run since the last edit, block the
 * stop once and ask Claude to run the affected workspace's checks.
 * `stop_hook_active` guards against infinite loops: the second stop attempt
 * in the same turn always passes.
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

if (data.stop_hook_active) process.exit(0);
if (!data.session_id) process.exit(0);

const stateFile = path.join(os.tmpdir(), `claude-verify-${data.session_id}.json`);
let state = { lastCodeEdit: 0, lastVerify: 0 };
try {
  state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
} catch {}

if (state.lastCodeEdit > state.lastVerify) {
  console.log(
    JSON.stringify({
      decision: 'block',
      reason:
        'Source files were edited this session but no verification has run since the last edit. ' +
        'Run the affected workspace checks now — backend: `npm run lint` and `npx tsc --noEmit` (plus `npm test` if logic changed); ' +
        'frontend: `npm run lint` and `npm run build`. Fix any failures, then finish and report the results honestly.',
    }),
  );
}

process.exit(0);
