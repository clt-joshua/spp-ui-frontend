import { expect, test } from '@playwright/test';
import { selectComponent } from './gallery-navigation';

test('Figma token bindings remain exact without contrast overrides', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Normal', exact: true }).click();
  await page.getByRole('button', { name: '라이트', exact: true }).click();
  await page.getByRole('checkbox', { name: '고대비 색상' }).uncheck();
  await page.getByRole('button', { name: '테마 적용', exact: true }).click();
  await page.getByRole('link', { name: '컴포넌트 검증', exact: true }).click();
  await selectComponent(page, 'text-field');
  const input = page.getByRole('textbox', { name: 'large text empty enabled', exact: true });
  await input.focus();
  const root = input.locator('xpath=ancestor::*[@data-text-field-variant]');
  await expect(root.locator('[data-slot="prefix"]')).toHaveCSS('color', 'rgb(118, 133, 146)');
  expect(await input.evaluate((element) => getComputedStyle(element, '::placeholder').color)).toBe('rgb(173, 186, 197)');
  await selectComponent(page, 'chip');
  await expect(page.locator('[data-level="systemWarning"]').first()).toHaveCSS('color', 'rgb(255, 253, 240)');
  await expect(page.locator('[data-level="systemGood"]').first()).toHaveCSS('background-color', 'rgb(0, 176, 155)');
  await expect(page.locator('[data-level="systemInfo"]').first()).toHaveCSS('background-color', 'rgb(40, 127, 255)');
  const compact = page.locator('[data-chip-type="filter"][data-size="x-small"][data-selected]');
  await expect(compact).toHaveCSS('color', 'rgb(31, 40, 45)');
  await page.reload();
  await expect(compact).toHaveCSS('color', 'rgb(31, 40, 45)');
  expect(await page.locator('html').evaluate((element) => getComputedStyle(element).getPropertyValue('--md-sys-color-on-selected-compact').trim())).toBe('');
});
