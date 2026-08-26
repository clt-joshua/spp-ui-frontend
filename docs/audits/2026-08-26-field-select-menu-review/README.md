# Field, Select, Menu 정합성 재검토

> [!WARNING]
> 이 기록의 Field/Select 판정은 후속 실제 사용자 화면에서 반례가 확인되어 [Field/Select 회귀 수정](../2026-08-26-field-select-regression/README.md)으로 대체됐다. Menu icon 판정만 유효하다.

관찰일: 2026-08-26  
대상: 실제 Vite Theme Lab (`http://localhost:5173/`)  
환경: Windows in-app Browser, Dark/Standard, `prefers-reduced-motion: reduce`

## 결론

요청된 세 항목을 Stable Material Web 구현과 최신 component token에 대조해 수정했다. TextField/Select label의 좌우 geometry는 공식값과 일치했고, 기존 hardcoded 값을 component token으로 승격했다. Select/Menu는 `quick=false` 기본 모션을 공유하도록 수정했다. 우측 상단 Menu의 check/chevron은 과대가 아니라 공식 list token과 같은 24px이며 이를 명시적 token과 E2E로 고정했다.

## 검토 단계

1. **Outlined field geometry — 양호.** 실제 렌더링 좌표에서 floating label은 outline 시작점 +16px, leading icon은 +12px, 24px icon 다음 resting label은 +16px였다. notch label 글자 양쪽 4px를 포함해 모두 component token으로 연결했다.
2. **Select open motion — 수정 완료.** 기존 150ms scale/opacity와 reduced-motion 분기가 Stable Material Web 경험을 재현하지 못했다. `quick=false` 기본값에 맞춰 500ms height, 50ms surface opacity, 250ms option opacity stagger를 적용했다. 실제 reduced-motion 사용자 탭의 중간 frame에서 popup height `16/160px`, option opacity `0.817/0.483/0.150`을 확인했다.
3. **Top Menu option icons — 양호.** 선택 check와 submenu chevron은 Stable Material Web list token의 24px가 맞다. 임의 축소하지 않고 `--md-menu-list-item-*-icon-size: 1.5rem`으로 명시하고 실제 24×24px를 검증했다.

## 화면 증거

- 수정 전: [필드 닫힘](01-fields-closed.jpg), [Select 열림](02-select-open.jpg), [상단 Menu 열림](03-top-menu-open.jpg)
- 수정 후: [Select 열림](04-select-open-fixed.jpg), [필드 geometry](05-fields-fixed.jpg), [상단 Menu icon](06-top-menu-fixed.jpg)

## 자동 검증

- E2E가 실제 좌표 16/12/24/16px와 notch padding 4px를 검사한다.
- Select open animation에서 popup 500ms와 모든 option 250ms stagger/delay를 검사한다.
- Menu item icon token 1.5rem과 실제 chevron 24×24px를 검사한다.
- Chromium, Firefox, WebKit 대상 관련 E2E 6건 PASS.

## 검증 한계

스크린샷은 모션의 중간 frame 전체를 표현하지 못하므로 실행 중 WAAPI timing과 브라우저 중간 frame 수치를 함께 사용했다. 실제 screen reader와 forced-colors 수동 검증은 기존 미완료 준수 게이트로 남아 있다.
