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

### Rules 추가
- `rules/` 폴더에 `.md` 파일 추가
- 파일명 형식: `XX-rule-name.md` (XX = 번호)
- 명확한 원칙과 예시 포함

### Agents 추가
- `agents/` 폴더에 `.md` 파일 추가
- 프론트매터 필수:
  ```yaml
  ---
  name: agent-name
  description: 설명
  tools: Read, Grep, Glob
  ---
  ```

### Commands 추가
- `commands/` 폴더에 `.md` 파일 추가
- 사용법, 옵션, 예시 포함

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

## 질문이 있으시면

이슈를 등록해 주세요!
