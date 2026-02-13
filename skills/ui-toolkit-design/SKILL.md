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
├── Templates/          # 재사용 UXML 템플릿
│   ├── PlayerCard.uxml
│   └── DialogBox.uxml
└── Themes/             # TSS 테마 파일
    ├── DefaultTheme.tss
    ├── DarkTheme.tss
    └── LightTheme.tss
```

### 파일 네이밍

| 유형 | 규칙 | 예시 |
|------|------|------|
| UXML | PascalCase + 역할 | `MainMenu.uxml`, `PlayerHUD.uxml` |
| USS | PascalCase + 기능 단위 | `Buttons.uss`, `Layout.uss` |
| 템플릿 UXML | PascalCase + 컴포넌트명 | `PlayerCard.uxml`, `DialogBox.uxml` |
| TSS | PascalCase + Theme | `DarkTheme.tss`, `LightTheme.tss` |

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

### 네이밍 원칙 (공식 권장)

| 원칙 | ✅ 좋은 예 | ❌ 나쁜 예 |
|------|-----------|-----------|
| 의미 기반 (역할 중심) | `button--quit` | `button--red` (표현 기반) |
| 가독성 > 간결성 | `inventory__slot--equipped` | `inv__slt--eq` |
| 타입명 생략 (불필요 시) | `hud__health` | `hud__health-label` |
| 네임스페이스 접두사 (재사용 시) | `mylib-btn` | `btn` (충돌 위험) |

### UXML name 속성

- 코드에서 `Q<>()` / `Q()`로 접근할 요소에만 부여
- kebab-case 사용
- 패널 내에서 고유해야 함

```xml
<Button name="play-button" class="menu__item" text="Play" />
<Label name="player-name-label" class="hud__label" />
<VisualElement name="health-bar-container" class="hud__health-bar" />
```

### UXML 루트 요소명

의미 있는 이름 사용: `root`, `content`, `header`, `footer`, `sidebar`

---

## 3. UXML 작성 규칙

### 기본 구조

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

### 템플릿 재사용 (UXML 중첩)

재사용 컴포넌트는 별도 UXML로 분리 후 `<Template>`과 `<Instance>`로 참조:

```xml
<ui:UXML xmlns:ui="UnityEngine.UIElements">
    <Template src="project://database/Assets/UI/Templates/PlayerCard.uxml" name="PlayerCard" />

    <ui:VisualElement name="root" class="screen">
        <Instance template="PlayerCard" name="player-1" />
        <Instance template="PlayerCard" name="player-2" />
    </ui:VisualElement>
