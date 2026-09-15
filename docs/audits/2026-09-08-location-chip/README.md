# Location Chip Figma 재검증

## 근거와 범위

- [Figma component set 10563:12834](https://www.figma.com/design/aQ2CfBMmc3q2qD2oDQcnjU/2026_Design-System--Renuwal-?node-id=10563-12834): MCP design context → metadata → 실제 variant 10563:12841 context와 variable definitions를 조회했다.
- 전체 축은 Selected=false × size=small의 단일 조합이다. hover/focus/pressed/disabled/다른 크기 variant는 원본에 없다.
- [Material Web Chip 공식 문서](https://raw.githubusercontent.com/material-components/material-web/main/docs/components/chip.md): 표준 Assist/Filter/Input/Suggestion과 달리 Location은 기존 승인된 프로젝트 전용 비대화형 표시다. 이번 수정으로 선택·클릭·toolbar focus·ripple을 만들지 않는다.

## 발견과 교정

| 항목 | 수정 전 실제 localhost:5174 | Figma 및 수정 목표 |
|---|---:|---:|
| 시작/끝 여백 | 10 / 6px | 8 / 8px, space/100 |
| prefix와 값 간격 | 2px | 6px, gap/75 |
| block 여백 | 24px 높이 내 중앙 정렬 | 명시적 4px, space/50 |
| 높이 / radius | 24 / 4px | 유지 |
| prefix / value | 12px/16px, 600/500, tracking 0.5px | 유지 |

원인은 .root[data-size='small']의 specificity가 .location보다 높아 component token 6px을 공통 small 2px로 덮는 것이었다. Location selector를 동일 specificity로 구성하고 component space token을 8/8px로 교정했다. 수정 전 폭은 71.25px였다. Figma metadata 폭은 75px이며 웹 font shaping에 따른 소수점 차이를 허용하고 실제 텍스트 사이 간격과 양쪽 inset은 정확하게 검사한다.

상세 Figma metadata도 prefix x=8/y=4/8×16px, value x=22/y=4/45×16px로 같은 공간 계약을 확인한다. Firefox DOMRect에서는 gap 6.0000305px / right 7.9999695px로 반환되어 최초 strict equality가 실패했다. 제품 CSS는 변경하지 않고 좌표 비교만 소수점 3자리 정밀도로 검사한다. computed gap=6px 및 padding=4px 8px assertion은 정확한 일치를 계속 요구한다.

prefix system/info=#287fff, value on-surface=#1f282d, surface-container-lowest=#fff, outline-low=#c9d3db를 Light/Standard 원본 기준으로 보존한다. Dark/High는 기존 의미별 테마 역할을 사용한다. 공통 Chip의 다른 크기/타입 토큰은 변경하지 않는다.

## 검증

품질 게이트(pnpm verify: 구조/lint/typecheck/단위 46/빌드/Storybook) PASS. 실제 localhost:5174 수정 후 75.25×24px, gap 6px, padding 4px 8px, role/tabindex 없음으로 readback했다. [실제 로컬 캡처](local-light.png)를 참고한다. 전체 E2E 최초 실행은 179 PASS / 1 FAIL(16.0분)이며 유일한 실패는 위 Firefox 좌표 strict equality다. 정밀도 교정 후 동일 제품 artifact(index-5u2mt6tQ.js / index-CxgYTWbf.css)에서 Location 전용 Chromium/Firefox/WebKit 3/3 PASS(17.3초). 단일 전체 180 PASS 실행으로 표기하지 않는다. 최종 lint와 diff 검증도 PASS. 새로운 location-chip E2E는 실제 Theme Lab과 상단 링크로 진입한 갤러리에서 4개 테마 조합의 간격·여백·서체·비대화형 anatomy 및 원본 색상을 확인한다. 기존 Chip 대비/복합 포커스·Windows Contrast Themes 수동 BLOCKED를 이번 geometry 수정으로 해제하지 않는다. 커밋·푸시·배포는 요청 범위가 아니다.
