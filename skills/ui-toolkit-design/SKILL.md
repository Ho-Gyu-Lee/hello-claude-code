---
name: ui-toolkit-design
description: Unity UI Toolkit (UXML/USS) 디자인 가이드라인. UXML, USS, UI Toolkit, UI Builder, VisualElement, UIDocument 관련 작업 시 자동 활성화. "UI 디자인", "HUD", "버튼 스타일", Unity 프로젝트에서 UI 화면/컴포넌트 생성, 스타일 작성, 레이아웃 구성 요청 시 사용.
user-invocable: true
---

# Unity UI Toolkit 디자인 가이드라인

## 적용 범위

Unity 프로젝트에서 UI Toolkit (UXML/USS) 작업 시 적용.

**우선순위**: `Assets/UI/DESIGN.md` > 기존 프로젝트 패턴 > 이 가이드라인

UI 작업을 시작할 때 **반드시 `Assets/UI/DESIGN.md` 존재 여부를 먼저 확인**한다.
- **있으면**: DESIGN.md를 읽고 거기 정의된 색상/간격/컴포넌트/스타일을 따른다.
- **없으면**: 사용자에게 DESIGN.md 생성을 제안한다 (아래 "DESIGN.md 프로세스" 참고).

---

## 1. 파일·에셋 구조

```
Assets/UI/
├── Documents/          # 화면별 UXML 파일
├── Styles/             # USS 파일
│   ├── Common.uss      # 공통 변수, 리셋
│   ├── Layout.uss      # 레이아웃 유틸리티
│   ├── Buttons.uss     # 버튼 스타일
│   └── Typography.uss  # 텍스트 스타일
└── Components/         # 공통 재사용 컴포넌트 (UXML 템플릿)
```

### 파일 네이밍

| 유형 | 규칙 | 예시 |
|------|------|------|
| UXML | PascalCase + 역할 | `MainMenu.uxml`, `PlayerHUD.uxml` |
| USS | PascalCase + 기능 단위 | `Buttons.uss`, `Layout.uss` |
| 컴포넌트 UXML | PascalCase + 컴포넌트명 | `PlayerCard.uxml` |

### 공통 컴포넌트 원칙

**모든 컴포넌트는 `Components/`에 한 벌만 만들고, Template/Instance로 재사용한다.**

새 컴포넌트 생성 전:
1. `Components/`에서 동일·유사 컴포넌트 검색
2. 기존 컴포넌트에 modifier 클래스로 변형 가능한지 검토
3. 변형 불가능할 때만 새 컴포넌트 생성

---

## 2. 네이밍 컨벤션

### USS 클래스명: BEM (kebab-case)

```
.block__element--modifier

예:
.menu                     # 블록
.menu__item               # 요소
.menu__item--disabled     # 수정자
.player-hud__health-bar   # 복합 블록
```

### UXML name 속성

- 코드에서 `Q<>()`로 접근할 요소에만 부여
- kebab-case 사용, 패널 내에서 고유

---

## 3. UXML 작성 규칙

```xml
<ui:UXML xmlns:ui="UnityEngine.UIElements">
    <Style src="project://database/Assets/UI/Styles/Common.uss" />

    <ui:VisualElement name="root" class="screen">
        <ui:VisualElement name="header" class="screen__header">
            <ui:Label name="title-label" class="screen__title" text="Main Menu" />
        </ui:VisualElement>

        <ui:VisualElement name="content" class="screen__content">
            <ui:Button name="play-button" class="btn btn--primary" text="Play" />
        </ui:VisualElement>
    </ui:VisualElement>
</ui:UXML>
```

### 금지 사항

| 금지 | 대신 |
|------|------|
| `style="color: red;"` 인라인 스타일 | `class="text--danger"` 클래스 사용 |
| 스타일 없는 깊은 중첩 (5단계+) | 템플릿으로 분리 |
| `name` 없는 상호작용 요소 | 코드 바인딩용 고유 `name` 부여 |
| 하드코딩된 색상값/크기값 | USS 변수 사용 |