</ui:UXML>
```

### 데이터 바인딩 (Unity 6+)

UXML에서 직접 데이터 소스를 바인딩할 수 있다. 정적/기본 설정은 UXML, 동적 업데이트는 C#에서 처리:

```xml
<!-- UXML에서 바인딩 경로 설정 (데이터 소스는 런타임에 할당) -->
<ui:Label binding-path="playerName" />
<ui:ProgressBar binding-path="health" />
```

```csharp
// C#에서 데이터 소스 할당
var root = GetComponent<UIDocument>().rootVisualElement;
root.dataSource = playerDataSO; // ScriptableObject 등
```

**바인딩 모드**: `ToTarget` (데이터→UI), `ToSource` (UI→데이터), 양방향
**데이터 소스 상속**: 부모 요소의 dataSource가 자식에게 자동 전파됨

### 금지 사항

| ❌ 금지 | ✅ 대신 |
|--------|--------|
| `style="color: red;"` 인라인 스타일 | `class="text--danger"` 클래스 사용 |
| 스타일 없는 깊은 중첩 (5단계+) | 템플릿(`<Template>`)으로 분리 |
| `name` 없는 상호작용 요소 | 코드 바인딩용 고유 `name` 부여 |
| 하드코딩된 색상값/크기값 | USS 변수 사용 |

---

## 4. USS 작성 규칙

### 변수 정의 (Common.uss)

```css
:root {
    /* === 색상 === */
    --color-primary: rgb(66, 133, 244);
    --color-primary-hover: rgb(56, 113, 214);
    --color-primary-active: rgb(46, 93, 184);
    --color-secondary: rgb(52, 168, 83);
    --color-danger: rgb(234, 67, 53);
    --color-warning: rgb(251, 188, 4);
    --color-text: rgb(32, 33, 36);
    --color-text-muted: rgb(95, 99, 104);
    --color-bg: rgb(255, 255, 255);
    --color-bg-secondary: rgb(245, 245, 245);
    --color-bg-dark: rgb(32, 33, 36);
    --color-border: rgb(218, 220, 224);

    /* === 간격 === */
    --spacing-xs: 4px;
    --spacing-sm: 8px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;
    --spacing-2xl: 48px;

    /* === 폰트 크기 === */
    --font-size-xs: 10px;
    --font-size-sm: 12px;
    --font-size-md: 14px;
    --font-size-lg: 18px;
    --font-size-xl: 24px;
    --font-size-2xl: 32px;

    /* === 둥글기 === */
    --border-radius-sm: 4px;
    --border-radius-md: 8px;
    --border-radius-lg: 12px;
    --border-radius-full: 9999px;

    /* === 트랜지션 === */
    --transition-fast: 150ms;
    --transition-normal: 250ms;
    --transition-slow: 400ms;

    /* === 그림자 (border 기반 시뮬레이션) === */
    --shadow-color: rgba(0, 0, 0, 0.1);
}
```

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
.text--title { font-size: var(--font-size-xl); color: var(--color-text); -unity-font-style: bold; }
.text--body { font-size: var(--font-size-md); color: var(--color-text); }
.text--muted { font-size: var(--font-size-sm); color: var(--color-text-muted); }

/* ===========================
   인터랙티브 (트랜지션 포함)
   =========================== */
.btn {
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--border-radius-md);
    border-width: 0;
    /* 트랜지션은 기본 상태에 선언 (pseudo-class 아님!) */
    transition: background-color var(--transition-fast) ease-in-out,
                color var(--transition-fast) ease-in-out,
                scale var(--transition-fast) ease-in-out;
}
.btn--primary { background-color: var(--color-primary); color: white; }
.btn--primary:hover { background-color: var(--color-primary-hover); }
.btn--primary:active { background-color: var(--color-primary-active); scale: 0.97; }
.btn--primary:disabled { opacity: 0.5; }
```

---

## 5. 셀렉터 가이드

### 셀렉터 종류

| 셀렉터 | 문법 | 예시 | 용도 |
|--------|------|------|------|
| 타입 | `TypeName` | `Button { }` | 특정 C# 타입 전체 (네임스페이스 생략) |
| 클래스 | `.class` | `.btn { }` | BEM 클래스 (가장 권장) |
| 이름 | `#name` | `#play-button { }` | 특정 요소 1개 |
| 와일드카드 | `*` | `* { }` | 전체 요소 (주의해서 사용) |
| 자식 | `A > B` | `.menu > .menu__item { }` | 직접 자식만 |
| 후손 | `A B` | `.menu .icon { }` | 모든 하위 요소 |
| 셀렉터 목록 | `A, B` | `.btn, .link { }` | 동일 스타일 적용 |

### 셀렉터 특이성 (Specificity) 우선순위

```
#name > .class > TypeName
(높음)           (낮음)
```

동일 특이성일 경우, 나중에 정의된 규칙이 우선.

### 셀렉터 규칙

```css
/* ✅ 좋은 예: 단순 클래스 셀렉터 */
.btn { }
.btn--primary { }
.menu__item { }

/* ✅ 좋은 예: 자식 셀렉터 (최대 2단계) */
.menu > .menu__item { }

/* ❌ 나쁜 예: 깊은 후손 셀렉터 */
.screen .content .list .item .label { }

/* ❌ 나쁜 예: 와일드카드 끝 배치 (모든 자식 순회) */
.menu > * { }

/* ❌ 나쁜 예: 후손 + 와일드카드 조합 */
.screen * .label { }
```

