import { selectComponent } from './gallery-navigation';
import { expect, test } from '@playwright/test';

test('Location은 Figma small 단일 표시 variant의 여백과 typography를 유지한다', async ({ page }) => {
  await page.goto('/');
  for (const mode of ['라이트', '다크']) {
    await page.getByRole('button', { name: mode, exact: true }).click();
    for (const high of [false, true]) {
      await page.getByRole('checkbox', { name: '고대비 색상', exact: true }).setChecked(high);
      const chip = page.locator('[data-chip-type="location"]');
      const content = chip.locator(':scope > span');
      const prefix = content.locator(':scope > span').first();
      const value = content.locator(':scope > span').last();
      await expect(chip).toHaveCSS('height', '24px');
      await expect(chip).toHaveCSS('border-radius', '4px');
      await expect(content).toHaveCSS('gap', '6px');
      await expect(content).toHaveCSS('padding', '4px 8px');
      await expect(prefix).toHaveCSS('font-weight', '600');
      await expect(value).toHaveCSS('font-weight', '500');
      for (const text of [prefix, value]) {
        await expect(text).toHaveCSS('font-size', '12px');
        await expect(text).toHaveCSS('line-height', '16px');
        await expect(text).toHaveCSS('letter-spacing', '0.5px');
      }
      const geometry = await chip.evaluate((element) => {
        const content = element.firstElementChild!;
        const outer = element.getBoundingClientRect();
        const prefix = content.firstElementChild!.getBoundingClientRect();
        const value = content.lastElementChild!.getBoundingClientRect();
        return { left: prefix.left - outer.left, gap: value.left - prefix.right, right: outer.right - value.right };
      });
      // Firefox DOMRects can differ by ~0.00003px; computed padding/gap above remain exact.
      expect(geometry.left).toBeCloseTo(8, 3);
      expect(geometry.gap).toBeCloseTo(6, 3);
      expect(geometry.right).toBeCloseTo(8, 3);
      await expect(chip.locator('button, [tabindex], [data-slot="ripple"], [data-slot="focus-ring"]')).toHaveCount(0);
      await expect(chip).not.toHaveAttribute('aria-pressed');
      if (mode === '라이트' && !high) {
        await expect(prefix).toHaveCSS('color', 'rgb(40, 127, 255)');
        await expect(value).toHaveCSS('color', 'rgb(31, 40, 45)');
        await expect(chip).toHaveCSS('background-color', 'rgb(255, 255, 255)');
        await expect(chip).toHaveCSS('box-shadow', 'rgb(201, 211, 219) 0px 0px 0px 1px inset');
      }
    }
  }
  await page.getByRole('navigation', { name: '주요 페이지' }).getByRole('link', { name: '컴포넌트 검증' }).click();
  await selectComponent(page, 'chip');
  const galleryChip = page.locator('#chip [data-chip-type="location"]');
  await galleryChip.scrollIntoViewIfNeeded();
  await expect(galleryChip.locator(':scope > span')).toHaveCSS('gap', '6px');
  await expect(galleryChip.locator(':scope > span')).toHaveCSS('padding', '4px 8px');
  await galleryChip.hover();
  await expect(galleryChip.locator('[data-slot="state-layer"], [data-slot="ripple"]')).toHaveCount(0);
});
