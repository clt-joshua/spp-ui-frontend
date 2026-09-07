# Component Verification 일괄 감사 — 2026-09-07

## 결론

State 표 우측 빈 영역은 수정했다. 다만 MD3/접근성 감사 결과는 **FAIL / 준수 상태 BLOCKED 유지**다. 기존 회귀 테스트의 통과를 모든 컴포넌트의 MD3 준수로 확장해서 해석하지 않는다.

- 대상: `18c198e105183c3f26bdd39102cdfb01738906cc` + 이번 로컬 변경. 외부 게시본이 아니라 Windows의 Vite `/` → `/components` 실제 흐름을 검증했다.
- 13개 공개 컴포넌트, 8개 검증 그룹. 기존 Figma 근거·승인된 geometry/variant 계약과 구현을 대조했다. 이번 감사에서 Figma MCP를 새로 조회한 것은 아니다.
- 이번 런타임 수정은 State 표 폭뿐이다. 아래 색상 및 Snackbar 정책 문제는 점검 결과로 남기고, 원본 색상/API 정책은 임의 변경하지 않았다.

## 수정 및 회귀 검증

`ComponentGalleryPage.module.css`의 `.buttonMatrix`에 `inline-size: 100%`를 추가했다. IconButton 표는 이전에 표 620px / 외부 viewport 약 743px여서 오른쪽에 약 123px의 빈 영역이 생겼다. 수정 후 약 743px로 채워진다. Button의 78rem, IconButton의 36rem minimum과 내부 가로 스크롤, sticky 행 이름, 실제 버튼 크기는 보존했다. Figma에 없는 trailing-icon 조합의 `—`는 의미가 있는 미지원 표시이므로 없애지 않았다.

`tests/e2e/component-gallery.spec.ts`에서 6개 표를 375/768/1280/1920px로 확인했다. Chromium/Firefox/WebKit 모두 표가 가용 폭 이상을 채우고 문서 전체 overflow 없이 내부 스크롤을 유지한다. 넓어진 것은 셀이며 컴포넌트 자체의 geometry는 변경하지 않았다.

- `pnpm verify`: structure, lint, TypeScript, 단위 테스트 7개 파일/36개, Vite 및 Storybook build PASS. bundle size 경고는 남아 있다.
- 기존 실제 앱 E2E: 3-browser 51개 PASS.
- 새 State 표 회귀: 3-browser 3개 PASS. 합계 54개이며, 별도 실행 결과를 합산한 수다.
- 별도 전체 페이지 감사 `pnpm audit:components`: **FAIL(exit 1)**. 아래 실패를 제외하거나 정상 기대값으로 고정하지 않는다. 이 명령은 기존 회귀 suite와 별도인 진단이며, CI가 이 감사를 통과했다고 주장하지 않는다.

## 발견 사항

### C-01 — Chip status 색상과 High selected Filter 문자 대비 부족

`M3_WEB_SPEC_CONFLICT`, 미해결. Normal preset의 Light/Dark × Standard/High에서 다음 status Chip 색상쌍이 그대로 남는다. 정보 전달용 비대화형 Assistive도 disabled 장식이 아니므로 문자 대비 기준에서 제외되지 않는다.

| 대상 | 문자 / 배경 | 실제 대비 | 최소 기준 |
|---|---|---:|---:|
| Assistive systemWarning, 모든 size | `#FFFDF0` / `#DBB700` | 1.90:1 | 4.5:1 |
| Assistive systemGood, 모든 size | `#EDFFFD` / `#00B09B` | 2.64:1 | 4.5:1 |
| Assistive systemInfo, 모든 size | `#F6F9FF` / `#287FFF` | 3.57:1 | 4.5:1 |
| Filter x-small selected, Light/High | `#0C1213` / `#597176` | 3.64:1 | 4.5:1 |
| Filter x-small selected, Dark/High | `#FFFFFF` / `#7C959A` | 3.17:1 | 4.5:1 |

