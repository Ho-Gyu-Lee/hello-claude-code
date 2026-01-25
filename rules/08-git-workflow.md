# Git 워크플로우 (Git Workflow)

## 커밋 메시지 형식

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

| Type | 설명 |
|------|------|
| feat | 새로운 기능 |
| fix | 버그 수정 |
| docs | 문서 변경 |
| style | 코드 포맷팅 (기능 변경 없음) |
| refactor | 리팩토링 |
| test | 테스트 추가/수정 |
| chore | 빌드/설정 변경 |
| perf | 성능 개선 |

### 예시

```
feat(auth): add JWT refresh token support

- Implement refresh token rotation
- Add token expiry validation
- Update auth middleware

Closes #123
```

## 브랜치 전략

```
main (production)
  └── develop (staging)
       ├── feature/user-auth
       ├── feature/payment
       ├── fix/login-bug
       └── hotfix/critical-fix
```

### 브랜치 네이밍

```
feature/<issue-number>-<short-description>
fix/<issue-number>-<short-description>
hotfix/<issue-number>-<short-description>

예:
feature/123-user-authentication
fix/456-login-redirect-loop
hotfix/789-payment-failure
```

## PR 가이드라인

### PR 제목

```
[Type] 간략한 설명 (#이슈번호)

예:
[Feat] Add user authentication (#123)
[Fix] Resolve login redirect loop (#456)
```

### PR 체크리스트

```
☐ 테스트 통과
☐ 코드 리뷰 요청
☐ 문서 업데이트 (필요시)
☐ Breaking changes 명시 (있는 경우)
☐ 관련 이슈 링크
```

## 금지 사항

```
❌ main 브랜치에 직접 푸시
❌ force push (공유 브랜치)
❌ 커밋 메시지 "fix", "update", "wip" 만 사용
❌ 거대한 단일 커밋 (atomic commit 권장)
❌ 민감정보 커밋 (환경변수 사용)
```

## 유용한 Git 명령어

```bash
# 커밋 수정 (push 전)
git commit --amend

# 인터랙티브 리베이스
git rebase -i HEAD~3

# 스태시
git stash
git stash pop

# 특정 커밋 체리픽
git cherry-pick <commit-hash>

# 브랜치 정리
git branch -d <branch-name>
git remote prune origin
```
