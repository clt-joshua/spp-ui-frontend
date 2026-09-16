import { expect, test } from '@playwright/test';
import { selectComponent } from './gallery-navigation';

const entries = [
  ['button', 'Button'], ['icon-button', 'IconButton'], ['tabs', 'Tabs'],
  ['segmented-button', 'SegmentedButton'], ['text-field', 'TextField'], ['select', 'Select'],
  ['autocomplete', 'AutoComplete'], ['checkbox', 'Checkbox'], ['radio', 'Radio'], ['switch', 'Switch'],
  ['chip', 'Chip'], ['dialog', 'Dialog'], ['menu', 'Menu'], ['data-grid', 'DataGrid'],
] as const;

test('14개 컴포넌트를 하나씩 탐색하며 상태와 팝업을 정리한다', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: '컴포넌트 검증', exact: true }).click();
  await expect(page).toHaveURL(/#button$/);
  const navigation = page.getByRole('navigation', { name: '컴포넌트 목록', exact: true });
  await expect(navigation.getByRole('link')).toHaveCount(14);
  for (const [id, label] of entries) {
    await selectComponent(page, id);
    await expect(page.locator('[data-gallery-component]')).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 2, name: label, exact: true })).toBeVisible();
    await expect(navigation.locator('[aria-current="page"]')).toHaveText(label);
  }
  await selectComponent(page, 'checkbox');
  const checkbox = page.getByRole('checkbox', { name: 'large Controlled', exact: true });
  await checkbox.uncheck();
  await selectComponent(page, 'radio');
  await selectComponent(page, 'checkbox');
  await expect(checkbox).toBeChecked();
  await expect(page.locator('#component-title')).toBeFocused();
  await page.goBack();
  await expect(page.locator('[data-gallery-component]')).toHaveAttribute('data-gallery-component', 'radio');
  await page.goForward();
  await expect(checkbox).toBeChecked();
  await page.reload();
  await expect(checkbox).toBeChecked();
  await selectComponent(page, 'dialog');
  await page.getByRole('button', { name: '기본 Dialog 열기', exact: true }).click();
  await expect(page.getByRole('dialog', { name: '기본 Dialog', exact: true })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('dialog', { name: '기본 Dialog', exact: true })).toHaveCount(0);
  await expect(checkbox).toBeVisible();
});

test('기존 주소와 잘못된 주소를 정규화하고 테마를 유지한다', async ({ page }) => {
  const aliases: Record<string, string> = {
    actions: 'button', navigation: 'tabs', 'form-fields': 'text-field', inputs: 'text-field',
    'selection-controls': 'checkbox', chips: 'chip', dialogs: 'dialog', overlays: 'dialog',
    menus: 'menu', feedback: 'button', snackbar: 'button', unknown: 'button', '': 'button',
  };
  for (const [alias, id] of Object.entries(aliases)) {
    await page.goto('/components#' + alias);
    await expect(page).toHaveURL(new RegExp('#' + id + '$'));
    await expect(page.locator('[data-gallery-component]')).toHaveAttribute('data-gallery-component', id);
  }
  await page.goto('/');
  await page.getByRole('button', { name: '다크', exact: true }).click();
  await page.getByRole('button', { name: '테마 적용', exact: true }).click();
  await page.getByRole('link', { name: '컴포넌트 검증', exact: true }).click();
  await selectComponent(page, 'chip');
  await expect(page.locator('html')).toHaveAttribute('data-color-scheme', 'dark');
});

test('State 표와 모바일 컴포넌트 선택은 좁은 화면에서 overflow 없이 동작한다', async ({ page }) => {
  await page.goto('/components#button');
  for (const width of [375, 768, 1280, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const component of ['button', 'icon-button']) {
      await selectComponent(page, component);
      await expect(page.getByRole('table')).toHaveCount(3);
      const geometry = await page.getByRole('table').evaluateAll((tables) => tables.map((table) => ({
        width: table.getBoundingClientRect().width,
        available: table.parentElement!.clientWidth,
        overflow: getComputedStyle(table.parentElement!).overflowX,
      })));
      for (const table of geometry) {
        expect(table.width).toBeGreaterThanOrEqual(table.available - 1);
        expect(table.overflow).toBe('auto');
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
    }
  }
  await page.setViewportSize({ width: 375, height: 900 });
  await selectComponent(page, 'chip');
  await expect(page.locator('#component-title')).toBeFocused();
  await expect(page.getByRole('combobox', { name: '컴포넌트 선택', exact: true })).toContainText('Chip');
  await expect(page.getByRole('navigation', { name: '컴포넌트 목록', exact: true })).toBeHidden();
});
