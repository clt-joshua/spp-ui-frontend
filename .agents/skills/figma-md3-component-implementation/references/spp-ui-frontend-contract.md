# spp-ui-frontend component contract

Apply this reference when the target repository is `C:\Develop\spp-ui-frontend`.

## Required repository reading

Read in this order:

1. `AGENTS.md`
2. `PROJECT_MEMORY.md`
3. `docs/project-memory/CURRENT-STATE.md`
4. `docs/00-governance/00-M3-WEB-COMPLIANCE.md`
5. `docs/README.md`

Follow the document order linked from `docs/README.md` when a decision depends on broader architecture or delivery policy.

## Slice locations

A component slice normally touches:

- `src/ui/components/<Component>/`
- `src/ui/tokens/component.css`
- `src/ui/index.ts`
- `src/ui/components/Foundation.stories.tsx`
- `src/pages/ComponentGalleryPage.tsx` and its CSS Module
- `src/ui/compliance/m3-component-manifest.ts`
- `docs/02-architecture/05-COMPONENTS-AND-INTERACTIONS.md`
- a focused `docs/audits/<date>-figma-<component>/README.md`
- `PROJECT_MEMORY.md` and `docs/project-memory/CURRENT-STATE.md`
- unit and `tests/e2e/foundation.spec.ts` coverage

Change only the files required for the complete slice and preserve unrelated work.

## Architecture invariants

- Vite is the representative host, but `src/ui/**` cannot use Vite-specific runtime APIs.
- Application code imports public UI only through `src/ui/index.ts`.
- `@base-ui/react` imports stay inside `src/ui/**`.
- Do not install or import `@material/web`, Lit, Labs, or M3 Expressive runtime code.
- Keep reference, system, and component tokens separate.
- Component CSS consumes component properties; add a component token before using a new system spacing, gap, radius, elevation, typography, or color role.
- Noto Sans Variable and Material Icons Filled are self-hosted through project adapters and replaceable tokens.

## Runtime verification

The component must be naturally reachable from `/components` using its public export. Add a compact matrix that exposes all stable API axes. Hover, focus, and pressed states are exercised interactively rather than frozen as public props.

Prefer exact computed-style assertions for Figma-defined values. Verify representative real behavior such as selection, removal, form submission, focus return, keyboard navigation, disabled suppression, or announcements through the intended control flow.

Run:

```powershell
pnpm.cmd verify
pnpm.cmd test:e2e
```

`pnpm.cmd test:e2e` must pass Chromium, Firefox, and WebKit. Existing chunk-size warnings are not failures. Do not auto-update or restore retired Linux image baselines.

## Compliance closeout

An implemented component remains `BLOCKED` when an applicable manual evidence gate is unresolved. Windows Contrast Themes is the actual forced-colors environment. Do not add a blanket screen-reader gate to a simple native control; retain one for live regions, descriptions, composite focus, or other behavior that DOM/axe cannot prove.