---

## 4. USS 핵심 규칙

### 비주얼 스타일 원칙

**모바일 게임 UI는 심플하고 절제된 톤을 기본으로 한다.**
**범용 AI 안티패턴은 `rules/06-ui-design.md` 참조.**

```
금지 (AI가 흔히 생성하는 패턴):
- 네온 컬러 (rgb(0, 255, 255), rgb(255, 0, 255) 등)
- 강렬한 원색 (순수 파랑, 순수 빨강)
- 보라-파랑 그라데이션
- 그라데이션 남용, 글로우/발광 효과
- 과도한 장식 (그림자 중첩, 두꺼운 테두리)
- 어두운 배경 + 네온 텍스트
- 순수 검정(rgb(0,0,0)) / 순수 흰색(rgb(255,255,255)) 배경

권장:
- 프로젝트 아트 디렉션에서 정한 색상 팔레트 사용
- 넓은 여백, 깨끗한 배경
- 강조색은 1~2가지로 제한
- 색상을 모를 때는 플레이스홀더로 두고 아트팀에 확인
```

### 색상 대비 (필수)

**텍스트는 배경 위에서 반드시 읽혀야 한다.**

```
절대 금지:
- 파란 배경 + 검정 텍스트
- 어두운 배경 + 어두운 텍스트
- 밝은 배경 + 밝은 텍스트
- 채도 높은 배경 + 채도 높은 텍스트

필수:
- 어두운 배경 -> 밝은(흰색 계열) 텍스트
- 밝은 배경 -> 어두운(검정 계열) 텍스트
- 명도 대비 4.5:1 이상 (일반), 3:1 이상 (큰 텍스트 36px+)
```

### 변수 정의 (Common.uss)

슬레이트/아이보리 기반 기본 템플릿. 프로젝트 아트 디렉션에 맞게 교체하되, 변수 구조는 유지:

```css
:root {
    /* 색상 (프로젝트에 맞게 교체) */
    --color-primary: rgb(71, 85, 105);
    --color-primary-hover: rgb(51, 65, 85);
    --color-primary-active: rgb(30, 41, 59);
    --color-secondary: rgb(100, 116, 139);
    --color-danger: rgb(185, 78, 72);
    --color-warning: rgb(196, 160, 72);
    --color-text: rgb(51, 51, 51);
    --color-text-muted: rgb(130, 130, 135);
    --color-bg: rgb(255, 255, 245);
    --color-bg-secondary: rgb(245, 245, 235);
    --color-bg-dark: rgb(30, 41, 59);
    --color-border: rgb(215, 215, 210);
    --color-focus-ring: rgb(71, 85, 105);

    /* 간격 (1920x1080 레퍼런스) */
    --spacing-xs: 8px;  --spacing-sm: 16px;  --spacing-md: 24px;
    --spacing-lg: 40px; --spacing-xl: 64px;  --spacing-2xl: 96px;

    /* 폰트 크기 (1920x1080 레퍼런스) */
    --font-size-xs: 20px; --font-size-sm: 24px; --font-size-md: 28px;
    --font-size-lg: 36px; --font-size-xl: 48px; --font-size-2xl: 64px;

    /* 둥글기 */
    --border-radius-sm: 8px; --border-radius-md: 12px;
    --border-radius-lg: 20px; --border-radius-full: 9999px;

    /* 트랜지션 */
    --transition-fast: 150ms; --transition-normal: 250ms; --transition-slow: 400ms;

    /* 그림자 */
    --shadow-color: rgba(0, 0, 0, 0.08);
}
```

### 사이즈 기준 (1920x1080 레퍼런스, 필수)

**웹 CSS 사이즈(14px 본문, 48px 버튼)를 Unity에 그대로 사용하면 모바일에서 읽을 수 없다.**

