---
name: serena-mcp
description: Serena MCP 시맨틱 코드 분석 및 프로젝트 지식 관리 가이드. 코드 탐색, 심볼 검색, 메모리 저장, 작업 검증 시 사용.
---

# Serena MCP 활용 가이드

## 개요

Serena MCP는 LSP 기반 시맨틱 코드 분석 + 프로젝트 지식 관리 도구입니다.
**21개 도구**를 제공하며, 내장 도구보다 **토큰 효율성**이 높습니다.

## 핵심 원칙

1. **코드 분석 시 Serena 도구 우선 사용**
2. **프로젝트 지식은 메모리에 저장**
3. **복잡한 작업은 사고 도구로 검증**

---

## 1. 심볼/코드 분석 도구

### 코드 탐색

| Serena 도구 | 용도 | 내장 도구 (후순위) |
|------------|------|------------------|
| `find_symbol` | 전역/로컬 심볼 검색 | Grep |
| `get_symbols_overview` | 파일 최상위 심볼 개요 | Read |
| `find_referencing_symbols` | 심볼 참조 추적 | Grep -r |

### 코드 편집

| Serena 도구 | 용도 | 내장 도구 (후순위) |
|------------|------|------------------|
| `replace_symbol_body` | 심볼 본문 교체 | Edit |
| `insert_after_symbol` | 심볼 뒤에 코드 삽입 | Edit |
| `insert_before_symbol` | 심볼 앞에 코드 삽입 | Edit |
| `rename_symbol` | 심볼 이름 변경 (전체 참조 포함) | Edit + Grep |

### 파일 탐색

| Serena 도구 | 용도 | 내장 도구 (후순위) |
|------------|------|------------------|
| `list_dir` | 디렉토리 목록 | Bash(ls) |
| `find_file` | 파일 검색 | Glob |
| `search_for_pattern` | 패턴 검색 | Grep |

---

## 2. 메모리/지식 관리 도구

프로젝트 지식을 `.serena/memories/`에 저장하여 **세션 간 컨텍스트 유지**

| 도구 | 용도 | 사용 시점 |
|-----|------|---------|
| `write_memory` | 지식 저장 | 중요 발견, 결정사항, 패턴 기록 |
| `read_memory` | 지식 조회 | 이전 컨텍스트 복원 |
| `list_memories` | 메모리 목록 | 저장된 지식 확인 |
| `edit_memory` | 메모리 수정 | 정보 업데이트 |
| `delete_memory` | 메모리 삭제 | 불필요한 정보 정리 |

### 메모리 활용 예시

```
저장할 정보:
- 프로젝트 아키텍처 결정사항
- 코드 컨벤션/패턴
- 버그 원인 분석 결과
- API 엔드포인트 구조
- 테스트/빌드 방법
```

---

## 3. 사고/검증 도구

복잡한 작업 시 **자기 검증**에 활용

| 도구 | 용도 | 사용 시점 |
|-----|------|---------|
| `think_about_collected_information` | 수집 정보 완전성 검토 | 분석 후 누락 확인 |
| `think_about_task_adherence` | 작업 방향 점검 | 복잡한 작업 중간 점검 |
| `think_about_whether_you_are_done` | 완료 여부 판단 | 작업 마무리 전 검증 |

---

## 4. 프로젝트 온보딩 도구

새 프로젝트 시작 시 **구조 파악 자동화**

| 도구 | 용도 |
|-----|------|
| `onboarding` | 프로젝트 구조, 빌드/테스트 방법 자동 식별 |
| `check_onboarding_performed` | 온보딩 완료 여부 확인 |
| `initial_instructions` | 초기 지침 로드 |

### 온보딩 활용

```
새 프로젝트 작업 시:
1. check_onboarding_performed로 확인
2. 미완료 시 onboarding 실행
3. 결과가 메모리에 자동 저장됨
```

---

## 도구 우선순위 요약

```
1순위: Serena MCP 도구
  - 심볼 분석: find_symbol, get_symbols_overview
  - 참조 추적: find_referencing_symbols
  - 코드 편집: replace_symbol_body, insert_*_symbol
  - 지식 관리: write_memory, read_memory

2순위: 내장 도구 (Serena 미지원 시)
  - Read, Grep, Glob, Edit

3순위: Bash (최후 수단)
  - Git 명령어, 비코드 파일
```

---

## Serena 사용의 이점

1. **토큰 효율성** - 전체 파일 읽기 없이 필요한 심볼만 조회
2. **컨텍스트 보존** - 더 많은 작업을 Opus로 처리 가능
3. **세션 간 지속성** - 메모리로 프로젝트 지식 유지
4. **정확성** - 텍스트 매칭이 아닌 시맨틱 분석

## 사용 조건

- Serena MCP 연결 시에만 적용
- `claude mcp list`에서 `serena · ✔ connected` 확인
