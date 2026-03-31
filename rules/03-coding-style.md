# 코딩 스타일 (Coding Style)

## 간결성 (Over-Engineering 금지)

- 요청하지 않은 파일/추상화/기능 추가 금지
- 가장 직접적인 해결, 요청 범위만 수정

## 네이밍 우선순위

1. **프로젝트 기존 패턴** — 동일 디렉토리 코드 3-5개 샘플링 후 따름
2. **언어 표준 컨벤션** — 프로젝트 패턴 없을 때

| 구분 | 스타일 | 예시 |
|------|--------|------|
| 클래스/구조체 | PascalCase | `GameSession` |
| 메서드 | PascalCase | `ProcessPacket()` |
| private 필드 | `_` + camelCase | `_sessionId` |
| 지역 변수/파라미터 | camelCase | `playerId` |
| 상수 | SCREAMING_SNAKE_CASE | `MAX_PLAYERS` |
| 인터페이스 | `I` + PascalCase | `ISessionHandler` |

서버 특화: `XxxPacket`, `XxxHandler`, `XxxManager`, `XxxSession`

## 아키텍처 원칙 (설계/리팩토링 요청 시)

- 계층 분리 (presentation / business / data)
- 단일 책임 (하나의 모듈 = 하나의 역할)
- 느슨한 결합 (인터페이스 통한 의존성)
- 간단한 스크립트/프로토타입에는 적용 제외

## 서버 특화

- **메모리**: 힙 할당 최소화, 풀링, RAII (C++/Rust)
- **동시성**: Lock-free 선호, 락 범위 최소화, 데드락 방지
- **네트워크**: 버퍼 재사용, 직렬화 비용 고려, 비동기 I/O 선호
