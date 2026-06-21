---
name: unity-mobile-ui
description: Unity 모바일 게임 UI 개발. Canvas/RectTransform/UGUI/uGUI/모바일 UI/UI 배치/앵커/폰트/버튼 크기/Safe Area/Canvas Scaler 작업 시 자동 활성화. 레이아웃 스펙 선행 작성 → 실행 → 스크린샷 검증 루프 강제.
user-invocable: true
---

# Unity 모바일 UI 스킬

## CRITICAL — 절대 금지 (첫 줄부터 읽어라)

이 규칙을 어기면 결과가 틀린 채로 완료된다.

**크기 조절**
- `localScale` / `scale` 파라미터로 UI 요소 크기 조절 — 절대 금지
- 크기는 반드시 `RectTransform.sizeDelta` (Width/Height) 로만 조절한다
- UI 요소의 `localScale`은 항상 (1, 1, 1) — 예외 없음

**검증**
- 스크린샷 없이 UI 완료 선언 — 금지
- 레이아웃 스펙 없이 요소 배치 시작 — 금지
- 전체 UI를 한 번에 만들고 마지막에 확인 — 금지 (배치별 단계 검증 필수)

**위치/정렬**
- 정렬을 `anchoredPosition` 단독으로 처리 — 금지
- 정렬은 `anchorMin`/`anchorMax`로 결정하고 `anchoredPosition`은 미세 오프셋에만

---

## 필수 워크플로

### 1단계: 환경 파악 (건너뛰기 금지)

작업 전 Canvas 상태 확인:
- Canvas가 있는가? → 없으면 먼저 생성
- Canvas Scaler `uiScaleMode`가 `ScaleWithScreenSize(1)`인가? → Constant Pixel Size면 반드시 수정
- `referenceResolution`은? → 모바일 포트레이트 기본값: 1080×1920
- `matchWidthOrHeight`는? → 기본 0.5, 포트레이트 전용이면 1.0, 랜드스케이프 전용이면 0.0
- Safe Area 래퍼 패널이 있는가?

> 아래 도구 예시는 MCP 서버에 따라 시그니처가 다를 수 있다 — 실제 MCP 도구명과 파라미터로 조정하라.

```python
# 예시 (Unity-MCP 계열): Canvas 찾기
find_gameobjects(search_term="Canvas", search_method="by_component")
# → CanvasScaler 컴포넌트를 읽어 현재 설정 확인
```

### 2단계: 레이아웃 스펙 작성 (도구 호출 전 필수)

도구를 호출하기 전에 다음 형식으로 레이아웃을 텍스트로 정의한다.
요소가 3개 이상이면 사용자에게 보여주고 확인 후 진행한다.

```
[레이아웃 스펙]
참조 해상도: 1080×1920 / matchWidthOrHeight: 0.5
Safe Area 패널: 전체 stretch (0,0 → 1,1)

요소 목록:
- Header: anchor(0,1)→(1,1), height=140, anchoredPos=(0,-70)
- Title TMP: Header 하위, 중앙, fontSize=52
- 닫기 버튼: anchor(1,1)→(1,1), sizeDelta=(88,88), anchoredPos=(-44,-44)
- Content 패널: anchor(0,0)→(1,1), sizeDelta=(0,-300) [상단 140 + 하단 160]
- 확인 버튼: anchor(0.5,0)→(0.5,0), sizeDelta=(440,110), anchoredPos=(0,80), fontSize=40
```

### 3단계: 실행 + 검증 루프 (배치별 필수)

**배치 단위로 나누어 실행하고 배치마다 즉시 스크린샷 검증한다.**

```
배치 1: 컨테이너 패널 (Canvas, Safe Area, Header, Content, Footer 패널)
  → 스크린샷 분석: 패널이 올바른 영역을 점유하는가? 겹침 없는가?

배치 2: 텍스트 요소
  → 스크린샷 분석: 폰트가 기준값 이상인가? 텍스트가 잘리지 않는가?

배치 3: 버튼·인터랙티브 요소
  → 스크린샷 분석: 터치 타겟이 80×80 이상인가? 요소끼리 겹치지 않는가?
```

**스크린샷 호출 (MCP 서버에 맞게 조정):**
```python
# Unity-MCP 계열 예시
manage_camera(
    action="screenshot",
    capture_source="scene_view",
    view_target="Canvas",
    include_image=True,
    max_resolution=512
)
```

**배치 후 체크리스트 (모두 통과해야 다음 배치 진행):**
- [ ] 모든 요소가 Canvas 안에 있는가
- [ ] 요소끼리 겹치지 않는가
- [ ] 텍스트가 잘리지 않는가
- [ ] 버튼·터치 요소가 80×80 유닛 이상인가
- [ ] 폰트 크기가 아래 기준값 이상인가
- [ ] 이상 없으면 다음 배치, 이상 있으면 즉시 수정 후 재확인

---

## 모바일 기준값

### Canvas Scaler

