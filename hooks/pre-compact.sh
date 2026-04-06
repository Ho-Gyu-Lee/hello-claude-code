#!/bin/bash
# Pre-Compact Hook
# 컨텍스트 압축 전 작업 상태를 핸드오프 아티팩트로 저장한다.
# 블로그 권장: "압축만으로는 불충분; 리셋 시 구조화된 핸드오프가 필수"

set -euo pipefail

INPUT=$(cat)
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // "unknown"')
CWD=$(echo "$INPUT" | jq -r '.cwd // "."')
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

HANDOFF_DIR="${HOME}/.claude/handoff"
mkdir -p "$HANDOFF_DIR"

# Git 상태 캡처 (git repo인 경우)
GIT_BRANCH=""
GIT_STATUS=""
GIT_RECENT=""
if git -C "$CWD" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  GIT_BRANCH=$(git -C "$CWD" branch --show-current 2>/dev/null || echo "")
  GIT_STATUS=$(git -C "$CWD" status --short 2>/dev/null | head -20 || echo "")
  GIT_RECENT=$(git -C "$CWD" log --oneline -5 2>/dev/null || echo "")
fi

# 핸드오프 아티팩트 저장
cat > "${HANDOFF_DIR}/last-compact.json" << ARTIFACT
{
  "session_id": "${SESSION_ID}",
  "cwd": "${CWD}",
  "timestamp": "${TIMESTAMP}",
  "source": "pre_compact",
  "git": {
    "branch": $(echo "$GIT_BRANCH" | jq -Rs .),
    "status": $(echo "$GIT_STATUS" | jq -Rs .),
    "recent_commits": $(echo "$GIT_RECENT" | jq -Rs .)
  }
}
ARTIFACT

exit 0
