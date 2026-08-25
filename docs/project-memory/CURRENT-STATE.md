# 현재 상태

관찰일: 2026-08-25

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
- IconButton toggle, Dialog 14/20·alert semantics, Menu 16/24·48px, Snackbar 48px 및 F6 이동 검증
- component CSS의 system token 직접 참조 0건, pointer·keyboard ripple 및 reduced-motion 분기 검증

## 최신 검증

- `pnpm validate:structure`: PASS
- `pnpm lint`: PASS
- `pnpm typecheck`: PASS
- `pnpm test:unit`: 2 suites, 7 tests PASS
- `pnpm build`: PASS
- `pnpm build:storybook`: PASS
- `pnpm test:e2e`: 3 browsers, 18 tests PASS
- `pnpm test:visual:update` 후 `pnpm test:visual`: 6 baseline PASS
- visual baseline 총량: 739,925 bytes

## 다음 유효 작업

1. Snackbar live announcement와 상태 update를 실제 screen reader에서 검증한다.
2. forced-colors와 지원 screen reader/browser 조합을 검증한다.
3. 모든 실제 환경 blocker가 닫힌 component만 manifest를 `PASS`로 승격한다.

세부 구현·검증 증거는 [UI 구현 상태](../03-delivery/09-UI-IMPLEMENTATION-STATUS.md), 미결 게이트는 [OPEN-QUESTIONS.md](OPEN-QUESTIONS.md)를 따른다.
