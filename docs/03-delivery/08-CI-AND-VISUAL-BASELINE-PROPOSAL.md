# CI와 시각 검토 운영 기준

상태: `ACCEPTED / AMENDED` — 2026-09-02 Linux visual gate 폐기

## 결론

GitHub Actions의 blocking gate는 `quality`와 Chromium/Firefox/WebKit 실제 Vite E2E다. Chromium/Linux repository screenshot baseline은 제품 지원 환경에 필요하지 않아 완료·병합 기준에서 제거했다.

과거 6개 PNG는 감사 당시의 역사적 증거로 남기지만 현재 시각 권위, 구조 필수 파일, CI gate 또는 갱신 의무가 아니다. 향후 pixel regression을 다시 도입하려면 실제 지원 OS·browser·font, 승인 책임자와 변경 절차를 새 ADR로 먼저 결정한다.

## CI 구조

### 1. `quality` — 모든 PR의 필수 gate

- Ubuntu runner
- Node.js 24.x, pnpm 10.33.x
- `pnpm install --frozen-lockfile`
- `pnpm verify`: structure, lint, typecheck, unit, Vite build, Storybook build
- actionlint로 workflow 구문 검증

### 2. `e2e` — 실제 앱 흐름 gate

- `quality` 성공 후 실행
- Playwright가 Vite preview server를 직접 시작
- Chromium, Firefox, WebKit에서 keyboard/focus/form/Portal/Theme/Chip 동작 검증
- browser별 job을 blocking으로 유지
- 실패 시 HTML report, trace, screenshot, video를 14일 artifact로 보관

CI의 Linux container는 브라우저 실행 인프라일 뿐 제품의 별도 Linux 시각 버전이나 pixel authority를 뜻하지 않는다.

## 지원 환경 시각 검토

- UI 변경은 실제 지원 대상 환경에서 직접 확인한다.
- 375×812, 768×1024, 1440×900 viewport와 Light/Dark/High의 대표 상태를 확인한다.
- geometry, typography, token mapping과 상태 전환은 가능한 범위에서 실제 Vite E2E computed readback으로 고정한다.
- screenshot이 필요하면 변경 증거로 첨부할 수 있지만 repository golden과 pixel blocking gate로 취급하지 않는다.
- reduced motion, screen reader, forced-colors는 pixel diff가 아니라 의미·상태·announcement 결과로 검증한다.

## 접근성 실환경 검증과의 관계

Linux screenshot baseline을 제거해도 접근성 검증은 대체되거나 약화되지 않는다.

- screen reader: Snackbar status, 오류·설명 갱신, mixed/selected/expanded 상태, composite widget과 modal focus 문맥처럼 accessibility tree만으로 실제 announcement를 확정할 수 없는 흐름을 대표 조합에서 확인한다.
- forced-colors: Windows Contrast Themes를 지원하는 동안 user agent가 author color와 shadow를 대체한 뒤에도 control 경계, focus, selected, disabled, error와 icon이 구분되는지 확인한다.
- 단순 native Button처럼 role/name/state를 browser accessibility tree와 keyboard flow로 충분히 판정할 수 있는 항목에는 실제 screen reader 수동 검사를 일괄 요구하지 않는다.

## 확정된 운영 결정

1. `quality`와 Chromium/Firefox/WebKit E2E를 blocking gate로 사용한다.
2. Chromium/Linux screenshot baseline과 visual CI job을 사용하지 않는다.
3. E2E failure artifact는 14일 보관한다.
4. 과거 visual spec과 PNG는 역사적 증거로만 보존하며 validator와 public scripts에서 제외한다.
5. 새 pixel baseline은 새 ADR 없이 다시 필수 기준으로 추가하지 않는다.

## 현재 구현과 증거

- Workflow: `.github/workflows/ci.yml`
- Playwright config: `playwright.config.ts`
- 선택적 3-browser container runner: `scripts/run-playwright-container.mjs`
- E2E: Chromium/Firefox/WebKit 각각 10건, 총 30건 PASS
- Visual job/public scripts/required snapshot validation: 제거됨
- 과거 Light/Dark × 3 viewport PNG: 비권위 역사 자료로 보존

## 공식 근거

- [GitHub setup-node](https://github.com/actions/setup-node)
- [pnpm/action-setup](https://github.com/pnpm/action-setup)
- [Playwright CI](https://playwright.dev/docs/ci)
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages)
- [CSS Color Adjustment: Forced Color Palettes](https://www.w3.org/TR/css-color-adjust-1/#forced)
- [Windows High Contrast Mode](https://learn.microsoft.com/en-us/fluent-ui/web-components/design-system/high-contrast)
