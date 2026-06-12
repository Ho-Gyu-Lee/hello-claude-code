#!/usr/bin/env node
// Merge MCP server definitions into ~/.claude.json (user scope = global, all projects).
// Called by deploy.ps1 / deploy.sh after file copy; also runnable standalone.
//
// Usage:
//   node merge-mcp.mjs                  # merge mcp/servers.json (repo canon)
//   node merge-mcp.mjs --from <file>    # import mcpServers from a .claude.json backup
//   node merge-mcp.mjs --target <file>  # write elsewhere (tests); default ~/.claude.json
//
// Guarantees:
//   - touches only the mcpServers key; everything else in ~/.claude.json is preserved
//   - writes <target>.bak before modifying; aborts without writing if target is invalid JSON
//   - empty / ${PLACEHOLDER} env values never clobber values already installed
//   - servers.json stays platform-neutral (npx/uvx): Windows gets the `cmd /c`
//     wrapper at merge time (npx is a .cmd shim), POSIX gets the bare command
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
const fromPath = opt('--from');
const target = opt('--target') ?? path.join(os.homedir(), '.claude.json');

const fail = (msg) => { console.error(`merge-mcp: ${msg}`); process.exit(1); };

const srcPath = fromPath ?? path.join(HERE, 'servers.json');
if (!fs.existsSync(srcPath)) fail(`source not found: ${srcPath}`);
let incoming;
try { incoming = JSON.parse(fs.readFileSync(srcPath, 'utf8')).mcpServers; }
catch (e) { fail(`cannot parse ${srcPath}: ${e.message}`); }
if (!incoming || !Object.keys(incoming).length) fail(`no mcpServers in ${srcPath}`);

let live = {};
if (fs.existsSync(target)) {
  try { live = JSON.parse(fs.readFileSync(target, 'utf8')); }
  catch (e) { fail(`target is not valid JSON, aborting without write: ${target} (${e.message})`); }
}
const installed = live.mcpServers ?? {};

// `cmd /c X ...` <-> neutral `X ...` (so a Windows-form backup imports cleanly anywhere)
const normalize = (s) =>
  s.command === 'cmd' && String(s.args?.[0]).toLowerCase() === '/c'
    ? { ...s, command: s.args[1], args: s.args.slice(2) }
    : s;
const adaptToPlatform = (s) => {
  const stdio = !s.type || s.type === 'stdio';
  return stdio && process.platform === 'win32' && s.command !== 'cmd'
    ? { ...s, command: 'cmd', args: ['/c', s.command, ...(s.args ?? [])] }
    : s;
};

const PLACEHOLDER = /^\s*$|^\$\{.+\}$/;
const missingEnv = [];
const merged = { ...installed };
for (const [name, def] of Object.entries(incoming)) {
  const next = adaptToPlatform(normalize({ ...def, env: { ...(def.env ?? {}) } }));
  const prevEnv = (installed[name] ?? {}).env ?? {};
  for (const [k, v] of Object.entries(next.env)) {
    if (PLACEHOLDER.test(String(v)) && prevEnv[k] && !PLACEHOLDER.test(String(prevEnv[k]))) {
      next.env[k] = prevEnv[k]; // keep the secret already installed
    }
    if (PLACEHOLDER.test(String(next.env[k]))) missingEnv.push(`${name}: env.${k}`);
  }
  if (!Object.keys(next.env).length) delete next.env;
  merged[name] = next;
  console.log(`merged  mcpServers.${name}`);
}

let bak = '';
if (fs.existsSync(target)) { fs.copyFileSync(target, `${target}.bak`); bak = ` (backup: ${target}.bak)`; }
fs.writeFileSync(target, JSON.stringify({ ...live, mcpServers: merged }, null, 2) + '\n');
console.log(`wrote   ${target}${bak}`);

if (missingEnv.length) {
  console.log('\nACTION REQUIRED - empty env values. Fill them in the target file,');
  console.log('or re-run with --from <your .claude.json backup>:');
  for (const m of missingEnv) console.log(`  ${m}`);
}
