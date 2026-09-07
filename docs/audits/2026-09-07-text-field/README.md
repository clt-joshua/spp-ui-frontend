# TextField — Figma / Stable M3 검증

> 이 보고서의 pinned label/Filled 유지와 69 E2E는 최초 구현 이력이다. 현재 사용자 결정으로 Filled를 제거하고 라벨 이동·독립 AutoComplete를 추가했다. [최신 후속 감사](../2026-09-07-choice-fields/README.md)가 현행 계약이며 아래 Figma readback/이미지는 역사적 증거로 보존한다.

관찰일: 2026-09-07. 구현은 로컬 `/components#form-fields`에서 사용할 수 있다. **M3 준수 판정은 BLOCKED**다. 낮은 placeholder/affix 대비와 수동 접근성 증거가 남아 있다. 이번 변경은 배포하지 않았다.

## 권위와 추출

- [사용자 Figma section 10724:14659](https://www.figma.com/design/aQ2CfBMmc3q2qD2oDQcnjU/2026_Design-System--Renuwal-?node-id=10724-14659&m=dev)
- large executable set `10443:76121` 28개, small set `10443:77309` 28개. `size × text/number × enable/hover/focused/error/error-focused/disable/read-only × empty/populated = 56`.
- 첫 root design-context가 sparse metadata를 반환해 세부 variant context와 실제 Plugin API local variable/text-style binding을 대조했다. 상세 context: `10443:76122`, `10443:76582`, `10443:76160`, `10443:76332`, `10443:76650`, `10443:76674`, `10443:76695`, `10459:3403`, `10443:77310`, `10459:3423`, `10459:3584`, `10459:3464`, `10443:77537`, `10459:3648`, `10443:77582`.
- [전체 56개 binding·geometry readback](figma-readback.json). component code 생성물은 붙여 넣지 않았고 native React/Base UI 경계와 프로젝트 component token을 사용했다.
- [Material Web main](https://github.com/material-components/material-web/blob/main/docs/components/text-field.md)과 [v2.5.0 snapshot](https://github.com/material-components/material-web/blob/b4de401eb665ec63474f39319a4ba8f2145974cc/docs/components/text-field.md)을 비교했다. 차이는 freshness 날짜(`2025-11-23` → `2026-07-31`)뿐이고 Usage/Accessibility/API 내용 차이는 없었다.

## 구현 계약과 차이

[공개 API·size/state 표](../../02-architecture/05-COMPONENTS-AND-INTERACTIONS.md#textfield)를 따른다.

- outlined: 48/32px, 입력 body-large/body-small, label body-small/label-small, affix label-large/label-medium, icon 24/16px, action 40/24px. 4px corners, enabled 1px/hover 2px/focus 3·2px.
- source의 빈 값 pinned label, size별 오류 색상 차이, root disabled opacity 38%, readonly surface-container를 보존한다. filled는 기존 56px 및 측정 기반 150ms floating motion을 유지한다.
- small 지원 문구는 Figma root를 벗어나는 absolute 위치 대신 동일한 상대 위치(32px 아래 1px)를 문서 흐름에 배치한다. 독립 기하인 1px를 임의 spatial step으로 반올림하지 않는다.
- large numeric의 text-right는 hug wrapper 안에서 실제 우측 정렬을 만들지 않는다. 실제 배치를 따라 large는 start, small은 end로 유지했다.
- place 아이콘은 Filled font의 `place`와 모양이 달라 source path를 `MaterialIcon name="place_outline"` adapter로 추가했다. 원본 asset `55e0f292-d65f-44da-9f0b-86cf366d9ea8.svg`; 값의 색만 currentColor로 연결했다. clear는 원본 outline circle-X와 일치하는 기존 font `highlight_off`를 사용한다.
- hover 전용 지우기를 keyboard focus-within과 touch에서도 노출한다. clear는 controlled callback과 native input event를 연결하고 focus를 복원한다. trailingAction은 이름 있는 non-submit button이고 readOnly 상태에서도 비밀번호 보기 같은 비편집 동작을 허용한다.
- 네이티브 validation, textarea/rows/resize, readonly 포함·disabled 제외 FormData, 폼 reset을 실제 폼으로 제공한다. 오류 설명을 외부 aria-describedby와 병합했다.
- coarse pointer는 실제 control/outline/action을 48px 이상으로 확장한다. 서로 인접한 action의 hit area를 겹치게 확장하지 않는다. desktop small 32px는 Figma compact override다.
- Firefox small native input의 font normal 최소 line-height가 17px로 관찰됐다. author token은 16px, container는 32px를 유지한다. appearance:none/명시적 height/important로도 native used line-height는 17px였다. [HTML native text-entry rendering](https://html.spec.whatwg.org/multipage/rendering.html#the-input-element-as-a-text-entry-widget)과 [Mozilla 설명](https://bugzilla.mozilla.org/show_bug.cgi?id=1860167)에 따라 입력을 가짜 요소로 대체하거나 font를 축소하지 않는다. 테스트는 author token과 native used line-height를 분리해 검사한다.

## 실제 흐름 및 증거

- 개발 진입점: `http://127.0.0.1:5174/` → 컴포넌트 검증 → Form fields. 5173은 다른 프로젝트이므로 사용하지 않았다.
- `/components`에 32개 editable/error/disabled/readonly 정적 예제를 두고, 실제 hover/focus로 56개 source state를 검증한다. 장식 arrow는 버튼으로 가장하지 않으며 별도 비밀번호 표시 예제가 실제 trailing action을 검증한다.
- 별도 폼에서 이름 지우기(Tab/Enter) → 필수값 오류 → 입력 → 수량 ArrowUp → 비밀번호 표시 → 여러 줄 입력 → 제출 결과 → reset을 실행했다. 제출 결과는 password를 표시하지 않으며 readonly code를 포함하고 disabled code를 제외한다.
- 단위 테스트: 8 suites / 43 tests PASS. `pnpm verify`의 구조, lint, typecheck, Vite, Storybook PASS. Vite bundle-size 경고는 비차단이며 기준을 완화하지 않았다.
- 최초 63개 실행에서는 62 PASS / Firefox 1 FAIL이었다. 원인은 위 native 17px line-height였으며 Figma token값을 바꾸지 않고 HTML 규칙에 맞게 검증을 분리했다. 이후 전체 E2E 66개가 통과했다. 최종 hit-area 교정 후 검증 결과는 아래에 기록한다.
- 마지막 사용성 점검에서 input 글자 영역 외 control 여백/상단 label에도 실제 focus 경로를 연결했다. input/textarea selection과 resize, trailing button은 가로채지 않는다. coarse-pointer 테스트는 input.focus() 대신 48px control의 아래쪽 여백을 실제 클릭한다.
- hit-area 교정의 재검증에서 WebKit의 두 크기 일괄 상태 테스트가 30초 전체 실행 제한에 도달했다(개별 assertion 실패가 아님). 검증을 large/small 독립 테스트로 분리했다. 56개 조합·동작·각 assertion의 제한은 유지하고 timeout 확대나 검증 제외는 하지 않았다.
- [4-theme runtime JSON](runtime/report.json), [Light small](runtime/light-standard-small.png), [Dark small](runtime/dark-standard-small.png), [Light High large](runtime/light-high-large.png), [Dark High large](runtime/dark-high-large.png). 실제 5174 앱의 테마 UI로 전환하고 source/layout/body colors를 읽었다.

## 최종 자동 검증

- `pnpm verify`: PASS — 구조/lint/typecheck, 8 suites / 43 unit tests, Vite build, Storybook build.
- 최종 `pnpm exec playwright test tests/e2e --project=chromium --project=firefox --project=webkit`: **69 PASS (5.5분)**. 기존 54개 + TextField 15개(크기별 matrix 2, 실제 폼 1, filled 1, coarse-pointer 1 × 3 browsers).
- 최종 artifact: `index-sL2G_Gud.js` SHA-256 `03EA941A4078542AAA45FD8FA16F58DB9C6A1D968E00481D58A1F8D3081D2514`, `index-CMTBTFzC.css` SHA-256 `C9D341E5FD3CA9DE668E8222C35A47700A3384B54E45AA9E9D3A025F9D1546CA`.
- 5174에서도 `/` → 컴포넌트 검증 → Form fields → 이름 입력 → 제출 결과 `project=최종 로컬 확인`, `quantity=2`, `memo=첫 줄`, `code=SPP-001`을 읽었다. `disabledCode`와 password는 결과에 없었다.
- 원래 dirty worktree의 전체 감사/State 표 수정은 보존했다. 커밋·push·production 배포는 수행하지 않았다.

## 미결 — 대비와 수동 접근성

`node scripts/audit-text-field.mjs`는 실제 Theme Lab에서 Normal Light/Dark × Standard/High를 적용하고 Form fields를 감사한다. 결과는 **FAIL**이며 일반 기능 회귀 PASS와 분리한다. 아래 수치는 비활성 필드를 제외한 최저 실측값이다.

| Theme | 입력값 | 보이는 placeholder | affix |
|---|---:|---:|---:|
| Light Standard | 13.45:1 | 1.77:1 | 3.40:1 |
| Light High | 15.40:1 | 1.61:1 | 3.09:1 |
| Dark Standard | 12.60:1 | 8.24:1 | 4.30:1 |
| Dark High | 14.77:1 | 7.46:1 | 3.90:1 |

M3_WEB_SPEC_CONFLICT

- Target: TextField placeholder / prefix / suffix.
- Higher authority: 접근성 대비 기준과 현재 사용자 Figma token 사용 요구. [WCAG text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
- Current: `on-surface-variant-bright`, `outline-high`는 Figma에 바인딩된 역할이지만 일부 테마·readonly 배경에서 4.5:1에 미달한다.
- Impact: Light placeholder와 일부 단위/접두·접미사를 읽기 어려울 수 있다. 입력된 실제 값은 이번 4-theme 검사에서 충분한 대비를 확보했다.
- Required action: source 또는 system/component별 접근성 override를 허용할지 제품 토큰 결정을 한 뒤 Figma/코드/회귀를 함께 수정한다. 임의로 source 값을 보정하거나 낮은 대비를 PASS 기준으로 채택하지 않았다.
- Status: BLOCKED. axe 위반 0개여도 각 테마 color-contrast 194개 incomplete이므로 자동 접근성 PASS가 아니다. 그림자·배경 등으로 판정이 보류된 곳은 실측·시각 검토가 필요하다.

실제 screen reader의 동적 오류·외부 설명 announcement, Windows Contrast Themes의 경계·focus·error·disabled 구분은 미검증이다. CSS forced-colors 대응이나 emulation은 실제 OS evidence를 대체하지 않는다. Linux screenshot baseline을 다시 도입하지 않았다.
