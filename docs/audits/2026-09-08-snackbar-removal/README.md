# Snackbar 제거 및 잔여 BLOCKED 수정안

## 적용 완료 범위

사용자 요청에 따라 Snackbar 공개 API/타입·Provider·구현·전용 토큰·갤러리·Storybook 예제와 전용 감사/회귀 항목을 제거했다. 다른 컴포넌트의 API·색상·동작은 변경하지 않았다. 현재 공개 inventory는 13개이며 구형 `#snackbar`/`#feedback`은 `#button`으로 정규화한다.

테마 저장은 기존 Theme API/localStorage 경로를 유지한다. Theme Lab의 테마 적용·폼 제출, Menu 선택 결과는 페이지 내 `role=status` 문구로 표시한다. 새 Toast나 타이머/전역 알림 매니저는 만들지 않았다. 프로젝트 예제의 제출을 실제 영구 저장으로 오인하지 않도록 결과는 “제출했습니다”로 표시한다.

삭제한 추적 파일은 Git 이력으로 복원할 수 있다. 과거 감사 문서/PNG는 삭제하지 않았다. 직전 작업에서 새로 생성한 SnackbarGallery/useExampleSnackbar도 제거했으며 이전 검증 화면 감사가 그 동작을 기록한다. Snackbar는 준수 PASS로 승격한 것이 아니라 현재 범위에서 제외한 것이다. 재도입 시 정책과 API를 별도로 정의한다.

## 현재 실제 문제와 권장안 — 아직 미적용

권장 결정: **Figma reference 팔레트와 크기/모션을 보존하되, 읽기 어려운 색상 조합은 system 역할 쌍 및 component 연결을 접근성 기준에 맞게 보정한다.** Figma 사용 변수/문서도 같은 결정으로 갱신한다. 전체 palette 값을 바꾸거나 이미 승인된 동작을 원복하지 않는다.

| 우선순위·대상 | 현재 근거 | 제안 변경 |
|---|---|---|
| P1 TextField·AutoComplete | 현재 TextField 실측 Light placeholder 1.77/1.61:1, affix 최저 3.09:1; AutoComplete는 같은 field 토큰을 상속 | `--md-text-field-figma-placeholder-color`, `--md-text-field-figma-affix-color`를 텍스트용 `on-surface-variant`에 연결하는 안을 우선 검증한다. 일반/readonly 배경에서 부족하면 `on-surface` 또는 별도 접근성 text role을 사용한다. 선용 `outline-high`와 흐린 `on-surface-variant-bright`를 읽어야 하는 문자열에 사용하지 않는다. |
| P1 Button 오류 상태 | Normal Light/Standard 30개 요소 미달. 대표 `#FFF7F8` / `#E72836` = 4.18:1 | `error/on-error`, `error-container/on-error-container`의 전경·배경을 함께 교정한다. 빨간 배경은 조금 어둡게 하거나 전경을 바꾸는 후보를 실제 조합으로 비교한다. Text/Outlined/Elevated의 빨간 글자는 surface와 별도 검사한다. 흰색으로만 교체하면 된다고 가정하지 않는다. 같은 역할을 쓰는 IconButton·Chip·field 오류도 회귀 검사한다. |
| P1 Chip Assistive 상태색 | Light Standard 12, Light High 10, Dark Standard 9, Dark High 10개 요소 미달. 대표 warning `#FFFDF0` / `#DBB700` = 1.90:1 | warning/good/info의 `color/on-color`와 container 쌍을 교정한다. 밝은 노랑/초록 배경을 유지하려면 진한 전경 후보를 사용한다. `color-engine.ts` 생성 목록에는 이 확장 역할이 없으므로 Dark/High에서도 기존 고정 status 색상이 남는 구조를 해결한다. 확장 역할도 테마별 대비를 만족하도록 생성/선택해야 한다. |
| P1 Chip x-small Filter selected | `secondary-container` 위에 x-small만 `on-surface`를 사용 | `--md-filter-chip-extra-small-selected-label-text-color`를 기본 selected와 같은 `on-secondary-container` 쌍으로 연결한다. 크기·padding·선택 동작은 유지하고 High 두 모드까지 검증한다. |
| P2 실환경 증거 | 모든 13개 컴포넌트 forced-colors 대기; 그중 10개는 실제 state/focus/description announcement도 대기 | 지원 조합을 고정해 실제 NVDA/브라우저에서 mixed·selected·expanded·오류/설명·가상 포커스·modal 복귀를 확인한다. Windows Contrast Themes에서 경계·선택·오류·disabled·아이콘을 확인하고 재현된 실패만 수정한다. 코드가 이미 올바른 항목은 검증 결과로 닫는다. |

