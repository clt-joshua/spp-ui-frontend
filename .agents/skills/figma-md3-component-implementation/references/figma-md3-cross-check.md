# Figma and MD3 cross-check

Use this reference after the supplied root node has been read with `get_design_context`.

## Variant inventory

Build a table with one row per axis and report its exact values. Parse component/symbol names when a component set is large. Verify:

- total symbol count;
- base combinations excluding transient states;
- expected state count for each base combination;
- content types supported by each style/type;
- node IDs selected for detailed inspection.

Choose detailed nodes that collectively cover every value of every axis. Add targeted pairs for enabled/disabled, error false/true, and large/medium/small. Do not assume a token is shared merely because two variants look close.

## Values to read

For each coverage node, capture:

- container height, width behavior, padding, gap, border, radius, clipping;
- label font family, size, line height, weight, tracking, decoration;
- icon asset/glyph, size, position, and inherited color/opacity;
- container, label, icon, outline, and state-layer roles;
- enabled, hover, focus, pressed, disabled elevation;
- disabled color and opacity for container, label, icon, and outline separately;
- component descriptions and usage guidance attached in Figma.

When board prose conflicts with an actual local variable or Effect Style binding, use the executable binding as implementation evidence and document the discrepancy.

## MD3 comparison

Use primary sources only:

- M3 component overview/guidelines under `https://m3.material.io/components/`;
- Material Web component documentation under `https://github.com/material-components/material-web/tree/main/docs/components`;
- Material Web implementation and generated component tokens under the same official repository.

Compare these dimensions separately:

1. anatomy and supported component types;
2. usage priority and when a variant should be chosen;
3. native semantics, form association, keyboard behavior, focus, disabled behavior;
4. interaction state layer, ripple, focus ring, motion, and elevation;
5. typography, shape, color roles, opacity, spacing, icon placement;
6. accessibility name, selected/expanded/invalid state, and touch target.

Figma can intentionally override visual token values. It does not replace native semantics or turn static design states into public runtime props. Keep both the Figma state layer and the Material interaction primitive only when the resulting pressed/focus behavior is intentional and verified; do not accidentally double-apply opacity.

## Known failure modes

- A large root context is sparse: split into child nodes instead of implementing from metadata alone.
- A gallery claims full variant coverage but renders only enabled text examples: include all content/error/disabled combinations and exercise transient states with real input.
- A global token hides a size-specific Figma difference: query disabled nodes for every size and introduce scoped component tokens.
- Disabled error accidentally resolves to error colors: disabled presentation must win when the design defines that precedence.
- A visual `error` axis is mapped to `aria-invalid` on a non-input control: keep visual and validation semantics separate.
- A Figma `State=focused` prop is copied into the public API: use real `:focus-visible`, keyboard focus, and the shared focus ring.
- Right/left icon restrictions in Figma are mistaken for all of MD3: document whether the public API intentionally keeps broader Material compatibility.
- Material Web defaults are claimed while project behavior differs, such as a defensive `type="button"` default: record the deviation instead of hiding it.
- A non-interactive badge is implemented as a button to obtain styling: preserve the intended interaction model.
- Only color snapshots are checked: verify computed tokens under the real theme and actual browser interaction.
