# `src/ui` ownership boundary

This directory will contain the application-internal M3 UI system. Application screens consume only `src/ui/index.ts`; Base UI primitives, Material Color Utilities, token helpers, and compliance internals stay private.

Planned responsibilities:

- `compliance/`: pinned source baseline and component traceability
- `theme/`: color engine, presets, storage, bootstrap, provider
- `tokens/`: reference, system, component, state, and motion tokens
- `interactions/`: StateLayer, Ripple, FocusRing
- `icons/`: self-hosted Material Icons adapter
- `components/`: eight MVP component vertical slices
- `providers/`: application-level UI composition
- `styles/`: reset, global styles, CSS layer ordering

The Vite host, CSS entry, font reference inputs, and `MaterialIcon` adapter are connected. Theme Runtime and the eight MVP component folders remain unimplemented; their directories reserve the accepted architecture without implying completion.
