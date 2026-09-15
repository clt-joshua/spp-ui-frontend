import { expect, test } from '@playwright/test';
import { selectComponent } from './gallery-navigation';

for (const size of ['large', 'small']) {
  test(`${size} label returns along one path without decorative ghosts or endpoint snap`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    await page.getByRole('link', { name: '컴포넌트 검증', exact: true }).click();
    await selectComponent(page, 'text-field');
    const input = page.getByRole('textbox', { name: `${size} text empty enabled`, exact: true });
    await input.scrollIntoViewIfNeeded();
    await page.evaluate(() => document.fonts.ready);
    await input.focus();
    const evidence = await input.evaluate(async (element) => {
      const root = element.closest('[data-text-field-variant]')!;
      const moving = root.querySelector<HTMLElement>('[data-slot="floating-label"]')!;
      const resting = root.querySelector<HTMLElement>('[data-slot="resting-label"]')!;
      await Promise.all(moving.getAnimations().map((animation) => animation.finished));
      await new Promise(requestAnimationFrame);
      const start = moving.getBoundingClientRect();
      const end = resting.getBoundingClientRect();
      element.blur();
      await new Promise(requestAnimationFrame);
      const animation = moving.getAnimations()[0];
      if (!animation) throw new Error('Expected an actual return animation');
      const frames = [];
      while (animation.playState === 'running' || animation.playState === 'paused') {
        const rect = moving.getBoundingClientRect();
        frames.push({
          x: rect.x, y: rect.y,
          placeholder: getComputedStyle(element, '::placeholder').opacity,
          prefix: getComputedStyle(root.querySelector('[data-slot="prefix"]')!).visibility,
          suffix: getComputedStyle(root.querySelector('[data-slot="suffix"]')!).visibility,
        });
        await new Promise(requestAnimationFrame);
      }
      // Include the first painted resting pose, not just animation frames.
      await new Promise(requestAnimationFrame);
      const settled = resting.getBoundingClientRect();
      return { frames, start: { x: start.x, y: start.y }, end: { x: end.x, y: end.y },
        settled: { x: settled.x, y: settled.y },
        floatingOpacity: getComputedStyle(moving).opacity,
        restingOpacity: getComputedStyle(resting).opacity,
        inputVisibility: getComputedStyle(element).visibility };
    });
    expect(evidence.frames.length).toBeGreaterThan(0);
    const allFrames = [...evidence.frames, evidence.settled];
    for (let index = 1; index < allFrames.length; index++) {
      expect(allFrames[index]!.y).toBeGreaterThanOrEqual(allFrames[index - 1]!.y - 0.1);
      expect(allFrames[index]!.x).toBeGreaterThanOrEqual(allFrames[index - 1]!.x - 0.1);
    }
    for (const frame of evidence.frames) {
      const progress = (frame.y - evidence.start.y) / (evidence.end.y - evidence.start.y);
      expect(frame.x).toBeCloseTo(evidence.start.x + (evidence.end.x - evidence.start.x) * progress, 1);
      expect(frame.placeholder).toBe('0');
      expect(frame.prefix).toBe('hidden');
      expect(frame.suffix).toBe('hidden');
    }
    expect(evidence.floatingOpacity).toBe('0');
    expect(evidence.restingOpacity).toBe('1');
    expect(evidence.inputVisibility).toBe('visible');
    await input.focus();
    await expect(input).toBeFocused();
    await input.fill('실제 입력');
    await expect(input).toHaveValue('실제 입력');
  });
}
