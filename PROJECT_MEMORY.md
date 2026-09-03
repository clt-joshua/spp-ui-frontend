# Project Memory

This is the compact entry point for future project work. Detailed state lives in [CURRENT-STATE.md](docs/project-memory/CURRENT-STATE.md).

## Identity

- Project: `spp-ui-frontend`
- Product: customizable React UI foundation based on stable Material Design 3 for Web
- Current phase: 2026-09-03 Figma/MD3 small-only Switch, Tabs, Radio 30-variant, IconButton 75-variant, Button 360-variant, Checkbox 90-variant와 Chip 교정이 `/components` verification workspace에 구현됨; applicable screen-reader and Windows forced-colors review remains
- Representative host: Vite 8 + React 19 + TypeScript
- Canonical UI boundary: `src/ui`

## Invariants

- Current user intent and accepted project decisions outrank code, tests, and harnesses.
- Base UI 1.7 is the internal behavior authority; app code only consumes `src/ui` public exports.
- Material Web is reference-only; `@material/web` and Lit are not runtime dependencies.
- Styling follows reference → system → component CSS variables and CSS Modules.
- Theme scope is eight Figma system-color presets plus custom `#RRGGBB`, Light/Dark/System, Standard/High. Standard/Light presets use the checked-in Figma aliases; Dark, High, and custom configurations use TonalSpot generation.
- Theme roles are applied to `documentElement` so body Portal content inherits the same theme.
- Noto Sans Variable and Material Icons Filled are self-hosted defaults behind replaceable tokens/adapters.
- MVP components are Button, IconButton, TextField, Checkbox, Radio, Select, Dialog, Menu, Snackbar, and Chip (Assistive, Filter, Input, Location). Tabs, Switch, and Segmented Button are post-MVP public extensions.
- Theme Lab is the representative product flow for Theme, form, overlay, keyboard/focus, storage, and feedback checks. `/components` is the application-facing inventory for every public component's variant, size, state, and interaction matrix.
- Storybook and unit tests are supporting evidence; actual Vite entry-point E2E is required.
- Implemented does not mean M3 compliant. Only blocker-free records may move from `BLOCKED` to `PASS`.
- CI authority is Node 24 quality and Chromium/Firefox/WebKit E2E. The former Chromium/Linux screenshot baseline was retired from completion and merge criteria on 2026-09-02.

## Current evidence

