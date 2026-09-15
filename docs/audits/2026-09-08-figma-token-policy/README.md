# Figma 토큰 우선 복원

## 확정 계약

Figma-defined 색상/토큰 값과 binding을 그대로 사용한다. 대비 때문에 다른 palette step이나 새 alias로 교체하지 않는다. Figma 색상의 대비는 별도 사용·완료·배포 제한이 아니다. 원자료를 숨기거나 WCAG 충족으로 판정하는 것은 아니다. 실제 AT/Windows Contrast Themes는 별개 게이트다.

신규 비-Figma 토큰이 불가피하면 `src/ui/tokens/extensions.css`에 출처, 기존 토큰이 불충분한 이유, 소비자, 테마 동작, 폐기/이관 조건을 함께 기록한다. 기존 component alias 계층과 승인된 MCU/모션 계약은 유지한다.

## 복원 범위

- TextField/AutoComplete placeholder → `on-surface-variant-bright`, affix → `outline-high`.
- error/info/good/warning → 기존 Figma system snapshot. reference와 8 × 78 source alias 값은 보존했다.
- x-small Filter selected → `on-surface`. 불필요한 `on-selected-compact`와 runtime 연결 제거.
- `system-accessibility.css` 및 보정을 요구하던 신규 감사 스크립트/대비 테스트 제거. 기존 Figma 정확값 회귀를 복원하고 source binding 회귀 추가.
- 기존 M3 이름 호환 alias outline/outline-variant/shadow만 `extensions.css`로 값 변경 없이 이동. 신규 색상은 없다. 기존 모든 non-Figma geometry/motion 토큰을 일괄 재분류한 작업은 아니다.
- 전체 갤러리/field 감사는 raw 측정 결과와 프로젝트 판정을 분리한다. 현재 검토된 Button/Chip/TextField/AutoComplete의 `color-contrast`만 비차단 정보로 분류하며, 다른 rule과 미등록 컴포넌트는 자동 면제하지 않는다.
- 13개 manifest는 실제 AT/Windows Contrast Themes 때문에 BLOCKED를 유지한다. Figma 대비를 이유로 하는 blocker는 없다.

## 출처

직전 MCP 재확인: Figma file `aQ2CfBMmc3q2qD2oDQcnjU`, system `10671:5`, TextField `10443:76122`/`10443:77310`, Filter `10560:12598`, Assistive `10463:4107`, Button `10429:73327`.

## 검증

- 품질 게이트 PASS: 구조·lint·typecheck·단위 11 suites/50 tests·Vite·Storybook build.
- 실제 localhost:5174 Theme Lab → Normal/Light 적용 → 상단 컴포넌트 검증 → TextField focus에서 placeholder `rgb(173, 186, 197)`, prefix `rgb(118, 133, 146)`, 신규 compact role 없음, page errors 0 확인. `artifacts/figma-token-policy-local.png`는 실제 화면 증거다.
- 전체 갤러리 52화면과 TextField 4테마 감사는 프로젝트 정책 기준 PASS다. raw 대비 감사는 FAIL과 incomplete를 그대로 보존했다. 이는 Figma 원본을 수치 개선 없이 복원한 결과이며 WCAG PASS가 아니다. 산출물은 `artifacts/figma-token-policy-gallery/report.json`, `artifacts/figma-token-policy-field/report.json`이다.
- 검증 bundle `index-BuPg4bZV.js` / `index-IToEgzax.css`; E2E preview 4173의 HTML과 dist HTML 동일성 확인.
- 전체 Chromium/Firefox/WebKit 각 63개, **189/189 PASS**, 재시도 없는 단일 실행 12.5분. 원본 토큰 회귀, 13개 탐색/정리, 테마/reload, 상태·키보드·모션·모바일 검사를 포함한다. 보고서는 `playwright-report`다.
- 시작 시 이전 대비 감사 export명을 남긴 테스트 한 줄 때문에 typecheck 실패를 확인하고 현재 정책 상수로 교정한 뒤 품질 게이트를 재실행해 PASS했다. 제품 토큰을 테스트에 맞춰 변경하지 않았다.
- 이전 대비 보정 파일/전용 신규 테스트·스크립트는 제거했으며 원본 연결과 기존 검증으로 복원했다. 삭제한 미커밋 보정은 Git 이력이 아니라 이전 작업 패치/감사 이력에 남아 있다.
- 커밋·푸시·배포 없음. 기존 누적 변경과 역사적 감사/이미지 보존.
