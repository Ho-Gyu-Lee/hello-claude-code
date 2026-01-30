---
name: setup-serena-mcp
description: Serena MCP 초기 설정 및 재설정 가이드
---

# Serena MCP 설정

Serena MCP를 Claude Code에 연결하는 설정 가이드입니다.

## 사용 시점

```
/setup-serena-mcp          # 초기 설정 안내
/setup-serena-mcp reset    # 재설정 (기존 설정 제거 후 재설정)
```

---

## 1. 사전 요구사항

### uv 설치 확인

```bash
# uv 설치 여부 확인
uv --version

# 미설치 시 설치
curl -LsSf https://astral.sh/uv/install.sh | sh
```

---

## 2. 초기 설정

### 2.1 빠른 설정 (한 줄)

```bash
# 프로젝트 수준 (권장)
claude mcp add serena -s project -- uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context claude-code

# 전역 수준
claude mcp add serena -s user -- uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context claude-code
```

### 2.2 JSON 형식 설정 (더 짧음)

```bash
# 프로젝트 수준
claude mcp add-json serena '{"command":"uvx","args":["--from","git+https://github.com/oraios/serena","serena","start-mcp-server","--context","claude-code"]}' -s project

# 전역 수준
claude mcp add-json serena '{"command":"uvx","args":["--from","git+https://github.com/oraios/serena","serena","start-mcp-server","--context","claude-code"]}' -s user
```

### 2.3 설정 확인

```bash
# MCP 서버 목록 확인
claude mcp list

# 예상 출력: serena · ✔ connected
```

---

## 3. 설정 파일 구조

### Claude Code 설정

| 범위 | 파일 위치 |
|------|----------|
| 프로젝트 | `.mcp.json` (프로젝트 루트) |
| 전역 | `~/.claude/settings.json` |

### Serena 설정

| 범위 | 파일 위치 |
|------|----------|
| 전역 | `~/.serena/serena_config.yml` |
| 프로젝트 | `<project>/.serena/project.yml` |

---

## 4. 재설정 (Reset)

### 4.1 기존 설정 제거

```bash
# MCP 서버 제거
claude mcp remove serena

# Serena 캐시/설정 제거 (선택)
rm -rf ~/.serena
rm -rf .serena
```

### 4.2 다시 설정

위 "2. 초기 설정" 단계 반복

---

## 5. Language Server 설정

Serena는 LSP(Language Server Protocol) 기반으로 30개 이상 언어를 지원합니다.

### 5.1 지원 수준

| 지원 수준 | 언어 | 설명 |
|----------|------|------|
| **직접 지원** | Python, TypeScript, JavaScript, Go, Rust, C/C++, Java, PHP | 자동 설치 |
| **간접 지원** | C#, Ruby, Kotlin, Dart | 수동 설치 필요 |

### 5.2 프로젝트 언어 설정

프로젝트별 `.serena/project.yml` 파일 생성:

```yaml
# .serena/project.yml

# 프로젝트 언어 설정
# 옵션: python, typescript, javascript, csharp, go, rust, java, cpp, ruby
language: csharp

# 프로젝트 경로 (선택)
projects:
  - path: .
    language: csharp
```

### 5.3 C# Language Server 설정

C#은 Microsoft Roslyn 기반 Language Server 사용:

```yaml
# ~/.serena/serena_config.yml

language_servers:
  - language: csharp
    # csharp-ls 또는 OmniSharp 경로
    command: ["csharp-ls"]
    # 또는 OmniSharp 사용 시
    # command: ["dotnet", "/path/to/OmniSharp.dll", "-lsp"]

# C# 런타임 의존성 설정 (선택)
ls_specific_settings:
  csharp:
    runtime_dependencies:
      - dotnet
```

**C# Language Server 설치:**

```bash
# csharp-ls 설치 (권장)
dotnet tool install --global csharp-ls

# 또는 OmniSharp 다운로드
# https://github.com/OmniSharp/omnisharp-roslyn/releases
```

### 5.4 TypeScript/JavaScript 설정

```yaml
# .serena/project.yml
# TypeScript VTS 사용 시
language: typescript_vts
```

### 5.5 커스텀 Language Server 추가

```yaml
# ~/.serena/serena_config.yml

language_servers:
  - language: R
    command: ["R", "--slave", "-e", "languageserver::run()"]

  - language: kotlin
    command: ["kotlin-language-server"]
```

### 5.6 Language Server 문제 해결

```bash
# Language Server 로그 확인
cat ~/.serena/mcp.log | grep -i "LSP"
cat ~/.serena/mcp-server-*.log

# 특정 Language Server 수동 테스트
csharp-ls --version
dotnet --list-sdks
```

**C# 타임아웃 에러 해결:**

```yaml
# ~/.serena/serena_config.yml
ls_specific_settings:
  csharp:
    # 타임아웃 증가 (밀리초)
    timeout: 60000
    # 프로젝트 로드 제외 패턴
    exclude_patterns:
      - "**/bin/**"
      - "**/obj/**"
```

---

## 6. 트러블슈팅

### uvx 명령어를 찾을 수 없음

```bash
# uvx 전체 경로 확인 후 사용
which uvx  # 예: /home/user/.local/bin/uvx

# 전체 경로로 설정
claude mcp add serena -s project -- $(which uvx) --from git+https://github.com/oraios/serena serena start-mcp-server --context claude-code
```

### 연결 실패 시

```bash
# 수동 테스트
uvx --from git+https://github.com/oraios/serena serena start-mcp-server --help

# 로그 확인
cat ~/.serena/mcp.log
```

### read_only 모드 설정

안전을 위해 읽기 전용 모드 활성화:

```yaml
# ~/.serena/serena_config.yml
read_only: true
```

---

## 7. 핵심 플래그 설명

| 플래그 | 설명 |
|--------|------|
| `--context claude-code` | Claude Code 최적화 (중복 도구 비활성화) |
| `-s project` | 프로젝트 수준 설정 |
| `-s user` | 전역 설정 |

---

## 8. 설정 완료 후

설정이 완료되면 Serena MCP 도구를 사용할 수 있습니다.
사용법은 `/serena-mcp` 스킬을 참고하세요.

```bash
# 연결 확인
claude mcp list
# 출력: serena · ✔ connected
```

---

## 참고 자료

- [Serena GitHub](https://github.com/oraios/serena)
- [Serena 문서](https://oraios.github.io/serena/)
- [Claude Code MCP 문서](https://code.claude.com/docs/en/mcp)
