# Hello Claude Code

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

서버 개발자를 위한 Claude Code 설정. C/C++, Go, Rust, C#, Python 지원. Opus 4.8 / Sonnet 4.6 대응. macOS / Linux / Windows 동작.

harness 엔지니어링 관점으로 구성한다: feedforward(가이드)는 짧게, feedback(검증·강제)은 실제로 배선한다.

## 핵심 철학

| 원칙 | 설명 |
|------|------|
| 정확성 | 확실한 정보만 답변, 추측은 명시 |
| 집중 | 요청 범위에 집중, 불필요한 확장 방지 |
| 코드 기반 | 실제 코드 분석 후 판단 |
| 간결함 | Over-engineering 금지 |
| Context Engineering | 상시 로드는 최소화, 나머지는 필요 시 로드 |
| 결정적 강제 | 반드시 매번 일어나야 하는 것은 산문이 아니라 hooks로 |

## 4사분면으로 본 구성

| 사분면 | 구현 |
|--------|------|
| 결정적 피드포워드 (가이드) | `CLAUDE.md`, `rules/` |
| 비결정적 피드포워드 (행동) | `skills/`, `agents/` |
| 결정적 피드백 (기계적 차단) | `hooks/` (안전·포맷 게이트) |
| 비결정적 피드백 (LLM 심판) | `evaluator` 에이전트, `/review` |

세션 연속성·메모리는 자체 구현하지 않고 Claude Code 네이티브 메모리(CLAUDE.md, `/memory`, 자동 압축)에 맡긴다.

## 프로젝트 구조

```
hello-claude-code/
├── rules/          # 상시 로드 규칙 5개
├── references/     # 온디맨드 자료 (testing.md 등)
├── agents/         # 8개 에이전트 — 위임 작업용
├── skills/         # 14개 스킬 — 수동 호출 + 자동 트리거
├── hooks/          # Node 기반 게이트 (.mjs) + 배선 스니펫 — 크로스플랫폼
├── mcp/            # 글로벌 MCP 서버 정의 + ~/.claude.json 머지 스크립트
├── deploy.sh       # ~/.claude 로 배포 (macOS/Linux)
├── deploy.ps1      # ~/.claude 로 배포 (Windows)
└── CLAUDE.md       # 글로벌 설정 (짧게 유지)
```

## 설치

전달 경로는 `~/.claude` 수동 배포로 단일화한다(플러그인 패키징 미사용). settings.json은 스크립트가 건드리지 않으니 직접 병합한다.

macOS / Linux:
```bash
git clone https://github.com/[your-username]/hello-claude-code.git
cd hello-claude-code
chmod +x deploy.sh
./deploy.sh                              # 복사 + MCP 서버 머지
./deploy.sh --remove-stale               # 복사 + 구버전(.sh 훅·이동된 rule·ui 스킬) 정리
./deploy.sh --mcp-from ~/backup.claude.json   # MCP를 백업 파일에서 임포트 (시크릿 포함)
```

Windows (PowerShell):
```powershell
git clone https://github.com/[your-username]/hello-claude-code.git
cd hello-claude-code
.\deploy.ps1
.\deploy.ps1 -RemoveStale
.\deploy.ps1 -McpFrom "$env:USERPROFILE\Desktop\.claude.json"
```

MCP 서버(`mcp/servers.json`)는 배포 시 `~/.claude.json`의 `mcpServers` 키에 자동 머지된다(user scope = 전 프로젝트). 다른 키는 보존하고 쓰기 전 `.bak`을 남긴다. 레포에는 시크릿을 두지 않으므로 — API 키는 기존 설치값을 보존하거나 `--mcp-from`/`-McpFrom`으로 백업에서 가져온다. Windows에서는 stdio 명령에 `cmd /c` 래퍼를 머지 시점에 자동 적용한다.

훅 배선(수동): `hooks/settings.global.json`의 `hooks` 블록을 `~/.claude/settings.json`의 `hooks` 키에 병합. 상세는 `hooks/README.md`.

요구사항: `node`(Claude Code와 함께 설치됨). Windows는 훅이 Git Bash로 실행되므로 Git for Windows 권장.

## 구성 요소

