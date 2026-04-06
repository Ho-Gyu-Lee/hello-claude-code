#!/bin/bash
# Context Handoff Hook (SessionStart compact|startup|resume)
# 컨텍스트 압축, 리셋(/clear), 세션 재개 시 핸드오프 아티팩트를 읽어 Claude에 재주입한다.
# 블로그 권장: "압축만으로는 불충분; 리셋 + 구조화된 핸드오프가 필수"

set -euo pipefail

HANDOFF_DIR="${HOME}/.claude/handoff"
HANDOFF_FILE="${HANDOFF_DIR}/last-compact.json"

if [ ! -f "$HANDOFF_FILE" ]; then
  exit 0
fi

TIMESTAMP=$(jq -r '.timestamp // "unknown"' "$HANDOFF_FILE" 2>/dev/null)
CWD=$(jq -r '.cwd // "unknown"' "$HANDOFF_FILE" 2>/dev/null)
GIT_BRANCH=$(jq -r '.git.branch // ""' "$HANDOFF_FILE" 2>/dev/null)
GIT_STATUS=$(jq -r '.git.status // ""' "$HANDOFF_FILE" 2>/dev/null)
GIT_RECENT=$(jq -r '.git.recent_commits // ""' "$HANDOFF_FILE" 2>/dev/null)

# Claude에 재주입할 컨텍스트 구성
CONTEXT="[Handoff] Context was compacted at ${TIMESTAMP}."
CONTEXT="${CONTEXT}\nWorking directory: ${CWD}"

if [ -n "$GIT_BRANCH" ]; then
  CONTEXT="${CONTEXT}\nGit branch: ${GIT_BRANCH}"
fi

if [ -n "$GIT_STATUS" ] && [ "$GIT_STATUS" != "" ]; then
  CONTEXT="${CONTEXT}\nUncommitted changes:\n${GIT_STATUS}"
fi

if [ -n "$GIT_RECENT" ] && [ "$GIT_RECENT" != "" ]; then
  CONTEXT="${CONTEXT}\nRecent commits:\n${GIT_RECENT}"
fi

CONTEXT="${CONTEXT}\nReview your tasks and plans to restore working context."

# additionalContext로 Claude에 주입
jq -n --arg ctx "$CONTEXT" '{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": $ctx
  }
}'

exit 0
