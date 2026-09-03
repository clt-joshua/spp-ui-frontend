# Repository Agent Guide

## Start here

1. Read `PROJECT_MEMORY.md` and `docs/project-memory/CURRENT-STATE.md`.
2. Read `docs/00-governance/00-M3-WEB-COMPLIANCE.md` before implementation.
3. Follow the document order in `docs/README.md`.
4. Treat `src/ui/index.ts` as the only application-facing UI entry point.

## Non-negotiable project boundaries

- Current user requirements outrank every repository artifact.
- Vite is the reference app host on Node.js 24; `src/ui/**` must remain usable without Vite-specific runtime APIs.
- Stable M3 Web is the visual and component authority.
- Base UI is an internal behavior primitive only.
- Do not install or import `@material/web`, `lit`, Material Web Labs, or M3 Expressive runtime code for the MVP.
- Do not import `@base-ui/react` outside `src/ui/**`.
- Keep reference, system, and component tokens separate.
- Preserve the Figma spatial graph as `number reference → space/gap/radius system → component`; component CSS Modules must not consume `--md-ref-number-*` or `--md-sys-space/gap/radius-*` directly.
- Use space tokens for padding, margin, and inset; gap tokens for sibling separation; radius tokens for corners; and elevation tokens as complete two-layer shadows. Do not round independent M3 geometry to a nearby spatial step.
- Material Icons Filled and Noto Sans Variable are self-hosted defaults; access them through the project adapter and font tokens so consumers can replace them.
- Complete one vertical component slice at a time, including its `/components` state matrix, real app interaction flow, regression evidence, and compliance record.
- Linux screenshot baselines are historical evidence only, not a completion, merge, CI, or structure gate. Do not reintroduce a platform-specific pixel authority without an explicit product decision; preserve the existing PNG files unless the user explicitly asks to remove them.
- A Storybook story, mock, fixture, or unit test does not replace verification through the actual app entry point.
- Record unresolved authority conflicts as `M3_WEB_SPEC_CONFLICT`; do not normalize them into tests.

## Memory maintenance

Update project memory in the same change when the phase, accepted decisions, blockers, toolchain baseline, or reachable user flow changes. Do not mark a component or phase complete without authoritative readback and the evidence required by the governance documents.
