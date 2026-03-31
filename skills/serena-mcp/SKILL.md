---
name: serena-mcp
description: Serena MCP 시맨틱 코드 분석 가이드. Serena MCP 연결 시 자동 활성화. 심볼 검색, 참조 추적, 코드 편집, 메모리 저장 작업에서 내장 도구 대신 Serena 도구 우선 사용. 코드 탐색/분석/리팩토링 요청 시 적용.
user-invocable: false
---

# Serena MCP 활용 가이드

Serena MCP는 LSP 기반 시맨틱 코드 분석 + 프로젝트 지식 관리 도구입니다.
**Serena MCP 연결 시에만 적용.** 미연결 시 내장 도구(Grep, Glob, Read, Edit) 사용.

## 핵심 원칙

1. **코드 분석 시 Serena 도구 우선 사용**
2. **프로젝트 지식은 메모리에 저장**

## 도구 매핑

### 코드 탐색

| Serena 도구 | 용도 | 폴백 (미연결 시) |
|------------|------|----------------|
| `find_symbol` | 심볼 검색 | Grep |
| `get_symbols_overview` | 파일 심볼 개요 | Read |
| `find_referencing_symbols` | 참조 추적 | Grep |

### 코드 편집

| Serena 도구 | 용도 | 폴백 (미연결 시) |
|------------|------|----------------|
| `replace_symbol_body` | 심볼 본문 교체 | Edit |
| `insert_after_symbol` / `insert_before_symbol` | 코드 삽입 | Edit |
| `rename_symbol` | 전체 참조 포함 이름 변경 | Edit + Grep |

### 파일 탐색

| Serena 도구 | 용도 | 폴백 (미연결 시) |
|------------|------|----------------|
| `list_dir` | 디렉토리 목록 | Bash(ls) |
| `find_file` | 파일 검색 | Glob |
| `search_for_pattern` | 패턴 검색 | Grep |

## 메모리 관리

프로젝트 지식을 `.serena/memories/`에 저장하여 세션 간 컨텍스트 유지:

| 도구 | 용도 |
|-----|------|
| `write_memory` | 중요 발견, 결정사항, 패턴 기록 |
| `read_memory` / `list_memories` | 이전 컨텍스트 복원 |
| `edit_memory` / `delete_memory` | 정보 업데이트/정리 |

## 프로젝트 온보딩

새 프로젝트 시작 시:
1. `check_onboarding_performed`로 확인
2. 미완료 시 `onboarding` 실행
3. 결과가 메모리에 자동 저장됨

## 이점

- **토큰 효율성** — 전체 파일 대신 필요한 심볼만 조회
- **세션 간 지속성** — 메모리로 프로젝트 지식 유지
- **정확성** — 텍스트 매칭이 아닌 시맨틱 분석
