import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: '컴포넌트 검증' }).click();
  await page.getByRole('link', { name: 'Navigation Tabs · Segmented Button' }).click();
});

test('Labs SVG draw-in and graphic width follow the source, not a clipped font glyph', async ({ page }) => {
  const group = page.getByRole('group', { name: '일정 보기 범위', exact: true });
  const day = group.getByRole('button', { name: 'Day', exact: true });
  await expect(day.locator('[data-slot="checkmark-path"]')).toHaveCSS('animation-name', 'none');
  const week = group.getByRole('button', { name: 'Week', exact: true });
  await week.scrollIntoViewIfNeeded();
  const frames = await week.evaluate(async (element) => {
    const graphic = element.querySelector('[data-slot="graphic"]')!;
    const values = [{ width: graphic.getBoundingClientRect().width, group: element.parentElement!.getBoundingClientRect().width }];
    (element as HTMLElement).click();
    const start = performance.now();
    while (performance.now() - start < 1500) {
      await new Promise(requestAnimationFrame);
      values.push({ width: graphic.getBoundingClientRect().width, group: element.parentElement!.getBoundingClientRect().width });
      if (values.at(-1)!.width === 26 && graphic.getAnimations().length === 0) break;
    }
    return values;
  });
  expect(frames[0]!.width).toBe(0);
  expect(frames.some(({ width }) => width > 0 && width < 26)).toBe(true);
  expect(frames.at(-1)!.width).toBe(26);
  expect(frames.every(({ group }) => group === frames[0]!.group)).toBe(true);
  const path = week.locator('[data-slot="checkmark-path"]');
  await expect(path).toHaveAttribute('d', 'M1.73,12.91 8.1,19.28 22.79,4.59');
  await expect(path).toHaveCSS('stroke-width', '2px');
  await expect(path).toHaveCSS('animation-duration', '0.15s');
  await expect(path).toHaveCSS('animation-delay', '0.05s');
  await expect(path).toHaveCSS('animation-timing-function', 'cubic-bezier(0.2, 0, 0, 1)');
  // Seek the actual CSS animation created by selection, not a synthetic animation.
  const stroke = await path.evaluate((element) => {
    const animation = element.getAnimations()[0]!;
    animation.pause();
    const poses = [25, 125, 200].map((time) => {
      animation.currentTime = time;
      return parseFloat(getComputedStyle(element).strokeDashoffset);
    });
    animation.finish();
    return poses;
  });
  expect(stroke[0]).toBeCloseTo(29.7833385, 3);
  expect(stroke[1]).toBeGreaterThan(0);
  expect(stroke[1]).toBeLessThan(stroke[0]!);
  expect(stroke[2]).toBe(0);
  await expect(week.locator('[data-slot="selected-icon"]')).toHaveCSS('clip-path', 'none');
  await week.click();
  await expect(week).toHaveAttribute('aria-pressed', 'true');
});

test('Labs selecting/deselecting keyframes preserve labeled, icon-only, hidden and custom options', async ({ page }) => {
  const labels = page.getByRole('group', { name: '지도 레이어', exact: true }).getByRole('button', { name: 'Labels', exact: true });
  const icon = labels.locator('[data-slot="icon"]');
  await labels.click();
  await expect(labels).toHaveAttribute('data-selection-motion', 'deselecting');
  await expect(icon).toHaveCSS('animation-duration', '0.15s');
  await expect(icon).toHaveCSS('animation-delay', '0.05s');
  await expect(labels.locator('[data-slot="selected-icon"]')).toHaveCSS('animation-duration', '0.05s');
  const opacity = await icon.evaluate((element) => {
    const animation = element.getAnimations()[0]!;
    animation.pause();
    const poses = [25, 125, 200].map((time) => {
      animation.currentTime = time;
      return Number(getComputedStyle(element).opacity);
    });
    animation.finish();
    return poses;
  });
  expect(opacity).toEqual([0, 0.5, 1]);
  await labels.press('Space');
  await expect(labels).toHaveAttribute('data-selection-motion', 'selecting');
  await expect(icon).toHaveCSS('animation-duration', '0.075s');
  await expect(icon).toHaveCSS('opacity', '0');
  const agenda = page.getByRole('button', { name: 'Agenda view', exact: true });
  await agenda.click();
  await expect(agenda.locator('[data-slot="graphic"]')).toHaveCSS('width', '26px');
  await expect(agenda.locator('[data-slot="icon"]')).toHaveCSS('opacity', '1');
  await expect(agenda.locator('[data-slot="icon"]')).toHaveCSS('animation-name', 'none');
  const hidden = page.getByRole('button', { name: '체크 숨김', exact: true });
  await hidden.click();
  await expect(hidden).toHaveAttribute('aria-pressed', 'true');
  await expect(hidden).not.toHaveAttribute('data-selection-motion');
  await expect(hidden.locator('[data-slot="selected-icon"]')).toHaveCount(0);
  await expect(hidden.locator('[data-slot="icon"]')).toHaveCSS('opacity', '1');
  const custom = page.getByRole('button', { name: '사용자 아이콘', exact: true });
  await custom.click();
  await expect(custom.locator('[data-slot="selected-icon"]')).toHaveCSS('opacity', '1');
  await expect(custom.locator('[data-slot="selected-icon"]')).toHaveCSS('animation-duration', '0.15s');
});

test('reselection restarts Labs draw-in; disabled and reduced-motion remain usable', async ({ page }) => {
  const group = page.getByRole('group', { name: '일정 보기 범위', exact: true });
  const week = group.getByRole('button', { name: 'Week', exact: true });
  const result = await week.evaluate(async (element) => {
    const week = element as HTMLElement;
    const month = Array.from(week.parentElement!.querySelectorAll('button')).find((button) => button.textContent?.includes('Month'))!;
    const path = week.querySelector('[data-slot="checkmark-path"]')!;
    const snapshots = [];
    for (const target of [week, month, week, month, week]) {
      target.click();
      for (let i = 0; i < 2; i++) await new Promise(requestAnimationFrame);
      snapshots.push({ phase: week.dataset.selectionMotion, draw: path.getAnimations().length });
    }
    return snapshots;
  });
  expect(result.map(({ phase }) => phase)).toEqual(['selecting', 'deselecting', 'selecting', 'deselecting', 'selecting']);
  expect(result.map(({ draw }) => draw)).toEqual([1, 0, 1, 0, 1]);
  await expect(week.locator('[data-slot="checkmark-path"]')).toHaveCSS('stroke-dashoffset', '0px');
  await expect(week).toHaveAttribute('aria-pressed', 'true');
  const disabled = page.getByRole('button', { name: 'Selected disabled', exact: true });
  await expect(disabled).toBeDisabled();
  await expect(disabled.locator('[data-slot="checkmark-path"]')).toHaveCSS('animation-name', 'none');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await group.getByRole('button', { name: 'Month', exact: true }).press('Enter');
  await expect(week.locator('[data-slot="graphic"]')).toHaveCSS('width', '0px');
  await expect(week.locator('[data-slot="graphic"]')).toHaveCSS('transition-duration', '0s');
  const month = group.getByRole('button', { name: 'Month', exact: true });
  await expect(month.locator('[data-slot="checkmark-path"]')).toHaveCSS('animation-name', 'none');
  await expect(month.locator('[data-slot="checkmark-path"]')).toHaveCSS('stroke-dashoffset', '0px');
  await expect(month.locator('[data-slot="selected-icon"]')).toHaveCSS('opacity', '1');
});
