# Claude Code 글로벌 설정

> 이 파일은 모든 세션에 로드됩니다. 간결하게 유지하세요.

## 핵심 원칙

### 1. 헛소리 방지 (Anti-Hallucination)
- 확실한 정보만 답변, 모르면 "확인 불가" 명시
- 추측 시 "추측:" 선언 후 작성
- 근거 먼저, 결론 나중

### 2. 분석 없이 수용 금지
```
❌ "좋습니다", "좋은 의견입니다", "말씀대로 하겠습니다"
✅ 동의/우려/반대 + 구체적 이유 제시
```

### 3. 코드 작업 전 필수 확인
- 코드 구조 파악 (영향 범위, 기존 패턴)
- 실패 시 폴백: Glob → Grep → Read → 추가 정보 요청

---

## 워크플로우

### 개발 흐름
```
/brainstorming → /plan → 구현 → /tdd → /review
    설계          계획     코드    테스트   리뷰
```

### 스킬 사용법

**수동 호출** (슬래시 커맨드):
| 명령 | 용도 |
|------|------|
| `/brainstorming` | 구현 전 설계 논의 |
| `/plan` | 구현 계획 수립 |
| `/review` | 코드 품질/보안 검토 |
| `/tdd` | TDD 방식 개발 |
| `/setup-serena-mcp` | Serena MCP 프로젝트 설정 |

**자동 트리거** (상황에 따라 활성화):
- `systematic-debugging` - 에러/버그 발생 시
- `quality-verification` - 작업 완료 검증 시
- `research-context` - 기술 조사/비교 시
- `executing-plans` - 계획 실행 시
- `error-response` - 실패 상황 보고 시

---

## 참조 문서

상세 가이드가 필요하면 아래 파일 참조:

### Rules (`rules/`)
| 파일 | 내용 |
|------|------|
| `00-anti-hallucination.md` | 정확성, 신뢰도 표시 |
| `01-mandatory-checklist.md` | 응답 전 필수 확인 |
| `03-core-principles.md` | YAGNI, KISS, DRY |
| `05-security.md` | 보안 가이드라인 |
| `06-coding-style.md` | 코딩 스타일 |
| `07-testing.md` | 테스트 원칙 |

### Agents (`agents/`)
| 파일 | 역할 |
|------|------|
| `architect.md` | 시스템 설계/아키텍처 |
| `planner.md` | 작업 계획 수립 |
| `code-reviewer.md` | 코드 리뷰 |
| `security-reviewer.md` | 보안 리뷰 |
| `tdd-guide.md` | TDD 가이드 |
| `refactorer.md` | 리팩토링 |

### Skills (`skills/`)
12개 스킬 - 상세 내용은 각 `SKILL.md` 참조

---

## 빠른 참조

### 복잡한 분석 필요 시
1. 문제/요구사항 명확화
2. 옵션 나열
3. 각 옵션 장단점
4. 결론 및 근거

### 코드 품질 체크리스트
```
☐ 모든 import 포함
☐ 타입 정의 포함
☐ 에러 처리 (언어별 관용구)
☐ 입력 검증
☐ 테스트 통과 확인
```

### 완료 검증
```
"증거 없이 완료 주장 금지"
- 테스트 실행 결과 확인
- 빌드 성공 확인
- 예상 결과와 일치 확인
```

---

## MCP 도구 우선순위

> **원칙**: MCP 도구가 연결되어 있으면 내장 도구보다 우선 사용

### 웹 검색/접근
```
1순위: Z.ai MCP (연결 시)
  - Search MCP (webSearch) → 웹 검색
  - Reader MCP (webReader) → URL 콘텐츠 추출

2순위: 기타 MCP (Z.ai 미연결 시)
  - Brave Search MCP → 웹 검색
  - Fetch MCP → URL 접근

3순위: 내장 도구 (MCP 미연결 시)
  - WebSearch → 웹 검색
  - WebFetch → URL 접근
```

### 코드 분석 (Serena MCP 연결 시)
심볼 검색, 참조 추적, 코드 편집에서 내장 도구 대신 Serena 도구 우선 사용.
```
1순위: Serena MCP
  - find_symbol, get_symbols_overview - 심볼 분석
  - replace_symbol_body, rename_symbol - 코드 편집
  - write_memory, read_memory - 지식 관리

2순위: 내장 도구 (Serena 미연결 시)
  - Grep, Glob, Read, Edit
```

### Sequential Thinking MCP (연결 시)
복잡한 아키텍처 결정, 3개 이상 옵션 비교 시 사용.
단순 작업에는 사용하지 않음 (토큰 비용 높음).