| 요소 | 최소 크기 | 권장 크기 |
|------|----------|----------|
| 버튼 높이 | 80px | 96px |
| 리스트 아이템 높이 | 80px | 96px |
| 아이콘 버튼 | 64px (패딩 포함 80px) | 80px |
| 본문 텍스트 | 28px | 32px |
| 제목 텍스트 | 48px | 64px |
| 요소 간 간격 | 16px | 24px |
| 헤더/푸터 높이 | 96px | 120px |

### USS 파일 기본 구조

```css
/* 레이아웃 */
.screen { flex-grow: 1; }
.screen__header { flex-direction: row; padding: var(--spacing-md); }
.screen__content { flex-grow: 1; padding: var(--spacing-lg); }

/* 타이포그래피 */
.text--title { font-size: var(--font-size-xl); color: var(--color-text); -unity-font-style: bold; }
.text--body { font-size: var(--font-size-md); color: var(--color-text); }
.text--muted { font-size: var(--font-size-sm); color: var(--color-text-muted); }

/* 버튼 (hover + active + focus + disabled 필수) */
.btn {
    padding: var(--spacing-sm) var(--spacing-md);
    min-height: 80px;
    font-size: var(--font-size-md);
    border-radius: var(--border-radius-md);
    border-width: 0;
    transition: background-color var(--transition-fast) ease-in-out,
                scale var(--transition-fast) ease-in-out;
}
.btn--primary { background-color: var(--color-primary); color: white; }
.btn--primary:hover { background-color: var(--color-primary-hover); }
.btn--primary:active { background-color: var(--color-primary-active); scale: 0.97; }
.btn--primary:focus { border-width: 3px; border-color: var(--color-focus-ring); }
.btn--primary:disabled { opacity: 0.5; }
```

---

## 5. Flex 정렬 필수 규칙

**자식 요소가 있는 모든 컨테이너에 `justify-content`와 `align-items`를 명시한다.**

```css
/* 금지: 정렬 속성 없는 컨테이너 */
.card { flex-direction: row; padding: var(--spacing-md); }

/* 필수: 정렬 속성 명시 */
.card {
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    padding: var(--spacing-md);
}
```

**아이콘 + 텍스트 조합** (가장 흔한 정렬 문제):

```css
.card__row {
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
}
.card__icon {
    width: 48px; height: 48px;
    margin-right: var(--spacing-sm);
}
.card__text { font-size: var(--font-size-md); color: var(--color-text); }
```

상세 Flex 레퍼런스: `references/flex-layout.md`

---

## 출력 전 시각 검증 (필수)

**코드 작성만으로 "완료"를 주장하지 않는다.** UI는 시각적 결과가 본질이므로 실제 렌더링을 확인해야 한다.

### Unity MCP (CoplayDev/unity-mcp) 연결 시 3단계 검증

| 단계 | 호출 | 확인 대상 |
|------|------|----------|
| L1 | `read_console(action="get", types=["error","warning"], include_stacktrace=true)` | UXML/USS/C# 컴파일 에러 및 경고 0건 |
| L2 | `manage_editor(action="play")` 후 `read_console(...)` → `manage_editor(action="stop")` | 런타임 NullReference, 바인딩 실패, UXML 로드 에러 |
| L3 | `manage_camera(action="screenshot", include_image=true, capture_source="game_view")` | 레이아웃/정렬/색상/텍스트 가독성 시각 확인 |

- 최소 L1 + L3은 모든 UI 수정에 필수
- 상호작용 로직(버튼 콜백, 네비게이션, 데이터 바인딩) 변경 시 L2 추가
- UI Builder 뷰 확인이 필요하면 L3에서 `capture_source="scene_view"` 사용
- 문제 발견 → 수정 → 동일 단계 재촬영

### Unity MCP 미연결 시

다음을 사용자에게 요청한다:
1. Unity 에디터에서 해당 UXML을 UI Builder로 열어 본 스크린샷
2. Play 모드 진입 후 콘솔 로그
3. 상호작용이 있다면 실제 클릭/탭 결과 캡처

