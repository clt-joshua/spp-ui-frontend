---
name: figma-md3-component-implementation
description: Implement or review a production design-system component from a Figma design node URL, only in the spp-ui-frontend repository. Use when the active workspace is this project and the user expects React, MD3 behavior, project tokens, documentation, and real runtime verification; do not use in other repositories or for writing designs back to Figma.
---

# Figma MD3 Component Implementation

Turn a Figma component node into a complete `spp-ui-frontend` vertical slice. When the user supplies only a node-specific Figma link, infer the component name and axes from the node and implement or update that component without asking them to restate this standing workflow.

## Enforce project scope

Use this skill only when it is loaded from the active repository's `.agents/skills/figma-md3-component-implementation` directory and the repository contains `PROJECT_MEMORY.md`, `docs/project-memory/CURRENT-STATE.md`, and `src/ui/index.ts`. If those project markers are absent, stop applying this skill and use the appropriate general Figma workflow instead. Do not copy, install, or invoke this skill as a user-wide workflow.

## Start from the real authorities

1. Read the repository `AGENTS.md`, `PROJECT_MEMORY.md`, `docs/project-memory/CURRENT-STATE.md`, governance document, and `docs/README.md` before changing code.
2. Load the available `figma-design-to-code` skill before every `get_design_context` call and include its required `skillNames` value.
3. Parse the exact `fileKey` and `nodeId` from the supplied URL. Never guess a missing node ID.
4. Call `get_design_context` on the supplied node first. Treat generated React/Tailwind as evidence, not code to paste.
5. If the root is too large and returns sparse metadata, use metadata only after that first context call to enumerate child variants, then call `get_design_context` on a coverage set of child nodes.

For this project, a link-only invocation means: preserve Stable Material 3 Web semantics, behavior, usage policy, and accessibility while applying visual values explicitly defined by the supplied Figma component as project component-token overrides. Current explicit user instructions and accepted project decisions still outrank this default.

Do not silently resolve conflicts. If Figma contradicts Stable M3 in a dimension not already accepted as a project override, record `M3_WEB_SPEC_CONFLICT`. If Figma itself differs by size, state, or content variant, query the exact nodes and preserve the difference with scoped tokens unless the user decides to normalize it.

## Extract the whole component contract

Inventory every declared axis and count the Cartesian combinations. Typical axes include size, style/type, state, error, selected, level, and content or icon position. Confirm that every base combination has the expected states rather than inferring this from one screenshot.

Detailed node coverage must include:

- every size and style/type;
- enabled, hover, focus, pressed, and disabled behavior when present;
- error/selected true and false;
- text-only and each supported icon/content placement;
- disabled variants for every size, because they may use different tokens;
- any suspicious value that differs between metadata, documentation text, and actual variable/style binding.

Read [Figma and MD3 cross-check](references/figma-md3-cross-check.md) for extraction coverage, authority decisions, and known failure modes.

## Implement one complete vertical slice

Follow [spp-ui-frontend contract](references/spp-ui-frontend-contract.md). In particular:

- keep `src/ui/index.ts` as the only application-facing entry point;
- keep Base UI internal to `src/ui/**` and do not add Material Web/Lit runtime dependencies;
- map values through reference → system → component tokens; CSS Modules consume component tokens rather than raw reference/system spatial values;
- reuse the self-hosted font and icon adapters; reuse a project icon only when its glyph visibly matches the Figma asset;
- expose product API axes such as `variant`, `size`, `error`, or selection, but do not expose hover/focus/pressed as documentation-only state props;
- preserve native semantics, form behavior, keyboard input, disabled behavior, focus ring, pointer/keyboard ripple, and an appropriate touch target;
- do not add `aria-invalid` for a purely visual Button error axis; apply invalid semantics only to actual input contracts;
- do not create a fake interactive touch target, focus, or ripple for a Figma element that is intentionally non-interactive.

Update the component, component tokens, public exports, Storybook coverage, `/components` verification matrix, architecture/usage documentation, compliance manifest, audit evidence, project memory, unit tests, and real Vite E2E as applicable. Preserve unrelated dirty-worktree changes.

## Verify the outcome, not only the implementation

Use the real `/components` route and application entry point. Tests must read representative computed geometry, typography, color, outline, elevation, state layer, icon size, disabled precedence, focus, ripple, and hit target values. Add an explicit regression for every mismatch found during review.

Run the repository quality gate and Chromium/Firefox/WebKit E2E. Do not substitute Storybook, a fixture, or generated reference code for the actual Vite flow. Do not restore the retired Linux screenshot baseline. Keep actual Windows Contrast Themes forced-colors review as a manual blocker when applicable; require manual screen-reader evidence only for semantics that genuinely need announcement or composite-focus verification.

Finish by reporting:

- the Figma axes and component API implemented;
- intentional Figma-versus-MD3 deviations and any unresolved conflict;
- the real route and behaviors verified;
- exact unit/E2E results;
- remaining manual evidence gates.
