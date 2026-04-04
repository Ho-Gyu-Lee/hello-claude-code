# Hello Claude Code

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

서버 개발자를 위한 Claude Code 설정 프레임워크.
C/C++, Go, Rust, C#, Python 지원. Opus 4.6 / Sonnet 4.6 대응.

## 핵심 철학

| 원칙 | 설명 |
|------|------|
| **정확성** | 확실한 정보만 답변, 추측은 명시 |
| **집중** | 요청 범위에 집중, 불필요한 확장 방지 |
| **코드 기반** | 실제 코드 분석 후 판단 |
| **간결함** | Over-engineering 금지 |
| **Context Engineering** | 프롬프트가 아닌 전체 정보 환경을 설계 |

---

## 프로젝트 구조

```
hello-claude-code/
├── rules/           # 7개 규칙 - 항상 적용
├── agents/          # 7개 에이전트 - 위임 작업용
├── skills/          # 16개 스킬 - 수동 호출 + 자동 트리거
└── CLAUDE.md        # 메인 설정 (200줄 이하)
```

---

## 설치

```bash
git clone https://github.com/[your-username]/hello-claude-code.git
cd hello-claude-code

# 원하는 구성 요소만 복사
cp rules/*.md ~/.claude/rules/
cp agents/*.md ~/.claude/agents/
cp -r skills/* ~/.claude/skills/
```

---

## 구성 요소

### Rules (7개) — 항상 적용

| 파일 | 용도 |
|------|------|
| `00-accuracy.md` | 정확성, 반환각 방지, 응답 전 체크 |
| `01-response-principles.md` | 앵커링, 범위 제한, 커뮤니케이션 스타일 |
| `02-security.md` | 보안 즉시 경고, 취약점 체크리스트 |
| `03-coding-style.md` | 간결성, 네이밍 컨벤션, 서버 특화 |
| `04-testing.md` | TDD, AAA 패턴, 테스트 체크리스트 |
| `05-tool-usage.md` | 도구 자율 사용, MCP 우선순위, 서브에이전트 위임 |
| `06-ui-design.md` | AI 안티패턴 금지, 접근성, 인터랙션 상태 |

### Agents (7개) — 미션 기반, 자율적 접근 방식 선택

각 에이전트는 미션 + 성공 기준 + 실패 패턴 + 도메인 지식 + 제약으로 구성.

| 에이전트 | 미션 |
|----------|------|
| `planner` | 작업을 실행 가능한 계획으로 변환 |
| `architect` | 최적의 기술적 결정 도출 |
| `code-reviewer` | 코드 변경의 품질과 안정성 보장 |
| `security-reviewer` | 보안 위험 식별 및 완화 방안 제시 |
| `refactorer` | 코드 구조 개선, 기능 보존 |
| `tdd-guide` | 테스트 주도로 안정적인 코드 생성 |
| `explorer` | 코드베이스 정보 수집 및 정제 |

### Skills (16개) — 수동 호출 + 자동 트리거

**수동 호출 (6개)**:

| 스킬 | 용도 |
|------|------|
| `/brainstorming` | 구현 전 설계 논의 |
| `/grill-me` | 설계/계획 스트레스 테스트 |
| `/plan` | 구현 계획 수립 |
| `/review` | 코드 리뷰 (단일 진입점 — 파일/staged/commit/PR) |
| `/tdd` | TDD 방식 개발 |
| `/ui-toolkit-design` | Unity UI Toolkit 가이드 |

**자동 트리거 (10개)**:

| 스킬 | 트리거 |
|------|--------|
| `diagram` | 시각화가 필요한 모든 상황 (beautiful-mermaid ASCII) |
| `error-response` | 작업 실패, 빌드/테스트 실패 |
| `executing-plans` | 계획 실행 시 |
| `quality-verification` | 작업 완료 검증 |
| `research-context` | 기술 조사/비교 |
| `performance-guide` | 성능/최적화 관련 질문 |
| `systematic-debugging` | 에러/버그 발생 |
| `sequential-thinking` | 복잡한 아키텍처 결정 (MCP) |
| `serena-mcp` | Serena MCP 연결 시 코드 분석 (MCP) |
| `web-search` | 웹 검색/최신 정보 (MCP) |

---

## 개발 흐름

```
/brainstorming → /grill-me → /plan → 구현 → /tdd → /review
    설계          검증        계획     코드   테스트   리뷰
```

---

## 커스터마이징

### 규칙 수정

`rules/` 폴더에서 직접 수정.

### 에이전트 추가

`agents/` 폴더에 새 파일 생성:

```yaml
---
name: my-agent
description: 에이전트 역할과 위임 시점을 구체적으로 기술
tools: Read, Grep, Glob
---

# 에이전트 내용
```

선택 필드:

| 필드 | 설명 | 예시 |
|------|------|------|
| `model` | 모델 지정 | `sonnet`, `opus`, `haiku` |
| `skills` | 연결할 스킬 | `review`, `tdd` |
| `memory` | 메모리 타입 | `project` |
| `permissionMode` | 권한 모드 | `bypassPermissions`, `plan`, `default` |
| `maxTurns` | 최대 턴 수 | `10`, `25` |
| `isolation` | 격리 모드 | `worktree` |
| `initialPrompt` | 첫 턴 자동 제출 프롬프트 | 반복 작업 자동화에 유용 |

### 스킬 추가

`skills/[skill-name]/SKILL.md` 생성:

```yaml
---
name: my-skill
description: 스킬 설명과 트리거 조건
---

# 스킬 내용
```

### Hooks 설정

`.claude/settings.json`에서 확정적 강제 규칙 설정:

```jsonc
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Edit|Write",
      "command": "prettier --write $FILE_PATH"
    }]
  }
}
```

---

## 주의사항

- **컨텍스트**: MCP 10개 이하 권장
- **세션 관리**: 작업 간 `/clear`, 70% 사용 시 `/compact`
- **MCP 조건부**: sequential-thinking, serena-mcp, web-search는 MCP 연결 시에만 활성화
- **MCP 보안**: 신뢰된 소스의 MCP 서버만 사용. `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1` 설정 권장
- **Agent Teams**: 실험적 기능. 명확한 작업 분리 시에만 사용 (토큰 비용 주의)

---

## 라이선스

MIT License
