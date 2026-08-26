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
  await page.emulateMedia({ reducedMotion: 'reduce' });

  const seedInput = page.locator('input[type="color"]');
  const seedPicker = seedInput.locator('..');
  const seedPreview = seedPicker.locator('span');
  await expect(seedPicker).toHaveCSS('width', '56px');
  await expect(seedPicker).toHaveCSS('height', '56px');
  await expect(seedPreview).toHaveCSS('background-color', 'rgb(103, 80, 164)');

  const textField = page.locator('input[aria-label="16진수 시드 색상"]');
  const textFieldControl = textField.locator('xpath=ancestor::*[@data-slot="text-field-control"]');
  const select = page.getByRole('combobox', { name: '대상 플랫폼' });
  expect((await textFieldControl.boundingBox())?.height).toBe(56);
  const supportingText = page.getByText('나중에 언제든 변경할 수 있습니다.', { exact: true });
  const supportingBox = await supportingText.boundingBox();
  const projectInput = page.getByRole('textbox', { name: '프로젝트 이름' });
  const projectFieldControl = projectInput.locator('xpath=ancestor::*[@data-slot="text-field-control"]');
  const projectFieldControlBox = await projectFieldControl.boundingBox();
  const projectFloatingLabel = projectFieldControl.locator('[data-slot="floating-label"]');
  const projectLeadingIcon = projectFieldControl.locator('.material-icons').first();
  const projectFloatingLabelBox = await projectFloatingLabel.boundingBox();
  const projectLeadingIconBox = await projectLeadingIcon.boundingBox();
  const outlineNotch = projectFieldControl.locator('[data-slot="outline-notch"]');
  const outlineLabel = projectFieldControl.locator('[data-slot="outline-label"]');
  expect(supportingBox).not.toBeNull();
  expect(projectFieldControlBox).not.toBeNull();
  expect(projectFloatingLabelBox).not.toBeNull();
  expect(projectLeadingIconBox).not.toBeNull();
  expect(projectFloatingLabelBox!.x - projectFieldControlBox!.x).toBe(16);
  expect(projectLeadingIconBox!.x - projectFieldControlBox!.x).toBe(12);
  const outlineNotchBox = await outlineNotch.boundingBox();
  const outlineLabelBox = await outlineLabel.boundingBox();
  expect(outlineNotchBox).not.toBeNull();
  expect(outlineLabelBox).not.toBeNull();
  expect(outlineLabelBox!.x - outlineNotchBox!.x).toBe(4);
  expect(
    outlineNotchBox!.x + outlineNotchBox!.width
      - (outlineLabelBox!.x + outlineLabelBox!.width),
  ).toBe(4);
  expect(supportingBox!.y).toBe(projectFieldControlBox!.y + projectFieldControlBox!.height);
  expect(supportingBox!.height).toBe(20);
  await expect(supportingText).toHaveCSS('padding-top', '4px');
  await expect(supportingText).toHaveCSS('padding-left', '16px');
  await expect(supportingText).toHaveCSS('padding-right', '16px');
  await expect(supportingText).toHaveCSS('font-size', '12px');
  await expect(supportingText).toHaveCSS('font-weight', '400');
  await expect(supportingText).toHaveCSS('line-height', '16px');
  await projectInput.fill('');
  await page.getByRole('button', { name: '구성 검토' }).focus();
  await page.waitForTimeout(200);
  const restingLabel = projectFieldControl.locator('[data-slot="resting-label"]');
  const floatingLabel = projectFieldControl.locator('[data-slot="floating-label"]');
  await expect(restingLabel).toHaveCSS('opacity', '1');
  await expect(floatingLabel).toHaveCSS('opacity', '0');
  const labelAnimation = await projectFieldControl.evaluate(async (control) => {
    const input = control.querySelector('input');
    const label = control.querySelector<HTMLElement>('[data-slot="floating-label"]');
    input?.focus();
    await new Promise(requestAnimationFrame);
    const animation = label?.getAnimations()[0];
    const timing = animation?.effect?.getTiming();
    return { duration: timing?.duration, easing: timing?.easing };
  });
  expect(labelAnimation.duration).toBe(150);
  expect(labelAnimation.easing).toBe('cubic-bezier(0.2, 0, 0, 1)');
  expect(await projectFieldControl.locator('[data-slot="outline-start"]').evaluate((element) => ({
    opacity: getComputedStyle(element, '::after').opacity,
    width: getComputedStyle(element, '::after').borderTopWidth,
  }))).toEqual({ opacity: '1', width: '3px' });
  await expect(restingLabel).toHaveCSS('opacity', '0');
  await expect(floatingLabel).toHaveCSS('opacity', '1');
  await projectInput.fill('');
  await page.getByRole('button', { name: '구성 검토' }).focus();
  await page.waitForTimeout(200);
  const restingLabelBox = await restingLabel.boundingBox();
  expect(restingLabelBox).not.toBeNull();
  expect(restingLabelBox!.x - (projectLeadingIconBox!.x + projectLeadingIconBox!.width)).toBe(16);
  const selectBox = await select.boundingBox();
  const selectValueBox = await select.getByText('Web application', { exact: true }).boundingBox();
  expect(selectBox?.height).toBe(56);
  expect(selectValueBox).not.toBeNull();
  expect(Math.abs(
    selectBox!.y + selectBox!.height / 2
      - (selectValueBox!.y + selectValueBox!.height / 2),
  )).toBeLessThanOrEqual(1);

  await select.click();
  const selectPopup = page.getByRole('listbox');
  const selectPopupSurface = selectPopup.locator('..');
  const selectPopupPositionedShell = selectPopup.locator(
    'xpath=ancestor::*[@data-menu-motion-side]',
  );
  await expect(selectPopup).toBeAttached();
  await page.waitForTimeout(60);
  const selectPopupOpeningBox = await selectPopupSurface.boundingBox();
  expect(selectPopupOpeningBox).not.toBeNull();
  expect(selectPopupOpeningBox!.height).toBeGreaterThan(0);
  await expect(selectPopupPositionedShell).not.toHaveAttribute('data-menu-motion-pending', '');
  await expect(selectPopup).toBeVisible();
  await expect(selectPopupPositionedShell).toHaveAttribute('data-side', 'bottom');
  const selectPopupAnimationDurations = await selectPopupSurface.evaluate((element) => (
    element.getAnimations().map((animation) => animation.effect?.getTiming().duration)
  ));
  expect(selectPopupAnimationDurations).toContain(500);
  expect(await selectPopupSurface.evaluate((element) => (
    getComputedStyle(element).getPropertyValue('--md-menu-open-surface-opacity-duration').trim()
  ))).toBe('50ms');
  const selectOptionAnimations = await selectPopup.getByRole('option').evaluateAll((options) => (
    options.map((option) => option.getAnimations().map((animation) => ({
      delay: animation.effect?.getTiming().delay,
      duration: animation.effect?.getTiming().duration,
    })))
  ));
  expect(selectOptionAnimations.every((animations) => (
    animations.some((animation) => animation.duration === 250)
  ))).toBe(true);
  expect(selectOptionAnimations[1]?.some((animation) => Number(animation.delay) > 0)).toBe(true);
  await expect.poll(() => selectPopup.getByRole('option').evaluateAll((options) => (
    options.map((option) => getComputedStyle(option).opacity)
  ))).toEqual(['1', '1', '1']);
  await expect.poll(() => selectPopup.getByRole('option').evaluateAll((options) => (
    options.map((option) => option.getBoundingClientRect().height)
  ))).toEqual([56, 56, 56]);
  await expect(selectPopup.locator('.material-icons')).toHaveCount(0);
  await expect(selectPopup.getByRole('option', { name: 'Web application' })).toBeFocused();
  expect(await selectPopup.getByRole('option', { name: 'Web application' }).evaluate(
    (option) => getComputedStyle(option).boxShadow,
  )).toContain('inset');
  const selectPopupBox = await selectPopupSurface.boundingBox();
  expect(selectPopupBox).not.toBeNull();
  expect(Math.abs(selectPopupBox!.y - (selectBox!.y + selectBox!.height))).toBeLessThanOrEqual(1);
  await page.keyboard.press('Escape');
  await expect(selectPopup).toBeHidden();

  await select.click();
  await expect(selectPopup).toBeVisible();
  await expect.poll(() => selectPopup.getByRole('option').evaluateAll((options) => (
    options.map((option) => getComputedStyle(option).opacity)
  ))).toEqual(['1', '1', '1']);
  await expect(selectPopup.getByRole('option', { name: 'Web application' })).toBeVisible();
  await expect(selectPopup.getByRole('option', { name: 'Desktop application' })).toBeVisible();
  await expect(selectPopup.getByRole('option', { name: 'Mobile application' })).toBeVisible();
  await select.click();
  await page.waitForTimeout(25);
  await select.click();
  await page.waitForTimeout(60);
  const rapidlyReopenedBox = await selectPopupSurface.boundingBox();
  expect(rapidlyReopenedBox).not.toBeNull();
  expect(rapidlyReopenedBox!.height).toBeGreaterThan(0);
  await expect(selectPopupPositionedShell).not.toHaveAttribute('data-menu-motion-pending', '');
  await expect(selectPopup.getByRole('option', { name: 'Desktop application' })).toBeVisible();
  await page.keyboard.press('Escape');

  const checkbox = page.getByRole('checkbox', { name: '변경 알림 받기' });
  const checkboxLabel = page.getByText('변경 알림 받기', { exact: true });
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
  await expect(wave).not.toHaveCSS('animation-name', 'none');
  await expect(wave).toHaveCSS('animation-duration', '0.45s');
  const rippleSurface = wave.locator('> span');
  await expect(rippleSurface).not.toHaveCSS('animation-name', 'none');
  await expect(rippleSurface).toHaveCSS('animation-duration', '0.105s');
  expect(Number(await rippleSurface.evaluate((element) => getComputedStyle(element).opacity))).toBeGreaterThan(0);
  await page.mouse.up();
  await page.waitForTimeout(100);
  await expect(wave).toHaveCount(1);
  await expect(rippleSurface).toHaveCSS('transition-duration', '0.375s');
  await expect(wave).toHaveCount(0, { timeout: 1_000 });

  const animatedCheckbox = checkbox;
  const checkboxIndicator = animatedCheckbox.locator('svg').locator('..');
  const checkboxLongMark = animatedCheckbox.locator('svg rect').last();
  await animatedCheckbox.click();
  await expect(checkboxIndicator).toHaveCSS('transition-duration', '0.15s, 0.05s');
  await animatedCheckbox.click();
  await expect(checkboxIndicator).toHaveCSS('transition-duration', '0.35s, 0.05s');
  await expect(checkboxLongMark).toHaveCSS('transition-duration', '0.35s');
  await expect(checkboxLongMark).toHaveCSS('animation-name', /checkbox-mark-enter/);
  expect(Number.parseFloat(await checkboxLongMark.evaluate(
    (element) => getComputedStyle(element).width,
  ))).toBeGreaterThan(11);
});

