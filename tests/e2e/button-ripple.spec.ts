import { expect, test, type Locator, type Page } from '@playwright/test';

async function holdAtEdge(page: Page, button: Locator) {
  await button.scrollIntoViewIfNeeded();
  const box = (await button.boundingBox())!;
  await page.mouse.move(box.x + 5, box.y + box.height / 2);
  // Record the browser-delivered point (fractional coordinates differ by engine).
  await button.evaluate((element) => {
    element.addEventListener('pointerdown', (event) => {
      const point = event as PointerEvent;
      element.setAttribute('data-test-pointer-x', String(point.clientX));
      element.setAttribute('data-test-pointer-y', String(point.clientY));
    }, { once: true });
  });
  await page.mouse.down();
  const wave = button.locator('[data-slot="ripple"] > span');
  await expect(wave).toHaveCount(1);
  const origin = await button.evaluate((element) => {
    const wave = element.querySelector<HTMLElement>('[data-slot="ripple"] > span')!;
    const rect = element.querySelector('[data-slot="ripple"]')!.getBoundingClientRect();
    const size = parseFloat(wave.style.getPropertyValue('--ripple-size'));
    return {
      x: parseFloat(wave.style.getPropertyValue('--ripple-start-x')) + size / 2,
      y: parseFloat(wave.style.getPropertyValue('--ripple-start-y')) + size / 2,
      expectedX: Number(element.getAttribute('data-test-pointer-x')) - rect.left,
      expectedY: Number(element.getAttribute('data-test-pointer-y')) - rect.top,
      center: rect.width / 2,
    };
  });
  expect(origin.x).toBeCloseTo(origin.expectedX, 1);
  expect(origin.y).toBeCloseTo(origin.expectedY, 1);
  expect(origin.x).toBeLessThan(origin.center - 3);
  await expect(wave).toHaveCSS('animation-duration', '0.45s');
  await expect(wave).toHaveCSS('animation-timing-function', 'cubic-bezier(0.2, 0, 0, 1)');
  // A press must not replace hover with an instantaneous whole-button 16% wash.
  await expect(button.locator('[data-slot="state-layer"]'))
    .toHaveCSS('background-color', 'rgba(0, 0, 0, 0.06)');
  return wave;
}

for (const theme of [
  { mode: '라이트', high: false, reduce: false },
  { mode: '다크', high: false, reduce: false },
  { mode: '라이트', high: true, reduce: true },
  { mode: '다크', high: true, reduce: true },
]) {
  test(`Button/IconButton ripple ${theme.mode}/${theme.high ? 'high' : 'standard'}/${theme.reduce ? 'reduce' : 'motion'}`, async ({ page }) => {
    test.setTimeout(60_000);
    await page.emulateMedia({ reducedMotion: theme.reduce ? 'reduce' : 'no-preference' });
    await page.goto('/');
    await page.getByRole('button', { name: theme.mode, exact: true }).click();
    await page.getByRole('checkbox', { name: '고대비 색상', exact: true }).setChecked(theme.high);
    await page.getByRole('button', { name: '테마 적용', exact: true }).click();
    await page.getByRole('link', { name: '컴포넌트 검증', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-color-scheme', theme.mode === '다크' ? 'dark' : 'light');
    await expect(page.locator('html')).toHaveAttribute('data-contrast', theme.high ? 'high' : 'standard');

    for (const variant of ['filled', 'outlined', 'text', 'elevated', 'tonal']) {
      const button = page.getByRole('button', { name: `large ${variant} text`, exact: true });
      const wave = await holdAtEdge(page, button);
      const surface = wave.locator('> span');
      const figma = theme.mode === '라이트' && !theme.high;
      await expect(surface).toHaveCSS('opacity', figma ? '1' : '0.1');
      const color = figma ? 'rgba(0, 0, 0, 0.16)' : await button.evaluate(e => getComputedStyle(e).color);
      expect(await surface.evaluate(e => getComputedStyle(e).backgroundImage)).toContain(color);
      await page.mouse.up();
      await expect(wave).toHaveCount(0);
    }

    for (const [size, container, icon, padding] of [
      ['large', 40, 24, 8], ['medium', 32, 20, 6], ['small', 24, 16, 4],
    ] as const) {
      const button = page.getByRole('button', { name: `${size} filled action`, exact: true });
      await expect(button).toHaveCSS('padding', `${padding}px`);
      await expect(button).toHaveCSS('width', `${container}px`);
      await expect(button.locator('[data-slot="icon"]')).toHaveCSS('width', `${icon}px`);
      await expect(button.locator('[data-slot="touch-target"]')).toHaveCSS('width', '48px');
      const wave = await holdAtEdge(page, button);
      await expect(wave.locator('> span')).toHaveCSS('opacity', '0.1');
      expect(await wave.locator('> span').evaluate(e => getComputedStyle(e).backgroundImage))
        .toContain(await button.evaluate(e => getComputedStyle(e).color));
      await page.mouse.up();
      await expect(wave).toHaveCount(0);
    }

    for (const name of ['large filled text', 'large filled action']) {
      const button = page.getByRole('button', { name, exact: true });
      await button.focus();
      await button.press('Space');
      const wave = button.locator('[data-slot="ripple"] > span');
      await expect(wave).toHaveCount(1);
      const centered = await wave.evaluate(e => {
        const s = (e as HTMLElement).style;
        return s.getPropertyValue('--ripple-start-x') === s.getPropertyValue('--ripple-end-x')
          && s.getPropertyValue('--ripple-start-y') === s.getPropertyValue('--ripple-end-y');
      });
      expect(centered).toBe(true);
      await expect(wave).toHaveCount(0);
    }
    for (const disabled of await page.getByRole('button', { name: 'large filled disabled', exact: true }).all()) {
      await disabled.click({ force: true });
      await expect(disabled.locator('[data-slot="ripple"] > span')).toHaveCount(0);
    }
  });
}
