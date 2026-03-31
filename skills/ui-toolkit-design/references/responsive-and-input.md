# 반응형 디자인 & 멀티 플랫폼 입력

## PanelSettings: 해상도 스케일링

### Scale Mode 선택

| Scale Mode | 동작 | 권장 상황 |
|-----------|------|----------|
| **Scale With Screen Size** | 레퍼런스 해상도 기준으로 비례 스케일링 | **게임 UI 전반 (가장 권장)** |
| Constant Pixel Size | 1:1 픽셀 매핑, 스케일링 없음 | 에디터 도구, 디버그 UI |
| Constant Physical Size | DPI 기반 물리적 크기 유지 | 문서 뷰어 등 (비권장) |

### 레퍼런스 해상도

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

### Screen Match Mode

| Match 값 | 동작 | 적합한 경우 |
|----------|------|-----------|
| **0 (Width)** | 가로 기준 스케일링 | 가로 프로젝트 |
| **1 (Height)** | 세로 기준 스케일링 | 세로 프로젝트 |
| **0.5 (혼합)** | 가로/세로 절반씩 반영 | 가로/세로 비율이 다양할 때 |

---

## 주요 플랫폼별 해상도

**모바일 (세로 기준)**

| 등급 | 해상도 | 비율 | 대표 기기 |
|------|--------|------|----------|
| HD+ | 720x1600 | 20:9 | 보급형 Android |
| **FHD+** | **1080x2400** | **20:9** | **대부분의 Android (표준)** |
| FHD+ | 1170x2532 | 19.5:9 | iPhone 12~14 |
| QHD+ | 1440x3200 | 20:9 | Samsung Galaxy S 플래그십 |

**태블릿**: 768x1024 (4:3, iPad) ~ 2048x2732 (iPad Pro)
**PC/콘솔**: 1280x720 (HD) ~ 3840x2160 (4K)

**설계 시 반드시 테스트할 비율**: `16:9`, `20:9`, `4:3`

---

## 비율 변화에 안전한 레이아웃

### 고정 크기 사용 금지

```css
/* 고정 크기: 다른 해상도에서 깨짐 */
.panel { width: 400px; height: 800px; }

/* 유연한 크기: 모든 해상도에서 적응 */
.panel { flex-grow: 1; min-width: 300px; max-width: 600px; }
```

### 앵커 기반 배치

```css
.hud__top-left {
    position: absolute;
    left: var(--spacing-md);
    top: var(--spacing-md);
}
.hud__full-stretch {
    position: absolute;
    left: 0; top: 0; right: 0; bottom: 0;
}
```

### 종횡비 안전 레이아웃

```css
.screen__header { height: 60px; flex-direction: row; align-items: center; }
.screen__content { flex-grow: 1; padding: var(--spacing-md); }
.screen__footer { height: 50px; flex-direction: row; justify-content: center; }
```

### 비율별 레이아웃 분기

```css
/* 기본: 세로 (모바일 20:9) */
.inventory { flex-direction: column; }

/* 가로 충분 시 그리드 (태블릿 4:3, PC 16:9) */
.layout--wide .inventory { flex-direction: row; flex-wrap: wrap; }
.layout--wide .inventory__slot { flex-basis: 25%; max-width: 25%; }
```

---

## C# 기반 적응형 레이아웃

```csharp
void UpdateLayout()
{
    var root = document.rootVisualElement;
    float width = root.resolvedStyle.width;
    float height = root.resolvedStyle.height;
    float aspect = width / height;

    root.EnableInClassList("layout--mobile", width < 600);
    root.EnableInClassList("layout--tablet", width >= 600 && width < 1024);
    root.EnableInClassList("layout--desktop", width >= 1024);

    root.EnableInClassList("layout--portrait", aspect < 1.0f);
    root.EnableInClassList("layout--landscape", aspect >= 1.0f);
    root.EnableInClassList("layout--wide", aspect >= 1.6f);
    root.EnableInClassList("layout--ultrawide", aspect >= 2.0f);
}

void OnEnable()
{
    var root = GetComponent<UIDocument>().rootVisualElement;
    root.RegisterCallback<GeometryChangedEvent>(evt => UpdateLayout());
}
```

