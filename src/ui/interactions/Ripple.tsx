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
  const rootRef = useRef<HTMLSpanElement>(null);
  const pointerActivation = useRef(false);
  const keyHeld = useRef(false);
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
      if (disabled || matchMedia('(forced-colors: active)').matches) {
        return;
      }
      const rippleRoot = target.querySelector<HTMLElement>('[data-slot="ripple"]');
      const rect = rippleRoot?.getBoundingClientRect() ?? target.getBoundingClientRect();
      const zoom = (rippleRoot ?? target).currentCSSZoom ?? 1;
      const maxDimension = Math.max(rect.height, rect.width);
      const softEdgeSize = Math.max(
        SOFT_EDGE_CONTAINER_RATIO * maxDimension,
        SOFT_EDGE_MINIMUM_SIZE,
      );
      const size = Math.max(1, Math.floor(maxDimension * INITIAL_ORIGIN_SCALE / zoom));
      const maxRadius = Math.hypot(rect.width, rect.height) + PADDING;
      const scale = (maxRadius + softEdgeSize) / size / zoom;
      const startX = centered || clientX === undefined
        ? (rect.width / zoom - size) / 2
        : (clientX - rect.left) / zoom - size / 2;
      const startY = centered || clientY === undefined
        ? (rect.height / zoom - size) / 2
        : (clientY - rect.top) / zoom - size / 2;
      const endX = (rect.width / zoom - size) / 2;
      const endY = (rect.height / zoom - size) / 2;
      const id = ++nextId.current;
      // Material Web has one press surface: a new press replaces the previous grow.
      for (const timer of timers.current) window.clearTimeout(timer);
      timers.current = [];
      activeWaves.current.clear();
      activeWaves.current.set(id, Date.now());
      setWaves([
        { endX, endY, ending: false, id, scale, size, startX, startY },
      ]);
      setPressed(true);
    },
    [centered, disabled],
  );

  const endWaves = useCallback(() => {
    // Composite controls may activate on keydown; activation is not key release.
    setPressed(keyHeld.current);
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

  useEffect(() => {
    const target = rootRef.current?.closest<HTMLElement>('[data-interactive-root]');
    if (!target) return;
    const click = () => {
      if (!pointerActivation.current) startWave(target);
      pointerActivation.current = false;
      endWaves();
    };
    const leave = (event: globalThis.PointerEvent) => {
      if (event.pointerType === 'touch') return;
      cancelPendingTouch();
      endWaves();
    };
    target.addEventListener('click', click);
    target.addEventListener('pointerleave', leave);
    return () => {
      target.removeEventListener('click', click);
      target.removeEventListener('pointerleave', leave);
    };
  }, [startWave, endWaves, cancelPendingTouch]);

  return {
    pressed: !disabled && pressed,
    ripple: <RippleView rootRef={rootRef} waves={disabled ? [] : waves} />,
    interactionProps: {
      onPointerDown: (event: PointerEvent<HTMLElement>) => {
        if (disabled || !event.isPrimary || (event.pointerType !== 'touch' && event.buttons !== 1)) {
          return;
        }
        pointerActivation.current = true;
        keyHeld.current = false;
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
        pointerActivation.current = false;
        cancelPendingTouch();
        endWaves();
      },
      onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
        if (!event.repeat && (event.key === 'Enter' || event.key === ' ')) {
          pointerActivation.current = false;
          keyHeld.current = true;
          if (!disabled) setPressed(true);
        }
      },
      onKeyUp: (event: KeyboardEvent<HTMLElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
          keyHeld.current = false;
          endWaves();
        }
      },
      onBlur: () => {
        keyHeld.current = false;
        pointerActivation.current = false;
        cancelPendingTouch();
        endWaves();
      },
    },
  };
}
