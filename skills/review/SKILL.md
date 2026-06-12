---
name: review
description: 코드 품질/보안/유지보수성 검토. "리뷰해줘", "코드 검토", "PR 리뷰", "보안 점검" 요청 시 사용. 단일 리뷰 진입점 — 파일, staged, commit, PR 모두 지원.
argument-hint: "[파일경로|--staged|--pr 번호|--security|--performance]"
allowed-tools: Read, Grep, Glob, Bash
---

# 코드 리뷰

단일 리뷰 진입점 — 파일, staged, commit, PR 모두 지원.

## 평가 사다리 (비용 순서 강제)

공짜 검사를 먼저 소진하고, LLM 판단은 그 위에, 다중 관점은 조건부로 쌓는다.

1. **Stage 1 — 기계적 ($0)**: 빌드/린트/테스트를 리뷰 **전에** 실행한다. 실패하면 LLM 리뷰에 앞서 결과를 보고하고 진행 여부를 확인한다. (검증 명령어는 quality-verification 스킬 참조)
2. **Stage 2 — 의미적**: diff를 기준(plan.md의 요구사항/완료 조건)과 대조하고 아래 등급으로 분류한다. 리뷰 본문이 여기다.
3. **Stage 3 — 다중 관점 (조건부 승격)**: 아래 트리거 중 하나라도 충족할 때만 보안/성능/아키텍처 관점(security-reviewer·architect 에이전트)을 추가 투입한다. 미충족 시 Stage 2에서 종료한다 — 토큰 절약.
   - 보안 표면 변경: 인증/인가, 입력 처리, 시크릿, 권한
   - 대규모 diff: ±300줄 초과
   - Stage 2 경계 판정: Critical/High 여부가 애매한 발견 존재

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

리뷰 결과 말미에 **Verification Steps**를 필수로 붙인다 — 제3자가 발견을 재현하고 수정을 검증할 수 있는 명령 목록:

```
## Verification Steps
1. `npm test` — 전체 통과 확인
2. `npm run build` — 빌드 성공 확인
3. [발견별 재현 명령 또는 확인 경로]
```

## 워크플로우 산출물 (입출력)

- 입력: `.claude/workflow/<기능>/plan.md`가 있으면 리뷰 기준(요구사항/완료 조건)으로 함께 본다.
- 독립성: 리뷰는 diff와 기준만 본다 — 변경을 만든 추론 과정에 기대지 않는다 (fresh context). 가능하면 code-reviewer 에이전트에 위임한다.
- 출력: 주요 발견은 `.claude/workflow/<기능>/review.md`에 남겨 후속 수정이 이어받게 한다.
