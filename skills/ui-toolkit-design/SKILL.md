---
name: ui-toolkit-design
description: Unity UI Toolkit (UXML/USS) 디자인 가이드라인. UXML, USS, UI Toolkit, UI Builder, VisualElement, UIDocument 관련 작업 시 자동 활성화. Unity UI 화면 생성, 스타일 작성, 레이아웃 구성 요청 시 사용.
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

### 디렉토리 구조

```
Assets/UI/
├── Documents/          # 화면별 UXML 파일
│   ├── MainMenu.uxml
│   ├── PlayerHUD.uxml
│   └── Settings.uxml
├── Styles/             # USS 파일
│   ├── Common.uss      # 공통 변수, 리셋
│   ├── Layout.uss      # 레이아웃 유틸리티
│   ├── Buttons.uss     # 버튼 스타일
│   └── Typography.uss  # 텍스트 스타일
└── Components/         # 공통 재사용 컴포넌트 (UXML 템플릿)
    ├── PlayerCard.uxml
    ├── DialogBox.uxml
    ├── InventorySlot.uxml
    └── SkillIcon.uxml
```

### 파일 네이밍

| 유형 | 규칙 | 예시 |
|------|------|------|
| UXML | PascalCase + 역할 | `MainMenu.uxml`, `PlayerHUD.uxml` |
| USS | PascalCase + 기능 단위 | `Buttons.uss`, `Layout.uss` |
| 컴포넌트 UXML | PascalCase + 컴포넌트명 | `PlayerCard.uxml`, `DialogBox.uxml` |

### 공통 컴포넌트 원칙 (필수)

**모든 컴포넌트는 `Components/` 에 한 벌만 만들고, 씬·컨텐츠 간 공유한다.**

```
❌ 금지: 씬/컨텐츠마다 동일 역할의 컴포넌트 중복 생성
   Documents/Shop/ItemSlot.uxml
   Documents/Inventory/ItemSlot.uxml   ← 중복!

✅ 필수: 하나의 컴포넌트를 여러 곳에서 Template/Instance로 재사용
   Components/ItemSlot.uxml            ← 한 곳에만 존재
```

**새 컴포넌트 생성 전 확인 절차:**
1. `Components/` 디렉토리에서 동일·유사 컴포넌트 검색
2. 기존 컴포넌트에 modifier 클래스로 변형 가능한지 검토
3. 변형 불가능할 때만 새 컴포넌트 생성

**변형이 필요한 경우 — modifier 클래스 활용:**
```xml
<!-- 같은 ItemSlot 컴포넌트, 다른 modifier -->
<Instance template="ItemSlot" name="shop-item" class="item-slot--shop" />
<Instance template="ItemSlot" name="inventory-item" class="item-slot--inventory" />
```

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

### 공통 컴포넌트 재사용 (UXML 중첩)

재사용 컴포넌트는 `Components/`에 한 벌만 만들고 `<Template>`과 `<Instance>`로 참조:

```xml
<ui:UXML xmlns:ui="UnityEngine.UIElements">
    <Template src="project://database/Assets/UI/Components/PlayerCard.uxml" name="PlayerCard" />

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

### 비주얼 스타일 원칙

**모바일 게임 UI는 심플하고 절제된 톤을 기본으로 한다.**
**범용 AI 안티패턴은 `rules/07-ui-design.md` 참조.**

```
❌ 금지 (AI가 흔히 생성하는 패턴):
- 네온 컬러 (rgb(0, 255, 255), rgb(255, 0, 255) 등)
- 강렬한 원색 (순수 파랑 rgb(0, 0, 255), 순수 빨강 rgb(255, 0, 0))
- 보라-파랑 그라데이션 (AI 기본 출력의 대표적 신호)
- 그라데이션 남용, 글로우/발광 효과
- 과도한 장식 (그림자 중첩, 두꺼운 테두리)
- 어두운 배경 + 네온 텍스트 (사이버펑크 스타일)
- 순수 검정(rgb(0,0,0)) / 순수 흰색(rgb(255,255,255)) 배경

✅ 권장:
- 프로젝트 아트 디렉션에서 정한 색상 팔레트 사용
- 넓은 여백, 깨끗한 배경
- 최소한의 장식 — 컨텐츠 자체가 돋보이는 구조
- 강조색은 1~2가지로 제한
- 색상을 모를 때는 플레이스홀더로 두고 아트팀에 확인
```

### 색상 대비 (필수)

**텍스트는 배경 위에서 반드시 읽혀야 한다.**

```
❌ 대비 부족 (절대 금지):
- 파란 배경 + 검정 텍스트
- 어두운 배경 + 어두운 텍스트
- 밝은 배경 + 밝은 텍스트
- 채도 높은 배경 + 채도 높은 텍스트

