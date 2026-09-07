# Project Memory

2026-09-07 커밋 요청: 검증된 드롭다운 피드백 및 Button/IconButton Ripple 누적 변경을 `main`의 로컬 커밋으로 보관한다. 푸시·배포는 요청 범위가 아니며 공개 사이트는 기존 `4c9ca38` revision이다. 아래 미커밋 표기는 각 검증 당시 이력이다.

최신 검증 완료(Ripple 교정): `pnpm verify` PASS(9 suites/46 unit), Chromium/Firefox/WebKit 각 58개·전체 **174/174 PASS**(`--retries=0`, 단일 실행 14.9분). 실제 5174 Theme Lab의 Light/Dark grow 중간 프레임·IconButton edge origin 및 `/components` 진입을 확인했다. 산출물 `index-C5SHrcCV.js` / `index-C1-ci9f6.css`. [검증 기록](docs/audits/2026-09-07-button-ripple/README.md). 기존 준수 BLOCKED는 유지하며 커밋·푸시·배포 없음.

2026-09-07 최신 작업: 사용자 승인에 따라 Button pressed 전체 wash를 제거하고 Light/Standard Figma black 16%를 Ripple에 한 번만 적용한다. Dark/High는 전경색 10%, IconButton은 모든 테마에서 전경색 10%와 실제 pointer origin을 사용한다. 40/32/24px container·8/6/4px padding 및 48px touch target은 보존한다. 최종 검증은 [Ripple 감사](docs/audits/2026-09-07-button-ripple/README.md)에 기록한다. 기존 드롭다운 변경과 준수 BLOCKED를 유지하며 미커밋·미배포다. 아래 최신 수치는 이전 artifact의 이력이다.

최신 검증(드롭다운 피드백 교정, 2026-09-07): `pnpm verify` PASS(9 suites/46 tests), Chromium/Firefox/WebKit 각 54개·전체 162/162 단일 실행 PASS(`--retries=0`, 10.4분). 실제 5174 pointer/keyboard 구분·Space 선택·Escape 메뉴 제거와 trigger 복귀도 확인했다. Menu/Submenu는 같은 controlled open 및 열림 완료 후 item focus/닫힘 완료 후 명시적 unmount를 사용한다. 산출물 `index-CBUund-u.js` / `index-CTGbOFWj.css`. 전환 중 raw held press의 경계 관찰 및 기존 수동 접근성·정책 blocker는 [드롭다운 감사](docs/audits/2026-09-07-dropdown-feedback/README.md)에 남겼고 전체 M3 PASS로 승격하지 않는다. 커밋·배포 없음. 아래 이전 검증 수치는 당시 이력이다.

2026-09-07 드롭다운 피드백 후속: 실제 5174에서 pointer-highlight/모든 option focus가 secondary grow/shrink ring을 켜는 문제를 재현했다. Figma listItem `10742:16969`/drawMenu `10742:17727`을 MCP로 확인하여 Menu·Select·AutoComplete의 Light/Standard hover·Menu checked를 단일 black 6% wash, 바탕을 surface-container-lowest로 연결했다. 키보드 표시만 정적 중성 3px ring으로 남긴다. Dark/High는 on-surface 상태색을 사용한다. 이는 사용자 요청에 따른 scoped 시각 예외이며 기존 geometry·메뉴 모션·선택 의미와 준수 BLOCKED를 보존한다. [드롭다운 감사](docs/audits/2026-09-07-dropdown-feedback/README.md)를 최신 근거로 사용한다. 이 수정은 아직 커밋·배포하지 않았다.

이전 게시 요청 완료 기록: `4c9ca38f334fc0c6b3ddc750c900b28933ab551f`의 CI `34088220968`과 Pages `34088690691` 성공, 공개 `/components`와 배포 산출물 동일성을 확인했다. 아래의 게시 대기/배포하지 않았다는 기록은 그 완료 전 이력이다. 이번 드롭다운 수정의 게시 완료를 의미하지 않는다.

