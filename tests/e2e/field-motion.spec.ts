import { expect, test } from '@playwright/test';

for (const kind of ['TextField', 'AutoComplete'] as const) {
  test(`${kind} fresh affix toggles work without typing, with explicit empty/sample controls`, async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: '컴포넌트 검증' }).click();
    await page.getByRole('link', { name: 'Form fields TextField · Select · AutoComplete' }).click();
    const region = page.getByRole('region', { name: `${kind} 속성 테스트` });
    const auto = kind === 'AutoComplete';
    const input = region.getByRole(auto ? 'combobox' : 'textbox', { name: auto ? '도시 자동완성' : '테스트 입력', exact: true });
    const prefix = region.locator('[data-slot="prefix"]');
    const suffix = region.locator('[data-slot="suffix"]');
    const prefixToggle = region.getByRole('checkbox', { name: auto ? 'AutoComplete Prefix' : 'Prefix', exact: true });
    const suffixToggle = region.getByRole('checkbox', { name: auto ? 'AutoComplete Suffix' : 'Suffix', exact: true });
    await prefixToggle.check();
    await suffixToggle.check();
    await expect(input).not.toHaveValue('');
    await expect(suffixToggle).toBeFocused();
    for (const small of [false, true]) {
      await region.getByRole('checkbox', { name: `${auto ? 'AutoComplete ' : ''}Small 크기 (해제: Large)`, exact: true }).setChecked(small);
      await expect(prefix).toHaveCSS('visibility', 'visible');
      await expect(suffix).toHaveCSS('visibility', 'visible');
      await expect(prefix.locator('..')).toHaveCSS('opacity', '1');
      const boxes = await Promise.all([prefix.boundingBox(), input.boundingBox(), suffix.boundingBox()]);
      expect(boxes[0]!.x + boxes[0]!.width).toBeLessThanOrEqual(boxes[1]!.x + 1);
      expect(boxes[1]!.x + boxes[1]!.width).toBeLessThanOrEqual(boxes[2]!.x + 1);
      await region.getByRole('button', { name: '빈 값으로 테스트', exact: true }).click();
      await expect(input).toHaveValue('');
      await expect(prefix.locator('..')).toHaveCSS('opacity', '0');
      await input.focus();
      await expect(prefix.locator('..')).toHaveCSS('opacity', '1');
      await input.press('Escape');
      await region.getByRole('button', { name: '샘플 값 넣기', exact: true }).click();
      await expect(input).not.toHaveValue('');
      await expect(prefix.locator('..')).toHaveCSS('opacity', '1');
    }
    await prefixToggle.uncheck();
    await suffixToggle.uncheck();
    await expect(prefix).toHaveCount(0);
    await expect(suffix).toHaveCount(0);
  });
}

for (const size of ['large', 'small'] as const) {
  test(`${size} label reversals retain the rendered pose and content fades as one group`, async ({ page }) => {
    await page.goto('/components#form-fields');
    const input = page.getByRole('textbox', { name: `${size} text empty enabled`, exact: true });
    await input.scrollIntoViewIfNeeded();
    await page.evaluate(() => document.fonts.ready);
    const evidence = await input.evaluate(async (input) => {
      const root = input.closest('[data-text-field-variant]')!;
      const label = root.querySelector<HTMLElement>('[data-slot="floating-label"]')!;
      const resting = root.querySelector<HTMLElement>('[data-slot="resting-label"]')!;
      const content = input.parentElement!;
      const waitForAnimation = async (previous?: Animation) => {
        for (let frame = 0; frame < 12; frame++) {
          await new Promise(requestAnimationFrame);
          const animation = label.getAnimations().find((item) => item !== previous);
          if (animation) return animation;
        }
        throw new Error('Expected a live label transition');
      };
      input.focus();
      const first = await waitForAnimation();
      const timing = first.effect!.getTiming();
      const contentStyle = getComputedStyle(content);
      const contentTiming = { duration: contentStyle.transitionDuration, delay: contentStyle.transitionDelay, easing: contentStyle.transitionTimingFunction };
      // Freeze an actual transition to compare exactly the reversal boundary,
      // independently of Windows frame scheduling. End-to-end motion runs below.
      const reversals = [];
      let previous = first;
      for (const focus of [false, true]) {
        previous.pause();
        previous.currentTime = 50;
        const before = new DOMMatrix(getComputedStyle(label).transform);
        if (focus) input.focus(); else input.blur();
        const next = await waitForAnimation(previous);
        next.pause();
        next.currentTime = 0;
        const after = new DOMMatrix(getComputedStyle(label).transform);
        reversals.push({
          delta: Math.max(...['a', 'd', 'e', 'f'].map((key) => Math.abs(before[key as 'a'] - after[key as 'a']))),
          floatingOpacity: getComputedStyle(label).opacity,
          restingOpacity: getComputedStyle(resting).opacity,
        });
        previous = next;
      }
      previous.play();
      await previous.finished;
      input.blur();
      const closing = await waitForAnimation(previous);
      const frames = [];
      // Observe unmodified real blur motion and ensure both labels never paint.
      while (closing.playState !== 'finished') {
        frames.push({ floating: Number(getComputedStyle(label).opacity), resting: Number(getComputedStyle(resting).opacity), y: label.getBoundingClientRect().y });
        await new Promise(requestAnimationFrame);
      }
      return { timing, contentTiming, reversals, frames };
    });
    expect(evidence.timing.duration).toBe(150);
    expect(evidence.timing.easing).toBe('cubic-bezier(0.2, 0, 0, 1)');
    expect(evidence.contentTiming).toEqual({ duration: '0.083s', delay: '0.067s', easing: 'cubic-bezier(0.3, 0, 0, 1)' });
    for (const reversal of evidence.reversals) {
      expect(reversal.delta).toBeLessThan(0.01);
      expect(reversal.floatingOpacity).toBe('1');
      expect(reversal.restingOpacity).toBe('0');
    }
    expect(evidence.frames.length).toBeGreaterThan(0);
    expect(evidence.frames.every((frame) => frame.floating + frame.resting <= 1 && Number.isFinite(frame.y))).toBe(true);
    const root = input.locator('xpath=ancestor::*[@data-text-field-variant]');
    await expect(root.locator('[data-slot="resting-label"]')).toHaveCSS('opacity', '1');
    await expect(root.locator('[data-slot="floating-label"]')).toHaveCSS('opacity', '0');
    await expect(root.locator('[data-slot="prefix"]').locator('..')).toHaveCSS('opacity', '0');
  });
}