✅ 대비 확보:
- 어두운 배경 → 밝은(흰색 계열) 텍스트
- 밝은 배경 → 어두운(검정 계열) 텍스트
- 명도 대비 4.5:1 이상 (일반 텍스트), 3:1 이상 (큰 텍스트 36px+)
```

**원칙**: 배경색을 정했으면, 그 위에 올릴 텍스트 색상의 대비를 반드시 확인한다. 대비가 불충분하면 배경 또는 텍스트 색상을 조정한다.

### 변수 정의 (Common.uss)

아래는 **슬레이트/아이보리 기반 기본 템플릿**이다. 프로젝트 아트 디렉션에 맞게 교체하되, 변수 구조는 유지한다.

```css
:root {
    /* === 색상 (슬레이트/아이보리 기본 — 프로젝트에 맞게 교체) === */
    --color-primary: rgb(71, 85, 105);         /* 슬레이트 */
    --color-primary-hover: rgb(51, 65, 85);
    --color-primary-active: rgb(30, 41, 59);
    --color-secondary: rgb(100, 116, 139);     /* 밝은 슬레이트 */
    --color-danger: rgb(185, 78, 72);
    --color-warning: rgb(196, 160, 72);
    --color-text: rgb(51, 51, 51);
    --color-text-muted: rgb(130, 130, 135);
    --color-bg: rgb(255, 255, 245);            /* 아이보리 */
    --color-bg-secondary: rgb(245, 245, 235);  /* 진한 아이보리 */
    --color-bg-dark: rgb(30, 41, 59);          /* 다크 슬레이트 */
    --color-border: rgb(215, 215, 210);
    --color-focus-ring: rgb(71, 85, 105);

    /* === 간격 (1920×1080 레퍼런스 기준) === */
    --spacing-xs: 8px;
    --spacing-sm: 16px;
    --spacing-md: 24px;
    --spacing-lg: 40px;
    --spacing-xl: 64px;
    --spacing-2xl: 96px;

    /* === 폰트 크기 (1920×1080 레퍼런스 기준) === */
    --font-size-xs: 20px;
    --font-size-sm: 24px;
    --font-size-md: 28px;
    --font-size-lg: 36px;
    --font-size-xl: 48px;
    --font-size-2xl: 64px;

    /* === 둥글기 === */
    --border-radius-sm: 8px;
    --border-radius-md: 12px;
    --border-radius-lg: 20px;
    --border-radius-full: 9999px;

    /* === 트랜지션 === */
    --transition-fast: 150ms;
    --transition-normal: 250ms;
    --transition-slow: 400ms;

    /* === 그림자 (border 기반 시뮬레이션) === */
    --shadow-color: rgba(0, 0, 0, 0.08);
}
```

### 사이즈 기준 (1920×1080 레퍼런스, 필수)

**이 사이즈 값들은 웹이 아닌 모바일 게임 UI 기준이다.**
1920×1080 레퍼런스에서 모바일로 스케일링되어도 충분히 읽히고 터치 가능해야 한다.

**웹 CSS 사이즈(14px 본문, 48px 버튼)를 Unity에 그대로 사용하면 모바일에서 읽을 수 없다. 아래 최소값을 반드시 지킨다.**

| 요소 | 최소 크기 | 권장 크기 |
|------|----------|----------|
| 버튼 높이 | 80px | 96px |
| 리스트 아이템 높이 | 80px | 96px |
| 아이콘 버튼 | 64px (패딩 포함 80px) | 80px |
| 본문 텍스트 | 28px | 32px |
| 제목 텍스트 | 48px | 64px |
| 요소 간 간격 | 16px | 24px |
| 헤더/푸터 높이 | 96px | 120px |

```
❌ 절대 금지: 웹 CSS 기준 사이즈 (14px 본문, 48px 버튼)
   → 1920×1080 레퍼런스에서 모바일로 축소 시 읽기 불가능

✅ 필수: 모바일 게임 기준 사이즈 (28px+ 본문, 80px+ 버튼)
   → 모바일 스케일링 후에도 터치 가능하고 가독성 유지
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
    min-height: 80px;
    font-size: var(--font-size-md);
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
.btn--primary:focus { border-width: 3px; border-color: var(--color-focus-ring); }
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

### :hover 주의사항

**성능**: `:hover`는 포인터 이동 시마다 대상 요소의 전체 하위 계층을 무효화한다.

```css
/* ❌ 나쁜 예: 하위 요소가 많은 곳에서 후손 셀렉터 + :hover */
.yellow:hover > * > Button { }

/* ✅ 좋은 예: 직접 대상 요소에만 :hover */
.btn:hover { }
```

**멀티 플랫폼**: `:hover`는 터치 디바이스에서 동작하지 않는다.
`:hover`에만 의존하는 UI는 모바일에서 시각적 피드백이 사라진다.
반드시 `:active`를 함께 정의하여 터치에서도 피드백을 제공해야 한다.

```css
/* ✅ 멀티 플랫폼 대응: hover + active 모두 정의 */
.btn:hover { background-color: var(--color-primary-hover); }    /* PC 마우스 */
.btn:active { background-color: var(--color-primary-active); }  /* 터치 + 마우스 클릭 */

/* ❌ hover만 정의 → 모바일에서 피드백 없음 */
.btn:hover { background-color: var(--color-primary-hover); }
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
    min-height: 80px;
    font-size: var(--font-size-md);
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
.btn:focus {
    border-width: 3px;
    border-color: var(--color-focus-ring);
}
.btn:disabled {
    opacity: 0.5;
    /* SetEnabled(false) 시 Unity가 이벤트를 소비하지 않으므로
       :hover/:active가 자동으로 트리거되지 않음 — 별도 무효화 불필요 */
}
```

### 애니메이션: transform 우선, layout 지양

`translate`, `scale`, `rotate`는 GPU에서 직접 처리되어 레이아웃 재계산이 발생하지 않는다.
`width`, `height`, `top`, `left` 등 레이아웃 프로퍼티를 애니메이션하면 매 프레임 레이아웃 재계산이 발생한다.

```css
/* ✅ 좋은 예: transform 기반 (GPU 처리, 레이아웃 재계산 없음) */
.card {
    translate: 0px 0px;
    scale: 1;
    transition: translate var(--transition-normal) ease-out,
                scale var(--transition-fast) ease-out;
}
.card:hover {
    translate: 0px -4px;
    scale: 1.02;
}

/* ❌ 나쁜 예: layout 프로퍼티 애니메이션 (매 프레임 재계산) */
.card {
    top: 0px;
    width: 200px;
    transition: top 250ms, width 250ms;
}
.card:hover {
    top: -4px;
    width: 210px;
}
```

### Usage Hints (C#)