**핵심 원칙:**
- BEM 클래스 셀렉터를 최우선 사용
- 타입 셀렉터(`Button`, `Label`)보다 클래스 셀렉터 선호
- 셀렉터 깊이 최대 2단계
- 후손 셀렉터(`A B`)보다 자식 셀렉터(`A > B`) 선호
- 와일드카드(`*`)는 셀렉터 끝이나 후손 조합에서 사용 금지

---

## 6. 의사 클래스 (Pseudo-Classes)

### 지원 목록

| 의사 클래스 | 설명 | 주 사용처 |
|------------|------|----------|
| `:hover` | 포인터가 요소 위에 있을 때 | 버튼, 링크, 카드 |
| `:active` | 요소와 상호작용 중 (마우스 누름) | 버튼 |
| `:focus` | 요소가 포커스를 받았을 때 (키보드 탐색) | 입력 필드, 버튼 |
| `:checked` | Toggle/Checkbox가 체크된 상태 | Toggle, RadioButton |
| `:disabled` | 요소가 비활성화된 상태 (`SetEnabled(false)`) | 비활성 버튼 |
| `:enabled` | 요소가 활성화된 상태 | (기본 상태) |
| `:selected` | 요소가 선택된 상태 | ListView 항목 |
| `:root` | 스타일시트가 적용된 최상위 요소 | 전역 변수 선언 |

### 의사 클래스 체이닝

여러 상태를 동시에 매칭:

```css
/* 체크된 상태 + 호버 */
.toggle:checked:hover {
    background-color: var(--color-primary-hover);
}

/* 포커스 + 호버 */
.input:focus:hover {
    border-color: var(--color-primary);
}
```

### :hover 성능 주의

`:hover`는 포인터 이동 시마다 대상 요소의 전체 하위 계층을 무효화한다.

```css
/* ❌ 나쁜 예: 하위 요소가 많은 곳에서 후손 셀렉터 + :hover */
.yellow:hover > * > Button { }

/* ✅ 좋은 예: 직접 대상 요소에만 :hover */
.btn:hover { }
```

---

## 7. 트랜지션 & 애니메이션

USS 트랜지션은 CSS 트랜지션과 유사하게 프로퍼티 값을 시간에 따라 변경한다.

### 핵심 규칙: 트랜지션은 기본 상태에 선언

```css
/* ✅ 올바름: 기본 상태에 transition 선언 */
.btn {
    background-color: var(--color-primary);
    transition: background-color 250ms ease-in-out;
}
.btn:hover {
    background-color: var(--color-primary-hover);
}

/* ❌ 잘못됨: :hover에 transition 선언 (마우스 나갈 때 동작 안 함) */
.btn:hover {
    background-color: var(--color-primary-hover);
    transition: background-color 250ms ease-in-out;
}
```

### Longhand 프로퍼티

```css
.element {
    transition-property: background-color, scale, rotate;
    transition-duration: 250ms, 300ms, 200ms;
    transition-timing-function: ease-in-out, ease-out, linear;
    transition-delay: 0s, 50ms, 0s;
}
```

### Shorthand 문법

```css
/* transition: <property> <duration> <timing-function> <delay>; */
.element {
    transition: background-color 250ms ease-in-out,
                scale 300ms ease-out 50ms,
                rotate 200ms linear;
}
```

### 지원 타이밍 함수

| 함수 | 설명 |
|------|------|
| `ease` | 기본값. 느리게 시작 → 빠르게 → 느리게 끝 |
| `linear` | 일정한 속도 |
| `ease-in` | 느리게 시작 |
| `ease-out` | 느리게 끝 |
| `ease-in-out` | 느리게 시작, 느리게 끝 |
| `ease-in-cubic` | 큐빅 곡선 시작 |
| `ease-out-cubic` | 큐빅 곡선 종료 |
| `ease-in-out-cubic` | 큐빅 곡선 양쪽 |

