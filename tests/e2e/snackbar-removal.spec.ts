import { expect, test } from '@playwright/test';
import { selectComponent } from './gallery-navigation';

test('Snackbar 제거 후 저장 및 메뉴 결과는 화면 안에 남는다', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '테마 적용', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: '테마가 이 브라우저에 저장되었습니다.' })).toBeVisible();
  await page.getByRole('button', { name: '프로젝트 생성', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: '새 디자인 시스템 구성을 제출했습니다.' })).toBeVisible();
  await expect(page.locator('[role="dialog"][data-type]')).toHaveCount(0);
  await page.getByRole('link', { name: '컴포넌트 검증', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Snackbar', exact: true })).toHaveCount(0);
  await selectComponent(page, 'menu');
  await page.getByRole('button', { name: '검증용 Menu', exact: true }).click();
  await page.getByRole('menuitem', { name: '새 프로젝트', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('새 프로젝트 메뉴를 선택했습니다.');
  await selectComponent(page, 'button');
  await selectComponent(page, 'menu');
  await expect(page.getByRole('status')).toBeEmpty();
});