애니메이션이 필요한 요소에 Usage Hint를 설정하면 GPU 기반 처리로 전환된다:

```csharp
// 개별 요소 애니메이션 최적화
element.usageHints = UsageHints.DynamicTransform;

// 자식이 많은 컨테이너 — 부모에 설정하면 자식 전체에 적용
container.usageHints = UsageHints.GroupTransform;
```

| Hint | 용도 |
|------|------|
| `DynamicTransform` | 개별 요소의 위치/transform 변경이 빈번할 때 |
| `GroupTransform` | 자식 요소가 많은 컨테이너를 통째로 애니메이션할 때 |

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

### 정렬 필수 규칙

**자식 요소가 있는 모든 컨테이너에 `justify-content`와 `align-items`를 명시한다.**
생략하면 자식 요소가 뒤죽박죽으로 배치된다.

```css
/* ❌ 금지: 정렬 속성 없는 컨테이너 → 자식 배치 예측 불가 */
.card {
    flex-direction: row;
    padding: var(--spacing-md);
}

/* ✅ 필수: 정렬 속성 명시 → 자식이 중앙 정렬됨 */
.card {
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    padding: var(--spacing-md);
}
```

**아이콘 + 텍스트 조합** (가장 흔한 정렬 문제):
```css
/* 아이콘과 텍스트가 수직 중앙 정렬 */
.card__row {
    flex-direction: row;
    align-items: center;     /* 수직 중앙 — 이것이 없으면 뒤죽박죽 */
    justify-content: flex-start;
}
.card__icon {
    width: 48px;
    height: 48px;
    margin-right: var(--spacing-sm);
}
.card__text {
    font-size: var(--font-size-md);
    color: var(--color-text);
}
```

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

## 10. 성능 최적화

### 배칭 (Batching)

UI Toolkit은 동일한 GPU 요건을 가진 요소들을 배칭하여 드로우콜을 줄인다.
배칭이 깨지는 원인:

- **텍스처 전환**: 여러 텍스처 사용 시 배치 분리 → 텍스처 아틀라스로 통합
- **머티리얼 전환**: 서로 다른 머티리얼 사용 시
- **클리핑 영역 변경**: overflow: hidden 등
- **마스킹 변경**: 라운드 코너 등 스텐실 버퍼 사용 시

### Uber Shader & 8텍스처 제한

UI Toolkit은 단일 Uber Shader로 모든 UI를 렌더링한다.
하나의 배치에서 **최대 8개 텍스처**를 동시에 처리할 수 있다.

```
✅ 8개 이하 텍스처 → 1 드로우콜 (배칭 유지)
❌ 9개 이상 텍스처 → 배치 분리 → 드로우콜 증가

대응:
- 텍스처 아틀라스로 여러 이미지를 하나로 통합
- 2D Sprite Atlas + Dynamic Texture Atlas 병행
- Frame Debugger로 배치 상태 확인
```

### Vertex Budget

Panel Settings의 **Vertex Budget**으로 초기 버텍스 버퍼 크기를 설정한다.
기본값 0(자동)이지만, 복잡한 UI에서는 수동 조절로 드로우콜을 줄일 수 있다.

```
Panel Settings > Vertex Budget: 0 (기본, 자동)
→ UI 요소가 버퍼를 초과하면 추가 버퍼 생성 → 배치 분리 → 드로우콜 증가
→ 복잡한 UI: 값을 늘려서 단일 버퍼에 수용 (예: 20000)
→ Frame Debugger + Profiler로 최적값 탐색
```

### Dynamic Texture Atlas

UI Toolkit은 런타임에 여러 텍스처를 하나의 아틀라스로 자동 병합한다.
Panel Settings에서 설정하고, UI Toolkit Debugger의 **Dynamic Atlas Viewer**로 확인 가능.

- 2D Sprite Atlas: 정적/사전 정의 콘텐츠에 적합
- Dynamic Atlas: 런타임 변경이 잦은 경우에 적합
- 두 방식 병행 가능
- 아틀라스 단편화 시 `ResetDynamicAtlas()` API로 초기화

### 마스킹 성능

| 마스크 유형 | 배칭 영향 | 중첩 제한 |
|------------|----------|----------|
| **직사각형 마스크** | 배칭 유지 (셰이더 기반) | 제한 없음 |
| **라운드 코너/복잡 마스크** | 배칭 깨짐 (스텐실 버퍼) | 최대 7단계 |

```
✅ 가능하면 직사각형 마스크 사용
✅ 마스크 중첩 최소화 — 평면 구조 유지
✅ 부모 하나에 마스크 적용 > 자식 개별 마스크
✅ 불가피한 다중 마스크: MaskContainer Usage Hint 적용
```

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

셀렉터 성능은 `N1 × N2`로 결정된다:
- N1: 요소에 부여된 클래스 수
- N2: 적용 가능한 USS 파일 수

### 레이아웃 성능

- **중첩 최소화**: 깊은 계층은 레이아웃 재계산 비용 증가
- **flex-grow/flex-shrink 적극 활용**: 고정 크기보다 유연한 레이아웃이 리사이징에 유리
- **불필요한 요소 제거**: 빈 VisualElement 래퍼 남발 금지
- **애니메이션**: `translate`/`scale`/`rotate` 사용 (섹션 7 참고). layout 프로퍼티 변경 금지

### 요소 표시/숨김 비교

| 방법 | 렌더링 | 레이아웃 | 용도 |
|------|--------|---------|------|
| `opacity: 0` | 있음 | 있음 | 페이드 트랜지션 중에만 |
| `visibility: hidden` | 없음 | **있음** | 공간 유지하며 숨김 |
| `display: none` | 없음 | 없음 | **일반적 숨김 (권장)** |
| `RemoveFromHierarchy()` | 없음 | 없음 | 비빈번 UI (다이얼로그 등) |

