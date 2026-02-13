---
name: ui-toolkit-design
description: Unity UI Toolkit (UXML/USS) 디자인 가이드라인. UXML, USS, UI Toolkit, UI Builder, VisualElement, UIDocument 관련 작업 시 자동 활성화. Unity UI 화면 생성, 스타일 작성, 레이아웃 구성 요청 시 사용.
user-invocable: true
---

# Unity UI Toolkit 디자인 가이드라인

## 적용 범위

Unity 프로젝트에서 UI Toolkit (UXML/USS) 작업 시 적용.
기존 프로젝트에 이미 확립된 패턴이 있으면 그 패턴을 우선한다.

---

## 1. 파일·에셋 구조

### 디렉토리 구조

```
Assets/UI/
├── Documents/          # UXML 파일
│   ├── MainMenu.uxml
│   ├── PlayerHUD.uxml
│   └── Settings.uxml
├── Styles/             # USS 파일
│   ├── Common.uss      # 공통 변수, 리셋
│   ├── Layout.uss      # 레이아웃 유틸리티
│   ├── Buttons.uss     # 버튼 스타일
│   └── Typography.uss  # 텍스트 스타일
└── Templates/          # 재사용 UXML 템플릿
    └── PlayerCard.uxml
```

### 파일 네이밍

| 유형 | 규칙 | 예시 |
|------|------|------|
| UXML | PascalCase + 역할 | `MainMenu.uxml`, `PlayerHUD.uxml` |
| USS | PascalCase + 기능 단위 | `Buttons.uss`, `Layout.uss` |
| 템플릿 UXML | PascalCase + 컴포넌트명 | `PlayerCard.uxml`, `DialogBox.uxml` |

---

## 2. 네이밍 컨벤션

### USS 클래스명: BEM (kebab-case)

```
.block__element--modifier

예:
.menu                     # 블록
.menu__item               # 요소
.menu__item--disabled     # 수정자
.menu__item--selected     # 수정자
.player-hud__health-bar   # 복합 블록
```

### UXML name 속성

- 코드에서 `Q<>()` / `Q()`로 접근할 요소에만 부여
- kebab-case 사용
- 고유하고 의미 있는 이름

```xml
<Button name="play-button" class="menu__item" text="Play" />
<Label name="player-name-label" class="hud__label" />
<VisualElement name="health-bar-container" class="hud__health-bar" />
```

### UXML 루트 요소명

의미 있는 이름 사용: `root`, `content`, `header`, `footer`, `sidebar`

---

## 3. UXML 작성 규칙

### 필수

```xml
<ui:UXML xmlns:ui="UnityEngine.UIElements">
    <!-- 스타일은 반드시 Style 태그로 연결 -->
    <Style src="project://database/Assets/UI/Styles/Common.uss" />
    <Style src="project://database/Assets/UI/Styles/Buttons.uss" />

    <!-- 단일 루트 컨테이너 -->
    <ui:VisualElement name="root" class="screen">
        <ui:VisualElement name="header" class="screen__header">
            <ui:Label name="title-label" class="screen__title" text="Main Menu" />
        </ui:VisualElement>

        <ui:VisualElement name="content" class="screen__content">
            <ui:Button name="play-button" class="btn btn--primary" text="Play" />
            <ui:Button name="settings-button" class="btn btn--secondary" text="Settings" />
        </ui:VisualElement>
    </ui:VisualElement>
</ui:UXML>
```

### 금지

| ❌ 금지 | ✅ 대신 |
|--------|--------|
| `style="color: red;"` 인라인 스타일 | `class="text--danger"` 클래스 사용 |
| 스타일 없는 깊은 중첩 (5단계+) | 템플릿으로 분리 |
| `name` 없는 상호작용 요소 | 코드 바인딩용 고유 `name` 부여 |
| 하드코딩된 색상값/크기값 | USS 변수 사용 |

---

## 4. USS 작성 규칙

### 변수 정의 (Common.uss)