사용자 확인 없이 완료를 선언하지 않는다.

### 작업 분해 원칙

UI 작업이 다음 중 하나에 해당하면 TaskCreate로 분해하고 서브태스크별 L1+L3 검증 후 completed 마킹:
- 3개 이상의 UXML 파일 수정
- 새 화면/컴포넌트 신규 생성
- 공통 컴포넌트(Components/) 추가/변경
- 테마/DESIGN.md 색상 팔레트 변경

---

## 출력 전 체크리스트

### DESIGN.md 체크
```
- Assets/UI/DESIGN.md를 읽었는가?
- 색상/간격/폰트가 DESIGN.md에 정의된 값과 일치하는가?
- 새 컴포넌트를 만들었다면 DESIGN.md 컴포넌트 목록에 추가했는가?
- DESIGN.md가 없으면 사용자에게 생성을 제안했는가?
```

### UXML 체크
```
- 루트에 단일 컨테이너
- 스타일은 Style src 태그로만 연결
- 인라인 style 속성 없음
- 상호작용 요소에 고유한 name 속성 부여
- 클래스명이 BEM/kebab-case
- 불필요한 깊은 중첩 없음 (최대 4-5단계)
- 재사용 컴포넌트는 Components/에서 Template/Instance로 참조
- 인터랙티브 요소에 tabindex 속성 설정
```

### USS 체크
```
- 색상/간격/폰트 크기에 CSS 변수 사용
- 하드코딩된 매직넘버 없음
- 셀렉터 깊이 최대 2단계
- 후손 셀렉터 대신 자식 셀렉터(>) 사용
- 트랜지션은 기본 상태에 선언
- 고정 width/height 대신 flex-grow + min/max 사용
- 애니메이션은 translate/scale/rotate 사용
```

### 비주얼 스타일 체크
```
- 네온 컬러/강렬한 원색/보라-파랑 그라데이션 사용하지 않음
- 프로젝트 아트 디렉션에서 정한 색상 팔레트 사용
- 강조색 1~2가지 이내
- 과도한 장식 없음
- 텍스트-배경 명도 대비 4.5:1 이상 확보
- 어두운 배경에 어두운 텍스트, 밝은 배경에 밝은 텍스트 없음
- 본문 텍스트 최소 28px, 제목 최소 48px (1920x1080 기준)
```

### 정렬 체크
```
- 자식이 있는 모든 컨테이너에 justify-content와 align-items 명시
- 아이콘 + 텍스트 조합에서 align-items: center 설정
- flex-direction 명시
```

### 멀티 플랫폼 체크
```
- 인터랙티브 요소에 :hover + :active + :focus 모두 정의
- :hover에만 의존하는 기능/정보 없음
- 버튼/터치 타겟 최소 80px (1920x1080 기준)
- 인터랙티브 요소 간 최소 16px 간격
- 게임패드/키보드 탐색용 tabIndex 설정
- ClickEvent 사용 (PointerDownEvent 대신)
```

### 성능 체크
```
- 이미지/텍스처 아틀라스 사용 (8텍스처 제한)
- 불필요한 빈 VisualElement 래퍼 없음
- display: none으로 비활성 UI 처리
- 마스크는 직사각형 우선
- 애니메이션 요소에 DynamicTransform Usage Hint
```

### 시각 검증 체크 (완료 선언 전 필수)
```
- L1: read_console(action="get", types=["error","warning"]) 결과 0건 확인
- L3: manage_camera(action="screenshot", include_image=true)로 렌더링 확인
- (상호작용 변경 시) L2: manage_editor(action="play") 후 read_console 재확인 → manage_editor(action="stop")
- Unity MCP 미연결 시: 사용자에게 스크린샷/콘솔 로그 요청
- 검증 결과를 대화에 명시 ("screenshot: 정렬 정상 / read_console: 에러 0건" 등)
```

