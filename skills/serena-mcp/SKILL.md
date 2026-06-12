---
name: serena-mcp
description: Serena MCP 시맨틱 코드 분석 가이드. Serena MCP 연결 시 자동 활성화. 심볼 검색, 참조 추적, 코드 편집, 메모리 저장 작업에서 내장 도구 대신 Serena 도구 우선 사용. 코드 탐색/분석/리팩토링 요청 시 적용.
user-invocable: false
---

# Serena MCP 활용 가이드

## 0단계: 도구 로드 (필수 선행)

Serena 도구는 deferred 상태다 — 호출 전에 ToolSearch로 스키마를 로드한다:

```
ToolSearch("select:mcp__oraios_serena__find_symbol,mcp__oraios_serena__get_symbols_overview")
ToolSearch("+serena symbol")   # 키워드 검색도 가능
```

ToolSearch 결과가 비어 있으면 → Serena 미연결. Path B로 전환하고 한 문장 고지한다("Serena 미연결 — 내장 도구로 진행").

## Path A — Serena 연결 시

### 코드 탐색

| Serena 도구 | 용도 |
|------------|------|
| `find_symbol` | 심볼 검색 |
| `get_symbols_overview` | 파일 심볼 개요 (새 파일 이해의 시작점) |
| `find_referencing_symbols` | 참조 추적 |
| `find_declaration` / `find_implementations` | 선언/구현 위치 |
| `get_diagnostics_for_file` | LSP 진단 (오류/경고) |

### 코드 편집

| Serena 도구 | 용도 |
|------------|------|
| `replace_symbol_body` | 심볼 본문 교체 |
| `insert_after_symbol` / `insert_before_symbol` | 코드 삽입 |
| `rename_symbol` | 전체 참조 포함 이름 변경 |
| `replace_content` / `safe_delete_symbol` | 내용 교체 / 안전 삭제 |

### 메모리 관리

프로젝트 지식을 `.serena/memories/`에 저장하여 세션 간 컨텍스트 유지:

| 도구 | 용도 |
|-----|------|
| `write_memory` | 중요 발견, 결정사항, 패턴 기록 |
| `read_memory` / `list_memories` | 이전 컨텍스트 복원 |
| `edit_memory` / `delete_memory` / `rename_memory` | 정보 업데이트/정리 |

### 온보딩

새 프로젝트 시작 시 `list_memories`로 온보딩 메모리 존재를 확인하고, 없으면 `onboarding` 실행(결과가 메모리에 저장됨). 코딩 작업 전 `initial_instructions`로 Serena 사용 지침을 읽는다.

## Path B — 미연결 시 폴백

| 작업 | 폴백 도구 |
|------|----------|
| 심볼/패턴 검색 | Grep |
| 파일 개요 | Read |
| 파일 검색 | Glob |
| 코드 편집 | Edit |
| 이름 변경 | Edit + Grep (참조 전수 확인) |

폴백 진입 시 한 문장 고지한다 — 결과 신뢰도가 달라지는 경우(시맨틱 분석 불가)에 해당한다.

## 이점 (Path A 기준)

- **토큰 효율성** — 전체 파일 대신 필요한 심볼만 조회
- **세션 간 지속성** — 메모리로 프로젝트 지식 유지
- **정확성** — 텍스트 매칭이 아닌 시맨틱 분석

## 주의

- 프로젝트의 `.serena/project.yml` `languages:`에 해당 언어가 있어야 심볼 분석이 동작한다 (JavaScript는 `typescript`로 지정).
