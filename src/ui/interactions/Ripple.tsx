import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import { RippleView, type RippleWave } from './RippleView';

const MINIMUM_VISIBLE_MS = 225;
const FADE_DURATION_MS = 350;

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export interface PressableInteractionOptions {
  centered?: boolean;
  disabled?: boolean;
}

export function usePressableInteraction({
  centered = false,
  disabled = false,
}: PressableInteractionOptions = {}) {
  const [waves, setWaves] = useState<RippleWave[]>([]);
  const [pressed, setPressed] = useState(false);
  const nextId = useRef(0);
  const timers = useRef<number[]>([]);
  const activeWaves = useRef(new Map<number, number>());

  useEffect(
    () => () => {
      for (const timer of timers.current) {
        window.clearTimeout(timer);
      }
    },
    [],
  );

  const startWave = useCallback(
    (target: HTMLElement, clientX?: number, clientY?: number) => {
      if (disabled) {
        return;
      }
      const rect = target.getBoundingClientRect();
      const x = centered || clientX === undefined ? rect.width / 2 : clientX - rect.left;
      const y = centered || clientY === undefined ? rect.height / 2 : clientY - rect.top;
      const radius = Math.max(
        Math.hypot(x, y),
        Math.hypot(rect.width - x, y),
        Math.hypot(x, rect.height - y),
        Math.hypot(rect.width - x, rect.height - y),
      );
      const id = ++nextId.current;
      activeWaves.current.set(id, Date.now());
      setWaves((current) => [...current, { id, x, y, size: radius * 2, ending: false }]);
      setPressed(true);
    },
    [centered, disabled],
  );

  const endWaves = useCallback(() => {
    setPressed(false);
    for (const [id, startedAt] of activeWaves.current) {
      activeWaves.current.delete(id);
      const reducedMotion = prefersReducedMotion();
      const remainingVisibleTime = reducedMotion
        ? 0
        : Math.max(0, MINIMUM_VISIBLE_MS - (Date.now() - startedAt));
      const endTimer = window.setTimeout(() => {
        setWaves((current) => current.map((wave) => (
          wave.id === id ? { ...wave, ending: true } : wave
        )));
        const removeTimer = window.setTimeout(() => {
          setWaves((current) => current.filter((wave) => wave.id !== id));
        }, reducedMotion ? 0 : FADE_DURATION_MS);
        timers.current.push(removeTimer);
      }, remainingVisibleTime);
      timers.current.push(endTimer);
    }
  }, []);

  return {
    pressed,
    ripple: <RippleView waves={waves} />,
    interactionProps: {
      onPointerDown: (event: PointerEvent<HTMLElement>) => {
        event.currentTarget.setPointerCapture?.(event.pointerId);
        startWave(event.currentTarget, event.clientX, event.clientY);
      },
      onPointerUp: endWaves,
      onPointerCancel: endWaves,
      onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
        if (!event.repeat && (event.key === 'Enter' || event.key === ' ')) {
          startWave(event.currentTarget);
        }
      },
      onKeyUp: (event: KeyboardEvent<HTMLElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
          endWaves();
        }
      },
      onBlur: endWaves,
    },
  };
}
