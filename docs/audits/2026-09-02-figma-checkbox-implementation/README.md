# Figma Checkbox 구현 감사

관찰일: 2026-09-02

## 결론

Figma `checkbox` component set `10466:23091`의 90개 variant를 프로젝트 Checkbox API와 component token으로 변환했다. Size와 error는 공개 API로 추가하고, Figma의 type은 `checked`/`indeterminate`/`error` 조합으로 정규화했다. Enabled/Hovered/Focused/Pressed/Disabled는 실제 checkbox와 공통 interaction primitive가 결정한다.

Stable Material Web의 checkbox·form association, keyboard toggle, disabled, `aria-checked="mixed"`, focus ring과 ripple 동작을 유지한다. Figma의 세 크기와 error presentation은 현재 Stable Material Web 공개 API에 없는 프로젝트 확장이므로 manifest `deviations`에 기록했다.

## 권위

- Figma: [checkbox component set 10466:23091](https://www.figma.com/design/aQ2CfBMmc3q2qD2oDQcnjU/2026_Design-System--Renuwal-?node-id=10466-23091&m=dev)
- M3: [Checkbox overview](https://m3.material.io/components/checkbox/overview)
- Material Web: [Checkbox documentation](https://github.com/material-components/material-web/blob/main/docs/components/checkbox.md)
- Material Web source: [internal checkbox](https://github.com/material-components/material-web/blob/main/checkbox/internal/checkbox.ts)
- Material Web generated token source: [checkbox tokens](https://github.com/material-components/material-web/blob/main/tokens/versions/v0_192/_md-comp-checkbox.scss)
- Pinned snapshot: [checkbox documentation at b4de401e](https://github.com/material-components/material-web/blob/b4de401eb665ec63474f39319a4ba8f2145974cc/docs/components/checkbox.md)

## Figma readback

Metadata readback에서 90개 symbol을 확인했다.

| Axis | Values |
|---|---|
| Size | large, medium, small |
| Type | selected, indeterminate, unselected, error-selected, error-indeterminate, error-unselected |
| State | enabled, hovered, focused, pressed, disabled |

조합 수는 `3 × 6 × 5 = 90`이다.

| Size | Visual container | Icon canvas | Outline | Shape | State layer |
|---|---:|---:|---:|---:|---:|
| large | 16px | 24px | 2px | 2px | 36px |
| medium | 16px | 22px | 2px | 2px | 32px |
| small | 12px | 16.5px | 1.5px | 1.5px | 24px |

색상과 상태:

- Selected: primary container + on-primary icon
- Error selected/indeterminate: error container + on-error icon
- Unselected: on-surface-variant outline
- Error unselected: error outline
- Hover: black 6% state layer
- Focus: black 12% state layer
- Pressed: black 12% base state layer + ripple
- Disabled: visual control 38% opacity, selected는 on-surface container + surface icon, unselected는 on-surface-variant outline
- Disabled 표현은 error보다 우선한다.

## MD3 교차 검증

Stable Material Web 문서와 source는 checked, indeterminate, disabled, required, name/value, label association, form behavior와 `aria-checked="mixed"`를 권위 있는 동작으로 제공한다. 프로젝트 구현은 Base UI 내부 primitive를 통해 이 계약을 유지하고 `src/ui/index.ts`의 Checkbox adapter로만 공개한다.

Material Web generated token source의 기본 visual container/icon은 18px, state layer는 40px다. Figma는 3개 density에 대해 다른 geometry를 명시하므로 visual geometry만 component token으로 교체하고, 실제 조작 영역은 모든 크기에서 48px로 유지한다.

현재 Material Web Checkbox public API/token wrapper에는 error presentation이 없다. 프로젝트의 `error`는 Figma variant를 표현하는 명시적 확장이며, 접근 가능한 checkbox control에 `aria-invalid=true`를 설정하고 `errorText`를 `aria-describedby`로 연결한다. checked·indeterminate·form semantics는 error와 독립적으로 유지한다.

## 구현 계약

- `CheckboxSize = 'large' | 'medium' | 'small'`, default `large`
- Figma selected/indeterminate/unselected는 `checked`/`indeterminate`/기본 상태로 표현한다.
- Figma error type은 `error`와 selection state를 결합한다.
- `errorText`는 error일 때 일반 `supportingText`보다 우선한다.
- transient state를 고정하는 props는 만들지 않는다. hover/focus/pressed는 실제 pointer/keyboard 입력으로 발생한다.
- visual container가 12/16px여도 48px touch target을 유지한다.
- disabled는 error color보다 우선하고 ripple/action을 만들지 않는다.
- Checkbox CSS Module은 reference/system spatial token을 직접 소비하지 않고 component token만 사용한다.
- `/components`와 Storybook은 세 크기의 normal/error × unchecked/checked/indeterminate 및 disabled 대표 상태를 제공한다.

## 실제 검증

- 전체 `pnpm.cmd verify`: structure, lint, typecheck, Vitest 7 suites/29 tests, Vite build, Storybook build PASS
- Checkbox 전용 Chromium 실제 Vite E2E: geometry, centered icon canvas, error/mixed semantics, disabled precedence, hover/focus/pressed/ripple PASS
- 전체 `pnpm.cmd test:e2e`: Chromium/Firefox/WebKit 36 tests PASS
- 기존 Theme Lab Checkbox의 label 중심 정렬, 36px ripple surface, 350ms 선택·150ms 해제 motion 회귀: PASS

Checkbox compliance 상태는 구현과 자동 interaction 검증이 통과해도 mixed/error announcement의 실제 screen-reader 확인과 Windows Contrast Themes의 forced-colors 렌더링 확인 전까지 `BLOCKED`를 유지한다. DOM/axe는 접근성 tree 속성을 검증하지만 실제 음성 안내와 운영체제 고대비 렌더링 결과를 대신하지 않는다.
