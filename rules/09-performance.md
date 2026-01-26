# 성능 (Performance)

## 핵심 원칙

> 조기 최적화는 만악의 근원. 하지만 **서버**에서 성능은 기능이다.

### 측정 우선
- 추측하지 말고 프로파일링
- 벤치마크 결과 기반 최적화
- 핫 패스(hot path) 집중

### 최적화 우선순위

1. **알고리즘/자료구조** ← 가장 큰 영향
2. **메모리 할당** ← 두 번째
3. **I/O / 네트워크** ← 세 번째
4. **마이크로 최적화** ← 마지막 (측정 후에만)

## 메모리 관리

### 할당 최소화

```
❌ 피해야 할 것
- 루프 내 반복 할당
- 임시 객체 생성 (특히 GC 언어)
- 불필요한 복사

✅ 권장
- 객체 풀링 (Object Pool)
- 사전 할당 (Pre-allocation)
- 슬라이스/버퍼 재사용
```

### 언어별 가이드

**C/C++**
- RAII로 리소스 관리
- `std::vector::reserve()` 사전 할당
- Move semantics 활용
- Custom allocator 고려 (메모리 풀)

**Go**
- `sync.Pool` 사용
- 슬라이스 용량 미리 지정 `make([]T, 0, capacity)`
- 포인터 vs 값 수신자 선택 주의
- 이스케이프 분석 이해 (`go build -gcflags='-m'`)

**Rust**
- 불필요한 `.clone()` 피하기
- `&str` vs `String` 적절히 선택
- `Vec::with_capacity()` 사용
- 제로 카피 직렬화 고려 (rkyv 등)

**C#**
- `Span<T>`, `Memory<T>` 활용
- `stackalloc` 고려 (작은 버퍼)
- `ArrayPool<T>.Shared` 사용
- 구조체(struct) vs 클래스(class) 선택

**Python**
- 리스트 컴프리헨션 > 반복 append
- `__slots__` 사용 (메모리 절약)
- 제너레이터로 지연 평가
- NumPy 배열 활용 (수치 연산)

## 동시성

### 락(Lock) 사용 원칙

```
1. 락 범위 최소화
2. 락 순서 일관성 (데드락 방지)
3. 읽기 많으면 RWLock 고려
4. Lock-free 구조 선호 (가능한 경우)
```

### 패턴

**작업자 풀 (Worker Pool)**
- 고정 개수의 워커
- 작업 큐 (채널/링버퍼)
- Graceful shutdown

**파이프라인**
- 단계별 분리
- 버퍼링으로 백프레셔 관리
- 병목 지점 확인

### 언어별 가이드

**Go**
```go
// 채널 크기 고려
ch := make(chan Packet, 1000) // 버퍼링

// context로 취소 전파
select {
case msg := <-ch:
    process(msg)
case <-ctx.Done():
    return
}
```

**Rust**
```rust
// crossbeam 채널 (bounded)
let (tx, rx) = crossbeam::channel::bounded(1000);

// Tokio 런타임에서 spawn
tokio::spawn(async move {
    while let Some(msg) = rx.recv().await {
        process(msg).await;
    }
});
```

## 네트워크 I/O

### 원칙

```
1. 비동기 I/O 선호 (epoll/kqueue/io_uring)
2. 버퍼 재사용
3. 배치 처리 (Nagle 알고리즘 이해)
4. 연결 풀링
```

### 직렬화 비용

| 포맷 | 속도 | 크기 | 용도 |
|------|------|------|------|
| Protocol Buffers | 빠름 | 작음 | 범용 |
| FlatBuffers | 매우 빠름 | 작음 | 제로카피 필요 시 |
| MessagePack | 빠름 | 작음 | JSON 대체 |
| JSON | 느림 | 큼 | 디버깅/로깅 |

### TCP 튜닝 포인트
- `TCP_NODELAY` (지연 민감한 경우)
- Send/Receive 버퍼 크기
- Keep-alive 설정

## 데이터베이스

### 원칙

```
1. 연결 풀 사용
2. 준비된 문장(Prepared Statement) 재사용
3. 배치 처리
4. 적절한 인덱싱
```

### N+1 문제 방지

```
❌ 피해야 할 것
for player in players:
    items = db.query_items(player.id)  # N번 쿼리

✅ 권장
player_ids = [p.id for p in players]
items = db.query_items_batch(player_ids)  # 1번 쿼리
```

## 프로파일링 도구

### C/C++
- Valgrind (Callgrind)
- perf (Linux)
- Intel VTune
- Tracy Profiler

### Go
- `go tool pprof`
- `go tool trace`
- `runtime/metrics`

### Rust
- `cargo flamegraph`
- `perf` + `inferno`
- `criterion` (벤치마크)

### C#
- dotTrace
- PerfView
- BenchmarkDotNet

### Python
- `cProfile` / `py-spy`
- `memory_profiler`
- `line_profiler`

## 리뷰 체크리스트

```
☐ 핫 패스에 불필요한 할당 없음
☐ 적절한 자료구조 선택
☐ 락 범위 최소화
☐ I/O 작업 비동기 처리
☐ N+1 쿼리 없음
☐ 적절한 캐싱 전략
☐ 벤치마크/프로파일링 결과 확인
```
