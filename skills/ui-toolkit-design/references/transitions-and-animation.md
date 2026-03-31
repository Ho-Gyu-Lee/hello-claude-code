# 트랜지션 & 애니메이션

USS 트랜지션은 CSS 트랜지션과 유사하게 프로퍼티 값을 시간에 따라 변경한다.

## 핵심 규칙: 트랜지션은 기본 상태에 선언

```css
/* 올바름: 기본 상태에 transition 선언 */
.btn {
    background-color: var(--color-primary);
    transition: background-color 250ms ease-in-out;
}
.btn:hover {
    background-color: var(--color-primary-hover);
}

/* 잘못됨: :hover에 transition 선언 (마우스 나갈 때 동작 안 함) */
.btn:hover {
    background-color: var(--color-primary-hover);
    transition: background-color 250ms ease-in-out;
}
```

## Longhand 프로퍼티

```css
.element {
    transition-property: background-color, scale, rotate;
    transition-duration: 250ms, 300ms, 200ms;
    transition-timing-function: ease-in-out, ease-out, linear;
    transition-delay: 0s, 50ms, 0s;
}
```

## Shorthand 문법

```css
/* transition: <property> <duration> <timing-function> <delay>; */
.element {
    transition: background-color 250ms ease-in-out,
                scale 300ms ease-out 50ms,
                rotate 200ms linear;
}
```

## 지원 타이밍 함수

| 함수 | 설명 |
|------|------|
| `ease` | 기본값. 느리게 시작 - 빠르게 - 느리게 끝 |
| `linear` | 일정한 속도 |
| `ease-in` | 느리게 시작 |
| `ease-out` | 느리게 끝 |
| `ease-in-out` | 느리게 시작, 느리게 끝 |
| `ease-in-cubic` | 큐빅 곡선 시작 |
| `ease-out-cubic` | 큐빅 곡선 종료 |
| `ease-in-out-cubic` | 큐빅 곡선 양쪽 |

## 트랜지션 단위 일치

값과 단위가 반드시 일치해야 한다:

```css
/* 잘못됨: translate 기본값은 0px인데 %로 전환 시도 */
.element { translate: 0px 0px; }
.element:hover { translate: 50% 0; }

/* 올바름: 동일한 단위 사용 */
.element { translate: 0px 0px; }
.element:hover { translate: 50px 0px; }
```

## 실전 패턴: 버튼 인터랙션

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
}
```

## 애니메이션: transform 우선, layout 지양

`translate`, `scale`, `rotate`는 GPU에서 직접 처리되어 레이아웃 재계산이 발생하지 않는다.

```css
/* 좋은 예: transform 기반 (GPU 처리, 레이아웃 재계산 없음) */
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

/* 나쁜 예: layout 프로퍼티 애니메이션 (매 프레임 재계산) */
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

## Usage Hints (C#)

```csharp
// 개별 요소 애니메이션 최적화
element.usageHints = UsageHints.DynamicTransform;

// 자식이 많은 컨테이너
container.usageHints = UsageHints.GroupTransform;
```

| Hint | 용도 |
|------|------|
| `DynamicTransform` | 개별 요소의 위치/transform 변경이 빈번할 때 |
| `GroupTransform` | 자식 요소가 많은 컨테이너를 통째로 애니메이션할 때 |

## C#에서 트랜지션 이벤트 처리

```csharp
element.RegisterCallback<TransitionEndEvent>(evt => {
    // 트랜지션 완료 후 처리
});
element.RegisterCallback<TransitionStartEvent>(evt => {
    // 트랜지션 시작 시 처리
});
```
