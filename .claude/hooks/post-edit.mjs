#!/usr/bin/env node
/**
 * PostToolUse hook (Write|Edit).
 * 1. Auto-formats the edited file with the nearest project-local Prettier.
 * 2. Records code edits in a session state file so the Stop hook can require
 *    a verification run (lint/typecheck/test) before the session finishes.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';

let data = {};
try {
  data = JSON.parse(fs.readFileSync(0, 'utf8') || '{}');
} catch {
  process.exit(0);
}

const file = data?.tool_response?.filePath || data?.tool_input?.file_path;
if (!file || !fs.existsSync(file)) process.exit(0);

const ext = path.extname(file).toLowerCase();

// --- 1. Format with project-local Prettier (never global, never npx) ---
const FORMAT_EXT = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs', '.json', '.html', '.css', '.scss', '.md']);

function findPrettierJs(startDir) {
  let dir = startDir;
  for (let i = 0; i < 10; i++) {
    const candidate = path.join(dir, 'node_modules', 'prettier', 'bin', 'prettier.cjs');
    if (fs.existsSync(candidate)) return candidate;
    const legacy = path.join(dir, 'node_modules', 'prettier', 'bin-prettier.js');
    if (fs.existsSync(legacy)) return legacy;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

// Don't format the Claude config itself or lockfiles.
const skip = /[\\/]\.claude[\\/]|package-lock\.json$|[\\/]node_modules[\\/]|[\\/]dist[\\/]/.test(file);

if (!skip && FORMAT_EXT.has(ext)) {
  const prettierJs = findPrettierJs(path.dirname(file));
  if (prettierJs) {
    spawnSync(process.execPath, [prettierJs, '--write', '--ignore-unknown', file], {
      stdio: 'ignore',
      timeout: 20000,
    });
  }
}

// --- 2. Track code edits for the Stop-time verification check ---
const CODE_EXT = new Set(['.ts', '.tsx', '.html', '.scss', '.css', '.prisma']);
if (CODE_EXT.has(ext) && !skip && data.session_id) {
  const stateFile = path.join(os.tmpdir(), `claude-verify-${data.session_id}.json`);
  let state = { lastCodeEdit: 0, lastVerify: 0 };
  try {
    state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  } catch {}
  state.lastCodeEdit = Date.now();
  try {
    fs.writeFileSync(stateFile, JSON.stringify(state));
  } catch {}
}

process.exit(0);