```
⚠️ opacity: 0 이나 화면 밖 이동은 여전히 GPU/레이아웃 비용 발생
✅ 기본: display: none 사용
✅ 간헐적 UI (설정 팝업 등): RemoveFromHierarchy() → 필요 시 다시 Add
```

### 런타임 성능 팁

| 항목 | 권장 |
|------|------|
| 비활성 UI | `display: none` (레이아웃에서 완전 제거) |
| 간헐적 UI | `RemoveFromHierarchy()` (메모리까지 해제) |
| 오브젝트 풀링 | 비활성화(`SetEnabled(false)`) 먼저 → 부모 변경 |
| 이미지 최적화 | 텍스처 아틀라스 사용, 8텍스처 제한 내에서 운용 |
| 전체화면 UI | 뒤 3D 씬 Camera 비활성화 고려 |
| Overdraw | 투명 요소 겹침 최소화, 가려진 요소는 display: none |

---

## 11. 반응형 디자인 & 해상도 대응

**원칙**: 다양한 비율과 해상도에서 깨지지 않는 UI를 설계한다. **모바일이 주 플랫폼, PC가 보조.**

### 11-1. PanelSettings: 해상도 스케일링 (필수 설정)

UI Toolkit의 해상도 대응은 **PanelSettings** 에셋의 Scale Mode로 제어한다.

#### Scale Mode 선택 가이드

| Scale Mode | 동작 | 권장 상황 |
|-----------|------|----------|
| **Scale With Screen Size** | 레퍼런스 해상도 기준으로 비례 스케일링 | **게임 UI 전반 (가장 권장)** |
| Constant Pixel Size | 1:1 픽셀 매핑, 스케일링 없음 | 에디터 도구, 디버그 UI |
| Constant Physical Size | DPI 기반 물리적 크기 유지 | 문서 뷰어 등 (DPI 보고 부정확으로 비권장) |

#### 레퍼런스 해상도 (프로젝트 방향에 따라 설정)

프로젝트 시작 시 가로/세로 방향을 정하고 아래에 맞게 설정한다:

```
가로 프로젝트:
  Scale Mode: Scale With Screen Size
  Reference Resolution: 1920 x 1080
  Screen Match Mode: Match Width or Height

세로 프로젝트:
  Scale Mode: Scale With Screen Size
  Reference Resolution: 1080 x 1920
  Screen Match Mode: Match Width or Height
```

**기준이 FHD(1920×1080)인 이유:**
- PC 모니터 표준 해상도이며, 모바일 FHD+(1080×2400)와 짧은 변이 동일
- HD(720p)에서 자연스럽게 축소, QHD(1440p)/4K에서 자연스럽게 확대
- 모바일·태블릿·PC 전체에서 비례 스케일링이 안정적

#### Screen Match Mode: Match Width or Height

| Match 값 | 동작 | 적합한 경우 |
|----------|------|-----------|
| **0 (Width)** | 가로 기준 스케일링 | 가로 프로젝트 (가로가 기준축) |
| **1 (Height)** | 세로 기준 스케일링 | 세로 프로젝트 (세로가 기준축) |
| **0.5 (혼합)** | 가로·세로 절반씩 반영 | 가로/세로 비율이 다양할 때 |

```
⚠️ 주의: 주축과 다른 축의 비율 차이가 크면 UI가 늘어나거나 줄어들 수 있다.
         → flex-grow + min/max 크기로 유연하게 대응
         → C# EnableInClassList로 비율별 레이아웃 분기 (11-4 참고)
```

### 11-2. 대응해야 할 화면 해상도·비율

#### 주요 플랫폼별 해상도 (2024~2025 시장 기준)

**모바일 (세로 기준)**

| 등급 | 해상도 | 비율 | 대표 기기 |
|------|--------|------|----------|
| HD+ | 720×1600 | 20:9 | 보급형 Android |
| **FHD+** | **1080×2400** | **20:9** | **대부분의 Android (표준)** |
| FHD+ | 1170×2532 | 19.5:9 | iPhone 12~14 |
| FHD+ | 1179×2556 | 19.5:9 | iPhone 14 Pro, 15 |
| QHD+ | 1440×3200 | 20:9 | Samsung Galaxy S 플래그십 |

**태블릿**

| 해상도 | 비율 | 대표 기기 |
|--------|------|----------|
| 768×1024 | 4:3 | iPad (기본) |
| 810×1080 | 4:3 | iPad 10세대 |
| 1920×1200 | 16:10 | Android 태블릿 |
| 2048×2732 | 4:3 | iPad Pro |

**PC/콘솔**

| 해상도 | 비율 | 사용처 |
|--------|------|--------|
| 1280×720 | 16:9 | HD, 저사양 PC, Switch |
| **1920×1080** | **16:9** | **FHD (PC 표준)** |
| 2560×1440 | 16:9 | QHD |
| 3840×2160 | 16:9 | 4K UHD |
| 2560×1080 | 21:9 | 울트라와이드 |
| 3440×1440 | 21:9 | 울트라와이드 QHD |

#### 핵심 비율 요약

```
모바일:  20:9 (가장 보편) / 19.5:9 (iPhone)
태블릿:  4:3 (iPad) / 16:10 (Android)
PC:     16:9 (표준) / 21:9 (울트라와이드)
```

**설계 시 반드시 테스트할 비율**: `16:9`, `20:9`, `4:3`

### 11-3. 비율 변화에 안전한 레이아웃 패턴

#### 고정 크기 사용 금지

```css
/* ❌ 고정 크기: 다른 해상도에서 깨짐 */
.panel {
    width: 400px;
    height: 800px;
}

/* ✅ 유연한 크기: 모든 해상도에서 적응 */
.panel {
    flex-grow: 1;
    min-width: 300px;
    max-width: 600px;
}
```