### 트랜지션 단위 일치

값과 단위가 반드시 일치해야 한다. 기본값에 주의:

```css
/* ❌ 잘못됨: translate 기본값은 0px인데 %로 전환 시도 */
.element { translate: 0px 0px; }
.element:hover { translate: 50% 0; }

/* ✅ 올바름: 동일한 단위 사용 */
.element { translate: 0px 0px; }
.element:hover { translate: 50px 0px; }
```

### 실전 패턴: 버튼 인터랙션

```css
.btn {
    padding: var(--spacing-sm) var(--spacing-lg);
    border-radius: var(--border-radius-md);
    background-color: var(--color-primary);
    color: white;
    scale: 1;
    transition: background-color var(--transition-fast) ease-in-out,
                scale var(--transition-fast) ease-out;
}
.btn:hover {
    background-color: var(--color-primary-hover);
    scale: 1.02;
}
.btn:active {
    background-color: var(--color-primary-active);
    scale: 0.97;
}
.btn:disabled {
    opacity: 0.5;
    /* disabled 상태에서는 hover/active 무효화 */
}
```

### C#에서 트랜지션 이벤트 처리

```csharp
element.RegisterCallback<TransitionEndEvent>(evt => {
    // 트랜지션 완료 후 처리
});
element.RegisterCallback<TransitionStartEvent>(evt => {
    // 트랜지션 시작 시 처리
});
```

---

## 8. Flex 레이아웃 시스템

UI Toolkit은 CSS Flexbox 서브셋을 사용한다. 기본 방향은 `column` (위→아래).
Unity의 box-sizing은 CSS의 `border-box`와 동일하다.

### 컨테이너 프로퍼티

```css
.container {
    /* 방향: column(기본) | row | column-reverse | row-reverse */
    flex-direction: row;

    /* 줄바꿈: nowrap(기본) | wrap | wrap-reverse */
    flex-wrap: wrap;

    /* 주축 정렬 */
    justify-content: center;
    /* flex-start | flex-end | center | space-between | space-around */

    /* 교차축 정렬 */
    align-items: center;
    /* auto | flex-start | flex-end | center | stretch */

    /* 여러 줄일 때 교차축 정렬 */
    align-content: stretch;
    /* flex-start | flex-end | center | stretch */
}
```

### 아이템 프로퍼티

```css
.item {
    /* 남은 공간 비율로 확장 */
    flex-grow: 1;

    /* 공간 부족 시 축소 비율 */
    flex-shrink: 0;

    /* 기본 크기 (flex 계산 전) */
    flex-basis: auto;

    /* shorthand: flex: <grow> <shrink> <basis> */
    flex: 1 0 auto;

    /* 개별 교차축 정렬 */
    align-self: center;
}
```

### 균등 분할 패턴

```css
/* 자식 요소를 동일한 크기로 분할 */
.equal-columns { flex-direction: row; }
.equal-columns > * {
    flex-grow: 1;
    flex-basis: 0;  /* 중요: basis를 0으로 해야 동일 분할 */
}
```

### Position

```css
/* relative(기본): 부모 기준 일반 흐름 */
.element { position: relative; }

/* absolute: 부모 기준 절대 위치 (흐름에서 벗어남) */
.overlay {
    position: absolute;
    left: 0; top: 0; right: 0; bottom: 0;
}
```

### 레이아웃 실전 패턴

