---
name: quality-verification
description: 코드 품질 기준 및 완료 검증 프로세스. 코드 작성 완료 시, "다 됐어?", "완료됐나", "테스트 돌려봐", "빌드 확인", 작업 완료 주장 전 자동 활성화. 품질 체크리스트와 검증 명령어 제공.
user-invocable: false
---

# 품질 검증

## Part 1: 코드 품질 체크리스트

### 완전성 체크리스트 (7/7 필수)

```
[ ] 모든 import/include/using 문 포함
[ ] 타입 정의 포함 (구조체, 열거형 등)
[ ] 필수 설정 파일 언급 또는 제공
[ ] 환경 변수/설정 요구사항 명시
[ ] 의존성 버전 명시 (프로젝트의 의존성 관리 파일)
[ ] 빌드/실행 명령어 제공
[ ] 예상 출력/결과 언급
```

### 안정성 체크리스트 (5/5 필수)

```
[ ] 에러 처리 (언어별 관용구)
[ ] null/nil/nullptr 체크
[ ] 배열/슬라이스/버퍼 경계 검사
[ ] 입력 검증 (타입, 범위, 형식)
[ ] 타임아웃 설정 (네트워크/I/O 작업 시)
```

---

## Part 2: 품질 점수 평가

### 평가 기준 (각 1-5점, 임계값: 3)

| 기준 | 1 | 3 | 5 |
|------|---|---|---|
| 기능성 | 주요 기능 미동작 | 핵심 기능 동작, 에지케이스 누락 | 모든 요구사항 충족 |
| 코드 품질 | 기존 패턴 불일치, 중복 다수 | 패턴 일관, 일부 개선 여지 | 깔끔하고 관용적 |
| 테스트 | 테스트 없음 | 주요 경로 커버 | 경계값/에러 포함 |
| 보안 | 취약점 존재 | 기본 검증 포함 | 체계적 방어 |

### 판정

- 모든 기준 3 이상: PASS
- 하나라도 3 미만: FAIL -- 해당 기준 개선 후 재평가
- 평균 4 이상: 우수

---

## Part 3: 완료 검증 프로세스

### 황금률

**"증거 없이 완료를 주장하지 말 것"**

### 5단계 검증

| 단계 | 행동 | 확인 |
|------|------|------|
| 1. 식별 | 주장을 증명할 명령어 파악 | [ ] |
| 2. 실행 | 해당 명령어 실행 (새로 실행) | [ ] |
| 3. 읽기 | 전체 출력 + 종료 코드 확인 | [ ] |
| 4. 검증 | 출력이 주장을 뒷받침하는지 확인 | [ ] |
| 5. 주장 | 증거와 함께만 주장 | [ ] |

### 금지 표현

다음 표현 사용 시 **검증 미완료**:

- "완료되었을 것 같다"
- "아마 작동할 거야"
- "좋아 보인다"
- "문제없을 것이다"

### 주장별 검증 명령어

| 주장 | 검증 명령어 |
|------|------------|
| 테스트 통과 | `npm test`, `pytest`, `go test` |
| 빌드 성공 | `npm run build`, `cargo build` |
| 린트 정상 | `eslint .`, `golangci-lint run` |
| 타입 체크 | `tsc --noEmit`, `mypy .` |
| Unity 컴파일 정상 | `read_console(action="get", types=["error","warning"])` (0건) |
| Unity UI 렌더링 정상 | `manage_camera(action="screenshot", include_image=true)` |
| Unity UI 상호작용 정상 | `manage_editor(action="play")` → `read_console(...)` → `manage_editor(action="stop")` |

### UI 작업 전용 규칙

UXML/USS/UI 관련 C# 수정 후 "완료" 주장 전 (Unity MCP: CoplayDev/unity-mcp):
- 코드 체크리스트만 충족해서는 불충분
- 최소 `read_console` + `manage_camera(action="screenshot")` 결과를 대화에 명시
- 상호작용 로직 변경 시 `manage_editor(action="play")` + `read_console` 2단계 추가
- Unity MCP 미연결이면 사용자에게 에디터 확인 결과 요청

---

## 최종 체크리스트

```
코드 작성 완료 시:
[ ] 완전성 7/7 충족?
[ ] 안정성 5/5 충족?
[ ] 품질 점수 모든 기준 3 이상?
[ ] 테스트 실행하고 결과 확인?
[ ] 빌드 실행하고 결과 확인?
[ ] 증거와 함께 완료 주장?

UI 작업인 경우 추가 (Unity MCP: CoplayDev/unity-mcp):
[ ] read_console(action="get", types=["error","warning"]) 결과 0건?
[ ] manage_camera(action="screenshot", include_image=true)로 렌더링 확인?
[ ] (상호작용 변경 시) manage_editor(action="play") 후 read_console 재확인?
[ ] 검증 결과를 대화에 구체적으로 명시?
```

코드 리뷰 체크리스트는 review 스킬 참조.
