# Figma Grid와 TanStack Table v9 구현 가능성 검토

검토일: 2026-09-08. 대상 브랜치: `codex/grid-development`, 코드 기준: `0a462d82693f2936841c94c81c63e62304adaedf`.

## 판정

**제공된 Figma의 헤더·셀 디자인과 확인 가능한 기능은 TanStack Table v9 기반으로 구현할 수 있다. 엔진을 직접 개발할 이유는 확인되지 않았다.** 다만 완성형 Grid를 설치하는 작업은 아니며, 프로젝트 소유 렌더러·편집기·키보드/포커스 처리를 구현해야 한다. 원본의 크기 불일치와 일부 동작 정의는 구현 전에 정리해야 한다.

이는 Figma 원본 속성과 공식 API를 대조한 설계 검토 결과다. 실제 Grid 구현, 브라우저 실행, 저장 연동, 성능 또는 접근성 검증을 완료했다는 의미가 아니다. 라이브러리 채택을 확정하거나 설치하지 않았다.

검토 대상은 다음 두 component set이다.

- [grid/header — 10450:83943](https://www.figma.com/design/aQ2CfBMmc3q2qD2oDQcnjU/2026_Design-System--Renuwal-?node-id=10450-83943)
- [grid/body — 10450:84987](https://www.figma.com/design/aQ2CfBMmc3q2qD2oDQcnjU/2026_Design-System--Renuwal-?node-id=10450-84987)

동일 페이지의 `grid-view` (`10482:60739`)는 보조 문맥으로만 조회했다. 두 링크 바깥의 전체 제품 화면이나 전체 파일의 기능 명세를 검토한 것으로 확대하지 않는다.

## 실제 Figma 범위

| 대상 | 선언된 축 | 실제 구성 |
|---|---|---|
| Header | Type 5종, Size `large/medium`, State 4종 | **22개**: normal/no는 크기별 4상태, checkbox only/radio only/2colurm은 크기별 enabled만 존재 |
| Body | Type 14종, Size `medium/small`, State 6종 | **128개**: 일반 10종 × 2크기 × 6상태 = 120개, 소계·총계 4종 × 2크기 × enabled = 8개 |

Header의 Boolean 속성은 `Required`, `Is sort`, `Is filter`다. Type 값은 `normal`, `no`, `checkbox only`, `radio only`, 원본 철자 그대로 `2colurm`이다. `2colurm`의 실제 구조는 **2단 헤더이며, 상위 792px 헤더 아래 88px 하위 헤더 9개**다. 이름을 보고 하위 컬럼을 2개로 제한하면 안 된다.

Body의 Type 값은 `text`, `number`, `no`, `text-edit`, `number-edit`, `text-select`, `chip-select`, `check-button`, `check-only`, `radio-only`, `sub-total`, `sub-total-number`, `grand-total`, `grand-total-number`다. 상태는 `enabled`, `row-hover`, `row-selected`, `cell-hover`, `cell-selected`, `disabled`이고, 추가 Boolean 속성은 `trailing-1st`, `trailing-2nd`다.

40개 Header 또는 168개 Body 조합을 모두 구현된 디자인이라고 보고하지 않는다. 합계 타입 등의 나머지 상태는 원본에 선언되지 않은 조합이다. 이번 조회에서 두 set 및 하위 노드의 annotation/documentation link는 비어 있었고, variant 자체의 prototype reaction은 없었다. 중첩된 Button/IconButton/Checkbox 등에는 자체 interaction reaction이 존재한다. Body 설명은 `data를 편집 가능한 cell에 사용`이다. 따라서 정렬 순서, 필터 연산자, 편집 저장 시점까지 완성된 기능 명세로 해석할 수 없다.

전체 축·상태 coverage는 [inventory.json](2026-09-08-figma-grid-evidence/inventory.json), 시각 참조는 [Header](2026-09-08-figma-grid-evidence/grid-header.png)와 [Body](2026-09-08-figma-grid-evidence/grid-body.png)에 보관했다.

## 기능별 대응

| Figma 요구 | 가능 여부와 TanStack 역할 | 프로젝트에서 구현할 부분 |
|---|---|---|
| 두 크기, 글꼴, 정렬, 경계, 상태색, 필수 표시 | 가능. Headless이므로 DOM/CSS를 제한하지 않음 | Grid 전용 component token, 셀·헤더 렌더러, 필수 입력과 표식 연결 |
| 일반/번호 컬럼 | 가능. accessor 컬럼과 표시 전용 컬럼 구성 | 번호가 화면 순번인지 업무 ID인지 정의, 텍스트/숫자 정렬·포맷 |
| `2colurm` 2단 헤더 | 가능. 중첩 column 정의와 header group 모델 | colSpan을 반영한 렌더링, 하위 폭 합산, 접근 가능한 헤더 연결 |
| 정렬 아이콘 | 가능. `rowSortingFeature` | 클릭·키보드 trigger, 오름/내림/해제 표시, 서버 또는 클라이언트 처리 연결 |
| 필터 아이콘 | 가능. `columnFilteringFeature` 등 | 필터 팝업, 필드별 연산자·옵션·적용/초기화 UI |
| 체크박스/라디오 행 선택 | 가능. `rowSelectionFeature`, 단일/복수 선택 설정 | Checkbox/Radio 표시, 전체 선택 범위, disabled 행 제외, 헤더 Radio 의미 |
| 행/셀 hover 및 선택 강조 | 가능. row selection 및 v9 `cellSelectionFeature` 활용 | 실제 pointer/focus 사건을 상태에 연결, 행 선택·셀 선택·편집 포커스 분리 |
| `text-edit` / `number-edit` | 가능. 셀 renderer 안에 편집기 배치 | 입력·숫자 parsing·검증·IME 처리·저장/취소·저장 오류·값 readback |
| `text-select` / `chip-select` | 가능. 커스텀 cell renderer와 데이터 상태 연결 | 테두리 없는 trigger, 옵션 popup, 칩 표시, 값 변경 및 저장 |
| `check-button` | 가능. 복합 cell renderer | 체크박스·텍스트·드롭다운·버튼의 독립 동작과 이벤트 전파 제어 |
| 소계/총계 label/number | 가능. v9 `rowAggregationFeature`, 필요 시 grouping 추가 | 집계 범위·업무 계산 규칙, 소계 위치, 총계 footer, 서버 집계값 연결 |
| disabled | 가능. 행/셀 선택 조건 및 편집 허용 여부 제어 | 내부 모든 control에 실제 disabled/readOnly 계약 전달 |
| 키보드/접근성 | 가능하나 TanStack만으로 완성되지 않음 | Grid 탐색·편집 모드, DOM focus, ARIA, popup 닫힘과 셀 복귀 |

공식 근거: [Header groups](https://tanstack.com/table/latest/docs/guide/header-groups), [정렬](https://tanstack.com/table/latest/docs/framework/react/guide/sorting), [필터](https://tanstack.com/table/latest/docs/framework/react/guide/column-filtering), [행 선택](https://tanstack.com/table/latest/docs/framework/react/guide/row-selection), [셀 선택](https://tanstack.com/table/latest/docs/framework/react/guide/cell-selection), [집계](https://tanstack.com/table/latest/docs/framework/react/guide/aggregation).

**v9의 셀 선택 기능을 없는 기능으로 취급하면 안 된다.** 선택 영역·포커스 셀·선택 경계 API를 제공한다. 다만 공식 문서는 키보드 이벤트 처리를 포함하지 않는다고 명시하므로, 방향키를 이동 API와 연결하고 실제 DOM focus 및 편집 입력과의 우선순위를 관리해야 한다. 시각적인 `cell-selected`가 요구된다는 이유만으로 Excel형 다중 범위 선택까지 제품 범위를 확대하지 않는다.

집계도 v9에서는 grouping과 독립적으로 사용할 수 있다. 기본 합계는 필터 적용 후, 페이지 분리 전의 row model을 기준으로 한다. 전체 데이터·현재 필터 결과·현재 페이지 중 어느 합계인지 결정하고, 서버 페이지 한 개만 받은 상태에서 그 합계를 전체 총계로 표시하지 않아야 한다. 이는 TanStack 불가능 항목이 아니라 데이터 계약의 책임이다.

## 기존 프로젝트 컴포넌트와의 통합

| 현재 코드 | 활용 가능 부분 | 필요한 보완 |
|---|---|---|
| TextField | `small`, `hideLabel`, text/number, disabled/readOnly, 오류 설명 제공 | Figma의 32px editor를 활용 가능. 셀 이름은 숨겨도 접근 가능한 label 유지. 저장·취소와 포커스는 Grid 책임 |
| Select | Base UI selection/portal, option 탐색, dropdown motion | 공개 API에 Grid용 테두리 없는 trigger/크기 선택이 없음. 현재 일반 필드 형태를 강제로 축소하지 말고 내부 동작을 공유하는 Grid editor 구성이 필요 |
| Chip | assistive 및 `x-small` 시각 token | Figma 칩은 선택값 표시로 사용됨. 현재 AssistiveChip의 button을 Select trigger button 안에 중첩하지 않도록 표시 content와 행동 소유자를 구분해야 함 |
| Checkbox / Radio / IconButton / Button | 상태·disabled·focus·ripple 및 아이콘 adapter | compact 셀에서 48px 조작 영역과 실제 배치가 양립하는지 해결해야 함 |
| Theme와 토큰 | `state-layer-table-selected`, surface/outline, secondary/tertiary container, typography 제공 | Grid의 component token 계층을 새로 연결. Figma effect와 기존 공통 elevation 차이는 독립 검토 |
| `src/ui/index.ts` | 유일한 앱 진입점 유지 | DataGrid 공개 API는 신규. 현재 Grid/Tooltip 전용 공개 컴포넌트는 없음 |

코드 근거: [TextField](../../src/ui/components/TextField/TextField.tsx), [Select](../../src/ui/components/Select/Select.tsx), [Chip](../../src/ui/components/Chip/Chip.tsx), [Checkbox CSS](../../src/ui/components/Checkbox/Checkbox.module.css), [IconButton CSS](../../src/ui/components/IconButton/IconButton.module.css), [component tokens](../../src/ui/tokens/component.css), [public exports](../../src/ui/index.ts).

## 원본에서 확인된 설계 정리 항목

### 1. 같은 헤더의 상태별 높이가 다름

`normal / medium / enabled` (`10574:36296`)는 **32px**, 상하 padding **2px**다. 같은 크기의 hovered/focused/pressed (`10574:36308`, `10574:36320`, `10574:36332`)는 **36px**, 상하 padding **4px**다. medium 번호/선택 헤더도 36px인데 2단 그룹 헤더는 32px × 2 = 64px다.

원본 수치를 그대로 각각의 실제 셀 높이로 적용하면 hover에서 행 높이 변화 또는 서로 다른 경계가 생길 수 있다. isolated 컴포넌트의 자연 높이와 실제 행 높이를 분리할지, normal medium을 36px로 통일할지 등은 설계 결정이 필요하다. 이번 검토에서 값을 정규화하지 않았다. [원본 readback](2026-09-08-figma-grid-evidence/disabled-and-header.json)

### 2. Body medium의 셀 종류별 높이가 다름

일반 텍스트·숫자·선택·합계 셀은 **48px**, text-edit/number-edit/check-only/radio-only는 **44px**다. small은 모두 **40px**다. 입력기는 두 크기 모두 32px이고 medium은 상하 6px, small은 4px padding을 사용한다.

한 행 안에서는 공통 높이가 필요하므로 컨테이너를 늘리고 내부 콘텐츠를 정렬하는 방식 등을 정의해야 한다. Header의 large/medium과 Body의 medium/small도 이름이 다르므로 단일 DataGrid density와의 명시적 매핑이 필요하다. [모든 14종 × 두 크기의 enabled readback](2026-09-08-figma-grid-evidence/body-controls.json)

### 3. disabled 컨테이너 내부의 control은 enabled로 남아 있음

예를 들어 `text-edit / disabled` (`10463:7035`, `10580:55312`)의 내부 TextField는 `State=enable`, IconButton은 `State=enabled`다. disabled check-only/radio-only 안의 Checkbox/Radio도 enabled다. 이 구조는 크기 두 종류 모두 확인했다.

실제 제품에서는 컨테이너 배경만 disabled 색으로 바꾸면 안 된다. 선택·편집·버튼 실행을 어디까지 막는지 정의하고 각 control에 적용해야 한다. readonly와 disabled가 같은 의미인지, 도움말 버튼은 계속 사용할 수 있는지도 원본에서 확정되지 않았다. [disabled control readback](2026-09-08-figma-grid-evidence/disabled-and-header.json)

### 4. 고밀도 디자인과 48px 조작 영역의 계약 충돌

Figma medium Header에서 두 IconButton은 24px씩 인접하고 선택 Header 폭은 40px다. 기존 IconButton/Checkbox/Radio의 조작 영역은 48px다. 작은 셀 안에 현재 control을 그대로 배치하면 인접 버튼의 조작 영역이 겹치거나 셀을 넘어갈 위험이 있다. likelihood는 단순 재사용 시 높지만, 실제 Grid를 아직 구현하지 않아 클릭 실패를 재현한 것은 아니다.

`M3_WEB_SPEC_CONFLICT` 검토 항목: 프로젝트의 48px 조작 영역 계약과 Figma compact geometry를 함께 만족시킬 Grid 전용 배치·density 정책이 필요하다. 임의로 조작 영역을 줄이거나 겹친 채로 완료 처리하지 않는다. 이는 라이브러리 선택의 장애가 아니라 정확한 시각 일치와 프로젝트 계약을 동시에 충족하기 위한 결정이다.

### 5. 기능 의미가 아직 미정인 부분

- 헤더 Radio의 역할과 Checkbox 전체 선택의 범위: 현재 페이지, 필터 결과, 전체 데이터 중 무엇인지.
- 그룹 헤더의 정렬·필터 아이콘이 어떤 leaf 컬럼 또는 복합 조건을 제어하는지.
- `cell-selected`가 단일 활성 셀인지 실제 범위 선택인지, row-selected와 동시에 적용될 때 우선순위.
- 편집 진입이 단일 클릭·더블클릭·Enter/F2 중 무엇인지, Enter/blur/명시적 버튼 중 저장 시점, Escape 취소, 실패 복구.
- `check-button`의 체크가 행 선택인지 데이터 Boolean인지. `Db Click`은 현재 셀의 표시 텍스트이며 실제 더블클릭 동작 명세는 확인되지 않음.
- `text-select`/`chip-select`의 옵션·단일/복수 선택·선택 후 저장, 정보 아이콘의 도움말 또는 업무 동작.
- 소계·총계 계산 대상, 그룹 기준, 서버 집계 여부.

현재 두 노드는 셀 컴포넌트 정의이므로 pagination·loading/empty/error·열 고정/resize·수평 스크롤·전체 그리드 조합·반응형 화면을 완결된 정의로 제공하지 않는다. 이 항목을 지원 불가로 분류하거나 이미 요구된 기능으로 추가하지 않는다.

## 권장 구현 방향

기본 구조는 **TanStack Table v9 → 프로젝트 DataGrid renderer/editor → `src/ui/index.ts` 공개 API → 실제 소비 화면**이다. TanStack은 컬럼/row model/정렬/필터/선택/집계를 맡고, 프로젝트는 디자인·실제 focus·편집·저장 계약을 맡는다. React Aria를 동시에 추가해 선택 상태를 이중 소유하거나 별도 Grid 엔진을 만드는 것은 기본안에 포함하지 않는다.

업무용 Grid의 키보드 탐색과 편집 모드는 [WAI-ARIA Grid Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/grid/)에 맞춰 정의한다. 입력 중 방향키·한글 IME·Select option 탐색을 Grid 이동이 가로채지 않아야 한다. 모양이 셀인 것과 focus/selection/editing 상태는 별도 개념이다.

가상화는 실제 데이터 규모와 셀 복잡도를 확인한 뒤 결정한다. [TanStack Virtual 연동](https://tanstack.com/table/latest/docs/framework/react/guide/virtualization)은 가능하나, 편집 중 셀이 화면 밖으로 나갔을 때의 draft 보존과 focus 복귀는 프로젝트 책임이다. 범위 선택·대량 clipboard·Excel 기능을 이번 디자인만으로 필수화하지 않는다.

구현을 진행한다면 별도 fixture 전용 구현을 만들지 말고 동일 공개 DataGrid를 `/components` 상태 매트릭스와 실제 목록에 연결해야 한다. 대표 흐름은 목록 진입 → 정렬/필터 → 행/셀 선택 → text/number/select 편집 → 저장 또는 취소 → 데이터 재조회와 집계 readback이다. 이 경로를 검증하기 전에는 동작 완료나 M3 준수 PASS로 표시하지 않는다.

## 검토 증거와 한계

- Figma 파일은 수정하지 않았다. exact node 조회, screenshot, Plugin API의 속성·설명·annotation·reaction readback만 수행했다.
- Header 전체 design context, Body 전체 inventory/screenshot, 복합 편집·disabled·chip·button cell의 하위 design context를 확인했다. 150개 모든 variant의 개별 screenshot 또는 전체 테마별 pixel 검증을 수행한 것은 아니다.
- 모든 Type × Size의 enabled 컨테이너·중첩 control과 두 크기의 disabled control을 확인했다. 일반 text body 6상태와 normal header 4상태의 실제 색상 binding/effect를 추가 확인했다.
- [notes-and-states.json](2026-09-08-figma-grid-evidence/notes-and-states.json)은 원본의 layer 속성을 기록한다. 여러 겹의 최종 합성색이나 WCAG 대비 측정을 수행한 결과로 해석하지 않는다.
- React 패키지 `9.2.4`의 공개 메타데이터에서 `react >=18`, MIT를 재확인했다. 프로젝트 React 19는 선언상 범위에 포함되지만 설치·실행 검증은 하지 않았다.
- 그리드 브랜치의 `src/**`, package.json, pnpm-lock.yaml은 변경하지 않았다. 구현·단위/E2E·성능 benchmark·커밋·푸시·배포 미실행.
- 기존 main 폴더의 미커밋 변경은 이 worktree에 포함되지 않는다. 해당 작업과 합치는 시점에는 소비 컴포넌트 API와 token의 실제 revision을 다시 대조해야 한다.
