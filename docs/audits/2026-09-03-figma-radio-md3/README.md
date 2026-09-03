# Figma Radio + Stable MD3 교차 검증

관찰일: 2026-09-03

## 결론

Figma guide `10724:12073`와 executable component set `10466:24840`의 Radio를 프로젝트 공개 `Radio`/`RadioGroup` 세로 슬라이스로 변환했다. 실행 축 30개는 세 크기, 선택/미선택, 실제 hover/focus/pressed와 disabled로 보존하고, 선택 권위는 이름이 있는 단일 `RadioGroup` 값과 hidden native form input에 둔다.

자동 검증만으로 실제 screen reader의 group 위치·선택 announcement와 Windows Contrast Themes 렌더링을 확정할 수 없으므로 compliance 상태는 `BLOCKED`다. Linux screenshot은 현재 완료·CI 기준이 아니며 이 감사에도 새 baseline을 만들지 않는다.

## 권위와 출처

- Figma: [Radio guide `10724:12073`](https://www.figma.com/design/aQ2CfBMmc3q2qD2oDQcnjU/2026_Design-System--Renuwal-?node-id=10724-12073&m=dev)
- Figma executable set: `10466:24840`
- [M3 Radio button overview](https://m3.material.io/components/radio-button/overview)
- [Material Web Radio current docs](https://github.com/material-components/material-web/blob/main/docs/components/radio.md)
- [Material Web Radio current token surface](https://github.com/material-components/material-web/blob/main/tokens/_md-comp-radio.scss)
- [Material Web Radio pinned token snapshot](https://github.com/material-components/material-web/blob/b4de401eb665ec63474f39319a4ba8f2145974cc/tokens/versions/v0_192/_md-comp-radio-button.scss)
- [Material Web Radio pinned styles](https://github.com/material-components/material-web/blob/b4de401eb665ec63474f39319a4ba8f2145974cc/radio/internal/_radio.scss)

## Figma readback

| 축/속성 | 확인 값 |
|---|---|
| 실행 축 | `3 size × 2 selected × 5 state = 30` |
| API size | `large`, `medium`, `small` |
| guide caption | `large`, `small`, `x-small` — 실행 property와 불일치 |
| state | enabled, hovered, focused, pressed, disabled |
| icon | 24/20/16px |
| state layer | 36/32/24px |
| padding | 6/6/4px (`space/75`, `space/75`, `space/50`) |
| shape | `radius/full` |
| selected icon | `#007C8C`, system `primary` |
| unselected icon | `#3E474F`, system `on-surface-variant` |
| disabled icon | `on-surface-variant` 38% |
| hover | black 6% |
| focus | black 12% |
| pressed | Figma `state-layer/focused`, black 12% |

SVG export는 24px viewBox에서 20px outer circle과 10px inner circle을 사용한다. 같은 geometry를 `currentColor`로 바꿔 24/20/16px에 비례 축소했으며, 만료되는 원격 asset URL을 runtime에 남기지 않았다.

## Stable MD3/Material Web 교차 검증

일치하는 계약:

- 한 목록에서 한 항목만 선택한다.
- 같은 `name`을 사용하는 radio form value와 `checked`, `required`, `disabled` 의미를 유지한다.
- 가시 label과 이름이 있는 `radiogroup`을 제공한다.
- 선택 inner circle은 300ms emphasized-decelerate로 진입하고 50ms로 해제한다.
- 기본 icon 20px, focus ring 44px, touch target 48px의 Web 접근성 계약을 보존한다.
- forced-colors에서 enabled/selected/disabled를 CanvasText/Highlight/GrayText로 구분한다.

Figma override:

- Stable Material Web의 단일 20px icon/40px state layer 대신 세 크기와 36/32/24px state layer를 사용한다.
- Stable Material Web은 interaction에 semantic foreground state-layer 색상을 사용하지만 Figma는 black 6%/12%/12% overlay를 고정한다.
- Stable Material Web disabled icon은 `on-surface` 38%지만 Figma는 `on-surface-variant` 38%다.
- Figma guide caption과 executable size property가 다르므로 실행 property 이름을 공개 API 권위로 선택했다.

## 구현 결과

- `Radio`와 `RadioGroup`을 `src/ui/index.ts`에 공개했다.
- Base UI composite behavior와 hidden native input을 내부 primitive로 사용해 Tab/Arrow/Space와 form submission을 보존했다.
- `reference → space/gap/radius system → radio component token → CSS Module` 계층을 유지했다.
- `/components` Selection controls 영역에 세 크기의 enabled selected/unselected 및 disabled selected/unselected matrix와 실제 controlled group을 추가했다.
- Storybook matrix, unit form/keyboard contract, 3-browser 실제 Vite geometry/state/interaction E2E를 추가했다.
- compliance manifest에 current/pinned URL, 세 Figma deviation, screen-reader/forced-colors blocker를 기록했다.

## 남은 수동 게이트

1. 대표 screen reader/browser 조합에서 group 이름, 현재 위치, 선택 변경이 기대대로 announcement되는지 확인한다.
2. Windows Contrast Themes에서 selected/unselected/disabled icon과 44px focus ring이 구분되는지 확인한다.
3. 위 결과를 기록한 뒤 해당 blocker가 없는 경우에만 Radio manifest를 `PASS`로 승격한다.

## 자동·실앱 검증 결과

- `pnpm.cmd verify`: PASS — structure 10 manifest entries, lint, typecheck, Vitest 7 suites/31 tests, Vite production build, Storybook production build.
- `pnpm.cmd test:e2e`: PASS — Chromium/Firefox/WebKit 42/42.
- Radio 전용 실제 Vite 증거: 12개 gallery radio readback, 24/20/16px icon, 36/32/24px state layer, 48px touch target, primary/on-surface-variant/38% 색상, label/group description, click·ArrowRight 단일 선택, hover 6%, focus/pressed 12%, Space ripple, disabled ripple 0.
- 전체 대표 mobile axe 흐름: critical/serious 0, 375px horizontal overflow 0을 기존 전체 E2E에서 함께 재검증했다.
