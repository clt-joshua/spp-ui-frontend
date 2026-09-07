# UI 구현 상태와 검증 증거

관찰일: 2026-09-07

추가 후속: [SegmentedButton Labs 교정 감사](../audits/2026-09-07-segmented-button-labs/README.md). 사용자 피드백으로 font clip 근사를 폐기하고 원본 SVG draw·graphic 구조·선택/해제 keyframe을 React로 이식했다. 이전 PASS는 Labs 일치 증거로 사용하지 않는다. Stable 대응 부재와 수동 blocker는 유지한다.

최신 후속 변경은 [마이크로 모션 감사](../audits/2026-09-07-micro-motion/README.md)를 따른다. Figma endpoint를 유지하면서 공통 효과 및 Switch/Tabs/Radio/Select/Dialog/field/Button의 모션을 공식 Material Web 소스에 맞췄다. 이는 아래 대비·정책·실제 AT 검증 blocker를 해소한 전면 준수 판정이 아니다.

최신 SegmentedButton Labs 이식 검증: `pnpm verify`/단위 46개 PASS, 전체 E2E **126/126 PASS**(Chromium/Firefox/WebKit 각 42개, 단일 실행, 8.2분). 실제 5174 Light/Dark × Standard/High에서 SVG draw와 graphic 중간 frame, 키보드·reduced-motion을 확인했다. 산출물 `index-DfOwUzAP.js` / `index-C_p2ztRC.css`. 이전 clip 구현의 PASS는 Labs 일치 근거가 아니며 역사적 기록으로만 남긴다.

## 결론

Material Design 3 기반 커스텀 UI 개발 환경, 대표 Theme Lab과 별도 Component Verification workspace가 실제 Vite 진입점에 구현되었다. Theme Runtime, 공통 interaction primitive, 10개 MVP 컴포넌트와 Tabs·Switch·Segmented Button·AutoComplete 확장, Storybook, 단위 테스트와 3-browser E2E를 사용할 수 있다.

M3 준수 상태는 `BLOCKED`다. 2026-09-07 TextField Figma 56-variant 구현이 추가됐으나 placeholder/affix 대비 충돌, 이전 전체 감사의 Button/Chip 색상과 Snackbar 정책 문제도 남아 있어 수동 증거만 남은 상태가 아니다. 적용 가능한 screen-reader announcement와 Windows forced-colors까지 해결한 blocker-free 항목만 `PASS`로 승격한다. [입력 컴포넌트 최신 증거](../audits/2026-09-07-choice-fields/README.md), [전체 감사](../audits/2026-09-07-component-gallery/README.md)를 우선한다.

## 구현 범위

