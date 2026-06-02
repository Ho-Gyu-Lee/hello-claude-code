#!/usr/bin/env node
// PostToolUse(Edit|Write|MultiEdit) — polyglot, best-effort formatter.
// Detects the project's toolchain from marker files and runs the matching
// per-file formatter. Never BLOCKS an edit (exit 0 always).
//
// Behavior on failure: do NOT silently skip when formatting is *applicable*
// (a project marker exists for that language). Try every available option;
// if none works, surface a throttled systemMessage (<=1/hour per ext) telling
// the user what to install. When there is genuinely nothing to format (no
// marker / unhandled extension), stay silent — that is "nothing to do", not
// "gave up".
//
// C# formatter is configurable via CLAUDE_CS_FORMATTER:
//   unset / "dotnet"  -> `dotnet format --include <file>` (default; accurate, slower)
//   "csharpier"       -> CSharpier per-file (fast). Set in ~/.claude/settings.json env.
import { readFileSync, existsSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, parse, extname, relative } from "node:path";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";

let input;
try {
  input = JSON.parse(readFileSync(0, "utf-8"));
} catch {
  process.exit(0);
}

const file = String(input?.tool_input?.file_path ?? "");
if (!file || !existsSync(file)) process.exit(0);

function findUp(startDir, markers) {
  let dir = startDir;
  const root = parse(dir).root;
  for (;;) {
    for (const m of markers) if (existsSync(join(dir, m))) return dir;
    if (dir === root) return null;
    dir = dirname(dir);
  }
}

function findUpMatch(startDir, re) {
  let dir = startDir;
  const root = parse(dir).root;
  for (;;) {
    let entries = [];
    try {
      entries = readdirSync(dir);
    } catch {
      /* unreadable dir */
    }
    if (entries.some((e) => re.test(e))) return dir;
    if (dir === root) return null;
    dir = dirname(dir);
  }
}

// shell:true lets Windows .cmd shims (npx/prettier/dotnet) resolve.
// Returns true only if the command ran and exited 0.
function ran(cmd, args, opts = {}) {
  try {
    const r = spawnSync(cmd, args, { stdio: "ignore", shell: true, timeout: 60000, ...opts });
    return !!(r && r.status === 0);
  } catch {
    return false;
  }
}

const ext = extname(file).toLowerCase();
const startDir = dirname(file);

// null = not applicable (nothing to do); "" = formatted ok; string = install hint.
let need = null;

if ([".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".json", ".css", ".scss", ".md"].includes(ext)) {
  if (findUp(startDir, ["package.json"])) {
    const ok = ran("npx", ["--no-install", "prettier", "--write", file]) || ran("prettier", ["--write", file]);
    if ([".js", ".jsx", ".ts", ".tsx"].includes(ext)) {
      ran("npx", ["--no-install", "eslint", "--fix", file]) || ran("eslint", ["--fix", file]);
    }
    need = ok ? "" : "Prettier를 찾지 못했습니다. 프로젝트에 `npm i -D prettier` 또는 전역 설치하세요.";
  }
} else if (ext === ".rs") {
  need = ran("rustfmt", [file]) ? "" : "rustfmt를 찾지 못했습니다. `rustup component add rustfmt`.";
} else if (ext === ".go") {
  need = ran("gofmt", ["-w", file]) ? "" : "gofmt를 찾지 못했습니다. Go 설치/PATH를 확인하세요.";
} else if (ext === ".py") {
  if (findUp(startDir, ["pyproject.toml", "ruff.toml", ".ruff.toml", "setup.cfg"])) {
    need = ran("ruff", ["format", file]) ? "" : "ruff를 찾지 못했습니다. `pip install ruff`.";
  }
} else if ([".c", ".h", ".cc", ".cpp", ".cxx", ".hpp", ".hh"].includes(ext)) {
  if (findUp(startDir, [".clang-format"])) {
    need = ran("clang-format", ["-i", file]) ? "" : "clang-format를 찾지 못했습니다. LLVM 설치 후 PATH 확인.";
  }
} else if (ext === ".cs") {
  const projDir = findUpMatch(startDir, /\.(csproj|sln)$/i);
  if (projDir) {
    const rel = relative(projDir, file) || file;
    const csharpier = () =>
      [
        ["dotnet", ["csharpier", "format", file]],
        ["dotnet", ["csharpier", file]],
        ["csharpier", ["format", file]],
        ["csharpier", [file]],
      ].some(([c, a]) => ran(c, a));
    const dotnetFormat = () => ran("dotnet", ["format", "--include", rel], { cwd: projDir, timeout: 120000 });

    const choice = (process.env.CLAUDE_CS_FORMATTER || "dotnet").toLowerCase();
    // Try the chosen formatter first, then fall back to the other before giving up.
    const ok = choice === "csharpier" ? csharpier() || dotnetFormat() : dotnetFormat() || csharpier();
    need = ok
      ? ""
      : "C# 포맷터 실패: dotnet SDK 또는 CSharpier(`dotnet tool install -g csharpier`)를 확인하세요. `dotnet format`이 느리면 env `CLAUDE_CS_FORMATTER=csharpier`.";
  }
}

// Applicable but no formatter worked -> tell the user (throttled), don't skip silently.
if (need) {
  try {
    const stamp = join(tmpdir(), `claude-postformat-${ext.replace(/[^a-z0-9]/gi, "")}.stamp`);
    const now = Date.now();
    let last = 0;
    if (existsSync(stamp)) last = Number(readFileSync(stamp, "utf-8")) || 0;
    if (now - last >= 3600000) {
      writeFileSync(stamp, String(now));
      process.stdout.write(JSON.stringify({ systemMessage: `[post-format] ${need}` }));
    }
  } catch {
    // if throttle bookkeeping fails, still surface the notice rather than swallow it
    process.stdout.write(JSON.stringify({ systemMessage: `[post-format] ${need}` }));
  }
}

process.exit(0);