#### 앵커 기반 배치 (절대 위치)

```css
/* 화면 비율이 변해도 안전한 배치 */
.hud__top-left {
    position: absolute;
    left: var(--spacing-md);
    top: var(--spacing-md);
}
.hud__bottom-center {
    position: absolute;
    bottom: var(--spacing-lg);
    left: 0; right: 0;
    align-items: center;
}
.hud__full-stretch {
    position: absolute;
    left: 0; top: 0; right: 0; bottom: 0;
}
```

#### 종횡비 안전 레이아웃 구조

```css
/* 헤더/푸터: 고정 높이, 가로는 채움 */
.screen__header {
    height: 60px;            /* 고정 */
    flex-direction: row;
    align-items: center;
    padding: 0 var(--spacing-md);
}

/* 콘텐츠: 남은 공간 전부 사용 (비율 무관) */
.screen__content {
    flex-grow: 1;            /* 핵심: 남은 영역 채움 */
    padding: var(--spacing-md);
}

/* 푸터: 고정 높이, 가로는 채움 */
.screen__footer {
    height: 50px;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}
```

#### 20:9 ↔ 4:3 비율 차이 대응

```css
/* 기본: 세로 레이아웃 (모바일 20:9에 최적) */
.inventory {
    flex-direction: column;
}

/* 가로가 충분하면 그리드로 전환 (태블릿 4:3, PC 16:9) */
.layout--wide .inventory {
    flex-direction: row;
    flex-wrap: wrap;
}
.layout--wide .inventory__slot {
    flex-basis: 25%;   /* 4열 그리드 */
    max-width: 25%;
}
```

### 11-4. C# 기반 적응형 레이아웃

```csharp
// 화면 비율 + 해상도에 따라 레이아웃 클래스 전환
void UpdateLayout()
{
    var root = document.rootVisualElement;
    float width = root.resolvedStyle.width;
    float height = root.resolvedStyle.height;
    float aspect = width / height;

    // 화면 크기 분기
    root.EnableInClassList("layout--mobile", width < 600);
    root.EnableInClassList("layout--tablet", width >= 600 && width < 1024);
    root.EnableInClassList("layout--desktop", width >= 1024);

    // 종횡비 분기 (세로가 긴지, 가로가 긴지)
    root.EnableInClassList("layout--portrait", aspect < 1.0f);
    root.EnableInClassList("layout--landscape", aspect >= 1.0f);
    root.EnableInClassList("layout--wide", aspect >= 1.6f);       // 16:9 이상
    root.EnableInClassList("layout--ultrawide", aspect >= 2.0f);  // 21:9 이상
}

// GeometryChangedEvent로 리사이징 시 자동 갱신
void OnEnable()
{
    var root = GetComponent<UIDocument>().rootVisualElement;
    root.RegisterCallback<GeometryChangedEvent>(evt => UpdateLayout());
}
```

```css
/* 가로/세로 모드별 레이아웃 */
.layout--portrait .sidebar { display: none; }
.layout--portrait .content { flex-direction: column; }
.layout--landscape .sidebar { width: 250px; display: flex; }
.layout--landscape .content { flex-direction: row; }

/* 울트라와이드: 양쪽 여백 추가 */
.layout--ultrawide .screen__content {
    max-width: 1600px;
    align-self: center;
}
```

### 11-5. Safe Area (모바일 노치/펀치홀 대응)

내장 지원 없음. 커뮤니티 패키지 사용 권장:
- `artstorm/ui-toolkit-safe-area` — UI Builder에서 커스텀 컨트롤로 사용

```csharp
// 필드 선언
private Rect _lastSafeArea;

// 수동 Safe Area 적용 (모든 모바일에서 필수)
// 주의: Screen.safeArea는 좌하단 원점, UI Toolkit은 좌상단 원점
void ApplySafeArea()
{
    var safeArea = Screen.safeArea;
    var root = document.rootVisualElement;

    // Safe Area 패딩 적용 (좌표계 변환 포함)
    root.style.paddingLeft = safeArea.x;
    root.style.paddingTop = Screen.height - safeArea.yMax;   // 상단 (노치/Dynamic Island)
    root.style.paddingRight = Screen.width - safeArea.xMax;
    root.style.paddingBottom = safeArea.y;                    // 하단 (홈 인디케이터)
}

// 화면 회전 시 재적용 필요
void Update()
{
    if (_lastSafeArea != Screen.safeArea)
    {
        _lastSafeArea = Screen.safeArea;
        ApplySafeArea();
    }
}
```

### 11-6. 해상도 대응 체크리스트

```
PanelSettings 설정:
  ☐ Scale Mode → Scale With Screen Size
  ☐ Reference Resolution → 가로 1920×1080 / 세로 1080×1920 (프로젝트 방향에 따라)
  ☐ Screen Match Mode → Match Width or Height

레이아웃 규칙:
  ☐ 고정 width/height 대신 flex-grow + min/max 사용
  ☐ 콘텐츠 영역은 flex-grow: 1로 남은 공간 채움
  ☐ 퍼센트(%) 기반 크기 또는 flex-basis 활용
  ☐ position: absolute 사용 시 앵커(left/right/top/bottom) 활용

비율 대응:
  ☐ 16:9 / 20:9 / 4:3 세 가지 비율에서 테스트
  ☐ 세로(portrait) / 가로(landscape) 모두 테스트
  ☐ C# EnableInClassList로 비율별 스타일 분기
  ☐ 울트라와이드(21:9) 시 max-width로 컨텐츠 제한

모바일 필수:
  ☐ Safe Area 패딩 적용 (노치/펀치홀/Dynamic Island)
  ☐ 화면 회전 시 Safe Area 재적용
```

---

