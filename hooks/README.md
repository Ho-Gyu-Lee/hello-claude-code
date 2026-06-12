# Hooks — 결정적 피드백 / 안전 게이트

산문 규칙(CLAUDE.md, rules)은 advisory다. 모델이 따르기로 "선택"해야 적용되고 컨텍스트가 차면 희석된다. hooks는 결정적이라 **반드시 매번 일어나야 하는 것**을 강제한다. 이 디렉토리는 그 강제 레이어다.

세션 연속성·메모리는 훅으로 하지 않는다 — Claude Code 네이티브 메모리(CLAUDE.md 상시 로드, `/memory`·`#`, 자동 압축)를 쓴다. 그래서 여기엔 메모리/핸드오프 훅이 없다.

## 설계 원칙 (왜 Node인가)

- 모든 훅은 `.mjs`(Node)로 작성하고 **stdin의 JSON**을 읽는다. bash/jq에 의존하지 않는다.
- Node는 Claude Code와 함께 항상 설치되어 **macOS / Linux / Windows에서 동일하게** 동작한다.
- 환경변수 입력(`$CLAUDE_TOOL_INPUT*`)은 신뢰하지 않는다(빈 값 보고 이슈). 진실의 원천은 stdin JSON이다.
- 파싱 실패 시 절대 차단하지 않는다(`try/catch` → `exit 0`).

## 게이트 목록

| 파일 | 이벤트 | 역할 | 차단 방식 |
|------|--------|------|-----------|
| `guard-bash.mjs` | PreToolUse(Bash) | rm -rf, push --force, DROP/TRUNCATE, fork bomb, `curl\|sh` 등 차단 | `exit 2` + stderr (Bash에 확실) |
| `guard-files.mjs` | PreToolUse(Edit\|Write\|MultiEdit) | `.env`·credentials·`.pem`·`.ssh` 등 시크릿 파일 쓰기 차단 | JSON `permissionDecision:"deny"` (Write/Edit는 exit 2가 불안정) |
| `post-format.mjs` | PostToolUse(Edit\|Write\|MultiEdit) | 프로젝트 타입 감지 후 해당 포맷터 실행 | 무음(성공) / 알림(실패) / 차단 안 함 |

## 동작 원칙 — 조용히 건너뛰지 않는다

`post-format.mjs`는 실패를 삼키지 않는다:

- 포맷이 **가능한 상황**(해당 언어의 프로젝트 마커 존재)인데 포맷터가 없거나 실패하면 → 가능한 대안을 **모두 시도**한 뒤, 그래도 안 되면 `systemMessage`로 사용자에게 알린다(무엇을 설치하면 되는지 포함). 매 편집 도배를 막으려고 확장자별 **시간당 1회**로 조절한다.
- 포맷 **대상이 아니면**(마커 없음 / 대상 외 확장자) 조용히 통과한다 — 이건 "포기"가 아니라 할 일이 없는 것이다.
- 어떤 경우에도 편집을 **차단하지 않는다**(`exit 0`). 포맷터 부재로 작업을 막지는 않되, 모르고 지나가게 두지도 않는다.

## 언어별 포맷터

| 확장자 | 포맷터 | 설치 |
|--------|--------|------|
| .js/.ts/.jsx/.tsx/.json/.css/.md | prettier (+eslint --fix), local→global 폴백 | `npm i -D prettier` |
| .rs | rustfmt | `rustup component add rustfmt` |
| .go | gofmt | Go 기본 |
| .py (pyproject/ruff 설정 있을 때) | ruff format | `pip install ruff` |
| .c/.cpp/.h… (`.clang-format` 있을 때) | clang-format | LLVM |
| .cs | 기본 `dotnet format --include <file>`, env로 CSharpier 전환 | dotnet SDK / `dotnet tool install -g csharpier` |

각 언어는 1차 도구 실패 시 합리적 폴백을 시도한다(JS는 local prettier→global prettier, C#은 두 포맷터 상호 폴백). 그래도 실패하면 위 "동작 원칙"대로 알린다.

### C# 포맷터 선택 (`CLAUDE_CS_FORMATTER`)

- 미설정 또는 `dotnet`(기본): `dotnet format`을 편집 파일만 `--include`로 스코프 실행. 정확하지만 MSBuild를 로드해 느리다.
- `csharpier`: per-file로 빠른 CSharpier. `dotnet tool install -g csharpier` 필요.

기본은 `dotnet format`. 느리다고 판단되면 `~/.claude/settings.json`의 `env`에 한 줄로 전환한다:
```json
{ "env": { "CLAUDE_CS_FORMATTER": "csharpier" } }
```

## 배선

1. 레포 루트의 `deploy.sh`(macOS/Linux) 또는 `deploy.ps1`(Windows) 실행 — `*.mjs` 복사와 `settings.global.json`(hooks + permissions) 병합까지 자동이다. 병합은 `scripts/merge-settings.mjs`가 수행: 키 단위 유니온 머지, 기존 항목 보존, `.bak` 백업, 깨진 타겟이면 중단.
2. Claude Code에서 `/hooks`로 등록 확인.

수동으로 하려면 `settings.global.json`의 `hooks`/`permissions` 블록을 `~/.claude/settings.json`의 같은 키에 병합한다(파일 통째 교체 아님). `permissions` 블록은 읽기 전용 도구 자동 승인이다 — 항목별 근거는 파일 내 `_comment_permissions` 참조.

## 크로스플랫폼 실행

- Claude Code는 shell-form command 훅을 macOS/Linux에서 `sh -c`, **Windows에서 Git Bash**로 실행한다. 명령 토큰이 `node` 하나뿐이라 셸 종류와 무관하게 동작하고, `~`도 셸이 확장한다.
- 어느 OS든 `node`가 PATH에 있어야 한다(Claude Code 설치 시 함께 제공). Windows는 Git for Windows 권장.
- `.mjs`는 `node`로 호출하므로 실행 권한(`chmod +x`)이 필요 없다.

## 함정 (반드시 기억)

- 차단은 **exit 2**만 한다. exit 1/기타는 비차단 에러로 무시된다.
- exit 2는 stdout을 버린다 — exit 2일 때는 **stderr**로만 메시지를 준다. JSON과 exit 2를 동시에 쓰지 않는다.
- Write/Edit 차단은 exit 2가 불안정 → JSON `permissionDecision:"deny"`(exit 0)를 쓴다.
- 비차단 알림은 `systemMessage`(사용자 표시) 또는 `additionalContext`(Claude에 전달)를 exit 0과 함께 쓴다.
- matcher는 PascalCase·대소문자 구분: `Bash`, `Edit|Write`.
- Stop 게이트를 추가한다면 `stop_hook_active`를 먼저 확인해 무한 루프를 막는다.

## 프로젝트별 게이트 추가 예

언어/도구별 검증(테스트 게이트 등)은 글로벌에 두지 말고 해당 프로젝트의 `.claude/settings.json`에 둔다. 예: 완료 전 테스트 강제(Stop 게이트)는 그 프로젝트에서만 의미가 있다.
