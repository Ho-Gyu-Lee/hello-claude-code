---
name: tdd
description: TDD 방식 개발. "테스트 먼저", "TDD로", "테스트 주도", "RED-GREEN" 요청 시 사용. 인터페이스 정의, 테스트 작성, RED-GREEN-REFACTOR 사이클 실행.
---

# TDD - Test-Driven Development

## 황금률

**실패하는 테스트 없이 프로덕션 코드 작성 금지**

## 금지 사항

| 금지 | 대신 |
|------|------|
| 코드 작성 후 테스트 | 테스트 작성 → 실패 확인 → 코드 작성 |
| 테스트 실패 확인 생략 | 반드시 RED 상태 확인 |

## 사용법

```
/tdd [기능 설명]
/tdd 이메일 검증 함수
/tdd 사용자 생성 API
```

## TDD 사이클

```
RED:      실패하는 테스트 작성
GREEN:    테스트를 통과하는 최소 코드
REFACTOR: 코드 개선 (테스트 유지)
(반복)
```

## 프로세스

### 1단계: 인터페이스 정의
```typescript
// 함수 시그니처 먼저 정의
function validateEmail(email: string): ValidationResult
```

### 2단계: 테스트 케이스 도출
- 정상 케이스 (valid email)
- 에러 케이스 (invalid format)
- 경계값 (empty string, very long email)

### 3단계: RED - 첫 테스트 작성
```typescript
test('valid email returns success', () => {
  expect(validateEmail('user@example.com').valid).toBe(true);
});
```

### 4단계: GREEN - 최소 구현
```typescript
function validateEmail(email: string): ValidationResult {
  return { valid: email.includes('@') };
}
```

### 5단계: REFACTOR - 개선
```typescript
function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return { valid: emailRegex.test(email) };
}
```

## 출력 예시

```markdown
## TDD 세션: 이메일 검증

### 인터페이스
```typescript
function validateEmail(email: string): { valid: boolean; error?: string }
```

### 테스트 케이스
- [x] 정상 이메일 → valid: true
- [ ] 빈 문자열 → valid: false, error 포함
- [ ] @ 없음 → valid: false
- [ ] 도메인 없음 → valid: false

### 현재 단계
RED: "빈 문자열" 테스트 작성 중

### 다음 작업
빈 문자열 테스트 통과하는 코드 구현
```

## 옵션

- `--unit`: 단위 테스트 중심
- `--integration`: 통합 테스트 포함
- `--coverage`: 커버리지 목표 설정

