# 입력 컴포넌트 분리 및 실시간 검증 UI

## 현행 계약

2026-09-07 사용자 요청이 이전 Figma pinned label/Filled 유지 결정보다 우선한다.

- Filled TextField의 공개 variant 타입/prop, CSS, 토큰, 사용 예제를 삭제했다. 역사적 Figma evidence/PNG는 보존한다. 기존 Select의 filled variant는 TextField API가 아니므로 그대로 둔다.
- 빈 값·비포커스 내부 라벨 → focus/value 상단 라벨, 150ms 이동. 지우면 포커스를 유지하고, 빈 상태에서 blur하면 라벨이 내부로 돌아온다. placeholder/affix와 겹치지 않는다.
- TextField/Select/AutoComplete는 각각 공개 export와 별도 구현·검증 UI를 가진다. TextField에 드롭다운 장식으로 선택 기능을 흉내 내지 않는다.
- TextField/AutoComplete: large/small, prefix/suffix, error/disabled/required/readonly/clearable을 실시간 변경한다. Select: error/disabled/required와 native form projection을 확인한다.
- AutoComplete는 자유 문자열 입력과 선택적 제안이다. 필터링, 방향키 가상 포커스, Enter/클릭 적용, Escape, 지우기, 빈 결과, disabled/readonly, 제출/reset을 구현했다. 별도 AutoComplete Figma set을 검증했다고 주장하지 않는다.

## Prefix/Suffix 및 라벨 모션 후속 수정

