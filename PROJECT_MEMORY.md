# Project Memory

This is the compact entry point for future project work. Detailed operational state lives in [CURRENT-STATE.md](docs/project-memory/CURRENT-STATE.md).

## Identity

- Project: `spp-ui-frontend`
- Product: internal React UI system based on stable Material Design 3 for Web
- Current phase: Vite reference host, UI foundation, and CI/visual baseline
- Implementation status: app entry and asset foundation only; Theme Runtime and MVP components not started
- Canonical UI boundary: `src/ui`

## Invariants

- Authority order starts with the current user request, then stable M3 Web and Material Web documentation.
- `@base-ui/react@1.7.0` is the internal behavior layer; application code must not import it directly.
- `@material/material-color-utilities@0.4.0` is isolated behind the future color engine adapter.
- The reference host is Vite 8 + React 19 + TypeScript on Node.js 24 and pnpm 10.33.
- `pnpm-workspace.yaml` makes `pnpm run` provision and use Node.js 24.19.0 even when the host shell uses another Node version.
- `src/ui` must not import Vite runtime APIs, so the same public boundary can move to another React host.
- Google Material Icons Filled and Roboto Variable are self-hosted defaults behind adapters/tokens.
- `@material/web`, `lit`, Labs, and M3 Expressive runtime code are outside MVP scope.
- Styling uses CSS Variables and CSS Modules with reference → system → component token flow.
- Theme scope is TonalSpot, Light/Dark/System, Standard/High, four presets, and custom `#RRGGBB` seed.
- MVP components are Button, IconButton, TextField, Checkbox, Select, Dialog, Menu, and Snackbar.
- Completion requires a representative flow through the actual app entry point, including Portal theme behavior, keyboard/focus behavior, reduced motion, and compliance evidence.
- CI authority is `.github/workflows/ci.yml`: Node 24 quality, three-browser E2E, and digest-pinned Chromium/Linux visual baseline.

## Navigation

- [Document catalog and reading order](docs/README.md)
- [Current state and readiness](docs/project-memory/CURRENT-STATE.md)
- [Accepted decision index](docs/project-memory/DECISION-INDEX.md)
- [Open questions and verification gates](docs/project-memory/OPEN-QUESTIONS.md)
- [M3 Web governance](docs/00-governance/00-M3-WEB-COMPLIANCE.md)
- [Implementation and validation sequence](docs/03-delivery/06-IMPLEMENTATION-AND-VALIDATION.md)
- [CI and visual baseline proposal](docs/03-delivery/08-CI-AND-VISUAL-BASELINE-PROPOSAL.md)

## Next valid action

Continue foundation work with the Theme token graph and Theme Runtime. The Vite reference entry point, Node 24 toolchain, three-browser E2E, and Linux visual baseline are established, but no MVP component may be presented as complete before its real app flow and compliance record pass.

## Update rule

When an accepted decision, phase, blocker, dependency baseline, or verified user flow changes, update this file and the matching detailed memory file in the same change.
