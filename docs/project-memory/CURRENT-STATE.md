# 현재 상태

관찰일: 2026-09-03

## 결론

프로젝트는 Vite reference host에서 실행 가능한 Material Design 3 Theme Lab과 Component Verification 단계다. Node 24 toolchain, self-hosted 자산, Theme Runtime, token graph, interaction primitive, 10개 MVP 컴포넌트와 Tabs·Switch·Segmented Button 확장, Storybook, 단위 테스트와 3-browser E2E가 연결됐다.

실제 앱 흐름과 MD3/Material Web 시각 재감사 및 코드 개선까지 완료했지만 개별 컴포넌트의 M3 준수 상태는 `BLOCKED`다. 구현은 완료됐지만 적용 가능한 screen-reader announcement와 현재 지원 범위인 Windows forced-colors 검증 전에는 해당 항목을 `PASS`로 표현하지 않는다.

## 저장소와 환경

- Branch: `main`
- Remote: `https://github.com/clt-joshua/spp-ui-frontend.git`
- 시스템 Node.js: `v25.2.1`
- 프로젝트 실행 Node.js: pnpm이 provision하는 `v24.19.0`
- pnpm: `10.33.0`
- 대표 host: Vite 8 + React 19 + TypeScript
- 외부 production: `https://spp-ui-frontend.pages.dev/`
- 자동 배포: `main`의 `CI` 성공 revision → GitHub Actions → Cloudflare Pages project `spp-ui-frontend`
- 배포 자격 증명: GitHub repository secret, 현재 임시 토큰 만료 2026-12-03

## 준비도

| 영역 | 상태 | 증거 또는 다음 게이트 |
|---|---|---|
| 문서·프로젝트 메모리 | 준비됨 | `docs/README.md`, `PROJECT_MEMORY.md` |
| Node/pnpm/Vite host | 준비됨 | Node 24.19.0, pnpm 10.33.0, Vite production build |
| `src/ui` 공개 경계 | 준비됨 | `DialogClose`/`applyInitialTheme` adapter, 앱 deep import 구조 차단 |
| token graph | 구현됨 | Figma 250 colors, 34 text styles, 18 number → 18 space/17 gap/8 radius, 5 elevation styles → component CSS variables |
| Theme Runtime | 구현됨 | Figma preset 8종 + TonalSpot custom/dark/high, mode/contrast, bootstrap/storage |
| interaction primitive | 구현됨 | Button/IconButton/Checkbox/Radio/Tabs/Switch/Segmented Button/Select option/Menu/Snackbar action의 StateLayer, FocusRing, pointer·keyboard Ripple |
| 공개 13개 컴포넌트 | 구현됨, 실환경 증거 대기 | 10개 MVP + Tabs·Switch·Segmented Button 확장, manifest `implementationStatus=implemented`, `status=BLOCKED` |
| 대표 제품 흐름 | 준비됨 | `/` Theme Lab + 프로젝트 생성 Playground, `/components` 전체 상태 inventory |
| unit/Storybook | 준비됨 | Vitest 7 suites/36 tests, 전체 state Story, Storybook production build |
| E2E | 준비됨 | Chromium/Firefox/WebKit 51 tests PASS |
| 접근성 자동 검사 | 준비됨 | keyboard/focus flow, axe critical/serious 0건 |
| Linux visual baseline | 기준에서 제거됨 | 기존 6개 PNG는 역사적 증거로만 보존; CI/구조/완료 gate 아님 |
| 실제 AT/forced-colors | 미완료 | 적용 가능한 announcement와 Windows Contrast Themes 상태의 수동 검증 필요 |

## 확인된 실제 흐름

