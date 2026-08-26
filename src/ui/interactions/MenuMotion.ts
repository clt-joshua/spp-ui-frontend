import { useCallback, useLayoutEffect, useRef, useState } from 'react';

type MenuSide = 'bottom' | 'left' | 'right' | 'top';

interface PlacementSnapshot {
  height: number;
  side: MenuSide;
  width: number;
  x: number;
  y: number;
}

interface DeferredItemInteraction {
  element: HTMLElement;
  focus: HTMLElement['focus'];
  focusOptions: FocusOptions | undefined;
  focusPending: boolean;
  scrollIntoView: HTMLElement['scrollIntoView'];
  scrollOptions: boolean | ScrollIntoViewOptions | undefined;
  scrollPending: boolean;
}

const MAX_POSITIONING_FRAMES = 12;
const POSITION_EPSILON = 0.5;

function toMilliseconds(value: string, fallback: number) {
  const normalized = value.trim();
  const parsed = Number.parseFloat(normalized);
  if (!Number.isFinite(parsed)) return fallback;
  return normalized.endsWith('ms') ? parsed : parsed * 1_000;
}

function readDuration(style: CSSStyleDeclaration, name: string, fallback: number) {
  return toMilliseconds(style.getPropertyValue(name), fallback);
}

function getItems(popup: HTMLElement) {
  return Array.from(
    popup.querySelectorAll<HTMLElement>(
      '[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"], [role="option"]',
    ),
  );
}

function isMenuSide(value: string | null): value is MenuSide {
  return value === 'bottom' || value === 'left' || value === 'right' || value === 'top';
}

function readPlacement(
  popup: HTMLElement,
  positioner: HTMLElement,
): PlacementSnapshot | null {
  if (!popup.isConnected || !positioner.isConnected) return null;

  const sideValue = positioner.getAttribute('data-side') ?? popup.getAttribute('data-side');
  if (!isMenuSide(sideValue)) return null;

  // Base UI deliberately renders an unpositioned floating surface at 0,0 with
  // opacity: 0. Material Web likewise paints its surface transparently, waits
  // for layout/positioning, and only then starts the menu animation.
  if (getComputedStyle(positioner).opacity === '0') return null;

  const rect = positioner.getBoundingClientRect();
  const height = popup.offsetHeight;
  const width = popup.offsetWidth;
  if (height <= 0 || width <= 0 || rect.width <= 0 || rect.height <= 0) return null;

  return {
    height,
    side: sideValue,
    width,
    x: rect.x,
    y: rect.y,
  };
}

function placementIsStable(
  previous: PlacementSnapshot | null,
  current: PlacementSnapshot,
) {
  if (!previous || previous.side !== current.side) return false;
  return Math.abs(previous.x - current.x) <= POSITION_EPSILON
    && Math.abs(previous.y - current.y) <= POSITION_EPSILON
    && Math.abs(previous.width - current.width) <= POSITION_EPSILON
    && Math.abs(previous.height - current.height) <= POSITION_EPSILON;
}

/**
 * Material Web menu motion adapted to Base UI's floating-position lifecycle.
 *
 * Material Web positions (and, when needed, flips/resizes) its surface before
 * calling `animateOpen()`. Base UI exposes that settled result on Positioner,
 * so both refs are required: Popup supplies the rendered surface height while
 * Positioner supplies the final side and coordinates.
 */
export function useMaterialMenuMotion<
  TPopup extends HTMLElement,
  TPositioner extends HTMLElement = HTMLDivElement,
