# UI 구현 상태와 검증 증거

관찰일: 2026-08-25

## 결론

Material Design 3 기반 커스텀 UI 개발 환경과 대표 Theme Lab 흐름이 실제 Vite 진입점에 구현되었다. Theme Runtime, 공통 interaction primitive, 8개 MVP 컴포넌트, Storybook, 단위 테스트, 3-browser E2E와 Linux visual baseline을 사용할 수 있다.

컴포넌트 구현과 MD3/Material Web 정합성 수정·시각 재감사는 완료했지만 M3 준수 상태는 아직 `IN_REVIEW`다. 실제 assistive technology와 forced-colors 검증을 마친 뒤에만 `PASS`로 승격한다.

## 구현 범위

| 영역 | 구현 |
|---|---|
| Theme Runtime | TonalSpot, 프리셋 4종, custom `#RRGGBB`, Light/Dark/System, Standard/High, localStorage `ui.theme.v1`, pre-React bootstrap |
| Token graph | reference → system → component, color/typography/shape/elevation/state/motion, reduced-motion override |
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
- IconButton toggle role, Dialog 14/20·alert semantics, Menu 16/24·48px, Snackbar single-line 48px 일치
- Button/Menu trigger의 label-large와 pointer·keyboard ripple, reduced-motion 즉시 전환 유지
- 8개 CSS Module이 component token만 소비하며 system token 직접 참조 0건

## 자동 검증 증거

| 검증 | 결과 |
|---|---|
| 구조·lint·typecheck | PASS |
| Vitest | 2 suites, 7 tests PASS |
| Vite production build | PASS |
| Storybook production build | PASS |
| Playwright E2E | Chromium/Firefox/WebKit, 18 tests PASS |
| axe-core | representative mobile flow에서 critical/serious 0건 |
| visual | pinned Chromium/Linux, Light/Dark × 3 viewport 6건 재생성 후 비교 PASS |
| baseline 크기 | 739,925 bytes, 25MB 기준 이내 |

## 남은 준수 게이트

1. Snackbar live-region announcement와 loading → success/error 동일 ID 갱신을 실제 screen reader에서 검증한다.
2. forced-colors 실제 브라우저와 지원 screen reader/browser 조합을 기록한다.
3. 위 실제 환경 blocker가 닫힌 component만 `PASS`로 승격한다.

현재 상태의 권위 있는 기계 판독 항목은 `src/ui/compliance/m3-component-manifest.ts`다.