## 12. 멀티 플랫폼 입력 대응

**모바일(터치)이 주 플랫폼, PC(마우스)가 보조.** 터치 기준으로 먼저 설계하고, PC 피드백을 추가한다.
PC 전용/모바일 전용으로 작성하면 다른 플랫폼에서 사용 불가능한 UI가 된다.

### 입력 방식별 차이점

| 항목 | 마우스 (PC) | 터치 (모바일) | 게임패드/키보드 |
|------|------------|--------------|----------------|
| Hover | ✅ `:hover` 동작 | ❌ 동작 안 함 | ❌ 동작 안 함 |
| 정밀도 | 높음 (1px 단위) | 낮음 (손가락 ~7mm) | 없음 (방향 이동) |
| 최소 타겟 | 24px 이상 | **48dp 이상** | 포커스 영역 |
| 피드백 | hover → active | active만 | **:focus 필수** |
| 스크롤 | 휠 + 드래그 | 스와이프 | 스틱/D-pad |
| 우클릭 | ✅ | ❌ (롱프레스 대체) | ❌ |

### 핵심 원칙: "가장 제한적인 입력에서 동작 보장"

```
개발 순서:
1. 터치(모바일) 기준으로 UI 설계 → 타겟 크기, active 피드백
2. 마우스(PC) 피드백 추가 → hover 상태
3. 게임패드/키보드 네비게이션 → focus 상태, tabIndex
```

### 터치 타겟 크기 가이드라인

1920×1080 레퍼런스 기준에서의 최소 크기. 모바일로 스케일링 후 물리적 터치 타겟이 충분해야 한다.

| 기준 | 물리 기준 | 1920×1080 레퍼런스 기준 |
|------|----------|----------------------|
| WCAG 2.2 (Level AA) | 24×24dp | — |
| Apple HIG | 44×44pt | — |
| Google Material | 48×48dp | — |
| **이 가이드라인 권장** | — | **최소 80×80px, 권장 96px 이상** |

```css
/* ✅ 터치 친화적 버튼 (1920×1080 레퍼런스 기준) */
.btn {
    min-height: 80px;
    min-width: 80px;
    font-size: var(--font-size-md);
    padding: var(--spacing-sm) var(--spacing-lg);
}

/* ✅ 작은 아이콘 버튼도 터치 영역 확보 */
.btn--icon {
    width: 48px;
    height: 48px;
    /* padding으로 80px 터치 영역 확보 */
    padding: 16px;
}

/* ❌ 터치 불가능한 작은 버튼 */
.btn--tiny {
    min-height: 40px;   /* 이 정도도 모바일에서 위험 */
    padding: 4px 8px;
}
```

### 요소 간 간격

터치 오류를 방지하기 위해 인터랙티브 요소 사이에 충분한 간격 필요:

```css
/* ✅ 인터랙티브 요소 간 최소 16px 간격 */
.btn + .btn {
    margin-left: var(--spacing-sm); /* 16px */
}

.list__item {
    min-height: 80px;
    padding: var(--spacing-sm) var(--spacing-md);
    /* 리스트 아이템 사이 구분선이 터치 버퍼 역할 */
    border-bottom-width: 1px;
    border-bottom-color: var(--color-border);
}
```

### 인터랙션 스타일 패턴 (3단계 필수)

모든 인터랙티브 요소에 **hover + active + focus** 세 가지를 반드시 정의:

```css
.btn {
    background-color: var(--color-primary);
    color: white;
    min-height: 80px;
    font-size: var(--font-size-md);
    border-radius: var(--border-radius-md);
    transition: background-color var(--transition-fast) ease-in-out,
                scale var(--transition-fast) ease-out;
}

/* 1) PC 마우스: hover 피드백 */
.btn:hover {
    background-color: var(--color-primary-hover);
}

/* 2) 터치 + 마우스 클릭: active 피드백 */
.btn:active {
    background-color: var(--color-primary-active);
    scale: 0.97;
}

/* 3) 게임패드/키보드: focus 피드백 (포커스 링) */
.btn:focus {
    /* 포커스 링: 접근성 필수 */
    border-width: 2px;
    border-color: var(--color-focus-ring);
}

/* 비활성: 모든 입력 공통 */
.btn:disabled {
    opacity: 0.5;
}
```

### 게임패드/키보드 네비게이션

#### tabIndex 설정

```xml
<!-- UXML: tabindex로 포커스 순서 제어 -->
<ui:Button name="play-btn" tabindex="1" text="Play" />
<ui:Button name="settings-btn" tabindex="2" text="Settings" />
<ui:Button name="quit-btn" tabindex="3" text="Quit" />

<!-- tabindex="0": 기본 순서 (visual tree DFS 순) -->
<!-- tabindex="-1": 포커스 순서에서 제외 (코드로만 포커스 가능) -->
```

#### 초기 포커스 설정 (게임패드 전용 게임 필수)

```csharp
// 씬 로드 후 첫 포커스 요소 지정
// — 이것이 없으면 게임패드로 탐색 시작점이 없음
void OnEnable()
{
    var root = GetComponent<UIDocument>().rootVisualElement;
    // schedule: UI 트리가 완전히 빌드된 후 실행
    root.schedule.Execute(() =>
    {
        root.Q<Button>("play-btn")?.Focus();
    });
}
```

#### NavigationMoveEvent (커스텀 네비게이션)

```csharp
// 기본 DFS 순서 대신 커스텀 네비게이션이 필요한 경우
element.RegisterCallback<NavigationMoveEvent>(evt =>
{
    switch (evt.direction)
    {
        case NavigationMoveEvent.Direction.Left:
            leftElement.Focus();
            evt.PreventDefault();
            break;
        case NavigationMoveEvent.Direction.Right:
            rightElement.Focus();
            evt.PreventDefault();
            break;
    }
});
```

