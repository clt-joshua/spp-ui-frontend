# Figma Chip 재검증 및 MD3 동작 교정

관찰일: 2026-09-02

## 권위

- Figma Filter: `aQ2CfBMmc3q2qD2oDQcnjU`, node `10560:12598`
- Figma Input: `aQ2CfBMmc3q2qD2oDQcnjU`, node `10560:12744`
- Figma Location: `aQ2CfBMmc3q2qD2oDQcnjU`, node `10563:12834`
- [Material Web Chip 문서](https://github.com/material-components/material-web/blob/main/docs/components/chip.md)
- [Material Web Filter 구현](https://github.com/material-components/material-web/blob/main/chips/internal/filter-chip.ts)
- [Material Web Input 구현](https://github.com/material-components/material-web/blob/main/chips/internal/input-chip.ts)
- [Material Web multi-action 동작](https://github.com/material-components/material-web/blob/main/chips/internal/multi-action-chip.ts)
- [Material Web ChipSet 동작](https://github.com/material-components/material-web/blob/main/chips/internal/chip-set.ts)

## 발견한 계약 오차

1. Filter 비선택 variant의 내부 label wrapper inset 4/2/2px가 누락돼 large/small/x-small 모두 Figma보다 label이 왼쪽에 배치됐다.
2. Input의 공통 `padding-inline` 축약식은 미정의 trailing 변수 때문에 선언 전체가 무효가 되어 Figma start padding 16/10/10px가 실제 렌더링에서는 0px였다.
3. Input은 Material Web의 `remove-only` 계약이 없었고 remove callback 뒤 실제 제거가 보장되지 않았다.
4. Figma Location은 선택 상태가 없는 small 고정 frame인데 button, state layer, ripple과 toolbar focus를 부여해 존재하지 않는 동작을 만들었다.

## 교정

- Filter outer padding과 별도로 비선택 label inset component token을 추가했다.
- Input start/end padding 선언을 분리하고 `removeOnly` 및 취소 가능한 default removal을 구현했다.
- Location은 `span` 기반 비대화형 정보 표시로 변경하고 ChipSet toolbar 밖에 배치했다.
- `/components`에 Filter와 Input의 large/small/x-small × selected/unselected 매트릭스, Location 단일 상태와 disabled 예시를 추가했다.

## 검증 계약

- Filter: `aria-pressed`, click 취소, check/trailing icon, 32/24/20px, outer padding과 label inset
- Input: label/close anatomy, selected 시각 상태, multi-action과 remove-only, 접근 가능한 remove 이름, 취소되지 않은 실제 제거
- ChipSet: toolbar role, 한 개의 roving tab stop, Left/Right/Home/End와 RTL 방향
- Location: 24px/4px/10-6-6 spacing, no button, no ripple, no toolbar focus

컴포넌트 준수 상태는 실제 screen-reader 상태·복합 focus announcement와 Windows Contrast Themes 검증이 남아 있으므로 `BLOCKED`를 유지한다.

## 실행 결과

- `pnpm verify`: PASS — structure, lint, typecheck, Vitest 7 suites/27 tests, Vite build, Storybook build
- `pnpm test:e2e`: PASS — Chromium/Firefox/WebKit 30 tests
- 실제 `/components` readback: Filter 32/24/20px, Input start padding 16/10/10px, Location 71.25×24px와 descendant button 0개
