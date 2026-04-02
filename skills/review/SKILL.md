---
name: review
description: 코드 품질/보안/유지보수성 검토. "리뷰해줘", "코드 검토", "PR 리뷰", "보안 점검" 요청 시 사용. 단일 리뷰 진입점 — 파일, staged, commit, PR 모두 지원.
argument-hint: "[파일경로|--staged|--pr 번호|--security|--performance]"
allowed-tools: Read, Grep, Glob, Bash
---

# 코드 리뷰

단일 리뷰 진입점 — 파일, staged, commit, PR 모두 지원.

## 사용법

```
/review $ARGUMENTS
```

- `/review src/api/user.ts` — 파일/디렉토리 리뷰
- `/review --staged` — 스테이징된 변경사항
- `/review --last-commit` — 마지막 커밋
- `/review --pr 123` — Pull Request 리뷰 (gh CLI 활용)
- `/review --security src/auth/` — 보안 중심 리뷰
- `/review --performance` — 성능 중심 리뷰
- `/review --style` — 스타일 중심 리뷰
- `/review --verbose` — 상세 설명 포함

## PR 리뷰 시

```bash
# PR diff 가져오기
gh pr diff $PR_NUMBER

# PR 코멘트 확인
gh pr view $PR_NUMBER --comments

# 변경 파일 목록
gh pr diff $PR_NUMBER --name-only
```

## 등급

| 등급 | 설명 |
|------|------|
| Critical | 즉시 수정 — 보안 취약점, 데이터 손실, 심각한 버그 |
| High | 머지 전 수정 — 성능 문제, 로직 오류, 에러 처리 누락 |
| Medium | 권장 — 코드 스타일, 중복 코드, 네이밍 |
| Low | 선택 — 사소한 개선 |

## 출력 형식

파일별로 그룹, 등급은 이슈별 태그:

```
## 리뷰 결과: [대상]

### `파일 경로`

[등급] Line:번호 — 이슈명
- 문제 설명. 왜 위험한지.
- 영향 범위: 동일 패턴이 있는 파일/모듈/건수
- 해결: 수정 방향 설명.

  ```언어
  수정안 코드 (Before 없이 수정안만)
  ```
```

코드 블록은 필요한 경우에만. 단순 이슈는 설명만으로 충분.
