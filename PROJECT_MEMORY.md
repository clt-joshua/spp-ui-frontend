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
