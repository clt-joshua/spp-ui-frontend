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
  --md-filled-button-container-shape: var(--md-sys-shape-corner-full);
}

.root {
  background: var(--md-filled-button-container-color);
  color: var(--md-filled-button-label-text-color);
  border-radius: var(--md-filled-button-container-shape);
}
```

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
| `material` | Material Purple | `#6750A4` |
| `ocean` | Ocean | `#00639B` |
| `forest` | Forest | `#386A20` |
| `sunset` | Sunset | `#8B5000` |

프리셋은 같은 Color Engine으로 생성해 런타임 seed와 결과 계약을 일치시킨다. 승인된 프리셋의 결과는 빌드 시 CSS 또는 JSON으로 생성해 초기 렌더에 사용할 수 있다.

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

각 role을 `--md-sys-color-<kebab-case>`로 변환한다. 같은 프레임에 모든 CSS 변수를 적용해 container와 on-color가 다른 scheme에 놓이는 중간 상태를 방지한다.

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

State layer 색상은 컴포넌트의 현재 content/on-color에서 가져온다. opacity 값은 seed color에 따라 재생성하지 않는다.

## Typography token

- reference: `--md-ref-typeface-brand`, `--md-ref-typeface-plain`
- 기본 reference input은 self-hosted `Roboto Variable`이며 `--app-font-brand`, `--app-font-plain`을 override해 교체한다.
- system: display, headline, title, body, label의 large/medium/small
- 각 role은 font family, weight, size, line height, tracking을 한 세트로 정의한다.
- 컴포넌트는 개별 `font-size`를 작성하지 않고 typescale role을 사용한다.
- 브랜드 서체가 없으면 OS/UI 언어에 맞는 fallback stack을 사용하되 role metric을 보존한다.

```css
:root {
  --app-font-brand: 'Roboto Variable', Roboto, sans-serif;
  --app-font-plain: 'Roboto Variable', Roboto, sans-serif;
  --md-ref-typeface-brand: var(--app-font-brand);
  --md-ref-typeface-plain: var(--app-font-plain);
}
```

서체를 교체할 때는 app font input만 바꾸고 system typescale과 component token 매핑은 보존한다. 새 서체의 실제 metric 차이는 visual baseline과 좁은 viewport/긴 label 검증으로 승인한다.

## Shape와 elevation

- shape는 none, extra-small, small, medium, large, extra-large, full의 system role로 관리한다.
- component token이 적합한 system shape를 참조한다.
- elevation은 level 0~5 token과 surface color를 함께 고려한다.
- shadow만으로 elevation 의미를 전달하지 않으며 forced colors와 high contrast에서 경계가 유지되어야 한다.

## Motion token

- stable duration: short 1~4, medium 1~4, long 1~4
- stable easing: emphasized, emphasized-decelerate, emphasized-accelerate, standard, standard-decelerate, standard-accelerate, linear
- opening은 주로 decelerate, closing은 accelerate 계열을 사용한다.
- 컴포넌트가 millisecond나 cubic-bezier를 직접 작성하지 않는다.
- Expressive spring token은 문서화만 하고 제품 runtime에 연결하지 않는다.

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --md-sys-motion-duration-short1: 0ms;
    --md-sys-motion-duration-short2: 0ms;
    --md-sys-motion-duration-medium1: 0ms;
    --md-sys-motion-duration-medium2: 0ms;
  }
}
```

상태가 사라지면 안 되므로 reduced motion은 이동·확장·지속시간을 제거하고 최종 시각 상태는 즉시 적용한다.

## Theme 적용과 저장

DOM 상태:

```html
<html
  data-theme-id="ocean"
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
- 파싱 또는 scheme 생성 실패 시 Material Purple/Standard/System으로 fallback한다.
- `system`은 `matchMedia('(prefers-color-scheme: dark)')` 변경을 구독한다.
- Theme 변경은 CSS 변수와 data attribute를 한 update에서 적용한다.
- Theme 전체 color role에는 애니메이션을 걸지 않는다.
- persistence 실패는 Theme 적용을 막지 않으며 저장 실패를 진단 이벤트로 남긴다.

## 초기 부트스트랩

브라우저 렌더 전에 저장된 config를 읽어 `data-color-scheme`과 프리셋 CSS를 적용한다. 임의 seed의 전체 scheme은 hydration 후 생성하되, 저장 시 마지막 생성 결과를 cache해 초기 프레임에 재사용할 수 있다. cache에는 `generatorVersion`을 포함하고 version 불일치 시 폐기한다.

## Theme 설정 UI

- 모드: Light, Dark, System segmented control
- 색상: 승인 프리셋 4개와 color picker/HEX input
- 대비: Standard, High
- 동작: Preview, Apply, Reset
- Preview는 메모리 상태에만 적용하고 Apply에서 저장한다.
- Reset은 OS mode를 따르는 Material Purple/Standard로 복귀한다.
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