### C# 이벤트 패턴: 멀티 입력 대응

```csharp
// ✅ ClickEvent: 마우스 클릭 + 터치 탭 + 키보드 Enter 모두 처리
button.RegisterCallback<ClickEvent>(evt => OnButtonClicked());

// ⚠️ PointerDownEvent 등은 터치에서 문제 발생 가능 (알려진 이슈)
// 꼭 필요한 경우에만 사용하고, 터치 테스트 필수
button.RegisterCallback<PointerDownEvent>(evt => OnDragStart(evt));

// ✅ 게임패드 대응: NavigationSubmitEvent
button.RegisterCallback<NavigationSubmitEvent>(evt => OnButtonClicked());
```

### 플랫폼 감지 및 적응

```csharp
// 런타임에 입력 방식 감지하여 UI 클래스 전환
void DetectInputMode(VisualElement root)
{
    bool isTouchDevice = Input.touchSupported && !Input.mousePresent;
    // requires: using UnityEngine.InputSystem;
    bool isGamepad = Gamepad.current != null;

    root.EnableInClassList("input--touch", isTouchDevice);
    root.EnableInClassList("input--mouse", !isTouchDevice && !isGamepad);
    root.EnableInClassList("input--gamepad", isGamepad);
}
```

```css
/* 입력 방식별 스타일 분기 */
.input--touch .tooltip { display: none; }          /* 터치: 툴팁 숨김 */
.input--touch .btn { min-height: 80px; }           /* 터치: 큰 타겟 */
.input--gamepad .btn:focus { border-width: 4px; }  /* 게임패드: 굵은 포커스 링 */
.input--mouse .btn { min-height: 64px; }           /* 마우스: 약간 컴팩트 허용 */
```

### 플랫폼별 주의사항 요약

| 흔한 실수 | 영향 | 해결 |
|-----------|------|------|
| `:hover`만 정의, `:active` 없음 | 모바일에서 피드백 없음 | hover + active 모두 정의 |
| `:focus` 스타일 없음 | 게임패드/키보드로 현재 위치 파악 불가 | 포커스 링 필수 |
| 버튼 크기 64px 이하 | 터치 오탭, 접근성 위반 | 최소 80px (1920×1080 기준) |
| 우클릭 메뉴만 제공 | 모바일에서 접근 불가 | 롱프레스 또는 대체 UI |
| 드래그 앤 드롭만 사용 | 터치 스크롤과 충돌 | 터치 시 버튼 기반 대안 제공 |
| Tooltip hover 전용 | 모바일에서 정보 접근 불가 | 탭 시 표시 또는 인라인 텍스트 |
| tabIndex 미설정 | 게임패드 탐색 순서 비직관적 | 논리적 순서로 tabIndex 지정 |
| 초기 포커스 미지정 | 게임패드 시작점 없음 | 씬 로드 시 Focus() 호출 |

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

### DESIGN.md 체크

```
☐ Assets/UI/DESIGN.md를 읽었는가?
☐ 색상/간격/폰트가 DESIGN.md에 정의된 값과 일치하는가?
☐ 새 컴포넌트를 만들었다면 DESIGN.md 컴포넌트 목록에 추가했는가?
☐ DESIGN.md가 없으면 사용자에게 생성을 제안했는가?
```

### UXML 체크

```
☐ 루트에 단일 컨테이너 (<ui:VisualElement>)
☐ 스타일은 <Style src="..."> 태그로만 연결
☐ 인라인 style 속성 없음
☐ 상호작용 요소에 고유한 name 속성 부여
☐ 클래스명이 BEM/kebab-case 패턴 준수
☐ 불필요한 깊은 중첩 없음 (최대 4-5단계)
☐ 재사용 컴포넌트는 Components/에서 Template/Instance로 참조
☐ 동일·유사 컴포넌트가 이미 Components/에 있는지 확인
☐ 인터랙티브 요소에 tabindex 속성 설정 (게임패드/키보드 대응)
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
☐ 고정 width/height 대신 flex-grow + min/max 사용 (해상도 대응)
☐ 콘텐츠 영역에 flex-grow: 1 적용 (비율 변화 대응)
☐ 애니메이션은 translate/scale/rotate 사용 (width/height/top/left 금지)
```

### 비주얼 스타일 체크

```
☐ 네온 컬러/강렬한 원색/보라-파랑 그라데이션 사용하지 않음
☐ 프로젝트 아트 디렉션에서 정한 색상 팔레트 사용
☐ 강조색 1~2가지 이내
☐ 과도한 장식 없음 (글로우, 그림자 중첩, 두꺼운 테두리)
☐ 색상을 모를 때 임의로 정하지 않고 플레이스홀더 사용
☐ 텍스트-배경 명도 대비 4.5:1 이상 확보
☐ 어두운 배경에 어두운 텍스트, 밝은 배경에 밝은 텍스트 없음
☐ 본문 텍스트 최소 28px, 제목 최소 48px (1920×1080 기준)
```

### 정렬 체크

```
☐ 자식이 있는 모든 컨테이너에 justify-content와 align-items 명시
☐ 아이콘 + 텍스트 조합에서 align-items: center 설정
☐ flex-direction이 명시되어 있음 (기본 column 의도 시에도 명시 권장)
```

### 바인딩 체크

```
☐ C#에서 접근할 요소에 name 속성 있음
☐ name이 kebab-case이고 패널 내 고유함
☐ Q<Type>("name") 패턴으로 조회 가능
☐ 이벤트 콜백 등록 패턴 준수
```

### 멀티 플랫폼 체크

