# Figma Segmented Button / MD3 교차 검증

검증일: 2026-09-03

## 결론

Figma `segmentedButton` section `10724:13951`의 실행 property, 개별 building block, 5-segment composition과 dev guide를 프로젝트 `SegmentedButtonSet`/`SegmentedButton` 세로 슬라이스로 구현했다. Figma는 시각 권위, M3와 Material Web은 의미론·상태·접근성 권위로 분리했다.

구현은 완료됐지만 실제 screen reader의 group/pressed 상태 announcement와 Windows Contrast Themes의 selected/unselected/disabled 구분을 아직 수동 확인하지 않았으므로 manifest 상태는 `BLOCKED`다.

2026-09-03 다크모드 재검증에서 Figma Light 전용 `custom-container`가 정적 `#BEF7F1`로 남고 MCU Dark의 밝은 `on-secondary-container`만 적용되어 selected 문자가 사라지는 회귀를 확인했다. 생성형 Dark·High·custom scheme에서는 `custom-container/on-custom-container`을 MCU의 `secondary-container/on-secondary-container` 쌍으로 폴백하도록 Theme Runtime을 수정했다. Standard/Light Figma preset은 기존 `#BEF7F1/#00316B` 실행 값을 그대로 유지한다.

## Figma readback

- 파일: `aQ2CfBMmc3q2qD2oDQcnjU`
- section: `10724:13951`
- composition: `10443:74886`, `Segments=5`, `Density=-2`, 516×32px
- start building block: `10443:74489`
- middle building block: `10443:74615`
- end building block: `10443:74741`
- dev guide: `10724:13952`

각 위치는 `enabled/hovered/focused/pressed × label only/label & icon/icon only × selected true/false = 24`와 `disabled × 3 configuration × selected=false = 3`, 총 27개다. 세 위치 합계 81개 실행 variant이며 별도의 5-segment composition 1개가 있다. disabled-selected 조합은 Figma에 없다.

| 항목 | Figma 값 | 프로젝트 token |
|---|---:|---|
| container height | 32px | `--md-segmented-button-container-height` |
| touch target | 48px | `--md-segmented-button-touch-target-height` |
| horizontal padding | 12px | `--md-segmented-button-horizontal-space` |
| content gap | 8px | `--md-segmented-button-content-gap` |
| icon/check | 18px | `--md-segmented-button-icon-size` |
| outer radius | 48px | `--md-segmented-button-container-shape` |
| outline | 1px, `outline-high` | `--md-segmented-button-outline-*` |
| disabled outline | `outline-middle` | `--md-segmented-button-disabled-outline-color` |
| selected container | `system/custom-container` | `--md-segmented-button-selected-container-color` |
| selected content | `schemes/on-secondary-container` | `--md-segmented-button-selected-label-text-color` |
| unselected content | `schemes/on-surface` | `--md-segmented-button-unselected-label-text-color` |
| state layer | black 0/6/12/16% | enabled/hover/focus/pressed component tokens |
| typography | Noto Sans 14/20, 500, 0.1px | complete `label-large` component mapping |

선택된 labeled segment는 configured icon을 check로 대체한다. 선택된 icon-only segment는 Figma처럼 check와 configured icon을 함께 표시한다.

## MD3 / Material Web 교차 검증

M3의 [Segmented buttons](https://m3.material.io/components/segmented-buttons/overview)를 의미론 근거로 사용했다. Stable Material Web 공개 문서에는 아직 해당 컴포넌트 문서가 없으므로 runtime 의존성을 추가하지 않았고, 공식 Labs의 [button source](https://github.com/material-components/material-web/blob/main/labs/segmentedbutton/internal/segmented-button.ts)와 [set source](https://github.com/material-components/material-web/blob/main/labs/segmentedbuttonset/internal/segmented-button-set.ts)를 보조 교차 검증 근거로만 사용했다.

- set은 accessible label을 가진 `role=group`이다.
- segment는 native `button`이며 `aria-pressed`를 노출한다.
- single selection은 선택된 항목을 다시 눌러 해제할 수 없다.
- multiple selection만 각 항목을 독립적으로 선택/해제한다.
- disabled segment는 selection event와 ripple을 만들지 않는다.
- 모든 segment는 32px visual과 별도로 48px 세로 touch target을 유지한다.
- 공통 `StateLayer`, pointer/keyboard `Ripple`, inward `FocusRing`을 사용한다.
- 앱 상태를 정직하게 표시하기 위해 controlled value가 disabled segment를 가리키면 selected-disabled를 유지한다. 이 조합은 Figma에 없으므로 manifest deviation이다.

다크모드 수정과 함께 anatomy, label/check 교체 규칙, icon-only의 check+configured icon, 1px 겹침 outline, single 재클릭 비해제, multiple 독립 toggle, native button/`aria-pressed`, enabled segment의 Tab 진입, disabled event/ripple 억제, 48px touch target을 다시 대조했다. 추가 `M3_WEB_SPEC_CONFLICT`는 발견되지 않았다. Material Web Labs의 checkmark 전환 motion은 Stable Web 계약이나 Figma prototype으로 정의되지 않았으므로 제품 runtime 요구사항으로 승격하지 않았다.

## 공개 API와 실제 흐름

- `SegmentedButtonSet`: `label`, `selectionMode=single|multiple`, controlled/uncontrolled `value/defaultValue`, `onValueChange`
- `SegmentedButton`: `value`, optional label/icon, `selectedIcon`, `hideSelectedIcon`, native button props
- single/multiple value와 interaction details는 TypeScript generic으로 전달한다.
- `/components` Navigation 그룹에서 5-segment single, icon-only, multiple, disabled, selected-disabled를 실제 공개 export로 렌더링한다.
- Storybook `SegmentedButtonsFigmaAndMd3`에서 single/multiple/disabled 조합을 제공한다.

## 자동 검증

- 단위 테스트: single 재클릭 비해제, multiple 독립 toggle, callback details, disabled 무시, selected icon 규칙, token override
- 실제 Vite E2E: 32px container, 12px padding, 8px gap, 18px icon, 48px radius/touch target, label-large, Figma light color, single/multiple/disabled-selected, Tab focus, Space press와 ripple, 실제 Theme UI를 통한 Dark 전환 후 selected foreground/background 4.5:1 이상과 disabled-selected container readback
- representative mobile axe/overflow 검사는 전체 `/components` 회귀에 포함한다.

## 남은 수동 게이트

- Screen reader: group label과 각 button의 pressed/unpressed 변화, single/multiple 맥락이 의도대로 발표되는지 확인한다. DOM/axe는 ARIA 속성의 존재는 확인하지만 실제 AT의 발표 순서와 문구는 증명하지 못한다.
- Windows forced-colors: selected `Highlight/HighlightText`, unselected `Canvas/ButtonText`, disabled `GrayText`, focus `Highlight`가 실제 Contrast Theme에서 서로 구분되는지 확인한다. computed CSS만으로 OS 색상 치환 결과를 증명할 수 없다.
