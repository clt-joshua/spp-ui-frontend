import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';

/** Supplement :focus-visible for composite focus moves (notably Firefox).
 * Capture runs before Base UI moves focus; pointer highlighting is never keyboard focus.
 * Attach to both the trigger and portal popup, without handling/preventing any event.
 */
export function useDropdownKeyboardNavigation(onPointerNavigation?: () => void) {
  const [keyboardNavigation, setKeyboardNavigation] = useState(false);
  const lastPointer = useRef<{ x: number; y: number } | null>(null);
  const pointerNavigation = () => { setKeyboardNavigation(false); onPointerNavigation?.(); };
  return {
    keyboardNavigation,
    modalityProps: {
      onKeyDownCapture: (event: KeyboardEvent<HTMLElement>) => {
        if (!event.altKey && !event.ctrlKey && !event.metaKey &&
          !['Alt', 'Control', 'Meta', 'Shift'].includes(event.key)) {
          setKeyboardNavigation(true);
        }
      },
      onPointerMoveCapture: (event: PointerEvent<HTMLElement>) => {
        const previous = lastPointer.current;
        lastPointer.current = { x: event.clientX, y: event.clientY };
        // Layout/scroll can dispatch zero-delta moves under a stationary mouse.
        // Coordinates also work when WebKit reports movementX/Y as zero.
        if ((previous && (previous.x !== event.clientX || previous.y !== event.clientY)) ||
          event.movementX !== 0 || event.movementY !== 0) pointerNavigation();
      },
      onPointerDownCapture: (event: PointerEvent<HTMLElement>) => {
        lastPointer.current = { x: event.clientX, y: event.clientY };
        pointerNavigation();
      },
    },
  };
}
