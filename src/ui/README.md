# `src/ui` ownership boundary

This directory contains the application-internal M3 UI system. Application screens consume only `src/ui/index.ts`; Base UI primitives, Material Color Utilities, token helpers, and compliance internals stay private.

Responsibilities:

- `compliance/`: pinned source baseline and component traceability
- `theme/`: color engine, presets, storage, bootstrap, provider
- `tokens/`: reference, system, component, state, and motion tokens
- `interactions/`: StateLayer, Ripple, FocusRing
- `icons/`: self-hosted Material Icons adapter
- `components/`: ten MVP component vertical slices plus the Tabs, Switch, and Segmented Button extensions
- `providers/`: application-level UI composition
- `styles/`: reset, global styles, CSS layer ordering

Typography uses the 34-role Figma `text-styles` contract through `reference.css` → `system.css` → `component.css`. Component CSS must consume the mapped font, size, line-height, weight, tracking, and decoration together; it must not copy an individual Figma value into a selector.

Spatial foundations use 18 Figma `number/*` reference primitives, 18 `space/*`, 17 `gap/*`, 8 `radius/*` system aliases, and five elevation effect styles. CSS Modules consume only component tokens: space is for padding/margin/inset, gap is for sibling separation, radius is for corners, and elevation remains a composite shadow token. Do not snap independent M3 geometry to the nearest spatial step.

The Vite host, CSS entry, Noto Sans Variable font reference inputs, `MaterialIcon` adapter, Theme Runtime, interaction primitives, ten MVP components, and the Tabs, Switch, and Segmented Button extensions are connected. `/components` is the application-facing verification page for all thirteen public components' variants, sizes, states, and real interactions. Every new public component slice must add its representative state matrix and interaction regression to that page in the same change. Implementation evidence lives in `docs/03-delivery/09-UI-IMPLEMENTATION-STATUS.md`; components remain `BLOCKED` only for component-specific authority conflicts, applicable screen-reader announcement flows, and the currently supported Windows forced-colors output.
