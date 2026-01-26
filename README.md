# Hello Claude Code

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**서버 개발자를 위한 Claude Code 설정**

C/C++, Go, Rust, C#, Python 개발 환경에 최적화된 설정입니다.

---

## 핵심 철학

| 원칙 | 설명 |
|------|------|
| **정확성** | 확실한 정보만 답변, 추측은 "추측:" 명시 |
| **집중** | 요청 범위에 집중, 불필요한 확장 방지 |
| **코드 기반** | 실제 코드 분석 후 판단, 추측 금지 |
| **간결함** | Over-engineering 금지, 요청 범위만 수정 |

---

## 프로젝트 구조

```
hello-claude-code/
├── rules/           # 핵심 규칙 (10개) - 항상 적용
├── agents/          # 서브에이전트 (6개) - 위임 작업용
├── commands/        # 슬래시 명령어 (3개)
├── contexts/        # 컨텍스트 모드 (3개)
├── skills/          # 워크플로우 가이드
└── templates/       # 템플릿 파일
```

---

## 설치 방법

### 1. 레포지토리 클론

```bash
git clone https://github.com/[your-username]/hello-claude-code.git
cd hello-claude-code
```

### 2. 파일 복사 (선택)

원하는 구성 요소만 복사:

```bash
# 규칙만 사용
cp rules/*.md ~/.claude/rules/

# 에이전트도 사용
cp agents/*.md ~/.claude/agents/

# 명령어도 사용
cp commands/*.md ~/.claude/commands/
```

---

## 사용 방법

### Rules (규칙)

**자동 적용** - Claude Code가 항상 참조합니다.

| 파일 | 용도 |
|------|------|
| `00-anti-hallucination.md` | 헛소리 방지, 정확도 검증 |
| `01-mandatory-checklist.md` | 응답 전 필수 체크리스트 |
| `02-context-anchoring.md` | 컨텍스트 고정, 범위 제한 |
| `03-core-principles.md` | 응답 철학, 금지/허용 표현 |
| `04-communication.md` | 커뮤니케이션 스타일 |
| `05-security.md` | 보안 규칙, 즉시 경고 항목 |
| `06-coding-style.md` | 간결성 원칙, 언어별 컨벤션 |
| `07-testing.md` | 테스트 규칙, 빌드/린트 |
| `08-git-workflow.md` | Git 커밋/브랜치 규칙 |
| `09-performance.md` | 서버 성능 최적화 |

### Commands (명령어)

Claude Code에서 슬래시 명령어로 사용:

```
/plan 사용자 인증 시스템 구현
```

| 명령어 | 용도 | 예시 |
|--------|------|------|
| `/plan` | 구현 계획 수립 | `/plan 매칭 시스템 구현` |
| `/review` | 코드 리뷰 | `/review src/server/session.go` |
| `/tdd` | TDD 시작 | `/tdd 패킷 파서 함수` |

### Agents (에이전트)

복잡한 작업을 위임할 때 사용:

| 에이전트 | 역할 |
|----------|------|
| `planner` | 구현 계획 수립, 작업 분해 |
| `architect` | 시스템 설계, 아키텍처 결정 |
| `code-reviewer` | 코드 품질/보안/유지보수성 리뷰 |
| `security-reviewer` | 보안 취약점 전문 분석 |
| `refactorer` | 코드 리팩토링 |
| `tdd-guide` | TDD 가이드 |

### Contexts (컨텍스트)

작업 모드에 따라 우선순위 조정:

| 컨텍스트 | 언제 사용 | 우선순위 |
|----------|----------|----------|
| `dev` | 코드 작성/수정 | 품질 → 테스트 → 유지보수 |
| `review` | 코드 리뷰, PR 검토 | 보안 → 버그 → 성능 → 스타일 |
| `research` | 기술 조사, 비교 | 정확성 → 최신성 → 관련성 |

---

## 언어별 코딩 스타일

각 언어의 표준 컨벤션을 따릅니다 (프로젝트 기존 패턴 우선):

| 언어 | 함수/메서드 | 변수 | 상수 |
|------|-------------|------|------|
| C/C++ | `snake_case` / `PascalCase` | `snake_case` | `SCREAMING_SNAKE` |
| Go | `PascalCase` (exported) | `camelCase` | `PascalCase` |
| Rust | `snake_case` | `snake_case` | `SCREAMING_SNAKE` |
| C# | `PascalCase` | `camelCase` | `PascalCase` |
| Python | `snake_case` | `snake_case` | `SCREAMING_SNAKE` |

---

## 서버 특화 기능

### 성능 규칙 (`09-performance.md`)

- **메모리 관리**: 풀링, 프리얼로케이션, GC 최소화
- **동시성**: Lock-free 선호, 락 범위 최소화
- **네트워크 I/O**: 버퍼 재사용, 비동기 처리
- **프로파일링 도구**: 언어별 도구 안내

### 코드 품질 체크리스트

`skills/code-workflow/quality-checklist.md`에 언어별 예시 포함:
- Go: context + 에러 래핑
- Rust: Result + 명시적 에러 처리
- C++: RAII + optional
- C#: async/await + CancellationToken
- Python: 타입 힌트 + 컨텍스트 매니저

---

## 커스터마이징

### 규칙 수정

`rules/` 폴더에서 직접 수정:

```bash
# 예: 코딩 스타일 수정
vim rules/06-coding-style.md
```

### 에이전트 추가

`agents/` 폴더에 새 파일 생성:

```markdown
---
name: my-agent
description: 에이전트 설명
tools: Read, Grep, Glob
---

# 에이전트 내용
...
```

---

## 파일 목록

### Rules (10개)
```
rules/00-anti-hallucination.md
rules/01-mandatory-checklist.md
rules/02-context-anchoring.md
rules/03-core-principles.md
rules/04-communication.md
rules/05-security.md
rules/06-coding-style.md
rules/07-testing.md
rules/08-git-workflow.md
rules/09-performance.md
```

### Agents (6개)
```
agents/planner.md
agents/architect.md
agents/code-reviewer.md
agents/security-reviewer.md
agents/refactorer.md
agents/tdd-guide.md
```

### Commands (3개)
```
commands/plan.md
commands/review.md
commands/tdd.md
```

### Skills (4개)
```
skills/tool-usage/tool-autonomy.md
skills/tool-usage/web-search.md
skills/tool-usage/sequential-thinking.md
skills/code-workflow/quality-checklist.md
```

---

## 주의사항

### 컨텍스트 윈도우

MCP를 너무 많이 활성화하면 컨텍스트가 줄어듭니다:
- 권장: 프로젝트당 MCP 10개 이하

### 금지 표현

응답에서 피해야 할 표현:
- "추가로" (맥락 없이)
- "참고로" (느슨한 연관)
- "나중에 도움될"

### 허용 표현

가치 있는 확장 시:
- "⚠️ 고려사항:"
- "전제조건:"
- "잠재적 이슈:"

---

## 라이선스

MIT License