---

## Safe Area (모바일 노치/펀치홀)

내장 지원 없음. 커뮤니티 패키지 `artstorm/ui-toolkit-safe-area` 권장.

```csharp
private Rect _lastSafeArea;

void ApplySafeArea()
{
    var safeArea = Screen.safeArea;
    var root = document.rootVisualElement;

    root.style.paddingLeft = safeArea.x;
    root.style.paddingTop = Screen.height - safeArea.yMax;
    root.style.paddingRight = Screen.width - safeArea.xMax;
    root.style.paddingBottom = safeArea.y;
}

void Update()
{
    if (_lastSafeArea != Screen.safeArea)
    {
        _lastSafeArea = Screen.safeArea;
        ApplySafeArea();
    }
}
```

---

## 멀티 플랫폼 입력

**모바일(터치)이 주 플랫폼, PC(마우스)가 보조.**

### 입력 방식별 차이

| 항목 | 마우스 (PC) | 터치 (모바일) | 게임패드/키보드 |
|------|------------|--------------|----------------|
| Hover | :hover 동작 | 동작 안 함 | 동작 안 함 |
| 정밀도 | 높음 (1px) | 낮음 (~7mm) | 없음 (방향) |
| 최소 타겟 | 24px 이상 | **48dp 이상** | 포커스 영역 |
| 피드백 | hover -> active | active만 | **:focus 필수** |

### 터치 타겟 크기 (1920x1080 레퍼런스)

| 기준 | 물리 기준 | 1920x1080 기준 |
|------|----------|----------------|
| WCAG 2.2 (AA) | 24x24dp | -- |
| Apple HIG | 44x44pt | -- |
| **이 가이드라인** | -- | **최소 80x80px, 권장 96px+** |

### 인터랙션 스타일 (3단계 필수)

```css
.btn {
    background-color: var(--color-primary);
    color: white;
    min-height: 80px;
    transition: background-color var(--transition-fast) ease-in-out,
                scale var(--transition-fast) ease-out;
}
.btn:hover { background-color: var(--color-primary-hover); }
.btn:active { background-color: var(--color-primary-active); scale: 0.97; }
.btn:focus { border-width: 2px; border-color: var(--color-focus-ring); }
.btn:disabled { opacity: 0.5; }
```

### 게임패드/키보드 네비게이션

```xml
<ui:Button name="play-btn" tabindex="1" text="Play" />
<ui:Button name="settings-btn" tabindex="2" text="Settings" />
```

```csharp
// 초기 포커스 설정 (게임패드 필수)
void OnEnable()
{
    var root = GetComponent<UIDocument>().rootVisualElement;
    root.schedule.Execute(() => root.Q<Button>("play-btn")?.Focus());
}
```

### 플랫폼 감지

```csharp
void DetectInputMode(VisualElement root)
{
    bool isTouchDevice = Input.touchSupported && !Input.mousePresent;
    bool isGamepad = Gamepad.current != null;

    root.EnableInClassList("input--touch", isTouchDevice);
    root.EnableInClassList("input--mouse", !isTouchDevice && !isGamepad);
    root.EnableInClassList("input--gamepad", isGamepad);
}
```

```css
.input--touch .tooltip { display: none; }
.input--touch .btn { min-height: 80px; }
.input--gamepad .btn:focus { border-width: 4px; }
.input--mouse .btn { min-height: 64px; }
```

### 흔한 실수

| 실수 | 영향 | 해결 |
|------|------|------|
| :hover만 정의 | 모바일 피드백 없음 | hover + active 모두 정의 |
| :focus 없음 | 게임패드 위치 파악 불가 | 포커스 링 필수 |
| 버튼 64px 이하 | 터치 오탭 | 최소 80px |
| 우클릭 메뉴만 | 모바일 접근 불가 | 롱프레스 대안 |
| tabIndex 미설정 | 탐색 순서 비직관적 | 논리적 순서 지정 |
