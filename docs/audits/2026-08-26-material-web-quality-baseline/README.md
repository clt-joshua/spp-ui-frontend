# Material Web quality baseline audit

Date: 2026-08-26  
Authority: current user direction, Stable Material Web catalog and source, then repository governance.  
Scope: the eight MVP components exported through `src/ui/index.ts`.

## Method

- Captured the official Material Web catalog in the current browser run for Button, Icon Button, Checkbox, Text Field, Select, Dialog, and Menu.
- Captured the current Vite Theme Lab through its real application entry point.
- Compared visible states, transition sequencing, source motion contracts, and component-token usage.
- Snackbar is assessed against the repository's accepted M3 baseline because Stable Material Web does not publish a Snackbar component page.

## Findings and required remediation

| Component | Official baseline | Current result | Verdict and action |
| --- | --- | --- | --- |
| Button | Five 40px variants, label-large typography, state layer, focus ring, 450ms translating ripple | Static anatomy and tokens align; ripple expands in place and lacks Material Web's pointer-to-center geometry and touch-delay lifecycle | Partial. Upgrade the shared ripple primitive; keep the existing component token mapping. |
| Icon Button | 40px container, 24px icon, standard/filled/tonal/outlined and toggle states | Static anatomy and token mapping align; shares the simplified ripple | Partial. Consume the upgraded ripple and retain toggle semantics. |
| Checkbox | 18px container in a 48px touch target, 350ms emphasized-decelerate enter, 150ms emphasized-accelerate exit, two-rect check/indeterminate morph | Alignment is now close, but the mark is a generic stroked-path reveal rather than the Material Web mark transition | Partial. Replace the mark with the two-rect transition model and preserve Base UI form behavior. |
| Text Field | Two measured labels, 150ms standard transform, active/inactive outline overlays, 4px supporting-text top space | Measured motion exists, but the animation omits the official clipped-label width constraint; outline thickness is changed on one border instead of cross-fading active/inactive outlines | Partial. Share a measured-label motion primitive and use layered outline strokes. |
| Select | Text-field label behavior plus a rotating trailing icon and the Stable Menu opening/closing sequence | Label size/position is CSS-interpolated, the trailing icon remains pointing down when open, and popup opacity is controlled by both CSS and WAAPI | Fail for motion quality. Reuse measured-label and layered-outline primitives, rotate the icon, and give one lifecycle-aware motion owner control of the popup. |
| Menu | 500ms emphasized height growth, 50ms surface fade, 250ms staggered items; 150ms close with final-50ms surface fade and deterministic hidden-item cleanup | Durations resemble the source, but ref-mount/MutationObserver heuristics, `fill` residue, and a competing CSS opacity transition make reversal and cleanup fragile | Fail for motion lifecycle. Rebuild the shared menu motion around explicit open state and exact abort cleanup. |
| Dialog | 500ms slide/grow with staged headline/content/actions; 150ms emphasized-accelerate close | Uses a uniform 250ms fade/scale for the whole surface | Fail for motion fidelity. Implement separate scrim, surface, content, and action phases with official durations/easing. |
| Snackbar | Repository M3 contract: inverse surface, 48/68px height, body-medium message, label-large action, accessible timed lifecycle | Container and typography tokens align; action/close controls use bespoke hover/focus behavior and no shared press feedback | Partial. Route action controls through the shared interaction behavior without changing the accepted Snackbar fallback authority. |

## Captured evidence

- `01-official-select-closed.jpg` through `06-official-select-open-540ms.jpg`: Stable Material Web Select states.
- `07-current-theme-lab-full.png`: current real Vite surface.
- `08-current-select-open.png` and `09-current-select-open-settled.png`: current Select opening and settled states.
- `10-official-buttons.png` through `15-official-menu.png`: Stable Material Web component catalog baselines.

## Remediation result

