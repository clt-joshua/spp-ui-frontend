import { expect, type Page } from '@playwright/test';

export async function selectComponent(page: Page, id: string) {
  // A full-page link can resolve before React mounts the responsive navigation.
  await expect(page.getByRole('heading', { level: 1, name: '컴포넌트 검증', exact: true })).toBeVisible();
  const link = page.getByRole('navigation', { name: '컴포넌트 목록', exact: true }).locator('a[href="#' + id + '"]');
  if (await link.isVisible()) {
    await link.click();
  } else {
    const select = page.getByRole('combobox', { name: '컴포넌트 선택', exact: true });
    const labels: Record<string, string> = {
      button: 'Button', 'icon-button': 'IconButton', tabs: 'Tabs', 'segmented-button': 'SegmentedButton',
      'text-field': 'TextField', select: 'Select', autocomplete: 'AutoComplete', checkbox: 'Checkbox',
      radio: 'Radio', switch: 'Switch', chip: 'Chip', dialog: 'Dialog', menu: 'Menu',
    };
    await select.click();
    await page.getByRole('option', { name: labels[id], exact: true }).click();
  }
  await expect(page.locator('[data-gallery-component]')).toHaveAttribute('data-gallery-component', id);
}
