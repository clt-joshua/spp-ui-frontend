---
m3_web_authority: https://m3.material.io/develop/web
material_web_docs: https://github.com/material-components/material-web/tree/main/docs
material_web_snapshot:
  version: 2.5.0
  commit: b4de401eb665ec63474f39319a4ba8f2145974cc
verified_at: 2026-08-25
compliance_required: true
---

# 공식 출처와 Baseline

> [!IMPORTANT]
> **Mandatory M3 Web Implementation Rule**
> 이 UI 시스템의 구현은 [Material Design 3 for Web](https://m3.material.io/develop/web)과 해당 페이지에서 공식 개발 문서로 연결하는 [Material Web 문서 전체](https://github.com/material-components/material-web/tree/main/docs)를 반드시 준수한다. 컴포넌트 anatomy, variant, size, color role, typography, shape, elevation, state layer, ripple, focus, motion, 접근성 및 반응형 동작은 공식 문서와 대조되어야 한다. Base UI 동작, 기존 코드, 테스트 또는 AI 생성 결과가 공식 문서와 충돌하면 공식 문서를 우선한다. 충돌을 임의로 해석하거나 테스트로 정당화하지 않고 `M3_WEB_SPEC_CONFLICT`로 기록한다.

## Baseline 식별자

| 항목 | 값 |
|---|---|
| 확인일 | 2026-08-25 |
| Material Web release | v2.5.0 |
| Git commit | `b4de401eb665ec63474f39319a4ba8f2145974cc` |
| 라이브 기준 | `material-web/docs@main` |
| snapshot 기준 | v2.5.0 commit의 `docs/` |
| Base UI 기준 | v1.7.0 |
| Material Color Utilities 기준 | v0.4.0 |

## 최상위 Web 출처

- [Material Design 3 for Web](https://m3.material.io/develop/web)
- [Material Web docs@main](https://github.com/material-components/material-web/tree/main/docs)
- [Material Web v2.5.0 snapshot](https://github.com/material-components/material-web/tree/b4de401eb665ec63474f39319a4ba8f2145974cc/docs)
- [Material Web roadmap](https://github.com/material-components/material-web/blob/main/docs/roadmap.md)
- [Material Web support](https://github.com/material-components/material-web/blob/main/docs/support.md)

M3 for Web 페이지의 2026-08-25 표시 내용은 Material Web이 유지보수 모드이고 M3 Expressive가 Web에 구현되지 않았다는 것이다. 이 상태가 바뀌면 Expressive 관련 ADR과 의존성 결정을 다시 검토한다.

## Material Web 일반·Theming 출처

- [Intro](https://github.com/material-components/material-web/blob/main/docs/intro.md)
- [Quick start](https://github.com/material-components/material-web/blob/main/docs/quick-start.md)
- [Sizes](https://github.com/material-components/material-web/blob/main/docs/size.md)
- [Theming overview](https://github.com/material-components/material-web/blob/main/docs/theming/README.md)
- [Color](https://github.com/material-components/material-web/blob/main/docs/theming/color.md)
- [Shape](https://github.com/material-components/material-web/blob/main/docs/theming/shape.md)
- [Typography](https://github.com/material-components/material-web/blob/main/docs/theming/typography.md)
- [Sass extensions](https://github.com/material-components/material-web/blob/main/docs/sass/sass-ext.md)

## Material Web 컴포넌트 출처

- [Buttons](https://github.com/material-components/material-web/blob/main/docs/components/button.md)
- [Icon buttons](https://github.com/material-components/material-web/blob/main/docs/components/icon-button.md)
- [Text field](https://github.com/material-components/material-web/blob/main/docs/components/text-field.md)
- [Checkbox](https://github.com/material-components/material-web/blob/main/docs/components/checkbox.md)
- [Select](https://github.com/material-components/material-web/blob/main/docs/components/select.md)
- [Dialogs](https://github.com/material-components/material-web/blob/main/docs/components/dialog.md)
- [Menus](https://github.com/material-components/material-web/blob/main/docs/components/menu.md)
- [Ripple](https://github.com/material-components/material-web/blob/main/docs/components/ripple.md)
- [Focus ring](https://github.com/material-components/material-web/blob/main/docs/components/focus-ring.md)
- [Elevation](https://github.com/material-components/material-web/blob/main/docs/components/elevation.md)
- [Icon](https://github.com/material-components/material-web/blob/main/docs/components/icon.md)

확장 카탈로그:

- [Chips](https://github.com/material-components/material-web/blob/main/docs/components/chip.md)
- [Divider](https://github.com/material-components/material-web/blob/main/docs/components/divider.md)
- [FAB](https://github.com/material-components/material-web/blob/main/docs/components/fab.md)
- [Lists](https://github.com/material-components/material-web/blob/main/docs/components/list.md)
- [Progress](https://github.com/material-components/material-web/blob/main/docs/components/progress.md)
- [Radio](https://github.com/material-components/material-web/blob/main/docs/components/radio.md)
- [Slider](https://github.com/material-components/material-web/blob/main/docs/components/slider.md)
- [Switch](https://github.com/material-components/material-web/blob/main/docs/components/switch.md)
- [Tabs](https://github.com/material-components/material-web/blob/main/docs/components/tabs.md)

## M3 디자인·컴포넌트 출처

- [Interaction states](https://m3.material.io/foundations/interaction/states/overview)
- [Motion](https://m3.material.io/styles/motion/overview)
- [Buttons](https://m3.material.io/components/buttons/overview)
- [Icon buttons](https://m3.material.io/components/icon-buttons/overview)
- [Text fields](https://m3.material.io/components/text-fields/overview)
- [Checkbox](https://m3.material.io/components/checkbox/overview)
- [Menus](https://m3.material.io/components/menus/overview)
- [Dialogs](https://m3.material.io/components/dialogs/overview)
- [Snackbar](https://m3.material.io/components/snackbar/overview)

Select는 Material Web의 공식 Select 문서를 Web 구현 기준으로 사용하고, Text field/Menu 및 관련 M3 foundation 문서로 시각·interaction 의미를 보완한다.

## Color Engine 출처

- [Material Color Utilities](https://github.com/material-foundation/material-color-utilities)
- [Creating a Color Scheme](https://github.com/material-foundation/material-color-utilities/blob/main/dev_guide/creating_color_scheme.md)
- [npm: @material/material-color-utilities](https://www.npmjs.com/package/@material/material-color-utilities)

Dynamic scheme은 source color, scheme variant, light/dark, contrast level을 입력으로 사용한다. MVP는 `SchemeTonalSpot`, contrast `0.0`과 `0.5`만 공개한다.

## Base UI 출처

- [About Base UI](https://base-ui.com/react/overview/about)
- [Quick start](https://base-ui.com/react/overview/quick-start)
- [Styling](https://base-ui.com/react/handbook/styling)
- [Animation](https://base-ui.com/react/handbook/animation)
- [Accessibility](https://base-ui.com/react/overview/accessibility)
- [Releases](https://base-ui.com/react/overview/releases)
- [Toast](https://base-ui.com/react/components/toast)

Base UI 문서는 구현 수단의 권위이며 M3 시각·컴포넌트 의미보다 우선하지 않는다.

## Host와 자산 출처

- [Vite Getting Started](https://vite.dev/guide/)
- [React](https://react.dev/)
- [Node.js releases](https://nodejs.org/en/about/previous-releases)
- [Material Icons Guide](https://developers.google.com/fonts/docs/material_icons)
- [Google Material Design Icons repository](https://github.com/google/material-design-icons)
- [Roboto metadata in Google Fonts](https://github.com/google/fonts/blob/main/ofl/roboto/METADATA.pb)

대표 host는 Vite이고 지원 runtime baseline은 Node.js 24.x다. Material Icons Filled와 Roboto Variable은 외부 CDN 요청 없이 self-host하며 adapter와 reference token을 통해 교체 가능성을 유지한다.

## CI와 visual regression 출처

- [GitHub setup-node](https://github.com/actions/setup-node)
- [pnpm/action-setup](https://github.com/pnpm/action-setup)
- [Playwright CI](https://playwright.dev/docs/ci)
- [Playwright Visual Comparisons](https://playwright.dev/docs/test-snapshots)

## 접근성 출처

- [WAI-ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)
- [Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- [Reduced Motion](https://developer.mozilla.org/docs/Web/CSS/@media/prefers-reduced-motion)
- [Forced Colors](https://developer.mozilla.org/docs/Web/CSS/@media/forced-colors)

## 라이선스

- Material Web: Apache-2.0
- Material Color Utilities: Apache-2.0
- Base UI: MIT
- Material Icons: Apache-2.0
- Roboto: SIL Open Font License 1.1

문서와 token을 참고하는 것과 source code를 복사하는 것을 구분한다. source를 복사·수정하는 경우 해당 라이선스와 attribution 의무를 별도로 검토한다. 본 계획은 Material Web 구현 코드를 제품에 복사하지 않는다.

## 갱신 절차

1. 릴리스 전 M3 for Web의 지원 상태 문구를 확인한다.
2. `material-web/docs@main`의 관련 파일 commit을 snapshot과 비교한다.
3. 변경된 Usage, Accessibility, Theming, API를 분류한다.
4. 영향 컴포넌트의 token, Storybook, 테스트, compliance record를 함께 갱신한다.
5. 공식 Web 지원 범위가 바뀐 경우 ADR을 추가한다.
6. 확인일과 snapshot commit을 모든 문서에서 같은 값으로 갱신한다.

라이브 문서와 snapshot이 다르고 영향이 확정되지 않으면 최신값을 임의 채택하지 않고 `M3_WEB_SPEC_CONFLICT` 또는 baseline review `BLOCKED`로 기록한다.
