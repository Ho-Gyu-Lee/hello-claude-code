# 테스트 규칙 (Testing)

## 기본 원칙

- TDD 권장 (Test-Driven Development)
- 최소 80% 코드 커버리지 목표
- 테스트는 문서다 (명확한 테스트명)

## TDD 사이클

```
1. RED: 실패하는 테스트 먼저 작성
2. GREEN: 테스트를 통과하는 최소 코드 구현
3. REFACTOR: 코드 개선 (테스트 유지)
```

## 테스트 네이밍

```
✅ 좋은 예:
- test_user_login_with_valid_credentials_returns_token
- should_throw_error_when_email_is_invalid
- given_expired_token_when_refresh_then_return_new_token

❌ 나쁜 예:
- test1
- testLogin
- it_works
```

## 테스트 구조 (AAA 패턴)

```
// Arrange (준비)
const user = createTestUser();
const invalidPassword = "wrong";

// Act (실행)
const result = await login(user.email, invalidPassword);

// Assert (검증)
expect(result.success).toBe(false);
expect(result.error).toBe("Invalid credentials");
```

## 테스트 종류별 가이드

### Unit Test
- 단일 함수/메서드 테스트
- 외부 의존성 모킹
- 빠른 실행 속도

### Integration Test
- 여러 컴포넌트 통합 테스트
- 실제 DB/외부 서비스 연동 (테스트 환경)
- Unit Test 이후 실행

### E2E Test
- 사용자 시나리오 전체 테스트
- 실제 환경과 유사하게
- CI/CD에서 실행

## 테스트 작성 체크리스트

```
☐ 성공 케이스 테스트
☐ 실패 케이스 테스트 (예외/에러)
☐ 경계값 테스트 (edge cases)
☐ null/undefined 처리
☐ 빈 배열/빈 문자열 처리
☐ 동시성 테스트 (필요시)
```

## 금지 사항

```
❌ 테스트 없이 코드 머지
❌ 기존 테스트 깨뜨리고 방치
❌ 테스트 내 하드코딩된 sleep/delay
❌ 테스트 간 의존성 (순서 의존)
❌ 프로덕션 데이터로 테스트
```
