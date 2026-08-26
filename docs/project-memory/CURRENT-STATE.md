# 현재 상태

관찰일: 2026-08-26

## 결론

프로젝트는 Vite reference host에서 실행 가능한 Material Design 3 Theme Lab 단계다. Node 24 toolchain, self-hosted 자산, Theme Runtime, token graph, interaction primitive, 8개 MVP 컴포넌트, Storybook, 단위 테스트, 3-browser E2E와 Linux visual baseline이 연결됐다.

실제 앱 흐름과 MD3/Material Web 시각 재감사까지 완료했지만 개별 컴포넌트의 M3 준수 상태는 `IN_REVIEW`다. 실제 assistive technology와 forced-colors 검증 전에는 `PASS`로 표현하지 않는다.

## 저장소와 환경

- Branch: `main`
- Remote: `https://github.com/clt-joshua/spp-ui-frontend.git`
- 시스템 Node.js: `v25.2.1`
- 프로젝트 실행 Node.js: pnpm이 provision하는 `v24.19.0`
- pnpm: `10.33.0`
- 대표 host: Vite 8 + React 19 + TypeScript

## 준비도

| 영역 | 상태 | 증거 또는 다음 게이트 |
|---|---|---|
| 문서·프로젝트 메모리 | 준비됨 | `docs/README.md`, `PROJECT_MEMORY.md` |
| Node/pnpm/Vite host | 준비됨 | Node 24.19.0, pnpm 10.33.0, Vite production build |
| `src/ui` 공개 경계 | 준비됨 | 앱의 Base UI 직접 import lint 차단 |
| token graph | 구현됨 | reference/system/component CSS variables |
| Theme Runtime | 구현됨 | TonalSpot, preset/custom, mode/contrast, bootstrap/storage |
| interaction primitive | 구현됨 | StateLayer, FocusRing, pointer·keyboard Ripple |
| MVP 8개 컴포넌트 | 구현됨, 준수 검토 중 | manifest `implementationStatus=implemented`, `complianceStatus=IN_REVIEW` |
| 대표 제품 흐름 | 준비됨 | Theme Lab + 프로젝트 생성 Playground |
| unit/Storybook | 준비됨 | Vitest 7 tests, 전체 state Story, Storybook production build |
| E2E | 준비됨 | Chromium/Firefox/WebKit 18 tests PASS |
| 접근성 자동 검사 | 준비됨 | keyboard/focus flow, axe critical/serious 0건 |
| visual baseline | 준비됨 | pinned Chromium/Linux, Light/Dark × 3 viewport 6건 PASS |
| 실제 AT/forced-colors | 미완료 | 수동 검증 범위와 결과 기록 필요 |

## 확인된 실제 흐름

