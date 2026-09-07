import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: '컴포넌트 검증' }).click();
});

test('Switch travels between Figma endpoints with Material overshoot, including reduced motion', async ({ page }) => {
  const control = page.getByRole('switch', { name: 'enabled switch', exact: true });
  await control.scrollIntoViewIfNeeded();
  for (const reducedMotion of ['no-preference', 'reduce'] as const) {
    await page.emulateMedia({ reducedMotion });
    const evidence = await control.evaluate(async (element) => {
      const thumb = element.querySelector<HTMLElement>('[data-slot="thumb"]')!;
      const track = element.querySelector<HTMLElement>('[data-slot="track"]')!;
      const read = () => thumb.getBoundingClientRect().x - track.getBoundingClientRect().x;
      const from = read();
      (element as HTMLElement).click();
      const frames = [];
      const start = performance.now();
      while (performance.now() - start < 400) {
        await new Promise(requestAnimationFrame);
        frames.push(read());
      }
      return { from, frames, duration: getComputedStyle(thumb).transitionDuration, easing: getComputedStyle(thumb).transitionTimingFunction };
    });
    const end = evidence.frames.at(-1)!;
    expect(Math.abs(end - evidence.from)).toBeCloseTo(14, 0);
    expect(evidence.frames.some((x) => Math.abs(x - evidence.from) > 0.1 && Math.abs(x - end) > 0.1)).toBe(true);
    expect(evidence.duration).toContain('0.3s');
    expect(evidence.easing).toContain('cubic-bezier(0.175, 0.885, 0.32, 1.275)');
  }
});

test('Tabs use selection FLIP and reduced-motion crossfade without animating resize', async ({ page }) => {
  const tab = page.getByRole('tab', { name: 'Tokens', exact: true });
  await tab.scrollIntoViewIfNeeded();
  await page.evaluate(() => document.fonts.ready);
  const readMotion = async (name: string) => page.getByRole('tab', { name, exact: true }).evaluate(async (tab) => {
    const list = tab.closest('[role="tablist"]')!;
    const indicator = list.querySelector('[data-slot="active-indicator"]')!;
    (tab as HTMLElement).click();
    for (let i = 0; i < 20; i++) {
      await new Promise(requestAnimationFrame);
      const animation = indicator.getAnimations()[0];
      if (!animation) continue;
      const effect = animation.effect as KeyframeEffect;
      const result = { timing: effect.getTiming(), frames: effect.getKeyframes(), previous: list.querySelector('[data-slot="previous-indicator"]')!.getAnimations().length };
      await animation.finished;
      return result;
    }
    throw new Error('Missing selection animation');
  });
  const motion = await readMotion('Tokens');
  expect(motion.timing.duration).toBe(250);
  expect(motion.timing.easing).toBe('cubic-bezier(0.3, 0, 0, 1)');
  expect(motion.frames[0]!.transform).toContain('scaleX(');
  expect(motion.frames.at(-1)!.transform).toBe('none');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const reduced = await readMotion('Behavior');
  expect(reduced.frames.map((frame) => frame.opacity)).toEqual(['0', '1']);
  expect(reduced.previous).toBe(1);
  expect(reduced.frames.every((frame) => !frame.transform)).toBe(true);
  await page.setViewportSize({ width: 1000, height: 800 });
  const indicator = page.locator('[data-slot="active-indicator"]').first();
  await expect.poll(() => indicator.evaluate((element) => element.getAnimations().length)).toBe(0);
  const [tabBox, indicatorBox] = await Promise.all([page.getByRole('tab', { name: 'Behavior', exact: true }).boundingBox(), indicator.boundingBox()]);
  expect(indicatorBox!.width).toBeCloseTo(tabBox!.width, 0);
});

test('Focus ring grows and shrinks; reduced motion keeps a static visible ring', async ({ page }) => {
  const tab = page.getByRole('tab', { name: 'Tokens', exact: true });
  await page.keyboard.press('Tab');
  await tab.focus();
  const ring = tab.locator('[data-slot="focus-ring"]');
  await expect(ring).toHaveCSS('animation-duration', '0.15s, 0.45s');
  await expect(ring).toHaveCSS('animation-delay', '0s, 0.15s');
  await expect(ring).toHaveCSS('opacity', '1');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(ring).toHaveCSS('animation-name', 'none');
  await expect(ring).toHaveCSS('opacity', '1');
  await expect(ring).toHaveCSS('border-top-width', '3px');
});

