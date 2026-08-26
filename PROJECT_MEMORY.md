# Project Memory

This is the compact entry point for future project work. Detailed state lives in [CURRENT-STATE.md](docs/project-memory/CURRENT-STATE.md).

## Identity

- Project: `spp-ui-frontend`
- Product: customizable React UI foundation based on stable Material Design 3 for Web
- Current phase: MD3/Material Web component remediation complete; actual AT and forced-colors review remains
- Representative host: Vite 8 + React 19 + TypeScript
- Canonical UI boundary: `src/ui`

## Invariants

- Current user intent and accepted project decisions outrank code, tests, and harnesses.
- Base UI 1.7 is the internal behavior authority; app code only consumes `src/ui` public exports.
- Material Web is reference-only; `@material/web` and Lit are not runtime dependencies.
- Styling follows reference → system → component CSS variables and CSS Modules.
- Theme scope is TonalSpot, four presets/custom `#RRGGBB`, Light/Dark/System, Standard/High.
- Theme roles are applied to `documentElement` so body Portal content inherits the same theme.
- Roboto Variable and Material Icons Filled are self-hosted defaults behind replaceable tokens/adapters.
- MVP components are Button, IconButton, TextField, Checkbox, Select, Dialog, Menu, and Snackbar.
- Theme Lab is the representative product flow for Theme, form, overlay, keyboard/focus, storage, and feedback checks.
- Storybook and unit tests are supporting evidence; actual Vite entry-point E2E is required.
- Implemented does not mean M3 compliant. Only blocker-free records may move from `IN_REVIEW` to `PASS`.
- CI authority remains Node 24 quality, three-browser E2E, and digest-pinned Chromium/Linux visual baseline.

## Current evidence

- Theme Runtime, token graph, interactions, and all eight MVP components are implemented.
- Vitest: 7 tests PASS; Storybook state coverage and production build PASS.
- Playwright: Chromium/Firefox/WebKit 18 tests PASS.
- axe representative flow: critical/serious 0.
- Linux visual: Light/Dark × mobile/tablet/desktop 6 baselines PASS.
- Compliance blockers: actual screen reader announcement and forced-colors matrix.
- Motion regression fix: no global `0ms` override; Material Web의 ripple, field/checkbox state feedback와 `quick=false` Select/Menu 열림·닫힘 모션은 reduced-motion에서도 유지한다.
- Field/menu geometry: outlined label은 Material Web식 start/notch/end panel로 렌더링해 실제 좌우 notch gap 4px/4px를 보장하고, leading icon 12px start·24px size·16px label gap과 Select/Menu icon 24px를 component token으로 유지한다.
- Select authority correction: Base UI의 선택 option 겹침 정렬을 끄고 Material Web의 field `end-start` → menu `start-start` zero-offset 배치를 사용한다. Select option은 일반 Menu item과 분리된 56px anatomy를 사용하고, 고정 selected container/check icon 대신 열림 시 현재 option focus·state layer·3px inward focus ring을 표시한다. 닫힘 animation의 fill state를 다음 열림에서 취소하고 open sequence를 재시작해 반복 open/close/open 뒤에도 option opacity `1`을 유지한다.
- Material Web quality baseline: Stable catalog와 source의 실제 모션 계약을 8개 MVP 컴포넌트 기준선으로 고정했다. TextField/Select는 공통 measured-label과 layered outline, Select/Menu는 explicit open lifecycle, Checkbox는 two-rect mark morph, Button/IconButton은 pointer-origin ripple, Dialog는 staged surface/content/action motion, Snackbar action은 공통 interaction primitive를 사용한다.
- Current remediation evidence: `docs/audits/2026-08-26-material-web-quality-baseline/`의 clean-tab capture와 DOM readback으로 Select/Menu 반복 open-close-reopen, checkbox, field label, ripple, dialog, snackbar 실제 Vite 흐름을 확인했고 `pnpm.cmd verify`가 PASS했다.
- Select constrained-placement lifecycle: Portal mount만으로 열림을 시작하지 않는다. `useMaterialMenuMotion`은 Base UI Positioner의 실제 `data-side`, non-zero opacity, 두 frame 연속 동일한 rect를 기다린 뒤 viewport에 clamp된 `offsetHeight`로 모션을 시작한다. Base UI collision 계산이 animation 중인 `0 → full` 높이를 다시 읽어 `bottom → top`으로 flip하지 않도록 full-size Popup을 position shell로 고정하고 nested `menu-surface`만 height/opacity animation한다. `side=top` surface는 shell bottom에 고정하고 Material Web처럼 내부 content에만 역방향 translate를 적용한다. 선택 option의 focus/`scrollIntoView`는 열림 완료까지 지연하고, 12 frame 내 배치 실패 시 즉시 usable surface로 fail-open한다. 회귀 사양과 근거는 `docs/audits/2026-08-26-material-web-select-constrained-placement/`에 기록한다.
- Select visual contract correction: official/current 832×752 capture에서 기존 4px gap·48px option·selected container/check icon·focus ring 누락을 확인했다. `sideOffset=0`, Select 전용 56px option token, 현재 option focus state/inward ring으로 수정했으며 선택 후 재열림까지 `docs/audits/2026-08-26-material-web-select-behavior-comparison/`에서 확인했다.

## Navigation

- [Current state](docs/project-memory/CURRENT-STATE.md)
- [Open verification gates](docs/project-memory/OPEN-QUESTIONS.md)
- [Accepted decisions](docs/project-memory/DECISION-INDEX.md)
- [UI implementation evidence](docs/03-delivery/09-UI-IMPLEMENTATION-STATUS.md)
- [M3 governance](docs/00-governance/00-M3-WEB-COMPLIANCE.md)
- [Theme contract](docs/02-architecture/04-TOKENS-AND-DYNAMIC-THEME.md)
- [Component contract](docs/02-architecture/05-COMPONENTS-AND-INTERACTIONS.md)

## Next valid action

Complete the remaining compliance gates without weakening the current app flow: verify actual screen reader announcements and forced-colors, then promote only blocker-free manifest entries.

## Update rule

When a decision, phase, blocker, dependency baseline, or verified flow changes, update this file and the matching detailed memory in the same change.
