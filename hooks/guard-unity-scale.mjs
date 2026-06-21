#!/usr/bin/env node
// PreToolUse(mcp__) Unity UI scale guard.
// Blocks localScale modifications on UI objects via manage_components.
// Advisory warning for scale param on manage_gameobject (might be 3D).
// Blocking: exit 2 + stderr. Advisory: exit 0 + stdout additionalContext.
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
  "batch_execute",
];
if (!UNITY_MUTATIONS.some((p) => toolName.includes(p))) process.exit(0);

const toolInput = input?.tool_input ?? {};

// Hard block: manage_components setting localScale on Transform/RectTransform
if (toolName.includes("manage_components")) {
  const componentType = String(toolInput?.component_type ?? "");
  const property = String(toolInput?.property ?? "");
  const properties = toolInput?.properties ?? {};

  const isTransformComp =
    componentType === "Transform" || componentType === "RectTransform";
  const setsLocalScale =
    property === "localScale" || "localScale" in properties;

  if (isTransformComp && setsLocalScale) {
    process.stderr.write(
      "[unity-mobile-ui] 차단: UI 요소에 localScale 수정 금지.\n" +
        "RectTransform.sizeDelta (Width/Height) 로 크기를 조절하세요.\n" +
        "localScale은 항상 (1, 1, 1) 이어야 합니다."
    );
    process.exit(2);
  }
}

// Advisory: manage_gameobject with non-identity scale (may be 3D — warn only)
if (toolName.includes("manage_gameobject")) {
  const scale = toolInput?.scale;
  const isNonIdentity =
    Array.isArray(scale) &&
    scale.some((v) => typeof v === "number" && Math.abs(v - 1) > 0.001);

  if (isNonIdentity) {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          additionalContext:
            "[unity-mobile-ui] 주의: scale 파라미터가 (1,1,1)이 아닙니다. " +
            "이것이 UI 요소(RectTransform 포함)라면 scale 대신 " +
            "RectTransform.sizeDelta로 크기를 조절하세요. 3D 오브젝트라면 무시하세요.",
        },
      })
    );
  }
}

process.exit(0);