test('Ripple starts on keyboard activation, replaces previous waves, and releases on pointer leave', async ({ page }) => {
  const button = page.getByRole('button', { name: 'large filled text', exact: true });
  await button.focus();
  const waves = button.locator('[data-slot="ripple"] > span');
  await page.keyboard.down('Space');
  await expect(waves).toHaveCount(0);
  await page.keyboard.up('Space');
  await expect(waves).toHaveCount(1);
  // Read one short-lived wave atomically. Three separate protocol round trips
  // can outlive its natural removal on a software-rendered CI browser.
  await expect.poll(() => waves.evaluateAll((elements) => elements.map((wave) => {
    const surface = getComputedStyle(wave.querySelector('span')!);
    return { grow: getComputedStyle(wave).animationDuration, fadeIn: surface.animationDuration, fadeOut: surface.transitionDuration };
  }))).toEqual([{ grow: '0.45s', fadeIn: '0.105s', fadeOut: '0.375s' }]);
  await button.press('Enter');
  await expect(waves).toHaveCount(1);
  await expect(waves).toHaveCount(0);
  await button.hover();
  await expect(button.locator('[data-slot="state-layer"]')).toHaveCSS('transition-duration', '0.015s, 0.015s');
  await page.mouse.down();
  await expect(waves).toHaveCount(1);
  await page.mouse.move(0, 0);
  await expect(waves).toHaveCount(0);
  await page.mouse.up();
  await button.evaluate((element) => {
    (element as HTMLElement).style.zoom = '1.5';
    // Engines may round the pointer location; the event, not the geometric
    // center requested by hover(), is the authority for a pointer ripple.
    element.addEventListener('pointerdown', (event) => {
      (element as HTMLElement).dataset.motionPointerX = String((event as PointerEvent).clientX);
    }, { once: true });
  });
  await button.hover();
  await page.mouse.down();
  await expect(waves).toHaveCount(1);
  const origin = await button.evaluate((element) => {
    const root = element.querySelector<HTMLElement>('[data-slot="ripple"]')!;
    const wave = root.firstElementChild as HTMLElement;
    const size = parseFloat(wave.style.getPropertyValue('--ripple-size'));
    return {
      actual: parseFloat(wave.style.getPropertyValue('--ripple-start-x')) + size / 2,
      expected: (Number((element as HTMLElement).dataset.motionPointerX) - root.getBoundingClientRect().left) / (root.currentCSSZoom ?? 1),
    };
  });
  expect(origin.actual).toBeCloseTo(origin.expected, 5);
  await page.mouse.up();
  await expect(waves).toHaveCount(0);
  await page.emulateMedia({ forcedColors: 'active' });
  await button.press('Space');
  await expect(waves).toHaveCount(0);
  await expect(button.locator('[data-slot="ripple"]')).toHaveCSS('display', 'none');
});

test.describe('touch ripple', () => {
  test.use({ hasTouch: true });
  test('a real tap activates once and a cancelled delayed touch leaves no wave', async ({ page }) => {
    const button = page.getByRole('button', { name: 'large filled text', exact: true });
    const waves = button.locator('[data-slot="ripple"] > span');
    await button.tap();
    await expect(waves).toHaveCount(1);
    await expect(waves).toHaveCount(0);
    // Exercise the browser's cancellation event after a pending touch (scroll).
    const count = await button.evaluate(async (element) => {
      element.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch', pointerId: 7, isPrimary: true, buttons: 1 }));
      element.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true, pointerType: 'touch', pointerId: 7, isPrimary: true }));
      await new Promise((resolve) => setTimeout(resolve, 200));
      return element.querySelectorAll('[data-slot="ripple"] > span').length;
    });
    expect(count).toBe(0);
    await expect(button).not.toHaveAttribute('data-pressed');
  });
});

test('Radio grows only on selection and fades without shrinking on deselection', async ({ page }) => {
  const radio = page.getByRole('radio', { name: 'large Unselected', exact: true });
  await radio.scrollIntoViewIfNeeded();
  await radio.click();
  const dot = radio.locator('circle');
  await expect(dot).toHaveCSS('animation-duration', '0.3s');
  await expect(dot).toHaveCSS('transition-duration', '0.05s');
  await expect(dot).toHaveCSS('opacity', '1');
  await page.getByRole('radio', { name: 'large Selected', exact: true }).click();
  await expect(dot).toHaveCSS('opacity', '0');
  await expect(dot).toHaveCSS('animation-name', 'none');
  await expect(dot).toHaveCSS('transform', 'none');
});

test('Select crossfades arrow glyphs instead of rotating, with Material timing', async ({ page }) => {
  const select = page.getByRole('combobox', { name: '선택 테스트', exact: true });
  const arrows = select.locator('[data-slot="trailing-icon"] .material-icons');
  await expect(arrows).toHaveCount(2);
  await select.click();
  await expect(arrows.first()).toHaveCSS('transition-duration', '0.075s');
  await expect(arrows.first()).toHaveCSS('transition-delay', '0.075s');
  await expect(arrows.first()).toHaveCSS('transition-property', 'opacity');
  await expect(arrows.first()).toHaveCSS('opacity', '0');
  await expect(arrows.last()).toHaveCSS('opacity', '1');
  await page.keyboard.press('Escape');
  await expect(arrows.first()).toHaveCSS('opacity', '1');
  await expect(arrows.last()).toHaveCSS('opacity', '0');
});

test('Dialog grows its surface height rather than clipping its elevation', async ({ page }) => {
  await page.getByRole('button', { name: '기본 Dialog 열기', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: '기본 Dialog', exact: true });
  await expect(dialog).toBeVisible();
  const style = await dialog.evaluate((element) => {
    const surface = getComputedStyle(element, '::before');
    return { property: surface.transitionProperty, duration: surface.transitionDuration, clip: surface.clipPath };
  });
  expect(style.property).toBe('block-size, opacity');
  expect(style.duration).toBe('0.5s, 0.05s');
  expect(style.clip).toBe('none');
  await page.getByRole('button', { name: '대화상자 닫기', exact: true }).click();
  await expect(dialog).toBeHidden();
});
