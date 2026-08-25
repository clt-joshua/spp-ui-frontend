# CI와 Visual Baseline 운영 기준

상태: `ACCEPTED / IMPLEMENTED` — 2026-08-25 기본안 승인

## 결론

GitHub Actions와 Playwright의 repository-owned screenshot baseline을 채택한다. 초기에는 SaaS 비용과 vendor lock-in 없이 실제 Vite 앱 흐름을 검증하고, baseline 규모나 디자인 리뷰 참여자가 늘어날 때 Chromatic 또는 Argos를 선택적으로 추가한다.

## 권장 CI 구조

### 1. `quality` — 모든 PR의 필수 gate

- Ubuntu runner
- Node.js 24.x, pnpm 10.33.x
- `pnpm install --frozen-lockfile`
- `pnpm validate:structure`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- 향후 unit/component test가 생기면 같은 job 또는 별도 `test` job에서 실행

GitHub의 `setup-node`는 Node version을 명시하고 lockfile을 commit하는 구성을 권장한다. pnpm 10은 `pnpm/action-setup`을 사용하고, store만 cache하며 `node_modules`는 cache하지 않는다.

### 2. `e2e` — 실제 앱 흐름 gate

- `quality` 성공 후 실행
- Playwright가 Vite preview server를 직접 시작
- Chromium, Firefox, WebKit에서 keyboard/focus/form/Portal 동작 검증
- CI worker는 안정성을 위해 1개로 시작하고 suite가 커질 때 shard 사용
- 실패 시 HTML report, trace, screenshot을 14일 artifact로 보관

브라우저별 동작 검증은 blocking으로 두되, browser rendering 차이 때문에 모든 browser의 pixel baseline을 처음부터 blocking으로 만들지는 않는다.

### 3. `visual` — Chromium/Linux의 재현 가능한 pixel gate

- `mcr.microsoft.com/playwright:v1.62.1-noble@sha256:dcc5531e97840b9b5e794f2814476b21571c5124a3fca2267d73041f56e7580e`로 Playwright와 OS image를 digest까지 고정
- Chromium 한 종류만 blocking screenshot baseline으로 사용
- self-hosted Roboto/Material Icons를 사용하고 외부 font 요청 금지
- animation 종료, font load, Theme 적용 readback 뒤 `toHaveScreenshot()` 실행
- 실패 시 expected/actual/diff와 HTML report 업로드

Playwright는 host OS, browser, font, 설정 차이가 screenshot에 영향을 준다고 명시하므로 baseline 생성과 CI 비교는 반드시 같은 container에서 수행한다.

## Baseline 보관 정책

권장안:

- baseline은 test 옆의 snapshot directory에 저장하고 Git에서 리뷰한다.
- 우선 일반 Git으로 시작하고 repository baseline 총량이 25MB를 넘을 때 Git LFS 또는 외부 visual service를 재평가한다.
- baseline 갱신은 `pnpm test:visual:update` 같은 명시적 명령에서만 허용한다.
- baseline 변경 PR은 실제 UI 변경과 원인을 설명하고 expected/actual/diff를 검토한다.
- 전체 suite의 전역 허용 오차를 높이지 않는다. 불가피한 차이는 해당 case에서만 근거와 함께 제한한다.
- 시간, caret, scrollbar, 비결정 데이터는 fixture로 바꾸기보다 screenshot 영역에서 안정화하거나 mask하되 실제 interaction 검증은 별도로 유지한다.

초기 baseline 범위:

- 문서에 확정된 375×812, 768×1024, 1440×900 viewport
- Material Purple/Light/Standard 등 확정된 6개 대표 Theme pair
- 모든 조합을 무작정 곱하지 않고 component별 핵심 state와 앱 대표 흐름의 중요한 frame만 선정
- reduced motion과 forced colors는 별도 의미 검증을 수행하며 일반 pixel baseline과 혼합하지 않음

## 대안 비교

| 선택지 | 장점 | 단점 | 판단 |
|---|---|---|---|
| Playwright + Git baseline | 무료, 실제 앱 흐름, vendor-neutral, 재현 환경 직접 통제 | 디자이너 리뷰 UI가 단순하고 baseline이 커질 수 있음 | 초기 권장 |
| Chromatic/Argos 병행 | 승인 UI, 댓글, 히스토리, Storybook 친화적 | 외부 서비스·비용·권한·vendor 의존 | 팀 확대 후 선택 |
| 실패 artifact만 보관 | 저장소가 작고 설정이 단순 | 이전 baseline 권위가 없고 승인 추적이 약함 | 비권장 |

## 확정된 운영 결정

1. `GitHub Actions + Playwright Chromium/Linux Git baseline`을 채택한다.
2. baseline 총량이 25MB를 넘으면 Git LFS 또는 SaaS visual review를 재검토한다.
3. CI failure artifact는 14일 보관한다.
4. workflow는 `quality` 성공 후 browser별 `e2e`와 `visual`을 병렬 blocking gate로 실행한다.
5. workflow와 Playwright container는 version tag뿐 아니라 image digest까지 고정한다.

## 현재 구현과 증거

- Workflow: `.github/workflows/ci.yml`
- Playwright config: `playwright.config.ts`
- Local pinned-container runner: `scripts/run-playwright-container.mjs`
- E2E: Chromium/Firefox/WebKit 각각 2건, 총 6건 PASS
- Visual: 375×812, 768×1024, 1440×900의 Light/Dark 총 6 baseline 생성 및 즉시 재비교 PASS
- Baseline 총량: 413,324 bytes
- Workflow validation: actionlint 1.7.12 PASS

Theme Runtime이 아직 없으므로 현재 golden은 OS Light/Dark foundation 화면만 다룬다. Theme Runtime과 preset이 실제 구현되면 기존 baseline을 조용히 대체하지 않고, 문서에 확정된 6개 대표 Theme pair를 별도 승인 변경으로 추가한다.

## 공식 근거

- [Vite Getting Started](https://vite.dev/guide/)
- [GitHub setup-node](https://github.com/actions/setup-node)
- [pnpm/action-setup](https://github.com/pnpm/action-setup)
- [Playwright CI](https://playwright.dev/docs/ci)
- [Playwright Visual Comparisons](https://playwright.dev/docs/test-snapshots)
