#!/usr/bin/env node
// Merge hooks/settings.global.json (hooks + permissions + env) into ~/.claude/settings.json.
// Called by deploy.ps1 / deploy.sh after file copy; also runnable standalone.
//
// Usage:
//   node merge-settings.mjs                  # merge into ~/.claude/settings.json
//   node merge-settings.mjs --target <file>  # write elsewhere (tests)
//
// Guarantees:
//   - touches only the `hooks`, `permissions`, and `env` keys; everything else is preserved
//   - union merge, never removes: existing permission rules / hook entries are kept,
//     duplicates are not re-added (idempotent re-runs)
//   - env: object merge -- declared keys set to source value (overwritten if changed),
//     other existing env keys preserved
//   - writes <target>.bak before modifying; aborts without writing if target is invalid JSON
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const opt = (name) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : null;
};
const target = opt('--target') ?? path.join(os.homedir(), '.claude', 'settings.json');

const fail = (msg) => { console.error(`merge-settings: ${msg}`); process.exit(1); };
// strip UTF-8 BOM -- Windows editors (Notepad, PowerShell 5.1) add one and JSON.parse rejects it
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8').replace(/^﻿/, ''));

const srcPath = path.join(HERE, '..', 'hooks', 'settings.global.json');
if (!fs.existsSync(srcPath)) fail(`source not found: ${srcPath}`);
let src;
try { src = readJson(srcPath); }
catch (e) { fail(`cannot parse ${srcPath}: ${e.message}`); }

let live = {};
if (fs.existsSync(target)) {
  try { live = readJson(target); }
  catch (e) { fail(`target is not valid JSON, aborting without write: ${target} (${e.message})`); }
}

let changes = 0;

// permissions: union per array (allow/deny/ask) -- existing entries first, no duplicates
if (src.permissions) {
  const perms = live.permissions ?? {};
  for (const key of ['allow', 'deny', 'ask']) {
    const incoming = src.permissions[key];
    if (!Array.isArray(incoming)) continue;
    const current = Array.isArray(perms[key]) ? perms[key] : [];
    const added = incoming.filter((r) => !current.includes(r));
    if (added.length) {
      perms[key] = [...current, ...added];
      changes += added.length;
      console.log(`merged  permissions.${key} (+${added.length})`);
    }
  }
  if (Object.keys(perms).length) live.permissions = perms;
}

// env: object merge -- declared keys set to source value (overwrite if changed), others preserved
if (src.env && typeof src.env === 'object') {
  const env = live.env ?? {};
  for (const [k, v] of Object.entries(src.env)) {
    if (env[k] !== v) {
      const action = k in env ? 'overwrote' : 'added';
      env[k] = v;
      changes++;
      console.log(`merged  env.${k} (${action})`);
    }
  }
  if (Object.keys(env).length) live.env = env;
}

// hooks: dedup by (event, matcher, hook-entry JSON)
if (src.hooks) {
  const liveHooks = live.hooks ?? {};
  for (const [event, groups] of Object.entries(src.hooks)) {
    const current = Array.isArray(liveHooks[event]) ? liveHooks[event] : [];
    for (const group of groups) {
      const same = current.find((g) => (g.matcher ?? '') === (group.matcher ?? ''));
      if (!same) {
        current.push(group);
        changes++;
        console.log(`merged  hooks.${event} [${group.matcher ?? '*'}]`);
        continue;
      }
      for (const h of group.hooks ?? []) {
        if (!(same.hooks ?? []).some((x) => JSON.stringify(x) === JSON.stringify(h))) {
          same.hooks.push(h);
          changes++;
          console.log(`merged  hooks.${event} [${group.matcher ?? '*'}] entry`);
        }
      }
    }
    liveHooks[event] = current;
  }
  if (Object.keys(liveHooks).length) live.hooks = liveHooks;
}

if (!changes) { console.log('settings already up to date -- nothing to merge'); process.exit(0); }

let bak = '';
if (fs.existsSync(target)) { fs.copyFileSync(target, `${target}.bak`); bak = ` (backup: ${target}.bak)`; }
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, JSON.stringify(live, null, 2) + '\n');
console.log(`wrote   ${target}${bak}`);
