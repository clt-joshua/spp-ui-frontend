# UI 구현 상태와 검증 증거

관찰일: 2026-09-03

## 결론

Material Design 3 기반 커스텀 UI 개발 환경, 대표 Theme Lab과 별도 Component Verification workspace가 실제 Vite 진입점에 구현되었다. Theme Runtime, 공통 interaction primitive, 10개 MVP 컴포넌트와 Tabs·Switch·Segmented Button 확장, Storybook, 단위 테스트와 3-browser E2E를 사용할 수 있다.

컴포넌트 구현과 MD3/Material Web 정합성 수정·시각 재감사 및 코드 개선은 완료했지만 M3 준수 상태는 `BLOCKED`다. 적용 가능한 screen-reader announcement와 현재 지원 범위인 Windows forced-colors 검증을 마친 뒤 blocker-free 항목만 `PASS`로 승격한다.

## 구현 범위

| 영역 | 구현 |
|---|---|
| Theme Runtime | Figma 프리셋 8종, TonalSpot custom/dark/high, Light/Dark/System, Standard/High, localStorage `ui.theme.v1`, pre-React bootstrap |
| Token graph | Figma 250 colors, 34 text styles, 18 number → 18 space/17 gap/8 radius, 5 elevation styles → component/state/motion, component-scoped reduced-motion policy |
| Interaction | StateLayer, FocusRing, pointer·keyboard Ripple |
| Components | Button, IconButton, TextField, Checkbox, Radio, Tabs, Switch, SegmentedButton, Select, Dialog, Menu, Snackbar, Chip (Assistive/Filter/Input/Location) |
| 대표 화면 | `/` Theme 설정 + 프로젝트 생성 Playground, `/components` 전체 component state/interaction inventory |
| 개발 도구 | Vitest + Testing Library, Storybook + a11y addon, Playwright E2E/visual |

## 확인된 실제 흐름

