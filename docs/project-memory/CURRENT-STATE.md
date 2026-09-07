# 현재 상태

관찰일: 2026-09-07

최신 게시 게이트 교정: [WebKit CI 감사](../audits/2026-09-07-webkit-release/README.md). `bad8a02`의 최초 CI에서 WebKit 6 FAIL/1 flaky/35 PASS를 확인했다. 같은 Linux image의 두 모드에서 150ms 애니메이션 생성은 정상이나 headless 프레임 공백이 최대 약 1.3초였고 Xvfb 화면 모드에서는 중간 frame이 유지됐다. CI 및 container runner의 WebKit 실행을 headed/Xvfb로 정렬하고, 종료 후 Select/Ripple DOM을 뒤늦게 읽던 테스트를 생성 시점 기록/원자적 읽기로 교정한다. 제품 코드와 검증 기대 수치는 변경하지 않는다. 기존 M3 준수 blocker와 실제 Windows reduced-motion 동작은 유지한다. 최종 main CI와 Pages의 커밋 일치 및 공개 앱 검증 뒤 게시 완료로 판단한다.

## 외부 브라우저 검증용 게시

현재 사용자 요청에 따라 누적 변경을 `main`(이 저장소의 기본·배포 브랜치)에 반영하고 기존 CI 성공 revision의 Cloudflare Pages 자동 배포를 사용한다. 이는 임시 외부 검증용 게시이며 M3 준수 BLOCKED를 PASS로 승격하지 않는다. 배포 완료는 해당 커밋의 Actions 실행과 공개 `/components` 산출물 및 실제 흐름으로 판정한다.

모션 비가시성의 실제 환경 원인도 확인했다. Windows `SPI_GETCLIENTAREAANIMATION` 읽기가 성공했고 값은 0(클라이언트 영역 애니메이션 비활성화)이었다. 일반 Chrome과 앱 내 사용자 탭 모두 `prefers-reduced-motion: reduce=true`를 반환하며, 사용자 탭에서 선택 phase는 변경되지만 graphic/check의 transition/animation은 `none`이다. 아래 5174 프레임 감사는 별도 검증 브라우저에서 수행한 결과로, 사용자 탭의 기본 환경과 구분한다. 이 진단 과정에서 OS/브라우저 설정이나 CSS를 변경하지 않았다.

최신 후속: [SegmentedButton Labs 교정](../audits/2026-09-07-segmented-button-labs/README.md). 사용자 거부에 따라 기존 font clip/역방향 transition을 SVG stroke와 selecting/deselecting keyframe으로 대체했다. graphic은 원본처럼 icon+gap 포함 0↔26px. 초기 mount/재활성화의 불필요한 재생은 없고 선택 반전은 원본 keyframe을 재시작한다. Theme Lab → 컴포넌트 검증 → Navigation에서 실제 사용한다. Labs/Lit runtime import와 Stable 승격 없음. 기존 수동 blocker 유지.

## 결론

최신 검증: SegmentedButton Labs 이식 후 `pnpm verify` PASS(9 suites/46 tests), 전체 Chromium/Firefox/WebKit 126/126 PASS(각 42개, 단일 실행, 8.2분). 실제 5174 Normal Light/Dark × Standard/High SVG draw/graphic/Space/reduced-motion 및 page error 0. 산출물 `index-DfOwUzAP.js` / `index-C_p2ztRC.css`, 커밋·푸시·배포 없음. 이전 clip 구현의 126 PASS와 다른 원본 기반 회귀이며 전체 M3 준수 판정은 아니다.

프로젝트는 Vite reference host에서 실행 가능한 Material Design 3 Theme Lab과 Component Verification 단계다. Node 24 toolchain, self-hosted 자산, Theme Runtime, token graph, interaction primitive, 10개 MVP 컴포넌트와 Tabs·Switch·Segmented Button·AutoComplete 확장, Storybook, 단위 테스트와 3-browser E2E가 연결됐다.

개별 컴포넌트의 M3 준수 상태는 `BLOCKED`다. 2026-09-07 전체 검증 페이지 감사에서 일부 Button/Chip/hero 문자 대비와 Snackbar 동시 표시·action timeout 정책의 실제 실패를 추가 확인했다. 따라서 수동 검증만 남은 상태가 아니다. 해당 구현 문제와 적용 가능한 screen-reader announcement, Windows forced-colors 검증을 해결하기 전에는 `PASS`로 표현하지 않는다.

## 2026-09-07 검증 페이지 감사

- 최신 마이크로 모션 후속: [공식 소스 교차 검증](../audits/2026-09-07-micro-motion/README.md). 공통 hover 15ms, FocusRing 150/450ms, Ripple 실제 click/단일 surface/leave 처리, Switch 300ms overshoot, Tabs 250ms FLIP와 reduced crossfade, Radio enter-only scale, Select arrow crossfade와 Dialog surface height를 적용했다. 개별 공식 source의 reduced-motion 정책을 따른다. 실제 5174에서 Normal Light/Dark × Standard/High의 Tabs held/released 상태, Switch click/Space, Select 제출값 `destination=busan`, Dialog Escape/focus return과 page error 0을 확인했다. 독립 AutoComplete/SegmentedButton/Snackbar 전체에는 Stable counterpart가 없으므로 동등성을 과장하지 않는다.