```
☐ 인터랙티브 요소에 :hover + :active + :focus 모두 정의
☐ :hover에만 의존하는 기능/정보 없음 (모바일 대응)
☐ 버튼/터치 타겟 최소 80px (1920×1080 레퍼런스 기준)
☐ 인터랙티브 요소 간 최소 16px 간격
☐ 게임패드/키보드 탐색용 tabIndex 설정
☐ 초기 포커스 요소 지정 (Focus() 호출)
☐ ClickEvent 사용 (PointerDownEvent 대신, 터치 호환)
☐ 우클릭/Tooltip 등 PC 전용 기능에 모바일 대안 존재
```

### 성능 체크

```
☐ 이미지/텍스처 아틀라스 사용 (8텍스처 제한 내에서 운용)
☐ 불필요한 빈 VisualElement 래퍼 없음
☐ display: none으로 비활성 UI 처리 (opacity: 0 금지)
☐ 깊은 중첩 구조 없음
☐ 마스크는 직사각형 우선 (라운드 코너 최소화)
☐ 애니메이션 요소에 DynamicTransform/GroupTransform Usage Hint 적용
☐ 투명 요소 겹침(Overdraw) 최소화
```

---

## DESIGN.md 프로세스

### DESIGN.md란?

프로젝트의 UI 디자인 결정을 한 곳에 기록한 파일이다.
이 파일이 있으면 모든 UI 작업에서 일관된 색상, 간격, 컴포넌트, 스타일을 유지할 수 있다.

**위치**: `Assets/UI/DESIGN.md`

### 최초 생성 (프로젝트 시작 시)

`Assets/UI/DESIGN.md`가 없으면 사용자에게 생성을 제안하고, 아래 항목을 대화하며 채운다:

```markdown
# 프로젝트 UI 디자인 시스템

## 프로젝트 정보
- 프로젝트명: (프로젝트 이름)
- 방향: 가로 / 세로
- 기준 해상도: 1920×1080 / 1080×1920
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
- BG Dark: rgb(...)
- Border: rgb(...)
- Focus Ring: rgb(...)

## 타이포그래피
- 기본 폰트: (폰트명)
- 폰트 사이즈 스케일: xs(10) / sm(12) / md(14) / lg(18) / xl(24) / 2xl(32)

## 간격 체계
- xs: 4px / sm: 8px / md: 16px / lg: 24px / xl: 32px / 2xl: 48px

## 공통 컴포넌트 목록
| 컴포넌트 | 파일 | 용도 |
|----------|------|------|
| (예: ItemSlot) | Components/ItemSlot.uxml | 아이템 표시 슬롯 |

## 아트 디렉션 메모
- 스타일 키워드: (예: 심플, 미니멀, 판타지 등)
- 톤 앤 매너: (예: 슬레이트/아이보리 기반, 밝고 깨끗한 느낌)
- 참고: (참고 이미지/게임 링크 등)
```

**생성 절차:**
1. 사용자에게 프로젝트 방향(가로/세로), 스타일 키워드를 질문
2. 색상 팔레트가 정해져 있으면 기록, 없으면 플레이스홀더로 남김
3. `Assets/UI/DESIGN.md` 파일 생성
4. `Assets/UI/Styles/Common.uss`의 `:root` 변수도 DESIGN.md와 동기화

### 이후 참조 (모든 UI 작업 시)

```
UI 작업 시작 시:
1. Assets/UI/DESIGN.md 읽기
2. DESIGN.md에 정의된 색상/간격/폰트/컴포넌트 사용
3. 새 컴포넌트 추가 시 DESIGN.md 컴포넌트 목록도 갱신
4. 디자인 변경 시 DESIGN.md + Common.uss 함께 업데이트
```

### 갱신 시점

- 새 공통 컴포넌트 추가 시 → 컴포넌트 목록 갱신
- 색상/간격/폰트 변경 시 → 색상 팔레트 + Common.uss 동기화
- 아트 디렉션 변경 시 → 아트 디렉션 메모 업데이트

---

## 기존 프로젝트 패턴 우선

프로젝트에 이미 UXML/USS 파일이 있으면:

1. **`Assets/UI/DESIGN.md` 확인** → 있으면 이것을 기준으로 작업
2. DESIGN.md가 없으면 기존 파일 3-5개 읽기
3. 네이밍/구조/스타일링 패턴 분석
4. **기존 패턴을 이 가이드라인보다 우선** 적용
5. 패턴이 일관되지 않으면 이 가이드라인을 기준으로 통일 제안
6. **새 컴포넌트 생성 전 `Components/` 디렉토리에서 기존 컴포넌트 확인 필수**

---

## 관련 문서

- `rules/07-ui-design.md` - AI 안티패턴 금지, 접근성, 인터랙션 상태 (범용 UI 규칙)
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
- [Panel Settings](https://docs.unity3d.com/Manual/UIE-Runtime-Panel-Settings.html)
- [Optimizing Performance](https://docs.unity3d.com/6000.3/Documentation/Manual/best-practice-guides/ui-toolkit-for-advanced-unity-developers/optimizing-performance.html)
- [Runtime UI Performance](https://docs.unity3d.com/Manual/UIE-performance-consideration-runtime.html)
- [Scalable UI with UI Toolkit in Unity 6](https://unity.com/resources/scalable-performant-ui-uitoolkit-unity-6)
- [Focus System](https://docs.unity3d.com/6000.3/Documentation/Manual/UIE-focus-order.html)
- [Navigation Events](https://docs.unity3d.com/Manual/UIE-Navigation-Events.html)
- [FAQ: Input and Event Systems](https://docs.unity3d.com/Manual/UIE-faq-event-and-input-system.html)

### 접근성 가이드라인
- [WCAG 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- [WCAG 2.5.5 Target Size (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html)
- [Apple HIG - Touch Targets](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Material Design - Touch Targets](https://m3.material.io/foundations/accessible-design/accessibility-basics)
