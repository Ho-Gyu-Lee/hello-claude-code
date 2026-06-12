#!/usr/bin/env node
// UserPromptSubmit advisory gate — deterministic skill suggestion.
// Auto-trigger skills rely on description matching (non-deterministic and
// dilutes as context fills). This hook scans the prompt for keywords and
// injects a hint via additionalContext when a skill clearly applies.
// Advisory only: never blocks, silent on no match, max one suggestion.
// Keyword map is conservative on purpose — a miss is cheaper than spam;
// grow patterns from observed misses.
import { readFileSync } from "node:fs";

let input;
try {
  input = JSON.parse(readFileSync(0, "utf-8").replace(/^﻿/, "")); // strip UTF-8 BOM
} catch {
  process.exit(0); // never block on our own parse failure
}

const prompt = String(input?.prompt ?? "");
if (!prompt) process.exit(0);

// one regex = one concept; the skill with the most matched concepts wins
const RULES = [
  {
    skill: "systematic-debugging",
    res: [
      /에러|예외|\berror\b|exception/i,
      /스택\s*트레이스|stack\s*trace|traceback/i,
      /버그|\bbug\b|crash|segfault/i,
      /실패|안\s*(돼|됨|된다)|작동\s*안|왜\s*안|fail(s|ed|ing)?\b/i,
    ],
  },
  {
    skill: "diagram",
    res: [
      /다이어그램|diagram/i,
      /구조도|아키텍처\s*그림|시각화/i,
      /시퀀스|플로우|흐름도|flowchart|sequence\s*diagram/i,
      /상태\s*전이|state\s*machine/i,
    ],
  },
  {
    skill: "performance-guide",
    res: [
      /성능|퍼포먼스|performance/i,
      /병목|bottleneck/i,
      /프로파일|profil(e|er|ing)/i,
      /최적화|optimiz/i,
      /메모리\s*누수|memory\s*leak|느려|latency|throughput/i,
    ],
  },
  {
    skill: "web-search",
    res: [
      /최신|latest/i,
      /릴리스|릴리즈|release(d|s)?\b|changelog|출시/i,
      /버전\s*확인|what\s*version/i,
      /요즘|뉴스|새로\s*나온|트렌드|trend/i,
    ],
  },
];

const scored = RULES.map((r) => ({
  skill: r.skill,
  hits: r.res.filter((re) => re.test(prompt)).length,
})).filter((s) => s.hits > 0);

if (!scored.length) process.exit(0);
scored.sort((a, b) => b.hits - a.hits);

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "UserPromptSubmit",
      additionalContext: `[suggest-skills] 이 요청은 '${scored[0].skill}' 스킬 대상일 수 있다 — 해당 SKILL.md 지침 적용을 검토하라.`,
    },
  })
);
process.exit(0);
