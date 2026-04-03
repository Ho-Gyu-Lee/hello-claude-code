# 테스트 (Testing)

## 코드 작성 완료 후

1. 프로젝트의 빌드/린트/테스트 명령어 확인
2. 실행 후 실패 시 수정 → 재실행

## TDD 사이클

```
RED    → 실패하는 테스트 먼저 작성
GREEN  → 테스트를 통과하는 최소 코드 구현
REFACTOR → 코드 개선 (테스트 유지)
```

## 테스트 네이밍

```
예시:
- test_user_login_with_valid_credentials_returns_token
- given_expired_token_when_refresh_then_return_new_token

반례:
- test1, testLogin, it_works
```

## 구조 (AAA 패턴)

```
Arrange → 준비 (테스트 데이터, 의존성)
Act     → 실행 (테스트 대상 호출)
Assert  → 검증 (기대 결과 비교)
```

## 체크리스트

```
[ ] 성공 케이스   [ ] 실패 케이스 (예외/에러)
[ ] 경계값        [ ] null/undefined
[ ] 빈 배열/문자열 [ ] 동시성 (필요시)
```

## 금지

```
- 테스트 없이 코드 머지
- 기존 테스트 깨뜨리고 방치
- 테스트 내 하드코딩된 sleep/delay
- 테스트 간 의존성 (순서 의존)
- 프로덕션 데이터로 테스트
```
