import { useLayoutEffect, useRef } from 'react';
import styles from './Tabs.module.css';

/** Stable Material Web's selection-driven FLIP, without animating layout resizes. */
export function TabIndicator() {
  const currentRef = useRef<HTMLSpanElement>(null);
  const previousRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const indicator = currentRef.current;
    const previous = previousRef.current;
    const list = indicator?.parentElement;
    if (!indicator || !previous || !list) return;
    let active: HTMLElement | null = null;
    let last = { left: 0, width: 0 };
    let animations: Animation[] = [];
    const cancel = () => {
      animations.forEach((animation) => animation.cancel());
      animations = [];
    };
    const update = () => {
      const selected = list.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
      const rect = selected?.getBoundingClientRect();
      if (!selected || !rect?.width) {
        cancel();
        indicator.style.visibility = 'hidden';
        active = null;
        return;
      }
      const next = {
        left: rect.left - list.getBoundingClientRect().left - list.clientLeft + list.scrollLeft,
        width: rect.width,
      };
      const changed = active !== selected;
      const hadActive = active !== null;
      indicator.style.visibility = '';
      indicator.style.left = `${next.left}px`;
      indicator.style.width = `${next.width}px`;
      if (changed && hadActive) {
        cancel();
        const style = getComputedStyle(indicator);
        const durationToken = style.getPropertyValue('--md-primary-tab-active-indicator-motion-duration').trim();
        const options = {
          duration: parseFloat(durationToken) * (durationToken.endsWith('ms') ? 1 : 1000),
          easing: style.getPropertyValue('--md-primary-tab-active-indicator-motion-easing').trim(),
        };
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
          previous.style.left = `${last.left}px`;
          previous.style.width = `${last.width}px`;
          animations = [
            indicator.animate({ opacity: [0, 1] }, options),
            previous.animate({ opacity: [1, 0] }, options),
          ];
        } else {
          animations = [indicator.animate([
            { transform: `translateX(${last.left - next.left}px) scaleX(${last.width / next.width})` },
            { transform: 'none' },
          ], options)];
        }
      }
      active = selected;
      last = next;
    };
    const resize = new ResizeObserver(update);
    const observeTabs = () => {
      resize.disconnect();
      resize.observe(list);
      list.querySelectorAll('[role="tab"]').forEach((tab) => resize.observe(tab));
      update();
    };
    const mutations = new MutationObserver(observeTabs);
    mutations.observe(list, { subtree: true, childList: true, attributes: true, attributeFilter: ['aria-selected'] });
    observeTabs();
    return () => { mutations.disconnect(); resize.disconnect(); cancel(); };
  }, []);

  return <>
    <span aria-hidden="true" className={styles.indicator} data-slot="previous-indicator" ref={previousRef} />
    <span aria-hidden="true" className={styles.indicator} data-slot="active-indicator" ref={currentRef} />
  </>;
}
