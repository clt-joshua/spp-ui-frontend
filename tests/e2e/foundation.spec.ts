import { expect, test } from '@playwright/test';

test('Vite 진입점에서 self-hosted UI foundation을 제공한다', async ({
  page,
}) => {
  const externalRequests = new Set<string>();

  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.origin !== 'http://127.0.0.1:4173') {
      externalRequests.add(url.origin);
    }
  });

  await page.goto('/');
  await expect(page).toHaveTitle('SPP UI Foundation');
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Vite 기반 React UI 시스템 준비 완료',
    }),
  ).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(3);

  await page.evaluate(() => document.fonts.ready);

  const bodyFont = await page.locator('body').evaluate((element) =>
    getComputedStyle(element).fontFamily,
  );
  const iconFont = await page
    .locator('.material-icons')
    .first()
    .evaluate((element) => getComputedStyle(element).fontFamily);

  expect(bodyFont).toContain('Roboto Variable');
  expect(iconFont).toContain('Material Icons');
  expect([...externalRequests]).toEqual([]);
});

test('좁은 viewport에서도 landmark와 콘텐츠가 손실되지 않는다', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');

  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('region', { name: '초기 기반 상태' })).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
