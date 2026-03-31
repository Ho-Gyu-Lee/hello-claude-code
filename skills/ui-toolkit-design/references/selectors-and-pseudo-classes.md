# USS 셀렉터 & 의사 클래스

## 셀렉터 종류

| 셀렉터 | 문법 | 예시 | 용도 |
|--------|------|------|------|
| 타입 | `TypeName` | `Button { }` | 특정 C# 타입 전체 (네임스페이스 생략) |
| 클래스 | `.class` | `.btn { }` | BEM 클래스 (가장 권장) |
| 이름 | `#name` | `#play-button { }` | 특정 요소 1개 |
| 와일드카드 | `*` | `* { }` | 전체 요소 (주의해서 사용) |
| 자식 | `A > B` | `.menu > .menu__item { }` | 직접 자식만 |
| 후손 | `A B` | `.menu .icon { }` | 모든 하위 요소 |
| 셀렉터 목록 | `A, B` | `.btn, .link { }` | 동일 스타일 적용 |

## 셀렉터 특이성 (Specificity)

```
#name > .class > TypeName
(높음)           (낮음)
```

동일 특이성일 경우, 나중에 정의된 규칙이 우선.

## 셀렉터 규칙

```css
/* 좋은 예: 단순 클래스 셀렉터 */
.btn { }
.btn--primary { }
.menu__item { }

/* 좋은 예: 자식 셀렉터 (최대 2단계) */
.menu > .menu__item { }

/* 나쁜 예: 깊은 후손 셀렉터 */
.screen .content .list .item .label { }

/* 나쁜 예: 와일드카드 끝 배치 */
.menu > * { }

/* 나쁜 예: 후손 + 와일드카드 조합 */
.screen * .label { }
```

**핵심 원칙:**
- BEM 클래스 셀렉터를 최우선 사용
- 타입 셀렉터(`Button`, `Label`)보다 클래스 셀렉터 선호
- 셀렉터 깊이 최대 2단계
- 후손 셀렉터(`A B`)보다 자식 셀렉터(`A > B`) 선호
- 와일드카드(`*`)는 셀렉터 끝이나 후손 조합에서 사용 금지

---

## 의사 클래스 (Pseudo-Classes)

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
/* 나쁜 예: 하위 요소가 많은 곳에서 후손 셀렉터 + :hover */
.yellow:hover > * > Button { }

/* 좋은 예: 직접 대상 요소에만 :hover */
.btn:hover { }
```

**멀티 플랫폼**: `:hover`는 터치 디바이스에서 동작하지 않는다.
반드시 `:active`를 함께 정의하여 터치에서도 피드백을 제공해야 한다.

```css
/* 멀티 플랫폼 대응: hover + active 모두 정의 */
.btn:hover { background-color: var(--color-primary-hover); }    /* PC 마우스 */
.btn:active { background-color: var(--color-primary-active); }  /* 터치 + 마우스 클릭 */
```
