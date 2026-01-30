---
name: setup-serena-mcp
description: Serena MCP 프로젝트 활성화 및 온보딩
---

# Serena MCP 프로젝트 설정

Serena MCP가 현재 프로젝트를 인식하도록 설정합니다.

## 1. 프로젝트 활성화

```
serena.activate_project("/path/to/project")
```

현재 프로젝트 디렉토리를 Serena에 등록합니다.
`.serena/project.yml` 파일이 자동 생성됩니다.

---

## 2. 온보딩 확인

```
serena.check_onboarding_performed()
```

온보딩이 완료되었는지 확인합니다.

---

## 3. 온보딩 실행

```
serena.onboarding()
```

프로젝트 구조, 코딩 표준, 개발 명령어 등을 분석하여
`.serena/memories/` 에 메모리 파일로 저장합니다.

---

## 4. 재설정

```bash
# 메모리 초기화 (프로젝트 디렉토리에서)
rm -rf .serena/memories/

# 온보딩 다시 실행
serena.onboarding()
```

---

## 생성되는 파일

| 경로 | 설명 |
|------|------|
| `.serena/project.yml` | 프로젝트 설정 |
| `.serena/memories/` | 프로젝트 메모리 (온보딩 결과) |