2026-09-07 WebKit 게시 게이트 후속: `bad8a02` main CI에서 WebKit 35 PASS/6 FAIL/1 flaky로 배포가 차단됐다. 같은 Linux 컨테이너/앱의 비교에서 150ms label animation은 두 모드 모두 생성됐지만 headless frame이 34→1325ms로 지연되고 Xvfb 화면 모드에서는 6→67→126ms 중간 상태를 관찰했다. [WebKit 교정 감사](docs/audits/2026-09-07-webkit-release/README.md)에 근거를 기록하고 CI 및 container runner의 WebKit만 Xvfb headed로 실행한다. 남은 Select/Ripple 회귀는 종료 후 DOM을 늦게 읽는 관찰 경쟁을 생성 시점 기록/원자적 읽기로 교정한다. 제품 코드·Figma token·모션 시간·기대 수치·준수 BLOCKED는 변경하지 않는다. 게시 완료는 최종 main CI/Pages 및 공개 산출물 확인이 필요하다.

2026-09-07 외부 브라우저 검증용 게시 요청: 현재 변경을 기본·배포 브랜치 `main`에 커밋·푸시하고 기존 CI 성공 → Cloudflare Pages 자동 배포 경로를 사용한다. 전체 M3 준수 완료를 의미하지 않으며 기존 BLOCKED 항목은 유지한다. 실제 사용자 브라우저의 SegmentedButton 모션 비가시성은 Windows `SPI_GETCLIENTAREAANIMATION` 조회 성공/값 0(애니메이션 꺼짐), 일반 Chrome 및 앱 내 브라우저의 `prefers-reduced-motion: reduce=true`, 컴포넌트 animation/transition `none`으로 확인했다. 앞선 5174 프레임 감사는 별도 검증 브라우저의 결과이며 사용자가 보는 탭의 기본 모션 환경을 입증하지 않는다. OS/브라우저 설정과 reduced-motion CSS는 변경하지 않았다. 이번 게시 성공 여부는 해당 커밋의 CI/배포 실행과 공개 사이트 readback으로 확인한다.

2026-09-07 최신: 사용자가 SegmentedButton 이전 동작을 거부하여 clip reveal/역방향 transition을 폐기했다. Labs c05b4b2의 nextAnimationState, 0↔26px graphic, SVG dashoffset draw 및 selecting/deselecting keyframe을 React로 이식했다. Figma 18px icon/8px gap/32px 높이/theme와 API는 유지한다. custom icon fade·hide icon 유지·disabled/reduced-motion 정지는 프로젝트 예외이며 런타임 import는 없다. [Labs 교정 감사](docs/audits/2026-09-07-segmented-button-labs/README.md)를 최신 근거로 사용한다. 이전 126 PASS는 이전 구현의 기능 증거일 뿐 Labs 일치 판정이 아니다.

This is the compact entry point for future project work. Detailed state lives in [CURRENT-STATE.md](docs/project-memory/CURRENT-STATE.md).

최신 검증: Labs 이식 후 `pnpm verify` PASS(단위 46개), Chromium/Firefox/WebKit 전체 126/126 단일 실행 PASS(8.2분). 실제 5174 Light/Dark × Standard/High에서 graphic 0→26px와 SVG draw 중간 frame→완료, 그룹 폭 516px 유지, Space toggle과 reduced-motion animation none, page error 0을 확인했다. 산출물은 `index-DfOwUzAP.js` / `index-C_p2ztRC.css`이며 배포하지 않았다.

## Identity

- Project: `spp-ui-frontend`
- Product: customizable React UI foundation based on stable Material Design 3 for Web
- Current phase: 2026-09-07 outlined-only TextField + 독립 Select/AutoComplete와 속성 playground가 14-component `/components` workspace에 연결됨. Figma-bound text contrast 및 기존 Button/Chip/Snackbar 정책, applicable screen-reader/Windows forced-colors 검증은 BLOCKED.
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
- MVP components are Button, IconButton, TextField, Checkbox, Radio, Select, Dialog, Menu, Snackbar, and Chip (Assistive, Filter, Input, Location). Tabs, Switch, Segmented Button, and AutoComplete are post-MVP public extensions.
- Theme Lab is the representative product flow for Theme, form, overlay, keyboard/focus, storage, and feedback checks. `/components` is the application-facing inventory for every public component's variant, size, state, and interaction matrix.
- Storybook and unit tests are supporting evidence; actual Vite entry-point E2E is required.
- Implemented does not mean M3 compliant. Only blocker-free records may move from `BLOCKED` to `PASS`.
- CI authority is Node 24 quality and Chromium/Firefox/WebKit E2E. The former Chromium/Linux screenshot baseline was retired from completion and merge criteria on 2026-09-02.