- preset preview → root token 변경 → 적용 → localStorage `ui.theme.v1` → reload 복원
- Theme Lab 상단에서 `/components`로 진입 → Actions/Navigation/Form fields/Selection controls/Chips/Dialogs/Menus/Feedback 8개 세부 그룹과 각 그룹의 포함 컴포넌트 이름·수량, 13개 공개 컴포넌트 inventory 확인 → Segmented Button single/multiple·Switch click/Space/Enter·Tabs manual 선택·Radio 단일 선택·Filter 선택·Input 삭제/복원·Dialog focus return·Snackbar 실행 → 375px overflow 0
- Button은 Figma `10429:72459`의 360개 variant 축을 공개 API와 `/components` 3개 size matrix로 제공한다. 실제 Vite에서 40/32/24px container, 20/16/12px padding, size별 typography/icon/gap과 disabled Outlined color composition, style별 error/disabled color, 48px hit target, hover/focus/pressed state layer와 keyboard ripple을 확인했다.
- IconButton은 Figma `10724:16368`의 75개 variant 축을 공개 API와 `/components` 3개 size matrix로 제공한다. 40/32/24px visual container, 24/20/16px icon, 8/6/4px padding과 standard/filled/tonal/outlined/error 색상 및 disabled 우선순위를 component token으로 적용하면서 48px touch target, action/toggle semantics, 선택 전후 접근명과 실제 hover/focus/pressed/ripple을 유지한다.
- Checkbox는 Figma `10466:23091`의 90개 variant 축을 `large/medium/small × checked/indeterminate/unselected × error × interaction/disabled` 공개 API와 `/components` matrix로 제공한다. 16/16/12px visual container, 24/22/16.5px icon canvas, 36/32/24px state layer와 error/disabled 색상을 component token으로 적용하면서 native form·keyboard·mixed semantics와 48px touch target을 유지한다.
- Radio는 Figma `10724:12073`의 30개 variant 축을 `large/medium/small × selected/unselected × interaction/disabled` 공개 API와 `/components` matrix로 제공한다. 24/20/16px icon, 36/32/24px state layer, black 6%/12%/12% interaction layer와 disabled 38%를 component token으로 적용하면서 named radiogroup, native form projection, 방향키/Space 단일 선택과 48px touch target을 유지한다.
- Tabs는 Figma `10724:12784`의 guide/executable property를 `Tabs`/`TabList`/`Tab`/`TabPanel` 공개 API와 `/components` interactive matrix로 제공한다. 40px container, 16/10px padding, 2px label/icon gap, 14/20/600/0.1 typography, optional 20px trailing glyph와 3px full-width indicator를 component token으로 적용하면서 manual activation 기본, 방향키/Home/End focus, Enter/Space 선택, disabled discoverability/non-selection과 tab-panel ARIA 연결을 유지한다.
- Switch는 Figma `10724:13609`와 executable set `10467:34474`에서 small 10개 variant만 공개 API와 `/components` matrix로 제공한다. size prop 없이 track 32×18px, handle/icon 12px, state layer 24px, outline 1px를 적용하면서 48px touch target, `role=switch`, Space/Enter, native form projection과 실제 hover/focus/pressed/ripple을 유지한다.
- Segmented Button은 Figma `10724:13951`의 start/middle/end 81개 variant와 5-segment composition을 `SegmentedButtonSet`/`SegmentedButton` 공개 API와 `/components` matrix로 제공한다. 32px container, 12px padding, 8px gap, 18px icon, 48px radius/touch target과 Figma color/type binding을 component token으로 적용하면서 native button, `role=group`, `aria-pressed`, single 비해제, multiple toggle, disabled와 keyboard ripple을 유지한다. Figma Light 전용 `custom-container`은 생성형 Dark·High·custom scheme에서 MCU `secondary-container/on-secondary-container` 쌍으로 폴백해 selected 문자 대비를 보존한다.
- Select 변경, Dialog Escape/focus return, Menu keyboard open/Escape/focus return
- form submit 후 Snackbar 표시
- body Portal이 document root Theme role을 상속
- 375px viewport에서 horizontal overflow 없음
- Noto Sans Variable/Material Icons self-host, 외부 asset request 없음
- custom seed swatch, 56px TextField/Select와 MD3 supporting/error 위치·typography, 18px checkbox container/mark 및 label 중심선 일치
- outlined field label은 Material Web식 start/notch/end panel을 사용해 실제 notch gap 4px/4px를 유지하고, leading icon field는 바깥 12px·icon 24px·label 간격 16px를 component token으로 고정함
- IconButton 75-variant geometry/action/toggle, Dialog 14/20·alert semantics, Menu 16/24·48px, Snackbar 48px 및 F6 이동 검증
- Chip Assistive/Filter/Input/Location이 Figma component token을 소비한다. Filter는 size별 outer padding과 비선택 label inset, 선택/check를 보존하고 Input은 large/compact start padding, 기본 multi-action과 `removeOnly`, 취소 가능한 실제 제거를 지원한다. ChipSet ArrowLeft/ArrowRight/Home/End roving focus는 대화형 action에만 적용하며 Location은 button/ripple/focus가 없는 24px compact 정보 표시로 실제 Theme Lab과 `/components`에서 분리했다.
- Select/Menu는 Stable Material Web의 `quick=false` 기본을 따라 500ms 높이 전개·50ms surface fade·250ms item stagger 열림과 150ms 닫힘을 유지하며, 일반 Menu의 선택/서브메뉴 icon은 24px token을 사용함
- Select는 Base UI 선택 항목 겹침 정렬을 비활성화하고 Material Web의 field `end-start` → menu `start-start` zero-offset 배치를 사용함. Select option은 일반 Menu의 48px selected/check anatomy를 재사용하지 않고 56px container, 현재 option focus state와 3px inward focus ring을 사용함
- component CSS의 system token 직접 참조 0건, pointer·keyboard ripple 및 component-scoped reduced-motion 분기 검증
- Figma `md-ref-palette — WCAG`의 250 color variables를 `--md-ref-palette-*`로 변환했다. 18개 solid family × 12 tone, white/black 2개, alpha 32개를 보존하고 실제 Vite `html` computed style에서 250개와 대표 원본 값을 readback했다.
- Figma `md-sys-color — Normal Mode` node를 기준으로 schemes 52개, system/status 20개, state-layer 6개를 분리하고 8개 mode 전체의 624개 alias를 `system.css`에 적용했다. 원본 직접값인 Green `on-background: #171D1A` 한 건은 추정 alias로 바꾸지 않았다. built-in Standard/Light는 CSS alias graph를 사용하고 Dark·High·custom은 기존 TonalSpot 생성 경로를 사용한다.
- Figma `text-styles` node `10425:2587`에서 local Text Style 34개를 readback했다. 모두 Noto Sans이며 Regular 400/Medium 500/SemiBold 600, ORIGINAL case, paragraph spacing/indent 0, variable binding 없음이 확인됐다. 이를 system typescale 204개 속성으로 변환하고 Button/Checkbox/Radio/Tabs/Segmented Button/TextField/Select/Menu/Dialog/Snackbar/Chip이 component token을 통해 tracking과 decoration까지 소비하도록 연결했다.
- Figma Radius `10431:190`, Spacing `10663:6049`, Gap `10663:6146`에서 실제 local variable을 readback해 `number/*` 18개 reference, `space/*` 18개·`gap/*` 17개·`radius/*` 8개 system alias를 정의했다. 모든 8개 color mode의 alias와 최종값이 같아 mode-invariant `:root` token으로 유지하며, component CSS Module은 component token만 소비한다.
- Figma Elevation `10427:2344`의 local Effect Style 5개를 실제 effect 배열 순서대로 system level에 적용했다. 보드 설명 15%/30%와 달리 실제 color binding은 `alpha/black/100=#0000001F` 12%, `alpha/black/300=#00000052` 32%이며 실행 style binding을 권위로 사용한다. M3 Dialog 28px처럼 Figma scale에 없는 독립 geometry는 인접 radius에 스냅하지 않는다.
- 실제 Vite Theme Lab에서 Normal/Light의 root inline primary가 비어 있고 computed `primary=#007C8C`, `surface=#F6F9FF`, `good=#00B09B`, `state-layer-table-selected=#0081921F`, Filled Button component token `#007C8C`임을 readback했다. Pink 전환은 `primary`와 Filled Button token이 `#9A0057`로 함께 바뀌었고, Pink/Dark는 MCU inline `primary=#FFB0CB`를 적용했다.
- reduced-motion에서도 Material Web ripple의 450ms grow·105ms fade-in·225ms 최소 표시·375ms fade-out이 실제 사용자 탭에서 유지됨
- TextField는 resting/floating 이중 label을 측정해 150ms WAAPI 전환하고, Checkbox는 350ms 선택·150ms 해제 motion을 유지함
- 실제 사용자 탭의 `prefers-reduced-motion: reduce` 환경에서도 Select option opacity가 `0.817/0.483/0.150`에서 `1/1/1`로 진행되고, 닫았다 다시 여는 반복 수명주기에서도 popup이 빈 면으로 남지 않음을 확인함
- Stable Material Web catalog/source 품질 기준으로 기존 8개 MVP를 재검증하고 Chip에는 pinned Assist/Filter/Input/ChipSet semantics를 적용했다. TextField/Select measured-label과 active/inactive layered outline, Select/Menu explicit open-state lifecycle, Checkbox two-rect mark morph, pointer-origin ripple, Dialog staged motion, Snackbar 공통 press interaction으로 교정함
- clean in-app browser tab에서 Select 첫 열기·닫기·재열기, Menu 닫힘 후 item 제거와 재열림 복원, Checkbox 선택/해제, TextField empty resting→floating, Button ripple, Dialog 단계 open/close, form submit→Snackbar를 실제 Vite 진입점으로 재확인함. 증거는 `docs/audits/2026-08-26-material-web-quality-baseline/`에 보관함
- 후속 사용자 재현으로 Select Portal ref가 Floating UI positioning 전에 측정되어 `0px -> 0px` 높이 animation을 시작하는 불안정성이 확인됨. 1차로 positive geometry 대기를 적용했고, 하단 공간 부족 follow-up에서 이것만으로는 final side/좌표 확정을 보장하지 못한다는 점을 확인함
- 현재 adapter는 Positioner의 실제 `data-side`, non-zero opacity, 두 frame 연속 stable rect를 기다린 후 viewport-clamped `offsetHeight`로 motion을 시작함. full-size Popup은 위치 계산 shell로 유지하고 nested `menu-surface`만 높이/opacity를 전환해 Floating UI가 중간 높이를 근거로 `bottom → top` flip하는 점프를 차단함. 위쪽 surface는 shell bottom에 고정하고 Material Web처럼 content에만 역방향 translate를 적용함. 선택 option focus/`scrollIntoView`는 열림 완료 뒤로 지연하며, 12 frame 내 배치 실패는 즉시 usable surface로 fail-open함. 근거·검증 한계·회귀 사양은 `docs/audits/2026-08-26-material-web-select-constrained-placement/`에 보관함
- 후속 official/current 동시 비교에서 기존 Select가 4px gap, 48px option, selected container/check icon, 현재 option focus ring 누락으로 Material Web과 다름을 확인했다. zero offset, Select 전용 56px option token, no-check selection, 현재 option focus/ring으로 교정하고 `Desktop application` 선택 후 재열림까지 실제 Vite에서 확인했다. 증거는 `docs/audits/2026-08-26-material-web-select-behavior-comparison/`에 보관함
- 현재 준수 감사의 P1/P2 코드 조치를 완료했다. Checkbox/Menu/Select option은 공통 state/ripple/focus primitive를 사용하고, Menu는 공식 `--md-menu-item-*`/`--md-list-item-*` token surface를 소비한다. Snackbar는 실제 줄바꿈을 측정해 68px two-line anatomy를 적용한다.
- `DialogPrimitive`와 bootstrap deep import를 제거하고 `DialogClose`/`applyInitialTheme` adapter를 공개했다. `Checkbox`, `Select`, `Dialog`, `Menu`는 root `className`/`style` token override를 지원한다.
- manifest를 governance schema로 확장하고 Select의 M3 Text field + Menu composite 및 Chip 근거를 고정했다. 단순 native Button/IconButton에는 screen-reader 수동 검증을 일괄 요구하지 않고 forced-colors만 남겼다. 나머지는 실제 announcement가 필요한 흐름과 forced-colors가 남아 있어 `BLOCKED`이며 자동 검증만으로 `PASS`로 승격하지 않는다.

