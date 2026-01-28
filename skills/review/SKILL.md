---
name: review
description: 코드 품질, 보안, 유지보수성 검토. 파일 또는 변경사항 리뷰. 코드 리뷰가 필요하거나 PR 검토, 코드 품질 확인 요청 시 사용.
---

# 코드 리뷰

코드 품질, 보안, 유지보수성을 검토합니다.

## 사용법

```
/review [파일 경로 또는 변경사항]
/review src/api/user.ts
/review --staged  # 스테이징된 변경사항
/review --last-commit  # 마지막 커밋
```

## 리뷰 범위

### 🔴 Critical (즉시 수정)
- 보안 취약점
- 데이터 손실 위험
- 심각한 버그

### 🟠 High (머지 전 수정)
- 성능 문제
- 로직 오류
- 에러 처리 누락

### 🟡 Medium (권장)
- 코드 스타일
- 중복 코드
- 네이밍 개선

### 🟢 Low (선택)
- 사소한 개선
- 주석 추가

## 출력 예시

```markdown
## 리뷰 결과: src/api/user.ts

### 🔴 Critical
[C-1] SQL Injection | `line:45` | 사용자 입력 직접 쿼리 | 파라미터 바인딩 사용

### 🟠 High
[H-1] N+1 Query | `line:78` | 루프 내 쿼리 | JOIN 또는 배치 로드

### 📋 요약
| ID | 등급 | 이슈 | 상태 |
|----|------|------|------|
| C-1 | 🔴 | SQL Injection | 수정 필요 |
| H-1 | 🟠 | N+1 Query | 수정 필요 |

**즉시 조치**: C-1
**계획 수립**: H-1
```

## 옵션

- `--security`: 보안 중심 리뷰
- `--performance`: 성능 중심 리뷰
- `--style`: 스타일 중심 리뷰
- `--verbose`: 상세 설명 포함
