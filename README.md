# Hello Claude Config

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**개인 맞춤형 Claude Code 설정 컬렉션**

헛소리 방지, 컨텍스트 고정, 자동 빌드/테스트 등 실전에서 검증된 설정들을 모았습니다.

---

## 핵심 철학

1. **헛소리 방지**: 확실한 정보만 답변, 추측은 명시
2. **컨텍스트 고정**: 원래 질문에 집중, 주제 이탈 방지
3. **자동화**: 코드 변경 후 자동 lint → build → test
4. **간결함**: 필요한 정보만, 과잉 설명 금지

---

## 구조

```
hello-claude-config/
├── rules/                # 항상 적용되는 규칙
│   ├── 00-anti-hallucination.md   # 헛소리 방지
│   ├── 01-mandatory-checklist.md  # 필수 체크리스트
│   ├── 02-context-anchoring.md    # 컨텍스트 고정
│   └── ...
│
├── agents/               # 위임용 서브에이전트
│   ├── planner.md        # 구현 계획
│   ├── code-reviewer.md  # 코드 리뷰
│   └── ...
│
├── skills/               # 워크플로우/도메인 지식
│   ├── tool-usage/       # 도구 사용 가이드
│   └── code-workflow/    # 코드 작업 프로토콜
│
├── commands/             # 슬래시 명령어
│   ├── /plan             # 구현 계획
│   ├── /review           # 코드 리뷰
│   └── /tdd              # TDD 시작
│
├── hooks/                # 자동 트리거
│   └── build-test/       # 코드 편집 후 자동 빌드/테스트
│
└── templates/            # 응답 템플릿
```

---

## 설치

### 옵션 1: 플러그인으로 설치 (권장)

```bash
# 마켓플레이스 추가
/plugin marketplace add [your-github-username]/hello-claude-config

# 플러그인 설치
/plugin install hello-claude-config@hello-claude-config
```

### 옵션 2: 수동 설치

```bash
# 레포지토리 클론
git clone https://github.com/[your-username]/hello-claude-config.git

# rules 복사
cp hello-claude-config/rules/*.md ~/.claude/rules/

# agents 복사
cp hello-claude-config/agents/*.md ~/.claude/agents/

# commands 복사
cp hello-claude-config/commands/*.md ~/.claude/commands/
```

### Hooks 설정

`hooks/hooks.json` 내용을 `~/.claude/settings.json`에 추가:

```json
{
  "hooks": [
    // hooks/hooks.json 내용 복사
  ]
}
```

---

## 주요 기능

### 1. 헛소리 방지 (Anti-Hallucination)

```
✅ 확실한 정보만 답변
✅ 모르면 "정보 없음" / "확인 불가" 명시
✅ 추측 시 "추측:" 선언

❌ 애매한 부분 그럴싸하게 채우기 금지
❌ 근거 없는 단정 금지
```

### 2. 컨텍스트 고정 (Context Anchoring)

```
모든 응답 전:
1. 원래 요청 핵심 확인
2. 기대 결과물 형태 확인
3. 이전 확정 사항 확인

→ 주제 이탈 방지
```

### 3. 자동 빌드/테스트 (Build-Test Hook)

코드 편집 후 자동 실행:
```
Edit/Write → lint → build → test
```

지원 빌드 시스템:
- Makefile
- Taskfile
- npm/pnpm/yarn/bun

### 4. 슬래시 명령어

| 명령어 | 설명 |
|--------|------|
| `/plan` | 구현 계획 수립 |
| `/review` | 코드 리뷰 |
| `/tdd` | TDD 시작 |

---

## 커스터마이징

### 빌드 명령어 설정

`hooks/build-test/config.json` 수정:

```json
{
  "commands": {
    "lint": ["lint", "eslint", "check"],
    "build": ["build", "compile"],
    "test": ["test", "spec"]
  }
}
```

### 규칙 추가/수정

`rules/` 폴더에 새 `.md` 파일 추가 또는 기존 파일 수정

### 에이전트 추가

`agents/` 폴더에 새 에이전트 정의:

```markdown
---
name: my-agent
description: 에이전트 설명
tools: Read, Grep, Glob
---

# 에이전트 내용
```

---

## 주의사항

### 컨텍스트 윈도우 관리

MCP를 너무 많이 활성화하면 컨텍스트 윈도우가 줄어듭니다.

권장:
- 설정된 MCP: 20-30개
- 프로젝트당 활성화: 10개 이하
- 활성 도구: 80개 이하

### 금지 표현

응답에서 피해야 할 표현:
- "추가로" (맥락 없이)
- "참고로" (느슨한 연관)
- "나중에 도움될"

### 허용 표현

가치 있는 확장 시:
- "⚠️ 고려사항:"
- "전제조건:"
- "잠재적 이슈:"

---

## 기여

기여를 환영합니다!

- 유용한 규칙/에이전트 추가
- 버그 수정
- 문서 개선

[CONTRIBUTING.md](CONTRIBUTING.md) 참고

---

## 라이선스

MIT License