- preset preview → root token 변경 → 적용 → localStorage `ui.theme.v1` → reload 복원
- Select 변경, Dialog Escape/focus return, Menu keyboard open/Escape/focus return
- form submit 후 Snackbar 표시
- body Portal이 document root Theme role을 상속
- 375px viewport에서 horizontal overflow 없음
- Roboto Variable/Material Icons self-host, 외부 asset request 없음
- custom seed swatch, 56px TextField/Select와 MD3 supporting/error 위치·typography, 18px checkbox container/mark 및 label 중심선 일치
- outlined field label은 Material Web식 start/notch/end panel을 사용해 실제 notch gap 4px/4px를 유지하고, leading icon field는 바깥 12px·icon 24px·label 간격 16px를 component token으로 고정함
- IconButton toggle, Dialog 14/20·alert semantics, Menu 16/24·48px, Snackbar 48px 및 F6 이동 검증
- Select/Menu는 Stable Material Web의 `quick=false` 기본을 따라 500ms 높이 전개·50ms surface fade·250ms item stagger 열림과 150ms 닫힘을 유지하며, 일반 Menu의 선택/서브메뉴 icon은 24px token을 사용함
- Select는 Base UI 선택 항목 겹침 정렬을 비활성화하고 Material Web의 field `end-start` → menu `start-start` zero-offset 배치를 사용함. Select option은 일반 Menu의 48px selected/check anatomy를 재사용하지 않고 56px container, 현재 option focus state와 3px inward focus ring을 사용함
- component CSS의 system token 직접 참조 0건, pointer·keyboard ripple 및 component-scoped reduced-motion 분기 검증
- reduced-motion에서도 Material Web ripple의 450ms grow·105ms fade-in·225ms 최소 표시·375ms fade-out이 실제 사용자 탭에서 유지됨
- TextField는 resting/floating 이중 label을 측정해 150ms WAAPI 전환하고, Checkbox는 350ms 선택·150ms 해제 motion을 유지함
- 실제 사용자 탭의 `prefers-reduced-motion: reduce` 환경에서도 Select option opacity가 `0.817/0.483/0.150`에서 `1/1/1`로 진행되고, 닫았다 다시 여는 반복 수명주기에서도 popup이 빈 면으로 남지 않음을 확인함
- Stable Material Web catalog/source 품질 기준으로 8개 MVP를 재검증하고, TextField/Select measured-label과 active/inactive layered outline, Select/Menu explicit open-state lifecycle, Checkbox two-rect mark morph, pointer-origin ripple, Dialog staged motion, Snackbar 공통 press interaction으로 교정함
- clean in-app browser tab에서 Select 첫 열기·닫기·재열기, Menu 닫힘 후 item 제거와 재열림 복원, Checkbox 선택/해제, TextField empty resting→floating, Button ripple, Dialog 단계 open/close, form submit→Snackbar를 실제 Vite 진입점으로 재확인함. 증거는 `docs/audits/2026-08-26-material-web-quality-baseline/`에 보관함
- 후속 사용자 재현으로 Select Portal ref가 Floating UI positioning 전에 측정되어 `0px -> 0px` 높이 animation을 시작하는 불안정성이 확인됨. 1차로 positive geometry 대기를 적용했고, 하단 공간 부족 follow-up에서 이것만으로는 final side/좌표 확정을 보장하지 못한다는 점을 확인함
- 현재 adapter는 Positioner의 실제 `data-side`, non-zero opacity, 두 frame 연속 stable rect를 기다린 후 viewport-clamped `offsetHeight`로 motion을 시작함. full-size Popup은 위치 계산 shell로 유지하고 nested `menu-surface`만 높이/opacity를 전환해 Floating UI가 중간 높이를 근거로 `bottom → top` flip하는 점프를 차단함. 위쪽 surface는 shell bottom에 고정하고 Material Web처럼 content에만 역방향 translate를 적용함. 선택 option focus/`scrollIntoView`는 열림 완료 뒤로 지연하며, 12 frame 내 배치 실패는 즉시 usable surface로 fail-open함. 근거·검증 한계·회귀 사양은 `docs/audits/2026-08-26-material-web-select-constrained-placement/`에 보관함
- 후속 official/current 동시 비교에서 기존 Select가 4px gap, 48px option, selected container/check icon, 현재 option focus ring 누락으로 Material Web과 다름을 확인했다. zero offset, Select 전용 56px option token, no-check selection, 현재 option focus/ring으로 교정하고 `Desktop application` 선택 후 재열림까지 실제 Vite에서 확인했다. 증거는 `docs/audits/2026-08-26-material-web-select-behavior-comparison/`에 보관함

## 최신 검증

- `pnpm validate:structure`: PASS
- `pnpm lint`: PASS
- `pnpm typecheck`: PASS
- `pnpm test:unit`: 2 suites, 7 tests PASS
- `pnpm build`: PASS
- `pnpm build:storybook`: PASS
- 이번 Material Web 품질 교정 후 `pnpm verify`: PASS (structure, lint, typecheck, Vitest 7 tests, Vite build, Storybook build)
- Select option anatomy/position/focus 교정 후 `pnpm verify`: PASS (structure, lint, typecheck, Vitest 7 tests, Vite build, Storybook build)
- Select constrained-placement lifecycle 재구성 후 `pnpm verify`: PASS (structure, lint, typecheck, Vitest 7 tests, Vite build, Storybook build)
- `pnpm test:e2e`: 3 browsers, 18 tests PASS
- `pnpm test:visual:update` 후 `pnpm test:visual`: 6 baseline PASS
- visual baseline 총량: 739,925 bytes

## 다음 유효 작업

1. Snackbar live announcement와 상태 update를 실제 screen reader에서 검증한다.
2. forced-colors와 지원 screen reader/browser 조합을 검증한다.
3. 모든 실제 환경 blocker가 닫힌 component만 manifest를 `PASS`로 승격한다.

세부 구현·검증 증거는 [UI 구현 상태](../03-delivery/09-UI-IMPLEMENTATION-STATUS.md), 미결 게이트는 [OPEN-QUESTIONS.md](OPEN-QUESTIONS.md)를 따른다.
