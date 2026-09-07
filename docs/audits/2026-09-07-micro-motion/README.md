# Material Web 마이크로 모션 교차 검증

후속 변경: 이 감사 이후 사용자가 SegmentedButton 자체 애니메이션을 요청했다. 아래의 공통 효과만 적용했던 범위는 [SegmentedButton 선택 모션 감사](../2026-09-07-segmented-button-motion/README.md)로 확장됐다. Stable 대응 없음과 런타임 금지는 유지된다.

## 결론과 범위

14개 공개 컴포넌트의 개별 모션과 공통 interaction을 공식 구현 소스와 대조했다. Switch 위치 보간, Tabs indicator, Radio dot, FocusRing, Ripple 활성화/취소, Button elevation, field outline, Select arrow/content/filled indicator, Dialog surface 전환을 수정했다. Figma의 크기·색상·타이포그래피와 공개 컴포넌트 API는 유지한다. Material Web/Lit 런타임은 추가하지 않았다.

이 감사는 전체 M3 준수 PASS가 아니다. 기존 대비·Snackbar 사용 정책·실제 AT/Windows Contrast Themes blocker는 남는다. Stable Material Web에 대응 구현이 없는 프로젝트 확장의 전체 모션을 “공식과 동일”로 판정하지 않는다.

## 권위와 재현 가능한 소스