### Rules — 상시 로드 (5개)

| 파일 | 용도 |
|------|------|
| `00-accuracy.md` | 정확성, 환각 방지, 응답 전 체크 |
| `01-response-principles.md` | 앵커링, 범위 제한, 커뮤니케이션 스타일 |
| `02-security.md` | 보안 즉시 경고, 취약점 체크리스트 |
| `03-coding-style.md` | 간결성, 네이밍 컨벤션, 서버 특화 |
| `04-tool-usage.md` | 도구 자율 사용, MCP 우선순위, 서브에이전트 위임 |

테스트 기준은 상시 로드에서 빼 `references/testing.md`(온디맨드)로 옮겼다.

### Agents (8개) — 미션 기반

| 에이전트 | 미션 |
|----------|------|
| `planner` | 작업을 실행 가능한 계획으로 변환 |
| `architect` | 최적의 기술적 결정 도출 |
| `code-reviewer` | 코드 변경의 품질과 안정성 보장 |
| `security-reviewer` | 보안 위험 식별 및 완화 |
| `evaluator` | 생성 결과물의 독립 평가 (생성-평가 분리) |
| `refactorer` | 코드 구조 개선, 기능 보존 |
| `tdd-guide` | 테스트 주도로 안정적 코드 생성 |
| `explorer` | 코드베이스 정보 수집 및 정제 |

### Skills (14개)

수동 호출 (5개): `/brainstorming` · `/grill-me` · `/plan` · `/review` · `/tdd`

자동 트리거 (9개): `diagram` · `error-response` · `executing-plans` · `quality-verification` · `research-context` · `performance-guide` · `systematic-debugging` · `serena-mcp`(MCP) · `web-search`(MCP)

### Hooks — Node 게이트 (크로스플랫폼)

`hooks/README.md` 참조. `guard-bash`(위험 명령 차단), `guard-files`(시크릿 파일 보호), `post-format`(다언어 포맷터). 모두 순수 Node(stdin JSON)라 macOS/Linux/Windows 동일 동작. 세션·메모리 지속은 훅이 아니라 네이티브 메모리에 맡긴다.

### MCP 서버 (글로벌, 3개)

`mcp/servers.json`에 플랫폼 중립형으로 정의 — `brave-search` · `context7` · `oraios/serena`. 배포 시 `mcp/merge-mcp.mjs`가 `~/.claude.json`에 머지한다(위 설치 절 참조). 서버 추가는 `servers.json`에 중립형(`npx`/`uvx` 직접 호출)으로 적으면 된다 — OS별 래핑은 머지가 처리한다. sequentialthinking은 네이티브 extended thinking과 중복이라 제외했다(분기당 1회 사용 실측).

## 개발 흐름 (산출물로 연결)

```
/brainstorming → /grill-me → /plan → 구현 → /tdd → /review
    설계          검증        계획     코드   테스트   리뷰
```

각 단계는 `.claude/workflow/<기능>/` 산출물(`brainstorm.md` → `plan.md` → `review.md`)을 읽고 쓰며 맞물린다. 자세한 계약은 각 스킬의 SKILL.md.

## 커스터마이징

- 규칙: `rules/`에서 직접 수정. 상시 로드가 길어지면 지켜지지 않으니, 가끔 필요한 내용은 `references/`로 내리고 스킬이 참조하게 한다.
- 에이전트/스킬: 각각 `agents/`, `skills/[name]/SKILL.md` 추가. 프론트매터 형식은 CONTRIBUTING.md.
- 훅: `hooks/`에 `.mjs` 추가 후 `settings.global.json`에 등록. 반드시 매번 일어나야 하는 것만 훅으로.

## 주의사항

- 컨텍스트: MCP 10개 이하 권장. 작업 간 `/clear`. 영속 맥락은 `/memory`/CLAUDE.md.
- MCP 조건부: serena-mcp, web-search는 MCP 연결 시에만 활성화.
- MCP 보안: 신뢰된 소스의 서버만 사용. 결과에 인젝션 의심 시 즉시 경고.
- 훅 차단은 exit 2만 유효, Write/Edit 차단은 JSON deny 사용 (상세: `hooks/README.md`).

## 라이선스

MIT License