- preset preview → document root token 변경 → 적용 → localStorage 저장 → reload 복원
- built-in Standard/Light preset은 root inline color를 제거하고 `data-theme-id`별 Figma system alias 78개를 적용하며, Dark·High·custom은 MCU role을 inline 적용
- 실제 Vite readback에서 Normal/Light의 computed primary와 Filled Button component token이 `#007C8C`, Pink/Light가 `#9A0057`로 함께 전환되고 Pink/Dark는 MCU inline `#FFB0CB`로 전환됨
- Select 값 변경, Dialog open/Escape/focus return, Menu keyboard open/Escape/focus return
- form submit → Snackbar announcement UI
- body Portal인 Select, Dialog, Menu, Snackbar가 document root system token 상속
- 375px 화면에서 horizontal overflow 없음
- Theme Lab 상단 navigation으로 `/components`에 진입하고 Actions/Navigation/Form fields/Selection controls/Chips/Dialogs/Menus/Feedback 8개 세부 그룹과 13개 공개 컴포넌트의 주요 variant·size·상태를 비교함. 그룹 메뉴에는 포함 컴포넌트 이름과 수량을 함께 표시함
- 검증 페이지에서 Filter 선택, Input 삭제·복원, Dialog Escape/focus return, Snackbar, Theme 상속과 375px overflow를 실제 Vite 흐름으로 확인함
- Figma Button `10429:72459`의 360개 조합을 3 size, 5 style, content, error, disabled와 실제 hover/focus/pressed 상태로 변환했다. 40/32/24px container, 20/16/12px padding, size별 typography/icon/gap과 disabled Outlined color composition, style별 error/disabled color, 48px hit target과 pointer·keyboard ripple을 `/components`에서 확인함
- Figma IconButton guide `10724:16368`와 component set `10446:79757`의 75개 조합을 3 size, 5 style, 실제 interaction/disabled 상태로 변환했다. 40/32/24px container, 24/20/16px icon, 8/6/4px padding, style별 color와 disabled 우선순위, 48px hit target, action/toggle accessible name·`aria-pressed`, pointer·keyboard ripple을 `/components`에서 확인함
- self-hosted Noto Sans Variable과 Material Icons 사용, 외부 asset request 없음
- Figma `text-styles` node의 34개 style을 font/size/line-height/weight/tracking/decoration system token 204개로 변환하고, 11개 text-bearing component CSS Module이 component token을 통해 전체 속성 묶음을 소비
- Figma radius/space/gap 보드의 실제 local variable alias를 18 number reference → 43 spatial system token으로 보존하고, elevation Effect Style 5개의 12%/32% 두-layer shadow를 Button/Menu/Dialog/Snackbar component token에 적용
- custom seed swatch, 56px TextField/Select와 MD3 supporting/error 위치·typography, 18px checkbox container/mark 및 label 중심선 일치
- outlined field label을 start/notch/end panel로 구성하고 16px 시작·실제 4px/4px notch, leading icon의 12px 시작·24px 크기·16px label 간격을 component token과 실제 좌표로 검증
- IconButton 75-variant geometry/action/toggle role, Dialog 14/20·alert semantics, Menu 16/24·48px, Snackbar single-line 48px 일치
- Chip Assistive/Filter/Input/Location의 Figma color·size·spacing·type token을 재검증했다. Filter `aria-pressed`와 size별 비선택 label inset, Input 16/10/10px start padding·multi-action·`removeOnly`·취소 가능한 실제 제거, ChipSet toolbar roving focus, 비대화형 Location 24px compact anatomy를 실제 Vite 흐름에서 검증
- Checkbox Figma node `10466:23091`의 90개 조합을 `large/medium/small × selected/indeterminate/unselected × normal/error × enabled/hovered/focused/pressed/disabled` 축으로 변환했다. 16/16/12px visual container, 24/22/16.5px icon canvas, 36/32/24px state layer, size별 outline/shape와 error/disabled 색상을 component token으로 적용하면서 native form·keyboard·mixed semantics와 48px touch target을 유지한다.
- Radio Figma guide `10724:12073`와 executable set `10466:24840`의 30개 조합을 `large/medium/small × selected/unselected × enabled/hovered/focused/pressed/disabled` 축으로 변환했다. 24/20/16px icon, 36/32/24px state layer, 6/6/4px padding, primary/on-surface-variant 및 disabled 38%를 component token으로 적용하면서 named radiogroup, native form value, 방향키/Space 단일 선택, 48px touch target을 유지한다.
- Tabs Figma guide/executable section `10724:12784`의 40px Primary Tab, 16/10px padding, 2px gap, 14/20/600/0.1 label, optional 20px trailing glyph, 3px full-width indicator를 component token으로 변환했다. `Tabs`/`TabList`/`Tab`/`TabPanel`은 manual activation 기본, Arrow/Home/End roving focus, Enter/Space 선택, disabled discoverability/non-selection, tab-panel ARIA 연결과 실제 state layer/ripple/focus를 유지한다.
- Switch Figma section `10724:13609`와 executable set `10467:34474`에서 small의 10개 조합만 제품 범위로 채택했다. 공개 size prop 없이 32×18px track, 12px handle/icon, 24px state layer, 1px outline와 48px touch target을 적용하며 `role=switch`, Space/Enter, native form projection, 취소 가능한 변경을 유지한다.
- Segmented Button Figma section `10724:13951`의 start/middle/end 81개 variant와 5-segment composition을 구현했다. 32px container, 12px inline padding, 8px gap, 18px icon, 48px radius/touch target, selected custom-container와 label-large를 component token으로 적용하며 native button, `role=group`, `aria-pressed`, single 비해제, multiple toggle, disabled-selected 상태와 실제 keyboard ripple을 유지한다. Figma Light 전용 custom-container는 Dark·High·custom 생성 scheme에서 MCU secondary-container 쌍으로 폴백해 selected 문자 대비를 유지한다.
- Select/Menu의 Stable Material Web `quick=false` 모션(500ms height, 50ms surface fade, 250ms item stagger, 150ms close)과 menu icon 24px를 실제 Vite 흐름에서 검증
- Select의 Material Web zero-offset bottom-start 배치, 56px option, no-check selection, 현재 option focus/inward ring과 3회 반복 open/close/open 후 option opacity `1/1/1`을 검증해 Base UI 선택 항목 겹침 및 닫힘 animation fill 잔류에 의한 빈 popup 회귀를 차단
- Button/Menu trigger의 label-large와 pointer·keyboard ripple, reduced-motion에서도 Material Web의 450ms grow·105ms fade-in·225ms 최소 표시·375ms fade-out 유지
- TextField resting/floating 이중 label의 측정 기반 150ms WAAPI 전환과 Checkbox 선택 350ms·해제 150ms scale/draw 전환 유지
- 사용자 환경의 `prefers-reduced-motion: reduce`에서도 Select 열림 height와 option opacity 중간 frame이 유지됨
- 13개 CSS Module이 component token만 소비하며 system token 직접 참조 0건
- Stable Material Web catalog/source의 motion sequence를 기존 8개 MVP 품질 기준선으로 캡처하고 Chip에는 pinned Assist/Filter/Input/ChipSet semantics를 적용했다. shared measured-label/layered outline, explicit Select/Menu lifecycle, two-rect Checkbox mark, pointer-origin Ripple, staged Dialog, shared Snackbar press interaction으로 교정함
- clean in-app browser tab에서 Select/Menu open-close-reopen, TextField empty resting/floating, Checkbox 전환, Button ripple, Dialog 단계 모션, form submit Snackbar를 실제 Vite 진입점으로 재검증함. 캡처와 판정은 `docs/audits/2026-08-26-material-web-quality-baseline/README.md`에 기록함
- 후속 Select 불안정성은 Portal mount와 Floating UI first-positioning 사이의 zero-height 측정 경쟁으로 확인했다. stable rect 대기와 content-only correction 뒤에도 animated popup height가 collision middleware에 다시 입력되어 `bottom → top`으로 flip하는 점프가 남아 있었다. full-size Popup position shell과 nested visual surface로 분리해 배치 크기를 고정하고 surface만 height/opacity 전환하도록 재구성했다. 12 frame fail-open과 전용 side-stability 회귀 사양은 `docs/audits/2026-08-26-material-web-select-constrained-placement/README.md`에 기록함
- official/current 832×752 비교로 기존 4px popup gap·48px option·selected container/check icon·현재 option focus ring 누락을 `M3_WEB_SPEC_CONFLICT`로 확인하고, zero offset·Select 전용 56px token·no-check selection·focus state/ring으로 수정했다. 실제 Vite 선택→닫힘→재열림 증거는 `docs/audits/2026-08-26-material-web-select-behavior-comparison/README.md`에 기록함
- 현재 준수 감사 후 Checkbox/Menu/Select option을 공통 StateLayer/Ripple/FocusRing에 연결하고 Menu token을 공식 `--md-menu-item-*`/`--md-list-item-*` alias로 교체함
- Snackbar description의 실제 줄바꿈을 측정해 one-line 48px와 two-line 68px anatomy를 구분하고 Storybook/실제 앱 회귀 사양을 추가함
- `DialogClose`/`applyInitialTheme` adapter와 구조 validator로 `src/ui/index.ts` 단일 공개 경계를 복원하고, 4개 composite root에 `className`/`style` token override를 제공함
- governance manifest를 main/snapshot URL, verifiedAt, checkedAreas, deviations, status까지 확장했다. 실제 screen reader는 status·description·composite focus처럼 적용 가능한 흐름에만 요구하고, Windows Contrast Themes forced-colors는 현재 지원 범위이므로 13개 항목을 `BLOCKED`로 유지함

