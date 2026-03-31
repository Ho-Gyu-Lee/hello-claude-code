# 성능 최적화 & 커스텀 컨트롤

## 커스텀 컨트롤 (Unity 6+)

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
        AddToClassList("health-bar");

        var fill = new VisualElement();
        fill.AddToClassList("health-bar__fill");
        Add(fill);
    }
}
```

```xml
<HealthBar name="player-health" max-health="200" current-health="150" bar-color="#00FF00" />
```

### 라이프사이클 이벤트

```csharp
public HealthBar()
{
    RegisterCallback<AttachToPanelEvent>(OnAttach);
    RegisterCallback<DetachFromPanelEvent>(OnDetach);
}
```

**주의**: Unity 6 이전의 `UxmlFactory`/`UxmlTraits` 패턴은 사용하지 않는다 (deprecated).

---

## 배칭 (Batching)

UI Toolkit은 동일한 GPU 요건을 가진 요소들을 배칭하여 드로우콜을 줄인다.
배칭이 깨지는 원인:

- **텍스처 전환**: 여러 텍스처 사용 시 배치 분리 -> 텍스처 아틀라스로 통합
- **머티리얼 전환**: 서로 다른 머티리얼 사용 시
- **클리핑 영역 변경**: overflow: hidden 등
- **마스킹 변경**: 라운드 코너 등 스텐실 버퍼 사용 시

### Uber Shader & 8텍스처 제한

하나의 배치에서 **최대 8개 텍스처**를 동시에 처리할 수 있다.

```
8개 이하 텍스처 -> 1 드로우콜 (배칭 유지)
9개 이상 텍스처 -> 배치 분리 -> 드로우콜 증가

대응:
- 텍스처 아틀라스로 여러 이미지를 하나로 통합
- 2D Sprite Atlas + Dynamic Texture Atlas 병행
- Frame Debugger로 배치 상태 확인
```

### Vertex Budget

Panel Settings의 **Vertex Budget**으로 초기 버텍스 버퍼 크기를 설정한다.
기본값 0(자동)이지만, 복잡한 UI에서는 수동 조절로 드로우콜을 줄일 수 있다.

### Dynamic Texture Atlas

UI Toolkit은 런타임에 여러 텍스처를 하나의 아틀라스로 자동 병합한다.

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
가능하면 직사각형 마스크 사용
마스크 중첩 최소화 — 평면 구조 유지
부모 하나에 마스크 적용 > 자식 개별 마스크
불가피한 다중 마스크: MaskContainer Usage Hint 적용
```

### 셀렉터 성능

```css
/* 빠름: 단순 클래스 셀렉터 */
.btn--primary { }

/* 보통: 자식 셀렉터 (깊이 제한) */
.menu > .menu__item { }

/* 느림: 깊은 후손 셀렉터 */
.screen .content .list .item .label { }

/* 매우 느림: 와일드카드 + 후손 조합 */
.screen * .label { }
```

### 레이아웃 성능

- **중첩 최소화**: 깊은 계층은 레이아웃 재계산 비용 증가
- **flex-grow/flex-shrink 적극 활용**: 고정 크기보다 유연한 레이아웃이 리사이징에 유리
- **불필요한 요소 제거**: 빈 VisualElement 래퍼 남발 금지
- **애니메이션**: `translate`/`scale`/`rotate` 사용. layout 프로퍼티 변경 금지

### 요소 표시/숨김 비교

| 방법 | 렌더링 | 레이아웃 | 용도 |
|------|--------|---------|------|
| `opacity: 0` | 있음 | 있음 | 페이드 트랜지션 중에만 |
| `visibility: hidden` | 없음 | **있음** | 공간 유지하며 숨김 |
| `display: none` | 없음 | 없음 | **일반적 숨김 (권장)** |
| `RemoveFromHierarchy()` | 없음 | 없음 | 비빈번 UI (다이얼로그 등) |

### 런타임 성능 팁

| 항목 | 권장 |
|------|------|
| 비활성 UI | `display: none` (레이아웃에서 완전 제거) |
| 간헐적 UI | `RemoveFromHierarchy()` (메모리까지 해제) |
| 오브젝트 풀링 | 비활성화(`SetEnabled(false)`) 먼저 -> 부모 변경 |
| 이미지 최적화 | 텍스처 아틀라스 사용, 8텍스처 제한 내에서 운용 |
| 전체화면 UI | 뒤 3D 씬 Camera 비활성화 고려 |
| Overdraw | 투명 요소 겹침 최소화, 가려진 요소는 display: none |