## Current evidence

- 최신 검증: `pnpm verify` 및 단위 45개 PASS. 동일 artifact `index-8s14Dpfh.js`에서 전체 117 E2E 중 116 PASS 후 WebKit pointer 좌표 측정 기준을 실제 event로 교정했고, 해당 케이스 포함 모션 24개(3-browser) 재실행 PASS. 단일 전체 117 PASS 실행으로 오기하지 않는다. 실제 5174 네 테마 조합의 선택/제출/focus readback도 PASS다.

- 2026-09-07 마이크로 모션 후속: 공식 Material Web `c05b4b2` (관련 파일은 pinned `b4de401`과 동일)을 기준으로 Switch 이동/아이콘, Tabs FLIP/reduced crossfade, Radio dot, 공통 FocusRing/Ripple/hover, Button elevation, field outline, Select arrow/content, Dialog surface를 교정했다. Figma endpoint/API는 유지한다. source에 없는 일괄 reduced-motion 정지를 추가하지 않는다. [최신 모션 감사](docs/audits/2026-09-07-micro-motion/README.md)를 우선하며 기존 대비·정책·수동 검증 blocker는 유지한다.

- Prefix/Suffix 후속 수정: TextField/AutoComplete playground는 샘플 값으로 시작하고 `샘플 값 넣기`/`빈 값으로 테스트`로 상태를 전환한다. 빈 비포커스 affix 숨김은 실제 Material 계약이며 토글에서 입력값/focus를 강제로 바꾸지 않는다. 공유 라벨 motion은 취소 전 현재 pose를 보존해 방향 전환 점프를 제거하고, content는 Material Web식 67ms delay + 83ms emphasized fade를 사용한다. 상세 재현·검증은 [후속 감사](docs/audits/2026-09-07-choice-fields/README.md)의 Prefix/Suffix 절을 참조한다.

- 최신 변경: TextField Filled 제거, 빈 입력 라벨 복귀, 속성 토글 UI, 독립 AutoComplete(자유 입력+제안)와 Select 선택 폼을 제공한다. Select의 비포커스 placeholder 겹침과 disabled option roving navigation도 교정했다. 현재 변경의 검증 상태는 [입력 컴포넌트 후속 감사](docs/audits/2026-09-07-choice-fields/README.md)를 우선한다. Prefix/Suffix·라벨 중간 반전 회귀를 포함한 Chromium/Firefox/WebKit 전체 93개 PASS. 단위 45개와 pnpm verify PASS.

- TextField Figma `10724:14659`: large 48px/small 32px, text/number × 7 state × empty/populated 56개를 실제 state와 component token으로 반영했다. 최신 사용자 결정으로 Filled TextField/API/token을 제거하고 outlined도 focus/value 기반 150ms floating label을 사용한다. 지우기, trailing action, textarea, native constraints, readonly/disabled FormData와 reset을 `/components#form-fields` 실제 폼으로 제공한다. 개발 서버는 다른 프로젝트의 5173 대신 **5174**를 사용한다. [근거·대비 충돌](docs/audits/2026-09-07-text-field/README.md): Light placeholder 최저 1.61:1, affix 3.09:1 등으로 compliance BLOCKED이며 source 색상은 임의 보정하지 않았다.

