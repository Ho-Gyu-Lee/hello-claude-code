---
name: serena-mcp
description: Serena MCP 시맨틱 코드 분석 도구 활용 가이드. 코드 탐색, 심볼 검색, 참조 추적 작업 시 사용.
---

# Serena MCP 활용 가이드

## 개요

Serena MCP는 LSP(Language Server Protocol) 기반 시맨틱 코드 분석 도구입니다.
텍스트 검색(grep)보다 **정확한 심볼 분석**을 제공하며, **토큰 효율성**이 높습니다.

## 핵심 원칙

**코드 분석 작업 시 Serena MCP 도구를 내장 도구(Read, Grep, Bash)보다 우선 사용**

## 도구 우선순위

### 심볼/정의 찾기

```
✅ 우선: mcp__serena__find_symbol
✅ 우선: mcp__serena__get_symbol_definition
❌ 후순위: Grep, Bash(grep -n)
```

### 참조/사용처 추적

```
✅ 우선: mcp__serena__get_symbol_references
✅ 우선: mcp__serena__find_referencing_symbols
❌ 후순위: Grep(grep -r), Bash(rg)
```

### 코드 구조 파악

```
✅ 우선: mcp__serena__get_symbols_overview
✅ 우선: mcp__serena__get_file_symbols
❌ 후순위: Read(전체 파일), Bash(cat)
```

### 코드 편집

```
✅ 우선: mcp__serena__replace_symbol_body
✅ 우선: mcp__serena__insert_after_symbol
❌ 후순위: Edit(문자열 매칭 기반)
```

## 시나리오별 도구 선택

| 작업 | Serena MCP 도구 | 내장 도구 (후순위) |
|-----|----------------|------------------|
| 함수 정의 찾기 | `find_symbol` | Grep |
| 클래스 메서드 목록 | `get_file_symbols` | Read |
| 심볼 사용처 추적 | `get_symbol_references` | Grep -r |
| 타입 정보 확인 | `get_symbol_hover` | 수동 분석 |
| 코드베이스 구조 | `get_symbols_overview` | tree, ls |

## Serena 사용의 이점

1. **토큰 효율성** - 전체 파일 읽기 없이 필요한 심볼만 조회
2. **컨텍스트 보존** - 더 많은 작업을 Opus 모델로 처리 가능
3. **정확성** - 텍스트 매칭이 아닌 시맨틱 분석

## 내장 도구 사용 케이스

다음 경우에만 내장 도구 사용:

- Serena MCP 미연결 시
- 비코드 파일 (설정, 로그, 문서)
- Git 명령어 (`git diff`, `git log`)
- 단순 파일 내용 확인 (특정 라인 범위)

## 사용 조건

- Serena MCP가 연결된 경우에만 적용
- `claude mcp list`에서 `serena · ✔ connected` 확인 시 활성화
