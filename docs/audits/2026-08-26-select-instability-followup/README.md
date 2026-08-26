# Select opening instability follow-up

Date: 2026-08-26  
Surface: Vite Theme Lab `대상 플랫폼` Select and the shared Menu motion primitive  
Authority: current user report, Stable Material Web Menu lifecycle, actual Vite browser behavior

## Reproduction

The Select was opened, closed, and reopened from the real Theme Lab flow. Before the correction, the popup and options existed in the DOM but the visible surface remained effectively collapsed during the early opening frames:

- `03-open-020ms.png`: trigger is open, but no visible popup surface.
- `06-open-060ms.png`: only a near-zero-height edge is visible.
- `07-open-120ms.png`: popup is still effectively absent.
- `08-open-250ms.png` and `09-open-520ms.png`: the surface appears later, making the motion feel delayed and discontinuous.

## Root cause

`useMaterialMenuMotion` measured `scrollHeight`/`offsetHeight` in a layout effect as soon as the Base UI Portal ref mounted. That can occur before Floating UI completes its first positioning/layout pass. A zero-height measurement therefore started a 500ms `0px -> 0px` animation. When the animation cleanup restored overflow, the full popup appeared abruptly.

Stable Material Web avoids this ordering problem by starting its imperative animation from the positioned surface-open lifecycle and only then reading `offsetHeight`.

## Correction

- Keep the just-mounted popup visually pending without removing it from layout.
- Defer the geometry read to animation frames until the connected popup has positive width and height.
- Start the official 500ms surface and staggered-item sequence only after usable geometry exists.
- If geometry is still unavailable after four frames, reveal the usable popup without animation instead of leaving a blank 500ms surface.
- Cancel the preparation frame and remove all pending/hidden state on close, unmount, or reversal.
- Skip the close animation when the popup is closed before its opening preparation ever completed.

## Actual browser readback

- `10-fixed-open-060ms.png`: surface and first option are already visible; later options are in their staggered fade.
- `11-fixed-open-120ms.png` through `13-fixed-open-520ms.png`: continuous item progression and stable settled surface.
- `14-fixed-rapid-reopen-060ms.png`: rapid close/reopen has a visible surface and options at the early frame.
- `15-fixed-rapid-reopen-settled.png`: all three options settle normally.
- Five consecutive 25ms close/reopen cycles each retained `expanded=true` and all options; `16-fixed-five-cycle-settled.png` is the final state.
- The shared top Menu remains visible at 60ms and settled normally in `17-shared-menu-060ms.png` and `18-shared-menu-settled.png`.
- After the final cleanup and full build, `19-final-open-060ms.png` and `20-final-rapid-reopen-settled.png` reconfirm the early visible frame and rapid-reversal settled state from a freshly reloaded page.

## Regression coverage

`tests/e2e/foundation.spec.ts` now requires a positive popup height and cleared pending state at the 60ms opening frame, then repeats the assertion after a rapid 25ms close/reopen reversal.

`pnpm.cmd verify` passes structure validation, lint, typecheck, 7 unit tests, the Vite production build, and the Storybook production build. The updated standalone Playwright regression was not executed in this browser-controlled follow-up; the same interaction was exercised directly through the in-app Vite surface instead.
