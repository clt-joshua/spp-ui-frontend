# Material Web Select 열림 동작 비교

관찰일: 2026-08-26

## 범위와 기준

- 대상: Theme Lab `대상 플랫폼` outlined Select
- 사용자 목표: option surface가 Stable Material Web Select와 같은 위치, 행 anatomy, 현재 항목 focus, open motion으로 동작하는지 확인
- 비교 환경: in-app browser, 832 × 752 CSS px, Dark theme
- 공식 기준: [Material Web Select](https://material-web.dev/components/select/), [Select source](https://github.com/material-components/material-web/blob/main/select/internal/select.ts), [Menu source](https://github.com/material-components/material-web/blob/main/menu/internal/menu.ts)

## 판정

초기 구현은 `M3_WEB_SPEC_CONFLICT`였다. 일반 Menu item의 선택 표현을 Select option에 재사용하면서 field와 popup 사이 4px gap, 48px option, 고정 selected container, check icon, 현재 option focus ring 누락이 발생했다. Stable Material Web은 field `end-start`와 menu `start-start`를 offset 없이 연결하고, one-line Select option을 56px로 렌더링하며, 열릴 때 현재 option으로 focus를 이동해 state layer와 inward focus ring을 표시한다.

수정 후 실제 Theme Lab 흐름은 popup/field gap 0.42px(서브픽셀 반올림), option 56/56/56px, popup 184px, check icon 0개, 현재 option focus 및 3px inward ring을 확인했다. open motion은 공식 source와 같은 500ms emphasized surface height, 50ms surface opacity, 250ms staggered option opacity를 유지한다.

## 단계별 증거

1. **공식 닫힘 상태 — 정상**  
   [05-official-closed.png](05-official-closed.png)

2. **공식 열림 상태 — 정상**  
   field 바로 아래에서 surface가 시작되고 56px option과 현재 option focus ring이 보인다. 선택 값을 별도 check icon으로 표시하지 않는다.  
   [08-official-open-settled.png](08-official-open-settled.png)

3. **수정 전 Theme Lab — 불일치**  
   4px gap, 48px option, selected container와 check icon이 공식 Select option anatomy와 달랐다.  
   [04-current-open-settled.png](04-current-open-settled.png)

4. **수정 후 Theme Lab 열림 — 정상**  
   field와 popup을 직접 연결하고, 56px option과 현재 option focus ring을 적용했다.  
   [14-current-fixed-open-settled.png](14-current-fixed-open-settled.png)

5. **값 변경 후 재열림 — 정상**  
   `Desktop application` 선택 후 다시 열면 해당 option으로 focus가 이동하며, form selection은 check icon 없이 유지된다.  
   [15-current-fixed-selected-reopen.png](15-current-fixed-selected-reopen.png)

## 검증

- 실제 Vite 진입점: PASS
- official/current DOM geometry와 computed style readback: PASS
- `pnpm.cmd verify`: PASS
- standalone Playwright E2E: 이번 후속 변경에서는 실행하지 않음. 관련 기대값은 56px option, zero offset, no check icon으로 교정함
- 스크린샷만으로 전체 assistive technology 호환성은 판정하지 않음
