# Flex 레이아웃 시스템

UI Toolkit은 CSS Flexbox 서브셋을 사용한다. 기본 방향은 `column` (위에서 아래).
Unity의 box-sizing은 CSS의 `border-box`와 동일하다.

## 컨테이너 프로퍼티

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

## 아이템 프로퍼티

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

## 균등 분할 패턴

```css
/* 자식 요소를 동일한 크기로 분할 */
.equal-columns { flex-direction: row; }
.equal-columns > * {
    flex-grow: 1;
    flex-basis: 0;  /* 중요: basis를 0으로 해야 동일 분할 */
}
```

## Position

```css
/* relative(기본): 부모 기준 일반 흐름 */
.element { position: relative; }

/* absolute: 부모 기준 절대 위치 (흐름에서 벗어남) */
.overlay {
    position: absolute;
    left: 0; top: 0; right: 0; bottom: 0;
}
```

## 레이아웃 실전 패턴

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
