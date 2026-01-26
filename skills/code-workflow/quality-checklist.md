# 코드 품질 체크리스트 (Quality Checklist)

## 완전성 체크리스트 (7/7 필수)

```
☐ 모든 import/include/using 문 포함
☐ 타입 정의 포함 (구조체, 열거형 등)
☐ 필수 설정 파일 언급 또는 제공
☐ 환경 변수/설정 요구사항 명시
☐ 의존성 버전 명시 (go.mod, Cargo.toml 등)
☐ 빌드/실행 명령어 제공
☐ 예상 출력/결과 언급
```

**측정 기준**: 7/7 항목 충족 (100%)

## 안정성 체크리스트 (5/5 필수)

```
☐ 에러 처리 (언어별 관용구)
☐ null/nil/nullptr 체크
☐ 배열/슬라이스/버퍼 경계 검사
☐ 입력 검증 (타입, 범위, 형식)
☐ 타임아웃 설정 (네트워크/I/O 작업 시)
```

**측정 기준**: 최소 4/5 항목 충족 (80% 이상)

## 언어별 코드 예시

### Go

```go
// ✅ 좋은 예: 에러 처리 + 타임아웃 + 입력 검증
func GetPlayer(ctx context.Context, playerID int64) (*Player, error) {
    // 입력 검증
    if playerID <= 0 {
        return nil, fmt.Errorf("invalid player ID: %d", playerID)
    }

    // 타임아웃 설정
    ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
    defer cancel()

    player, err := db.QueryPlayerByID(ctx, playerID)
    if err != nil {
        if errors.Is(err, sql.ErrNoRows) {
            return nil, nil // not found
        }
        return nil, fmt.Errorf("query player %d: %w", playerID, err)
    }

    return player, nil
}
```

### Rust

```rust
// ✅ 좋은 예: Result + 명시적 에러 처리
pub fn get_player(player_id: u64) -> Result<Option<Player>, GameError> {
    // 입력 검증
    if player_id == 0 {
        return Err(GameError::InvalidInput("player_id cannot be 0".into()));
    }

    let player = match db::query_player(player_id) {
        Ok(p) => p,
        Err(DbError::NotFound) => return Ok(None),
        Err(e) => return Err(GameError::Database(e)),
    };

    Ok(Some(player))
}
```

### C++

```cpp
// ✅ 좋은 예: RAII + 예외 안전 + 널 체크
std::optional<Player> GetPlayer(int64_t player_id) {
    // 입력 검증
    if (player_id <= 0) {
        throw std::invalid_argument("Invalid player ID");
    }

    // RAII로 리소스 관리
    auto conn = connection_pool_.Acquire();
    if (!conn) {
        throw std::runtime_error("Failed to acquire connection");
    }

    auto result = conn->Query("SELECT * FROM players WHERE id = ?", player_id);
    if (result.empty()) {
        return std::nullopt;
    }

    return Player::FromRow(result[0]);
}
```

### C#

```csharp
// ✅ 좋은 예: 널 체크 + async/await + 취소 토큰
public async Task<Player?> GetPlayerAsync(long playerId, CancellationToken ct = default)
{
    // 입력 검증
    if (playerId <= 0)
        throw new ArgumentException("Invalid player ID", nameof(playerId));

    try
    {
        using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
        cts.CancelAfter(TimeSpan.FromSeconds(5)); // 타임아웃

        var player = await _db.Players
            .FirstOrDefaultAsync(p => p.Id == playerId, cts.Token);

        return player;
    }
    catch (OperationCanceledException) when (!ct.IsCancellationRequested)
    {
        throw new TimeoutException("Database query timed out");
    }
}
```

### Python

```python
# ✅ 좋은 예: 타입 힌트 + 예외 처리 + 컨텍스트 매니저
async def get_player(player_id: int) -> Player | None:
    """플레이어 조회. 없으면 None 반환."""
    # 입력 검증
    if player_id <= 0:
        raise ValueError(f"Invalid player ID: {player_id}")

    try:
        async with asyncio.timeout(5.0):  # 타임아웃
            async with db.acquire() as conn:
                row = await conn.fetchone(
                    "SELECT * FROM players WHERE id = $1",
                    player_id
                )
                if row is None:
                    return None
                return Player.from_row(row)
    except asyncio.TimeoutError:
        logger.error(f"Timeout querying player {player_id}")
        raise
```

## 배열/버퍼 경계 처리

### Go
```go
func GetFirst[T any](items []T) (T, bool) {
    var zero T
    if len(items) == 0 {
        return zero, false
    }
    return items[0], true
}
```

### Rust
```rust
fn get_first<T: Clone>(items: &[T]) -> Option<T> {
    items.first().cloned()
}
```

### C++
```cpp
template<typename T>
std::optional<T> GetFirst(const std::vector<T>& items) {
    if (items.empty()) {
        return std::nullopt;
    }
    return items.front();
}
```

## 코드 리뷰 시 확인

### 필수 확인 항목

1. **에러 처리**
   - 모든 실패 가능 경로에 에러 처리
   - 의미 있는 에러 메시지 (디버깅 가능)
   - 에러 전파 vs 처리 전략 명확

2. **입력 검증**
   - 외부 입력 (네트워크 패킷, API 파라미터)
   - 타입 + 범위 + 형식 검증
   - 악의적 입력 방어 (버퍼 오버플로우 등)

3. **리소스 관리**
   - 연결/핸들/파일 해제
   - 메모리 해제 (C/C++)
   - 타이머/고루틴/태스크 정리

4. **경계 조건**
   - 빈 컬렉션
   - null/nil/nullptr
   - 정수 오버플로우
   - 최대/최소값 경계
