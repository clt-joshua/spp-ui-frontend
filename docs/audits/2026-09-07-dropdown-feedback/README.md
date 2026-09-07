# 드롭다운 hover/focus 피드백 교정

관찰일: 2026-09-07. 대상: Menu, Select, AutoComplete. 기준 checkout: `4c9ca38f334fc0c6b3ddc750c900b28933ab551f`. 이번 변경은 로컬 구현이며 커밋·배포 요청을 포함하지 않는다.

## 원인과 범위

실제 `http://127.0.0.1:5174/`에서 마우스로 Select를 열면 현재 Web application option의 DOM focus와 highlighted는 true, `:focus-visible`은 false인데 ring opacity가 1이었다. ring은 secondary `rgb(177, 203, 209)` 색상의 inward-grow/inward-shrink를 재생했다. 공통 FocusRing이 Base UI `data-highlighted`와 option의 모든 `:focus`를 키보드 포커스로 취급한 것이 원인이다. Select의 추가 `:focus`, AutoComplete의 무조건적인 highlighted ring 규칙도 같은 문제를 만들었다. Menu checked 배경에는 secondary-container가 별도로 들어가 원본에 없는 강조색을 만들었다.

사용자의 과도한 애니메이션·색상 수정 요청에 따라 pointer wash와 keyboard focus를 분리한다. 키보드 탐색 표시를 없애는 것이 아니라 드롭다운 내부에만 정적 중성 3px inward ring을 남긴다. Button 등 다른 컴포넌트의 기본 ring 모션과 운영체제 모션 설정은 변경하지 않는다.

## Figma MCP 원본 확인

파일 `aQ2CfBMmc3q2qD2oDQcnjU`, components page `47909:2`를 read-only 조회했다. section metadata에서 실제 component/instance를 찾고 design context, screenshot, 실제 fills·boundVariables·strokes·reactions를 교차 확인했다. 디자인 파일은 수정하지 않았다.

