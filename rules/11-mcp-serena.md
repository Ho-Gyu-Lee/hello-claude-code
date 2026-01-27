# Serena MCP 우선 활용 원칙

## 핵심 원칙

코드 탐색 및 분석 시 **Serena MCP의 LSP 기반 도구를 Bash 명령어보다 우선 사용**한다.

## Serena MCP란?

Serena는 Language Server Protocol(LSP)을 활용한 시맨틱 코드 분석 MCP 서버로, 정확한 심볼 정의, 참조, 타입 정보를 제공한다.

## 도구 우선순위

### 1. 코드 읽기/탐색

```
❌ 피해야 할 방식:
Bash(sed -n '93,105p' file.go | cat -A)
Bash(cat file.go | head -n 100)
Bash(grep -n "function" file.ts)

✅ Serena MCP 우선:
get_symbol_definition  # 심볼 정의로 바로 이동
find_symbol           # 심볼 검색
get_file_symbols      # 파일 내 모든 심볼 목록
search_code           # 시맨틱 코드 검색
```

### 2. 참조/의존성 추적

```
❌ 피해야 할 방식:
Bash(grep -r "functionName" .)
Glob + Grep 조합

✅ Serena MCP 우선:
get_symbol_references  # 정확한 심볼 참조 찾기
get_codebase_symbols   # 전체 코드베이스 심볼 분석
```

### 3. 구조 파악

```
❌ 피해야 할 방식:
Bash(tree -L 3)
ls -la 반복 호출

✅ Serena MCP 우선:
get_codebase_structure  # 프로젝트 구조 분석
get_file_symbols        # 파일별 심볼 구조
```

## 사용 시나리오별 도구 선택

| 시나리오 | Serena MCP 도구 | Bash 대체 (비권장) |
|---------|----------------|-------------------|
| 함수 정의 찾기 | `get_symbol_definition` | `grep -n "func"` |
| 클래스 메서드 목록 | `get_file_symbols` | `sed -n` + 파싱 |
| 심볼 사용처 추적 | `get_symbol_references` | `grep -r` |
| 코드 패턴 검색 | `search_code` | `grep + awk` |
| 타입 정보 확인 | `get_symbol_hover` | 수동 분석 |

## Bash 허용 케이스

다음 경우에만 Bash 코드 명령어 사용:

1. **Serena MCP 미설치 환경** - 도구가 없는 경우
2. **단순 파일 내용 출력** - 특정 라인 범위만 필요할 때 (Read 도구 우선)
3. **비코드 파일** - 설정 파일, 로그 등 LSP 미지원 파일
4. **Git 명령어** - `git diff`, `git log` 등 버전 관리

## 폴백 전략

```
1차: Serena MCP 도구 시도
  ↓ (실패 또는 미설치)
2차: Read/Glob/Grep 내장 도구
  ↓ (부적합)
3차: Bash 명령어 (최후 수단)
```

## 핵심

Serena MCP가 제공하는 **시맨틱 분석의 정확성**은 텍스트 기반 검색보다 우수하다.
코드 작업 시 항상 Serena MCP 도구 사용 가능 여부를 먼저 확인하고 활용한다.
