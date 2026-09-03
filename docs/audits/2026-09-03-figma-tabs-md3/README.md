# Figma Tabs + Stable MD3 교차 검증

관찰일: 2026-09-03

## 결론

Figma `tab & tabs` section `10724:12784`를 프로젝트 공개 `Tabs`/`TabList`/`Tab`/`TabPanel` 세로 슬라이스로 변환했다. Figma의 40px Primary Tab anatomy와 실행 property를 component token으로 보존하고, 선택·roving focus·manual activation·panel 연결·overflow는 Stable Material Web과 Base UI Tabs behavior로 구현했다.

## 권위와 출처

- [Figma Tab & Tabs `10724:12784`](https://www.figma.com/design/aQ2CfBMmc3q2qD2oDQcnjU/2026_Design-System--Renuwal-?node-id=10724-12784&m=dev)
- [M3 Tabs overview](https://m3.material.io/components/tabs/overview)
- [Material Web Tabs current docs](https://github.com/material-components/material-web/blob/main/docs/components/tabs.md)
- [Material Web Tabs pinned docs](https://github.com/material-components/material-web/blob/b4de401eb665ec63474f39319a4ba8f2145974cc/docs/components/tabs.md)
- [Material Web current Tabs behavior](https://github.com/material-components/material-web/blob/main/tabs/internal/tabs.ts)
- [Material Web current Tab behavior](https://github.com/material-components/material-web/blob/main/tabs/internal/tab.ts)
- [Material Web current Primary Tab token surface](https://github.com/material-components/material-web/blob/main/tokens/_md-comp-primary-tab.scss)

## Figma readback

| 영역 | 실행 값 |
|---|---|
| Container | 40px, `surface-container-lowest`, corner none |
| Content | 수평 16px, 수직 10px, label/icon gap 2px |
| Label | Noto Sans `label/large-prominent`, 14/20px, 600, tracking 0.1px |
| Trailing icon | optional `close`, 20px, disabled에서는 숨김 |
| Selection | primary 3px full-width bottom indicator |
| State property | enabled, hovered, selected, selected_hovered, disabled |
| Tabs composition | 같은 Primary Tab 6개 + full-width divider |

가이드 캡션은 세 번째와 네 번째 sample을 `focused`/`pressed`로 부르지만 실행 property는 `selected`/`selected_hovered`다. `Tabs` composition도 첫 항목에 `selected`를 사용하므로 선택 state를 실행 권위로 보고, focus/pressed는 실제 DOM 입력 상태로 분리했다.

## MD3/Material Web 적용

- `TabList`에 접근 가능한 이름과 `role=tablist`를 제공한다.
- `Tab`은 `role=tab`, `aria-selected`, roving `tabIndex`, `aria-controls`를 제공한다. Figma disabled 항목은 방향키로 발견 가능하지만 선택과 ripple은 차단한다.
- `TabPanel`은 같은 value의 Tab과 `aria-labelledby`로 연결된다.
- 기본은 manual activation이다. ArrowLeft/Right/Home/End는 focus만 이동하고 Enter/Space/click이 선택을 바꾼다. `autoActivate`는 opt-in이다.
- `onValueChange`는 project-owned change details와 `cancel()`을 제공해 Stable Material Web의 취소 가능한 user selection 계약을 유지한다.
- 선택 indicator는 이전 Tab에서 새 Tab으로 300ms standard easing 이동하고, tab list는 가로 overflow를 scroll한다.
- StateLayer, pointer·keyboard Ripple, inward FocusRing을 실제 입력으로 렌더링한다.

## 의도적 차이

1. Figma 40px container, 600 label, `surface-container-lowest`, full-width indicator는 Stable Material Web 기본 Primary Tab token anatomy를 프로젝트용으로 교체한다.
2. Figma guide caption과 executable State property의 충돌은 실행 selection과 실제 interaction state를 분리해 해결했다.
3. trailing close glyph는 Figma content property이지만 Stable Material Web에는 trailing close action 계약이 없다. nested button을 만들지 않고 장식 glyph로 제공하며, closable tab 동작은 별도 계약 없이는 추정하지 않는다.

## 검증 계약

- 단위: manual/auto activation, disabled discoverability/non-selection, role/name/state, tab-panel 연결, optional glyph, token override.
- 실제 Vite `/components`: 40px/16px/10px/2px/20px/3px geometry, 14/20/600/0.1 typography, color, manual ArrowRight→Enter, End disabled discoverability→ArrowLeft→Space, hover/focus/pressed/ripple.
- Storybook: controlled selection, trailing icon on/off, disabled, panel 전환.

검증 결과:

- `pnpm.cmd verify`: PASS — structure 11 manifest entries, lint, typecheck, Vitest 7 suites/33 tests, Vite production build, Storybook production build.
- `pnpm.cmd test:e2e`: PASS — Chromium/Firefox/WebKit 45/45 actual Vite tests.

## 남은 실환경 게이트

- 대표 Windows screen reader/browser에서 Tab 위치·선택 변경·연결 panel 문맥 announcement를 확인한다.
- Windows Contrast Themes에서 divider, selected indicator, focus, disabled와 trailing glyph 가시성을 확인한다.
- 위 결과 전에는 Tabs manifest를 `PASS`로 승격하지 않는다.
