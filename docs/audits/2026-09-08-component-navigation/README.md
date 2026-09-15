# 컴포넌트별 검증 화면 재구성

## 적용한 계약

- 기존 8개 그룹을 14개 개별 항목으로 대체하고 선택된 컴포넌트 예제만 마운트한다.
- Chip 하위 타입 4개와 기존 모든 size/variant/state/상호작용 예제를 보존한다.
- 내부 registry에서 메뉴·제목·렌더링을 관리한다. 공개 UI API/token 및 공통 헤더는 변경하지 않는다.
- hash 직접 진입·새로고침·history·기존 주소 alias와 unknown→Button 기본값을 지원한다.
- 데스크톱 링크 목록/모바일 공용 Select로 이동한다. 컴포넌트가 바뀌면 예제는 초기화하고 본문 제목으로 포커스·스크롤을 이동한다.
- 예제에 속한 Dialog/Menu 등은 unmount하고 Snackbar는 생성한 ID만 dismiss한다. 전역 테마와 다른 화면의 알림은 유지한다.

## 검증

- 신규 탐색 3개 × Chromium/Firefox/WebKit = 9/9 PASS: 14항목·선택 예제 단일 mount, history/reload/초기화, Snackbar/Modal 정리, 12개 alias/default, theme, 375/768/1280/1920px 표 및 모바일 selector.
- 실제 localhost:5174/components#chip에서 새 메뉴·단일 Chip 예제·모바일 전환을 확인했다.
- 변경 전 작업 트리의 20개 SampleGroup JSX 블록과 독립 모듈의 20개 블록을 공백 정규화해 대조했다. 20/20 일치하며 기존 예제 markup·속성·상태 조합을 삭제하지 않았다. 예제를 감싼 탐색 구조와 상태 소유권만 변경했다.
- 전체 감사가 네 테마 × 14개 = 56개 화면을 순회했다. 기존 대비·Snackbar 정책 문제로 FAIL이며 미검사를 PASS로 바꾸지 않았다.
- 기존 Location manifest의 2026-09-08 날짜와 단위 테스트의 2026-09-02 기대값을 일치시켰다. 검증 상태/BLOCKED를 변경하지 않았다.
- 전체 E2E 중 React 진입 전 isVisible 판정이 mobile 분기로 잘못 들어간 테스트 경쟁 조건을 발견했다. 실제 검증 화면 h1이 보인 뒤 메뉴 유형을 판단하도록 테스트/감사 helper만 교정했다.
- `pnpm verify` PASS: 구조 검사·lint·typecheck·단위 10 suites/48개·Vite·Storybook build. registry 단위 테스트가 실제 예제 모듈을 import하므로 테스트용 TypeScript에도 앱과 같은 `@/*` alias를 정의했다.
- Checkbox geometry 회귀는 별도 시점의 control/icon 좌표를 비교해 행 이동을 내부 정렬 오류로 보고했다. 실제 같은 프레임 중심 오차 0px를 확인했고, 기대 크기/정렬 수치는 유지하며 원자적 좌표 읽기로 수정했다.
- 전체 `pnpm test:e2e`: **185 PASS / 1 FAIL**, 14.5분, 재시도 없는 186개 실행. 실패는 Chromium Checkbox의 분리된 시점 좌표 비교였고 Firefox/WebKit은 각 62개 모두 PASS다.
- 측정 교정 후 같은 제품 산출물에서 `pnpm exec playwright test tests/e2e/foundation.spec.ts --project=chromium --project=firefox --project=webkit --grep 'Checkbox는' --repeat-each=3`: **9/9 PASS**, 29.3초. 별도 재검증이며 단일 전체 186 PASS로 합산하지 않는다. 결과는 `artifacts/navigation-checkbox-report`에 보존했다.
- 마지막 lint·typecheck·구조 검사·diff 공백 검사도 PASS. 기존 미커밋 변경을 보존했으며 HEAD `0a462d8`에서 커밋·푸시·배포 없음.

검증 앱 산출물은 `index-DYLEnwIN.js` / `index-BUKKKMgB.css`다. 품질 build와 전체 E2E preview가 같은 산출물을 사용하며, Checkbox 테스트 측정 방식 교정은 제품 산출물을 바꾸지 않는다.

## 전체 감사 readback

`GALLERY_AUDIT_OUTPUT=artifacts/component-navigation-audit pnpm audit:components`는 실제 Theme Lab에서 Normal preset과 테마를 적용한 뒤 상단 링크 및 14개 메뉴를 차례로 선택한다. 로컬 Chromium 151.0.7922.34 / axe-core 4.13.0에서 56개 화면이 모두 기록됐다. 상세 JSON·스크린샷은 해당 로컬 출력 디렉터리에 있다.

| 테마 | 문자 대비 미달 요소 |
|---|---|
| Light / Standard | Button 30, Chip 12 |
| Light / High | Chip 10 |
| Dark / Standard | Chip 9 |
| Dark / High | Chip 10 |

나머지 닫힌 예제 화면의 자동 검사에는 위반이 없지만, 미검사 상태·수동 AT·Windows forced-colors에 대한 PASS를 의미하지 않는다. Snackbar는 Loading/Message/Success 3개 동시 표시, action 포함 알림이 최초 표시 후 6초에 사라지는 기존 문제를 다시 확인했다. 전체 감사 판정은 **FAIL**이고 기존 Button/Chip/Snackbar 정책 및 대비 BLOCKED를 유지한다. 분리된 페이지별 자동 검사 수치는 과거 전체 DOM의 건수와 직접 동일시하지 않는다.

실제 5174 모바일 상단 selector와 Chip 전환 후 제목 포커스·선택 section 1개·본문 overflow 0px를 확인했다. 로컬 시각 증거는 `artifacts/component-navigation-mobile-top.png`, `artifacts/component-navigation-mobile.png`이며 플랫폼별 픽셀 게이트를 추가하지 않는다.

추가 실제 5174 흐름: Button에서 Menu·Select·AutoComplete·Dialog로 각각 이동해 팝업을 연 뒤 브라우저 뒤로 이동했다. 네 경우 모두 `#button`, activeElement=`component-title`, 남은 menu/listbox/dialog DOM 0개를 readback했다.
