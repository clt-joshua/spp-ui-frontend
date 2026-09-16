# 업무용 Headless Grid 라이브러리 선정 조사

조사일: 2026-09-08 (Asia/Seoul). 상태: 추천 완료, 라이브러리 채택 및 구현은 미실행.

## 추천

사용자가 확인한 용도는 **업무용 목록: 조회·정렬·필터와 일부 셀 편집**이다. 이 범위와 프로젝트의 React 19, TypeScript, MD3 토큰, CSS Modules, 공개 UI 경계를 종합하면 **TanStack Table v9를 데이터 처리 엔진으로 사용하고 프로젝트 소유 DataGrid UI를 구현하는 방식**을 추천한다. 현재 npm `latest`는 `@tanstack/react-table@9.2.4`다.

정렬·필터·페이지·행 선택 엔진까지 직접 만드는 것은 권하지 않는다. 커스텀 셀과 편집 UX는 제품 고유 영역이지만, 범용 테이블 상태 모델을 다시 만드는 편익은 현재 요구에서 작다. 이는 기능·유지보수 범위에 근거한 설계 판단이며 실제 구현 공수나 성능을 측정한 결과는 아니다.

## 브랜치와 작업 경계

- 전용 브랜치: `codex/grid-development`
- 전용 worktree: `C:\Develop\spp-ui-frontend-grid`
- 기준 커밋: `0a462d82693f2936841c94c81c63e62304adaedf` (기존 로컬 `main` HEAD)
- 기존 작업 폴더: `C:\Develop\spp-ui-frontend`, 브랜치는 `main` 유지.
- 생성 전후 기존 폴더의 `git status --porcelain=v1` 29개 항목이 동일함을 확인했다. 기존 HEAD는 로컬 tracking ref `origin/main`보다 1개 커밋 앞서 있었으며 원격 fetch/push는 수행하지 않았다.
- 기존 폴더의 미커밋 테마 설정·탐색·Location Chip·포트 변경은 이 브랜치에 포함되지 않는다. 이후 그리드 구현 시 이 기반 차이를 고려해야 한다. 미커밋 파일을 복사하거나 임의로 커밋하지 않았다.
- 이번 변경은 이 조사 문서와 브랜치의 프로젝트 메모리뿐이다. 라이브러리 설치, UI 구현, 서버 실행, 커밋, 푸시, 배포는 수행하지 않았다.

## 사용자 평가를 해석한 방법

동일 표본·동일 기준으로 Headless Grid의 만족도를 비교하여 1위를 확정할 수 있는 최신 조사는 이번 검색에서 확인하지 못했다. 따라서 아래 수치를 만족도 점수로 환산하지 않는다.

| 후보 | GitHub Stars | npm 다운로드 / 동일 7일 | 관찰 버전 |
|---|---:|---:|---|
| TanStack Table | 28,413 | 13,943,411 (`@tanstack/react-table`) | 9.2.4, 2026-08-28 게시 |
| React Aria | 15,854 (React Spectrum 전체 저장소) | 3,520,784 (`react-aria-components` 전체) | 1.21.1 |
| AG Grid | 15,586 | 2,064,513 (`ag-grid-react`) | 36.1.0 |
| React Data Grid | 7,675 | 497,657 (`react-data-grid`) | 7.0.0-beta.61 |

GitHub 수치는 2026-09-08 공개 REST API를 직접 조회했다. npm 다운로드 기간은 **2026-08-31~2026-09-06**으로 통일했다. 설치 횟수에는 CI·자동화·간접 의존성과 여러 버전 사용이 포함되므로 실제 사용자 수나 v9 채택률이 아니다. 특히 React Aria의 수치는 Table 단독 수치가 아니므로 직접적인 Table 점유율 비교는 불가능하다.

