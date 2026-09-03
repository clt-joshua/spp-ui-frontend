# Figma IconButton / MD3 교차 검증

- 관찰일: 2026-09-03
- Figma: `10724:16368` (`IconButton` guide), executable component set `10446:79757`
- 공식 근거: [M3 Icon buttons](https://m3.material.io/components/icon-buttons/overview), [Material Web current docs](https://github.com/material-components/material-web/blob/main/docs/components/icon-button.md), [Material Web pinned snapshot](https://github.com/material-components/material-web/blob/b4de401eb665ec63474f39319a4ba8f2145974cc/docs/components/icon-button.md)

## 판정

Figma의 실행 component set은 `3 size × 5 style × 5 state = 75`개 variant다. 공개 React API는 문서용 state prop 없이 size/style 축만 제공하고 enabled/hovered/focused/pressed/disabled는 native disabled와 실제 pointer·keyboard interaction으로 결정한다.

Stable Material Web의 standard, filled, filled tonal, outlined action/toggle 계약을 유지하면서 Figma의 32/24px density와 error style을 프로젝트 확장으로 추가했다. `error`는 input invalid 의미가 아니므로 `aria-invalid`를 만들지 않는다.

## Figma 실행 계약

| 축 | 값 | 적용 |
|---|---|---|
| Size | large / medium / small | container 40/32/24px, icon 24/20/16px, padding 8/6/4px |
| Style | standard / filled / tonal / outlined / error | system color role을 component token에서 연결 |
| State | enabled / hovered / focused / pressed / disabled | native/CSS interaction, StateLayer, Ripple, FocusRing |
| Shape | `radius/xxl` | component token을 통해 48px radius 사용 |
| Touch target | Figma visual size와 별도 | MD3 상호작용 계약에 따라 48×48px 유지 |

가이드 캡션은 40/32/24px를 `large/small/x-small`로 적지만 실행 component property는 `large/medium/small`이다. 코드 API는 자동화 가능한 실행 property를 권위로 사용한다.

## 색상과 disabled 우선순위

| Style | Enabled | Disabled |
|---|---|---|
| Standard | transparent / on-surface-variant | transparent / on-surface 38% |
| Filled | primary / on-primary | surface-container / on-surface 38% |
| Tonal | secondary-container / on-secondary-container | surface-container / on-surface 38% |
| Outlined | surface-container-lowest / outline-middle / on-surface-variant | 동일 container/outline / on-surface 38% |
| Error | error / on-error | surface-container / on-surface 38% |

hover/focus/pressed state layer는 Figma system color의 black 6%/12%/16%를 사용한다. disabled는 selected와 error보다 우선해 interactive feedback을 만들지 않는다.

## MD3 / Material Web 교차 검증

- current와 pinned 문서 모두 4개 표준 type, action과 toggle, selected icon, accessible label 계약이 동일하다.
- standard 기본 icon은 24px이고 filled/tonal/outlined 기본 container는 40×40px, icon은 24px, shape은 full이다.
- Figma의 error style과 32/24px visual density는 공식 public type이 아니므로 manifest deviation으로 기록했다.
- React adapter는 기존 프로젝트 정책대로 `type="button"`을 기본으로 하되 소비자가 `submit` 또는 `reset`을 명시할 수 있다.

## 검증 surface

- `/components`: 3 size × 5 style의 action, toggle, selected, disabled 60개 instance
- transient state: 각 Action instance에서 실제 hover, Tab focus, Space/Enter press로 확인
- unit: size/error data contract, toggle `aria-pressed`, selected accessible name, no automatic `aria-invalid`
- E2E: geometry, 48px hit target, role colors, disabled precedence, state layer, focus ring, keyboard ripple, toggle name/state

검증 결과는 `pnpm verify` PASS(7 suites, 29 unit tests, Vite/Storybook production build)와 Chromium/Firefox/WebKit 실제 Vite 흐름 39 tests PASS다.

Windows Contrast Themes의 실제 forced-colors 렌더링은 기존 프로젝트 gate로 남는다. Linux pixel baseline은 완료 조건이나 시각 권위로 사용하지 않는다.
