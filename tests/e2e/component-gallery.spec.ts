import { expect, test } from '@playwright/test';

test('State 표는 넓은 화면을 채우고 좁은 화면에서 내부 스크롤을 유지한다', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: '컴포넌트 검증', exact: true }).click();
  await expect(page.getByRole('table')).toHaveCount(6);

  for (const width of [375, 768, 1280, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    const geometry = await page.getByRole('table').evaluateAll((tables) => tables.map((table) => {
      const viewport = table.parentElement!;
      return {
        width: table.getBoundingClientRect().width,
        available: viewport.clientWidth,
        overflow: getComputedStyle(viewport).overflowX,
      };
    }));
    for (const table of geometry) {
      expect(table.width).toBeGreaterThanOrEqual(table.available - 1);
      expect(table.overflow).toBe('auto');
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  }
});
