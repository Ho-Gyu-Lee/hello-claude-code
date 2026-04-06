#!/bin/bash
# PostCompact Hook
# 컨텍스트 압축 후 작업 맥락을 재주입한다.
# CLAUDE.md 규칙은 자동 리로드되므로 재주입 불필요.
# 손실되는 것은 "작업 맥락" -- 에이전트 핸드오프 또는 안전망에서 복원.

set -euo pipefail

INPUT=$(cat)
CWD=$(echo "$INPUT" | jq -r '.cwd // "."')

HANDOFF_DIR="${CWD}/.claude/handoff"
AGENT_HANDOFF="${HANDOFF_DIR}/context.md"
FALLBACK_HANDOFF="${HANDOFF_DIR}/last-compact.json"

CONTEXT=""

if [ -f "$AGENT_HANDOFF" ]; then
  CONTEXT="[PostCompact] Context was compressed. Handoff exists at ${AGENT_HANDOFF}. Read it to restore working context, then verify current state by checking actual files and code."
elif [ -f "$FALLBACK_HANDOFF" ]; then
  CONTEXT="[PostCompact] Context was compressed without agent handoff. Check tasks, plans, and current state to restore working context."
fi

if [ -z "$CONTEXT" ]; then
  exit 0
fi

jq -n --arg ctx "$CONTEXT" '{
  "hookSpecificOutput": {
    "hookEventName": "PostCompact",
    "additionalContext": $ctx
  }
}'

exit 0
