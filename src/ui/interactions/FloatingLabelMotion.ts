import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';

interface FloatingLabelMotionOptions {
  durationProperty: string;
  easingProperty: string;
  floating: boolean;
  floatingLabelRef: RefObject<HTMLElement | null>;
  restingLabelRef: RefObject<HTMLElement | null>;
  rootRef: RefObject<HTMLElement | null>;
}

function toMilliseconds(value: string, fallback: number) {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return fallback;
  return value.trim().endsWith('ms') ? parsed : parsed * 1_000;
}

export function useFloatingLabelMotion({
  durationProperty,
  easingProperty,
  floating,
  floatingLabelRef,
  restingLabelRef,
  rootRef,
}: FloatingLabelMotionOptions) {
  const activeAnimation = useRef<Animation | null>(null);
  const wasFloating = useRef(floating);

  useLayoutEffect(() => {
    if (wasFloating.current === floating) return;
    wasFloating.current = floating;

    const root = rootRef.current;
    const restingLabel = restingLabelRef.current;
    const floatingLabel = floatingLabelRef.current;
    if (!root || !restingLabel || !floatingLabel) return;

    // Snapshot the rendered pose BEFORE canceling. React has already updated
    // the destination state; restarting at its endpoint makes reversals jump.
    const previous = activeAnimation.current;
    const pose = (element: HTMLElement) => {
      const style = getComputedStyle(element);
      return {
        transform: style.transform,
        width: style.width,
        fontSize: style.fontSize,
        lineHeight: style.lineHeight,
        letterSpacing: style.letterSpacing,
        fontWeight: style.fontWeight,
      };
    };
    const interrupted = previous && previous.playState !== 'finished'
      ? pose(floatingLabel) : null;
    activeAnimation.current = null;
    previous?.cancel();

    const restingRect = restingLabel.getBoundingClientRect();
    const floatingRect = floatingLabel.getBoundingClientRect();
    const restingScrollWidth = restingLabel.scrollWidth;
    const floatingScrollWidth = floatingLabel.scrollWidth;
    if (restingScrollWidth === 0 || floatingScrollWidth === 0) {
      floatingLabel.style.removeProperty('opacity');
      restingLabel.style.removeProperty('opacity');
      return;
    }

    const xDelta = restingRect.left - floatingRect.left;
    const yDelta = restingRect.top - floatingRect.top;
    // Animate the actual endpoint typography, not a width-derived scale.
    // Scaling the smaller font only approximates the resting glyphs and makes
    // the final handoff jump (especially with different Figma tracking/weight).
    const restingPose = {
      ...pose(restingLabel),
      transform: `translateX(${xDelta}px) translateY(${yDelta}px)`,
      width: `${restingRect.width}px`,
      maxWidth: 'none',
    };
    const floatingPose = {
      ...pose(floatingLabel),
      transform: 'translateX(0) translateY(0)',
      width: `${floatingRect.width}px`,
      maxWidth: 'none',
    };
    const computedStyle = getComputedStyle(root);
    const duration = toMilliseconds(
      computedStyle.getPropertyValue(durationProperty),
      150,
    );
    const easing = computedStyle.getPropertyValue(easingProperty).trim()
      || 'cubic-bezier(0.2, 0, 0, 1)';

    floatingLabel.style.opacity = '1';
    restingLabel.style.opacity = '0';
    const animation = floatingLabel.animate(
      floating
        ? [
            interrupted ? { ...interrupted, maxWidth: 'none' } : restingPose,
            floatingPose,
          ]
        : [
            interrupted ? { ...interrupted, maxWidth: 'none' } : floatingPose,
            restingPose,
          ],
      { duration, easing, fill: 'both' },
    );
    activeAnimation.current = animation;

    const finish = () => {
      if (activeAnimation.current !== animation) return;
      activeAnimation.current = null;
      floatingLabel.style.removeProperty('opacity');
      restingLabel.style.removeProperty('opacity');
      // Release the held endpoint only after visibility has been handed off.
      // Otherwise a finishing return animation can flash at the top position.
      animation.cancel();
    };
    animation.addEventListener('finish', finish, { once: true });
    animation.addEventListener('cancel', finish, { once: true });
  }, [
    durationProperty,
    easingProperty,
    floating,
    floatingLabelRef,
    restingLabelRef,
    rootRef,
  ]);

  useEffect(() => () => activeAnimation.current?.cancel(), []);
}