```css
:root {
    /* 색상 */
    --color-primary: rgb(66, 133, 244);
    --color-secondary: rgb(52, 168, 83);
    --color-danger: rgb(234, 67, 53);
    --color-text: rgb(32, 33, 36);
    --color-text-muted: rgb(95, 99, 104);
    --color-bg: rgb(255, 255, 255);
    --color-bg-dark: rgb(32, 33, 36);

    /* 간격 */
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;

    /* 폰트 크기 */
    --font-size-sm: 12px;
    --font-size-md: 14px;
    --font-size-lg: 18px;
    --font-size-xl: 24px;

    /* 둥글기 */
    --border-radius-sm: 4px;
    --border-radius-md: 8px;
    --border-radius-lg: 12px;
}
```

### 셀렉터 규칙

```css
/* ✅ 좋은 예: 단순 클래스 셀렉터 */
.btn { }
.btn--primary { }
.menu__item { }

/* ❌ 나쁜 예: 깊은 후손 셀렉터 (성능·가독성 저하) */
.screen .content .list .item .label { }
```

- 셀렉터 깊이 최대 2단계
- 타입 셀렉터(`Button`, `Label`)보다 클래스 셀렉터 선호
- 레이아웃 / 타이포그래피 / 컬러를 섹션 또는 파일로 분리

### USS 파일 구조

```css
/* ===========================
   레이아웃
   =========================== */
.screen { flex-grow: 1; }
.screen__header { flex-direction: row; padding: var(--spacing-md); }
.screen__content { flex-grow: 1; padding: var(--spacing-lg); }

/* ===========================
   타이포그래피
   =========================== */
.screen__title { font-size: var(--font-size-xl); color: var(--color-text); }

/* ===========================
   인터랙티브
   =========================== */
.btn { padding: var(--spacing-sm) var(--spacing-md); border-radius: var(--border-radius-md); }
.btn--primary { background-color: var(--color-primary); color: white; }
.btn--primary:hover { opacity: 0.9; }
```

---

## 5. C# 바인딩 패턴

```csharp
// UIDocument에서 요소 조회 시 name 속성 사용
var root = GetComponent<UIDocument>().rootVisualElement;
var playButton = root.Q<Button>("play-button");
var playerNameLabel = root.Q<Label>("player-name-label");
var healthBar = root.Q("health-bar-container");
```

UXML에서 `name`을 부여한 요소만 코드에서 조회한다.
클래스로 조회(`Q(className: "...")`)는 여러 요소 일괄 처리 시에만 사용.

---

## 출력 전 체크리스트

UXML/USS 코드를 출력하기 전에 아래를 자기 검증한다.
만족하지 못한 항목이 있으면 수정한 뒤 최종 코드만 출력한다.

### UXML 체크

```
☐ 루트에 단일 컨테이너 (`<ui:VisualElement>`)
☐ 스타일은 <Style src="..."> 태그로만 연결
☐ 인라인 style 속성 없음
☐ 상호작용 요소에 고유한 name 속성 부여
☐ 클래스명이 BEM/kebab-case 패턴 준수
☐ 불필요한 깊은 중첩 없음 (최대 4-5단계)
```

### USS 체크

```
☐ 색상/간격/폰트 크기에 CSS 변수 사용
☐ 하드코딩된 매직넘버 없음
☐ 셀렉터 깊이 최대 2단계
☐ 레이아웃/타이포/컬러 섹션 분리
☐ 인라인 스타일 대신 클래스 적용
```

### 바인딩 체크

```
☐ C#에서 접근할 요소에 name 속성 있음
☐ name이 kebab-case이고 고유함
☐ Q<Type>("name") 패턴으로 조회 가능
```

---

## 기존 프로젝트 패턴 우선

프로젝트에 이미 UXML/USS 파일이 있으면:

1. 기존 파일 3-5개 읽기
2. 네이밍/구조/스타일링 패턴 분석
3. **기존 패턴을 이 가이드라인보다 우선** 적용
4. 패턴이 일관되지 않으면 이 가이드라인을 기준으로 통일 제안

---

## 관련 문서

- `rules/06-coding-style.md` - 일반 코딩 스타일 및 네이밍 규칙
- Unity 공식: [UI Toolkit Best Practices](https://docs.unity3d.com/Manual/best-practice-guides/ui-toolkit-for-advanced-unity-developers/naming-conventions.html)
- Unity 공식: [USS Writing Style Sheets](https://docs.unity3d.com/6000.3/Documentation/Manual/UIE-USS-WritingStyleSheets.html)