```css
/* 헤더 - 컨텐츠 - 푸터 구조 */
.screen { flex-grow: 1; }
.screen__header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md);
}
.screen__content {
    flex-grow: 1;  /* 남은 공간 전부 차지 */
    padding: var(--spacing-lg);
}
.screen__footer {
    flex-direction: row;
    justify-content: flex-end;
    padding: var(--spacing-md);
}

/* 수직/수평 중앙 정렬 */
.center-both {
    justify-content: center;
    align-items: center;
}

/* 가로 스크롤 리스트 */
.horizontal-list {
    flex-direction: row;
    overflow: hidden; /* 또는 scroll */
}
```

---

## 9. 커스텀 컨트롤 (Unity 6+)

### UxmlElement / UxmlAttribute 패턴

```csharp
using UnityEngine.UIElements;

[UxmlElement]
public partial class HealthBar : VisualElement
{
    [UxmlAttribute]
    public float maxHealth { get; set; } = 100f;

    [UxmlAttribute]
    public float currentHealth { get; set; } = 100f;

    [UxmlAttribute(name: "bar-color")]
    public Color barColor { get; set; } = Color.green;

    public HealthBar()
    {
        // USS 클래스를 생성자에서 추가
        AddToClassList("health-bar");

        // 내부 구조 구성
        var fill = new VisualElement();
        fill.AddToClassList("health-bar__fill");
        Add(fill);
    }
}
```

```xml
<!-- UXML에서 사용 -->
<HealthBar name="player-health" max-health="200" current-health="150" bar-color="#00FF00" />
```

### 라이프사이클 이벤트

```csharp
public HealthBar()
{
    // UI 트리에 추가될 때
    RegisterCallback<AttachToPanelEvent>(OnAttach);
    // UI 트리에서 제거될 때
    RegisterCallback<DetachFromPanelEvent>(OnDetach);
}
```

**주의**: Unity 6 이전의 `UxmlFactory`/`UxmlTraits` 패턴은 사용하지 않는다 (deprecated).

---

## 10. 테마 (TSS) 시스템

TSS(Theme Style Sheet)는 USS와 동일한 문법이지만, 테마 전환용으로 분리된 에셋 타입.

### 테마 구조

```css
/* DarkTheme.tss */
@import url("project://database/Assets/UI Toolkit/UnityThemes/UnityDefaultTheme.tss");
@import url("project://database/Assets/UI/Styles/Common.uss");
@import url("project://database/Assets/UI/Styles/DarkOverrides.uss");
```

```css
/* DarkOverrides.uss - 다크 테마 변수 오버라이드 */
:root {
    --color-text: rgb(230, 230, 230);
    --color-text-muted: rgb(160, 160, 160);
    --color-bg: rgb(30, 30, 30);
    --color-bg-secondary: rgb(45, 45, 45);
    --color-border: rgb(60, 60, 60);
}
```

### 런타임 테마 전환

Panel Settings Inspector에서 Theme Style Sheet 필드에 TSS 파일을 지정.
여러 Panel Settings가 있으면 각각 다른 TSS 사용 가능.

### 테마 활용 시나리오

- 라이트/다크 모드 전환
- 플랫폼별 UI (모바일/PC)
- 다국어 폰트 교체
- 이벤트/시즌 테마

---

## 11. 성능 최적화

### 배칭 (Batching)

UI Toolkit은 동일한 GPU 요건을 가진 요소들을 배칭하여 드로우콜을 줄인다.
배칭이 깨지는 원인:

- **텍스처 전환**: 여러 텍스처 사용 시 배치 분리 → 텍스처 아틀라스로 통합
- **머티리얼 전환**: 서로 다른 머티리얼 사용 시
- **클리핑 영역 변경**: overflow: hidden 등

### 셀렉터 성능

```css
/* ✅ 빠름: 단순 클래스 셀렉터 */
.btn--primary { }

/* ⚠️ 보통: 자식 셀렉터 (깊이 제한) */
.menu > .menu__item { }

/* ❌ 느림: 깊은 후손 셀렉터 */
.screen .content .list .item .label { }

/* ❌ 매우 느림: 와일드카드 + 후손 조합 */
.screen * .label { }
```