| 항목 | 값 |
|------|-----|
| uiScaleMode | ScaleWithScreenSize (1) |
| referenceResolution | 1080 × 1920 (포트레이트) / 1920 × 1080 (랜드스케이프) |
| matchWidthOrHeight | 0.5 기본 / 포트레이트 전용: 1.0 / 랜드스케이프 전용: 0.0 |
| screenMatchMode | MatchWidthOrHeight (0) |

### 폰트 크기 (1080×1920 참조 해상도 기준)

| 용도 | 최솟값 | 권장값 |
|------|--------|--------|
| 제목 / 헤더 | 40 | 48–64 |
| 본문 / 버튼 레이블 | 28 | 32–44 |
| 보조 / 힌트 | 22 | 24–28 |
| 절대 금지 | 22 미만 | — |

- 텍스트는 항상 **TextMeshProUGUI** 사용
- Auto Size 사용 시 Min Size를 기준값 이상으로 고정

### 터치 타겟 최소 크기

- 버튼 / 인터랙티브 요소: **최소 80×80 유닛**
- 아이콘 버튼 (닫기, 뒤로가기): **최소 80×80** (시각 크기는 더 작아도 무방)
- 탭 메뉴 항목: **최소 높이 100**

### Canvas Render Mode

- 모바일 기본: **Screen Space - Overlay** (카메라 불필요, 오버헤드 최소)
- UI와 3D 오브젝트 교차 필요 시: Screen Space - Camera
- 다이어제틱 UI 전용: World Space

---

## RectTransform 크기·위치 규칙

### 크기 — sizeDelta만 사용

앵커가 동일점(center, corner 등)일 때 → sizeDelta = 실제 width, height

```python
# 올바름
component_type="RectTransform", properties={
    "sizeDelta": [300, 100],
    "anchorMin": [0.5, 0.5],
    "anchorMax": [0.5, 0.5],
    "anchoredPosition": [0, -50]
}

# 금지 — 절대 하지 말 것
action="modify", scale=[3, 1, 1]                          # X
component_type="Transform", property="localScale", ...    # X
component_type="RectTransform", property="localScale", ...# X
```

앵커가 stretch(0,0 → 1,1)일 때 → sizeDelta = 부모 대비 오프셋 (음수 = 부모보다 작음)

```python
# 부모보다 좌우 각 20 안쪽, 상하 딱 맞음
"anchorMin": [0, 0], "anchorMax": [1, 1],
"sizeDelta": [-40, 0], "anchoredPosition": [0, 0]
```

### 공통 앵커 패턴

```python
# 전체화면 stretch (배경, 루트 패널)
{"anchorMin": [0,0], "anchorMax": [1,1], "sizeDelta": [0,0], "anchoredPosition": [0,0]}

# 상단 바 (height H)
{"anchorMin": [0,1], "anchorMax": [1,1], "sizeDelta": [0,H], "anchoredPosition": [0,-H/2]}

# 하단 바 (height H)
{"anchorMin": [0,0], "anchorMax": [1,0], "sizeDelta": [0,H], "anchoredPosition": [0,H/2]}

# 화면 중앙 팝업
{"anchorMin": [0.5,0.5], "anchorMax": [0.5,0.5], "sizeDelta": [W,H], "anchoredPosition": [0,0]}

# 우상단 고정 (닫기 버튼 등)
{"anchorMin": [1,1], "anchorMax": [1,1], "sizeDelta": [80,80], "anchoredPosition": [-50,-50]}

# 하단 중앙 버튼
{"anchorMin": [0.5,0], "anchorMax": [0.5,0], "sizeDelta": [440,110], "anchoredPosition": [0,80]}
```

---

## Safe Area 처리

Canvas 직하위에 SafeAreaPanel을 두고 모든 UI를 그 안에 배치한다.

**구조:**
```
Canvas
└── SafeAreaPanel  ← SafeArea 스크립트 부착, anchor (0,0)→(1,1)
    └── [실제 UI 요소들]
```

**SafeArea.cs (MCP로 생성):**
```csharp
using UnityEngine;

public class SafeArea : MonoBehaviour
{
    void Awake() => Apply();

    void OnRectTransformDimensionsChange() => Apply(); // 방향 전환 대응

    void Apply()
    {
        var rt = GetComponent<RectTransform>();
        var sa = Screen.safeArea;
        rt.anchorMin = new Vector2(sa.x / Screen.width, sa.y / Screen.height);
        rt.anchorMax = new Vector2((sa.x + sa.width) / Screen.width,
                                   (sa.y + sa.height) / Screen.height);
    }
}
```

---

## 완료 선언 전 최종 체크

1. 스크린샷에서 모든 요소가 Canvas 안에 있는가
2. 요소 겹침이 없는가
3. 폰트 크기가 기준값 이상인가 (제목 40+, 본문 28+, 보조 22+)
4. 버튼·터치 요소가 80×80 이상인가
5. `localScale`이 (1,1,1)인가
6. Safe Area 패널을 통해 배치되었는가
7. Canvas Scaler가 ScaleWithScreenSize로 설정되어 있는가
