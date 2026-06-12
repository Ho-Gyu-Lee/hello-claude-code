---
name: web-search
description: 웹 검색 가이드. "검색해줘", "찾아봐", "최신 정보", "공식 문서 확인", 버전/날짜/수치 확인이 필요한 질문 시 자동 활성화. 검색 결과 검증 프로토콜 제공.
user-invocable: false
---

# 웹 검색 가이드

## 0단계: 도구 로드 (필수 선행)

MCP 검색 도구는 deferred 상태다 — 호출 전에 ToolSearch로 스키마를 로드한다:

```
ToolSearch("select:mcp__brave-search__brave_web_search")
ToolSearch("+brave search")   # 뉴스/로컬 등 다른 도구 탐색 시
```

## Path A — brave-search MCP 연결 시

`brave_web_search`(일반), `brave_news_search`(뉴스/최신), `brave_local_search`(지역), `brave_summarizer`(요약). freshness 필터는 아래 표.

## Path B — 미연결 시 폴백

ToolSearch 결과가 비어 있으면 내장 WebSearch/WebFetch로 폴백하고 한 문장 고지한다 (freshness 필터 등 일부 기능 제한).

## 검색 전

1. 핵심 키워드 3개 이내로 정리
2. "이 검색으로 무엇을 확인하려는가?" 명확히

## 검색 후 검증 (결과 사용 전 필수)

```
[ ] 관련성: 원래 질문과 직접 연관되는가?
[ ] 시의성: 정보 날짜가 맥락에 적합한가?
[ ] 신뢰성: 공식 문서/1차 출처인가?
[ ] 일관성: 기존 컨텍스트와 충돌하지 않는가?

2개 이상 불충족 → 해당 결과 폐기
```

## 결과 우선순위

1. 공식 문서/릴리즈 노트 (최우선)
2. 공식 블로그/GitHub
3. 신뢰 커뮤니티 (StackOverflow 고득표)
4. 일반 블로그/뉴스 (보조만)

## freshness 필터

| 값 | 의미 |
|----|------|
| pd | 24시간 이내 |
| pw | 7일 이내 |
| pm | 31일 이내 |
| py | 365일 이내 |
