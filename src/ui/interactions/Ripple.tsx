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
const FADE_DURATION_MS = 375;
const INITIAL_ORIGIN_SCALE = 0.2;
const PADDING = 10;
const SOFT_EDGE_MINIMUM_SIZE = 75;
const SOFT_EDGE_CONTAINER_RATIO = 0.35;
const TOUCH_DELAY_MS = 150;

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
  const pendingTouch = useRef<{
    clientX: number;
    clientY: number;
    pointerId: number;
    target: HTMLElement;
    timer: number;
  } | null>(null);

  useEffect(
    () => () => {
      for (const timer of timers.current) {
        window.clearTimeout(timer);
      }
      pendingTouch.current = null;
    },
    [],
  );

  const startWave = useCallback(
    (target: HTMLElement, clientX?: number, clientY?: number) => {
      if (disabled) {
        return;
      }
      const rect = target.getBoundingClientRect();
      const maxDimension = Math.max(rect.height, rect.width);
      const softEdgeSize = Math.max(
        SOFT_EDGE_CONTAINER_RATIO * maxDimension,
        SOFT_EDGE_MINIMUM_SIZE,
      );
      const size = Math.max(1, Math.floor(maxDimension * INITIAL_ORIGIN_SCALE));
      const maxRadius = Math.hypot(rect.width, rect.height) + PADDING;
      const scale = (maxRadius + softEdgeSize) / size;
      const startX = centered || clientX === undefined
        ? (rect.width - size) / 2
        : clientX - rect.left - size / 2;
      const startY = centered || clientY === undefined
        ? (rect.height - size) / 2
        : clientY - rect.top - size / 2;
      const endX = (rect.width - size) / 2;
      const endY = (rect.height - size) / 2;
      const id = ++nextId.current;
      activeWaves.current.set(id, Date.now());
      setWaves((current) => [
        ...current,
        { endX, endY, ending: false, id, scale, size, startX, startY },
      ]);
      setPressed(true);
    },
    [centered, disabled],
  );

  const endWaves = useCallback(() => {
    setPressed(false);
    for (const [id, startedAt] of activeWaves.current) {
      activeWaves.current.delete(id);
      const remainingVisibleTime = Math.max(0, MINIMUM_VISIBLE_MS - (Date.now() - startedAt));
      const endTimer = window.setTimeout(() => {
        setWaves((current) => current.map((wave) => (
          wave.id === id ? { ...wave, ending: true } : wave
        )));
        const removeTimer = window.setTimeout(() => {
          setWaves((current) => current.filter((wave) => wave.id !== id));
        }, FADE_DURATION_MS);
        timers.current.push(removeTimer);
      }, remainingVisibleTime);
      timers.current.push(endTimer);
    }
  }, []);

  const cancelPendingTouch = useCallback(() => {
    const pending = pendingTouch.current;
    if (!pending) return null;
    window.clearTimeout(pending.timer);
    pendingTouch.current = null;
    return pending;
  }, []);

  return {
    pressed,
    ripple: <RippleView waves={waves} />,
    interactionProps: {
      onPointerDown: (event: PointerEvent<HTMLElement>) => {
        if (!event.isPrimary || (event.pointerType !== 'touch' && event.buttons !== 1)) {
          return;
        }
        event.currentTarget.setPointerCapture?.(event.pointerId);
        if (event.pointerType === 'touch') {
          cancelPendingTouch();
          const target = event.currentTarget;
          const clientX = event.clientX;
          const clientY = event.clientY;
          const pointerId = event.pointerId;
          const timer = window.setTimeout(() => {
            if (pendingTouch.current?.pointerId !== pointerId) return;
            pendingTouch.current = null;
            startWave(target, clientX, clientY);
          }, TOUCH_DELAY_MS);
          pendingTouch.current = { clientX, clientY, pointerId, target, timer };
          timers.current.push(timer);
          return;
        }
        startWave(event.currentTarget, event.clientX, event.clientY);
      },
      onPointerUp: () => {
        const pending = cancelPendingTouch();
        if (pending) startWave(pending.target, pending.clientX, pending.clientY);
        endWaves();
      },
      onPointerCancel: () => {
        cancelPendingTouch();
        endWaves();
      },
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