test('Select는 하단 공간이 부족하면 최종 상향 배치 후 anchor를 유지하며 열린다', async ({ page }) => {
  await page.setViewportSize({ width: 832, height: 480 });
  await page.goto('/');

  const select = page.getByRole('combobox', { name: '대상 플랫폼' });
  await select.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const targetTop = window.innerHeight - (element as HTMLElement).offsetHeight - 16;
    window.scrollTo({ top: window.scrollY + rect.top - targetTop });
  });
  await select.focus();

  const triggerBeforeOpen = await select.boundingBox();
  const scrollBeforeOpen = await page.evaluate(() => window.scrollY);
  expect(triggerBeforeOpen).not.toBeNull();
  expect(triggerBeforeOpen!.y + triggerBeforeOpen!.height).toBeGreaterThan(450);

  await page.keyboard.press('Enter');
  const listbox = page.getByRole('listbox');
  const surface = listbox.locator('..');
  const popup = listbox.locator('xpath=ancestor::*[@data-menu-motion-side]');
  await expect(popup).toHaveAttribute('data-side', 'top');
  await expect(popup).toHaveAttribute('data-menu-motion-side', 'top');
  await expect(popup).not.toHaveAttribute('data-menu-motion-pending', '');
  await expect(listbox.getByRole('option', { name: 'Web application' })).not.toBeFocused();
  expect(await popup.evaluate((element) => element.getAnimations().some((animation) => (
    (animation.effect as KeyframeEffect | null)?.getKeyframes().some((keyframe) => (
      typeof keyframe.transform === 'string' && keyframe.transform !== 'none'
    ))
  )))).toBe(false);
  expect(await listbox.evaluate((element) => element.getAnimations().some((animation) => (
    (animation.effect as KeyframeEffect | null)?.getKeyframes().some((keyframe) => (
      typeof keyframe.transform === 'string' && keyframe.transform.startsWith('translateY(')
    ))
  )))).toBe(true);

  const openingSamples: Array<{ bottomGap: number; height: number; side: string | null }> = [];
  for (const delay of [60, 120, 180]) {
    await page.waitForTimeout(delay);
    openingSamples.push(await popup.evaluate((element) => {
      const trigger = document.querySelector<HTMLElement>('[role="combobox"]');
      const popupRect = element.getBoundingClientRect();
      const surface = element.querySelector<HTMLElement>('[data-slot="menu-surface"]');
      const triggerRect = trigger?.getBoundingClientRect();
      return {
        bottomGap: triggerRect ? Math.abs(popupRect.bottom - triggerRect.top) : Number.POSITIVE_INFINITY,
        height: surface?.getBoundingClientRect().height ?? 0,
        side: element.getAttribute('data-side'),
      };
    }));
  }

  expect(openingSamples.every((sample) => sample.side === 'top')).toBe(true);
  expect(openingSamples.every((sample) => sample.bottomGap <= 1)).toBe(true);
  expect(openingSamples[1]!.height).toBeGreaterThanOrEqual(openingSamples[0]!.height);
  expect(openingSamples[2]!.height).toBeGreaterThanOrEqual(openingSamples[1]!.height);
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollBeforeOpen);

  await expect.poll(() => listbox.getByRole('option').evaluateAll((options) => (
    options.map((option) => getComputedStyle(option).opacity)
  ))).toEqual(['1', '1', '1']);
  await expect(listbox.getByRole('option', { name: 'Web application' })).toBeFocused();
  const settledPopup = await popup.boundingBox();
  const settledSurface = await surface.boundingBox();
  const settledTrigger = await select.boundingBox();
  expect(settledPopup).not.toBeNull();
  expect(settledSurface?.height).toBe(184);
  expect(settledTrigger).not.toBeNull();
  expect(Math.abs(settledPopup!.y + settledPopup!.height - settledTrigger!.y)).toBeLessThanOrEqual(1);
  await page.keyboard.press('Escape');
  await expect(listbox).toBeHidden();
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
  const submenuIcon = page.getByRole('menuitem', { name: '도움말' }).locator('.material-icons');
  expect(await menuItem.evaluate((element) => (
    getComputedStyle(element).getPropertyValue('--md-menu-list-item-trailing-icon-size').trim()
  ))).toBe('1.5rem');
  await expect(submenuIcon).toHaveCSS('width', '24px');
  await expect(submenuIcon).toHaveCSS('height', '24px');
  await expect(submenuIcon).toHaveCSS('font-size', '24px');
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