- 공식 repository: [material-components/material-web](https://github.com/material-components/material-web).
- 이번 live source HEAD: `c05b4b23485c803f68ff31cde52506cea5cc555a`.
- 프로젝트 reference snapshot: `b4de401eb665ec63474f39319a4ba8f2145974cc` (v2.5.0). 아래에서 대조한 switch, tab, radio, focus ring, ripple, field, select, dialog animations, button elevation 파일의 두 revision 간 diff는 없다. 전체 프로젝트 baseline을 변경하지 않았다.
- Figma MCP: 파일 `aQ2CfBMmc3q2qD2oDQcnjU`, Switch guide `10724:13609` → 실제 small selected `10467:34635`의 design context를 재조회했다. 32×18 track, 12×12 handle/icon을 유지한다. set `10467:34474`의 recursive motion context는 `nodes: []`였다. 이것은 읽힌 keyframe이 없다는 뜻이며, 파일 전체에 prototype animation이 없다는 증거는 아니다. 정적 variant 사이에 임의의 모션을 추론하지 않는다.
- 다른 컴포넌트의 Figma endpoint는 기존 감사·토큰을 유지했다. 이번 요청은 기존 컴포넌트 모션 교정이며 전 variant 디자인 재추출 감사가 아니다.

## 컴포넌트별 적용

`standard = cubic-bezier(.2,0,0,1)`, `emphasized = cubic-bezier(.3,0,0,1)`.

| 컴포넌트 | 확인/수정한 모션 | 공식 기준 |
|---|---|---|
| Button | elevation 280ms (Sass map의 `emphasized-easing` 키가 없어 생성 CSS는 기본 ease); 공통 Ripple/FocusRing | `button/internal/_elevation.scss` |
| IconButton | 상태별 glyph/color는 즉시 변경 유지; 공통 Ripple/FocusRing 교정. 근거 없는 icon morph를 추가하지 않음 | `iconbutton/internal/` |
| Chip | Assistive/Filter/Input 공통 효과 교정. 선택 glyph는 즉시 변경 유지. 비대화형 Location에는 효과 없음 | `chips/internal/` |
| Checkbox | 기존 350ms enter / 150ms exit / 50ms opacity 및 두 mark morph 유지; disabled CSS animation도 중지 | `checkbox/internal/_checkbox.scss` |
| Radio | selected scale 0→1 300ms emphasized-decelerate + opacity 50ms. 해제는 opacity 50ms만, 역방향 scale 없음 | `radio/internal/_radio.scss` |
| Switch | 숫자 inset 간 300ms `cubic-bezier(.175,.885,.32,1.275)` 이동. handle size 250ms standard/pressed 100ms linear, color 67ms, icon crossfade 33ms. 두 glyph가 있으므로 rotation 없음 | `switch/internal/_handle.scss`, `_icon.scss`, `_track.scss` |
| Tabs | 선택 변경 시 이전 indicator rect → 새 rect FLIP 250ms emphasized. 크기 조절은 즉시 재측정. reduced-motion은 이전/새 indicator 250ms 교차 fade | `tabs/internal/tab.ts` |
| TextField | 기존 150ms standard floating label 및 중단 pose 보존 유지. outline opacity/notch는 150ms emphasized로 교정. content 67ms delay + 83ms emphasized 유지 | `field/internal/field.ts`, `_outlined-field.scss`, `_shared.scss` |
| Select | 위 label/outline + arrow 두 glyph 75ms delay/75ms linear crossfade. value 67ms delay/83ms fade. Filled content 위치는 고정하고 focus underline은 별도 150ms fade | `select/internal/_select.scss`, `field/internal/_filled-field.scss` |
| AutoComplete | 독립 컴포넌트 전체의 Stable 대응 없음. 공유 outlined field/label, suggestion menu와 항목 interaction 수정 상속. 전용 trigger glyph는 기존 정적 project extension 유지 | 프로젝트 합성; Field/Menu만 공식 source 대응 |
| Dialog | translate -50→0px 500ms emphasized, surface 실제 height 35→100% + opacity 50ms. 기존 clip-path로 shadow를 잘라내던 구현 제거. close 150ms/height 35% + delayed fade 유지 | `dialog/internal/animations.ts` |
| Menu | 기존 open 500ms emphasized, surface fade 50ms, item fade 250ms stagger, close 150ms accelerate 유지. 기존 실제 positioning/keyboard/reopen 회귀로 확인 | `menu/internal/menu.ts` |
| SegmentedButton | 공통 interaction 교정. Stable counterpart 없음; Labs selection-width 모션을 Stable 정책으로 승격하지 않음 | 기존 승인된 프로젝트 확장 |
| Snackbar | action의 공통 interaction 교정. 기존 project enter/exit 유지; Stable runtime counterpart가 없어 공식 동등성 판정 제외 | 기존 승인된 프로젝트 확장; 사용 정책 blocker 별도 |

경로는 위 고정 revision의 공식 repository 기준이다. 핵심 소스: [FocusRing](https://github.com/material-components/material-web/blob/c05b4b23485c803f68ff31cde52506cea5cc555a/focus/internal/_focus-ring.scss), [Ripple](https://github.com/material-components/material-web/blob/c05b4b23485c803f68ff31cde52506cea5cc555a/ripple/internal/ripple.ts), [Tabs](https://github.com/material-components/material-web/blob/c05b4b23485c803f68ff31cde52506cea5cc555a/tabs/internal/tab.ts), [Switch](https://github.com/material-components/material-web/blob/c05b4b23485c803f68ff31cde52506cea5cc555a/switch/internal/_handle.scss), [Dialog](https://github.com/material-components/material-web/blob/c05b4b23485c803f68ff31cde52506cea5cc555a/dialog/internal/animations.ts).

## 공통 interaction

- hover opacity/background 15ms linear.
- FocusRing outward outline / inward border: 0→8px 150ms, 8→3px 450ms emphasized. reduced-motion에서는 보이는 3px 정적 ring.
- Ripple: grow 450ms standard, fade-in 105ms linear, 최소 표시 225ms, fade-out 375ms linear. 새 press는 이전 grow를 교체하며 동심 wave를 누적하지 않는다.
- 실제 click 활성화를 keyboard ripple의 기준으로 사용한다. 일반 native button의 Space는 keyup, Tabs는 공식 tab의 keydown click 시점이다. 단순 keydown을 공통 ripple 시작점으로 삼지 않는다.
- mouse/pen pointerleave는 release, touch는 150ms 지연과 pointercancel 경로를 유지한다. forced-colors에서는 ripple 표시/생성을 중지한다.
- source에 없는 일괄 reduced-motion 0ms override를 Radio/Switch/Segmented state layer/Dialog에서 제거했다. 이는 “모든 animation 끄기” 제품 설정을 추가한 것이 아니다.

## 실제 검증

- 진입점: `http://127.0.0.1:5174/` → **컴포넌트 검증** → 기존 component gallery. 다른 프로젝트가 사용하는 5173은 건드리지 않았다.
- [수정 전](runtime/before.json): Switch thumb 상대 x=3→17이 첫 frame에 즉시 변경되고 focus animation은 없었다.
- [수정 후](runtime/after.json): 실제 requestAnimationFrame trajectory가 중간 위치를 지나 x=17에 도달하며 300ms overshoot easing과 FocusRing 150/450ms를 읽었다.
- `tests/e2e/micro-motion.spec.ts`: 실제 진입점에서 8개 회귀를 추가했다. Switch 일반/reduced 이동, Tabs FLIP/reduced fade/resize, FocusRing 일반/reduced, Ripple keyboard/single-wave/leave/forced-colors/CSS zoom, 실제 touch tap과 pointercancel, Radio enter/exit, Select glyph fade, Dialog surface geometry를 확인한다.
- [테마별 실제 readback](runtime/themes.json): Normal Light/Dark × Standard/High에서 Tabs 선택/held/released, Switch click/Space, Select keyboard 선택 → 제출 `destination=busan`, Dialog Escape/trigger focus 복귀, page error 0. [Light 화면](runtime/light-standard-tabs.png), [Dark 화면](runtime/dark-standard-tabs.png), [Light High](runtime/light-high-tabs.png), [Dark High](runtime/dark-high-tabs.png).
- 중간 전체 검증은 111 PASS / 3 FAIL이었다. 세 엔진 모두 Tabs에서 keydown click이 held 상태를 먼저 풀었다. `keyHeld`와 click의 ripple 수명을 분리해 실제 5174에서 교정했고 동일 전체 회귀의 Tabs 검사가 세 엔진 모두 통과했다. 기존 실패를 테스트 완화로 숨기지 않았다.
- 기존 foundation 테스트의 일반 버튼 Space-down ripple 기대를 실제 click 이후로 이동했다. 잘못된 구현을 보존하는 테스트가 제품 권위가 되지 않도록 교정했다. JSDOM의 ResizeObserver stub는 layout 없는 단위 환경에만 추가했으며 실제 indicator geometry는 E2E로 검증한다.
- 품질 gate: `pnpm verify` PASS, 단위 9 suites / 45 tests PASS. 최종 측정 코드 변경 후 lint/typecheck도 PASS.

### 최종 실행 결과

- 대상 production artifact: `dist/assets/index-8s14Dpfh.js`, `dist/assets/index-DbRCPwUn.css`. 전체 실행과 아래 재검증 사이에 제품 코드는 변경하지 않았다.
- `pnpm exec playwright test`: Chromium 39/39, Firefox 39/39, WebKit 38/39, 합계 **116 PASS / 1 FAIL** (6.6분). 남은 실패는 Zoom 1.5에서 테스트가 요청한 기하학적 중앙과 WebKit의 실제 pointer event 좌표 사이 0.6953125px 차이를 비교한 측정 오류였다.
- 테스트는 허용 오차를 넓히지 않고 실제 pointerdown의 clientX를 관찰하도록 수정했다. 오히려 소수 5자리까지 원점 계산을 확인한다. WebKit의 `currentCSSZoom` 미지원은 공식 source와 같은 `?? 1` 경로를 유지하므로 그 엔진의 완전한 CSS zoom 보정까지 보장하지 않는다.
- 동일 artifact에서 `pnpm exec playwright test tests/e2e/micro-motion.spec.ts`: **24/24 PASS** (각 엔진 8개, 1.1분). 위 실패 케이스를 포함한 모션 전체를 재검증했다. 최종 케이스 커버리지는 전체 117개를 전체 실행 + 측정 수정 후 대상 재실행으로 확인한 것이며, “117개 단일 실행 전부 PASS”라고 기록하지 않는다.
- 기존 field-motion/choice-fields/foundation 경로와 실제 5174 테마별 흐름을 보존했다. 모션 외 기존 준수 blocker는 변화 없다.

## 남은 검증 한계

Windows 실제 Contrast Theme/스크린리더 수동 검증은 이번 자동 브라우저 검증으로 대체하지 않는다. SegmentedButton, Snackbar, 독립 AutoComplete의 “전체 공식 동일 애니메이션”은 대응 Stable implementation 부재로 판정할 수 없다. 기존 contrast/Snackbar usage-policy 실패는 모션 수정으로 해결했다고 주장하지 않는다. 이번 변경은 로컬이며 commit/push/배포하지 않았다.