일반 크기의 의미 있는 텍스트는 4.5:1 이상이어야 하며 placeholder도 대상이다. High를 켜야만 통과하게 만들지 않는다. 비활성 컨트롤의 텍스트에는 같은 최소 대비를 일괄 강제하지 않는다. 7:1을 High 텍스트의 추가 목표로 삼는 것은 선택 가능한 제품 결정이지 현재 AA 의무가 아니다. [WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

필수 경계/상태/아이콘 식별은 해당 조건에서 인접색 대비 3:1을 검사한다. forced-colors에서는 CanvasText/ButtonText/Highlight/HighlightText/GrayText 같은 시스템 색, 실제 border/outline, currentColor 아이콘을 활용하는 안을 검토하되 `forced-color-adjust:none`으로 OS 선택을 일괄 무시하지 않는다. [WCAG 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), [CSS Color Adjustment](https://www.w3.org/TR/css-color-adjust-1/#forced-colors-properties).

DOM/axe 통과와 실제 보조기술 호환성은 별개다. 실제 스크린리더 검증은 모든 native 버튼에 일괄 요구하지 않고 프로젝트 manifest의 10개 적용 대상 및 페이지 내 동적 결과에 집중한다. [WAI-ARIA APG 안내](https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/).

색상 역할의 전경/배경 쌍을 맞춘다는 방향은 Material Web의 system color token 사용 방식을 따른다. 제안 역할이나 HEX 후보가 모든 테마에서 통과한다고 아직 판정하지 않는다. [Material Web color theming](https://github.com/material-components/material-web/blob/main/docs/theming/color.md).

## 수정할 필요가 없는 승인된 범위

- Figma compact size, Button error 표시 축, Location의 비대화형 표시, small-only Switch는 승인된 제품 차이다.
- SegmentedButton Labs 기반 모션과 AutoComplete 합성 구조는 명시된 확장이다. 현재 manifest의 BLOCKED를 이유로 제거하거나 Stable와 동일하다고 재분류하지 않는다.
- 메뉴의 정적 중성 focus ring·Figma wash 및 기존 Ripple 조정도 승인된 차이로 유지한다.
- Linux pixel baseline을 다시 도입하거나 수동 증거 없이 manifest 전체를 PASS로 바꾸지 않는다.

## 적용 순서와 완료 조건

1. 접근성 색상 보정 우선권을 승인한다. 범위는 system 역할 쌍과 해당 component alias이며 Figma 원본 reference 값은 보존한다.
2. TextField/AutoComplete → Button/Assistive Chip 공유 status 역할 → x-small Filter alias 순으로 수정한다. Figma variable 연결과 문서를 함께 맞춘다.
3. 8개 preset의 Light/Dark × Standard/High 및 대표 custom seed에서 실제 최종 배경/상태 레이어가 합성된 색을 측정한다. 필드의 빈/입력값/readonly/error/focus 상태와 포털 배경도 포함한다. 자동 판정 incomplete는 별도 실측으로 닫는다.
4. 역할 공유 소비자의 regression과 13개 화면 감사를 실행한다. 실제 스크린리더와 Windows Contrast Themes 증거가 충족된 항목만 각각 PASS로 승격한다.

## 이번 제거 작업의 검증

- 품질 게이트 PASS: 구조·lint·typecheck·단위 10 suites/48개·Vite·Storybook build.
- artifact: `index-BH7C0ddz.js` / `index-DN0bfIdE.css`.
- 13개 × 네 테마 = 52개 화면 감사는 위 Button/Chip 대비 문제 때문에 FAIL. Snackbar 검사를 억지로 PASS 처리하지 않고 대상에서 제거했다. 로컬 `artifacts/snackbar-removal-audit/report.json`에 결과가 있다.
- TextField 재감사도 FAIL: Light Standard placeholder/affix 1.77/3.40, Light High 1.61/3.09, Dark Standard 8.24/4.30, Dark High 7.46/3.90. axe 위반 0건이어도 테마별 color-contrast incomplete 136개로 준수 PASS가 아니다. 로컬 `artifacts/snackbar-removal-field-audit/report.json`에 결과가 있다.
- 실제 localhost:5174에서 Dark 테마 적용 → reload 후 dark 유지, 제출 결과 status, 상단 메뉴 → 13개 inventory → Menu 선택 결과, #snackbar 직접 접속 → #button 정규화 및 page error 0을 확인했다. `artifacts/snackbar-removal-local.png`는 메뉴 선택 중 로컬 시각 증거다.
- 전체 3-browser E2E: 185 PASS / 1 FAIL, 11.5분. Snackbar 제거 후 결과 표시·초기화와 13개 메뉴/구형 주소 회귀는 세 브라우저 모두 PASS다. 실패는 아래 Firefox 측정 오차 1건이다.
- 측정 교정 후 같은 `index-BH7C0ddz.js` artifact에서 `foundation.spec.ts --grep 'M3 필드'`를 Chromium/Firefox/WebKit으로 재실행하여 **3/3 PASS**, 24.1초. 단일 전체 186 PASS로 합산하지 않는다. 로컬 보고서는 `artifacts/snackbar-removal-recheck-report`다.
- 마지막 lint/typecheck/구조 검사/diff 공백 검사 PASS. 기존 미커밋 변경을 보존했다. HEAD `0a462d8`, 커밋·푸시·배포 없음.
- Firefox 기존 Select geometry 검사에서 DOMRect `56.00001525878906`과 정수 `56`의 엄격 비교가 실패했다. CSS height는 정확히 `56px`로 검사하고 DOMRect만 소수 셋째 자리 정밀도로 비교하도록 교정했다. 제품 geometry/token은 변경하지 않았다.
