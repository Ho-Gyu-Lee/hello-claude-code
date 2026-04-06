#!/bin/bash
# Pre-Compact Hook (안전망)
# 자동 압축 발동 시 최소 메타데이터만 저장한다.
# 실제 핸드오프 아티팩트는 에이전트가 능동적으로 작성해야 한다.

set -euo pipefail

INPUT=$(cat)
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // "unknown"')
CWD=$(echo "$INPUT" | jq -r '.cwd // "."')
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

HANDOFF_DIR="${CWD}/.claude/handoff"
mkdir -p "$HANDOFF_DIR"

# 에이전트가 작성한 핸드오프가 이미 있으면 덮어쓰지 않음
if [ -f "${HANDOFF_DIR}/context.md" ]; then
  exit 0
fi

# 에이전트가 핸드오프를 작성하지 못한 경우의 안전망
jq -n \
  --arg sid "$SESSION_ID" \
  --arg cwd "$CWD" \
  --arg ts "$TIMESTAMP" \
  '{
    session_id: $sid,
    cwd: $cwd,
    timestamp: $ts,
    source: "auto_compact_fallback"
  }' > "${HANDOFF_DIR}/last-compact.json"

exit 0
