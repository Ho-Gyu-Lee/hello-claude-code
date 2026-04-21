#!/bin/bash
# Stop Hook: Unity UI 작업 완료 시 시각 검증 증거 강제
# UXML/USS 또는 UI 관련 C# 파일을 수정했는데
# Unity MCP 시각 검증(스크린샷/콘솔/Play 모드) 증거가 없으면 block 처리한다.

set -euo pipefail

INPUT=$(cat)
STOP_HOOK_ACTIVE=$(echo "$INPUT" | jq -r '.stop_hook_active // false')
TRANSCRIPT_PATH=$(echo "$INPUT" | jq -r '.transcript_path // ""')

# 무한 루프 방지: 이미 한 번 block된 상태면 재차 block하지 않음
if [ "$STOP_HOOK_ACTIVE" = "true" ]; then
  exit 0
fi

# transcript 파일이 없으면 통과
if [ -z "$TRANSCRIPT_PATH" ] || [ ! -f "$TRANSCRIPT_PATH" ]; then
  exit 0
fi

# 최근 500줄만 검사 (성능)
RECENT=$(tail -n 500 "$TRANSCRIPT_PATH" 2>/dev/null || true)

if [ -z "$RECENT" ]; then
  exit 0
fi

# 1. UI 파일 수정 여부
#    - .uxml, .uss
#    - /UI/ 경로에 있는 .cs
#    - 파일명에 UI/HUD/View/Screen/Panel 포함된 .cs (보수적)
UI_EDITED=$(echo "$RECENT" | jq -r '
  select(.message.content? != null) |
  .message.content[]? |
  select(.type == "tool_use" and (.name == "Edit" or .name == "Write" or .name == "MultiEdit")) |
  (.input.file_path // .input.filePath // empty)
' 2>/dev/null | grep -E '\.(uxml|uss)$|/UI/.*\.cs$|(HUD|View|Screen|Panel|UIDocument|VisualElement).*\.cs$' | head -n 1 || true)

if [ -z "$UI_EDITED" ]; then
  # UI 작업이 없음 → 통과
  exit 0
fi

# 2. Unity MCP (CoplayDev/unity-mcp) 시각 검증 도구 호출 여부
#    - read_console (콘솔/컴파일 에러)
#    - manage_camera with action="screenshot" (스크린샷)
#    - manage_editor with action in ("play","stop","pause") (Play 모드)
#    tool name은 MCP 프리픽스(mcp__<server>__)가 붙으므로 suffix 매칭
VISUAL_CHECK=$(echo "$RECENT" | jq -r '
  select(.message.content? != null) |
  .message.content[]? |
  select(.type == "tool_use") |
  select(
    (.name | test("read_console$")) or
    ((.name | test("manage_camera$")) and ((.input.action // "") == "screenshot")) or
    ((.name | test("manage_editor$")) and ((.input.action // "") | test("^(play|stop|pause)$")))
  ) |
  .name
' 2>/dev/null | head -n 1 || true)

if [ -n "$VISUAL_CHECK" ]; then
  # 시각 검증 증거 있음 → 통과
  exit 0
fi

# 3. 사용자가 직접 검증 결과를 공유했는지 간이 체크 (스크린샷 첨부 등)
USER_EVIDENCE=$(echo "$RECENT" | jq -r '
  select(.message.role? == "user") |
  .message.content // "" | tostring
' 2>/dev/null | grep -iE 'screenshot|스크린샷|확인했|정상|렌더링|play mode' | head -n 1 || true)

if [ -n "$USER_EVIDENCE" ]; then
  exit 0
fi

# 검증 증거 없음 → block
REASON="UI 파일(UXML/USS/UI 관련 C#)을 수정했으나 시각 검증 증거가 없습니다. 완료 선언 전에 다음 중 하나를 수행하세요: (1) read_console(action=\"get\", types=[\"error\",\"warning\"])로 컴파일 에러 0건 확인, (2) manage_camera(action=\"screenshot\", include_image=true)로 렌더링 결과 확인, (3) 상호작용 변경이면 manage_editor(action=\"play\") 후 read_console 재확인. Unity MCP 미연결 시 사용자에게 스크린샷/콘솔 결과 공유를 요청하세요."

jq -n --arg r "$REASON" '{
  "decision": "block",
  "reason": $r
}'

exit 0
