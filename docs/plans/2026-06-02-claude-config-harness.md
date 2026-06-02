# Claude Code 설정 harness 재설계 (2026-06-02)

이 레포(`hello-claude-code`)를 harness 엔지니어링 관점으로 개조한 기록. `~/.claude`는 건드리지 않았다 — 사용자가 `deploy.sh`(macOS/Linux) 또는 `deploy.ps1`(Windows)로 수동 적용한다.

## 결정 (확정)

1. 죽은 bash 훅 전부 폐기. 훅은 "결정적 강제"가 필요한 것만 Node로 재구축:
   - 안전 게이트(`guard-bash`, `guard-files`) + 포맷 게이트(`post-format`) **유지**.
   - 세션/메모리 핸드오프 훅은 **제거** — Claude Code 네이티브 메모리(CLAUDE.md, `/memory`·`#`, 자동 압축)와 중복이라 룰로 대체.
2. 전달 경로를 `~/.claude` 수동 배포로 단일화. 플러그인 패키징(plugin.json, hooks-config.json) 제거.
3. UI 관련 내용 전부 제거 (Unity UI Toolkit 더 이상 사용 안 함).
4. 크로스플랫폼: 모든 훅은 순수 Node(stdin JSON)라 macOS/Linux/Windows 동일 동작. 배포 스크립트는 OS별 2종.

## 진단 (왜)

- 구 훅은 `~/.claude/settings.json`에 일부만 등록(Stop 미등록) → 문서는 "강제한다"는데 실제로는 안 됨.
- bash+jq 스크립트라 Windows에서 취약. → Node + stdin JSON으로 전환.
- 전달 경로가 수동 배포 + 플러그인으로 반쯤 중복 → 드리프트.
- 상시 로드(중복 CLAUDE.md + rules 7개)가 비대 → "bloated CLAUDE.md는 지시를 무시하게 만든다"(Anthropic).
- 핸드오프 훅은 플랫폼 네이티브 메모리를 재발명한 것 → 제거.

## harness 4사분면 (목표 상태)

| 사분면 | 구현 |
|--------|------|
| 결정적 피드포워드 | CLAUDE.md, rules/ (슬림) |
| 비결정적 피드포워드 | skills/, agents/ |
| 결정적 피드백 | hooks/ (guard-bash, guard-files, post-format) |
| 비결정적 피드백 | evaluator 에이전트, /review |

세션 연속성·메모리: 네이티브(CLAUDE.md / `/memory` / 자동 압축).

## 변경 내역 (레포)

삭제:
- `hooks/{pre-compact,post-compact,session-start,ui-verification-check}.sh`, `hooks/hooks-config.json`
- `.claude-plugin/plugin.json` (+ 빈 디렉토리)
- `rules/04-testing.md` (→ references/testing.md 이동), `rules/06-ui-design.md` (UI라 완전 삭제)
- `skills/ui-toolkit-design/` 전체
- 메모리 훅 `hooks/{session-start,pre-compact,post-compact}.mjs` (네이티브 메모리로 대체)

신규 (Node 훅, stdin JSON, bash/jq 비의존, 크로스플랫폼):
- `hooks/guard-bash.mjs` — PreToolUse(Bash): 위험 명령 exit 2 차단
- `hooks/guard-files.mjs` — PreToolUse(Edit|Write): 시크릿 파일 JSON deny
- `hooks/post-format.mjs` — PostToolUse: 다언어 포맷터(무음·비차단)
- `hooks/settings.global.json` — settings.json에 병합할 hooks 스니펫(PreToolUse×2, PostToolUse×1)
- `hooks/README.md` — 설계·배선·크로스플랫폼·함정
- `references/testing.md` — 온디맨드 테스트 기준
- `deploy.sh` (macOS/Linux), `deploy.ps1` (Windows) — 레포 → ~/.claude 배포

수정:
- `CLAUDE.md` — UI/거짓 강제 제거, 슬림화, 컨텍스트 관리=네이티브 메모리, 워크플로우 산출물 체인, 검증·강제 섹션
- `skills/quality-verification/SKILL.md` — UI 검증 섹션 제거, testing 참조
- `skills/{plan,executing-plans,review,tdd}/SKILL.md` — 워크플로우 산출물 입출력 계약
- `skills/systematic-debugging/SKILL.md` — 깨진 링크(04-testing → references/testing)
- `README.md`, `CONTRIBUTING.md` — UI 제거, Node 훅·크로스플랫폼·배포(2종)·버전(Opus 4.8)

상시 로드 rules: 00-accuracy, 01-response-principles, 02-security, 03-coding-style, 04-tool-usage (5개).

## 수동 적용 절차 (~/.claude)

1. macOS/Linux: `chmod +x deploy.sh && ./deploy.sh --remove-stale` / Windows: `.\deploy.ps1 -RemoveStale`
2. `hooks/settings.global.json`의 `hooks` 블록을 `~/.claude/settings.json`의 `hooks` 키에 병합.
3. `node`가 PATH에 있는지 확인 (Windows는 Git Bash 경유 실행).
4. Claude Code에서 `/hooks`로 등록 확인 (PreToolUse×2, PostToolUse×1).
5. (선택) `/plugin marketplace remove ho-gyu-lee/hello-claude-code`로 구 마켓플레이스 정리.

## 검증 결과 (이 세션)

- 안전 게이트 실작동 확인(bash stdin 경유): `rm -rf` → exit 2 차단, `git push --force` → 차단, `.env.local` → JSON deny, 정상 명령/파일 → 통과.
- 모든 `.mjs` `node --check` 통과, `deploy.ps1`/`deploy.sh` 문법 통과, `settings.global.json` 유효 JSON.
- 잔여 UI/사문 참조 0건 (deploy 스크립트의 정리 목록 제외).
