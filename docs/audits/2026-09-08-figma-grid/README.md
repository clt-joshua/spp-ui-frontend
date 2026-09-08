# Figma 그리드 1차 구현

## 확정 범위

- 사용자 최신 요청: TanStack Table 기반으로 1차 구현. header/body 크기 variant 없음. 헤더 medium, 바디 작은 밀도 고정. 기능 기준이 미정인 영역은 시각 구현만 허용하며 그리드 전용 컴포넌트 허용.
- 2026-09-08 추가 확인: 현재 Figma body에는 large/medium만 존재. 이전 small 노드가 medium으로 이름 변경되었으므로 **바디 40px 진행**을 사용자가 명시 확인했다.
- [header 10450:83943](https://www.figma.com/design/aQ2CfBMmc3q2qD2oDQcnjU/2026_Design-System--Renuwal-?node-id=10450-83943): 5 types, large/medium, enabled/hovered/focused/pressed. 선택한 medium의 모든 단일 헤더 상태는 32px, 2-tier 그룹은 64px. 이전 상태별 32/36px 차이 수정 반영.
- [body 10450:84987](https://www.figma.com/design/aQ2CfBMmc3q2qD2oDQcnjU/2026_Design-System--Renuwal-?node-id=10450-84987): 12 types, large/medium, enabled/row-hover/row-selected/cell-hover/cell-selected/disabled. sub-total/sub-total-number 삭제 반영. 현재 작은 밀도의 모든 행은 40px.

## 구현 경계

`src/ui` 공개 DataGrid가 TanStack Table 9.2.4의 정렬·컬럼 필터·행 선택과 행/헤더 모델을 소비한다. 애플리케이션은 `GridColumn<T>`와 데이터, 안정적인 `getRowId`, `onCellChange`를 제공한다. TanStack·Base UI는 내부 구현이다. size/state 시각 고정 prop은 없다.

- 기본 헤더, No., 체크박스/라디오 선택 열, 2단 그룹 헤더 제공. 일반 열이 그룹과 섞이면 rowspan으로 헤더 의미 보존. 그룹 헤더의 정렬/필터는 기준 미정으로 시각 아이콘만 표시하며, 개별 열의 명확한 정렬/필터와 구분한다.
- text/number/no, text-edit/number-edit, text-select/chip-select, check-button, check-only/radio-only, grand-total/grand-total-number 표시.
- 정렬 아이콘 3단계 전환, 문자열 포함 필터, 조회 결과 내 전체 선택, 단일 선택, 비활성 행 차단. 숨겨진 선택은 유지하고 전체 선택은 현재 조회된 선택 가능 행만 변경한다.
- 편집은 소비자의 callback으로 같은 row ID에 반영. `/grid` 예시 페이지는 현재 화면 메모리에서 변경을 유지하며 이를 화면에 명시한다. 서버 저장·트랜잭션은 구현 범위가 아니다.
- 총계는 현재 필터 결과 전체를 합산하며 비활성 행도 데이터로 포함한다. 이 정의를 API에 명시한다.
- native table 및 native 입력/체크박스/라디오, Base UI select. 셀 초점과 방향키 이동 보조 제공. 셀 선택 시각은 하나의 활성 셀을 나타내며 직사각형 범위 선택·복사/붙여넣기·Excel 동작을 의미하지 않는다.
- `Db Click`과 액션 라벨·화살표는 동작 계약이 없으면 noninteractive span. 옵션과 callback이 제공된 select만 실제 목록 선택을 제공한다. info는 이름을 가진 시각 정보 아이콘이며 별도 팝업 동작을 만들지 않았다.

## Figma와 재사용 판단

TextField small 32px를 재사용한다. 기존 IconButton/Checkbox/Radio의 48px 목표 영역은 그리드의 인접 셀에서 겹치므로 GridIconButton/GridChoice/GridSelect를 내부 전용으로 구현했다. 클릭 영역은 24px이며 기존 범용 컴포넌트를 변경하지 않았다. Figma의 작은 체크박스 12px, 라디오/아이콘 16px, chip 20px/11px 글꼴, 텍스트 12px/16px/0.4px, 헤더 weight600을 컴포넌트 토큰으로 매핑했다. Material Icons Filled의 arrow_upward/filter_list/arrow_drop_down/check와 info_outline을 확인한 Figma glyph 용도로 재사용한다.

그리드 전체에 대응하는 Stable Material Web 구현이 없어 `materialWebReferenceStatus=unavailable`을 기록한다. 사용자가 승인한 밀도와 Figma 색상/상태가 프로젝트 override이며, native semantics와 기존 테마/token 구조는 유지한다. CSS module은 component token만 소비한다.

테마 검증 중 Light High의 총계 배경 `#626c8d`와 기본 본문색 `#2f383a` 조합이 대비 2.31:1로 실패했다. Light Standard는 Figma 본문색을 보존하고 Dark/High는 `on-tertiary-container`를 총계 글자색으로 연결해 배경/글자 역할을 맞췄다. 실패 기대값을 완화하지 않고 같은 axe 검사로 재검증한다. 일반 텍스트 셀의 자식을 클릭해도 셀 초점이 이동하도록 구현하여, 빈 패딩이나 프로그램 초점 호출 없이 실제 포인터 흐름을 지원한다.

## 실제 진입점과 검증

Theme Lab의 **업무용 그리드** 링크 → `/grid`. 컴포넌트 검증의 **Data grid** → `/components#data-grid`. 두 화면 모두 동일한 공개 DataGrid를 사용한다. Storybook에는 `Foundation/DataGrid`가 추가된다.

별도 worktree `C:\Develop\spp-ui-frontend-grid`에서 `pnpm.cmd dev --host 127.0.0.1 --port 5175 --strictPort`로 실행한다. 기존 main 서버와 별개이며 이 작업의 확인 주소는 `http://127.0.0.1:5175/grid`다.

최종 그리드 변경의 `pnpm verify` PASS: Node 24.19.0, 구조/lint/typecheck, 10 suites/48 unit tests, Vite/Storybook build. 그리드 전용 E2E는 Chromium/Firefox/WebKit 각 6개, **18/18 PASS**(재시도 없음, 1.1분). 헤더 32px·바디 40px·입력 컨테이너 32px, 24px 컨트롤 비중첩, 필터된 전체 선택, 안정적인 행 ID 편집, 단일 선택, 옵션 확정 후 초점 복귀, 텍스트 클릭/방향키, empty/disabled/총계, 좁은 화면 내부 스크롤을 확인했다. 실제 Theme Lab → 테마 적용 → Grid 진입으로 Light/Dark × Standard/High를 검사하고 High에서는 reduced motion을 적용했다. 각 테마의 실제 선택/드롭다운 변경 후 axe serious/critical 위반 0을 확인했다.

최종 번들: `index-DPCdrB2D.js` / `index-YekY-6YD.css`. JS SHA256 `06C8D4D849590D5FDBB90B7B178A80FD43C54DB019241747788C55ABA7C86F73`, CSS SHA256 `6148886A5AE9777F5A0CA925266DF62FD11133741101AEFDE9C8A7FA9A816E12`. 전체 회귀는 Chromium/Firefox/WebKit 각 64개, **192/192 PASS**(재시도 없는 단일 실행, 19.2분)로 완료했다. `test-results/.last-run.json`도 `passed` / `failedTests: []`다. 검사 중 마지막 변경은 그리드 필수 표시의 14px 글꼴 및 그룹 헤더의 시각 아이콘이며, 이미 통과한 기존 컴포넌트 동작에는 영향을 주지 않는다. 최종 그리드 상태는 이후 Firefox/WebKit 검증과 실제 앱 UI readback으로 확인했다. 마지막 시각 변경까지 포함한 최종 번들의 Chromium 그리드 **6/6 PASS**(14.5초) 및 네 테마 캡처도 별도 결과 폴더에서 확인했다. 검증 도중 발견한 잘못된 테스트 대상(TextField 내부 글줄 16px과 실제 컨테이너 32px의 구분)과 갤러리 표 수(6→8)는 실제 추가된 UI 계약에 맞춰 수정했다. 고대비 총계와 Portal 클릭 초점 회귀는 구현을 수정하고 원래 기대값을 그대로 유지해 통과했다.

실제 Windows Contrast Themes와 스크린리더의 혼합 선택/복합 초점 안내 검증은 미수행이므로 compliance `BLOCKED`를 유지한다. 이 수동 증거 상태는 구현된 기능을 부정하지 않으며, 전체 M3 준수 PASS를 주장하지 않는다.

실제 브라우저 캡처: [Light Standard](grid-light-standard.png) · [Dark Standard](grid-dark-standard.png) · [Light High](grid-light-high.png) · [Dark High](grid-dark-high.png). 기준 이미지 비교나 Linux 픽셀 게이트가 아닌 현재 구현의 readback이다.

## 근거

- [TanStack v9 useTable](https://tanstack.com/table/latest/docs/framework/react/examples/basic-use-table): headless 모델/명시적 feature 등록. 정확한 9.2.4 API는 설치된 패키지 선언과 같이 확인했다.
- [WAI APG Table](https://www.w3.org/WAI/ARIA/apg/patterns/table/): native table과 내부 interactive controls의 의미 구분.
- [Material Web Checkbox](https://github.com/material-components/material-web/blob/main/docs/components/checkbox.md), [IconButton](https://github.com/material-components/material-web/blob/main/docs/components/icon-button.md): native/접근성 의미는 유지하고 사용자가 허용한 compact 영역만 그리드에 한정.
- 원본 Figma의 두 root 및 text-edit/check-button/chip-select/text-select/disabled text/cell-selected/totals child를 이 작업에서 다시 읽었다. 추후 `use_figma` 추가 읽기는 Figma Full seat 제한 응답으로 실패했지만 `get_design_context` child 읽기는 성공했다. 초기 성공한 axes/치수 읽기와 child context에 근거했다.
