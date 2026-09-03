# Figma Switch + Stable MD3 교차 검증

관찰일: 2026-09-03

## 결론

Figma `switch` section `10724:13609`와 executable component set `10467:34474` 중 small만 프로젝트 공개 `Switch`로 채택했다. large/medium과 공개 size 축은 제거하고, small의 `selected × state × Icon=true` 10개 조합을 generic component token으로 보존한다. binary state·form projection·keyboard·disabled/readOnly·focus·ripple은 Stable Material Web과 Base UI Switch behavior로 구현했다.

## 권위와 출처

- [Figma Switch `10724:13609`](https://www.figma.com/design/aQ2CfBMmc3q2qD2oDQcnjU/2026_Design-System--Renuwal-?node-id=10724-13609&m=dev)
- [M3 Switch overview](https://m3.material.io/components/switch/overview)
- [Material Web Switch current docs](https://github.com/material-components/material-web/blob/main/docs/components/switch.md)
- [Material Web Switch pinned docs](https://github.com/material-components/material-web/blob/b4de401eb665ec63474f39319a4ba8f2145974cc/docs/components/switch.md)
- [Material Web Switch behavior](https://github.com/material-components/material-web/blob/main/switch/internal/switch.ts)
- [Material Web Switch token surface](https://github.com/material-components/material-web/blob/main/tokens/_md-comp-switch.scss)
- [Stable Web v0.192 Switch values](https://github.com/material-components/material-web/blob/main/tokens/versions/v0_192/_md-comp-switch.scss)

## Variant inventory

| Axis | 값 | 조합 수 |
|---|---|---:|
| Size | `small` 고정, 공개 prop 없음 | 1 |
| Selected | `true`, `false` | 2 |
| State | `enabled`, `hovered`, `focused`, `pressed`, `disabled` | 5 |
| Icon | `true`만 존재 | 1 |
| 전체 | `1 × 2 × 5 × 1` | 10 |

hover/focus/pressed를 공개 prop으로 만들지 않는다. 공개 `selected/defaultSelected/onSelectedChange`와 실제 pointer/keyboard 입력이 실행 state를 만든다.

## Figma readback

| Size | Track | Handle | Icon | State layer | Figma target | Outline | Visual opacity |
|---|---|---|---|---|---|---|---|
| small | 32×18px | 12px | 12px | 24px | 28px | 1px | 100% |

small guide는 track 32×18px와 2px padding을 명시한다. 실제 제품 control은 이 시각 geometry와 별도로 최소 48px touch target을 제공한다.

| 상태 | Track/outline | Handle | Icon/state layer |
|---|---|---|---|
| selected enabled | `primary` | `on-primary` | check `on-primary-container` |
| selected interaction | `primary` | `primary-container` | hover black 6%, focus/pressed black 12% |
| unselected enabled | `surface-container-highest` / `outline-high` | `outline-high` | close `surface-container-highest` |
| unselected interaction | 같은 track | `on-surface-variant` | hover black 6%, focus/pressed black 12% |
| disabled selected | black 12% track | `surface` | check `on-surface` 38% |
| disabled unselected | black 12% track/outline | `on-surface` 38% | close `surface-container-highest` 38% |

Figma check/close export는 Material icon glyph와 시각적으로 일치하므로 만료되는 remote asset 대신 프로젝트의 self-hosted `MaterialIcon` adapter를 사용한다.

## MD3/Material Web 적용

- root는 `role=switch`, `aria-checked`, explicit accessible name을 제공한다.
- `selected`, `defaultSelected`, `onSelectedChange`를 controlled/uncontrolled 양쪽으로 제공한다. change details의 `cancel()`로 사용자 변경을 취소할 수 있다.
- hidden native checkbox가 `name`, `value`, `uncheckedValue`, `required`, `form`, disabled와 form submission을 담당한다.
- click, Space와 Enter가 상태를 바꾸며 disabled/readOnly에서는 선택과 ripple을 만들지 않는다.
- 32×18px 시각 track과 별도로 최소 48px touch target을 유지한다.
- hover/focus/pressed는 공통 StateLayer, pointer·keyboard Ripple, FocusRing으로 실제 입력에서만 발생한다.
- reduced motion에서는 handle/track 상태 전환을 즉시 반영하고 selection·form 결과는 유지한다.

## 의도적 차이

1. 제품 결정으로 Figma large/medium을 제거하고 32×18px small만 제공한다. 이 고밀도 anatomy는 Stable Material Web의 52×32px 기본 anatomy와 다른 프로젝트 deviation이다.
2. 채택한 small variant는 `Icon=true`이므로 check/close를 항상 표시한다. Material Web의 icon 없음과 selected-only icon API는 공개 API로 추정하지 않는다.
3. Figma는 black 6%/12%/12% state layer와 `outline-high`를 사용한다. Stable Material Web의 전체 semantic state token 조합 대신 명시적 Figma override로 기록한다.

## 검증 계약

- 단위: role/name/checked, controlled/uncontrolled, 취소 가능한 변경, Space/Enter, disabled suppression, native form value, interaction primitive 존재.
- 실제 Vite `/components`: 32×18px track, 12px handle/icon, 24px state layer, 1px outline, selected/unselected color, click/Space/Enter, disabled, hover/focus/pressed/ripple.
- Storybook: small 고정 selected/unselected/disabled 조합과 controlled selection.

## 남은 실환경 게이트

- Windows Contrast Themes에서 track, handle, selected, disabled, focus와 check/close 가시성을 확인한다.
- 위 결과 전에는 Switch manifest를 `PASS`로 승격하지 않는다. 별도 screen-reader blanket gate는 두지 않는다.

## 완료된 검증

- `pnpm.cmd verify`: PASS — structure 12 manifest entries, lint, typecheck, Vitest 7 suites/34 tests, Vite production build, Storybook production build.
- Switch 전용 Chromium/Firefox/WebKit: 3/3 PASS.
- 표준 `pnpm.cmd test:e2e`: Chromium/Firefox/WebKit 48/48 PASS. `/components`에서 small 고정 geometry, outline, color, click/Space/Enter, form, disabled, hover/focus/pressed/ripple을 실제 Vite 진입점으로 확인했다.
- Windows에서 동시 3-worker 실행 시 headless Firefox의 SWGL framebuffer/zero-frame timing 불안정이 관찰되어 로컬 Windows와 CI는 동일 검증 범위를 1 worker로 직렬 실행한다. 컴포넌트·브라우저·검증 항목은 제거하지 않았다.
