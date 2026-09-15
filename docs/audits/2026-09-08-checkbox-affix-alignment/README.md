# Checkbox 체크 표시 하강 / TextField Prefix 정합성

## 판정과 범위

- Prefix는 Figma MCP `10443:76122`(large), `10443:77310`(small)와 실제 화면의 세로 중앙 정렬·타이포그래피가 일치한다. large 14/20px, small 12/16px, weight 500을 유지한다. 입력 텍스트와 다른 크기로 생기는 시각 차이를 임의 offset으로 보정하지 않았다.
- 사용자가 내부 ✓가 내려가는 것이라고 확인했다. 박스는 정지해 있으나 기존 center-origin 0.6→1 확대는 체크 아래 꼭짓점을 large 2px, medium 약 1.83px, small 1.375px 아래로 이동시키는 구조다. 실제 프레임에서도 끝부분의 하강이 관찰되었다.
- 체크 tip `(7, 14)` / SVG 중심 `(9, 9)`의 차이로 transform-origin을 계산해 확대·축소 중 꼭짓점을 고정한다. indeterminate는 중앙 기준을 유지한다. 최종 Figma 위치/크기, 모든 기존 token과 색상, draw/fade/scale 시간·easing 및 API를 변경하지 않았다. 신규 token 없음.
- 이는 사용자 요청에 따른 Material Web 중심 확대의 scoped 예외다. upstream과 완전히 동일한 모션이라고 주장하지 않으며 manifest/컴포넌트 계약에 기록했다. 수동 AT/Windows Contrast Themes BLOCKED는 유지한다.

## 근거

- [Figma TextField large](https://www.figma.com/design/aQ2CfBMmc3q2qD2oDQcnjU/2026_Design-System--Renuwal-?node-id=10443-76122)
- [Figma TextField small](https://www.figma.com/design/aQ2CfBMmc3q2qD2oDQcnjU/2026_Design-System--Renuwal-?node-id=10443-77310)
- [Figma Checkbox 90 variants](https://www.figma.com/design/aQ2CfBMmc3q2qD2oDQcnjU/2026_Design-System--Renuwal-?node-id=10466-23091)
- [Material Web 고정 Checkbox 소스](https://github.com/material-components/material-web/blob/b4de401eb665ec63474f39319a4ba8f2145974cc/checkbox/internal/_checkbox.scss): scale 0.6→1, enter 350ms, exit 150ms, opacity 50ms, SVG tip 좌표.

## 실행 증거

- 개발 진입점 `http://localhost:5174/` → 공통 상단 컴포넌트 검증 → Checkbox/TextField를 실제로 선택했다.
- 실제 앱 내 사용자 브라우저(787×1027)에서 large 체크 tip 13px, origin `6px 13px`, 완료 scale 1, SVG 중심 오차 0px를 확인했다. Prefix 중심 오차 0px / 14px font / 20px line-height도 확인하고 Prefix 테스트 토글을 원래 해제 상태로 복원했다.
- 새 회귀 검사: 실제 클릭으로 그려지는 세 크기 ✓의 연속 프레임(750ms), 종료 후 위치, Space 재토글, Prefix/Suffix 두 크기의 중앙 정렬·font/line-height/weight. Chromium·Firefox·WebKit 6/6 PASS(37.7초).
- 첫 회귀 실행은 4173에서 다른 작업의 15-component/9-group 산출물이 제공되어 탐색 시간 초과로 중단했다. 제품 오류로 오인하지 않고 서버를 보존했다. `PLAYWRIGHT_PORT=4184`로 현재 dist를 별도 검증한다. 기본 4173과 개발 5174는 유지하며 preview `strictPort`를 적용했다.
- 품질 게이트 첫 실행에서 신규 motion 예외에 맞지 않는 manifest 개수 assertion이 실패했다. 2→3 및 예외 내용 검사를 갱신했다. 제품 기대 geometry나 motion assertion은 완화하지 않았다.
- 최종 품질 게이트/전체 E2E 결과는 아래 최종 결과에 기록한다.
- 전체 E2E 첫 실행의 self-hosted 검사는 4173 하드코딩 때문에 실제 앱 origin 4184를 외부 요청으로 오인했다. 중단 후 Playwright `baseURL`의 origin과 비교하도록 수정했다. 외부 요청 금지 조건은 그대로이며 다른 4173 의존 E2E는 없음을 확인했다. 최종 전체 실행을 재시작했다.

커밋·푸시·배포 없음. 이전 누적 미커밋 변경을 보존했다.

## 최종 결과

- `pnpm verify`: PASS(구조/lint/typecheck, 11 suites·50 unit, 앱/Storybook 빌드). 마지막 baseURL 테스트 수정 후 lint/typecheck/구조 재검사도 PASS.
- `PLAYWRIGHT_PORT=4184 pnpm test:e2e`: Chromium 65/65, Firefox 65/65, WebKit 65/65, **전체 195/195 PASS**(단일 실행 13.6분, retries 0).
- 검증 산출물 `index-lt3v5Y2v.js` / `index-BU2GDTSr.css`. 실행 중 4184 HTML과 현재 dist HTML의 동일성을 확인했다. 4173의 다른 서버는 중단/교체하지 않았다.
- 수정 결과는 5174 개발 화면에도 적용되어 실제 앱 내 브라우저에서 확인했다. 기존 수동 접근성 게이트를 PASS로 바꾸지 않는다.
