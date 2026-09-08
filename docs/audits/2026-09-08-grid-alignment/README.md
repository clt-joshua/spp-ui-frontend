# 공통 헤더 통합과 최신 Figma 그리드 정합성 점검

## 결론

상단 페이지 헤더는 Theme Lab(`/`), 컴포넌트 검증(`/components`), 업무용 그리드(`/grid`)가 하나의 `AppHeader`를 사용하도록 통합했다. **그리드 셀 디자인은 부분 일치이며 최신 Figma 전체와 일치하지 않는다.** 아래 미반영 항목은 이번 정합성 점검의 발견 사항이다. 이번 수정 범위는 페이지 헤더 통합이며, 그리드 API·셀 종류·편집 의미를 새 디자인에 맞춰 변경하지 않았다.

브랜치 `codex/grid-development`, worktree `C:\Develop\spp-ui-frontend-grid`, 기준 HEAD `0a462d82693f2936841c94c81c63e62304adaedf`. 다른 화면에서 사용 중인 `C:\Develop\spp-ui-frontend\src\components\AppHeader`를 읽고 동일한 구조를 이 브랜치에 도입했다. 원본 작업 폴더는 수정하지 않았다. 그리드 링크와 현재 페이지 표시를 추가했으며 세 페이지의 헤더 중복 코드는 제거했다.

## 공통 헤더

- 동일한 브랜드, 중앙 페이지 탐색, 테마 상태 표시. 데스크톱 높이 72px, sticky 헤더.
- 모든 화면에서 Theme Lab → 컴포넌트 검증 → 업무용 그리드로 직접 이동하며 `aria-current=page`는 현재 페이지만 표시한다.
- 작은 화면에서는 탐색을 두 번째 줄로 배치한다. 320/390/768/1280px에서 링크 겹침·가로 문서 넘침을 검사한다.
- 기존 Theme Lab 옵션은 테마 설정 영역으로 이동했다. 그리드의 테마 전환과 그리드 검증 바로가기는 본문 액션으로 배치했다.

## Figma 최신 원본