- 사용자 재현을 실제 5174의 Theme Lab → 컴포넌트 검증 → Form fields에서 확인했다. 빈 preview에서 Prefix/Suffix를 체크하면 DOM은 존재하지만 `visibility:hidden`, `opacity:0`으로 보이지 않았다. 이전 E2E는 먼저 `fill('hello')`해서 이 진입 흐름을 놓쳤다. 샘플 값으로 시작하고 명시적인 `샘플 값 넣기`/`빈 값으로 테스트` 버튼을 제공한다. 토글을 바꿀 때 입력값이나 focus를 강제로 변경하지 않는다.
- 빠른 focus→blur에서 이동 중 transform `matrix(1.08531, 0, 0, 1.08531, 0, 5.22833)`가 identity 시작점으로 바뀌는 점프를 재현했다. 수정 후 다음 animation 첫 keyframe이 해당 matrix 그대로다. [수정 전 readback](runtime/before-field-motion.json), [수정 후 readback](runtime/after-field-motion.json).
- [Material Web field.ts](https://github.com/material-components/material-web/blob/main/field/internal/field.ts)의 측정 기반 150ms standard/단일 visible label/no forwards-fill과 [_content.scss](https://github.com/material-components/material-web/blob/main/field/internal/_content.scss)의 67ms delay + 83ms emphasized fade를 참고했다. React adapter에서는 기존 animation 취소 전에 현재 transform/width를 snapshot하여 양방향 중단을 연결한다. 이는 런타임 의존성 도입이 아니라 프로젝트 내부 motion 구현 교정이다.
- [_input.scss](https://github.com/material-components/material-web/blob/main/textfield/internal/_input.scss)처럼 입력과 affix를 함께 fade한다. 즉시 나타나던 placeholder, 개별 affix `transition:none`/visibility snap을 제거했다. [_outlined-field.scss](https://github.com/material-components/material-web/blob/main/field/internal/_outlined-field.scss)처럼 기존 notch 패널이 열리고 닫히게 하고 고정 배경 패치의 순간 on/off를 제거했다. Figma 크기·색·서체·간격 endpoint는 유지했다.
- 새 회귀는 TextField/AutoComplete의 fresh toggle, 두 크기, content의 실제 opacity/geometry, 빈 값→focus→sample, 토글 해제와 양방향 라벨 중단을 검증한다. 결정적 경계 검사는 실제 animation을 50ms에 정지해 pose를 비교하며, 별도로 조작하지 않은 blur animation의 실제 프레임과 최종 단일 라벨/opacity 복원을 확인한다. 테스트 타이밍 제어를 실제 사용자 흐름 검증의 대체물로 쓰지 않는다.
- 문서 갱신 후 quality 재실행에서 compliance 기록 수 검사 1개가 실패했다(4개 계약에 Material Web 설명을 별도 5번째 deviation으로 추가). 새로운 정책 예외가 아니므로 기존 Figma pinned→floating 계약 항목에 motion 근거를 통합했고, 해당 내용 유지 assertion을 추가했다. 브라우저 기능 실패나 새로운 준수 예외로 해석하지 않는다.
- Light/Dark 실제 UI에서 TextField/AutoComplete affix 토글(typing 이전), Select disabled skipping, AutoComplete filter/select와 `destination=busan`, `city=Seoul 서울` FormData를 재검증했다. 각 테마 page error 0. [갱신된 실제 실행 보고서](runtime/report.json).

## 실제 검사 중 발견하고 수정한 사항

- 빈 Select의 label/placeholder가 겹쳤다. 내부 라벨 상태에서는 placeholder를 숨겼다.
- Base UI 1.7 Select는 비활성 Item에도 방향키 포커스를 보냈다. [Material Web list navigation](https://github.com/material-components/material-web/blob/main/list/internal/list-navigation-helpers.ts)은 비활성 옵션을 제외한다. 비활성 옵션을 탐색 registry 외부의 비대화형 option으로 표시해 바로 다음 활성 옵션으로 이동하도록 교정했다.
- TextField 라벨의 실제 클릭 영역과 hover 대상은 컨트롤 anatomy 기준으로 검증한다. 상단의 투명 라벨 영역이 내부 입력 포인터를 가로채지 않게 했다.
- 상향 AutoComplete 메뉴가 floating label 상단 절반을 가리는 화면 문제를 확인했다. 상향 배치에만 라벨의 실제 layout 높이 절반을 확보하고 하향 배치는 zero offset을 유지한다. Select의 기존 배치 계약은 변경하지 않았다.

## 근거와 한계

- [M3 Text fields](https://m3.material.io/components/text-fields/overview), [M3 Menus](https://m3.material.io/components/menus/overview), [APG Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/), [Base UI Autocomplete](https://base-ui.com/react/components/autocomplete)를 비교했다. AutoComplete는 전용 Stable Material Web 컴포넌트가 아닌 프로젝트 composite다.
- 공유 시각은 내부 OutlinedField/FieldDropdown 스타일과 기존 component token을 사용한다. Base UI는 src/ui 안에서만 사용한다.
- 자동화는 기존 제품 UI와 실제 폼 결과를 검증하며 제안 목록을 mock으로 교체하지 않는다. 개발 서버는 5174, production preview E2E는 4173이며 다른 프로젝트의 5173을 건드리지 않았다.
- 기존 Figma placeholder/affix 대비 충돌 및 Windows Contrast Themes/복합 포커스 announcement 수동 증거는 여전히 BLOCKED다. 기능 테스트 성공을 MD3 전체 준수로 승격하지 않는다.
- 이번 변경은 로컬이며 push/deploy하지 않았다.

## 검증 결과

- 단위 테스트: 9 suites / 45 tests PASS.
- `pnpm verify`: PASS (구조, lint, typecheck, 단위, Vite build, Storybook build). 기존 500kB bundle 경고는 남아 있다.
- Prefix/Suffix·라벨 후속 수정 후 Chromium/Firefox/WebKit **전체 93개 PASS, 실패 0, 7.2분**. 사전 영향 범위 Chromium 13개도 PASS했다. 이전 입력 분리 검증은 전체 78개 + 상향 AutoComplete 보정 영향 범위 12개였으며, 이번 전체 실행이 해당 증거를 갱신한다.
- 실제 개발 서버 `5174`에서 Theme Lab → 테마 적용 → 컴포넌트 검증 → Form fields → Select/AutoComplete 입력·선택 → native FormData 제출을 확인했다. Light/Dark 모두 page error 0, `destination=busan`, `city=Seoul 서울` authoritative readback.
- [실제 실행 보고서](runtime/report.json), [라이트 입력 UI](runtime/light-text-field-playground.png), [다크 입력 UI](runtime/dark-text-field-playground.png), [라이트 dropdown](runtime/light-autocomplete-dropdown.png), [다크 dropdown](runtime/dark-autocomplete-dropdown.png). 라벨을 가렸던 최초 `autocomplete-dropdown.png`는 수정 전 진단 이미지다.
- 실행: `pnpm exec node scripts/audit-choice-fields.mjs`. 자동화는 실제 UI/폼을 조작해 확인하며 기능 PASS와 compliance BLOCKED를 분리한다.
- 이전 pinned-label 테스트는 최신 명시적 라벨 계약으로 교체했다. 비활성 Select 탐색은 테스트를 완화하지 않고 공식 Material Web에 맞춰 런타임을 수정했다. 현재 알려진 권위 역전은 없으며 명시적 Figma 색상 충돌은 별도 미결로 남겼다.