## 자동 검증 증거

| 검증 | 결과 |
|---|---|
| 구조·lint·typecheck | PASS |
| Vitest | 7 suites, 36 tests PASS; Button/IconButton/Checkbox/Radio/Tabs/Switch/Segmented Button size·selection·disabled·form/ARIA API, reference 250 colors/18 numbers, system 8×78 color mapping, 34×6 text styles, 43 spatial/5 elevation, Chip type/token/selection/removal/multi-action navigation, component mapping, runtime static/generated 분기 포함 |
| Vite production build | PASS |
| Storybook production build | PASS |
| 이번 Material Web 품질 교정 후 `pnpm verify` | PASS: structure, lint, typecheck, Vitest 7 tests, Vite build, Storybook build |
| Figma system color 적용 후 `pnpm verify` | PASS: structure, lint, typecheck, Vitest 5 suites/16 tests, Vite build, Storybook build |
| Figma Text Style 적용 후 `pnpm verify` | PASS: structure, lint, typecheck, Vitest 6 suites/19 tests, Vite build, Storybook build |
| Figma Text Style 적용 후 실제 Vite E2E | Chromium/Firefox/WebKit 24 tests PASS; self-hosted Noto Sans와 Button 14/20/500/0.1px computed style 포함 |
| Figma spatial/elevation 적용 후 `pnpm verify` | PASS: structure, lint, typecheck, Vitest 7 suites/23 tests, Vite build, Storybook build |
| Figma spatial/elevation 적용 후 실제 Vite E2E | Chromium/Firefox/WebKit 24 tests PASS; leading-icon Filled Button 16px/24px, radius 999px, Elevated Button 12%/32% two-layer shadow computed style 포함 |
| Figma Chip 적용 후 `pnpm verify` | PASS: structure, lint, typecheck, Vitest 7 suites/25 tests, Vite build, Storybook build |
| Figma Chip 적용 후 실제 Vite E2E | Chromium/Firefox/WebKit 27 tests PASS; 네 type, Filter 선택, Input 삭제, ChipSet roving focus, ripple, geometry/typography 포함 |
| Component Verification 적용 후 실제 Vite E2E | Chromium/Firefox/WebKit 30 tests PASS; route navigation, 9-component inventory, state interaction, Dialog focus return, Snackbar, 375px overflow 포함 |
| Figma/MD3 Chip 재교정 후 `pnpm verify` | PASS: structure, lint, typecheck, Vitest 7 suites/27 tests, Vite build, Storybook build |
| Figma/MD3 Chip 재교정 후 실제 Vite E2E | Chromium/Firefox/WebKit 30 tests PASS; Filter/Input size×state, Input remove-only/default removal, ChipSet multi-action 방향키, Location no-button/24px/compact width 포함 |
| Figma/MD3 Button 구현 후 `pnpm verify` | PASS: structure, lint, typecheck, Vitest 7 suites/28 tests, Vite build, Storybook build |
| Figma/MD3 Button 구현 후 실제 Vite E2E | Chromium/Firefox/WebKit 33 tests PASS; 360-variant 축, 3-size geometry/typography, error/disabled color와 disabled Outlined size별 composition, 48px hit target, hover/focus/pressed/ripple 포함 |
| Figma/MD3 Checkbox 구현 후 `pnpm verify` | PASS: structure, lint, typecheck, Vitest 7 suites/29 tests, Vite build, Storybook build |
| Figma/MD3 Checkbox 구현 후 실제 Vite E2E | Chromium/Firefox/WebKit 36 tests PASS; 90-variant 축, 3-size geometry와 centered icon, error/mixed/disabled semantics, 48px touch target, hover/focus/pressed/ripple 포함 |
| Figma/MD3 IconButton 구현 후 `pnpm verify` | PASS: structure, lint, typecheck, Vitest 7 suites/29 tests, Vite build, Storybook build |
| Figma/MD3 IconButton 구현 후 실제 Vite E2E | Chromium/Firefox/WebKit 39 tests PASS; 75-variant 축, 3-size geometry, 5 style color/disabled 우선순위, 48px hit target, action/toggle accessible name·`aria-pressed`, hover/focus/pressed/ripple 포함 |
| Figma/MD3 Radio 구현 후 `pnpm verify` | PASS: structure 10 manifest entries, lint, typecheck, Vitest 7 suites/31 tests, Vite build, Storybook build |
| Figma/MD3 Radio 구현 후 실제 Vite E2E | Chromium/Firefox/WebKit 42 tests PASS; 30-variant 축, 3-size icon/state-layer geometry, selected/unselected/disabled 색상, named radiogroup·방향키 단일 선택·48px touch target·hover/focus/pressed/ripple 포함 |
| Figma/MD3 Tabs 구현 후 `pnpm verify` | PASS: structure 11 manifest entries, lint, typecheck, Vitest 7 suites/33 tests, Vite build, Storybook build |
| Figma/MD3 Tabs 구현 후 실제 Vite E2E | Chromium/Firefox/WebKit 45 tests PASS; 40px container, 16/10px padding, 2px gap, 14/20/600/0.1 label, 20px trailing glyph, 3px indicator, manual activation, disabled non-selection, tab-panel 연결, hover/focus/pressed/ripple 포함 |
| Figma/MD3 Switch 구현 후 `pnpm verify` | PASS: structure 12 manifest entries, lint, typecheck, Vitest 7 suites/34 tests, Vite build, Storybook build |
| Figma/MD3 Switch small-only 재구성 후 실제 Vite E2E | Chromium/Firefox/WebKit 48 tests PASS; 32×18px track, 12px handle/icon, 24px state layer, 1px outline, selected/unselected color, 48px touch target, click/Space/Enter, form, disabled, hover/focus/pressed/ripple 포함 |
| Figma/MD3 Segmented Button 구현 후 `pnpm verify` | PASS: structure 13 manifest entries, lint, typecheck, Vitest 7 suites/36 tests, Vite build, Storybook build |
| Figma/MD3 Segmented Button 구현 후 실제 Vite E2E | Chromium/Firefox/WebKit 51 tests PASS; 81-variant 축, 5-segment/32px anatomy, padding/gap/icon/radius/type/color, single/multiple/disabled-selected, Tab/Space/ripple, 실제 Theme UI Dark 전환과 selected 4.5:1 이상 대비 포함 |
| Select option anatomy/position/focus 교정 후 `pnpm verify` | PASS: structure, lint, typecheck, Vitest 7 tests, Vite build, Storybook build |
| Select constrained-placement lifecycle 재구성 후 `pnpm verify` | PASS: structure, lint, typecheck, Vitest 7 tests, Vite build, Storybook build |
| 감사 개선 후 Chromium 실제 Vite E2E | 8 tests PASS: Checkbox/Menu/Select ripple·focus, Snackbar two-line 포함 |
| Playwright E2E | Chromium/Firefox/WebKit, 51 tests PASS: Segmented Button/Switch/Tabs/Button/IconButton/Chip/Checkbox/Radio/Menu/Select interaction, Component Verification과 two-line Snackbar 포함. Windows에서는 headless Firefox SWGL/zero-frame contention을 피하기 위해 동일 범위를 1 worker로 직렬 실행 |
| axe-core | representative mobile flow에서 critical/serious 0건 |
| Linux visual | 2026-09-02 완료·병합 기준에서 제거. 기존 6개 PNG는 역사적 증거로만 보존 |

## 남은 준수 게이트

1. Snackbar live-region, TextField 오류·설명, Checkbox mixed state, Radio group 위치·선택 변경, Tabs 위치·선택·panel 문맥, Segmented Button group/pressed 상태, Select/Menu/Dialog/ChipSet 상태·포커스 흐름을 대표 screen reader/browser 조합에서 검증한다.
2. Windows Contrast Themes에서 control 경계, focus, selected, disabled, error와 icon 가시성을 검증한다.
3. 위 적용 가능 blocker가 닫힌 component만 `PASS`로 승격한다.

현재 상태의 권위 있는 기계 판독 항목은 `src/ui/compliance/m3-component-manifest.ts`다.
