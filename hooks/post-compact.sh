#!/bin/bash
# Context Restore Hook (SessionStart compact|startup|resume)
# 핸드오프 아티팩트가 존재하면 Claude에 읽도록 안내한다.
# 핸드오프 내용 자체는 에이전트가 작성한 것이므로 hook은 경로만 전달.

set -euo pipefail

INPUT=$(cat)
CWD=$(echo "$INPUT" | jq -r '.cwd // "."')

# 프로젝트별 핸드오프 디렉토리 (CWD 기반)
PROJECT_KEY=$(echo "$CWD" | sed 's|^/||' | sed 's|/|-|g')
HANDOFF_DIR="${HOME}/.claude/handoff/${PROJECT_KEY}"

AGENT_HANDOFF="${HANDOFF_DIR}/context.md"
FALLBACK_HANDOFF="${HANDOFF_DIR}/last-compact.json"

CONTEXT=""

if [ -f "$AGENT_HANDOFF" ]; then
  CONTEXT="[Handoff] Previous session handoff exists at ${AGENT_HANDOFF}. Read it to restore working context, then verify current state by checking actual files and code."
elif [ -f "$FALLBACK_HANDOFF" ]; then
  TIMESTAMP=$(jq -r '.timestamp // "unknown"' "$FALLBACK_HANDOFF" 2>/dev/null)
  CONTEXT="[Handoff] Auto-compact occurred at ${TIMESTAMP} without agent handoff. Working directory: ${CWD}. Check tasks, plans, and current state to restore context."
fi

if [ -z "$CONTEXT" ]; then
  exit 0
fi

jq -n --arg ctx "$CONTEXT" '{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": $ctx
  }
}'

exit 0
