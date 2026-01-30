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

`.serena/project.yml` 파일이 자동 생성됩니다.

---

## 2. 온보딩 실행

```
serena.check_onboarding_performed()  # 온보딩 여부 확인
serena.onboarding()                   # 온보딩 실행
```

프로젝트 구조, 코딩 표준, 빌드/테스트 명령어 등을 분석하여
`.serena/memories/` 에 메모리 파일로 저장합니다.

---

## 3. 메모리 검토 (권장)

온보딩 후 메모리를 검토하고 필요시 수정합니다.

```
serena.list_memories()       # 메모리 목록 확인
serena.read_memory("name")   # 특정 메모리 읽기
```

메모리 파일은 `.serena/memories/` 에서 직접 편집 가능합니다.

---

## 4. 새 대화 준비

온보딩 완료 후 새 대화로 전환하는 것을 권장합니다.

```
serena.prepare_for_new_conversation()
```

---

## 5. 재설정

```bash
# 메모리 초기화
rm -rf .serena/memories/

# 온보딩 다시 실행
serena.onboarding()
```

---

## 생성되는 파일

| 경로 | 설명 |
|------|------|
| `.serena/project.yml` | 프로젝트 설정 |
| `.serena/memories/` | 프로젝트 메모리 |