- 후속 사용자 재현으로 fresh Prefix/Suffix 토글의 비가시성과 라벨 중간 반전 점프를 확인했다. playground에 샘플/빈 값 컨트롤을 추가하고, Material Web 기반 공유 라벨 pose 보존 및 input/affix content fade를 적용했다. 실제 5174 Light/Dark에서 typing 이전 affix 표시와 폼 제출 readback을 재확인했다. 기존 색상 대비 및 수동 준수 blocker는 그대로다.

최신 TextField 구현/검증은 [TextField 감사](../audits/2026-09-07-text-field/README.md)를 참조한다. Figma `10724:14659`의 56개 outlined variants를 48/32px 크기, size별 typography/error/focus, 실제 입력 상태로 반영했다. `/components#form-fields`에 textarea/clear/trailing action/validation/FormData/reset 흐름이 있으며 개발 포트는 **5174**다. 최신 사용자 결정으로 Filled TextField를 삭제하고 모든 TextField 라벨을 focus/value 기반으로 이동한다. 독립 AutoComplete와 속성 토글 UI를 추가했다. 최신 검증은 [후속 감사](../audits/2026-09-07-choice-fields/README.md)를 우선하며 Prefix/Suffix·라벨 중간 반전 회귀 포함 전체 E2E 93개가 3-browser PASS했다. Light placeholder·일부 affix 대비가 낮아 compliance BLOCKED이며 해당 색상 결정과 실제 screen-reader/Windows Contrast Themes 검증이 남아 있다.

- State 표 오른쪽 빈 공간을 `inline-size: 100%`로 해결했다. minimum 폭/내부 스크롤/컴포넌트 크기는 보존했으며 375/768/1280/1920px에서 3-browser 새 회귀 3개 PASS.
- 기존 `pnpm verify` 및 실제 앱 E2E 51개 PASS. 새 회귀와 합산 54개이며, MD3 전면 준수를 의미하지 않는다.
- `pnpm audit:components`는 실제 Theme Lab → `/components` 경로의 Normal Light/Dark × Standard/High를 별도 감사한다. 현재 color-contrast 요소 실패 43/12/9/11개와 Snackbar 3개 동시 표시, action 포함 알림의 6초 후 소멸로 FAIL(exit 1)이다.
- Button/Chip/Snackbar manifest에 `M3_WEB_SPEC_CONFLICT` blocker를 추가했다. Figma 색상 보정 우선순위와 Snackbar 정책 후속 구현이 필요하며 이번에는 State 표만 런타임 수정했다.
- [감사 보고서](../audits/2026-09-07-component-gallery/README.md)에 evidence JSON과 화면, 범위/한계를 기록했다. 로컬 검증이며 production에는 배포하지 않았다.

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
| 공개 14개 컴포넌트 | 구현됨, 실환경 증거 대기 | 10개 MVP + Tabs·Switch·Segmented Button·AutoComplete 확장, manifest `implementationStatus=implemented`, `status=BLOCKED` |
| 대표 제품 흐름 | 준비됨 | `/` Theme Lab + 프로젝트 생성 Playground, `/components` 전체 상태 inventory |
| unit/Storybook | 준비됨 | Vitest 9 suites/46 tests, controlled SegmentedButton 선택/재활성화 회귀 포함. Storybook production build PASS |
| E2E | 준비됨 | 최신 Labs 이식 artifact: Chromium/Firefox/WebKit 전체 126/126 PASS(각 42개). SVG draw/선택 phase/원본 keyframe 회귀 9개 포함. 상세는 Labs 교정 감사 |
| 접근성 자동 검사 | 준비됨 | keyboard/focus flow, axe critical/serious 0건 |
| Linux visual baseline | 기준에서 제거됨 | 기존 6개 PNG는 역사적 증거로만 보존; CI/구조/완료 gate 아님 |
| 실제 AT/forced-colors | 미완료 | 적용 가능한 announcement와 Windows Contrast Themes 상태의 수동 검증 필요 |

## 확인된 실제 흐름

- preset preview → root token 변경 → 적용 → localStorage `ui.theme.v1` → reload 복원
- Theme Lab 상단에서 `/components`로 진입 → Actions/Navigation/Form fields/Selection controls/Chips/Dialogs/Menus/Feedback 8개 세부 그룹과 각 그룹의 포함 컴포넌트 이름·수량, 14개 공개 컴포넌트 inventory 확인 → Segmented Button single/multiple·Switch click/Space/Enter·Tabs manual 선택·Radio 단일 선택·Filter 선택·Input 삭제/복원·Dialog focus return·Snackbar 실행 → 375px overflow 0
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
- custom seed swatch/Select는 56px이며 TextField/AutoComplete는 48/32px와 focus/value floating label·size별 supporting geometry를 사용한다. Filled TextField는 삭제됐다. 이전 TextField 56px 시각 증거는 역사적 기준이다.
- outlined TextField label은 Material Web식 start/notch/end panel을 유지하되 Figma large/small의 notch padding 4/2px, leading glyph x=16/8px와 icon 24/16px를 사용한다. Select의 기존 notch/geometry는 바꾸지 않았다.
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

- 2026-09-07 Prefix/Suffix·라벨 후속 수정: pnpm verify PASS, 단위 9 suites/45개 PASS, Chromium/Firefox/WebKit 전체 E2E 93개 PASS (7.2분). 5174 Light/Dark 실제 typing 이전 affix 표시·입력·제안·선택·폼 readback과 page error 0을 확인했다. [최종 증거](../audits/2026-09-07-choice-fields/README.md).

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