---

## DESIGN.md 프로세스

### DESIGN.md란?

프로젝트의 UI 디자인 결정을 한 곳에 기록한 파일이다.
**위치**: `Assets/UI/DESIGN.md`

### 최초 생성

`Assets/UI/DESIGN.md`가 없으면 사용자에게 생성을 제안하고, 아래 항목을 대화하며 채운다:

```markdown
# 프로젝트 UI 디자인 시스템

## 프로젝트 정보
- 프로젝트명: (이름)
- 방향: 가로 / 세로
- 기준 해상도: 1920x1080 / 1080x1920
- 주 플랫폼: 모바일
- Screen Match Mode: Match Width or Height (Match 값: 0 / 0.5 / 1)

## 색상 팔레트
- Primary: rgb(...)        — 용도: (메인 버튼, 강조)
- Primary Hover: rgb(...)
- Primary Active: rgb(...)
- Secondary: rgb(...)      — 용도: (보조 버튼, 배지)
- Danger: rgb(...)         — 용도: (오류, 삭제)
- Warning: rgb(...)        — 용도: (경고)
- Text: rgb(...)
- Text Muted: rgb(...)
- BG: rgb(...)
- BG Secondary: rgb(...)
- Border: rgb(...)
- Focus Ring: rgb(...)

## 타이포그래피
- 기본 폰트: (폰트명)
- 폰트 사이즈 스케일: xs / sm / md / lg / xl / 2xl

## 간격 체계
- xs: 8px / sm: 16px / md: 24px / lg: 40px / xl: 64px / 2xl: 96px

## 공통 컴포넌트 목록
| 컴포넌트 | 파일 | 용도 |
|----------|------|------|

## 아트 디렉션 메모
- 스타일 키워드: (예: 심플, 미니멀, 판타지 등)
- 톤 앤 매너: (예: 슬레이트/아이보리 기반)
```

**생성 절차:**
1. 사용자에게 프로젝트 방향(가로/세로), 스타일 키워드를 질문
2. 색상 팔레트가 정해져 있으면 기록, 없으면 플레이스홀더로 남김
3. `Assets/UI/DESIGN.md` 파일 생성
4. `Assets/UI/Styles/Common.uss`의 `:root` 변수도 DESIGN.md와 동기화

---

## 기존 프로젝트 패턴 우선

프로젝트에 이미 UXML/USS 파일이 있으면:

1. `Assets/UI/DESIGN.md` 확인 -> 있으면 이것을 기준으로 작업
2. DESIGN.md가 없으면 기존 파일 3-5개 읽기
3. 네이밍/구조/스타일링 패턴 분석
4. **기존 패턴을 이 가이드라인보다 우선** 적용
5. **새 컴포넌트 생성 전 `Components/` 디렉토리에서 기존 컴포넌트 확인 필수**

---

## 상세 참조

| 파일 | 내용 |
|------|------|
| `references/selectors-and-pseudo-classes.md` | USS 셀렉터 종류, 특이성, 의사 클래스, :hover 주의사항 |
| `references/transitions-and-animation.md` | 트랜지션 문법, 타이밍, transform 우선 원칙, Usage Hints |
| `references/flex-layout.md` | Flex 컨테이너/아이템 프로퍼티, Position, 레이아웃 패턴 |
| `references/performance.md` | 배칭, 아틀라스, 마스킹, 셀렉터 성능, 커스텀 컨트롤 |
| `references/responsive-and-input.md` | PanelSettings, 해상도, Safe Area, 멀티 플랫폼 입력 |
| `references/csharp-patterns.md` | 요소 조회, 이벤트 등록, 데이터 바인딩 |

## 관련 문서

- `rules/06-ui-design.md` - AI 안티패턴 금지, 접근성, 인터랙션 상태 (범용 UI 규칙)
- `rules/03-coding-style.md` - 일반 코딩 스타일 및 네이밍 규칙
