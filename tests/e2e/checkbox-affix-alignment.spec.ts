import { expect, test } from '@playwright/test';
import { selectComponent } from './gallery-navigation';

test('Checkbox check tip stays anchored throughout drawing and after settling', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.getByRole('link', { name: '컴포넌트 검증', exact: true }).click();
  await selectComponent(page, 'checkbox');
  await page.evaluate(() => document.fonts.ready);

  for (const size of ['large', 'medium', 'small']) {
    const checkbox = page.getByRole('checkbox', { name: `${size} Unchecked`, exact: true });
    await checkbox.scrollIntoViewIfNeeded();
    const framesPromise = checkbox.evaluate(async (element) => {
      await new Promise<void>((resolve) => element.addEventListener('click', () => resolve(), { once: true }));
      const frames = [];
      const start = performance.now();
      while (performance.now() - start < 750) {
        await new Promise(requestAnimationFrame);
        const control = element.getBoundingClientRect();
        const mark = element.querySelector('rect')!.getBoundingClientRect();
        const box = element.querySelector('[class*="_box_"]')!.getBoundingClientRect();
        const indicator = element.querySelector('[class*="_indicator_"]')!;
        frames.push({
          tip: mark.bottom - control.top,
          boxY: box.top - control.top,
          scale: new DOMMatrix(getComputedStyle(indicator).transform).a,
          checked: element.getAttribute('aria-checked'),
        });
      }
      return frames;
    });
    await checkbox.click();
    const frames = await framesPromise;
    expect(frames.some((frame) => frame.scale > 0.6 && frame.scale < 1)).toBe(true);
    expect(frames.at(-1)!.scale).toBe(1);
    expect(frames.every((frame) => frame.checked === 'true')).toBe(true);
    // Allow subpixel SVG rounding, not the former 1.375–2px downward travel.
    expect(Math.max(...frames.map((f) => f.tip)) - Math.min(...frames.map((f) => f.tip))).toBeLessThan(0.2);
    expect(frames.every((frame) => Math.abs(frame.boxY) < 0.05)).toBe(true);
    await checkbox.press('Space');
    await expect(checkbox).not.toBeChecked();
    await checkbox.press('Space');
    await expect(checkbox).toBeChecked();
    await expect(checkbox.locator('[class*="_indicator_"]')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  }
});

test('TextField affixes retain Figma center alignment and size-specific typography', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: '컴포넌트 검증', exact: true }).click();
  await selectComponent(page, 'text-field');
  const region = page.getByRole('region', { name: 'TextField 속성 테스트', exact: true });
  await region.getByRole('checkbox', { name: 'Prefix', exact: true }).check();
  await region.getByRole('checkbox', { name: 'Suffix', exact: true }).check();
  const input = region.getByRole('textbox', { name: '테스트 입력', exact: true });
  await page.evaluate(() => document.fonts.ready);
  for (const small of [false, true]) {
    await region.getByRole('checkbox', { name: 'Small 크기 (해제: Large)', exact: true }).setChecked(small);
    await input.focus();
    const affixes = await input.evaluate((element) => {
      const control = element.parentElement!.parentElement!.getBoundingClientRect();
      return [...element.parentElement!.querySelectorAll('[data-slot="prefix"], [data-slot="suffix"]')].map((affix) => {
        const rect = affix.getBoundingClientRect();
        const style = getComputedStyle(affix);
        return { center: rect.y + rect.height / 2 - control.y - control.height / 2,
          size: style.fontSize, lineHeight: style.lineHeight, weight: style.fontWeight };
      });
    });
    expect(affixes).toHaveLength(2);
    for (const affix of affixes) {
      expect(Math.abs(affix.center)).toBeLessThan(0.05);
      expect(affix.size).toBe(small ? '12px' : '14px');
      expect(affix.lineHeight).toBe(small ? '16px' : '20px');
      expect(affix.weight).toBe('500');
    }
  }
});
