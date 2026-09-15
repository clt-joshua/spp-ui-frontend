import { expect } from '@playwright/test';

export async function selectComponent(page, id) {
  await expect(page.getByRole('heading', { level: 1, name: '컴포넌트 검증', exact: true })).toBeVisible();
  const link = page.locator('nav[aria-label="컴포넌트 목록"] a[href="#' + id + '"]');
  if (await link.isVisible()) await link.click();
  else {
    const label = await link.textContent();
    await page.getByRole('combobox', { name: '컴포넌트 선택', exact: true }).click();
    await page.getByRole('option', { name: label.trim(), exact: true }).click();
  }
  await expect(page.locator('[data-gallery-component]')).toHaveAttribute('data-gallery-component', id);
}