- [Header 10450:83943](https://www.figma.com/design/aQ2CfBMmc3q2qD2oDQcnjU/2026_Design-System--Renuwal-?node-id=10450-83943)
- [Body 10450:84987](https://www.figma.com/design/aQ2CfBMmc3q2qD2oDQcnjU/2026_Design-System--Renuwal-?node-id=10450-84987)

두 루트를 이 점검에서 새로 조회했다. Body는 현재 **124개 노드**, 선택한 medium은 **13개 타입 / 68개 상태 조합**이다. 11개 일반 타입 × 6상태 + 총계 2타입 × enabled 1상태이며, large는 56개다. 두 크기의 타입 목록은 대칭이 아니다. API에는 사용자 확정대로 크기 variant를 추가하지 않는다.

medium 타입: text, number, no, text-edit, number-edit, **text-edit-search, number-edit-search**, text-select, **chip**, check-only, radio-only, grand-total, grand-total-number. `chip-select`는 large에만 남고 medium은 `chip`으로 바뀌었다. `check-button`은 현재 Body 루트에서 삭제됐다. 이전 감사의 12타입 목록은 그 당시 디자인 이력이다.

전체 루트 구조와 대표 child의 코드·스타일을 [design-context.json](design-context.json)에 저장했다. 만료되는 asset 주소는 영구 근거로 사용하지 않도록 제거했다. 현재 선택한 밀도와 변경된 타입을 중심으로 검토했으며 large의 모든 세부 상태를 재검증한 것은 아니다.

숫자·No.·숫자 총계·라디오·체크박스 selected·disabled select/chip의 추가 확인은 [additional-context.json](additional-context.json)에 보존했다. 숫자 우측/No. 중앙 정렬은 구현과 같다. disabled text-select/chip도 원본은 opacity 저하 없이 표시되지만 현재 선택 컨트롤은 opacity .38을 적용한다. 따라서 disabled 차이는 배경뿐 아니라 내부 콘텐츠 색 농도에도 있다. native disabled와 조작 차단은 계속 유지해야 한다.

## 일치한 항목

| 항목 | Figma | 현재 앱 readback | 판정 |
|---|---|---|---|
| 크기 | medium header 32px, body 40px | 헤더 행 각각 32px, body 40px | 일치 |
| 혼합 그룹 헤더 | 2단 헤더 64px | 32px × 2단, 비그룹 열은 native rowspan=2 | 의도한 구성 |
| 헤더 글꼴 | Noto Sans 12px/16px, 600, tracking .4px | 동일 | 일치 |
| 본문 글꼴 | 12px/16px, 400, tracking .4px | 동일 | 일치 |
| 셀 좌우 여백 | 8px | 실제 content padding 8px | 일치 |
| 기본 Light Standard 색 | header #eff3f6, body #fff, text #3e474f | 동일, body는 table 배경을 상속 | 일치 |
| 헤더/본문 선 | #adbac5 / #e0e7ec, 1px | 동일 | 일치 |
| 헤더 키보드 초점 | black 12%, 두 겹 elevation | 실제 Tab 이동에서 header layer .12, button layer 0, shadow 0 2 6 2 / 0 1 2 0 | 일치, 중복 wash 없음 |
| 필수 표시 | 14px/20px, 500, tracking .1px, Light #e72836 | 동일 | 일치 |
| 작은 컨트롤 | icon 16px, 조작 영역 24px, 체크박스 12px | 동일한 기본 크기 | 일치 |
| 편집 입력 | TextField 32px | 기존 TextField 재사용, 실제 control 32px | 일치 |
| 칩 자체 | 20px, 11px/16px, weight500, radius8 | 토큰과 칩 외형 동일 | 아래 드롭다운 구조 차이 있음 |
| Light Standard 총계 | #e4e0ff / #cfc9ff, text #3e474f, 600 | 동일 | 다른 모드는 아래 참조 |

Header의 `vertical/middle-inset` 이름만 보고 선에 상하 여백이 있다고 판정하지 않았다. 실제 header child가 반환한 SVG는 8×32 viewBox, y=0→32의 1px 선이었다. 구현의 전체 높이 세로 선과 부합한다. 별도 원본 `10450:83902` 직접 조회는 invalid selection 응답이어서, 성공한 header child의 실제 SVG를 읽어 확인했다.

## 미반영 차이와 필요한 후속 작업

| 우선순위 | 차이 | Figma 근거 | 현재 구현과 영향 | 필요한 변경 |
|---|---|---|---|---|
| 높음 | medium chip은 표시 전용 | 10580:55463: Submitted 칩, 화살표 없음 | `chip-select`로 화살표와 편집 combobox 표시. API에 `chip` 없음 | 표시용 chip을 분리하고 상태 편집을 어떤 열/동작으로 제공할지 반영 |
| 높음 | 검색형 편집 2종 추가 | 10803:14794 / 10803:14800: 32px 입력 + 24px search | text-edit-search/number-edit-search 타입 및 검색 아이콘 없음 | 두 타입의 시각 구성 추가. 검색 대상/결과 선택은 기능 정의가 필요하며 기존 사용자 허용에 따라 시각만 먼저 구현 가능 |
| 중간 | check-button 삭제 | 현재 Body 루트 124개 노드에 해당 타입 없음 | API와 `/components#data-grid`에 Db Click·화살표·Label 예시 잔존 | 최신 타입 행렬에서 제거하고 소비자 유무 확인 후 API 정리 |
| 중간 | 기본 text-edit 뒤의 info가 없어짐 | 10580:55308: 입력만 존재 | 예시 담당자 열의 `info` 아이콘이 입력 폭을 24px+gap만큼 차지 | 기본 편집 셀 예시에서 제거. 별도 정보 아이콘 정책과 구분 |
| 중간 | disabled 본문 배경 차이 | 10580:55224: surface-container-lowest, disabled layer transparent | 전체 disabled 행을 surface-container-low로 칠함. Light 실제 #f7fafc, 원본 #fff | 배경 alias를 원본에 맞추되 선택·입력 disabled 의미는 유지 |
| 중간 | Dark/High 총계 글자 역할 차이 | 10580:55216: on-surface-variant 연결 | Light Standard만 동일하고 Dark/High는 on-tertiary-container로 교체됨 | 기존 대비 보정과 Figma 연결 우선 정책을 정리해 원본 역할로 복원. 대비 측정과 정합성 판정은 별도로 기록 |
| 결정 필요 | 선택 열 폭 불일치 | Header medium 40px, Body medium 44px | 현재 같은 열을 48px로 구성 | Figma 자체의 header/body 폭이 달라 40/44 중 통합 폭 결정 필요. 표의 상하 열 경계를 어긋나게 구현하면 안 됨 |

또한 Dark/High 상태 레이어는 기존 구현에서 `on-surface` 기반으로 조정되어 있다. 이번 조회의 Light 원본 rgba만으로 네 모드 모두 일치했다고 주장하지 않는다. body의 cell-selected는 12% table-selected + primary 2px 외곽선 구조가 있으나 모든 타입의 hover·selected·disabled 조합을 이번 점검에서 각각 캡처한 것은 아니다.

## 검증과 한계

- 실제 5175 앱의 공통 헤더 → Theme Lab → Light 적용 → 업무용 그리드 흐름으로 치수·색상·키보드 초점을 읽었다.
- `pnpm verify`: 구조, lint, typecheck, 단위 10 suites/48 tests, Vite/Storybook PASS.
- 공통 헤더 및 그리드 Chromium 검사 6/6 PASS, 11.2초. 전체 Chromium/Firefox/WebKit 각 65개, **195/195 PASS**(재시도 없는 단일 실행, 16.3분). `test-results/.last-run.json`은 `passed`, `failedTests: []`다.
- 빌드: `index-b6X36E8G.js` / `index-DWlEIhjt.css`. 이번 헤더 변경 이후 artifact이며 이전 192개 통과 artifact와 구분한다.
- SHA256: JS `8301971AE81BEDA3FF85ED88FFA391E6A4DEA502C43FA22FF05901D43695026D`, CSS `69BAF5A10D63D13DDC517124A66CC924EE0E9EA3F31FE1C0842741562A51F4F3`.
- 자동 기능 테스트 통과는 위 미반영 디자인 차이를 해소하지 않는다. 디자인 정합성을 PASS로 승격하거나 테스트가 새 타입의 부재를 정당화하도록 바꾸지 않았다.
- 기존 Windows Contrast Themes·스크린리더 수동 증거 제한은 유지한다. 커밋·푸시·배포 없음.

현재 공통 헤더가 포함된 실제 캡처: [Light Standard](grid-light-standard.png), [Dark Standard](grid-dark-standard.png), [Light High](grid-light-high.png), [Dark High](grid-dark-high.png). 원본에 맞춘 새 셀 타입 구현 화면이나 픽셀 일치 인증이 아니라 이 점검 시점의 readback이다.
