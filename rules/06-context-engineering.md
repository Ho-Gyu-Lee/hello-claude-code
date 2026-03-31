# 컨텍스트 엔지니어링 (Context Engineering)

## 세션 관리

- 작업 간 `/clear`로 컨텍스트 초기화
- `/compact`는 자동 compaction(~95%) 전에 선제적으로 실행. `/context`로 사용량 확인
- 동일 이슈로 2회 이상 수정 → 컨텍스트 오염. `/clear` 후 재시작
- 무관한 작업은 별도 세션으로 분리
- 빠른 질문은 `/btw`로 — 컨텍스트에 추가되지 않음

## 프로그레시브 디스클로저

모든 정보를 한 번에 로드하지 않는다:
- CLAUDE.md는 핵심만 유지
- 상세 가이드는 @imports 또는 별도 파일로 분리
- 스킬은 필요할 때만 로드됨 (description 기반 자동 판단)

## .claudeignore

컨텍스트 낭비 방지를 위해 불필요한 파일 제외:

```
# 예시
node_modules/
dist/
build/
*.min.js
*.map
vendor/
__pycache__/
.git/
```

## 코드 작업 시 폴백 체인

```
코드 분석 실패 시:
Serena MCP → Glob → Grep → Read → 사용자에게 추가 정보 요청
```

## 대규모 작업

- Plan Mode로 전략 수립 후 실행
- 서브에이전트로 병렬 탐색 (메인 컨텍스트 보호)
- 독립적인 코드 변경은 Worktree 격리(`isolation: "worktree"`)로 안전하게 병렬 수행
- 배치 실행 시 체크포인트에서 검증

## 서브에이전트 활용 판단

- 단순 탐색 (파일/심볼 찾기) → Glob, Grep 직접 사용
- 3회 이상 탐색이 필요한 넓은 조사 → Explorer 에이전트 위임
- 독립적 조사 여러 건 → 서브에이전트 병렬 실행
- 코드 변경이 포함된 병렬 작업 → Worktree 격리 필수