| 영역 | 구현 |
|---|---|
| Theme Runtime | Figma 프리셋 8종, TonalSpot custom/dark/high, Light/Dark/System, Standard/High, localStorage `ui.theme.v1`, pre-React bootstrap |
| Token graph | Figma 250 colors, 34 text styles, 18 number → 18 space/17 gap/8 radius, 5 elevation styles → component/state/motion, component-scoped reduced-motion policy |
| Interaction | StateLayer, FocusRing, pointer·keyboard Ripple |
| Components | Button, IconButton, TextField, AutoComplete, Checkbox, Radio, Tabs, Switch, SegmentedButton, Select, Dialog, Menu, Snackbar, Chip (Assistive/Filter/Input/Location) |
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
- Theme Lab 상단 navigation으로 `/components`에 진입하고 Actions/Navigation/Form fields/Selection controls/Chips/Dialogs/Menus/Feedback 8개 세부 그룹과 14개 공개 컴포넌트의 주요 variant·size·상태를 비교함. 그룹 메뉴에는 포함 컴포넌트 이름과 수량을 함께 표시함
- 검증 페이지에서 Filter 선택, Input 삭제·복원, Dialog Escape/focus return, Snackbar, Theme 상속과 375px overflow를 실제 Vite 흐름으로 확인함
- Figma Button `10429:72459`의 360개 조합을 3 size, 5 style, content, error, disabled와 실제 hover/focus/pressed 상태로 변환했다. 40/32/24px container, 20/16/12px padding, size별 typography/icon/gap과 disabled Outlined color composition, style별 error/disabled color, 48px hit target과 pointer·keyboard ripple을 `/components`에서 확인함
- Figma IconButton guide `10724:16368`와 component set `10446:79757`의 75개 조합을 3 size, 5 style, 실제 interaction/disabled 상태로 변환했다. 40/32/24px container, 24/20/16px icon, 8/6/4px padding, style별 color와 disabled 우선순위, 48px hit target, action/toggle accessible name·`aria-pressed`, pointer·keyboard ripple을 `/components`에서 확인함
- self-hosted Noto Sans Variable과 Material Icons 사용, 외부 asset request 없음
- Figma `text-styles` node의 34개 style을 font/size/line-height/weight/tracking/decoration system token 204개로 변환하고, 11개 text-bearing component CSS Module이 component token을 통해 전체 속성 묶음을 소비
- Figma radius/space/gap 보드의 실제 local variable alias를 18 number reference → 43 spatial system token으로 보존하고, elevation Effect Style 5개의 12%/32% 두-layer shadow를 Button/Menu/Dialog/Snackbar component token에 적용
- custom seed swatch/Select는 56px를 유지한다. Filled TextField는 삭제했고 TextField/AutoComplete는 large 48px/small 32px와 focus/value floating label을 사용한다.
- outlined TextField는 start/notch/end panel, Figma large/small label x=16/8px·notch padding 4/2px·leading glyph x=16/8px·icon 24/16px를 component token으로 사용한다. Select의 기존 geometry는 유지한다.
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
- TextField/AutoComplete의 resting/floating 이중 label은 focus/value에 따라 측정 기반 150ms WAAPI 전환을 사용한다. Checkbox 선택 350ms·해제 150ms scale/draw 전환은 유지한다.
- Prefix/Suffix 검증은 샘플 값에서 즉시 토글하고 빈 값 버튼으로 숨김/포커스 표시를 따로 비교한다. Material Web 기반 공유 라벨은 취소 전 pose를 이어받아 중간 반전 점프를 방지하고 content는 67ms delay + 83ms emphasized로 함께 fade한다. 고정 notch 배경 패치를 제거했으며 크기·색·서체 endpoint는 보존한다.
- 사용자 환경의 `prefers-reduced-motion: reduce`에서도 Select 열림 height와 option opacity 중간 frame이 유지됨
- 컴포넌트 CSS Module이 component token만 소비하며 system token 직접 참조 0건
- Stable Material Web catalog/source의 motion sequence를 기존 8개 MVP 품질 기준선으로 캡처하고 Chip에는 pinned Assist/Filter/Input/ChipSet semantics를 적용했다. shared measured-label/layered outline, explicit Select/Menu lifecycle, two-rect Checkbox mark, pointer-origin Ripple, staged Dialog, shared Snackbar press interaction으로 교정함
- clean in-app browser tab에서 Select/Menu open-close-reopen, TextField empty resting/floating, Checkbox 전환, Button ripple, Dialog 단계 모션, form submit Snackbar를 실제 Vite 진입점으로 재검증함. 캡처와 판정은 `docs/audits/2026-08-26-material-web-quality-baseline/README.md`에 기록함
- 후속 Select 불안정성은 Portal mount와 Floating UI first-positioning 사이의 zero-height 측정 경쟁으로 확인했다. stable rect 대기와 content-only correction 뒤에도 animated popup height가 collision middleware에 다시 입력되어 `bottom → top`으로 flip하는 점프가 남아 있었다. full-size Popup position shell과 nested visual surface로 분리해 배치 크기를 고정하고 surface만 height/opacity 전환하도록 재구성했다. 12 frame fail-open과 전용 side-stability 회귀 사양은 `docs/audits/2026-08-26-material-web-select-constrained-placement/README.md`에 기록함
- official/current 832×752 비교로 기존 4px popup gap·48px option·selected container/check icon·현재 option focus ring 누락을 `M3_WEB_SPEC_CONFLICT`로 확인하고, zero offset·Select 전용 56px token·no-check selection·focus state/ring으로 수정했다. 실제 Vite 선택→닫힘→재열림 증거는 `docs/audits/2026-08-26-material-web-select-behavior-comparison/README.md`에 기록함
- 현재 준수 감사 후 Checkbox/Menu/Select option을 공통 StateLayer/Ripple/FocusRing에 연결하고 Menu token을 공식 `--md-menu-item-*`/`--md-list-item-*` alias로 교체함
- Snackbar description의 실제 줄바꿈을 측정해 one-line 48px와 two-line 68px anatomy를 구분하고 Storybook/실제 앱 회귀 사양을 추가함
- `DialogClose`/`applyInitialTheme` adapter와 구조 validator로 `src/ui/index.ts` 단일 공개 경계를 복원하고, 4개 composite root에 `className`/`style` token override를 제공함
- governance manifest를 main/snapshot URL, verifiedAt, checkedAreas, deviations, status까지 확장했다. 실제 screen reader는 status·description·composite focus처럼 적용 가능한 흐름에만 요구하고, Windows Contrast Themes forced-colors는 현재 지원 범위이므로 14개 항목을 `BLOCKED`로 유지함

## 자동 검증 증거

최신 입력 컴포넌트 변경 및 검증 결과는 [후속 감사](../audits/2026-09-07-choice-fields/README.md)를 우선한다. 전체 78개 PASS 후 최종 상향 AutoComplete 보정 영향 범위 12개도 3-browser PASS했다.

| 검증 | 결과 |
|---|---|
| 구조·lint·typecheck | PASS |
| Vitest | 9 suites, 45 tests PASS; TextField native 이름/오류/clear/textarea/폼·기존 컴포넌트 API와 token/runtime 분기 포함 |
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
| Playwright E2E | Chromium/Firefox/WebKit 전체 93개 PASS (7.2분). Prefix/Suffix fresh toggle, 두 크기, 빈 값/sample, 양방향 라벨 중간 반전, 실제 blur frame 포함. Windows 1 worker |
| axe-core | representative mobile flow에서 critical/serious 0건 |
| Linux visual | 2026-09-02 완료·병합 기준에서 제거. 기존 6개 PNG는 역사적 증거로만 보존 |

## 남은 준수 게이트

1. Snackbar live-region, TextField 오류·설명, Checkbox mixed state, Radio group 위치·선택 변경, Tabs 위치·선택·panel 문맥, Segmented Button group/pressed 상태, Select/Menu/Dialog/ChipSet 상태·포커스 흐름을 대표 screen reader/browser 조합에서 검증한다.
2. Windows Contrast Themes에서 control 경계, focus, selected, disabled, error와 icon 가시성을 검증한다.
3. 위 적용 가능 blocker가 닫힌 component만 `PASS`로 승격한다.

현재 상태의 권위 있는 기계 판독 항목은 `src/ui/compliance/m3-component-manifest.ts`다.