- 2026-09-07 `/components` 일괄 감사: State 표를 가용 폭까지 확장하고 375/768/1280/1920px의 3-browser 회귀 3개를 추가했다. 기존 E2E 51개와 단위 36개는 PASS지만, 별도 `pnpm audit:components`는 FAIL이다. Normal Light/Standard 43, Light/High 12, Dark/Standard 9, Dark/High 11개 요소에서 문자 대비 미달, Snackbar 3개 동시 표시와 action 포함 알림의 5초 자동 dismiss를 재현했다. Button/Chip/Snackbar manifest에 실제 정책 blocker를 추가했으며 색상/API는 임의 변경하지 않았다. 근거와 후속 조치는 `docs/audits/2026-09-07-component-gallery/README.md`를 참조한다. 이번 결과는 로컬이며 배포하지 않았다.
- 외부 검증용 production이 `https://spp-ui-frontend.pages.dev/`에 게시됐고 `/components` deep link도 직접 접근 가능하다. `main`의 `CI` 성공 revision만 `.github/workflows/cloudflare-pages.yml`을 통해 Cloudflare Pages project `spp-ui-frontend`에 자동 배포한다. 자격 증명은 GitHub repository secret으로 격리하며 현재 임시 토큰 만료일은 2026-12-03이다.
- Theme Runtime, token graph, interactions, all ten MVP components, and the Tabs, Switch, Segmented Button, and AutoComplete extensions are implemented.
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
- Segmented Button은 Figma section `10724:13951`의 start/middle/end 81개 variant와 `Segments=5, Density=-2` composition을 `SegmentedButtonSet`/`SegmentedButton`으로 구현했다. 32px container, 12px padding, 8px gap, 18px icon, 48px radius/touch target을 component token으로 적용하며 native button, `role=group`, `aria-pressed`, single 비해제와 multiple toggle을 유지한다. Figma Light 전용 `custom-container`은 정적 Light에서 원본을 유지하고 Dark·High·custom 생성 scheme에서는 MCU `secondary-container/on-secondary-container` 쌍으로 폴백해 selected content 대비를 보존한다. Stable Material Web 공개 문서가 없어 Labs source는 행동 교차 검증 및 사용자가 요청한 선택 모션의 참고로만 사용하고 runtime import는 하지 않는다.
- `/components` 검증 페이지는 Actions, Navigation, Form fields, Selection controls, Chips, Dialogs, Menus, Feedback 8개 그룹에서 14개 공개 컴포넌트의 전체 주요 상태를 실제 `src/ui/index.ts` export로 렌더링한다. 그룹 메뉴는 포함 컴포넌트 이름과 수량을 함께 표시한다. Theme Lab 상단과 모바일에서도 진입할 수 있고 Theme token을 그대로 상속하며 Segmented Button single/multiple, Switch/Tabs/Radio/Filter/Input/Dialog/Snackbar 상호작용과 375px overflow를 E2E로 검증한다.
- `DialogClose` and `applyInitialTheme` keep Base UI and bootstrap internals behind `src/ui/index.ts`; the structure validator rejects app deep imports.
- The manifest reports all fourteen implemented public components as `BLOCKED`. In addition to applicable screen-reader/forced-colors evidence, TextField/Button/Chip contrast and Snackbar usage-policy conflicts remain; an automated functional PASS is not compliance PASS.
- Vitest: 9 suites, 45 tests PASS; TextField native naming, validation, clear, textarea, readonly/disabled form data와 기존 Figma components/token/runtime 검증을 포함한다. Vite/Storybook production build도 PASS했다.
- Playwright: Chromium/Firefox/WebKit actual Vite flow **전체 93개 PASS** (2026-09-07 Prefix/Suffix·라벨 후속 수정). TextField/Select/AutoComplete 실제 입력·라벨 중간 반전·affix 토글·폼·필터링·상향 메뉴를 포함한다. Windows local runs serialize the same three-browser scope to avoid observed headless Firefox SWGL/zero-frame contention.
- axe representative flow: critical/serious 0.
- Historical visual evidence: 기존 Light/Dark × mobile/tablet/desktop 6 PNG는 과거 감사 증거로 보존하지만 구조 필수 파일, CI gate 또는 현재 시각 권위로 사용하지 않는다.
- Compliance blockers: TextField/Button/Chip의 source-bound 문자 대비, Snackbar 정책 충돌, DOM/axe로 확정할 수 없는 동적 announcement와 Windows Contrast Themes 실제 렌더링. 기능 테스트 PASS와 준수 상태를 구분한다.
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
