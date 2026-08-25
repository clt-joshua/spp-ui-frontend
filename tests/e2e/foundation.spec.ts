import axeCore from 'axe-core';
import { expect, test } from '@playwright/test';

test('Theme Lab이 self-hosted M3 제품 흐름을 제공한다', async ({ page }) => {
  const externalRequests = new Set<string>();
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.origin !== 'http://127.0.0.1:4173') externalRequests.add(url.origin);
  });

  await page.goto('/');
  await expect(page).toHaveTitle('SPP UI Theme Lab');
  await expect(page.getByRole('heading', { level: 1, name: '테마 설정' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: '제품 흐름에서 확인하는 Material 3' })).toBeVisible();

  await page.evaluate(() => document.fonts.ready);
  const bodyFont = await page.locator('body').evaluate((element) => getComputedStyle(element).fontFamily);
  const iconFont = await page.locator('.material-icons').first().evaluate((element) => getComputedStyle(element).fontFamily);
  expect(bodyFont).toContain('Roboto Variable');
  expect(iconFont).toContain('Material Icons');
  expect([...externalRequests]).toEqual([]);
});

test('테마 preview, 저장, reload 흐름이 document root까지 이어진다', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Ocean' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme-id', 'ocean');
  const previewPrimary = await page.locator('html').evaluate((element) => getComputedStyle(element).getPropertyValue('--md-sys-color-primary'));

  await page.getByRole('button', { name: '테마 적용' }).click();
  await expect(page.getByText('테마가 이 브라우저에 저장되었습니다.')).toBeVisible();
  await page.reload();

  await expect(page.getByRole('button', { name: 'Ocean' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('html')).toHaveAttribute('data-theme-id', 'ocean');
  expect(await page.locator('html').evaluate((element) => getComputedStyle(element).getPropertyValue('--md-sys-color-primary'))).toBe(previewPrimary);
});