출처: [TanStack 저장소 API](https://api.github.com/repos/TanStack/table), [Adobe 저장소 API](https://api.github.com/repos/adobe/react-spectrum), [AG Grid 저장소 API](https://api.github.com/repos/ag-grid/ag-grid), [React Data Grid 저장소 API](https://api.github.com/repos/Comcast/react-data-grid). npm: [TanStack](https://api.npmjs.org/downloads/point/2026-08-31:2026-09-06/@tanstack/react-table), [React Aria](https://api.npmjs.org/downloads/point/2026-08-31:2026-09-06/react-aria-components), [AG Grid](https://api.npmjs.org/downloads/point/2026-08-31:2026-09-06/ag-grid-react), [React Data Grid](https://api.npmjs.org/downloads/point/2026-08-31:2026-09-06/react-data-grid).

사용자가 자신의 경험을 설명한 [비교 토론](https://www.reddit.com/r/react/comments/1nu2x84/tanstack_table_vs_ag_grid_or_other_approach_for/)에서는 TanStack의 커스텀 자유도와 타입을 선호하는 의견, 복합 기능 구현에 많은 코드가 필요하다는 불만이 함께 확인된다. AG Grid의 내장 기능을 선호하는 경험도 있다. 이는 소수의 과거 경험담이며 v9 만족도를 입증하는 표본이 아니다. 기술 기능은 아래 공식 문서로 별도 확인했다.

이 근거가 뒷받침하는 결론은 **조사한 후보 중 TanStack Table의 생태계와 채택 신호가 가장 강하며 현재 프로젝트에 적합하다**는 것이다. 모든 라이브러리를 망라한 절대적 사용자 만족도 1위라는 뜻은 아니다.

## 후보 비교

아래 개발 난이도와 적합성은 프로젝트 요구를 반영한 상대적 판단이다.

| 선택지 | Headless 성격 | 커스터마이징 | 초기 개발과 유지보수 | 이번 요구에 대한 판단 |
|---|---|---|---|---|
| **TanStack Table v9** | DOM·스타일을 강제하지 않는 데이터/상태 엔진 | 가장 자유로운 편. 기존 컴포넌트와 토큰 활용에 적합 | UI를 조립해야 하므로 초기 부담은 중간. 공통 DataGrid로 감싸면 소비 화면 개발이 단순해짐 | **1순위** |
| React Aria Table / useTable | Table은 무스타일 컴포넌트, useTable은 동작 hook | 스타일 자유도 높음. collection/selection/focus 모델에 맞춰 구성 | 키보드·포커스·접근성 재사용에 유리. 데이터 처리와 기존 Base UI 구성의 연결은 별도 검토 | 접근성 중심 대안 |
| AG Grid | 렌더러와 동작이 포함된 완성형 Grid | 셀 컴포넌트·테마 확장 가능. DOM과 동작 전체를 소유하는 모델은 아님 | 기본 기능을 빨리 제공하기 좋음. 프로젝트 UI 규칙과 맞추는 비용 발생 | 완성 기능과 납기를 더 중시할 때 대안 |
| React Data Grid | 렌더러·스타일이 포함된 React Grid | 셀 editor/renderer 교체 가능 | 가상화·편집·키보드 동작 재사용 가능. 현재 npm latest가 beta 표기 | 편집 중심 무료 대안, 이번에는 후순위 |
| 엔진부터 직접 개발 | 전부 직접 소유 | 제한 없음 | 상태 조합·회귀·접근성 책임이 가장 큼 | 현재 요구에는 비추천 |

공식 기능 근거: [TanStack Table](https://tanstack.com/table/latest), [React Aria Table](https://react-aria.adobe.com/Table), [React Aria useTable](https://react-aria.adobe.com/Table/useTable), [AG Grid Community/Enterprise](https://www.ag-grid.com/react-data-grid/community-vs-enterprise/), [React Data Grid README](https://github.com/Comcast/react-data-grid).

AG Grid Community에서도 정렬·필터·페이지·기본 Grid 기능을 무료로 제공한다. AG Grid 전체를 유료 제품으로 취급하면 안 된다. 고급 범위 선택, Excel 내보내기, 피벗, 고급 clipboard 등은 Enterprise 영역이다. TanStack Table은 MIT이고 React Aria는 Apache-2.0이다. React Data Grid npm 패키지는 MIT로 표기되어 있다. 라이선스 확인은 공개 패키지 메타데이터와 공급자 문서 기준이다.

## TanStack v9 기준의 판단

v9는 **2026-08-04 정식 출시**됐다. React 18 이상을 지원하고 React Compiler 호환, 필요한 기능을 선택하는 구조, 사용자 정의 기능 확장, 상태 구독 개선을 제공한다. 과거 v8의 Compiler 문제를 현재 버전의 제한으로 그대로 인용하지 않는다. 다만 v9 정식 출시 후 약 한 달밖에 지나지 않았으므로 v8 중심 예제나 기존 wrapper를 혼용하지 않도록 버전을 고정해야 한다. [정식 출시 공지](https://tanstack.com/blog/announcing-tanstack-table-v9), [패키지 메타데이터](https://registry.npmjs.org/@tanstack%2freact-table).

신규 구현은 `9.2.4`와 v9 공식 API를 기준으로 시작하는 것을 추천한다. npm peer dependency `react >=18`은 저장소의 React `19.2.8`을 포함한다. 이는 선언상 호환성을 확인한 것이며 이 저장소에서 실행 검증한 결과는 아니다. 기존 컴파일러 문제 때문에 새 프로젝트에 v8을 선택할 이유는 이번 조사에서 찾지 못했다.

## 재사용할 기능과 직접 구현할 기능

| 영역 | 제안 책임 |
|---|---|
| 컬럼 모델, 정렬, 필터, 페이지, 행 선택, 표시 컬럼 상태 | TanStack Table |
| 행·셀 렌더링, 헤더, 빈 상태, 로딩·오류 UI | 프로젝트 DataGrid |
| 셀 편집 입력, 검증, 저장/취소, 서버 오류 표시 | 프로젝트 DataGrid 및 기존 TextField/Select/Checkbox |
| 실제 데이터 조회·변경·권한·영속화 | 소비 애플리케이션의 데이터 계층. Table은 데이터베이스 저장 도구가 아님 |
| 키보드와 포커스, 정렬·선택·편집 상태 전달 | Grid 계약에 따라 프로젝트가 구현·검증. TanStack만 설치해 완료된 것으로 처리하지 않음 |
| 대량 행 렌더링 | 필요가 확인되면 TanStack Virtual |

가상화는 처음부터 필수 의존성으로 넣지 않는다. 일반 페이지 단위 목록에는 정상 DOM 렌더링을 우선 검토하고, 실제 행 수·셀 복잡도로 필요성을 판단한다. 가상화를 추가해도 전체 데이터가 브라우저에 있어야 하는 문제는 해결되지 않으므로 서버 정렬·필터·페이지와 구분해야 한다. [v9 공식 가상화 가이드](https://tanstack.com/table/latest/docs/framework/react/guide/virtualization).

서버 기반 목록이라면 정렬·필터·페이지를 동일한 서버 기준으로 적용해야 한다. 서버에서 받은 한 페이지만 클라이언트 정렬해 전체 목록 정렬처럼 보이게 하지 않는다. [공식 클라이언트/서버 선택 가이드](https://tanstack.com/table/latest/docs/guide/client-side-vs-server-side).

일부 셀 편집의 대표 흐름은 **편집 진입 → 입력 및 검증 → 저장/취소 → 저장 결과 반영 → 정렬·필터·페이지 변경 후 결과 유지**로 설계하는 것이 적합하다. 행 식별자는 표시 인덱스와 분리해야 하며 저장 실패를 성공 표시로 바꾸지 않는다. 이 문단은 제안 계약이며 구현된 동작이 아니다.

## 프로젝트 적용 방향

공개 사용 경로는 `src/ui/index.ts`의 프로젝트 소유 `DataGrid`로 제안한다. TanStack 런타임 사용은 `src/ui/**` 내부로 묶고, 소비 화면에는 컬럼·데이터·제어 상태·편집 콜백 중심의 API를 제공한다. TanStack 전체 API를 그대로 복제한 wrapper는 만들지 않는다.

시각 구성은 기존 reference → system → component 토큰 및 CSS Modules를 따른다. 내부 Checkbox/TextField/Select/Menu는 기존 컴포넌트를 재사용한다. React Aria와 TanStack을 처음부터 이중으로 조합해 행 선택·정렬·포커스 상태의 소유자를 중복시키는 방식은 기본안으로 권하지 않는다.

Grid의 M3/Figma 시각 근거와 WAI-ARIA 동작 계약은 구현 단계에서 명시해야 한다. 라이브러리 채택만으로 M3 준수나 접근성 PASS를 선언할 수 없다. 실제 제품 흐름과 `/components` 상태 매트릭스를 같은 DataGrid 구현으로 제공하고 검증해야 한다. 사용자 데이터가 아직 없으므로 이번 조사에서 실제 앱 편집·저장이나 대량 데이터 성능을 검증한 것으로 보고하지 않는다.

엔진 자체 개발을 재검토할 조건은 라이브러리 모델로 표현하기 어려운 고유한 데이터 구조나 상호작용이 핵심 제품 가치가 되는 경우다. 향후 Excel 수준의 범위 편집·피벗·대량 clipboard가 주요 요구로 바뀌면 AG Grid 등 완성형 Grid를 다시 비교하는 편이 합리적이다. 현재 사용자가 확인한 범위에는 해당하지 않는다.

## 완료 범위와 한계

- 브랜치/worktree 생성 및 기준 커밋 readback 완료.
- 공식 문서, 공개 GitHub/npm 메타데이터, 사용자 경험담 조사 완료.
- 라이브러리 선택은 추천 상태이며 사용자 승인된 아키텍처 결정으로 승격하지 않음.
- 제품 코드·의존성·기존 작업 폴더 변경 없음. 런타임 검증, 성능 벤치마크, E2E 미실행.
- 기존 컴포넌트의 준수 BLOCKED 상태와 기존 배포 상태는 이번 조사의 판정 대상이 아님.
