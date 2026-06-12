#!/usr/bin/env bash
# Deploy this repo's Claude Code config into ~/.claude (macOS / Linux).
# Windows: use deploy.ps1 instead.
# Also merges mcp/servers.json into ~/.claude.json (user-scope MCP servers;
# only the mcpServers key is touched, .bak written first).
# Does NOT touch settings.json -- merge hooks/settings.global.json yourself.
# Flags:
#   --remove-stale      delete files obsoleted by the harness redesign
#   --mcp-from <file>   import mcpServers (incl. secrets) from a .claude.json backup
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST="$HOME/.claude"
REMOVE_STALE=0
MCP_FROM=""
while [ $# -gt 0 ]; do
  case "$1" in
    --remove-stale) REMOVE_STALE=1 ;;
    --mcp-from) MCP_FROM="${2:-}"; shift ;;
    *) echo "unknown arg: $1" >&2; exit 1 ;;
  esac
  shift
done

mkdir -p "$DEST"

copy_tree() {
  local name="$1"
  [ -d "$REPO/$name" ] || return 0
  mkdir -p "$DEST/$name"
  cp -R "$REPO/$name/." "$DEST/$name/"
  echo "copied  $name/ -> ~/.claude/$name/"
}

cp "$REPO/CLAUDE.md" "$DEST/CLAUDE.md"
echo "copied  CLAUDE.md -> ~/.claude/CLAUDE.md"

copy_tree rules
copy_tree agents
copy_tree references
copy_tree mcp

# skills: copy this repo's skills only (do NOT delete other skills in ~/.claude)
# Use the "/." idiom (same as copy_tree) so contents land in skills/<name>/,
# not dumped into skills/ root -- a trailing-slash cp on macOS copies contents.
mkdir -p "$DEST/skills"
for d in "$REPO"/skills/*/; do
  [ -d "$d" ] || continue
  name="$(basename "$d")"
  mkdir -p "$DEST/skills/$name"
  cp -R "$d." "$DEST/skills/$name/"
  echo "copied  skills/$name/"
done

# hooks: copy Node scripts only
mkdir -p "$DEST/hooks"
cp "$REPO"/hooks/*.mjs "$DEST/hooks/"
echo "copied  hooks/*.mjs -> ~/.claude/hooks/"

# mcp: merge user-scope MCP servers into ~/.claude.json (Node script, .bak written)
if [ -n "$MCP_FROM" ]; then
  node "$REPO/mcp/merge-mcp.mjs" --from "$MCP_FROM" || echo "WARN: MCP merge failed -- ~/.claude.json untouched" >&2
else
  node "$REPO/mcp/merge-mcp.mjs" || echo "WARN: MCP merge failed -- ~/.claude.json untouched" >&2
fi

if [ "$REMOVE_STALE" -eq 1 ]; then
  for s in \
    hooks/pre-compact.sh hooks/post-compact.sh hooks/session-start.sh \
    hooks/ui-verification-check.sh hooks/hooks-config.json \
    hooks/session-start.mjs hooks/pre-compact.mjs hooks/post-compact.mjs \
    rules/04-testing.md rules/06-ui-design.md rules/05-tool-usage.md; do
    if [ -e "$DEST/$s" ]; then rm -f "$DEST/$s"; echo "removed ~/.claude/$s"; fi
  done
  if [ -d "$DEST/skills/ui-toolkit-design" ]; then
    rm -rf "$DEST/skills/ui-toolkit-design"; echo "removed ~/.claude/skills/ui-toolkit-design/"
  fi
fi

echo ""
echo "NEXT (manual):"
echo "  1. Merge hooks/settings.global.json (hooks block) into ~/.claude/settings.json"
echo "  2. Ensure 'node' is on PATH (Claude Code ships Node)"
echo "  3. Run /hooks in Claude Code to confirm registration"
echo "  4. (optional) /plugin marketplace remove ho-gyu-lee/hello-claude-code"
[ "$REMOVE_STALE" -eq 1 ] || echo "  5. Re-run with --remove-stale to delete obsoleted files"
