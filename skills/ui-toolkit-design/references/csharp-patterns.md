# C# 바인딩 패턴

## 요소 조회

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

## 이벤트 등록

```csharp
// 클릭 (마우스 + 터치 + 키보드 Enter 모두 처리)
playButton.RegisterCallback<ClickEvent>(evt => OnPlay());

// 값 변경
var slider = root.Q<Slider>("volume-slider");
slider.RegisterValueChangedCallback(evt => SetVolume(evt.newValue));

// 리사이즈
element.RegisterCallback<GeometryChangedEvent>(evt => OnResize());

// 게임패드 대응
button.RegisterCallback<NavigationSubmitEvent>(evt => OnButtonClicked());
```

**규칙**: UXML에서 `name`을 부여한 요소만 코드에서 조회한다.
클래스로 조회(`Q(className: "...")`)는 여러 요소 일괄 처리 시에만 사용.

## 데이터 바인딩 (Unity 6+)

```xml
<!-- UXML에서 바인딩 경로 설정 -->
<ui:Label binding-path="playerName" />
<ui:ProgressBar binding-path="health" />
```

```csharp
// C#에서 데이터 소스 할당
var root = GetComponent<UIDocument>().rootVisualElement;
root.dataSource = playerDataSO; // ScriptableObject 등
```

**바인딩 모드**: `ToTarget` (데이터->UI), `ToSource` (UI->데이터), 양방향
**데이터 소스 상속**: 부모 요소의 dataSource가 자식에게 자동 전파됨

## 커스텀 네비게이션

```csharp
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

## 멀티 입력 주의사항

```csharp
// ClickEvent: 마우스 + 터치 + 키보드 모두 처리 (권장)
button.RegisterCallback<ClickEvent>(evt => OnButtonClicked());

// PointerDownEvent: 터치에서 문제 발생 가능 (꼭 필요한 경우에만)
button.RegisterCallback<PointerDownEvent>(evt => OnDragStart(evt));
```