>(open: boolean) {
  const popupRef = useRef<TPopup | null>(null);
  const positionerRef = useRef<TPositioner | null>(null);
  const [surfaceVersion, setSurfaceVersion] = useState(0);
  const animationsRef = useRef<Animation[]>([]);
  const preparationFrameRef = useRef<number | null>(null);
  const originalOverflowRef = useRef('');
  const originalHeightRef = useRef('');
  const motionSurfaceRef = useRef<HTMLElement | null>(null);
  const motionSurfaceOverflowRef = useRef('');
  const settledSideRef = useRef<MenuSide>('bottom');
  const deferredItemsRef = useRef(new Map<HTMLElement, DeferredItemInteraction>());

  const discardDeferredItemInteractions = useCallback(() => {
    for (const interaction of deferredItemsRef.current.values()) {
      interaction.focusPending = false;
      interaction.scrollPending = false;
    }
  }, []);

  const flushDeferredItemInteractions = useCallback(() => {
    for (const interaction of deferredItemsRef.current.values()) {
      if (!interaction.element.isConnected) {
        interaction.focusPending = false;
        interaction.scrollPending = false;
        continue;
      }
      if (interaction.focusPending) {
        interaction.focusPending = false;
        interaction.focus.call(interaction.element, interaction.focusOptions);
      }
      if (interaction.scrollPending) {
        interaction.scrollPending = false;
        interaction.scrollIntoView.call(interaction.element, interaction.scrollOptions);
      }
    }
  }, []);

  const restoreDeferredItems = useCallback(() => {
    for (const interaction of deferredItemsRef.current.values()) {
      interaction.element.focus = interaction.focus;
      interaction.element.scrollIntoView = interaction.scrollIntoView;
    }
    deferredItemsRef.current.clear();
  }, []);

  const cancelAnimations = useCallback((preservePending = false) => {
    if (preparationFrameRef.current !== null) {
      cancelAnimationFrame(preparationFrameRef.current);
      preparationFrameRef.current = null;
    }
    for (const animation of animationsRef.current) animation.cancel();
    animationsRef.current = [];

    const popup = popupRef.current;
    if (!popup) return;
    if (!preservePending) popup.removeAttribute('data-menu-motion-pending');
    popup.removeAttribute('data-menu-motion-phase');
    popup.style.overflow = originalOverflowRef.current;
    popup.style.height = originalHeightRef.current;
    if (motionSurfaceRef.current) {
      motionSurfaceRef.current.style.overflow = motionSurfaceOverflowRef.current;
      motionSurfaceRef.current = null;
    }
    for (const item of getItems(popup)) item.removeAttribute('data-menu-motion-hidden');
    discardDeferredItemInteractions();
  }, [discardDeferredItemInteractions]);

  const setPopup = useCallback((popup: TPopup | null) => {
    if (popupRef.current === popup) return;
    cancelAnimations();
    if (!popup) restoreDeferredItems();
    popupRef.current = popup;
    originalOverflowRef.current = popup?.style.overflow ?? '';
    originalHeightRef.current = popup?.style.height ?? '';
    setSurfaceVersion((version) => version + 1);
  }, [cancelAnimations, restoreDeferredItems]);

  const setPositioner = useCallback((positioner: TPositioner | null) => {
    if (positionerRef.current === positioner) return;
    positionerRef.current = positioner;
    setSurfaceVersion((version) => version + 1);
  }, []);

  const setItem = useCallback((element: HTMLElement | null) => {
    if (!element || deferredItemsRef.current.has(element)) return;

    const interaction: DeferredItemInteraction = {
      element,
      focus: element.focus,
      focusOptions: undefined,
      focusPending: false,
      scrollIntoView: element.scrollIntoView,
      scrollOptions: undefined,
      scrollPending: false,
    };
    deferredItemsRef.current.set(element, interaction);

    const shouldDefer = () => {
      const popup = popupRef.current;
      const phase = popup?.getAttribute('data-menu-motion-phase');
      return !popup
        || popup.hasAttribute('data-menu-motion-pending')
        || phase === 'positioning'
        || phase === 'opening';
    };

    element.focus = (options?: FocusOptions) => {
      if (shouldDefer()) {
        interaction.focusOptions = options;
        interaction.focusPending = true;
        return;
      }
      interaction.focus.call(element, options);
    };
    element.scrollIntoView = (options?: boolean | ScrollIntoViewOptions) => {
      if (shouldDefer()) {
        interaction.scrollOptions = options;
        interaction.scrollPending = true;
        return;
      }
      interaction.scrollIntoView.call(element, options);
    };
  }, []);

  useLayoutEffect(() => {
    const popup = popupRef.current;
    const positioner = positionerRef.current;
    if (!popup || !positioner) return;

    const wasPending = popup.hasAttribute('data-menu-motion-pending');
    cancelAnimations();

    const startMotion = (opening: boolean, height: number, side: MenuSide) => {
      if (popupRef.current !== popup || positionerRef.current !== positioner) return;

      settledSideRef.current = side;
      popup.setAttribute('data-menu-motion-side', side);
      popup.setAttribute('data-menu-motion-phase', opening ? 'opening' : 'closing');

      const style = getComputedStyle(popup);
      const surface = popup.querySelector<HTMLElement>('[data-slot="menu-surface"]')
        ?? popup;
      const content = popup.querySelector<HTMLElement>('[data-slot="menu-content"]');
      const items = getItems(popup);
      const opensUpwards = side === 'top';
      const openDuration = readDuration(style, '--md-menu-open-duration', 500);
      const openSurfaceOpacityDuration = readDuration(
        style,
        '--md-menu-open-surface-opacity-duration',
        50,
      );
      const openItemOpacityDuration = readDuration(
        style,
        '--md-menu-open-item-opacity-duration',
        250,
      );
      const closeDuration = readDuration(style, '--md-menu-close-duration', 150);
      const closeSurfaceOpacityDuration = readDuration(
        style,
        '--md-menu-close-surface-opacity-duration',
        50,
      );
      const closeSurfaceOpacityDelay = readDuration(
        style,
        '--md-menu-close-surface-opacity-delay',
        100,
      );
      const closeItemOpacityDuration = readDuration(
        style,
        '--md-menu-close-item-opacity-duration',
        50,
      );
      const closeItemOpacityDelay = readDuration(
        style,
        '--md-menu-close-item-opacity-delay',
        50,
      );
      const openEasing = style.getPropertyValue('--md-menu-open-easing').trim()
        || 'cubic-bezier(0.2, 0, 0, 1)';
      const closeEasing = style.getPropertyValue('--md-menu-close-easing').trim()
        || 'cubic-bezier(0.3, 0, 0.8, 0.15)';
      const closeHeightRatio = Number.parseFloat(
        style.getPropertyValue('--md-menu-close-height-ratio'),
      ) || 0.35;
      const animations: Animation[] = [];
      animationsRef.current = animations;
      motionSurfaceRef.current = surface;
      motionSurfaceOverflowRef.current = surface.style.overflow;
      popup.style.height = `${height}px`;
      surface.style.overflow = 'hidden';

      if (!opening) {
        const endHeight = height * closeHeightRatio;
        const surfaceHeightAnimation = surface.animate(
          [{ height: `${height}px` }, { height: `${endHeight}px` }],
          { duration: closeDuration, easing: closeEasing },
        );
        animations.push(surfaceHeightAnimation);
        animations.push(surface.animate(
          [{ opacity: 1 }, { opacity: 0 }],
          {
            delay: closeSurfaceOpacityDelay,
            duration: closeSurfaceOpacityDuration,
          },
        ));
        if (content) {
          animations.push(content.animate(
            [
              { transform: '' },
              {
                transform: opensUpwards
                  ? `translateY(-${height - endHeight}px)`
                  : '',
              },
            ],
            { duration: closeDuration, easing: closeEasing },
          ));
        }

        const delayBetweenItems = items.length > 0
          ? (closeDuration - closeItemOpacityDelay - closeItemOpacityDuration) / items.length
          : 0;
        items.forEach((_, index) => {
          const directionalIndex = opensUpwards ? index : items.length - 1 - index;
          const item = items[directionalIndex];
          if (!item) return;
          const animation = item.animate(
            [{ opacity: 1 }, { opacity: 0 }],
            {
              delay: closeItemOpacityDelay + delayBetweenItems * index,
              duration: closeItemOpacityDuration,
            },
          );
          animation.addEventListener('finish', () => {
            item.setAttribute('data-menu-motion-hidden', '');
          }, { once: true });
          animations.push(animation);
        });

        surfaceHeightAnimation.addEventListener('finish', () => {
          if (animationsRef.current !== animations) return;
          for (const item of items) item.removeAttribute('data-menu-motion-hidden');
          popup.removeAttribute('data-menu-motion-phase');
          popup.style.overflow = originalOverflowRef.current;
          popup.style.height = originalHeightRef.current;
          surface.style.overflow = motionSurfaceOverflowRef.current;
          motionSurfaceRef.current = null;
          animationsRef.current = [];
        }, { once: true });
        return;
      }

      for (const item of items) item.setAttribute('data-menu-motion-hidden', '');
      const surfaceHeightAnimation = surface.animate(
        [{ height: '0px' }, { height: `${height}px` }],
        { duration: openDuration, easing: openEasing },
      );
      animations.push(surfaceHeightAnimation);
      animations.push(surface.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: openSurfaceOpacityDuration },
      ));
      if (content) {
        // Material Web corrects only the slotted content when opening upward.
        // The outer popup remains at its measured size so Floating UI cannot
        // change sides while the nested visual surface animates.
        animations.push(content.animate(
          [
            { transform: opensUpwards ? `translateY(-${height}px)` : '' },
            { transform: '' },
          ],
          { duration: openDuration, easing: openEasing },
        ));
      }

      const delayBetweenItems = items.length > 0
        ? (openDuration - openItemOpacityDuration) / items.length
        : 0;
      items.forEach((_, index) => {
        const directionalIndex = opensUpwards ? items.length - 1 - index : index;
        const item = items[directionalIndex];
        if (!item) return;
        const animation = item.animate(
          [{ opacity: 0 }, { opacity: 1 }],
          { delay: delayBetweenItems * index, duration: openItemOpacityDuration },
        );
        animation.addEventListener('finish', () => {
          item.removeAttribute('data-menu-motion-hidden');
        }, { once: true });
        animations.push(animation);
      });
      popup.removeAttribute('data-menu-motion-pending');

      surfaceHeightAnimation.addEventListener('finish', () => {
        if (animationsRef.current !== animations) return;
        popup.removeAttribute('data-menu-motion-phase');
        popup.style.overflow = originalOverflowRef.current;
        popup.style.height = originalHeightRef.current;
        surface.style.overflow = motionSurfaceOverflowRef.current;
        motionSurfaceRef.current = null;
        animationsRef.current = [];
        flushDeferredItemInteractions();
      }, { once: true });
    };

    if (!open) {
      if (!wasPending) {
        // Material Web measures the rendered, potentially viewport-clamped
        // surface, not its full scroll content.
        const height = popup.offsetHeight;
        const sideValue = positioner.getAttribute('data-side')
          ?? popup.getAttribute('data-side');
        const side = isMenuSide(sideValue) ? sideValue : settledSideRef.current;
        if (height > 0) startMotion(false, height, side);
      }
      return () => cancelAnimations();
    }

    popup.setAttribute('data-menu-motion-pending', '');
    popup.setAttribute('data-menu-motion-phase', 'positioning');
    let remainingFrames = MAX_POSITIONING_FRAMES;
    let previousPlacement: PlacementSnapshot | null = null;

    const prepareOpen = () => {
      preparationFrameRef.current = null;
      if (popupRef.current !== popup || positionerRef.current !== positioner) return;

      const placement = readPlacement(popup, positioner);
      if (placement && placementIsStable(previousPlacement, placement)) {
        startMotion(true, placement.height, placement.side);
        return;
      }

      previousPlacement = placement;
      remainingFrames -= 1;
      if (remainingFrames > 0) {
        preparationFrameRef.current = requestAnimationFrame(prepareOpen);
      } else {
        // A positioning failure must not strand an invisible, unusable menu.
        popup.removeAttribute('data-menu-motion-pending');
        popup.removeAttribute('data-menu-motion-phase');
        popup.style.overflow = originalOverflowRef.current;
        popup.style.height = originalHeightRef.current;
        if (motionSurfaceRef.current) {
          motionSurfaceRef.current.style.overflow = motionSurfaceOverflowRef.current;
          motionSurfaceRef.current = null;
        }
        flushDeferredItemInteractions();
      }
    };

    // Base UI mounts the portal before Floating UI publishes final placement.
    // Starting on the next animation frame prevents stale bottom placement from
    // driving a menu that will flip above the trigger.
    preparationFrameRef.current = requestAnimationFrame(prepareOpen);

    return () => cancelAnimations(true);
  }, [cancelAnimations, flushDeferredItemInteractions, open, surfaceVersion]);

  useLayoutEffect(() => () => restoreDeferredItems(), [restoreDeferredItems]);

  return {
    setItemElement: setItem,
    setPopupElement: setPopup,
    setPositionerElement: setPositioner,
  };
}
