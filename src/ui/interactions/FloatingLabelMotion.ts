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

    activeAnimation.current?.cancel();

    const restingRect = restingLabel.getBoundingClientRect();
    const floatingRect = floatingLabel.getBoundingClientRect();
    const restingScrollWidth = restingLabel.scrollWidth;
    const floatingScrollWidth = floatingLabel.scrollWidth;
    if (restingScrollWidth === 0 || floatingScrollWidth === 0) return;

    const scale = restingScrollWidth / floatingScrollWidth;
    const xDelta = restingRect.left - floatingRect.left;
    const yDelta = restingRect.top - floatingRect.top
      + Math.round((restingRect.height - floatingRect.height * scale) / 2);
    const restingTransform = `translateX(${xDelta}px) translateY(${yDelta}px) scale(${scale})`;
    const floatingTransform = 'translateX(0) translateY(0) scale(1)';
    const restingClipped = restingScrollWidth > restingLabel.clientWidth;
    const width = restingClipped ? `${restingLabel.clientWidth / scale}px` : '';
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
            { transform: restingTransform, width },
            { transform: floatingTransform, width },
          ]
        : [
            { transform: floatingTransform, width },
            { transform: restingTransform, width },
          ],
      { duration, easing },
    );
    activeAnimation.current = animation;

    const finish = () => {
      if (activeAnimation.current !== animation) return;
      activeAnimation.current = null;
      floatingLabel.style.removeProperty('opacity');
      restingLabel.style.removeProperty('opacity');
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
