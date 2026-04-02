---
name: performance-guide
description: 서버 성능 최적화 가이드. "성능", "최적화", "프로파일링", "벤치마크", "메모리 누수", "병목" 관련 질문 시 자동 활성화. 언어별 최적화 패턴과 프로파일링 도구 안내.
user-invocable: false
---

# 성능 최적화 가이드

## 원칙: 측정 우선

추측하지 말고 프로파일링. 최적화 우선순위:
1. **알고리즘/자료구조** ← 가장 큰 영향
2. **메모리 할당** ← 두 번째
3. **I/O / 네트워크** ← 세 번째
4. **마이크로 최적화** ← 마지막 (측정 후에만)

## 메모리 관리

```
❌ 루프 내 반복 할당, 임시 객체 생성, 불필요한 복사
✅ 객체 풀링, 사전 할당, 슬라이스/버퍼 재사용
```

### 언어별

- **Go**: `sync.Pool`, `make([]T, 0, capacity)`, 이스케이프 분석 (`go build -gcflags='-m'`)
- **Rust**: `.clone()` 최소화, `Vec::with_capacity()`, 제로카피 직렬화
- **C#**: `Span<T>`, `ArrayPool<T>.Shared`, `stackalloc` (작은 버퍼)
- **C++**: RAII, `std::vector::reserve()`, Move semantics, Custom allocator
- **Python**: 리스트 컴프리헨션, `__slots__`, 제너레이터, NumPy

## 동시성

```
1. 락 범위 최소화
2. 락 순서 일관성 (데드락 방지)
3. 읽기 많으면 RWLock
4. Lock-free 구조 선호 (가능한 경우)
```

### 패턴
- **Worker Pool**: 고정 워커 + 작업 큐 + Graceful shutdown
- **Pipeline**: 단계별 분리 + 버퍼링 백프레셔 + 병목 확인

## 네트워크 I/O

- 비동기 I/O 선호 (epoll/kqueue/io_uring)
- 버퍼 재사용, 배치 처리
- `TCP_NODELAY` (지연 민감), 연결 풀링

### 직렬화 비용

| 포맷 | 속도 | 크기 | 용도 |
|------|------|------|------|
| Protocol Buffers | 빠름 | 작음 | 범용 |
| FlatBuffers | 매우 빠름 | 작음 | 제로카피 |
| MessagePack | 빠름 | 작음 | JSON 대체 |
| JSON | 느림 | 큼 | 디버깅/로깅 |

## 데이터베이스

- 연결 풀 사용, Prepared Statement 재사용, 배치 처리
- N+1 방지: 루프 내 쿼리 → 배치 쿼리로 변환

## 리뷰 체크리스트

```
☐ 핫 패스에 불필요한 할당 없음
☐ 적절한 자료구조 선택
☐ 락 범위 최소화 / 데드락 여부
☐ I/O 작업 비동기 처리
☐ N+1 쿼리 없음
☐ 벤치마크/프로파일링 결과 확인
```