test('폼, Select, Dialog, Snackbar의 대표 keyboard 경로가 동작한다', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('combobox', { name: '대상 플랫폼' }).click();
  await page.getByRole('option', { name: 'Desktop application' }).click();
  await expect(page.getByRole('combobox', { name: '대상 플랫폼' })).toContainText('Desktop application');

  await page.getByRole('button', { name: '구성 검토' }).click();
  const dialog = page.getByRole('dialog', { name: '프로젝트 구성을 저장할까요?' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('desktop');
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('button', { name: '구성 검토' })).toBeFocused();

  await page.getByRole('button', { name: '프로젝트 생성' }).click();
  await expect(page.getByText('새 디자인 시스템 구성을 저장했습니다.')).toBeVisible();

  const menuTrigger = page.getByRole('button', { name: 'Theme Lab 메뉴' });
  await menuTrigger.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('menuitemcheckbox', { name: '컴팩트 미리보기' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menuTrigger).toBeFocused();
});

test('M3 필드, checkbox 정렬과 빠른 클릭 ripple이 실제 화면에서 유지된다', async ({ page }) => {
  await page.goto('/');

  const seedInput = page.locator('input[type="color"]');
  const seedPicker = seedInput.locator('..');
  const seedPreview = seedPicker.locator('span');
  await expect(seedPicker).toHaveCSS('width', '56px');
  await expect(seedPicker).toHaveCSS('height', '56px');
  await expect(seedPreview).toHaveCSS('background-color', 'rgb(103, 80, 164)');

  const textField = page.locator('input[aria-label="16진수 시드 색상"]');
  const textFieldControl = textField.locator('..').locator('..');
  const select = page.getByRole('combobox', { name: '대상 플랫폼' });
  expect((await textFieldControl.boundingBox())?.height).toBe(56);
  const supportingText = page.getByText('나중에 언제든 변경할 수 있습니다.', { exact: true });
  const supportingBox = await supportingText.boundingBox();
  const projectFieldControl = page.getByRole('textbox', { name: '프로젝트 이름' }).locator('..').locator('..');
  const projectFieldControlBox = await projectFieldControl.boundingBox();
  expect(supportingBox).not.toBeNull();
  expect(projectFieldControlBox).not.toBeNull();
  expect(supportingBox!.y).toBe(projectFieldControlBox!.y + projectFieldControlBox!.height);
  expect(supportingBox!.height).toBe(20);
  await expect(supportingText).toHaveCSS('padding-top', '4px');
  await expect(supportingText).toHaveCSS('padding-left', '16px');
  await expect(supportingText).toHaveCSS('padding-right', '16px');
  await expect(supportingText).toHaveCSS('font-size', '12px');
  await expect(supportingText).toHaveCSS('font-weight', '400');
  await expect(supportingText).toHaveCSS('line-height', '16px');
  await page.getByRole('textbox', { name: '프로젝트 이름' }).focus();
  await expect(projectFieldControl.locator('fieldset')).toHaveCSS('border-top-width', '3px');
  const selectBox = await select.boundingBox();
  const selectValueBox = await select.getByText('Web application', { exact: true }).boundingBox();
  expect(selectBox?.height).toBe(56);
  expect(selectValueBox).not.toBeNull();
  expect(Math.abs(
    selectBox!.y + selectBox!.height / 2
      - (selectValueBox!.y + selectValueBox!.height / 2),
  )).toBeLessThanOrEqual(1);

  const checkbox = page.getByRole('checkbox', { name: '고대비 색상' });
  const checkboxLabel = page.getByText('고대비 색상', { exact: true });
  const checkboxBox = await checkbox.boundingBox();
  const checkboxLabelBox = await checkboxLabel.boundingBox();
  expect(checkboxBox).not.toBeNull();
  expect(checkboxLabelBox).not.toBeNull();
  expect(checkboxBox!.width).toBe(18);
  expect(checkboxBox!.height).toBe(18);
  const checkboxMarkBox = await checkbox.locator('svg').boundingBox();
  expect(checkboxMarkBox?.width).toBe(18);
  expect(checkboxMarkBox?.height).toBe(18);
  expect(checkboxMarkBox?.x).toBe(checkboxBox?.x);
  expect(checkboxMarkBox?.y).toBe(checkboxBox?.y);
  expect(checkboxLabelBox!.x - checkboxBox!.x).toBe(33);
  expect(Math.abs(
    checkboxBox!.y + checkboxBox!.height / 2
      - (checkboxLabelBox!.y + checkboxLabelBox!.height / 2),
  )).toBeLessThanOrEqual(1);

  for (const name of ['Filled', 'Tonal', 'Elevated', 'Outlined', 'Text']) {
    const sample = page.getByRole('button', { name, exact: true });
    await expect(sample).toHaveCSS('font-size', '14px');
    await expect(sample).toHaveCSS('font-weight', '500');
    await expect(sample).toHaveCSS('line-height', '20px');
  }

  const leadingIconButton = page.getByRole('button', { name: '테마 적용' });
  const trailingIconButton = page.getByRole('button', { name: '프로젝트 생성' });
  const dialogTriggerButton = page.getByRole('button', { name: '구성 검토' });
  await expect(dialogTriggerButton).toHaveCSS('font-size', '14px');
  await expect(dialogTriggerButton).toHaveCSS('font-weight', '500');
  await expect(dialogTriggerButton).toHaveCSS('line-height', '20px');
  await expect(leadingIconButton).toHaveCSS('padding-left', '16px');
  await expect(leadingIconButton).toHaveCSS('padding-right', '24px');
  await expect(trailingIconButton).toHaveCSS('padding-left', '24px');
  await expect(trailingIconButton).toHaveCSS('padding-right', '16px');
  await expect(leadingIconButton.locator('.material-icons')).toHaveCSS('font-size', '18px');
  await expect(trailingIconButton.locator('.material-icons')).toHaveCSS('font-size', '18px');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  const button = page.getByRole('button', { name: 'Filled', exact: true });
  const buttonBox = await button.boundingBox();
  expect(buttonBox).not.toBeNull();
  await page.mouse.move(
    buttonBox!.x + buttonBox!.width / 2,
    buttonBox!.y + buttonBox!.height / 2,
  );
  await page.mouse.down();
  const wave = button.locator('[data-slot="ripple"] > span');
  await page.waitForTimeout(20);
  await expect(wave).toHaveCount(1);
  await expect(wave).not.toHaveCSS('display', 'none');
  await expect(wave).toHaveCSS('animation-name', 'none');
  expect(Number(await wave.evaluate((element) => getComputedStyle(element).opacity))).toBeGreaterThan(0);
  await page.mouse.up();
  await expect(wave).toHaveCount(0, { timeout: 1_000 });
});

test('Dialog, Menu, Snackbar의 MD3 typography와 container 값이 유지된다', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: '구성 검토' }).click();
  const dialog = page.getByRole('dialog', { name: '프로젝트 구성을 저장할까요?' });
  await expect(dialog).toHaveCSS('width', '560px');
  await expect(dialog).toHaveCSS('border-radius', '28px');
  const dialogDescription = dialog.locator('p').first();
  await expect(dialogDescription).toHaveCSS('font-size', '14px');
  await expect(dialogDescription).toHaveCSS('line-height', '20px');
  await page.keyboard.press('Escape');

  await page.getByRole('button', { name: 'Theme Lab 메뉴' }).click();
  const menuItem = page.getByRole('menuitemcheckbox', { name: '컴팩트 미리보기' });
  await expect(menuItem).toHaveCSS('height', '48px');
  await expect(menuItem).toHaveCSS('font-size', '16px');
  await expect(menuItem).toHaveCSS('line-height', '24px');
  await page.keyboard.press('Escape');

  await page.getByRole('button', { name: '프로젝트 생성' }).click();
  const snackbarText = page.getByText('새 디자인 시스템 구성을 저장했습니다.');
  const snackbar = snackbarText.locator('..').locator('..');
  await expect(snackbarText).toHaveCSS('margin', '0px');
  await expect(snackbarText).toHaveCSS('font-size', '14px');
  await expect(snackbarText).toHaveCSS('line-height', '20px');
  await expect(snackbar).toHaveCSS('height', '48px');
});

test('중대 접근성 위반과 좁은 viewport overflow가 없다', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.addScriptTag({ content: axeCore.source });

  const violations = await page.evaluate(async () => {
    const axe = (globalThis as unknown as { axe: { run(): Promise<{ violations: Array<{ id: string; impact: string | null }> }> } }).axe;
    const result = await axe.run();
    return result.violations.filter((violation) => violation.impact === 'critical' || violation.impact === 'serious');
  });
  expect(violations).toEqual([]);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