### 레이아웃 성능

- **중첩 최소화**: 깊은 계층은 레이아웃 재계산 비용 증가
- **flex-grow/flex-shrink 적극 활용**: 고정 크기보다 유연한 레이아웃이 리사이징에 유리
- **불필요한 요소 제거**: 빈 VisualElement 래퍼 남발 금지

### 런타임 성능 팁

| 항목 | 권장 |
|------|------|
| 비활성 UI | `display: none` (레이아웃에서 완전 제거) |
| 숨김 UI | `visibility: hidden` (공간은 유지, 렌더링 생략) |
| 오브젝트 풀링 | 비활성화(`SetEnabled(false)`) 먼저 → 부모 변경 |
| 이미지 최적화 | 텍스처 아틀라스 사용, 동일 아틀라스 내 이미지 우선 |
| 전체화면 UI | 뒤 3D 씬 Camera 비활성화 고려 |

---

## 12. 반응형 디자인

UI Toolkit은 CSS 미디어 쿼리를 지원하지 않는다. 대안:

### USS 기반 반응형

```css
/* 퍼센트, flex 기반 유연한 레이아웃 */
.responsive-container {
    flex-direction: row;
    flex-wrap: wrap;
}
.responsive-item {
    flex-grow: 1;
    flex-basis: 200px;   /* 최소 너비 힌트 */
    min-width: 150px;
    max-width: 100%;
}
```

### C# 기반 적응형

```csharp
// 화면 크기에 따라 클래스 전환
void UpdateLayout()
{
    var root = document.rootVisualElement;
    var width = root.resolvedStyle.width;

    root.EnableInClassList("layout--mobile", width < 600);
    root.EnableInClassList("layout--tablet", width >= 600 && width < 1024);
    root.EnableInClassList("layout--desktop", width >= 1024);
}
```

```css
/* 각 레이아웃 모드에 대한 스타일 */
.layout--mobile .sidebar { display: none; }
.layout--mobile .content { flex-direction: column; }
.layout--desktop .sidebar { width: 250px; }
.layout--desktop .content { flex-direction: row; }
```

### Safe Area (모바일 노치 대응)

내장 지원 없음. 커뮤니티 패키지 사용 권장:
- `artstorm/ui-toolkit-safe-area` — UI Builder에서 커스텀 컨트롤로 사용

```csharp
// 수동 Safe Area 적용
var safeArea = Screen.safeArea;
var root = document.rootVisualElement;
root.style.paddingLeft = safeArea.x;
root.style.paddingTop = Screen.height - safeArea.yMax;
root.style.paddingRight = Screen.width - safeArea.xMax;
root.style.paddingBottom = safeArea.y;
```

---

## 13. C# 바인딩 패턴

### 요소 조회

```csharp
var root = GetComponent<UIDocument>().rootVisualElement;

// name으로 단일 요소 조회
var playButton = root.Q<Button>("play-button");
var playerNameLabel = root.Q<Label>("player-name-label");

// 클래스로 복수 요소 조회
var allButtons = root.Query<Button>(className: "btn").ToList();

// Bind() 호출 시 최하위 공통 부모에서 한번만
root.Bind(serializedObject);
```

### 이벤트 등록 패턴

```csharp
// 클릭
playButton.RegisterCallback<ClickEvent>(evt => OnPlay());

// 값 변경
var slider = root.Q<Slider>("volume-slider");
slider.RegisterValueChangedCallback(evt => SetVolume(evt.newValue));

// 커스텀 이벤트 전파
element.RegisterCallback<GeometryChangedEvent>(evt => OnResize());
```

**규칙**: UXML에서 `name`을 부여한 요소만 코드에서 조회한다.
클래스로 조회(`Q(className: "...")`)는 여러 요소 일괄 처리 시에만 사용.

---

## 출력 전 체크리스트

