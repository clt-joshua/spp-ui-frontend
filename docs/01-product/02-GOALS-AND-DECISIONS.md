---
m3_web_authority: https://m3.material.io/develop/web
material_web_docs: https://github.com/material-components/material-web/tree/main/docs
material_web_snapshot:
  version: 2.5.0
  commit: b4de401eb665ec63474f39319a4ba8f2145974cc
verified_at: 2026-08-25
compliance_required: true
---

# 목표와 아키텍처 결정

> [!IMPORTANT]
> **Mandatory M3 Web Implementation Rule**
> 이 UI 시스템의 구현은 [Material Design 3 for Web](https://m3.material.io/develop/web)과 해당 페이지에서 공식 개발 문서로 연결하는 [Material Web 문서 전체](https://github.com/material-components/material-web/tree/main/docs)를 반드시 준수한다. 컴포넌트 anatomy, variant, size, color role, typography, shape, elevation, state layer, ripple, focus, motion, 접근성 및 반응형 동작은 공식 문서와 대조되어야 한다. Base UI 동작, 기존 코드, 테스트 또는 AI 생성 결과가 공식 문서와 충돌하면 공식 문서를 우선한다. 충돌을 임의로 해석하거나 테스트로 정당화하지 않고 `M3_WEB_SPEC_CONFLICT`로 기록한다.

## 제품 목표

짧은 개발 기간 안에 애플리케이션 화면 개발을 즉시 시작할 수 있는 React UI 기반을 제공한다. 이 기반은 단순한 스타일 모음이 아니라 다음 계약을 갖는 내부 디자인 시스템이다.

- M3 Web 스펙을 추적 가능한 형태로 구현한다.
- Base UI로 복잡한 접근성·키보드·focus management를 재사용한다.
- 시각 정책은 프로젝트 소유의 MD3 token과 CSS Modules로 통제한다.
- 하나의 Primary seed color에서 전체 컬러 role을 생성한다.
- Light/Dark/System과 Standard/High contrast를 즉시 전환한다.
- 공통 interaction을 각 컴포넌트가 중복 구현하지 않는다.
- 애플리케이션 화면은 `src/ui` 공개 API만 소비한다.

## 성공 기준

### 기능

- 10개 MVP 컴포넌트와 Tabs·Switch·Segmented Button 확장, 총 13개 공개 컴포넌트가 실제 앱 진입점에서 사용 가능하다.
- Theme 변경이 일반 DOM과 Portal에 같은 프레임에서 적용된다.
- 새 seed color를 적용하면 primary뿐 아니라 on/container/surface/inverse/fixed role이 함께 변경된다.
- 사용자의 Theme 선택이 재방문 후 복원된다.
- System mode에서 OS 선호 변경을 즉시 반영한다.

### 품질

- 모든 컴포넌트가 공식 M3 및 Material Web 문서에 연결된 `M3ComplianceRecord`를 갖는다.
- 키보드만으로 핵심 흐름을 완료할 수 있다.
- focus indicator는 ripple이나 hover와 독립적으로 식별된다.
- reduced motion에서도 상태와 focus 의미가 사라지지 않는다.
- 컴포넌트 CSS에 임의 HEX, 임의 elevation, 임의 motion 값이 없다.

### 운영

- 공식 문서 변경을 baseline 변경으로 감지할 수 있다.
- Base UI 또는 MCU 업데이트가 공개 컴포넌트 API를 직접 변경하지 않는다.
- v1 구현을 애플리케이션 내부에서 유지하다가 공개 export를 보존한 채 패키지로 분리할 수 있다.

## MVP 범위

### 포함

- Button, IconButton, TextField, Checkbox, Chip, Select, Dialog, Menu, Snackbar
- reference/system/component token
- color, typography, shape, elevation, state, motion token
- StateLayer, Ripple, FocusRing
- ThemeProvider와 UIProvider
- Figma system-color 프리셋 8종과 사용자 지정 HEX
- Light/Dark/System, Standard/High contrast
- 단위·상호작용·접근성·대표 E2E·visual regression 검증

### 비목표

- `@material/web` custom element와 React wrapper 병행
- Material Web Labs 사용
- M3 Expressive shape morph 또는 spring physics 제품 적용
- 이미지에서 seed color 추출
- 계정 기반 Theme 동기화
- 사용자의 개별 color role 수동 편집
- 최초 MVP에서 별도 npm 디자인 시스템 패키지 발행
- Material Web 전체 컴포넌트 재구현

## 제약

- 개발 기간이 짧으므로 token·interaction 기반을 먼저 완성하고 컴포넌트 범위를 8종으로 제한한다.
- 대표 앱 호스트는 Vite로 고정하되 `src/ui`는 Vite runtime API에 의존하지 않아 다른 React host에도 적용 가능해야 한다.
- 지원 runtime baseline은 Node.js 24.x와 pnpm 10.33.x다.
- 스타일 엔진은 CSS Modules이며 Tailwind/CSS-in-JS에 의존하지 않는다.
- 공식 Web 스펙에 없는 구현은 편의를 이유로 기본 기능에 포함하지 않는다.

## Architecture Decision Records

### ADR-001 — Base UI를 headless 기반으로 사용

**결정:** Base UI는 ARIA, keyboard, focus, dismiss, positioning과 controlled/uncontrolled 상태를 제공하는 내부 primitive로 사용한다.

**이유:** 짧은 일정에서 복잡한 상호작용을 재작성하지 않으면서 시각 계층은 완전히 소유할 수 있다.

**제약:** Base UI 스타일이나 DOM 구조가 M3 의미를 재정의하지 못한다. `src/ui` 밖에서 직접 import하지 않는다.

### ADR-002 — Material Web은 참조 전용

**결정:** `@material/web`을 설치하지 않는다. 공식 `docs@main`과 v2.5.0 source/token을 Web 구현 비교 기준으로 사용한다.

**이유:** 공식 Web 페이지가 유지보수 모드와 Expressive 미구현을 명시하고 있으며, React에서 custom element API와 Base UI를 병행하면 focus·form·style·bundle 경계가 이중화된다.

### ADR-003 — 애플리케이션 내부 `src/ui`에서 시작

**결정:** monorepo package 대신 내부 모듈로 시작한다.

**이유:** 초기 구성·릴리스 비용을 줄인다. 공개 export와 내부 dependency 경계는 향후 분리를 전제로 유지한다.

### ADR-004 — CSS Variables + CSS Modules

**결정:** 전역 token은 CSS Variables, 컴포넌트 스타일은 CSS Modules로 구현한다.

**이유:** 런타임 Theme 전환, Portal 상속, cascade 통제와 정적 번들 최적화를 동시에 만족한다.

### ADR-005 — Stable M3 Web만 제품 기준

**결정:** M3 Expressive 전용 동작은 공식 Web 구현 전까지 `deferred`다.

**이유:** 공식 Web 준수라는 상위 요구와 일치시킨다. 생성된 token의 존재만으로 컴포넌트 구현 가능 상태라고 판단하지 않는다.

### ADR-006 — Static preset + runtime seed 하이브리드

**결정:** 승인 프리셋의 Standard/Light system color는 Figma `md-sys-color` alias를 빌드 산출물에 포함하고, Figma 원본에 없는 Dark·High contrast 및 사용자 seed는 브라우저에서 MCU로 생성한다.

**이유:** 원본 design-system mapping, 초기 렌더 안정성, 기존 Light/Dark/System 및 사용자 커스터마이징 계약을 함께 보존한다.

### ADR-007 — App-facing API는 Base UI 타입을 노출하지 않음

**결정:** 공개 props는 제품 의미로 정의하고 Base UI 이벤트 세부 타입을 그대로 export하지 않는다.

**이유:** 라이브러리 업데이트와 제품 API를 분리하고 M3 component 계약을 우선한다.

### ADR-008 — 대표 실제 흐름이 완료 증거

**결정:** Storybook과 단위 테스트는 보조 증거다. 앱 진입점의 실제 상호작용 흐름이 검증되어야 완료다.

### ADR-009 — Vite를 대표 host로 사용하고 UI 경계는 범용으로 유지

**결정:** Vite 8 + React 19 + TypeScript 앱을 개발·검증의 대표 진입점으로 사용한다. `src/ui`는 `import.meta.env`, Vite plugin API 또는 Vite 전용 asset contract를 공개 API에 노출하지 않는다.

**이유:** 빠른 개발과 Storybook/Vitest 생태계를 활용하면서도 UI 시스템이 특정 host에 잠기는 것을 방지한다. Next.js 등 다른 React host는 동일한 public export와 CSS entry를 소비하는 adapter 대상이다.

### ADR-010 — Node.js 24를 지원 runtime baseline으로 고정

**결정:** Node.js 24.x를 개발·CI의 기준으로 사용하고 pnpm 10.33.x와 lockfile을 고정한다.

**이유:** Vite 8의 공식 Node 요구 범위를 만족하며 로컬·CI의 설치와 빌드 결과를 재현 가능하게 만든다. `package.json`, `.nvmrc`, `.node-version`, CI matrix가 같은 major를 가리켜야 한다.

### ADR-011 — Material Icons와 교체 가능한 Noto Sans를 기본 자산으로 사용

**결정:** Google Material Icons Filled와 Noto Sans Variable을 npm package로 self-host한다. 아이콘은 `MaterialIcon` adapter로, 서체는 `--app-font-brand`와 `--app-font-plain` reference input으로 격리한다.

**이유:** 외부 font CDN에 의존하지 않아 초기 렌더와 visual regression을 안정화하면서, 소비자가 자산 package나 서체 family를 제품 요구에 맞게 교체할 수 있다.

**2026-09-02 갱신:** 초기 Roboto 기본값은 승인된 Figma `text-styles` node `10425:2587`의 34개 로컬 Text Style과 일치하도록 Noto Sans Variable로 교체한다. adapter와 reference → system → component 경계는 유지한다.

**제약:** 아이콘 ligature text는 접근 가능한 이름을 대신하지 않는다. 장식 아이콘은 accessibility tree에서 숨기고, 의미가 있는 독립 아이콘만 명시적 label을 갖는다.

### ADR-012 — GitHub Actions quality와 3-browser E2E 사용

**결정:** `quality`와 Chromium/Firefox/WebKit `e2e`를 GitHub Actions의 blocking gate로 사용한다. Playwright browser image와 actionlint image는 digest까지 고정한다. Linux 전용 pixel baseline과 visual job은 완료·병합 기준으로 사용하지 않는다.

**이유:** 실제 Vite 진입점과 browser별 동작 차이는 3-browser E2E로 확인할 수 있다. 특정 Linux font/rasterization 결과를 제품 시각 권위로 유지하는 비용은 현재 지원 환경에 필요하지 않으며, 시각 변경은 실제 지원 대상 환경의 수동 검토와 computed-style/geometry readback으로 확인한다.

**2026-09-02 변경 기록:** 기존 Chromium/Linux screenshot baseline 결정은 폐기했다. 과거 6개 PNG는 역사적 증거일 뿐 현재 gate나 구조 필수 파일이 아니다.

**운영 규칙:** E2E 실패 evidence는 14일 보관한다. 향후 pixel regression이 다시 필요하면 실제 지원 OS, font, browser와 승인 책임자를 먼저 결정하는 새 ADR을 작성한다.

### ADR-013 — Theme Lab과 Component Verification을 실제 진입점으로 사용

**결정:** Theme 프리셋·custom seed·mode·contrast 설정과 프로젝트 생성 폼을 결합한 Theme Lab을 `/`의 대표 제품 흐름으로 사용한다. `/components`는 모든 공개 컴포넌트의 variant·size·state·interaction inventory를 실제 앱에서 비교하는 검증 workspace로 사용한다.

**이유:** Theme Lab은 자연스러운 제품 흐름과 persistence를 검증하고, Component Verification은 제품 폼에 억지로 모든 상태를 넣지 않고 새 컴포넌트의 완전한 상태 행렬과 상호작용을 한 위치에서 확인한다. 두 페이지 모두 같은 `src/ui` 공개 export와 document-root Theme을 사용하며 현재 13개 공개 컴포넌트를 포함한다.

**제약:** 두 페이지 통과는 자동 동작 증거이며 개별 컴포넌트의 M3 준수 `PASS`를 자동으로 의미하지 않는다. 새 공개 컴포넌트는 `/components` state matrix와 실제 상호작용 E2E를 같은 세로 슬라이스에 포함한다. 적용 가능한 screen-reader와 forced-colors 근거는 manifest blocker로 유지한다.

### ADR-014 — Figma spatial·elevation foundation을 계층형 token으로 사용

**결정:** Figma `number/*` 18개를 reference primitive로, `space/*` 18개·`gap/*` 17개·`radius/*` 8개와 local elevation Effect Style 5개를 system token으로 정의한다. 컴포넌트는 component token에서 이를 선택하고 CSS Module selector는 component token만 소비한다.

**이유:** Figma source의 alias 구조와 component override 경계를 함께 보존하고, 동일 숫자를 padding과 sibling gap에 무분별하게 재사용하거나 effect layer를 분해해 drift시키는 것을 방지한다.

**규칙:** space는 padding/margin/inset, gap은 sibling separation, radius는 corner, elevation은 완전한 두-layer composite에 사용한다. Figma에 없는 M3 geometry는 인접 값으로 스냅하지 않는다. `radius/full`은 실제 variable 이름을 사용하며, elevation alpha는 보드 문구 15%/30%가 아니라 실제 binding `alpha/black/100` 12%와 `alpha/black/300` 32%를 따른다.

### ADR-015 — Segmented Button은 Figma density와 MD3 selection을 결합

**결정:** `SegmentedButtonSet`은 `single`과 `multiple` selection을 명시적으로 분리하고, `SegmentedButton`은 native button + `aria-pressed`로 구현한다. Figma `10724:13951`의 32px density와 color/spacing/type binding을 시각 권위로 사용한다.

**이유:** Figma는 start/middle/end와 81개 상태 variant를 제공하지만 selection state machine과 web 접근성 의미를 모두 정의하지 않는다. M3 및 공식 Material Web Labs source의 group/button 동작을 결합하면 선택 의미를 테스트 가능한 공개 API로 유지할 수 있다.

**규칙:** single의 현재 선택은 재클릭으로 해제하지 않고 multiple만 독립 toggle을 허용한다. Stable Material Web 공개 문서가 없는 동안 Labs runtime을 설치/import하지 않으며 source는 교차 검증에만 사용한다. Figma에 없는 disabled-selected는 controlled application state를 숨기지 않도록 보존하고 deviation으로 기록한다.

## 주요 위험

| 위험 | 트리거 | 영향 | 조치 |
|---|---|---|---|
| 공식 문서 drift | `main` 변경 | token·동작 기준 변경 | release 전 snapshot 비교 및 baseline 갱신 |
| 이중 authority | Base UI 예제를 그대로 스타일링 | M3와 다른 결과 | wrapper 내부에서 M3 문서를 먼저 적용 |
| Theme flash | hydration 뒤 Theme 복원 | 첫 화면 색상 불일치 | 동기 bootstrap script 사용 |
| Portal 불일치 | Theme을 app root에만 적용 | Dialog/Menu 색상 누락 | `documentElement`에 system token 적용 |
| 과도한 조합 | variant·contrast·preset 전부 공개 | QA 폭증 | MVP variant는 TonalSpot 고정 |
| 접근성 퇴행 | 시각 구현이 focus/ARIA 변경 | 키보드·스크린리더 실패 | Base UI semantics 보존 + 실제 테스트 |
