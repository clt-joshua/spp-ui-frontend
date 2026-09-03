---
m3_web_authority: https://m3.material.io/develop/web
material_web_docs: https://github.com/material-components/material-web/tree/main/docs
material_web_snapshot:
  version: 2.5.0
  commit: b4de401eb665ec63474f39319a4ba8f2145974cc
verified_at: 2026-08-25
compliance_required: true
---

# 아키텍처와 프로젝트 설정

> [!IMPORTANT]
> **Mandatory M3 Web Implementation Rule**
> 이 UI 시스템의 구현은 [Material Design 3 for Web](https://m3.material.io/develop/web)과 해당 페이지에서 공식 개발 문서로 연결하는 [Material Web 문서 전체](https://github.com/material-components/material-web/tree/main/docs)를 반드시 준수한다. 컴포넌트 anatomy, variant, size, color role, typography, shape, elevation, state layer, ripple, focus, motion, 접근성 및 반응형 동작은 공식 문서와 대조되어야 한다. Base UI 동작, 기존 코드, 테스트 또는 AI 생성 결과가 공식 문서와 충돌하면 공식 문서를 우선한다. 충돌을 임의로 해석하거나 테스트로 정당화하지 않고 `M3_WEB_SPEC_CONFLICT`로 기록한다.

## 계층 모델

```text
Application screens
        ↓ imports only
Public UI components and hooks
        ↓
M3 component adapters
        ├─ component tokens
        ├─ StateLayer / Ripple / FocusRing
        └─ Base UI primitives
        ↓
M3 system tokens and Theme Runtime
        ↓
Reference values + Material Color Utilities
```

Base UI는 behavior runtime이고 M3 token layer가 visual authority다. Material Web은 빌드 의존성이 아니라 문서와 결과를 대조하는 reference implementation이다.

## 의존성

현재 기준 설치 예시:

```bash
pnpm add @base-ui/react@1.7.0 @material/material-color-utilities@0.4.0 \
  @fontsource-variable/noto-sans@5.3.0 @material-design-icons/font@0.14.15
pnpm add -D @storybook/react-vite @storybook/addon-a11y \
  @testing-library/react @testing-library/user-event vitest \
  vitest-axe @playwright/test
```

대표 앱 host는 Vite 8 + React 19 + TypeScript이며 Node.js 24.x와 pnpm 10.33.x를 기준으로 한다. Next.js 프로젝트는 동일한 `src/ui` public export와 CSS entry를 소비하되 Storybook framework adapter와 bootstrap만 host 구성에 맞춰 바꾼다. `@material/web`과 `motion`은 MVP 의존성에 넣지 않는다.

## 디렉터리

```text
src/pages/
└─ ComponentGalleryPage.tsx

src/ui/
├─ index.ts
├─ providers/UIProvider.tsx
├─ compliance/
│  ├─ m3-component-manifest.ts
│  └─ spec-baseline.ts
├─ theme/
│  ├─ ThemeProvider.tsx
│  ├─ color-engine.ts
│  ├─ theme-presets.ts
│  ├─ theme-storage.ts
│  └─ theme-bootstrap.ts
├─ tokens/
│  ├─ reference.css
│  ├─ system.css
│  ├─ component.css
│  ├─ state.css
│  └─ motion.css
├─ interactions/
│  ├─ StateLayer.tsx
│  ├─ Ripple.tsx
│  └─ FocusRing.tsx
├─ icons/
│  └─ MaterialIcon.tsx
├─ components/
│  ├─ Button/
│  ├─ IconButton/
│  ├─ TextField/
│  ├─ Checkbox/
│  ├─ Select/
│  ├─ Dialog/
│  ├─ Menu/
│  └─ Snackbar/
└─ styles/
   ├─ reset.css
   ├─ globals.css
   └─ layers.css
```

각 컴포넌트 폴더는 `Component.tsx`, `Component.module.css`, `Component.stories.tsx`, `Component.test.tsx`, `compliance.ts`를 기본 구성으로 사용한다.

`src/pages/ComponentGalleryPage.tsx`는 `/components`에서 `src/ui/index.ts` 공개 export만 소비한다. 새 공개 컴포넌트는 제품 흐름 외에도 이 페이지의 state matrix와 실제 Vite E2E에 추가해야 하며, 검증 페이지가 component 내부 경계를 우회해서는 안 된다.

## Import 경계

허용:

```ts
import { Button, Dialog, useTheme } from '@/ui';
```

금지:

```ts
import { Dialog } from '@base-ui/react/dialog';
import '@material/web/button/filled-button.js';
```

ESLint `no-restricted-imports`로 `src/ui/**` 외부에서 `@base-ui/react/*`와 `@material/web/*`를 차단한다. `src/ui/index.ts`는 공개 API만 export하며 내부 token helper와 Base UI type을 노출하지 않는다.

## CSS layer와 전역 스타일

```css
@layer reset, tokens, base, components, utilities, overrides;

@import './reset.css' layer(reset);
@import '../tokens/reference.css' layer(tokens);
@import '../tokens/system.css' layer(tokens);
@import '../tokens/component.css' layer(tokens);
@import '../tokens/state.css' layer(tokens);
@import '../tokens/motion.css' layer(tokens);
@import './globals.css' layer(base);
```

컴포넌트 CSS Modules는 `@layer components` 안에서 작성한다. 애플리케이션의 의도적인 제품 override만 `overrides` layer에 둔다.

전역 최소 설정:

```css
:root {
  color-scheme: light dark;
  font-family: var(--md-ref-typeface-plain);
  background: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
}

*, *::before, *::after {
  box-sizing: border-box;
}

[data-app-root] {
  isolation: isolate;
  min-block-size: 100dvh;
}

body {
  margin: 0;
  position: relative;
}
```

Theme token은 `html`에 적용해 `<body>`로 이동하는 Base UI Portal도 상속하게 한다.

## Provider 계약

```tsx
export interface UIProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeConfig;
  storage?: ThemeStorage;
  portalContainer?: HTMLElement | null;
}

export function UIProvider(props: UIProviderProps) {
  return (
    <ThemeProvider defaultTheme={props.defaultTheme} storage={props.storage}>
      <Tooltip.Provider>
        <SnackbarProvider portalContainer={props.portalContainer}>
          {props.children}
        </SnackbarProvider>
      </Tooltip.Provider>
    </ThemeProvider>
  );
}
```

Provider는 애플리케이션 루트에 한 번만 배치한다. Dialog와 Menu는 자체 Base UI Portal을 사용하되 공통 `portalContainer` override를 허용한다. 테스트에서도 실제 Portal 동작을 기본으로 사용한다.

## Public API 규칙

- 제품 의미의 prop 이름을 사용한다: `variant`, `size`, `tone`, `loading`, `error`.
- Base UI state object와 event details를 그대로 공개하지 않는다.
- controlled/uncontrolled 계약은 React 관례를 따른다.
- `className`과 `style`은 root에만 적용하며 내부 slot은 제한된 `slotProps`로 노출한다.
- `data-*` state는 스타일·테스트를 위해 안정 계약으로 정의한다.
- native form 의미를 보존한다. Button 기본 `type`은 의도치 않은 submit을 막도록 명시적으로 관리한다.

## 대표 Vite host 적용

1. `main.tsx`에서 `layers.css`를 한 번 import한다.
2. `createRoot` 이전에 `applyInitialTheme()`를 호출한다.
3. `<UIProvider>`로 `<App />`을 감싼다.
4. Theme bootstrap은 `localStorage`와 `matchMedia`만 사용하므로 브라우저 진입점에서 실행한다.
5. `src/ui` 내부에서는 Vite의 `import.meta.env`, plugin API, HMR API를 사용하지 않는다.

```ts
import '@/ui/styles/layers.css';
import { applyInitialTheme, UIProvider } from '@/ui';

applyInitialTheme();

createRoot(document.getElementById('root')!).render(
  <UIProvider><App /></UIProvider>,
);
```

## Next.js App Router 적용

1. `app/layout.tsx`에서 `layers.css`를 import한다.
2. nonce를 지원하는 작은 inline bootstrap script를 `<head>`에 넣는다.
3. `UIProvider`는 `'use client'` 모듈로 분리한다.
4. Server Component에서 UI state hook을 사용하지 않는다.
5. 초기 HTML의 `data-color-scheme`과 hydration 결과가 일치해야 한다.

```tsx
<html lang="ko" suppressHydrationWarning>
  <head><ThemeBootstrapScript nonce={nonce} /></head>
  <body><div data-app-root><ClientUIProvider>{children}</ClientUIProvider></div></body>
</html>
```

## TypeScript와 빌드

- Node.js 24.x와 pnpm 10.33.x를 runtime baseline으로 사용한다.
- `strict: true`, `noUncheckedIndexedAccess: true`를 권장한다.
- package가 ESM이므로 maintained bundler와 modern module resolution을 사용한다.
- Base UI subpath import를 사용해 tree-shaking 범위를 명확히 한다.
- `color-engine.ts`만 MCU를 import하게 하여 API 변경을 격리한다.
- build 결과에서 `@material/web` 또는 `lit`가 포함되면 실패한다.

## 기본 아이콘과 서체

- `@material-design-icons/font/filled.css`만 import해 사용하지 않는 아이콘 style font를 번들에 포함하지 않는다.
- 화면과 공개 컴포넌트는 icon font class를 직접 작성하지 않고 `MaterialIcon` 또는 `ReactNode` icon slot을 사용한다.
- 장식 아이콘은 `aria-hidden`, 독립적으로 의미가 있는 아이콘은 명시적 label을 사용한다.
- Noto Sans Variable은 self-host하며 `--app-font-brand`와 `--app-font-plain`이 `--md-ref-typeface-*`의 입력이다.
- 제품은 두 app font 변수를 override하여 서체를 바꿀 수 있으며 component token이나 selector를 수정하지 않는다.

## 구현 순서

1. 의존성과 import restriction
2. CSS layer와 global root
3. token 파일
4. Color Engine과 Theme bootstrap
5. ThemeProvider와 UIProvider
6. 공통 interaction primitive
7. 컴포넌트 wrapper
8. 앱 대표 흐름과 검증
