# Hello Claude Config

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**게임 서버 개발자를 위한 Claude Code 설정**

C/C++, Go, Rust, C#, Python 개발 환경에 최적화된 설정입니다.

---

## 핵심 철학

1. **헛소리 방지**: 확실한 정보만 답변, 추측은 명시
2. **컨텍스트 고정**: 원래 질문에 집중, 주제 이탈 방지
3. **자동화**: 코드 변경 후 자동 lint → build → test
4. **간결함**: Over-engineering 금지, 최소 변경

---

## 지원 언어 및 빌드 시스템

| 언어 | 빌드 시스템 | 감지 파일 |
|------|-------------|-----------|
| C/C++ | Make, CMake | `Makefile`, `CMakeLists.txt` |
| Go | go modules | `go.mod` |
| Rust | Cargo | `Cargo.toml` |
| C# | .NET | `*.csproj`, `*.sln` |
| Python | pytest | `pyproject.toml`, `setup.py` |

---

## 구조

```
hello-claude-config/
├── rules/                # 핵심 규칙 (10개)
│   ├── 00-anti-hallucination.md   # 헛소리 방지
│   ├── 05-security.md             # 보안
│   ├── 06-coding-style.md         # 언어별 코딩 스타일
│   ├── 09-performance.md          # 성능 (게임 서버 특화)
│   └── ...
│
├── agents/               # 서브에이전트 (6개)
│   ├── planner.md        # 구현 계획
│   ├── code-reviewer.md  # 코드 리뷰
│   ├── security-reviewer.md
│   └── ...
│
├── skills/               # 워크플로우
│   └── code-workflow/
│       └── quality-checklist.md   # 언어별 코드 품질 예시
│
├── commands/             # 슬래시 명령어 (3개)
│   ├── /plan
│   ├── /review
│   └── /tdd
│
└── hooks/                # 자동 트리거
    └── build-test/       # 빌드 시스템 자동 감지
```

---

## 설치

### 수동 설치

```bash
# 레포지토리 클론
git clone https://github.com/[your-username]/hello-claude-config.git

# 필요한 파일만 복사
cp hello-claude-config/rules/*.md ~/.claude/rules/
cp hello-claude-config/agents/*.md ~/.claude/agents/
```

---

## 주요 기능

### 1. 자동 빌드/테스트

코드 편집 후 자동 실행:

```
Edit/Write → 프로젝트 타입 감지 → lint → build → test
```

**감지 순서**: Cargo → Go → CMake → Make → .NET → Python

### 2. 언어별 코딩 스타일

각 언어의 표준 컨벤션을 자동 적용:

| 언어 | 함수 | 변수 | 상수 |
|------|------|------|------|
| C/C++ | `snake_case` / `PascalCase` | `snake_case` | `SCREAMING_SNAKE` |
| Go | `PascalCase` (exported) | `camelCase` | `PascalCase` |
| Rust | `snake_case` | `snake_case` | `SCREAMING_SNAKE` |
| C# | `PascalCase` | `camelCase` | `PascalCase` |
| Python | `snake_case` | `snake_case` | `SCREAMING_SNAKE` |

### 3. 성능 규칙 (게임 서버 특화)

- 메모리 할당 최소화 (풀링, 프리얼로케이션)
- Lock-free 구조 선호
- N+1 쿼리 방지
- 프로파일링 도구 안내

### 4. 슬래시 명령어

| 명령어 | 설명 |
|--------|------|
| `/plan [기능]` | 구현 계획 수립 |
| `/review [파일]` | 코드 리뷰 |
| `/tdd [기능]` | TDD 시작 |

---

## 커스터마이징

### 빌드 명령어

`hooks/build-test/config.json` 수정:

```json
{
  "commands": {
    "lint": {
      "cargo": ["clippy"],
      "go": ["vet ./..."],
      "makefile": ["lint"]
    }
  }
}
```

### 규칙 추가/수정

`rules/` 폴더에서 직접 수정하세요.

---

## 라이선스

MIT License
