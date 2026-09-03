---
m3_web_authority: https://m3.material.io/develop/web
material_web_docs: https://github.com/material-components/material-web/tree/main/docs
material_web_snapshot:
  version: 2.5.0
  commit: b4de401eb665ec63474f39319a4ba8f2145974cc
verified_at: 2026-08-25
compliance_required: true
---

# 토큰과 동적 Theme

> [!IMPORTANT]
> **Mandatory M3 Web Implementation Rule**
> 이 UI 시스템의 구현은 [Material Design 3 for Web](https://m3.material.io/develop/web)과 해당 페이지에서 공식 개발 문서로 연결하는 [Material Web 문서 전체](https://github.com/material-components/material-web/tree/main/docs)를 반드시 준수한다. 컴포넌트 anatomy, variant, size, color role, typography, shape, elevation, state layer, ripple, focus, motion, 접근성 및 반응형 동작은 공식 문서와 대조되어야 한다. Base UI 동작, 기존 코드, 테스트 또는 AI 생성 결과가 공식 문서와 충돌하면 공식 문서를 우선한다. 충돌을 임의로 해석하거나 테스트로 정당화하지 않고 `M3_WEB_SPEC_CONFLICT`로 기록한다.

## 토큰 계층

```text
Reference token
  concrete typeface, base metric, palette input
        ↓
System token
  semantic color, typescale, shape, elevation, state, motion
        ↓
Component token
  Button container, Dialog surface, TextField indicator, etc.
```

컴포넌트 CSS는 가능한 한 system token을 component token에 한 번 매핑하고, 실제 selector에서는 component token을 사용한다.

```css
:root {
  --md-filled-button-container-color: var(--md-sys-color-primary);
  --md-filled-button-label-text-color: var(--md-sys-color-on-primary);
  --md-button-container-shape: var(--md-sys-shape-corner-full);
}

.root {
  background: var(--md-filled-button-container-color);
  color: var(--md-filled-button-label-text-color);
  border-radius: var(--md-button-container-shape);
}
```

## Figma reference color palette

[Figma `md-ref-palette — WCAG`](https://www.figma.com/design/aQ2CfBMmc3q2qD2oDQcnjU/2026_Design-System--Renuwal-?node-id=10516-12295&m=dev)의 `md-ref-palette` variable collection을 프로젝트 reference color source로 사용한다. 프로젝트 표현은 `src/ui/tokens/reference.css`의 CSS custom property이며 Figma 원본 이름과 다음처럼 대응한다.

| Figma variable | Project token |
|---|---|
| `palettes/solid/azure/300` | `--md-ref-palette-azure-300` |
| `palettes/white` | `--md-ref-palette-white` |
| `alpha/black/100` | `--md-ref-palette-alpha-black-100` |
| `alpha/primary/normal` | `--md-ref-palette-alpha-primary-normal` |

계약:

- color token은 250개다: 18개 solid family × 12 tone, white/black 2개, alpha 32개다.
- solid family는 `azure`, `blue`, `indigo`, `purple`, `crimson`, `pink`, `gray`, `red`, `orange`, `peach`, `khaki`, `coral`, `warm-gray`, `teal`, `emerald`, `lime`, `moss`, `olive`다.
- tone은 Figma 원본의 방향을 보존한다. `25`가 가장 어둡고 `950`이 가장 밝다.
- `alpha/*`는 8자리 HEX를 보존한다. `alpha/primary/*`는 인접 solid tone으로 추정하거나 대체하지 않는다.
- 같은 collection의 `number/*` 18개는 color와 분리된 spatial reference primitive이며 아래 Figma spatial foundation 계약에서 사용한다.
- Figma의 WCAG W/B Pass/Fail 표시는 조합 선택 근거이지 semantic token이 아니다. system color는 승인된 role mapping에서 reference token을 참조하고, component token은 system color를 참조한다.
- reference value를 seed 결과로 가장하거나 system role에 임의 연결하지 않는다. Figma alias가 있는 built-in Standard/Light와 MCU가 담당하는 Dark·High·custom 경로를 명시적으로 구분한다.

## Figma system color

[Figma `md-sys-color — Normal Mode`](https://www.figma.com/design/aQ2CfBMmc3q2qD2oDQcnjU/2026_Design-System--Renuwal-?node-id=10671-5&m=dev)의 `md-sys-color` variable collection 중 해당 보드가 표현하는 color role을 system color 권위로 사용한다.

| Figma variable | Project token |
|---|---|
| `schemes/primary` | `--md-sys-color-primary` |
| `schemes/outline-high` | `--md-sys-color-outline-high` |
| `system/good-container` | `--md-sys-color-good-container` |
| `state-layer/table-selected` | `--md-sys-color-state-layer-table-selected` |

계약:

- color role은 mode마다 78개다: `schemes/*` 52개, `system/*` 20개, `state-layer/*` 6개다.
- Figma mode 8개 `normal`, `pink`, `yellowgreen`, `purple`, `blue`, `green`, `orange`, `red`를 동일 이름의 `data-theme-id` selector로 보존한다. 총 624개 mode-role mapping이다.
- system token은 `src/ui/tokens/system.css`에서 `--md-ref-palette-*`만 참조한다. Figma 원본이 alias가 아닌 직접값으로 정의한 Green mode의 `schemes/on-background = #171D1A` 한 건만 직접값을 보존한다.
- 같은 collection의 `radius/*` 8개, `gap/*` 17개, `space/*` 18개는 color role과 분리된 mode-invariant system token으로 아래 spatial foundation 계약에 정의한다.
- 기존 Stable M3 component token을 위한 `outline`, `outline-variant`, `shadow`는 각각 Figma `outline-high`, `outline-low`, opaque black을 참조하는 compatibility alias다. Figma source role 78개와 구분한다.
- built-in preset의 Standard/Light에서는 document root의 MCU inline color를 제거해 Figma CSS alias가 권위를 갖는다. Figma source에 없는 Dark·High contrast와 custom seed에서는 MCU TonalSpot core role을 inline 적용한다.
- component CSS는 system token을 selector에서 직접 소비하지 않고 component token으로 한 번 매핑한다. 따라서 built-in preset 전환은 기존 Button, field, Select, Dialog, Menu, Snackbar와 Portal에 동일하게 전파된다.

## Figma spatial foundation

다음 Figma 보드와 실제 local variable을 공간·모서리 system token의 권위로 사용한다.

- [Radius Tokens, node `10431:190`](https://www.figma.com/design/aQ2CfBMmc3q2qD2oDQcnjU/2026_Design-System--Renuwal-?node-id=10431-190&m=dev)
- [Spacing Tokens, node `10663:6049`](https://www.figma.com/design/aQ2CfBMmc3q2qD2oDQcnjU/2026_Design-System--Renuwal-?node-id=10663-6049&m=dev)
- [Gap Tokens, node `10663:6146`](https://www.figma.com/design/aQ2CfBMmc3q2qD2oDQcnjU/2026_Design-System--Renuwal-?node-id=10663-6146&m=dev)

Figma 구조를 `number reference → radius/space/gap system → component`로 보존한다. Figma variable collection 이름은 현재 `md-sys-color`지만, 프로젝트에서는 color와 spatial 의미를 섞지 않고 별도 prefix로 분리한다. 8개 color mode에서 alias와 최종값이 모두 동일하므로 spatial token은 theme selector마다 중복하지 않고 `:root`에 한 번 선언한다.

| Figma reference | Project reference | 값 |
|---|---|---:|
| `number/2…16` | `--md-ref-number-2…16` | 2, 4, 6, 8, 10, 12, 14, 16px |
| `number/20`, `number/24` | `--md-ref-number-20`, `--md-ref-number-24` | 20, 24px |
| `number/32…72` | `--md-ref-number-32…72` | 32, 36, 40, 48, 56, 64, 72px |
| `number/999` | `--md-ref-number-999` | 999px |

CSS에서는 `1rem = 16px`로 변환해 저장한다. 이 18개 reference 값은 직접 컴포넌트 selector에서 소비하지 않는다.

| Step | `25` | `50` | `75` | `100` | `125` | `150` | `175` | `200` | `250` | `300` | `400` | `450` | `500` | `600` | `700` | `800` | `900` | `950` |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| px | 2 | 4 | 6 | 8 | 10 | 12 | 14 | 16 | 20 | 24 | 32 | 36 | 40 | 48 | 56 | 64 | 72 | 999 |

- `--md-sys-space-*`는 18개 step 전체를 제공한다. component 내부 padding, margin, inset처럼 한 요소의 공간을 정할 때 사용한다.
- `--md-sys-gap-*`는 `25…900` 17개다. flex/grid의 형제 요소 간 separation에만 사용하며 Figma에 없는 `gap/950`을 만들지 않는다.
- `--md-sys-radius-*`는 `xxs=4`, `xs=8`, `s=12`, `m=16`, `l=24`, `xl=32`, `xxl=48`, `full=999px`의 8개다. 보드 표기는 `radius/fully`지만 실제 local variable 이름 `radius/full`을 project key의 권위로 사용한다.
- component token은 system spatial token을 참조하고 CSS Module selector는 component token만 소비한다. icon size, border width, component height, motion distance를 비슷한 spatial step에 임의 스냅하지 않는다.
- Stable M3 shape compatibility role은 값이 정확히 일치할 때만 alias한다. `extra-small=xxs`, `small=xs`, `medium=s`, `large=m`, `full=full`이며, Figma 목록에 없는 Dialog `extra-large=28px`는 24px 또는 32px로 근사하지 않고 M3 compatibility 값으로 유지한다.

```css
:root {
  --md-ref-number-16: 1rem;
  --md-sys-space-200: var(--md-ref-number-16);
  --md-sys-gap-200: var(--md-ref-number-16);
  --md-sys-radius-m: var(--md-ref-number-16);

  --md-dialog-content-gap: var(--md-sys-gap-200);
  --md-menu-item-leading-space: var(--md-sys-space-200);
}
```

## Figma elevation effect styles

[Effect Styles — Elevation, node `10427:2344`](https://www.figma.com/design/aQ2CfBMmc3q2qD2oDQcnjU/2026_Design-System--Renuwal-?node-id=10427-2344&m=dev)의 local Effect Style 5개를 `--md-sys-elevation-level1…5`로 변환한다. 각 style은 Figma effect 배열 순서를 보존한 두 개의 `DROP_SHADOW` layer다. 프로젝트의 `level0`은 shadow가 없는 `none`이다.

| Level | `alpha/black/100` layer | `alpha/black/300` layer |
|---|---|---|
| 1 | `0 1px 3px 1px` | `0 1px 2px 0` |
| 2 | `0 2px 6px 2px` | `0 1px 2px 0` |
| 3 | `0 1px 3px 0` | `0 4px 8px 3px` |
| 4 | `0 2px 3px 0` | `0 6px 10px 4px` |
| 5 | `0 4px 4px 0` | `0 8px 12px 6px` |

Figma 보드의 설명 문구는 두 alpha를 15%/30%로 적고 있지만, 실제 Effect Style의 bound variable과 resolved RGBA는 각각 `alpha/black/100 = #0000001F`(12%), `alpha/black/300 = #00000052`(32%)다. 실행 가능한 local style binding을 권위로 사용하며 문구의 15%/30%로 재계산하지 않는다. component는 기존 `--md-*-container-elevation`에서 system level을 선택하고 selector는 그 component token을 사용한다.

## Theme 계약

```ts
export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemeVariant = 'tonalSpot';
export type ContrastMode = 'standard' | 'high';

export interface ThemeConfig {
  themeId: string;
  seedColor: `#${string}`;
  mode: ThemeMode;
  contrast: ContrastMode;
  variant: ThemeVariant;
  generatorVersion: 'md3-theme-v1';
}

export interface ThemeContextValue {
  config: ThemeConfig;
  resolvedMode: 'light' | 'dark';
  setThemePreset(id: string): void;
  setSeedColor(color: `#${string}`): void;
  setMode(mode: ThemeMode): void;
  setContrast(contrast: ContrastMode): void;
  resetTheme(): void;
}
```

## 프리셋

| ID | Label | Seed |
|---|---|---|
| `normal` | Normal | `#007C8C` |
| `pink` | Pink | `#9A0057` |
| `yellowgreen` | Yellow Green | `#4F6D36` |
| `purple` | Purple | `#794F9E` |
| `blue` | Blue | `#0051B0` |
| `green` | Green | `#13804D` |
| `orange` | Orange | `#913304` |
| `red` | Red | `#9C000B` |

표의 seed는 각 Figma mode의 `schemes/primary`가 참조하는 reference color다. Standard/Light 결과는 Figma alias를 직접 사용한다. 같은 seed의 MCU 생성은 Dark·High contrast fallback과 custom seed에만 사용한다.

## Color Engine

Material Color Utilities의 권장 dynamic scheme API를 한 모듈에 격리한다.

```ts
import {
  argbFromHex,
  hexFromArgb,
  Hct,
  SchemeTonalSpot,
} from '@material/material-color-utilities';

const contrastLevels = {
  standard: 0,
  high: 0.5,
} as const;

export function createScheme(
  seedColor: `#${string}`,
  dark: boolean,
  contrast: ContrastMode,
) {
  const source = Hct.fromInt(argbFromHex(seedColor));
  return new SchemeTonalSpot(source, dark, contrastLevels[contrast]);
}

export function generateColorScheme(config: ThemeConfig) {
  return {
    light: extractRoles(createScheme(config.seedColor, false, config.contrast)),
    dark: extractRoles(createScheme(config.seedColor, true, config.contrast)),
  };
}
```

MCU API는 `color-engine.ts` 밖에서 직접 호출하지 않는다. 라이브러리 API가 바뀌면 adapter와 golden fixture만 갱신한다.

## 필수 color role

`extractRoles()`는 최소 다음 role을 반환한다.

- Primary: `primary`, `onPrimary`, `primaryContainer`, `onPrimaryContainer`
- Secondary: `secondary`, `onSecondary`, `secondaryContainer`, `onSecondaryContainer`
- Tertiary: `tertiary`, `onTertiary`, `tertiaryContainer`, `onTertiaryContainer`
- Error: `error`, `onError`, `errorContainer`, `onErrorContainer`
- Surface: `surface`, `surfaceDim`, `surfaceBright`, `surfaceContainerLowest`, `surfaceContainerLow`, `surfaceContainer`, `surfaceContainerHigh`, `surfaceContainerHighest`
- Content: `onSurface`, `onSurfaceVariant`
- Outline: `outline`, `outlineVariant`
- Inverse: `inverseSurface`, `inverseOnSurface`, `inversePrimary`
- Fixed: primary/secondary/tertiary의 `Fixed`, `FixedDim`, `OnFixed`, `OnFixedVariant`
- Utility: `scrim`, `shadow`, `surfaceTint`

각 MCU role을 `--md-sys-color-<kebab-case>`로 변환한다. Figma preset 경로는 CSS alias 78개를 사용하고, MCU 경로는 core role을 document root inline style에 적용한다. 한 JavaScript task 안에서 기존 inline role을 제거·설정하고 data attribute를 갱신해 container와 on-color가 다른 scheme으로 보이는 중간 paint를 방지한다.

## State token

안정 Web baseline:

```css
:root {
  --md-sys-state-hover-state-layer-opacity: 0.08;
  --md-sys-state-focus-state-layer-opacity: 0.10;
  --md-sys-state-pressed-state-layer-opacity: 0.10;
  --md-sys-state-dragged-state-layer-opacity: 0.16;
  --md-sys-state-disabled-content-opacity: 0.38;
}
```

Stable M3 component의 State layer 색상은 현재 content/on-color에서 가져오고 opacity 값은 seed color에 따라 재생성하지 않는다. Figma `state-layer/*` 6개는 제품의 generic overlay와 table selection용 system color로 별도 노출하며, 기존 M3 interaction primitive의 content-color × opacity 계약을 대체하지 않는다.

## Typography token

- reference: `--md-ref-typeface-brand`, `--md-ref-typeface-plain`
- 기본 reference input은 self-hosted `Noto Sans Variable`이며 `--app-font-brand`, `--app-font-plain`을 override해 교체한다.
- system authority는 Figma [`text-styles` node `10425:2587`](https://www.figma.com/design/aQ2CfBMmc3q2qD2oDQcnjU/2026_Design-System--Renuwal-?node-id=10425-2587&m=dev)의 로컬 Text Style 34개다.
- system role은 display 3개, headline 3개, title 8개, body 12개, label 8개다.
- 각 role은 `font`, `size`, `line-height`, `weight`, `tracking`, `decoration` 6개 CSS custom property를 한 세트로 정의한다.
- 컴포넌트는 개별 typography 값을 작성하지 않고 component token에서 system typescale role의 6개 속성을 모두 매핑한다.
- 브랜드 서체가 없으면 OS/UI 언어에 맞는 fallback stack을 사용하되 role metric을 보존한다.

```css
:root {
  --app-font-brand: 'Noto Sans Variable', 'Noto Sans', sans-serif;
  --app-font-plain: 'Noto Sans Variable', 'Noto Sans', sans-serif;
  --md-ref-typeface-brand: var(--app-font-brand);
  --md-ref-typeface-plain: var(--app-font-plain);
  --md-ref-typeface-weight-regular: 400;
  --md-ref-typeface-weight-medium: 500;
  --md-ref-typeface-weight-semibold: 600;
}
```

서체를 교체할 때는 app font input만 바꾸고 system typescale과 component token 매핑은 보존한다. 새 서체의 실제 metric 차이는 지원 대상 환경의 수동 시각 검토와 좁은 viewport/긴 label의 computed geometry 검증으로 승인한다.

### Figma Text Style → system role 계약

모든 원본 style의 `textCase`는 `ORIGINAL`, paragraph spacing/indent는 `0`, variable binding은 없다. CSS는 px metric을 `1rem = 16px`로 변환하며 Figma `label/large-underline`의 tracking `0%`는 CSS `letter-spacing` 문법에 맞게 동등한 `0`으로 정규화한다. Figma의 비정규 이름 `body/large - prominent`는 system role `body-large-prominent`로 정규화한다.

| Figma style / system role | Weight | Size / line height | Tracking | Decoration |
|---|---:|---:|---:|---|
| `display/large` / `display-large` | 600 | 57 / 64px | -0.25px | none |
| `display/medium` / `display-medium` | 600 | 45 / 52px | 0 | none |
| `display/small` / `display-small` | 600 | 36 / 44px | 0 | none |
| `headline/large` / `headline-large` | 600 | 32 / 40px | 0 | none |
| `headline/medium` / `headline-medium` | 600 | 28 / 36px | 0 | none |
| `headline/small` / `headline-small` | 600 | 24 / 32px | 0 | none |
| `title/xxlarge` / `title-xxlarge` | 600 | 22 / 28px | 0 | none |
| `title/xlarge` / `title-xlarge` | 600 | 20 / 26px | 0 | none |
| `title/large` / `title-large` | 600 | 18 / 24px | 0 | none |
| `title/medium` / `title-medium` | 600 | 16 / 24px | 0.15px | none |
| `title/small` / `title-small` | 600 | 14 / 20px | 0.1px | none |
| `title/xxlarge-underline` / `title-xxlarge-underline` | 600 | 22 / 28px | 0 | underline |
| `title/medium-underline` / `title-medium-underline` | 600 | 16 / 24px | 0.15px | underline |
| `title/small-underline` / `title-small-underline` | 600 | 14 / 20px | 0.1px | underline |
| `body/large - prominent` / `body-large-prominent` | 600 | 16 / 24px | 0.5px | none |
| `body/large` / `body-large` | 400 | 16 / 24px | 0.5px | none |
| `body/medium-prominent` / `body-medium-prominent` | 600 | 14 / 20px | 0.25px | none |
| `body/medium` / `body-medium` | 400 | 14 / 20px | 0.25px | none |
| `body/small-prominent` / `body-small-prominent` | 600 | 12 / 16px | 0.4px | none |
| `body/small` / `body-small` | 400 | 12 / 16px | 0.4px | none |
| `body/large-prominent-underline` / `body-large-prominent-underline` | 600 | 16 / 24px | 0.5px | underline |
| `body/large-underline` / `body-large-underline` | 400 | 16 / 24px | 0.5px | underline |
| `body/medium-prominent-underline` / `body-medium-prominent-underline` | 600 | 14 / 20px | 0.25px | underline |
| `body/medium-underline` / `body-medium-underline` | 400 | 14 / 20px | 0.25px | underline |
| `body/small-prominent-underline` / `body-small-prominent-underline` | 600 | 12 / 16px | 0.4px | underline |
| `body/small-underline` / `body-small-underline` | 400 | 12 / 16px | 0.4px | underline |
| `label/large-prominent` / `label-large-prominent` | 600 | 14 / 20px | 0.1px | none |
| `label/large` / `label-large` | 500 | 14 / 20px | 0.1px | none |
| `label/large-underline` / `label-large-underline` | 500 | 14 / 20px | 0% → 0 | underline |
| `label/medium-prominent` / `label-medium-prominent` | 600 | 12 / 16px | 0.5px | none |
| `label/medium` / `label-medium` | 500 | 12 / 16px | 0.5px | none |
| `label/small-prominent` / `label-small-prominent` | 600 | 11 / 16px | 0.5px | none |
| `label/small` / `label-small` | 500 | 11 / 16px | 0.5px | none |
| `label/small-underline` / `label-small-underline` | 500 | 11 / 16px | 0.5px | underline |

사용 예시는 속성 일부가 아니라 같은 role의 전체 묶음을 적용한다.

```css
.componentLabel {
  font-family: var(--md-sys-typescale-label-large-font);
  font-size: var(--md-sys-typescale-label-large-size);
  font-weight: var(--md-sys-typescale-label-large-weight);
  letter-spacing: var(--md-sys-typescale-label-large-tracking);
  line-height: var(--md-sys-typescale-label-large-line-height);
  text-decoration: var(--md-sys-typescale-label-large-decoration);
}
```

## Shape와 elevation

- 원본 radius/space/gap 값과 사용 경계는 [Figma spatial foundation](#figma-spatial-foundation)을 따른다.
- shape는 Figma radius token과 none, extra-small, small, medium, large, extra-large, full M3 compatibility role을 분리해 관리한다.
- elevation의 두 shadow layer는 [Figma elevation effect styles](#figma-elevation-effect-styles)의 실제 binding을 보존하고 surface color와 함께 고려한다.
- component token이 적합한 system radius/shape/elevation을 참조하며 selector는 component token만 소비한다.
- shadow만으로 elevation 의미를 전달하지 않으며 forced colors와 high contrast에서 경계가 유지되어야 한다.

## Motion token

- stable duration: short 1~4, medium 1~4, long 1~4
- stable easing: emphasized, emphasized-decelerate, emphasized-accelerate, standard, standard-decelerate, standard-accelerate, linear
- opening은 주로 decelerate, closing은 accelerate 계열을 사용한다.
- CSS Module은 millisecond나 cubic-bezier를 직접 작성하지 않는다. Material Web 내부 구현의 exact constant가 system duration scale에 없으면 component token에 근거와 함께 고정한다.

### Segmented Button component token mapping

Figma `10724:13951`의 `segmentedButton`은 reference 값을 selector에서 직접 사용하지 않는다. `space/150`, `gap/100`, `radius/xxl`, `schemes/*`, `system/custom-container`, `state-layer/*`, `label/large`를 `--md-segmented-button-*` component token으로 한 번 매핑한다. CSS Module은 이 component token만 소비한다.

- geometry: container 32px, touch 48px, padding 12px, gap 8px, icon 18px, radius 48px, outline 1px
- colors: selected `custom-container/on-secondary-container`, unselected `transparent/on-surface/outline-high`, disabled `outline-middle`와 on-surface 38%
- `custom-container`은 Figma Standard/Light에서만 실행 값이 있는 확장 역할이다. Dark·High·custom처럼 MCU가 생성하는 scheme에서는 `secondary-container/on-secondary-container` 쌍으로 함께 폴백해 container와 content의 대비를 보존한다. 정적 Figma Light preset에서는 `custom-container/on-secondary-container` 원본을 유지한다.
- interaction: hover/focus/pressed black 6%/12%/16%, project ripple opacity와 system motion alias
- typography: `label-large` font/size/line-height/weight/tracking/decoration 6개 전체
- Expressive spring token은 문서화만 하고 제품 runtime에 연결하지 않는다.

`prefers-reduced-motion`은 system duration 전체를 `0ms`로 바꾸지 않는다. 전역 zeroing은 ripple과 TextField/Checkbox 상태 전환을 제거해 입력 피드백을 잃게 한다. Stable Material Web이 media query로 억제하지 않는 Ripple의 450ms grow·105ms fade-in·225ms 최소 표시·375ms fade-out 및 field/selection 상태 전환은 그대로 유지한다. Dialog/Menu/Snackbar처럼 큰 영역이 이동하는 overlay만 컴포넌트 수준에서 비필수 transform을 제거한다.

## Theme 적용과 저장

DOM 상태:

```html
<html
  data-theme-id="normal"
  data-color-scheme="dark"
  data-contrast="standard"
>
```

저장 키와 payload:

```json
{
  "key": "ui.theme.v1",
  "value": {
    "themeId": "custom",
    "seedColor": "#00639B",
    "mode": "system",
    "contrast": "standard",
    "variant": "tonalSpot",
    "generatorVersion": "md3-theme-v1"
  }
}
```

규칙:

- alpha가 있거나 `#RRGGBB`가 아닌 사용자 입력은 적용하지 않는다.
- 파싱 또는 scheme 생성 실패 시 Normal/Standard/System으로 fallback한다.
- `system`은 `matchMedia('(prefers-color-scheme: dark)')` 변경을 구독한다.
- Theme 변경은 CSS 변수와 data attribute를 한 update에서 적용한다.
- Theme 전체 color role에는 애니메이션을 걸지 않는다.
- persistence 실패는 Theme 적용을 막지 않으며 저장 실패를 진단 이벤트로 남긴다.
- 기존 `material`, `ocean`, `forest`, `sunset` preset 저장값은 각각 새 `purple`, `blue`, `green`, `orange` preset으로 정규화해 기존 브라우저도 새 system graph에 진입시킨다.

## 초기 부트스트랩

브라우저 렌더 전에 저장된 config를 읽는다. built-in Standard/Light는 `data-theme-id`와 정적 Figma preset CSS를 적용하고 root inline color를 비운다. Dark·High·custom은 MCU scheme을 생성해 root inline role을 적용하고, MCU에 없는 Figma `custom-container/on-custom-container`은 생성된 `secondary-container/on-secondary-container` 쌍으로 폴백한다. 모든 경로는 React hydration 전과 후에 같은 분기를 사용한다.

## Theme 설정 UI

- 모드: Light, Dark, System segmented control
- 색상: 승인된 Figma 프리셋 8개와 color picker/HEX input
- 대비: Standard, High
- 동작: Preview, Apply, Reset
- Preview는 메모리 상태에만 적용하고 Apply에서 저장한다.
- Reset은 OS mode를 따르는 Normal/Standard로 복귀한다.
- 입력 오류는 TextField error와 supporting text로 설명한다.

## 검증

- 동일 config가 동일 role map을 생성하는 golden test
- Light/Dark role 누락 검사
- invalid seed와 storage corruption fallback
- OS mode 변경 구독·해제
- Portal에서 computed CSS variable 확인
- high contrast에서 주요 on/container 쌍 검증
- 초기 HTML과 hydration 후 mode 일치
- 라이브 MCU 또는 spec 업데이트 시 기존 golden 결과의 의도적 migration