- 외부 검증용 production이 `https://spp-ui-frontend.pages.dev/`에 게시됐고 `/components` deep link도 직접 접근 가능하다. `main`의 `CI` 성공 revision만 `.github/workflows/cloudflare-pages.yml`을 통해 Cloudflare Pages project `spp-ui-frontend`에 자동 배포한다. 자격 증명은 GitHub repository secret으로 격리하며 현재 임시 토큰 만료일은 2026-12-03이다.
- Theme Runtime, token graph, interactions, all ten MVP components, and the Tabs, Switch, and Segmented Button extensions are implemented.
- Figma `md-ref-palette — WCAG` node의 250 color variables를 `--md-ref-palette-*` reference CSS tokens로 변환했다. 18 solid families, white/black, alpha colors와 원본의 `25 = darkest → 950 = lightest` 방향을 보존한다.
- Figma `md-sys-color — Normal Mode` node의 78 color roles를 8개 mode(`normal`, `pink`, `yellowgreen`, `purple`, `blue`, `green`, `orange`, `red`) 전체에 대해 `src/ui/tokens/system.css`의 reference alias로 적용했다. built-in Standard/Light는 이 정적 system graph를 사용하고 component token은 기존 semantic role을 통해 즉시 소비한다.
- Figma `text-styles` node `10425:2587`의 로컬 Text Style 34개를 Noto Sans Variable 기반 system typescale로 변환했다. 각 role은 font/size/line-height/weight/tracking/decoration 6개 속성을 가지며 Button, Checkbox, Radio, Tabs, Segmented Button, TextField, Select, Menu, Dialog, Snackbar, Chip component token이 전체 속성 묶음을 소비한다.
- Figma spatial 보드 3개와 elevation Effect Style을 실제 local variable/style binding으로 readback했다. `number/*` 18개 reference → `space/*` 18개, `gap/*` 17개, `radius/*` 8개 system alias → component token 계층을 적용했고, elevation 5개는 `alpha/black/100` 12%와 `alpha/black/300` 32%의 두 layer 순서를 보존한다. 보드 문구 15%/30%와 실제 binding이 다른 경우 실행 style을 권위로 사용한다.
- Checkbox/Menu/Select option share StateLayer, Ripple, and FocusRing; Menu consumes official `--md-menu-item-*`/`--md-list-item-*` aliases.
- Snackbar measures wrapped content and consumes the 68px two-line container token; one-line remains 48px.
- Chip은 Figma node `10463:4107`, `10560:12598`, `10560:12744`, `10563:12834`의 Assistive/Filter/Input/Location 속성을 component token으로 변환했다. 2026-09-02 재검증에서 Filter 비선택 label inset 4/2/2px, Input start padding 16/10/10px, `removeOnly`와 취소 가능한 실제 제거를 복원했다. ChipSet은 Material Web toolbar roving focus를 사용하고, Location은 원본처럼 button/ripple/focus가 없는 24px 비대화형 compact 표시로 분리한다.
- Button은 Figma node `10429:72459`의 360개 조합을 `large/medium/small × filled/outlined/text/elevated/tonal × error × content` API와 component token으로 변환했다. 40/32/24px visual height, 20/16/12px padding, size별 typography/icon과 disabled Outlined 색상, style별 error/disabled color를 적용하면서 실제 hover/focus/pressed, native form semantics, ripple과 48px touch target을 유지한다.
- IconButton은 Figma guide `10724:16368`와 executable set `10446:79757`의 75개 조합을 `large/medium/small × standard/filled/tonal/outlined/error × interaction/disabled` API와 component token으로 변환했다. 40/32/24px visual container, 24/20/16px icon, 8/6/4px padding을 적용하면서 48px touch target, action/toggle `aria-pressed`, 선택 전후 접근명, 실제 hover/focus/pressed와 pointer·keyboard ripple을 유지한다. 가이드 캡션과 실행 property의 size 이름 충돌은 실행 property를 권위로 사용한다.
- Checkbox는 Figma node `10466:23091`의 90개 조합을 `large/medium/small × checked/indeterminate/unselected × error × interaction/disabled` API와 component token으로 변환했다. 16/16/12px visual container, 24/22/16.5px icon canvas, 36/32/24px state layer와 error/disabled 색상을 적용하면서 native form·keyboard·mixed semantics와 48px touch target을 유지한다.
- Radio는 Figma guide `10724:12073`와 executable set `10466:24840`의 30개 조합을 `large/medium/small × selected/unselected × interaction/disabled`로 변환했다. 24/20/16px icon, 36/32/24px state layer, 6/6/4px padding과 primary/on-surface-variant 색상을 적용하면서 이름이 있는 단일 선택 group, native form projection, 방향키/Space, 48px touch target과 pointer·keyboard ripple을 유지한다. guide caption과 실행 property의 size 이름 충돌은 실행 property를 권위로 사용한다.
- Tabs는 Figma guide/executable section `10724:12784`를 40px container, 16/10px padding, 2px gap, label-large-prominent, optional 20px trailing glyph, 3px full-width indicator로 변환했다. 공개 `Tabs`/`TabList`/`Tab`/`TabPanel`은 manual activation 기본, Arrow/Home/End roving focus, Enter/Space 선택, disabled discoverability/non-selection, tab-panel ARIA 연결과 indicator motion을 유지한다. guide caption과 executable State 이름 충돌은 value selection과 실제 interaction state를 분리해 처리한다.
- Switch는 Figma section `10724:13609`와 executable set `10467:34474`에서 small 10개 조합만 채택했다. 공개 size prop과 large/medium token/CSS/story/test matrix를 제거하고 track 32×18px, handle/icon 12px, state layer 24px, outline 1px를 generic component token으로 적용한다. 48px touch target, `role=switch`, Space/Enter, native form projection, 취소 가능한 변경과 actual ripple/focus는 유지한다.
- Segmented Button은 Figma section `10724:13951`의 start/middle/end 81개 variant와 `Segments=5, Density=-2` composition을 `SegmentedButtonSet`/`SegmentedButton`으로 구현했다. 32px container, 12px padding, 8px gap, 18px icon, 48px radius/touch target을 component token으로 적용하며 native button, `role=group`, `aria-pressed`, single 비해제와 multiple toggle을 유지한다. Figma Light 전용 `custom-container`은 정적 Light에서 원본을 유지하고 Dark·High·custom 생성 scheme에서는 MCU `secondary-container/on-secondary-container` 쌍으로 폴백해 selected content 대비를 보존한다. Stable Material Web 공개 문서가 없어 Labs source는 행동 교차 검증에만 사용하고 runtime import는 하지 않는다.
- `/components` 검증 페이지는 Actions, Navigation, Form fields, Selection controls, Chips, Dialogs, Menus, Feedback 8개 그룹에서 13개 공개 컴포넌트의 전체 주요 상태를 실제 `src/ui/index.ts` export로 렌더링한다. 그룹 메뉴는 포함 컴포넌트 이름과 수량을 함께 표시한다. Theme Lab 상단과 모바일에서도 진입할 수 있고 Theme token을 그대로 상속하며 Segmented Button single/multiple, Switch/Tabs/Radio/Filter/Input/Dialog/Snackbar 상호작용과 375px overflow를 E2E로 검증한다.
- `DialogClose` and `applyInitialTheme` keep Base UI and bootstrap internals behind `src/ui/index.ts`; the structure validator rejects app deep imports.
- The manifest now follows the governance traceability schema and reports all thirteen implemented public components as `BLOCKED`: Switch/Button/IconButton await forced-colors evidence, and components with descriptions, dynamic state, composite focus, or live regions also await applicable screen-reader evidence.
- Vitest: 7 suites, 36 tests PASS; Figma Button/IconButton/Chip/Checkbox/Radio/Tabs/Switch/Segmented Button API와 interaction/form/ARIA contract, reference/system color alias, 34×6 typography, 18 number/43 spatial/5 elevation token integrity, component mapping, Theme Runtime 분기를 포함하며 Vite/Storybook production build도 PASS했다.
- Playwright: Chromium/Firefox/WebKit actual Vite flow 51 tests PASS, including Segmented Button anatomy/single/multiple/disabled-selected, Switch small-only anatomy and binary form behavior, Tabs anatomy/manual activation/panel linking, Button 360-variant, IconButton 75-variant, Checkbox 90-variant, Radio 30-variant axes, 48px touch target, error/disabled/state interaction, `/components` inventory, Chip selection/removal/toolbar focus, 999px radius, 12%/32% elevation computed readback, Checkbox/Menu/Select interaction and two-line Snackbar regression coverage. Windows local runs serialize the same three-browser scope to avoid observed headless Firefox SWGL/zero-frame contention.
- axe representative flow: critical/serious 0.
- Historical visual evidence: 기존 Light/Dark × mobile/tablet/desktop 6 PNG는 과거 감사 증거로 보존하지만 구조 필수 파일, CI gate 또는 현재 시각 권위로 사용하지 않는다.
- Compliance blockers: DOM/axe가 실제 announcement를 확정할 수 없는 status·description·composite-focus 흐름의 screen-reader 결과와 현재 지원 범위인 Windows Contrast Themes forced-colors 렌더링.
- Motion regression fix: no global `0ms` override; Material Web의 ripple, field/checkbox state feedback와 `quick=false` Select/Menu 열림·닫힘 모션은 reduced-motion에서도 유지한다.
- Field/menu geometry: outlined label은 Material Web식 start/notch/end panel로 렌더링해 실제 좌우 notch gap 4px/4px를 보장하고, leading icon 12px start·24px size·16px label gap과 Select/Menu icon 24px를 component token으로 유지한다.
- Select authority correction: Base UI의 선택 option 겹침 정렬을 끄고 Material Web의 field `end-start` → menu `start-start` zero-offset 배치를 사용한다. Select option은 일반 Menu item과 분리된 56px anatomy를 사용하고, 고정 selected container/check icon 대신 열림 시 현재 option focus·state layer·3px inward focus ring을 표시한다. 닫힘 animation의 fill state를 다음 열림에서 취소하고 open sequence를 재시작해 반복 open/close/open 뒤에도 option opacity `1`을 유지한다.
- Material Web quality baseline: Stable catalog와 source의 실제 모션 계약을 기존 8개 MVP 컴포넌트 기준선으로 고정했고 Chip에는 pinned Assist/Filter/Input/ChipSet 동작 계약을 적용했다. TextField/Select는 공통 measured-label과 layered outline, Select/Menu는 explicit open lifecycle, Checkbox는 two-rect mark morph, Button/IconButton/Chip은 pointer-origin ripple, Dialog는 staged surface/content/action motion, Snackbar action은 공통 interaction primitive를 사용한다.
- Current remediation evidence: `docs/audits/2026-08-26-material-web-quality-baseline/`의 clean-tab capture와 DOM readback으로 Select/Menu 반복 open-close-reopen, checkbox, field label, ripple, dialog, snackbar 실제 Vite 흐름을 확인했고 `pnpm.cmd verify`가 PASS했다.
- Select constrained-placement lifecycle: Portal mount만으로 열림을 시작하지 않는다. `useMaterialMenuMotion`은 Base UI Positioner의 실제 `data-side`, non-zero opacity, 두 frame 연속 동일한 rect를 기다린 뒤 viewport에 clamp된 `offsetHeight`로 모션을 시작한다. Base UI collision 계산이 animation 중인 `0 → full` 높이를 다시 읽어 `bottom → top`으로 flip하지 않도록 full-size Popup을 position shell로 고정하고 nested `menu-surface`만 height/opacity animation한다. `side=top` surface는 shell bottom에 고정하고 Material Web처럼 내부 content에만 역방향 translate를 적용한다. 선택 option의 focus/`scrollIntoView`는 열림 완료까지 지연하고, 12 frame 내 배치 실패 시 즉시 usable surface로 fail-open한다. 회귀 사양과 근거는 `docs/audits/2026-08-26-material-web-select-constrained-placement/`에 기록한다.
- Select visual contract correction: official/current 832×752 capture에서 기존 4px gap·48px option·selected container/check icon·focus ring 누락을 확인했다. `sideOffset=0`, Select 전용 56px option token, 현재 option focus state/inward ring으로 수정했으며 선택 후 재열림까지 `docs/audits/2026-08-26-material-web-select-behavior-comparison/`에서 확인했다.

## Navigation

- [Current state](docs/project-memory/CURRENT-STATE.md)
- [Open verification gates](docs/project-memory/OPEN-QUESTIONS.md)
- [Accepted decisions](docs/project-memory/DECISION-INDEX.md)
- [UI implementation evidence](docs/03-delivery/09-UI-IMPLEMENTATION-STATUS.md)
- [M3 governance](docs/00-governance/00-M3-WEB-COMPLIANCE.md)
- [Theme contract](docs/02-architecture/04-TOKENS-AND-DYNAMIC-THEME.md)
- [Component contract](docs/02-architecture/05-COMPONENTS-AND-INTERACTIONS.md)

## Next valid action

Complete the remaining evidence gates without weakening the current app flow: applicable screen-reader announcements와 Windows Contrast Themes forced-colors 상태를 검증한 뒤 blocker-free manifest entries만 승격한다. Linux pixel baseline은 더 이상 요구하지 않는다.

## Update rule

When a decision, phase, blocker, dependency baseline, or verified flow changes, update this file and the matching detailed memory in the same change.
