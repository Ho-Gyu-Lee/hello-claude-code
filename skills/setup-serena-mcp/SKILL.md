---
name: setup-serena-mcp
description: Serena MCP 초기 설정 및 재설정
---

# Serena MCP 설정

## 1. 사전 요구사항

```bash
# uv 설치 확인
uv --version

# 미설치 시
curl -LsSf https://astral.sh/uv/install.sh | sh
```

---

## 2. 설정

```bash
claude mcp add serena -s user -- uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context claude-code
```

### 확인

```bash
claude mcp list
# 출력: serena · ✔ connected
```

---

## 3. 재설정

```bash
# 제거
claude mcp remove serena

# 다시 설정
claude mcp add serena -s user -- uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context claude-code
```

---

## 참고

- [Serena GitHub](https://github.com/oraios/serena)
