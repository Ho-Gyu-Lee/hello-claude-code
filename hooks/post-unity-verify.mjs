#!/usr/bin/env node
// PostToolUse(mcp__) Unity UI verification reminder.
// Injects a screenshot/checklist reminder after Unity UI mutations.
// Skips read-only actions (get, list, find, query, health, screenshot).
// Advisory only: never blocks, exit 0 always.
import { readFileSync } from "node:fs";

let input;
try {
  input = JSON.parse(readFileSync(0, "utf-8").replace(/^﻿/, ""));
} catch {
  process.exit(0);
}

const toolName = String(input?.tool_name ?? "");
const UNITY_MUTATIONS = [
  "manage_gameobject",
  "manage_components",
  "manage_ui",
  "manage_scene",
  "manage_prefabs",
  "manage_asset",
  "batch_execute",
  "create_script",
  "script_apply_edits",
];
if (!UNITY_MUTATIONS.some((p) => toolName.includes(p))) process.exit(0);

// Skip read-only actions
const action = String(input?.tool_input?.action ?? "").toLowerCase();
const READ_PREFIXES = ["get", "list", "find", "query", "read", "health", "ping", "screenshot"];
if (READ_PREFIXES.some((p) => action.startsWith(p))) process.exit(0);

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      additionalContext:
        "[unity-mobile-ui] 이 배치가 끝나면 스크린샷을 찍고 다음을 확인하세요: " +
        "① (레퍼런스가 있으면) 레퍼런스와 레이아웃·비주얼 일치 ② 요소 겹침 없음 ③ 텍스트 잘림 없음 ④ 폰트 크기 기준값(제목 40+/본문 28+) ⑤ 버튼 80×80 이상 ⑥ localScale이 (1,1,1). " +
        "이상 발견 시 즉시 수정 후 재확인. 모두 통과 시에만 완료 선언.",
    },
  })
);
process.exit(0);