근거: `src/ui/tokens/component.css`의 status system role 매핑 및 `--md-filter-chip-extra-small-selected-label-text-color: var(--md-sys-color-on-surface)`. Filter는 `secondary-container` 배경에 x-small만 다른 foreground role을 사용한다. High 모드에서도 AA 대비를 충족하지 못하므로 단순히 High 선택을 해결책으로 안내할 수 없다.

영향: 해당 상태 표시 시 항상 재현되며 낮은 대비에 민감한 사용자의 읽기·선택 상태 구분을 방해한다. 필요한 후속 조치: Figma 원본 색상 보존 범위와 접근성 보정 우선순위를 확정하고 status foreground/background 및 High Filter의 semantic pair를 함께 조정한다. 원본을 조용히 덮어쓰지 않는다.

### C-02 — Light/Standard 오류 Button 문자 대비 부족

`M3_WEB_SPEC_CONFLICT`, 미해결. large/medium/small의 filled/outlined/text/elevated error 사례에서 30개 label이 기준 미달이다. Figma에 연결된 system error 원색 `#E72836`은 filled의 `#FFF7F8` 문자와 4.18:1, 흰 배경의 오류 문자로 4.41:1, elevated 배경 `#F7FAFC`에서 4.21:1이다. 일반 크기 문자의 4.5:1 기준에 못 미치며 반올림해서 PASS할 수 없다.

영향: Normal Light/Standard의 해당 오류 variant에서 재현된다. 원본 token graph 적용과 WCAG 적합성은 별개다. 필요한 후속 조치: 오류 상태용 색상쌍 보정 결정을 내리고 Figma alias 및 소비 컴포넌트까지 재검증한다. Disabled 저대비는 이 finding에 포함하지 않는다.

### C-03 — Snackbar 동시 표시 및 actionable timeout 정책 불일치

`M3_WEB_SPEC_CONFLICT`, 미해결. `/components` Feedback에서 Loading → Message → Success를 연속 클릭하면 48px Snackbar 3개가 세로로 쌓인다. `SnackbarProvider`의 `limit = 3`, `manager.toasts.map(...)`, column viewport가 원인이다. 단순히 `limit = 1`로 바꾸는 것만으로 대기 중 알림의 타이머·순서·announcement까지 보장되는 것은 아니므로 adapter 정책을 함께 검토해야 한다.

