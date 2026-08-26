# UI 구현 상태와 검증 증거

관찰일: 2026-08-26

## 결론

Material Design 3 기반 커스텀 UI 개발 환경과 대표 Theme Lab 흐름이 실제 Vite 진입점에 구현되었다. Theme Runtime, 공통 interaction primitive, 8개 MVP 컴포넌트, Storybook, 단위 테스트, 3-browser E2E와 Linux visual baseline을 사용할 수 있다.

컴포넌트 구현과 MD3/Material Web 정합성 수정·시각 재감사는 완료했지만 M3 준수 상태는 아직 `IN_REVIEW`다. 실제 assistive technology와 forced-colors 검증을 마친 뒤에만 `PASS`로 승격한다.

## 구현 범위

| 영역 | 구현 |
|---|---|
| Theme Runtime | TonalSpot, 프리셋 4종, custom `#RRGGBB`, Light/Dark/System, Standard/High, localStorage `ui.theme.v1`, pre-React bootstrap |
| Token graph | reference → system → component, color/typography/shape/elevation/state/motion, component-scoped reduced-motion policy |
| Interaction | StateLayer, FocusRing, pointer·keyboard Ripple |
| Components | Button, IconButton, TextField, Checkbox, Select, Dialog, Menu, Snackbar |
| 대표 화면 | Theme 설정 + 프로젝트 생성 Component Playground |
| 개발 도구 | Vitest + Testing Library, Storybook + a11y addon, Playwright E2E/visual |

## 확인된 실제 흐름

- preset preview → document root token 변경 → 적용 → localStorage 저장 → reload 복원
- Select 값 변경, Dialog open/Escape/focus return, Menu keyboard open/Escape/focus return
- form submit → Snackbar announcement UI
- body Portal인 Select, Dialog, Menu, Snackbar가 document root system token 상속
- 375px 화면에서 horizontal overflow 없음
- self-hosted Roboto Variable과 Material Icons 사용, 외부 asset request 없음
- custom seed swatch, 56px TextField/Select와 MD3 supporting/error 위치·typography, 18px checkbox container/mark 및 label 중심선 일치
- outlined field label을 start/notch/end panel로 구성하고 16px 시작·실제 4px/4px notch, leading icon의 12px 시작·24px 크기·16px label 간격을 component token과 실제 좌표로 검증
- IconButton toggle role, Dialog 14/20·alert semantics, Menu 16/24·48px, Snackbar single-line 48px 일치
- Select/Menu의 Stable Material Web `quick=false` 모션(500ms height, 50ms surface fade, 250ms item stagger, 150ms close)과 menu icon 24px를 실제 Vite 흐름에서 검증
- Select의 Material Web zero-offset bottom-start 배치, 56px option, no-check selection, 현재 option focus/inward ring과 3회 반복 open/close/open 후 option opacity `1/1/1`을 검증해 Base UI 선택 항목 겹침 및 닫힘 animation fill 잔류에 의한 빈 popup 회귀를 차단
- Button/Menu trigger의 label-large와 pointer·keyboard ripple, reduced-motion에서도 Material Web의 450ms grow·105ms fade-in·225ms 최소 표시·375ms fade-out 유지
- TextField resting/floating 이중 label의 측정 기반 150ms WAAPI 전환과 Checkbox 선택 350ms·해제 150ms scale/draw 전환 유지
- 사용자 환경의 `prefers-reduced-motion: reduce`에서도 Select 열림 height와 option opacity 중간 frame이 유지됨
- 8개 CSS Module이 component token만 소비하며 system token 직접 참조 0건
- Stable Material Web catalog/source의 motion sequence를 8개 MVP 품질 기준선으로 캡처하고, shared measured-label/layered outline, explicit Select/Menu lifecycle, two-rect Checkbox mark, pointer-origin Ripple, staged Dialog, shared Snackbar press interaction으로 교정함
- clean in-app browser tab에서 Select/Menu open-close-reopen, TextField empty resting/floating, Checkbox 전환, Button ripple, Dialog 단계 모션, form submit Snackbar를 실제 Vite 진입점으로 재검증함. 캡처와 판정은 `docs/audits/2026-08-26-material-web-quality-baseline/README.md`에 기록함
- 후속 Select 불안정성은 Portal mount와 Floating UI first-positioning 사이의 zero-height 측정 경쟁으로 확인했다. stable rect 대기와 content-only correction 뒤에도 animated popup height가 collision middleware에 다시 입력되어 `bottom → top`으로 flip하는 점프가 남아 있었다. full-size Popup position shell과 nested visual surface로 분리해 배치 크기를 고정하고 surface만 height/opacity 전환하도록 재구성했다. 12 frame fail-open과 전용 side-stability 회귀 사양은 `docs/audits/2026-08-26-material-web-select-constrained-placement/README.md`에 기록함
- official/current 832×752 비교로 기존 4px popup gap·48px option·selected container/check icon·현재 option focus ring 누락을 `M3_WEB_SPEC_CONFLICT`로 확인하고, zero offset·Select 전용 56px token·no-check selection·focus state/ring으로 수정했다. 실제 Vite 선택→닫힘→재열림 증거는 `docs/audits/2026-08-26-material-web-select-behavior-comparison/README.md`에 기록함

## 자동 검증 증거

| 검증 | 결과 |
|---|---|
| 구조·lint·typecheck | PASS |
| Vitest | 2 suites, 7 tests PASS |
| Vite production build | PASS |
| Storybook production build | PASS |
| 이번 Material Web 품질 교정 후 `pnpm verify` | PASS: structure, lint, typecheck, Vitest 7 tests, Vite build, Storybook build |
| Select option anatomy/position/focus 교정 후 `pnpm verify` | PASS: structure, lint, typecheck, Vitest 7 tests, Vite build, Storybook build |
| Select constrained-placement lifecycle 재구성 후 `pnpm verify` | PASS: structure, lint, typecheck, Vitest 7 tests, Vite build, Storybook build |
| Playwright E2E | Chromium/Firefox/WebKit, 18 tests PASS |
| axe-core | representative mobile flow에서 critical/serious 0건 |
| visual | pinned Chromium/Linux, Light/Dark × 3 viewport 6건 재생성 후 비교 PASS |
| baseline 크기 | 739,925 bytes, 25MB 기준 이내 |

## 남은 준수 게이트

1. Snackbar live-region announcement와 loading → success/error 동일 ID 갱신을 실제 screen reader에서 검증한다.
2. forced-colors 실제 브라우저와 지원 screen reader/browser 조합을 기록한다.
3. 위 실제 환경 blocker가 닫힌 component만 `PASS`로 승격한다.

현재 상태의 권위 있는 기계 판독 항목은 `src/ui/compliance/m3-component-manifest.ts`다.
