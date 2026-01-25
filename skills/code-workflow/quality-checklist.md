# 코드 품질 체크리스트 (Quality Checklist)

## 완전성 체크리스트 (7/7 필수)

```
☐ 모든 import/using 문 포함
☐ 타입 정의 포함 (TypeScript/Go/Rust 등)
☐ 필수 설정 파일 언급 또는 제공
☐ 환경 변수 요구사항 명시
☐ 의존성 버전 명시 (package.json, go.mod 등)
☐ 실행 명령어 제공
☐ 예상 출력/결과 언급
```

**측정 기준**: 7/7 항목 충족 (100%)

## 안정성 체크리스트 (5/5 필수)

```
☐ try-catch / error handling (언어별 관용구)
☐ null/nil/undefined 체크
☐ 배열/슬라이스 경계 검사
☐ 입력 검증 (타입, 범위, 형식)
☐ 타임아웃 설정 (네트워크 요청 시)
```

**측정 기준**: 최소 4/5 항목 충족 (80% 이상)

## 코드 작성 시 적용

### 함수/메서드

```typescript
// ✅ 좋은 예
async function getUser(id: string): Promise<User | null> {
  // 입력 검증
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid user ID');
  }

  try {
    const response = await fetch(`/api/users/${id}`, {
      signal: AbortSignal.timeout(5000), // 타임아웃
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data as User;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Failed to get user: ${error.message}`);
    }
    return null;
  }
}
```

### 배열 처리

```typescript
// ✅ 좋은 예
function getFirstItem<T>(items: T[]): T | undefined {
  // 경계 검사
  if (!items || items.length === 0) {
    return undefined;
  }
  return items[0];
}
```

### API 호출

```typescript
// ✅ 좋은 예
async function fetchData(url: string): Promise<Data> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}
```

## 코드 리뷰 시 확인

### 필수 확인 항목

1. **에러 처리**
   - 모든 비동기 작업에 try-catch
   - 의미 있는 에러 메시지
   - 에러 전파 전략

2. **입력 검증**
   - 사용자 입력 검증
   - API 파라미터 검증
   - 타입 안정성

3. **리소스 관리**
   - 연결 해제
   - 메모리 해제
   - 타이머/리스너 정리

4. **경계 조건**
   - 빈 배열/객체
   - null/undefined
   - 최대/최소값

## 언어별 관용구

### TypeScript/JavaScript
```typescript
// Optional chaining + nullish coalescing
const name = user?.profile?.name ?? 'Unknown';
```

### Go
```go
// 명시적 에러 처리
result, err := doSomething()
if err != nil {
    return fmt.Errorf("failed to do something: %w", err)
}
```

### Python
```python
# Context manager for resource management
with open('file.txt', 'r') as f:
    content = f.read()
```
