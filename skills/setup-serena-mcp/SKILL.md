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

### 2.1 프로젝트 수준 설정 (권장)

현재 프로젝트에만 Serena MCP 활성화:

```bash
# 프로젝트 디렉토리에서 실행
claude mcp add serena -s project -- \
  uvx --from git+https://github.com/oraios/serena \
  serena start-mcp-server \
  --context claude-code \
  --project $(pwd)
```

### 2.2 전역 설정

모든 프로젝트에서 Serena MCP 사용:

```bash
claude mcp add serena -s user -- \
  uvx --from git+https://github.com/oraios/serena \
  serena start-mcp-server \
  --context claude-code
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

## 5. 트러블슈팅

### uvx 명령어를 찾을 수 없음

```bash
# uvx 전체 경로 확인
which uvx

# 전체 경로로 설정 (예시)
claude mcp add serena -s project -- \
  /home/user/.local/bin/uvx \
  --from git+https://github.com/oraios/serena \
  serena start-mcp-server \
  --context claude-code \
  --project $(pwd)
```

### 연결 실패 시

```bash
# 수동 테스트
uvx --from git+https://github.com/oraios/serena \
  serena start-mcp-server --help

# 로그 확인
ls -la ~/.serena/*.log
cat ~/.serena/mcp.log
```

### read_only 모드 설정

안전을 위해 읽기 전용 모드 활성화:

```yaml
# ~/.serena/serena_config.yml
read_only: true
```

---

## 6. 핵심 플래그 설명

| 플래그 | 설명 |
|--------|------|
| `--context claude-code` | Claude Code 전용 최적화 (중복 도구 비활성화) |
| `--project $(pwd)` | 현재 디렉토리를 프로젝트 루트로 지정 |
| `-s project` | 프로젝트 수준 설정 |
| `-s user` | 전역 (사용자) 수준 설정 |

---

## 7. 설정 완료 후

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
