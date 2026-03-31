---
name: sequential-thinking
description: Sequential Thinking MCP 활용 가이드. 복잡한 아키텍처 결정, 3개 이상 옵션 비교, 다중 트레이드오프 분석, "모놀리스 vs MSA", "어떤 방식이 나을까" 등 깊은 분석이 필요한 질문 시 자동 활성화.
user-invocable: false
---

# Sequential Thinking MCP 사용 가이드

복잡한 문제를 단계별로 분석할 때 사용하는 도구입니다.
**Sequential Thinking MCP 연결 시에만 적용.** 미연결 시 일반 추론으로 대체.

## 사용 시점

- 복잡한 아키텍처 결정
- 3개 이상 옵션 비교
- 다중 트레이드오프 분석
- 여러 단계의 논리적 추론 필요

## 제외 (토큰 비용 높으므로 신중히)

- 코드 작성/수정 작업
- 단순 사실 확인
- 2개 이하 옵션 비교
- 명확한 정답이 있는 경우

## 미연결 시 폴백

Sequential Thinking MCP가 없을 때는 다음으로 대체:
1. 구조화된 마크다운으로 단계별 분석
2. 옵션별 장단점 테이블 정리
3. 명시적 결론 및 근거 제시
