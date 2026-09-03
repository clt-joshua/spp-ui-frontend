# Figma Button 구현 감사

관찰일: 2026-09-02

## 결론

Figma `button` component set `10429:72459`의 360개 variant 축을 프로젝트 Button API와 component token으로 변환했다. Size, Style, Contents type, Error는 공개 API·검증 페이지에 반영하고, Enabled/Hovered/Focused/Pressed/Disabled는 실제 native button 및 공통 interaction primitive가 결정한다.

Stable Material Web의 button semantics, form association, disabled, focus ring, pointer-origin/keyboard ripple을 유지한다. Figma의 medium/small density, error color, state layer와 custom color composition은 프로젝트 확장으로 manifest `deviations`에 기록했다. 프로젝트의 accidental submit 방지용 `type="button"` 기본값도 Material Web API 차이로 명시했다.

## 권위

- Figma: [button component set 10429:72459](https://www.figma.com/design/aQ2CfBMmc3q2qD2oDQcnjU/2026_Design-System--Renuwal-?node-id=10429-72459&m=dev)
- M3: [Buttons overview](https://m3.material.io/components/buttons/overview)
- Material Web: [Button documentation](https://github.com/material-components/material-web/blob/main/docs/components/button.md)
- Material Web source: [internal button](https://github.com/material-components/material-web/blob/main/button/internal/button.ts)
- Pinned snapshot: [button documentation at b4de401e](https://github.com/material-components/material-web/blob/b4de401eb665ec63474f39319a4ba8f2145974cc/docs/components/button.md)

## Figma readback

Metadata readback에서 360개 symbol을 확인했다.

| Axis | Values |
|---|---|
| Size | large, medium, small |
| Style | filled, outlined, text, elevated, tonal |
| State | enabled, hovered, focused, pressed, disabled |
| Error | false, true |
| Contents type | text only, left icon, right icon |

Contents type 조합은 Filled/Elevated/Tonal이 text only + left icon, Outlined/Text가 text only + left icon + right icon이다. 각 조합은 Error false/true와 State 5개를 모두 가진다.

| Size | Height | Inline padding | Icon | Icon-label gap | Typography |
|---|---:|---:|---:|---:|---|
| large | 40px | 20px | 18px | 8px | label-large 14/20/500/0.1px |
| medium | 32px | 16px | 16px | 4px | label-medium 12/16/500/0.5px |
| small | 24px | 12px | 16px | 4px | label-medium 12/16/500/0.5px |

색상과 상태:

- Filled: primary/on-primary, error/on-error
- Tonal: secondary-container/on-secondary-container, error-container/on-error-container
- Elevated: surface-container-low + primary label, error label, elevation 1
- Outlined: surface-container-lowest + outline-middle + on-surface, error outline/label
- Text: transparent + primary label, error label
- Hover/focus/pressed state layer: black 6%/12%/16%
- Filled/Tonal hover elevation 1, Elevated hover elevation 2
- Disabled Filled/Tonal/Elevated: surface-container-high + on-surface 38%
- Disabled Outlined Large: surface-container-lowest + surface-container-highest outline + outline-high 100%
- Disabled Outlined Medium/Small: surface-container-lowest + outline-middle + on-surface 38%
- Disabled Text: transparent + on-surface 38%

Figma 내부에서 disabled Outlined의 Large와 Medium/Small 토큰이 다르다. 이를 누락 없이 size별 component token으로 보존하며, 동일 표현으로 임의 정규화하지 않는다.

## 구현 계약

- `ButtonSize = 'large' | 'medium' | 'small'`, default `large`
- `ButtonVariant` 5종, default `filled`
- Filled는 최종 중요 action, Tonal/Outlined는 중간·대안 action, Text는 최저 우선순위 action, Elevated는 복잡한 배경 분리가 반드시 필요한 경우에만 사용한다.
- `error?: boolean`은 시각 축이며 `aria-invalid`를 자동 추가하지 않는다.
- leading/trailing icon은 하나만 허용한다. Figma matrix의 right icon 샘플은 Outlined/Text에만 노출한다.
- visual container가 24/32px여도 Material Web 방식의 48px touch target을 유지한다.
- hover/focus/pressed는 강제 state prop 없이 실제 pointer/keyboard 입력으로만 발생한다.
- disabled는 error보다 우선하며 ripple과 action을 만들지 않는다.
- Button CSS Module은 reference/system spatial token을 직접 소비하지 않고 component token만 사용한다.

## 실제 검증

- `pnpm.cmd typecheck`: PASS
- `pnpm.cmd test:unit`: 7 suites, 28 tests PASS
- `pnpm.cmd build`: PASS
- Chromium Button 전용 실제 Vite E2E: PASS
- 전체 `pnpm.cmd verify`: structure, lint, typecheck, 28 unit tests, Vite build, Storybook build PASS
- 전체 `pnpm.cmd test:e2e`: Chromium/Firefox/WebKit 33 tests PASS
- disabled Outlined size 교정 후 Large의 surface-container-highest/outline-high 100%와 Medium/Small의 outline-middle/on-surface 38% computed readback: PASS

Button compliance 상태는 구현과 자동 interaction 검증이 통과해도 Windows Contrast Themes 실제 forced-colors 확인 전까지 `BLOCKED`를 유지한다. 단순 native button이므로 별도 screen-reader 수동 gate는 추가하지 않는다.
