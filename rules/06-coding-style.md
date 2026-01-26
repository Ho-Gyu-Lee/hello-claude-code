# 코딩 스타일 (Coding Style)

## 간결성 원칙 (Over-Engineering 금지)

### 금지

- 요청하지 않은 파일 생성
- 요청하지 않은 추상화/인터페이스/아키텍처 확장
- 요청하지 않은 기능 추가

### 원칙

- 가장 직접적인 해결
- 요청 범위만 수정
- 요청된 범위 + 가치 있는 인사이트

## 네이밍 규칙 우선순위

### 적용 순서

1. **프로젝트 기존 패턴** ← 최우선 (기존 코드 분석)
2. **언어 표준 컨벤션** ← 해당 언어 커뮤니티 표준
3. **일반 원칙** ← 언어 표준 없을 때

### 언어별 표준 컨벤션

#### C/C++

| 구분 | 스타일 | 예시 |
|------|--------|------|
| 클래스/구조체 | PascalCase | `GameSession`, `PlayerData` |
| 함수 | snake_case 또는 PascalCase | `process_packet()`, `ProcessPacket()` |
| 변수 | snake_case | `player_count`, `max_connections` |
| 멤버 변수 | `m_` 접두사 또는 `_` 접미사 | `m_session_id`, `session_id_` |
| 상수/매크로 | SCREAMING_SNAKE_CASE | `MAX_PLAYERS`, `BUFFER_SIZE` |
| 네임스페이스 | snake_case | `game_server`, `network` |

#### Go

| 구분 | 스타일 | 예시 |
|------|--------|------|
| 패키지 | lowercase | `gameserver`, `network` |
| exported 함수/타입 | PascalCase | `NewSession()`, `PlayerData` |
| unexported | camelCase | `processPacket()`, `sessionID` |
| 상수 | PascalCase (exported) | `MaxPlayers`, `DefaultTimeout` |
| 인터페이스 | `-er` 접미사 권장 | `Reader`, `SessionHandler` |

#### Rust

| 구분 | 스타일 | 예시 |
|------|--------|------|
| 구조체/열거형/트레이트 | PascalCase | `GameSession`, `PacketType` |
| 함수/메서드 | snake_case | `process_packet()`, `new()` |
| 변수 | snake_case | `player_count`, `session_id` |
| 상수 | SCREAMING_SNAKE_CASE | `MAX_PLAYERS`, `BUFFER_SIZE` |
| 모듈 | snake_case | `game_server`, `network` |
| 생명주기 | 소문자 | `'a`, `'static` |

#### C#

| 구분 | 스타일 | 예시 |
|------|--------|------|
| 클래스/구조체 | PascalCase | `GameSession`, `PlayerData` |
| 메서드 | PascalCase | `ProcessPacket()`, `SendMessage()` |
| public 프로퍼티 | PascalCase | `SessionId`, `PlayerCount` |
| private 필드 | `_` + camelCase | `_sessionId`, `_playerCount` |
| 지역 변수/파라미터 | camelCase | `playerId`, `packetData` |
| 상수 | PascalCase | `MaxPlayers`, `DefaultTimeout` |
| 인터페이스 | `I` + PascalCase | `ISessionHandler`, `IPacketProcessor` |

#### Python

| 구분 | 스타일 | 예시 |
|------|--------|------|
| 클래스 | PascalCase | `GameSession`, `PlayerData` |
| 함수/메서드 | snake_case | `process_packet()`, `send_message()` |
| 변수 | snake_case | `player_count`, `session_id` |
| 상수 | SCREAMING_SNAKE_CASE | `MAX_PLAYERS`, `BUFFER_SIZE` |
| private | `_` 접두사 | `_internal_state` |
| 모듈 | snake_case | `game_server.py` |

### 프로젝트 패턴 분석

```
코드 작업 시:
1. 동일 파일/디렉토리의 기존 코드 샘플링 (3-5개)
2. 네이밍 패턴 분석 (함수명, 변수명, 타입명)
3. 기존 패턴 일관되게 따르기

예: 기존 Go 코드가 unexported에도 snake_case 사용
   → 언어 표준보다 프로젝트 패턴 우선
```

## 아키텍처 원칙 (권장)

**적용 시점**: "아키텍처", "구조 설계", "리팩토링" 요청 시

**원칙**:
- 계층 분리 (presentation / business / data)
- 단일 책임 (하나의 모듈 = 하나의 역할)
- 느슨한 결합 (인터페이스 통한 의존성)

**제외**: 간단한 스크립트/프로토타입/일회성 도구

## 서버 특화 가이드

### 메모리 관리
- 힙 할당 최소화 (풀링, 프리얼로케이션)
- 가비지 생성 주의 (Go/C#)
- RAII 패턴 활용 (C++/Rust)

### 동시성
- Lock-free 구조 선호 (가능한 경우)
- 락 범위 최소화
- 데드락 방지 (락 순서 일관성)

### 네트워크
- 버퍼 재사용
- 직렬화 비용 고려
- 비동기 I/O 선호
