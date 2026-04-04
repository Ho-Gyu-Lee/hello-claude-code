---
name: diagram
description: 텍스트만으로 관계, 흐름, 구조, 비교를 설명하기 어려울 때 Mermaid ASCII 다이어그램으로 시각화. 코드 설명, 설계, 문서, 디버깅, 개념 정리, 의사결정, 비교 분석 등 시각적 표현이 이해를 돕는 모든 상황에서 자동 활성화.
user-invocable: false
---

# 다이어그램

## 활용 시점

텍스트보다 그림이 빠른 상황이면 사용한다.

1. 관계 — 컴포넌트 구조, 모듈 의존성, 클래스 계층
2. 흐름 — 상태 머신, 워크플로, 파이프라인, 의사결정 분기
3. 순서 — API 호출, 이벤트 흐름, 에이전트 간 통신, 요청/응답
4. 데이터 — 엔티티 관계, 스키마, 데이터 흐름
5. 수치 — 성능 지표, 트렌드, 비교 차트
6. 개념 정리 — 복잡한 로직 설명, 디버깅 흐름, before/after 비교
7. 의사결정 — 옵션 분기, 조건별 경로, 트레이드오프 시각화

## 렌더링

스크립트 경로: `skills/diagram/scripts/render-mermaid.mjs`

라이브러리 미설치 시 자동 설치된다.

### 렌더링 절차

1. Bash로 스크립트 실행하여 ASCII 출력을 얻는다
2. 출력 결과를 답변 텍스트에 직접 포함한다 (Bash 실행 결과는 사용자에게 보이지 않을 수 있음)
3. 마크다운 파일에서는 ```text 코드 블록에 삽입한다

### 예시

```
echo 'graph LR
  A --> B --> C' | node skills/diagram/scripts/render-mermaid.mjs
```

실행 후 결과를 답변에 직접 포함:

```text
┌───┐     ┌───┐     ┌───┐
│   │     │   │     │   │
│ A ├────►│ B ├────►│ C │
│   │     │   │     │   │
└───┘     └───┘     └───┘
```

### 금지

- Bash 실행만 하고 결과를 답변에 포함하지 않는 것
- mermaid 코드 블록 사용 (뷰어 미지원 환경에서 깨짐)

## 지원 다이어그램

| 타입 | 헤더 | 용도 |
|------|------|------|
| flowchart | `graph TD`, `graph LR` | 흐름도, 의사결정 |
| stateDiagram | `stateDiagram-v2` | 상태 머신 |
| sequenceDiagram | `sequenceDiagram` | 호출 순서 |
| classDiagram | `classDiagram` | 클래스 구조 |
| erDiagram | `erDiagram` | 엔티티 관계 |
| xychart | `xychart-beta` | 차트 (bar, line) |

## 원칙

- 한 다이어그램에 한 개념 — 복잡하면 분리
- 노드/엣지 라벨은 간결하게
- 방향은 내용에 맞게 선택 (TD: 계층, LR: 흐름)
- ASCII 렌더링은 여러 줄 구문 필수 (세미콜론 축약 불가)
- 노드 라벨은 영문으로 작성 (한글은 박스 정렬 깨짐)