또한 새 페이지에서 Multi-line을 클릭하고 알림을 hover/focus하지 않은 채 기다리면 `실행 취소` action이 있는 Snackbar도 기본 5000ms timeout으로 닫힌다. 실측은 최초 visible=true, 6초 후 visible=false다. MD3는 연속 알림을 한 번에 하나씩 표시하고 action이 있는 알림은 사용자가 처리하거나 닫을 때까지 유지하도록 정의한다. 자동으로 닫는 Web 알림은 같은 정보를 inline으로도 제공해야 한다. 현재 갤러리 Message/Success/Error는 그런 지속적 피드백을 제공하지 않는다. [MD3 Snackbar guidelines](https://m3.material.io/components/snackbar/guidelines)

영향: 연속 호출 시 알림이 주요 control을 가리고, 읽기·판단이 느린 사용자가 action을 놓칠 수 있다. 필요한 후속 조치: 단일 표시 큐/같은 id 갱신 정책, action 알림의 지속성, 자동 dismiss 메시지의 inline 대안을 구현한다. `loading timeout=0`은 기존 승인된 확장이므로 그 자체를 위반으로 분류하지 않았다.

### C-04 — 검증 페이지 hero의 색상쌍/opacity 문제

미해결. hero 배경은 `primary-container`인데 eyebrow는 공용 `.eyebrow`의 `primary`를 사용한다. Normal Light/Standard 4.01:1, Light/High 2.35:1, Dark/High 2.31:1이다. Light/High에서는 설명의 `opacity: 0.82` 때문에 foreground가 합성되어 4.04:1로 떨어진다.

영향은 갤러리 소개 문구에 한정되지만 해당 테마에서 항상 재현된다. 후속 수정은 hero의 `on-primary-container` 쌍을 보존하고 본문 opacity를 제거하는 방향이다. 이번 요청에서 지정한 State 표 수정과 구분하여 보고한다.

## 자동 색상 감사 결과

Chromium, Normal preset, 1280×900, 실제 Theme Lab 테마 선택 → 적용 → 검증 페이지 이동 후 document root dataset을 확인했다. 아래는 컴포넌트 수가 아니라 같은 상태의 size/content 조합을 포함한 **실패 DOM 요소 수**다. 모두 axe `color-contrast` serious이며 나머지 기본 활성 규칙의 확정 violation은 0이다.

| 모드 | 실패 요소 | 분포 |
|---|---:|---|
| Light / Standard | 43 | hero 1, error Button 30, Assistive 12 |
| Light / High | 12 | hero 2, Assistive 9, x-small Filter 1 |
| Dark / Standard | 9 | Assistive 9 |
| Dark / High | 11 | hero 1, Assistive 9, x-small Filter 1 |

11–14px 문자에는 4.5:1 기준을 적용했다. [WCAG 2.2 Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)

원본 수치·selector·theme dataset은 [report.json](evidence/report.json), 실제 화면은 [State 표](evidence/state-table-dark.png), [Snackbar stack](evidence/snackbar-stack-dark.png)에 있다. screenshot은 이번 현상 증거이며 새로운 픽셀 baseline/CI gate가 아니다.

## 동작 점검 범위와 한계

기존 실제 앱 suite로 Button/IconButton의 form·toggle·disabled·ripple·48px target, Checkbox mixed/error, Radio 단일 선택, small-only Switch, Tabs manual activation/roving focus/panel 연결, Segmented Button single 비해제/multiple toggle, Chip 선택·제거·toolbar focus/Location 비대화형, TextField 오류·notch, Select keyboard/배치, Dialog Escape/focus 복귀, Menu keyboard/submenu, Snackbar geometry를 재검증했다. 이 범위에서 새 회귀는 없었다.

승인된 Figma 크기·색상·명명 확장은 자동으로 MD3 위반으로 취급하지 않았다. 단, 승인된 시각 값이라도 실제 문자 대비 실패는 위와 같이 별도 충돌로 표시했다. 기존 테스트는 키보드·geometry 위주이고 axe는 `/`만 검사했으므로 `/components` 전체 색상 실패와 Snackbar 정책을 놓쳤다. 테스트가 요구사항을 재정의하도록 하지 않는다.

- axe `incomplete`: 모드별 aria-prohibited-attr 19, aria-toggle-field-name 10, color-contrast 89–90개는 수동 판정 필요다. hidden/occluded/transient state 전체가 자동으로 인증된 것이 아니다.
- 색상 감사는 Normal의 4개 모드만 측정했다. 다른 7개 preset/custom seed 전수 조합과 모든 pointer/focus 상태의 대비는 이번 결과에 포함하지 않는다.
- 실제 screen-reader announcement와 Windows Contrast Themes 검증은 미완료다. 앱의 High contrast와 OS forced-colors는 다르다.
- 최신 Figma 전체 변경 여부, production 배포본, 실제 프로젝트 생성의 서버 저장 기능은 이번 점검 범위가 아니다. 배포·push는 하지 않았다.

## 재실행

먼저 `pnpm dev --host 127.0.0.1`을 실행한다. 별도 터미널에서 `pnpm audit:components`를 실행하면 `test-results/component-gallery-audit`에 결과가 생긴다. `GALLERY_AUDIT_URL`과 `GALLERY_AUDIT_OUTPUT`으로 호스트/출력 위치를 지정할 수 있다. 현재 실패를 재현하는 감사이므로 exit 1이 정상적인 **실패 보고**이며 테스트 PASS가 아니다. State 표의 정상 계약은 `pnpm test:e2e`에서 별도로 검증한다.
