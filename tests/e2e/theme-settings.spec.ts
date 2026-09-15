import { expect, test } from '@playwright/test';

test('공용 테마 설정과 공통 헤더가 preview, 취소, 저장, 페이지 이동을 지원한다', async ({ page }) => {
  const warnings: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') warnings.push(message.text());
  });
  await page.goto('/');
  const navigation = page.getByRole('navigation', { name: '주요 페이지' });
  await expect(navigation.getByRole('link', { name: 'Theme Lab', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByRole('banner').getByRole('button')).toHaveCount(0);
  const modes = page.getByRole('group', { name: '화면 모드', exact: true });
  await expect(modes).toHaveAttribute('data-selection-mode', 'single');
  const blue = page.getByRole('button', { name: 'Blue', exact: true });
  await blue.click();
  await expect(blue).toHaveAttribute('data-button-variant', 'tonal');
  await expect(blue).toHaveAttribute('aria-pressed', 'true');
  await modes.getByRole('button', { name: '다크', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-color-scheme', 'dark');
  await page.getByRole('button', { name: '취소', exact: true }).click();
  await expect(page.locator('html')).not.toHaveAttribute('data-theme-id', 'blue');
  await page.getByLabel('시드 색상 선택', { exact: true }).fill('#336699');
  await expect(page.getByRole('textbox', { name: '16진수 시드 색상' })).toHaveValue('#336699');
  await page.getByRole('button', { name: '테마 적용', exact: true }).click();
  await navigation.getByRole('link', { name: '컴포넌트 검증', exact: true }).click();
  await expect(navigation.getByRole('link', { name: '컴포넌트 검증', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('html')).toHaveAttribute('data-theme-id', 'custom');
  await expect(page.getByRole('banner').getByRole('button')).toHaveCount(0);
  await navigation.getByRole('link', { name: 'Theme Lab', exact: true }).click();
  await expect(page.getByRole('textbox', { name: '16진수 시드 색상' })).toHaveValue('#336699');
  for (const width of [375, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(navigation).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
    expect(await modes.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(0);
    const picker = await page.getByLabel('시드 색상 선택', { exact: true }).locator('xpath=ancestor::*[@data-slot="text-field-control"]').boundingBox();
    const hex = await page.getByRole('textbox', { name: '16진수 시드 색상' }).locator('xpath=ancestor::*[@data-slot="text-field-control"]').boundingBox();
    expect(picker!.x + picker!.width).toBeLessThan(hex!.x);
  }
  expect(warnings).toEqual([]);
});