| 원본 | 조회 결과 | 적용 판단 |
|---|---|---|
| [listItem](https://www.figma.com/design/aQ2CfBMmc3q2qD2oDQcnjU/2026_Design-System--Renuwal-?node-id=10742-16969) | start/enabled 1개 + middle/end × enabled/hovered/selected 6개 | header와 interactive row를 구분 |
| middle/end enabled `10628:68561`, `10733:9691` | white surface, stateLayer fills 없음 | 기본 상태에 강조 배경 없음 |
| middle/end hovered `10628:68563`, `10733:9695` | stateLayer `10728:8551`, `10733:9696`, black alpha 0.05999999865 | Light Standard hover 6% |
| middle/end selected `10691:7567`, `10733:9699` | stateLayer `10728:8568`, `10733:9700`, 같은 black 6% | Menu checked에 같은 중성 wash, hover 이중 합성 금지 |
| [drawMenu](https://www.figma.com/design/aQ2CfBMmc3q2qD2oDQcnjU/2026_Design-System--Renuwal-?node-id=10742-17727), Level01 `10628:68566`, Level02 `10728:9387` | surface-container-lowest, 8px radius, 36px row, body-small, callout 모양 | 이번에는 상태 색상과 바탕만 적용. 기존 M3 Menu 48px/Select 56px anatomy·서브메뉴 구조는 보존 |

hover/selected 모두 `VariableID:10443:74466` (`state-layer/hovered`)에 바인딩되어 있다. row surface는 `VariableID:54795:25762` (`schemes/surface-container-lowest`), label은 `VariableID:54795:25738` (`on-surface`, #1f282d)다. 조회한 interactive row와 stateLayer에 stroke와 prototype reaction은 없다. start/enabled `10628:68557`의 색상은 header의 별도 surface이며 option hover로 사용하지 않는다.

이 variant set에는 focused/pressed/disabled 및 Dark/High 조합이 없다. Figma가 키보드 ring이나 그 애니메이션을 정의했다고 추정하지 않는다. Dark/High의 on-surface 8% hover/selected, 10% focus/pressed는 프로젝트 테마 대응이며 Figma 검증 조합으로 세지 않는다.

## MD3 / Material Web 교차 검토

- [공식 Menu 문서](https://github.com/material-components/material-web/blob/main/docs/components/menu.md)와 [M3 Menus](https://m3.material.io/components/menus/overview)를 기준으로 메뉴 선택·키보드 탐색·dismiss·focus 복귀·disabled를 보존한다. M3 페이지는 텍스트 접근 시 JavaScript shell만 제공하여 상세 구현은 공식 저장소를 사용했다.
- [focus-ring.ts](https://github.com/material-components/material-web/blob/b4de401eb665ec63474f39319a4ba8f2145974cc/focus/internal/focus-ring.ts)는 focusin에서 `:focus-visible`을 판별하고 focusout/pointerdown에서 숨긴다. pointer highlight를 keyboard focus로 승격하지 않는 방향으로 교정한다. AutoComplete는 DOM input focus를 유지하므로 Base UI `onItemHighlighted`의 keyboard reason으로 가상 포커스를 구분한다.
- [focus-ring SCSS](https://github.com/material-components/material-web/blob/b4de401eb665ec63474f39319a4ba8f2145974cc/focus/internal/_focus-ring.scss)의 기본 grow/shrink와 [menu-item SCSS](https://github.com/material-components/material-web/blob/b4de401eb665ec63474f39319a4ba8f2145974cc/menu/internal/menuitem/_menu-item.scss)를 확인했다. 위 3개 파일은 조회일 main과 pinned baseline 내용이 동일했다.
- **명시적 시각 예외:** 사용자의 최신 요청을 우선하여 드롭다운의 기본 secondary ring과 0→8→3px pulse를 on-surface 정적 3px ring으로 변경한다. Light Standard의 black 6/12/16% state wash와 surface-container-lowest도 프로젝트 Figma 선택이다. Material Web 기본 색상·모션과 완전히 동일하다는 주장은 하지 않는다. manifest와 컴포넌트 계약에 같은 예외를 기록한다.
- 기존 hover 15ms 전환, Ripple grow/fade, menu open 500ms/close 150ms, placement와 selected form value는 유지한다. alpha가 이미 있는 state color는 opacity 100%로 사용하고 Ripple은 pressed 색상·opacity를 독립 참조해 double-alpha 및 release 색상 변화를 방지한다.

## 검증

회귀 파일: `tests/e2e/dropdown-feedback.spec.ts`. 실제 `/`의 Theme 선택 → Select/Menu와 `/components`의 AutoComplete를 조작한다. Light/Dark × Standard/High, normal/reduced motion에서 pointer-open/hover ring 없음, keyboard static ring, 선택·trigger 복귀·가상 포커스·중복 state wash·held ripple alpha를 검증한다. 기존 foundation의 pointer-open ring 기대는 실제 제품 계약을 위반하므로 제거하고 별도의 keyboard ring 검증으로 대체했다. 테스트 기대를 제품보다 우선하는 기존 부분을 교정한 것이며 키보드 표시 요구는 유지한다.

최종 전체 검증은 아래 결과를 따른다. 전체 컴포넌트 준수 PASS가 아니며 기존 screen-reader/실제 Windows Contrast Themes 수동 검증과 다른 컴포넌트의 정책·대비 BLOCKED는 유지한다.

첫 교차 브라우저 실행에서 Firefox는 방향키로 이동한 DOM focus에도 `:focus-visible=false`가 유지되어 ring이 사라지는 실패를 재현했다. 실제 trigger/popup keydown capture와 pointer capture로 Menu/Select의 입력 방식을 보완하여 keyboard일 때만 focused item에 표시한다. 서브메뉴도 같은 adapter를 사용하며 DOM 키 이벤트를 취소하지 않는다. 또한 공통 selector specificity 변경으로 기존 Tabs reduced-motion rule이 덮인 실패를 기존 회귀에서 발견해 media rule을 같은 specificity로 복구했다. 두 실패의 기대값은 약화하지 않았다.

키보드→pointer 전환 후 Chromium이 `:focus-visible`을 유지하는 경우에도 배경이 focus 12%에 남지 않도록 pointer mode에서는 hover 색상을 우선한다. 서브메뉴 빠른 재진입 회귀에서는 `list-navigation/keydown`으로 열린 직후 움직이는 메뉴 아래 정지한 pointer가 `trigger-hover/mouseleave` 닫힘을 발생시키는 원인을 추적했다. 키보드 탐색 중에는 이 hover 기반 닫힘만 취소하고, 실제 trigger/popup pointer 조작은 keyboard mode를 해제한다. Escape·방향키 복귀·outside press는 계속 허용한다. 단순히 테스트에서 pointer를 멀리 치우거나 기다려 실패를 숨기지 않는다.

WebKit 주의: 설치된 Base UI `floating-ui-react/hooks/useListNavigation.js`는 WebKit의 movementX/Y=0인 hover 이벤트를 layout 이벤트로 보고 무시한다. 따라서 CSS hover가 보여도 DOM/virtual active item은 바뀌지 않을 수 있다. 회귀는 hover를 form selection이나 키보드 active item으로 가정하지 않고 현재 aria-activedescendant에 대한 다음 항목 이동, Select End의 마지막 옵션 이동을 검증한다. 실제 좌표 이동으로 pointer 모드를 판별하여 AutoComplete의 가상 ring도 해제하며 정지한 pointer의 layout 이벤트는 제외한다. 테스트에서 focus/highlight DOM을 직접 조작하지 않는다. 서브메뉴 Left 복귀 후에는 기존 150ms 종료로 항목이 숨겨진 readback을 확인한 뒤 부모 Escape 복귀를 검증한다. 종료 도중 연속 Escape까지의 동작은 이 완료된 lifecycle 검사와 구분한다.

Menu와 SubmenuRoot는 모션에 전달하는 동일한 `open` 상태로 제어하여 실제 portal과 시각 모션의 상태를 일치시킨다. keyboard mode에서는 `trigger-hover`에 의한 재열림도 차단한다. 이 보완 뒤 실제 5174 Light/High에서 Right로 guide focus와 2개 메뉴, Left로 도움말 focus와 1개 메뉴, Escape로 trigger focus와 0개 메뉴를 readback했다. 원래 System/Standard 미리보기로 복원했다.

반복 단독 검사 통과 후에도 전체 실행에서 빠른 submenu focus 실패가 재발하여 이를 완료 근거로 사용하지 않았다. Menu에는 Select의 item focus/scroll 보류 등록이 빠져 있었다. popup의 실제 item을 같은 adapter에 등록해 열림 완료 뒤 포커스를 넘긴다. 또한 애니메이션은 내부 surface에서 재생되는데 Base UI는 Popup 자체의 `getAnimations()`로 종료를 감지하므로 두 종료 기준을 분리하지 않는다. [Base UI 공식 JavaScript animation 계약](https://base-ui.com/react/handbook/animation) 및 설치된 Root API의 `preventUnmountOnClose`/`actionsRef.unmount`를 연결해 surface 종료가 실제 unmount를 완료하도록 했다. 고정 지연 timer나 테스트 재시도로 통과시키지 않는다. 열림 전 취소와 재열림은 기존 animation 취소 경로를 사용한다.

검증 범위: state/ripple/선택 검사는 `data-menu-motion-phase`로 열림 완료를 확인한 메뉴에서 수행한다. 초기 raw pointer hold가 열림 전환과 겹친 Firefox 1회에서는 checkbox 선택이 반영되지 않은 관찰도 있었다. 최종 완료된 메뉴의 회귀와 이 경계 관찰은 구분하며, 전환 중 raw press 및 종료 중 연속 Escape까지 검증 완료라고 주장하지 않는다. 사용자에게 보이는 원래 hover 색상/과도한 ring 문제의 교정과 전체 MD3 PASS는 별개다.

## 최종 결과

- `pnpm verify`: PASS. structure, lint, TypeScript, 9 suites/46 unit tests, Vite build, Storybook build. 기존 bundle-size 안내 경고는 남아 있다.
- `pnpm test:e2e --retries=0`: **162/162 PASS**, Chromium/Firefox/WebKit 각 54개, 최종 단일 실행 10.4분. 새 드롭다운 회귀 36개와 기존 126개를 모두 포함한다. 앞선 실패 실행이나 반복 재시도 합산을 최종 PASS 수치로 사용하지 않았다.
- 실제 5174 앱: Select의 pointer-open ring opacity 0, keyboard 3px/opacity 1/animation none, Enter 값 반영·trigger 복귀; AutoComplete 입력 focus 유지·aria-activedescendant와 제안 선택; Light 메뉴 바탕 `rgb(255,255,255)` 및 checked `rgba(0,0,0,0.06)`를 확인했다. 최종 Menu 종료 연결 후 새 탭에서도 pointer ring 0 → keyboard ring 1 → Space checked=true → Escape menu count=0/trigger focus를 readback했다.
- Figma geometry 전체 재구현, 모든 시드 조합의 대비 인증, 수동 screen reader/실제 Windows Contrast Themes 및 위 전환 중 경계 입력은 완료 범위가 아니다. 프로젝트 구현 스킬에 따라 이 범위를 manifest·컴포넌트 계약·프로젝트 메모리와 함께 기록했다.
- 산출물: `index-CBUund-u.js`, SHA256 `ae8a59e45806d693cddd86821417b674283cee800e1e6355cb42d229bba69df7`; `index-CTGbOFWj.css`, SHA256 `cfcbe118d9dd9b45ac493a4e1d0137dec691a5411b8851257342482cbdff2d1f`.
- 커밋·푸시·배포 없음. 공개 사이트의 이전 `4c9ca38` revision과 현재 로컬 수정은 구분한다.

별도 기존 경고: 개발 갤러리 진입 시 React `Unknown event handler property onValueChange`가 관찰됐다. 변경 전 HEAD에도 SegmentedButtonSet이 onValueChange를 rootProps에 남겨 DOM으로 전파하는 코드가 동일하게 존재한다. 드롭다운 범위 밖이므로 이번 변경에서 수정하지 않았으며 런타임 로그 전체가 깨끗하다고 주장하지 않는다.
