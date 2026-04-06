#!/bin/bash
# SessionStart Hook (startup|resume|clear)
# 새 세션 또는 리셋 후 핸드오프 아티팩트가 있으면 Claude에 읽도록 안내한다.

set -euo pipefail

INPUT=$(cat)
CWD=$(echo "$INPUT" | jq -r '.cwd // "."')

HANDOFF_DIR="${CWD}/.claude/handoff"
AGENT_HANDOFF="${HANDOFF_DIR}/context.md"

if [ ! -f "$AGENT_HANDOFF" ]; then
  exit 0
fi

CONTEXT="[Handoff] Previous session handoff exists at ${AGENT_HANDOFF}. Read it to restore working context, then verify current state by checking actual files and code."

jq -n --arg ctx "$CONTEXT" '{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": $ctx
  }
}'

exit 0
