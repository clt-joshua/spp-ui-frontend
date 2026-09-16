# 그리드 개발 가이드 구현 · 2026-09-08

사용자가 제공한 최신 개발 가이드를 기준으로 이전 정합성 감사의 미반영 차이를 구현했다. 대상은 `codex/grid-development`, `C:\Develop\spp-ui-frontend-grid`, 기준 HEAD `0a462d82693f2936841c94c81c63e62304adaedf` 위의 미커밋 변경이다. 원본 main 작업 폴더는 수정하지 않았다.

## 디자인 근거와 교정

- [헤더 가이드 10803:11260](https://www.figma.com/design/aQ2CfBMmc3q2qD2oDQcnjU/2026_Design-System--Renuwal-?node-id=10803-11260&m=dev)
- [바디 가이드 10803:12225](https://www.figma.com/design/aQ2CfBMmc3q2qD2oDQcnjU/2026_Design-System--Renuwal-?node-id=10803-12225&m=dev)

두 root의 design context를 먼저 조회하고 패딩·높이·셀 타입의 실제 자식 노드를 대조했다. 새 가이드의 32px/40px는 최소 높이다. 이전 고정 높이 해석은 폐기하며 size variant를 추가하지 않는다. 헤더 64px 예시는 하나의 셀 내 세 줄 텍스트다. 그룹 헤더 2행과 구분한다.

| 항목 | 구현과 실측 기준 | Figma 자식 노드 |
| --- | --- | --- |
| 헤더 기본 | 바깥 세로 2px/가로 8px + 텍스트 세로 6px + line-height 16px = 32px | 10803:11553 |
| 헤더 줄바꿈 | 320px, 정렬·필터 각 24px, 세 줄에서 64px | 10803:11531 |
| 바디 기본 | 바깥 세로 4px/가로 8px + 텍스트 세로 8px + line-height 16px = 40px | 10803:13941 |
| 바디 줄바꿈 | 320px 일반/숫자 셀 세 줄에서 72px | 10803:12958, 10803:12975 |
| 선택/No. | checkbox·radio 열 40px, No. 기본 48px, 조작 영역 24px | 10803:12368 등 |
| 편집 | 32px TextField, 320px 셀 내 304px 외곽 너비 | 10803:13047 |
| 검색형 편집 | 입력 외곽 278px + 간격 2px + 검색 24px + 좌우 8px | 10803:15075, 10803:15138 |
| 숫자 편집 | 값과 placeholder 우측 정렬 | 10803:15138 |
| 칩 | 정적 표시, 높이 20px, 글꼴 11px/500, radius 8px, 드롭다운 제거 | 10803:12994 |

테두리는 1px overlay로 구현하여 콘텐츠 폭/높이를 차감하지 않는다. 넓은 화면에서 table min-width가 고정 열을 비례 확장하던 현상도 제거했다. 일반 열은 기본 320px이며 소비자가 명시한 열 너비를 유지한다.

13종은 check-only, radio-only, no, text, number, text-edit, number-edit, text-edit-search, number-edit-search, text-select, chip, grand-total, grand-total-number다. 삭제된 check-button/chip-select 및 불필요한 info는 API와 화면에서 제거했다. Figma의 disabled 배경/opacity 1을 유지하면서 native disabled 의미와 조작 차단은 보존한다. 총계 텍스트는 모든 테마에서 on-surface-variant, 상태는 Figma system state-layer 역할로 연결한다.

## 실제 진입과 기능

공통 AppHeader → 업무용 그리드(`/grid`)에서 기본 목록과 아래의 줄바꿈·검색형 편집·단일 선택 예시를 확인할 수 있다. `/components#data-grid`와 Storybook에도 동일 공개 DataGrid로 연결했다. 조회·정렬·필터·행 ID 기반 선택·편집·필터된 총계는 동작한다. 예시 데이터 갱신은 화면 메모리에 한정한다.

검색형 셀의 입력은 편집할 수 있다. 정의되지 않은 검색 동작은 시각 표시만 제공하고 `onSearch(row)`를 주면 실제 버튼이 소비자 동작을 호출한다. 비활성 행은 호출을 차단한다. 임의의 검색 서비스/저장 정책은 만들지 않았다.

## 검증과 한계

최종 실행 결과는 아래에 기록한다. 초기 검증에서 발견한 단일 선택 헤더 span의 잘못된 ARIA label을 명시적인 이미지 역할로 수정했다. 두 그리드의 같은 선택 요약을 하나로 조회하던 테스트는 대상 업무 목록에 범위를 한정했다. 기대 치수는 Figma 가이드 기준을 유지했다.

Figma 지정 색상은 axe 결과에 맞춰 임의 변경하지 않는다. 네 테마별 axe 원문은 보고서 첨부로 보존한다. 그리드 내 color-contrast 관찰은 디자인 정합성 판정과 분리하고, 다른 serious/critical 및 그리드 밖 대비 오류는 계속 실패 처리한다. 자동화 성공을 WCAG 전체 PASS로 해석하지 않는다. 실제 Windows Contrast Themes·스크린리더 검증은 미수행이므로 준수 상태 BLOCKED를 유지한다.

### 확인된 실행 결과

- `pnpm verify` PASS: 구조 검사, ESLint, TypeScript, 단위 10 suites/49 tests, Vite build, Storybook build.
- 그리드·테마·공통 헤더 집중 검증: Chromium/Firefox/WebKit **24/24 PASS**, 재시도 없이 55.1초.
- Vite 산출물: `index-Q2zv_xqQ.js`, `index-Qqu7m7sV.css`.
- 실제 앱 내 브라우저 `http://127.0.0.1:5175/grid`에서 담당자 입력 readback, REQ-001 체크 선택, GUIDE-001/002 라디오 교체, 40/72/40px 행 높이를 확인했다. Light/Dark 화면도 직접 비교했다.
- 네 테마 스크린샷: [Light Standard](grid-light-standard.png), [Dark Standard](grid-dark-standard.png), [Light High](grid-light-high.png), [Dark High](grid-dark-high.png).
- [원문 대비 관찰](focused-theme-results.json): 세 브라우저 모두 Standard Light/Dark 위반 0, High Light/Dark는 총계 텍스트 3개 각각 2.31:1. Figma 역할을 보존했으므로 이 결과는 해결된 WCAG PASS가 아니다. 그리드 밖 대비 위반과 그 외 serious/critical 위반은 0.

### 헤더 상태 피드백 추가 보정

실제 앱 내 브라우저에서 정렬 아이콘 hover가 헤더 black 6%와 아이콘 black 6%를 중복 표시하는 것을 확인했다. 헤더 내부 아이콘의 상태 레이어·Ripple opacity를 0으로 두고 셀의 6%/12% 피드백만 남겼다. CSS 선택자 우선순위도 바로잡아 포인터가 헤더에 남아 있어도 키보드 focus가 12%로 우선한다. 보정 후 실제 Tab 이동에서 헤더 `rgba(0,0,0,0.12)`, 내부 레이어 opacity `0`을 읽었다. 이를 재현하는 E2E를 추가했다.

전체 198개 회귀 실행은 `index-Q2zv_xqQ.js`/`index-Qqu7m7sV.css` 빌드를 끝까지 유지하며 실행한다. 위 최종 헤더 CSS 보정은 전체 실행 종료 후 다시 빌드하고 영향 범위인 그리드·테마·공통 헤더 테스트를 재실행한다. 두 artifact의 결과를 구분한다.

- 전체 회귀 결과: **198/198 PASS**, Chromium/Firefox/WebKit 각 66개, 재시도 없음, 13.1분. 원본 보고서 `artifacts/grid-dev-guide-full-report/index.html`. 이 실행은 위에서 명시한 헤더 최종 CSS 보정 전 artifact를 대상으로 했다.

- 최종 헤더 보정 포함 `pnpm verify` 재실행 PASS: 구조/린트/타입/49 unit/Vite/Storybook.
- 최종 영향 범위 E2E **27/27 PASS**, Chromium/Firefox/WebKit 각 9개, 재시도 없음, 59.0초. 헤더 hover 단일 6%, keyboard focus 단일 12% 회귀 포함. 원본 보고서 `artifacts/grid-dev-guide-final-report/index.html`.
- 최종 artifact: `index-CzfhuTme.js` SHA256 `60B3A9658001ABB62E736ED68B869C741952DC57B4F8F4CBCEC60E0BAF8E0FA4`; `index-B9dMksni.css` SHA256 `26C29B0777E9B9B816F43D921C32A65767B046DE0EA63A1D363AFAA7D5387833`.
- 기본 32px/40px와 긴 헤더 64px/본문 72px, checkbox/radio 40px, No.48px, 320px 검색 셀 입력 278px, 정적 chip 20px를 세 브라우저에서 확인했다. 일반 텍스트·숫자·편집·선택·총계의 소비자 흐름을 테스트 기대값으로 재정의하지 않았다.
- [Figma context 원문](figma-context.json)을 보존했으며 만료 asset URL은 제거했다. 본 감사의 13종은 사용자 승인 밀도에 해당하며 large 크기 변형을 추가하지 않았다.
- 변경은 전용 worktree에 남아 있다. 커밋·푸시·배포는 수행하지 않았다.