## 최신 검증

- 2026-09-03 Cloudflare Pages production 최초 게시: `/`와 `/components`가 모두 HTTP 200으로 응답했고 Cloudflare edge 응답 및 SPA deep-link fallback을 확인했다.
- `.github/workflows/cloudflare-pages.yml`은 `main` CI 성공 revision만 checkout·build하여 production에 배포하도록 연결했다. Cloudflare API token은 Pages Write 최소 권한으로 GitHub repository secret에 저장했다.
- `pnpm validate:structure`: PASS
- `pnpm lint`: PASS
- `pnpm typecheck`: PASS
- `pnpm test:unit`: 7 suites, 27 tests PASS
- `pnpm build`: PASS
- `pnpm build:storybook`: PASS
- 이번 Material Web 품질 교정 후 `pnpm verify`: PASS (structure, lint, typecheck, Vitest 7 tests, Vite build, Storybook build)
- Select option anatomy/position/focus 교정 후 `pnpm verify`: PASS (structure, lint, typecheck, Vitest 7 tests, Vite build, Storybook build)
- Select constrained-placement lifecycle 재구성 후 `pnpm verify`: PASS (structure, lint, typecheck, Vitest 7 tests, Vite build, Storybook build)
- 감사 개선 후 `pnpm test:unit`: 3 suites, 9 tests PASS
- 감사 개선 후 Chromium 실제 Vite E2E: 8 tests PASS
- 감사 개선 후 `pnpm test:e2e`: Chromium/Firefox/WebKit, 24 tests PASS
- Figma reference palette 변환 후 `pnpm verify`: PASS (structure, lint, typecheck, Vitest 4 suites/12 tests, Vite build, Storybook build)
- Figma system color 적용 후 `pnpm verify`: PASS (structure, lint, typecheck, Vitest 5 suites/16 tests, Vite build, Storybook build)
- Figma Text Style 적용 후 `pnpm verify`: PASS (structure, lint, typecheck, Vitest 6 suites/19 tests, Vite build, Storybook build)
- Figma Text Style 적용 후 `pnpm test:e2e`: Chromium/Firefox/WebKit 24 tests PASS. 실제 Vite에서 Noto Sans와 Button 14px/20px/500/0.1px computed style을 확인했다.
- Figma spatial/elevation 적용 후 `pnpm verify`: PASS (structure, lint, typecheck, Vitest 7 suites/23 tests, Vite build, Storybook build).
- Figma spatial/elevation 적용 후 `pnpm test:e2e`: Chromium/Firefox/WebKit 24 tests PASS. 실제 Vite에서 leading-icon Filled Button 16px/24px, radius 999px, Elevated Button의 12%/32% 두-layer shadow를 computed style로 확인했다.
- Figma Chip 적용 후 `pnpm verify`: PASS (structure, lint, typecheck, Vitest 7 suites/25 tests, Vite build, Storybook build).
- Figma Chip 적용 후 `pnpm test:e2e`: Chromium/Firefox/WebKit 27 tests PASS. 실제 Vite에서 네 type, Filter 선택, Input 삭제, ChipSet roving focus, ripple과 주요 geometry/typography를 확인했다.
- Component Verification 적용 후 `pnpm test:e2e`: Chromium/Firefox/WebKit 30 tests PASS. 실제 `/components` route, 전체 group heading, 주요 state interaction, Dialog focus return, Snackbar와 375px overflow를 확인했다.
- Figma/MD3 Chip 재교정 후 `pnpm verify`: PASS (structure, lint, typecheck, Vitest 7 suites/27 tests, Vite build, Storybook build). Filter 4/2/2px label inset, Input 16/10/10px start padding·remove-only·취소 가능한 제거, Location 비대화형 표시 계약을 포함한다.
- Figma/MD3 Chip 재교정 후 `pnpm test:e2e`: Chromium/Firefox/WebKit 30 tests PASS. 실제 `/components`에서 Filter/Input size×state 매트릭스, ChipSet 방향키, Input 제거, Location no-button/24px/compact width를 확인했다.
- Figma/MD3 Button 구현 후 `pnpm verify`: PASS (structure, lint, typecheck, Vitest 7 suites/28 tests, Vite build, Storybook build).
- Figma/MD3 Button 구현 후 `pnpm test:e2e`: Chromium/Firefox/WebKit 33 tests PASS. 실제 `/components`에서 360-variant 축, geometry/typography, error/disabled color와 disabled Outlined size별 composition, 48px hit target과 hover/focus/pressed/ripple을 확인했다.
- Figma/MD3 Checkbox 구현 후 `pnpm verify`: PASS (structure, lint, typecheck, Vitest 7 suites/29 tests, Vite build, Storybook build).
- Figma/MD3 Checkbox 구현 후 `pnpm test:e2e`: Chromium/Firefox/WebKit 36 tests PASS. 실제 `/components`에서 90-variant 축, 3-size geometry와 centered icon, error/mixed/disabled semantics, 48px touch target과 hover/focus/pressed/ripple을 확인했다.
- Figma/MD3 IconButton 구현 후 `pnpm verify`: PASS (structure, lint, typecheck, Vitest 7 suites/29 tests, Vite build, Storybook build).
- Figma/MD3 IconButton 구현 후 `pnpm test:e2e`: Chromium/Firefox/WebKit 39 tests PASS. 실제 `/components`에서 75-variant 축, 3-size geometry, 5 style color와 disabled 우선순위, 48px hit target, action/toggle accessible name·`aria-pressed`, hover/focus/pressed/ripple을 확인했다.
- Figma/MD3 Radio 구현 후 `pnpm verify`: PASS (structure 10 manifest entries, lint, typecheck, Vitest 7 suites/31 tests, Vite build, Storybook build).
- Figma/MD3 Radio 구현 후 `pnpm test:e2e`: Chromium/Firefox/WebKit 42 tests PASS. 실제 `/components`에서 30-variant 축, 3-size icon/state-layer geometry, selected/unselected/disabled 색상, named radiogroup와 방향키 단일 선택, 48px touch target, hover/focus/pressed/ripple을 확인했다.
- Figma/MD3 Tabs 구현 후 `pnpm verify`: PASS (structure 11 manifest entries, lint, typecheck, Vitest 7 suites/33 tests, Vite build, Storybook build).
- Figma/MD3 Tabs 구현 후 `pnpm test:e2e`: Chromium/Firefox/WebKit 45 tests PASS. 실제 `/components`에서 40px container, 16/10px padding, 2px gap, 14/20/600/0.1 typography, 20px trailing glyph, 3px full-width indicator, manual activation, disabled discoverability/non-selection, tab-panel 연결과 hover/focus/pressed/ripple을 확인했다.
- Figma/MD3 Switch 구현 후 `pnpm verify`: PASS (structure 12 manifest entries, lint, typecheck, Vitest 7 suites/34 tests, Vite build, Storybook build).
- Figma/MD3 Switch small-only 재구성 후 `pnpm test:e2e`: Chromium/Firefox/WebKit 48 tests PASS. 실제 `/components`에서 32×18px track, 12px handle/icon, 24px state layer, 1px outline/color, 48px touch target, click/Space/Enter, form, disabled, hover/focus/pressed/ripple을 확인했다. Windows local run은 동일 범위를 1 worker로 직렬 실행한다.
- 2026-09-02 Linux visual gate 폐기: CI visual job, public visual scripts, Playwright visual project와 구조 validator의 6 PNG requirement를 제거했다. 기존 PNG는 삭제하지 않고 역사적 증거로 유지한다.

## 다음 유효 작업

1. Snackbar status, TextField 오류·설명, Checkbox mixed state, Radio group 위치·선택 변경, Tabs 위치·선택·panel 문맥, Select/Menu/Dialog/ChipSet의 상태·포커스 announcement를 대표 screen reader/browser 조합에서 검증한다.
2. Windows Contrast Themes에서 경계, focus, selected, disabled, error와 icon 가시성을 검증한다.
3. 모든 적용 가능 blocker가 닫힌 component만 manifest를 `PASS`로 승격한다.

세부 구현·검증 증거는 [UI 구현 상태](../03-delivery/09-UI-IMPLEMENTATION-STATUS.md), 미결 게이트는 [OPEN-QUESTIONS.md](OPEN-QUESTIONS.md)를 따른다.
