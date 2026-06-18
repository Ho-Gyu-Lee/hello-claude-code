# Contributing

기여해 주셔서 감사합니다!

## 기여 방법

### 1. 이슈 등록
- 버그 리포트
- 기능 제안
- 문서 개선

### 2. Pull Request
1. Fork
2. 브랜치 생성 (`feature/amazing-feature`)
3. 변경사항 커밋
4. PR 생성

## 기여 가이드라인

### Rules 추가/수정
- 규칙은 `CLAUDE.md`(정본)의 "규칙" 섹션에 직접 추가/수정한다 — 별도 `rules/` 디렉토리는 없다.
- `AGENTS.md`(Codex)는 deploy가 `CLAUDE.md`에서 동기화하므로 직접 수정하지 않는다.
- 상시 로드되니 짧고 broadly-applicable한 것만. 가끔만 필요한 내용은 `references/`에 두고 스킬이 참조하게 한다.

### Agents 추가
- `agents/` 폴더에 `.md` 파일 추가
- 프론트매터 필수:
  ```yaml
  ---
  name: agent-name
  description: 에이전트 역할과 사용 시점을 구체적으로 기술
  tools: Read, Grep, Glob, Bash
  ---
  ```
- 선택 필드:
  | 필드 | 설명 | 예시 |
  |------|------|------|
  | `model` | 모델 지정 | `sonnet`, `opus`, `haiku` |
  | `skills` | 연결할 스킬 | `review`, `tdd` |
  | `permissionMode` | 권한 모드 | `bypassPermissions`, `plan`, `default` |
  | `maxTurns` | 최대 턴 수 | `10`, `25` |
  | `isolation` | 격리 모드 | `worktree` |

### Skills 추가
- `skills/` 폴더에 새 폴더 및 `SKILL.md` 파일 추가
- 프론트매터 필수:
  ```yaml
  ---
  name: skill-name
  description: 설명과 트리거 조건
  user-invocable: false  # 선택 (기본 true, 자동 호출용은 false)
  ---
  ```

### Hooks 추가
- 모든 훅은 `.mjs`(Node)로 작성하고 **stdin의 JSON**을 읽는다 — bash/jq에 의존하지 않는다 (크로스플랫폼).
- 파싱 실패 시 차단 금지: `try/catch` → `exit 0`.
- 차단은 `exit 2`(+stderr)만 유효. Write/Edit 차단은 JSON `permissionDecision:"deny"`(exit 0)를 쓴다.
- Stop 훅은 `stop_hook_active`를 먼저 확인(무한 루프 방지).
- `hooks/settings.global.json`의 `hooks` 블록에 등록. 명령어에 사용자 입력을 직접 삽입하지 않는다(Command Injection 방지).
- 반드시 매번 일어나야 하는 것만 훅으로. 가끔 필요한 절차는 스킬로.
- 상세 가이드: `hooks/README.md`.

## 커밋 메시지

```
<type>: <subject>

예:
feat: add new security-reviewer agent
fix: correct coding-style rule example
docs: update README installation guide
```

## 코드 스타일

- 한국어 우선 (영문 병기 가능)
- Markdown 린트 준수
- 예시 코드는 실행 가능하게

### 보안 주의사항
- 커뮤니티 스킬/플러그인 설치 전 코드 리뷰 필수
- MCP 서버는 신뢰된 소스만 사용
- 시크릿/크리덴셜이 포함된 파일을 커밋하지 않도록 주의

## 질문이 있으시면

이슈를 등록해 주세요!
