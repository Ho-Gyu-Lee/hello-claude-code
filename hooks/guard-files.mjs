#!/usr/bin/env node
// PreToolUse(Edit|Write|MultiEdit) gate — protects secret/credential files.
// Uses JSON permissionDecision:"deny" (exit 0) rather than exit 2, because
// exit-2 blocking is unreliable for Write/Edit (claude-code issue #13744).
import { readFileSync } from "node:fs";

let input;
try {
  input = JSON.parse(readFileSync(0, "utf-8"));
} catch {
  process.exit(0);
}

const raw = input?.tool_input?.file_path ?? input?.tool_input?.path ?? "";
const fp = String(raw).replace(/\\/g, "/");
if (!fp) process.exit(0);

const PROTECTED = [
  /(^|\/)\.env(\.[\w.-]+)?$/i, // .env, .env.local, .env.production
  /(^|\/)\.aws\/credentials$/i,
  /(^|\/)\.ssh\//i,
  /(^|\/)id_(rsa|ed25519|ecdsa|dsa)$/i,
  /\.pem$/i,
  /\.(p12|pfx|keystore|jks)$/i,
  /(^|\/)secrets?\.(json|ya?ml|toml|env)$/i,
  /(^|\/)\.netrc$/i,
  /(^|\/)\.npmrc$/i, // frequently holds auth tokens
];

if (PROTECTED.some((re) => re.test(fp))) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason:
          `Writing to a secret/credential file is blocked: ${fp}. ` +
          `Edit it manually if required, or inject values via environment variables instead.`,
      },
    })
  );
}
process.exit(0);
