import { expect, test } from '@playwright/test';

const viewports = [
  { name: 'mobile-375x812', width: 375, height: 812 },
  { name: 'tablet-768x1024', width: 768, height: 1024 },
  { name: 'desktop-1440x900', width: 1440, height: 900 },
] as const;

const colorSchemes = ['light', 'dark'] as const;

test.beforeAll(() => {
  expect(
    process.platform,
    'Visual baseline must run in the pinned Playwright Linux container.',
  ).toBe('linux');
});

for (const viewport of viewports) {
  for (const colorScheme of colorSchemes) {
    test(`${viewport.name} ${colorScheme}`, async ({ page }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.emulateMedia({ colorScheme, reducedMotion: 'no-preference' });
      await page.goto('/');
      await page.evaluate(() => document.fonts.ready);

      await expect(page.locator('[data-app-root]')).toHaveScreenshot(
        `foundation-${viewport.name}-${colorScheme}.png`,
      );
    });
  }
}