UXML/USS 코드를 출력하기 전에 아래를 자기 검증한다.
만족하지 못한 항목이 있으면 수정한 뒤 최종 코드만 출력한다.

### UXML 체크

```
☐ 루트에 단일 컨테이너 (<ui:VisualElement>)
☐ 스타일은 <Style src="..."> 태그로만 연결
☐ 인라인 style 속성 없음
☐ 상호작용 요소에 고유한 name 속성 부여
☐ 클래스명이 BEM/kebab-case 패턴 준수
☐ 불필요한 깊은 중첩 없음 (최대 4-5단계)
☐ 재사용 컴포넌트는 Template/Instance로 분리
```

### USS 체크

```
☐ 색상/간격/폰트 크기에 CSS 변수 사용
☐ 하드코딩된 매직넘버 없음
☐ 셀렉터 깊이 최대 2단계
☐ 후손 셀렉터 대신 자식 셀렉터(>) 사용
☐ 와일드카드(*) 끝 배치나 후손 조합 없음
☐ 레이아웃/타이포/컬러/인터랙션 섹션 분리
☐ 트랜지션은 기본 상태에 선언 (pseudo-class가 아닌)
☐ 트랜지션 값의 단위가 시작/끝 상태에서 일치
☐ :hover 셀렉터가 하위 요소 많은 곳에서 후손 조합으로 사용되지 않음
```

### 바인딩 체크

```
☐ C#에서 접근할 요소에 name 속성 있음
☐ name이 kebab-case이고 패널 내 고유함
☐ Q<Type>("name") 패턴으로 조회 가능
☐ 이벤트 콜백 등록 패턴 준수
```

### 성능 체크

```
☐ 이미지/텍스처 아틀라스 사용 권장
☐ 불필요한 빈 VisualElement 래퍼 없음
☐ display: none으로 비활성 UI 처리
☐ 깊은 중첩 구조 없음
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

### Unity 공식 문서
- [UI Toolkit for Advanced Developers (Unity 6 E-Book)](https://docs.unity3d.com/6000.3/Documentation/Manual/best-practice-guides/ui-toolkit-for-advanced-unity-developers/bpg-uiad-index.html)
- [Naming Conventions](https://docs.unity3d.com/6000.4/Documentation/Manual/best-practice-guides/ui-toolkit-for-advanced-unity-developers/naming-conventions.html)
- [USS Best Practices](https://docs.unity3d.com/Manual/UIE-USS-WritingStyleSheets.html)
- [USS Selectors](https://docs.unity3d.com/6000.3/Documentation/Manual/UIE-USS-Selectors.html)
- [Pseudo-Classes](https://docs.unity3d.com/Manual/UIE-USS-Selectors-Pseudo-Classes.html)
- [USS Transitions](https://docs.unity3d.com/6000.2/Documentation/Manual/UIE-Transitions.html)
- [USS Properties Reference](https://docs.unity3d.com/Manual/UIE-USS-Properties-Reference.html)
- [Layout Engine](https://docs.unity3d.com/6000.2/Documentation/Manual/UIE-LayoutEngine.html)
- [Data Binding](https://docs.unity3d.com/6000.4/Documentation/Manual/best-practice-guides/ui-toolkit-for-advanced-unity-developers/data-binding.html)
- [Custom Controls](https://docs.unity3d.com/Manual/best-practice-guides/ui-toolkit-for-advanced-unity-developers/custom-controls.html)
- [Theme Style Sheet (TSS)](https://docs.unity3d.com/Manual/UIE-tss.html)
- [Optimizing Performance](https://docs.unity3d.com/6000.3/Documentation/Manual/best-practice-guides/ui-toolkit-for-advanced-unity-developers/optimizing-performance.html)
- [Runtime UI Performance](https://docs.unity3d.com/Manual/UIE-performance-consideration-runtime.html)
- [Scalable UI with UI Toolkit in Unity 6](https://unity.com/resources/scalable-performant-ui-uitoolkit-unity-6)