| Component | Implemented correction | Actual Vite readback |
| --- | --- | --- |
| Button | Shared ripple now uses the Stable Material Web pointer-origin geometry, center destination, 450ms grow, 105ms fade-in, 225ms minimum visible time, 375ms fade-out, and touch delay. | `33-button-ripple-055ms.png` and `34-button-ripple-settled.png` show press feedback and cleanup through the real Button entry point. |
| Icon Button | Inherits the corrected shared ripple without changing the 40px container, 24px icon, toggle state, or component-token boundary. | The real Actions card retains all standard/toggle variants in `16-improved-theme-lab-full.png`. |
| Checkbox | Replaced the generic path reveal with the two-rectangle checked/indeterminate mark, 350ms emphasized-decelerate enter, 150ms emphasized-accelerate exit, and 0.6 to 1 container/icon scale. | `30-checkbox-uncheck-settled.png`, `31-checkbox-check-045ms.png`, and `32-checkbox-check-settled.png` confirm state, alignment, intermediate frame, and cleanup. |
| Text Field | Added shared measured resting/floating labels, clipped-width correction, 150ms standard motion, and layered inactive/active outline panels. | `43-text-field-empty-resting.png`, `44-text-field-focus-060ms.png`, and `45-text-field-focus-settled.png` confirm the empty resting state and focused floating state. |
| Select | Uses the same measured-label/layered-outline primitive, rotates the trailing icon, and delegates popup motion to one lifecycle owner. | `24-clean-select-open-060ms.png`, `25-clean-select-reopen-060ms.png`, and `26-clean-select-reopen-settled.png` confirm first open, close/reopen, non-empty items, correct bottom-start placement, and symmetric label notch. |
| Menu | Replaced ref/observer heuristics with explicit open-state motion, exact 500ms/150ms sequences, item stagger, abort cleanup, and delayed portal-ref restart. | `35-menu-open-060ms.png`, `36-menu-open-settled.png`, and `37-menu-reopen-060ms.png` confirm staged items and deterministic close/reopen. DOM readback confirmed the items are absent after close and present after reopen. |
| Dialog | Split the former uniform transition into scrim, translated/growing surface, staged headline/content/actions, and 150ms close phases. | `46-dialog-open-070ms.png`, `47-dialog-open-250ms.png`, and `48-dialog-open-settled.png` show distinct opening stages; DOM readback confirms the dialog closes after the exit sequence. |
| Snackbar | Action and close controls now consume the shared pressable interaction, state layer, and focus ring while preserving the repository M3 Snackbar contract. | `38-snackbar-visible.png` and the actual form-submit DOM readback confirm the live Snackbar, action, and close controls. |

The remediation keeps `@material/web` reference-only: no Material Web, Lit, Labs, or M3 Expressive runtime dependency was added. All new timing, easing, color, geometry, and typography decisions enter components through component tokens backed by the existing system/reference graph.

`49-final-select-settled.png` is the final post-`pnpm.cmd verify` Select readback from a freshly reloaded Vite page; the combobox is expanded and all three options are present.

## Acceptance gates

1. Select and Menu survive repeated open, close, and reversal with no blank or stuck item opacity.
2. Select and Text Field share the same measured-label motion and layered outline behavior.
3. Button and Icon Button ripples originate at the pointer, travel toward center, remain visible for at least 225ms, and fade cleanly.
4. Checkbox uses the official enter/exit durations and mark morph structure without changing native form semantics.
5. Dialog staging is visibly distinct for scrim, surface, content, and actions.
6. All eight components continue to consume component tokens backed by system/reference tokens.
7. `pnpm.cmd verify` passes, and the actual Theme Lab flow is rechecked in the in-app browser.

## Gate status

- Gates 1-6: PASS in the current implementation and actual Vite browser flow.
- Gate 7 actual-flow portion: PASS in a clean in-app browser tab.
- Gate 7 automated portion: PASS. `pnpm.cmd verify` completed structure validation, lint, typecheck, 7 unit tests, Vite production build, and Storybook production build on 2026-08-26.
- Compliance remains `IN_REVIEW` until the separate actual screen-reader and forced-colors gates are completed; this quality remediation does not reinterpret those gates.

## Official references

- https://material-web.dev/components/button/
- https://material-web.dev/components/icon-button/
- https://material-web.dev/components/checkbox/
- https://material-web.dev/components/text-field/
- https://material-web.dev/components/select/
- https://material-web.dev/components/menu/
- https://material-web.dev/components/dialog/
- https://github.com/material-components/material-web/tree/main
