# `src/ui` ownership boundary

This directory contains the application-internal M3 UI system. Application screens consume only `src/ui/index.ts`; Base UI primitives, Material Color Utilities, token helpers, and compliance internals stay private.

Responsibilities:

- `compliance/`: pinned source baseline and component traceability
- `theme/`: color engine, presets, storage, bootstrap, provider
- `tokens/`: reference, system, component, state, and motion tokens
- `interactions/`: StateLayer, Ripple, FocusRing
- `icons/`: self-hosted Material Icons adapter
- `components/`: eight MVP component vertical slices
- `providers/`: application-level UI composition
- `styles/`: reset, global styles, CSS layer ordering

The Vite host, CSS entry, font reference inputs, `MaterialIcon` adapter, Theme Runtime, interaction primitives, and eight MVP components are connected. Implementation evidence lives in `docs/03-delivery/09-UI-IMPLEMENTATION-STATUS.md`; the components remain `IN_REVIEW` until their manifest blockers are closed.
