#!/usr/bin/env node
// PreToolUse(Bash) safety gate — blocks destructive shell commands.
// Cross-platform: pure Node, reads JSON from stdin (no bash/jq dependency).
// Blocking mechanism: exit 2 + stderr, which reliably denies the Bash tool.
import { readFileSync } from "node:fs";

let input;
try {
  // fd 0 = stdin; strip UTF-8 BOM — a BOM-prefixed payload would otherwise
  // silently disarm this gate via the fail-open catch below
  input = JSON.parse(readFileSync(0, "utf-8").replace(/^﻿/, ""));
} catch {
  process.exit(0); // never block on our own parse failure
}

const cmd = String(input?.tool_input?.command ?? "");
if (!cmd) process.exit(0);

const DANGER = [
  { re: /\brm\s+-[a-z]*r[a-z]*f|\brm\s+-[a-z]*f[a-z]*r/i, why: "rm -rf (recursive force delete)" },
  { re: /\bgit\s+push\b[^\n]*--force(?!-with-lease)/i, why: "git push --force (use --force-with-lease)" },
  { re: /\bgit\s+push\s+[^\n]*-f\b/i, why: "git push -f (force push)" },
  { re: /\bgit\s+reset\s+--hard\b/i, why: "git reset --hard (discards uncommitted work)" },
  { re: /\b(DROP|TRUNCATE)\s+(TABLE|DATABASE|SCHEMA)\b/i, why: "destructive SQL (DROP/TRUNCATE)" },
  { re: /\bDELETE\s+FROM\b(?![\s\S]*\bWHERE\b)/i, why: "DELETE without WHERE" },
  { re: /\bchmod\s+-?R?\s*777\b/i, why: "chmod 777 (world-writable)" },
  { re: /\bmkfs(\.\w+)?\b/i, why: "mkfs (format filesystem)" },
  { re: /\bdd\b[^\n]*\bof=\/dev\//i, why: "dd writing to a device" },
  { re: />\s*\/dev\/(sd[a-z]|nvme\d|disk\d)/i, why: "redirect to a raw disk device" },
  { re: /:\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;\s*:/, why: "fork bomb" },
  { re: /\bcurl\b[^\n]*\|\s*(sudo\s+)?(ba)?sh\b/i, why: "curl | sh (pipes remote code into a shell)" },
  { re: /\bwget\b[^\n]*\|\s*(sudo\s+)?(ba)?sh\b/i, why: "wget | sh (pipes remote code into a shell)" },
];

const hit = DANGER.find((d) => d.re.test(cmd));
if (hit) {
  process.stderr.write(
    `Blocked dangerous command: ${hit.why}. ` +
      `If this is genuinely intended, run it yourself in a terminal or rephrase the request.`
  );
  process.exit(2); // exit 2 = deny; stderr is shown to Claude
}
process.exit(0);
