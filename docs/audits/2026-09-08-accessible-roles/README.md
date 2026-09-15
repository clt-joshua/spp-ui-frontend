# 폐기된 대비 보정 이력

2026-09-08 후속 사용자 결정: 이 보정은 Figma 값/연결을 변경했으므로 폐기하고 원복했다. 아래 내용은 당시 구현과 해석의 이력이지 현재 승인 정책이 아니다. 현재 정책과 검증은 [Figma 토큰 우선](../2026-09-08-figma-token-policy/README.md)을 따른다. 이 문서의 실행 완료 전 결과를 전체 E2E PASS로 사용하지 않는다.

## 결정과 권위

2026-09-08 사용자가 이전 권장안을 승인했다. reference 팔레트·Figma 크기/간격/타이포그래피·상태 축·모션은 보존하고, 의미 있는 문자열의 대비가 부족한 system 역할 쌍과 component alias만 보정한다. Figma 파일은 이번 작업에서 수정하지 않았다. 따라서 아래 보정은 **원본 HEX와 완전히 동일하다는 판정이 아니라 사용자 승인에 따른 코드의 접근성 보정**이다.

프로젝트 전용 구현 스킬에 따라 MCP design context와 실제 변수 정의를 다시 확인했다. 출처는 같은 파일 `aQ2CfBMmc3q2qD2oDQcnjU`의 system `10671:5`, Button `10429:72459`/`10429:73327`, Assistive `10463:4107`, Filter `10560:12598`, TextField large `10443:76122`/small `10443:77310`이다. AutoComplete는 별도 Figma set이 아니라 기존 field/menu 합성 계약을 유지한다.

Material Web는 container/on-container 등 대응 역할로 읽을 수 있는 대비를 제공하도록 정의한다. 의미 있는 작은 문자열과 placeholder는 4.5:1이 기준이다. [Material Web color](https://github.com/material-components/material-web/blob/main/docs/theming/color.md), [WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

## 적용 계약

| 대상 | 원본 Figma | 코드 보정 |
|---|---|---|
| TextField/AutoComplete placeholder | `on-surface-variant-bright` | 읽기용 `on-surface-variant` |
| Prefix/Suffix | `outline-high` | 읽기용 `on-surface-variant` |
| Light preset error | red-400 / red-950 | red-300 / red-950; 빨간 semantic hue와 밝은 전경 유지 |
| Light preset info | blue-400 / blue-950 | blue-200 / blue-950; hover/focus 전경 state layer 합성까지 대비 확보 |
| Light preset good | teal-400 / teal-950 | teal-500 / teal-25; focus state layer까지 대비 확보 |
| Light preset warning | khaki-400 / khaki-950 | 배경 400 유지, 전경만 khaki-25 |
| 확장 status Dark/High | Light 고정 역할 | 같은 teal/khaki/blue reference에서 모드별 명시적 쌍 선택 |
| x-small Filter selected | `secondary-container` + `on-surface` | 기본 Light preset은 원본 보존. 생성 테마에서만 `on-secondary-container` |

원본 `system.css`의 8 × 78 alias와 reference 값은 변경하지 않는다. 뒤이어 로드되는 `system-accessibility.css`에 승인된 역할 보정을 명시해 원본과 제품 보정의 출처를 구분한다. MCU가 생성하는 core/error 역할은 inline 우선권을 유지한다. warning/good/info는 브랜드 seed로 hue를 바꾸지 않고 Figma status palette에서 Light/Dark × Standard/High에 맞는 값을 선택한다. 이는 MCU가 지원하는 core role이라고 가장하지 않는 프로젝트 확장이다.

x-small Filter의 `on-selected-compact` system alias는 기본 `on-surface`, generated scheme에서는 `onSecondaryContainer`다. 생성 테마에서 Figma Light로 돌아올 때 inline alias를 제거한다. public UI/Theme API와 geometry·motion·disabled opacity·semantic state는 변경하지 않는다.

## 검증 범위

- `audit:components`: 실제 Theme Lab → 상단 메뉴 → 13개 화면, Normal 네 테마 52개 화면.
- `audit-text-field.mjs`: 입력/placeholder/affix 실제 색, 두 크기 및 empty/populated/error/readonly 예제. axe complex-background incomplete를 자동 PASS로 덮지 않는다.
- `audit-accessible-roles.mjs`: 8개 preset + custom `#336699`, 네 모드 = 36개 설정을 실제 테마 컨트롤로 적용한 뒤 네 컴포넌트 화면에서 변경된 문자열 쌍을 검사한다. Normal은 실제 hover/keyboard focus/held Space state layer 합성도 측정한다. 임의 DOM 스타일 주입이나 localStorage 우회로 테마를 만들지 않는다.
- E2E: 색상 쌍과 reload, Prefix/Suffix, AutoComplete popup 키보드 선택을 추가하고 기존 전체 회귀를 보존한다.

실제 AT announcement와 Windows Contrast Themes 렌더는 아직 확인하지 못했다. DOM/axe·emulation으로 해당 수동 게이트를 닫지 않는다. transient Ripple 픽셀, 임의 consumer 배경, 모든 non-text 경계의 대비를 이 문자열 감사만으로 인증하지 않는다.

## 결과

검증 진행 중. 최종 실행 결과와 남은 제한을 아래에 기록한다.
