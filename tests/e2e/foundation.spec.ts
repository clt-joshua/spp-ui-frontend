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
  expect(bodyFont).toContain('Noto Sans Variable');
  expect(iconFont).toContain('Material Icons');
  const applyButton = page.getByRole('button', { name: '테마 적용' });
  await expect(applyButton).toHaveCSS('font-family', /Noto Sans Variable/u);
  await expect(applyButton).toHaveCSS('font-size', '14px');
  await expect(applyButton).toHaveCSS('font-weight', '500');
  await expect(applyButton).toHaveCSS('letter-spacing', '0.1px');
  await expect(applyButton).toHaveCSS('line-height', '20px');
  await expect(applyButton).toHaveCSS('text-decoration-line', 'none');
  await expect(applyButton).toHaveCSS('padding-left', '20px');
  await expect(applyButton).toHaveCSS('padding-right', '20px');
  await expect(applyButton).toHaveCSS('border-radius', '999px');
  await expect(page.getByRole('button', { name: 'Elevated' })).toHaveCSS(
    'box-shadow',
    /rgba\(0, 0, 0, 0\.12\) 0px 1px 3px 1px, rgba\(0, 0, 0, 0\.32\) 0px 1px 2px 0px/u,
  );
  expect([...externalRequests]).toEqual([]);
});

test('별도 컴포넌트 검증 페이지에서 전체 inventory와 실제 상태를 확인한다', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: '컴포넌트 검증' }).click();

  await expect(page).toHaveURL(/\/components$/u);
  await expect(page).toHaveTitle('SPP UI Component Verification');
  await expect(page.getByRole('heading', { level: 1, name: '컴포넌트 검증' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Actions' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Navigation' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Form fields' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Selection controls' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Chips' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Dialogs' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Menus' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Feedback' })).toBeVisible();
  await expect(page.getByText('Components', { exact: true }).locator('..').locator('strong')).toHaveText('13');
  await expect(page.getByText('Groups', { exact: true }).locator('..').locator('strong')).toHaveText('8');
  await expect(page.getByRole('navigation', { name: '컴포넌트 그룹' }).getByRole('link')).toHaveCount(8);
  await expect(page.locator('#inputs')).toHaveCount(1);
  await expect(page.locator('#overlays')).toHaveCount(1);

  const filterSet = page.getByRole('toolbar', { name: 'large Filter states' });
  const filter = filterSet.getByRole('button', { name: 'Label' }).first();
  await expect(filter).toHaveAttribute('aria-pressed', 'false');
  await filter.click();
  await expect(filter).toHaveAttribute('aria-pressed', 'true');

  const inputSet = page.getByRole('toolbar', { name: 'large Input states' });
  const removeInput = inputSet.getByRole('button', { name: 'Gallery Input chip 삭제' });
  await removeInput.click();
  await expect(removeInput).toBeHidden();
  await page.getByRole('button', { name: 'Input Chip 다시 표시' }).click();
  await expect(inputSet.getByRole('button', { name: 'Gallery Input chip 삭제' })).toBeVisible();

  const location = page.locator('[data-chip-type="location"]');
  await expect(location).toContainText('X6.058m');
  await expect(location.locator('button')).toHaveCount(0);

  const dialogTrigger = page.getByRole('button', { name: '기본 Dialog 열기' });
  await dialogTrigger.click();
  await expect(page.getByRole('dialog', { name: '기본 Dialog' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialogTrigger).toBeFocused();

  await page.getByRole('button', { name: 'Success' }).click();
  await expect(page.getByText('변경 사항을 저장했습니다.')).toBeVisible();

  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});

test('Tabs는 Figma anatomy와 MD3 manual activation 및 panel 연결을 유지한다', async ({ page }) => {
  await page.goto('/components');

  const tablist = page.getByRole('tablist', { name: '디자인 시스템 문서' });
  const overview = tablist.getByRole('tab', { name: 'Overview' });
  const tokens = tablist.getByRole('tab', { name: 'Tokens' });
  const behavior = tablist.getByRole('tab', { name: 'Behavior' });
  const disabled = tablist.getByRole('tab', { name: 'Disabled' });

  await expect(tablist).toBeVisible();
  await expect(tablist.getByRole('tab')).toHaveCount(4);
  await expect(overview).toHaveAttribute('aria-selected', 'true');
  await expect(overview).toHaveAttribute('aria-controls');
  await expect(page.getByRole('tabpanel', { name: 'Overview' })).toBeVisible();
  await expect(disabled).toBeDisabled();
  await expect(overview.locator('[data-slot="trailing-icon"]')).toHaveCount(0);
  await expect(tokens.locator('[data-slot="trailing-icon"]')).toHaveCSS('width', '20px');
  await expect(tokens.locator('[data-slot="trailing-icon"]')).toHaveCSS('height', '20px');
  await expect(disabled.locator('[data-slot="trailing-icon"]')).toBeHidden();

  await expect(overview).toHaveCSS('height', '40px');
  await expect(overview).toHaveCSS('padding-top', '10px');
  await expect(overview).toHaveCSS('padding-right', '16px');
  await expect(overview).toHaveCSS('padding-bottom', '10px');
  await expect(overview).toHaveCSS('padding-left', '16px');
  await expect(overview.locator('[data-slot="label"]')).toHaveCSS('font-size', '14px');
  await expect(overview.locator('[data-slot="label"]')).toHaveCSS('font-weight', '600');
  await expect(overview.locator('[data-slot="label"]')).toHaveCSS('line-height', '20px');
  await expect(overview.locator('[data-slot="label"]')).toHaveCSS('letter-spacing', '0.1px');
  await expect(tokens.locator('[data-slot="label"]').locator('..')).toHaveCSS('gap', '2px');
  await expect(overview).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(overview).toHaveCSS('color', 'rgb(62, 71, 79)');
  await expect(disabled).toHaveCSS('color', 'rgb(173, 186, 197)');

  const indicator = tablist.locator('[data-slot="active-indicator"]');
  await expect(indicator).toHaveCSS('height', '3px');
  await expect(indicator).toHaveCSS('background-color', 'rgb(0, 124, 140)');
  const overviewBox = await overview.boundingBox();
  const initialIndicatorBox = await indicator.boundingBox();
  expect(overviewBox).not.toBeNull();
  expect(initialIndicatorBox).not.toBeNull();
  expect(initialIndicatorBox!.width).toBeCloseTo(overviewBox!.width, 1);

  await overview.focus();
  await page.keyboard.press('ArrowRight');
  await expect(tokens).toBeFocused();
  await expect(overview).toHaveAttribute('aria-selected', 'true');
  await expect(tokens).toHaveAttribute('aria-selected', 'false');
  await page.keyboard.press('Enter');
  await expect(tokens).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel', { name: 'Tokens' })).toBeVisible();

  await page.keyboard.press('End');
  await expect(disabled).toBeFocused();
  await expect(tokens).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Space');
  await expect(tokens).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('ArrowLeft');
  await expect(behavior).toBeFocused();
  await page.keyboard.press('Space');
  await expect(behavior).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel', { name: 'Behavior' })).toBeVisible();

  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await tokens.hover();
  const stateLayer = tokens.locator('[data-slot="state-layer"]');
  await expect(stateLayer).toHaveCSS('background-color', 'rgba(0, 0, 0, 0.06)');
  await expect(stateLayer).toHaveCSS('opacity', '1');

  await page.mouse.move(0, 0);
  await tokens.focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(tokens).toBeFocused();
  await expect(stateLayer).toHaveCSS('background-color', 'rgba(0, 0, 0, 0.12)');
  await expect(tokens.locator('[data-slot="focus-ring"]')).toHaveCSS('opacity', '1');

  await page.keyboard.down('Space');
  await expect(tokens).toHaveAttribute('data-pressed', 'true');
  await expect(stateLayer).toHaveCSS('background-color', 'rgba(0, 0, 0, 0.16)');
  await expect(tokens.locator('[data-slot="ripple"] > span')).toHaveCount(1);
  await page.keyboard.up('Space');
});

test('Segmented Button은 Figma anatomy와 MD3 single/multiple selection을 유지한다', async ({ page }) => {
  await page.goto('/components');

  const single = page.getByRole('group', { name: '일정 보기 범위' });
  const day = single.getByRole('button', { name: 'Day' });
  const week = single.getByRole('button', { name: 'Week' });
  const month = single.getByRole('button', { name: 'Month' });
  const agenda = single.getByRole('button', { name: 'Agenda view' });
  const content = day.locator('[data-slot="content"]');
  const label = day.locator('[data-slot="label"]');

  await expect(single).toHaveAttribute('data-selection-mode', 'single');
  await expect(single).toHaveCSS('height', '32px');
  await expect(day).toHaveCSS('height', '32px');
  await expect(day).toHaveCSS('padding-left', '12px');
  await expect(day).toHaveCSS('padding-right', '12px');
  await expect(day).toHaveCSS('border-left-width', '1px');
  await expect(day).toHaveCSS('border-top-left-radius', '48px');
  await expect(content).toHaveCSS('gap', '8px');
  await expect(day.locator('[data-slot="selected-icon"]')).toHaveCSS('width', '18px');
  await expect(day.locator('[data-slot="selected-icon"]')).toHaveCSS('height', '18px');
  await expect(label).toHaveCSS('font-size', '14px');
  await expect(label).toHaveCSS('font-weight', '500');
  await expect(label).toHaveCSS('line-height', '20px');
  await expect(day).toHaveCSS('background-color', 'rgb(190, 247, 241)');
  await expect(day).toHaveCSS('color', 'rgb(0, 49, 107)');
  await expect(week).toHaveCSS('border-color', 'rgb(118, 133, 146)');
  await expect(day.locator('[data-slot="touch-target"]')).toHaveCSS('height', '48px');

  await week.click();
  await expect(day).toHaveAttribute('aria-pressed', 'false');
  await expect(week).toHaveAttribute('aria-pressed', 'true');
  await week.click();
  await expect(week).toHaveAttribute('aria-pressed', 'true');

  await agenda.click();
  await expect(agenda).toHaveAttribute('aria-pressed', 'true');
  await expect(agenda.locator('[data-slot="selected-icon"]')).toBeVisible();
  await expect(agenda.locator('[data-slot="icon"]')).toBeVisible();

  await page.mouse.move(0, 0);
  await week.focus();
  await page.keyboard.press('Tab');
  await expect(month).toBeFocused();
  const stateLayer = month.locator('[data-slot="state-layer"]');
  await expect(stateLayer).toHaveCSS('background-color', 'rgba(0, 0, 0, 0.12)');
  await expect(month.locator('[data-slot="focus-ring"]')).toHaveCSS('opacity', '1');
  await page.keyboard.down('Space');
  await expect(month).toHaveAttribute('data-pressed', 'true');
  await expect(month.locator('[data-slot="ripple"] > span')).toHaveCount(1);
  await page.keyboard.up('Space');
  await expect(month).toHaveAttribute('aria-pressed', 'true');

  const multiple = page.getByRole('group', { name: '지도 레이어' });
  const labels = multiple.getByRole('button', { name: 'Labels' });
  const routes = multiple.getByRole('button', { name: 'Routes' });
  const restricted = multiple.getByRole('button', { name: 'Restricted' });
  await expect(multiple).toHaveAttribute('data-selection-mode', 'multiple');
  await routes.click();
  await expect(routes).toHaveAttribute('aria-pressed', 'true');
  await labels.click();
  await expect(labels).toHaveAttribute('aria-pressed', 'false');
  await expect(restricted).toBeDisabled();

  const disabledSelected = page.getByRole('group', { name: '비활성 선택 상태' })
    .getByRole('button', { name: 'Selected disabled' });
  await expect(disabledSelected).toBeDisabled();
  await expect(disabledSelected).toHaveAttribute('aria-pressed', 'true');

  await page.goto('/');
  await page.getByRole('button', { name: '다크' }).click();
  await page.getByRole('button', { name: '테마 적용' }).click();
  await page.getByRole('link', { name: '컴포넌트 검증' }).click();

  const darkDay = page.getByRole('group', { name: '일정 보기 범위' })
    .getByRole('button', { name: 'Day' });
  const darkDisabledSelected = page.getByRole('group', { name: '비활성 선택 상태' })
    .getByRole('button', { name: 'Selected disabled' });
  const darkReadback = await darkDay.evaluate((element) => {
    const rootStyle = getComputedStyle(document.documentElement);
    const style = getComputedStyle(element);
    const parseRgb = (value: string) => {
      const channels = value.match(/[\d.]+/gu)?.slice(0, 3).map(Number) ?? [];
      return channels.map((channel) => {
        const normalized = channel / 255;
        return normalized <= 0.04045
          ? normalized / 12.92
          : ((normalized + 0.055) / 1.055) ** 2.4;
      });
    };
    const luminance = (value: string) => {
      const [red = 0, green = 0, blue = 0] = parseRgb(value);
      return (0.2126 * red) + (0.7152 * green) + (0.0722 * blue);
    };
    const foreground = luminance(style.color);
    const background = luminance(style.backgroundColor);
    return {
      backgroundColor: style.backgroundColor,
      color: style.color,
      contrastRatio: (Math.max(foreground, background) + 0.05) /
        (Math.min(foreground, background) + 0.05),
      customContainer: rootStyle.getPropertyValue('--md-sys-color-custom-container').trim(),
      onSecondaryContainer: rootStyle.getPropertyValue('--md-sys-color-on-secondary-container').trim(),
      secondaryContainer: rootStyle.getPropertyValue('--md-sys-color-secondary-container').trim(),
    };
  });

  expect(darkReadback.customContainer).toBe(darkReadback.secondaryContainer);
  expect(darkReadback.contrastRatio).toBeGreaterThanOrEqual(4.5);
  await expect(darkDay).toHaveCSS('background-color', darkReadback.backgroundColor);
  await expect(darkDay).toHaveCSS('color', darkReadback.color);
  await expect(darkDisabledSelected).toHaveCSS('background-color', darkReadback.backgroundColor);
  await expect(darkDisabledSelected).toHaveCSS('color', /.+/u);
});

test('Switch는 Figma small anatomy와 MD3 binary form 동작을 함께 유지한다', async ({ page }) => {
  await page.goto('/components');

  const selected = page.getByRole('switch', { name: 'selected switch', exact: true });
  const control = page.getByRole('switch', { name: 'enabled switch', exact: true });
  const track = selected.locator('[data-slot="track"]');
  const handle = selected.locator('[data-slot="handle"]');
  const icon = selected.locator('.material-icons').first();

  await expect(selected).toHaveAttribute('aria-checked', 'true');
  await expect(selected).not.toHaveAttribute('data-size');
  await expect(selected).toHaveCSS('height', '48px');
  await expect(track).toHaveCSS('width', '32px');
  await expect(track).toHaveCSS('height', '18px');
  await expect(handle).toHaveCSS('width', '12px');
  await expect(handle).toHaveCSS('height', '12px');
  await expect(icon).toHaveCSS('width', '12px');
  await expect(icon).toHaveCSS('height', '12px');
  await expect(selected.locator('[data-slot="state-layer"]')).toHaveCSS('width', '24px');
  await expect(selected.locator('[data-slot="state-layer"]')).toHaveCSS('height', '24px');
  await expect(selected.locator('[data-slot="visual"]')).toHaveCSS('opacity', '1');
  await expect(track).toHaveCSS('background-color', 'rgb(0, 124, 140)');
  await expect(handle).toHaveCSS('background-color', 'rgb(237, 253, 255)');
  await expect(control.locator('[data-slot="track"]')).toHaveCSS('background-color', 'rgb(201, 211, 219)');
  await expect(control.locator('[data-slot="track"]')).toHaveCSS('border-left-width', '1px');
  await expect(control.locator('[data-slot="handle"]')).toHaveCSS('background-color', 'rgb(118, 133, 146)');

  await control.click();
  await expect(control).toHaveAttribute('aria-checked', 'true');
  await control.focus();
  await page.keyboard.press('Space');
  await expect(control).toHaveAttribute('aria-checked', 'false');
  await page.keyboard.press('Enter');
  await expect(control).toHaveAttribute('aria-checked', 'true');

  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await control.hover();
  const stateLayer = control.locator('[data-slot="state-layer"]');
  await expect(stateLayer).toHaveCSS('background-color', 'rgba(0, 0, 0, 0.06)');
  await expect(stateLayer).toHaveCSS('opacity', '1');

  await page.mouse.move(0, 0);
  await control.focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(control).toBeFocused();
  await expect(stateLayer).toHaveCSS('background-color', 'rgba(0, 0, 0, 0.12)');
  await expect(control.locator('[data-slot="focus-ring"]')).toHaveCSS('opacity', '1');

  await page.keyboard.down('Space');
  await expect(control).toHaveAttribute('data-pressed', 'true');
  await expect(control.locator('[data-slot="handle"]')).toHaveCSS('width', '12px');
  await expect(control.locator('[data-slot="ripple"] > span')).toHaveCount(1);
  await page.keyboard.up('Space');

  const disabled = page.getByRole('switch', { name: 'disabled switch', exact: true });
  await expect(disabled).toHaveAttribute('aria-disabled', 'true');
  await disabled.click({ force: true });
  await expect(disabled).toHaveAttribute('aria-checked', 'false');
});

test('Button은 Figma 360-variant 축과 MD3 실제 interaction을 함께 유지한다', async ({ page }) => {
  await page.goto('/components');

  const sizeCases = [
    { size: 'large', height: '40px', padding: '20px', gap: '8px', icon: '18px', font: '14px', line: '20px' },
    { size: 'medium', height: '32px', padding: '16px', gap: '4px', icon: '16px', font: '12px', line: '16px' },
    { size: 'small', height: '24px', padding: '12px', gap: '4px', icon: '16px', font: '12px', line: '16px' },
  ];

  for (const sample of sizeCases) {
    const sizeButtons = page.locator(
      '#actions button[data-button-variant][data-size="' + sample.size + '"]',
    );
    await expect(sizeButtons).toHaveCount(34);

    const button = page.getByRole('button', {
      name: sample.size + ' filled left icon',
    });
    await expect(button).toHaveCSS('height', sample.height);
    await expect(button).toHaveCSS('padding-left', sample.padding);
    await expect(button).toHaveCSS('padding-right', sample.padding);
    await expect(button).toHaveCSS('font-size', sample.font);
    await expect(button).toHaveCSS('line-height', sample.line);
    await expect(button.locator('[data-slot="touch-target"]')).toHaveCSS('min-height', '48px');
    await expect(button.locator('[data-slot="label"]').locator('..')).toHaveCSS('gap', sample.gap);
    await expect(button.locator('.material-icons')).toHaveCSS('font-size', sample.icon);
  }

  const smallTouchTarget = page.getByRole('button', { name: 'small filled text' });
  await smallTouchTarget.scrollIntoViewIfNeeded();
  expect(await smallTouchTarget.evaluate((button) => {
    const rect = button.getBoundingClientRect();
    return document
      .elementFromPoint(rect.left + rect.width / 2, rect.top - 8)
      ?.closest('button') === button;
  })).toBe(true);

  const filledError = page.getByRole('button', { name: 'large filled error text' });
  const tonalError = page.getByRole('button', { name: 'large tonal error text' });
  const outlined = page.getByRole('button', { name: 'large outlined text' });
  const outlinedError = page.getByRole('button', { name: 'large outlined error text' });
  const elevatedError = page.getByRole('button', { name: 'large elevated error text' });
  await expect(filledError).toHaveCSS('background-color', 'rgb(231, 40, 54)');
  await expect(filledError).toHaveCSS('color', 'rgb(255, 247, 248)');
  await expect(tonalError).toHaveCSS('background-color', 'rgb(255, 182, 188)');
  await expect(tonalError).toHaveCSS('color', 'rgb(70, 0, 5)');
  await expect(outlined).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(outlined).toHaveCSS('border-color', 'rgb(173, 186, 197)');
  await expect(outlined).toHaveCSS('color', 'rgb(31, 40, 45)');
  await expect(outlinedError).toHaveCSS('border-color', 'rgb(231, 40, 54)');
  await expect(elevatedError).toHaveCSS('color', 'rgb(231, 40, 54)');

  const disabled = page.locator(
    'button[data-button-variant="filled"][aria-label="large filled disabled"]',
  );
  const disabledError = page.getByRole('button', { name: 'large filled disabled error', exact: true });
  await expect(disabled).toBeDisabled();
  await expect(disabled).toHaveCSS('background-color', 'rgb(224, 231, 236)');
  await expect(disabled.locator('[data-slot="label"]').locator('..')).toHaveCSS('opacity', '0.38');
  await expect(disabledError).toHaveAttribute('data-error', 'true');
  await disabledError.click({ force: true });
  await expect(disabledError.locator('[data-slot="ripple"] > span')).toHaveCount(0);

  const outlinedDisabledCases = [
    {
      size: 'large',
      border: 'rgb(201, 211, 219)',
      color: 'rgb(118, 133, 146)',
      opacity: '1',
    },
    {
      size: 'medium',
      border: 'rgb(173, 186, 197)',
      color: 'rgb(31, 40, 45)',
      opacity: '0.38',
    },
    {
      size: 'small',
      border: 'rgb(173, 186, 197)',
      color: 'rgb(31, 40, 45)',
      opacity: '0.38',
    },
  ];
  for (const sample of outlinedDisabledCases) {
    const button = page.locator(
      'button[data-button-variant="outlined"][aria-label="' + sample.size
      + ' outlined disabled"]',
    );
    await expect(button).toHaveCSS('border-color', sample.border);
    await expect(button).toHaveCSS('color', sample.color);
    await expect(button.locator('[data-slot="label"]').locator('..'))
      .toHaveCSS('opacity', sample.opacity);
  }

  const interactive = page.getByRole('button', { name: 'large filled text' });
  const stateLayer = interactive.locator('[data-slot="state-layer"]');
  await interactive.hover();
  await expect(stateLayer).toHaveCSS('background-color', 'rgba(0, 0, 0, 0.06)');
  await expect(stateLayer).toHaveCSS('opacity', '1');

  await interactive.focus();
  await expect(stateLayer).toHaveCSS('background-color', 'rgba(0, 0, 0, 0.12)');
  await expect(interactive.locator('[data-slot="focus-ring"]')).toHaveCSS('opacity', '1');

  await page.keyboard.down('Space');
  await expect(interactive).toHaveAttribute('data-pressed', 'true');
  await expect(stateLayer).toHaveCSS('background-color', 'rgba(0, 0, 0, 0.16)');
  await expect(interactive.locator('[data-slot="ripple"] > span')).toHaveCount(1);
  await page.keyboard.up('Space');
});

test('IconButton은 Figma 75-variant 축과 MD3 action/toggle 동작을 함께 유지한다', async ({ page }) => {
  await page.goto('/components');

  const geometryCases = [
    { size: 'large', container: 40, icon: 24, padding: '8px' },
    { size: 'medium', container: 32, icon: 20, padding: '6px' },
    { size: 'small', container: 24, icon: 16, padding: '4px' },
  ] as const;

  await expect(page.locator('#actions button[data-icon-button-variant]')).toHaveCount(60);

  for (const sample of geometryCases) {
    const button = page.getByRole('button', {
      name: sample.size + ' standard action',
      exact: true,
    });
    await expect(button).toHaveAttribute('data-size', sample.size);
    await expect(button).toHaveCSS('padding', sample.padding);

    const buttonBox = await button.boundingBox();
    const iconBox = await button.locator('[data-slot="icon"]').boundingBox();
    const touchTargetBox = await button.locator('[data-slot="touch-target"]').boundingBox();
    expect(buttonBox).not.toBeNull();
    expect(iconBox).not.toBeNull();
    expect(touchTargetBox).not.toBeNull();
    expect(buttonBox!.width).toBe(sample.container);
    expect(buttonBox!.height).toBe(sample.container);
    expect(iconBox!.width).toBe(sample.icon);
    expect(iconBox!.height).toBe(sample.icon);
    expect(touchTargetBox!.width).toBe(48);
    expect(touchTargetBox!.height).toBe(48);
  }

  const smallAction = page.getByRole('button', { name: 'small standard action' });
  await smallAction.scrollIntoViewIfNeeded();
  expect(await smallAction.evaluate((button) => {
    const rect = button.getBoundingClientRect();
    return document
      .elementFromPoint(rect.left + rect.width / 2, rect.top - 8)
      ?.closest('button') === button;
  })).toBe(true);

  const standard = page.getByRole('button', { name: 'large standard action' });
  const filled = page.getByRole('button', { name: 'large filled action' });
  const tonal = page.getByRole('button', { name: 'large tonal action' });
  const outlined = page.getByRole('button', { name: 'large outlined action' });
  const error = page.getByRole('button', { name: 'large error action' });
  await expect(standard).toHaveCSS('color', 'rgb(62, 71, 79)');
  await expect(filled).toHaveCSS('background-color', 'rgb(0, 124, 140)');
  await expect(filled).toHaveCSS('color', 'rgb(237, 253, 255)');
  await expect(tonal).toHaveCSS('background-color', 'rgb(215, 228, 255)');
  await expect(tonal).toHaveCSS('color', 'rgb(0, 49, 107)');
  await expect(outlined).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(outlined).toHaveCSS('box-shadow', /rgb\(173, 186, 197\)/u);
  await expect(error).toHaveCSS('background-color', 'rgb(231, 40, 54)');
  await expect(error).toHaveCSS('color', 'rgb(255, 247, 248)');
  await expect(error).not.toHaveAttribute('aria-invalid');

  for (const variant of ['filled', 'tonal', 'error']) {
    const disabled = page.locator(
      'button[data-icon-button-variant="' + variant + '"][aria-label="large '
      + variant + ' disabled"]',
    );
    await expect(disabled).toBeDisabled();
    await expect(disabled).toHaveCSS('background-color', 'rgb(239, 243, 246)');
    await expect(disabled.locator('[data-slot="icon"]')).toHaveCSS('opacity', '0.38');
  }

  const outlinedDisabled = page.locator(
    'button[data-icon-button-variant="outlined"][aria-label="large outlined disabled"]',
  );
  await expect(outlinedDisabled).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(outlinedDisabled).toHaveCSS('box-shadow', /rgb\(173, 186, 197\)/u);

  const stateLayer = filled.locator('[data-slot="state-layer"]');
  await filled.hover();
  await expect(stateLayer).toHaveCSS('background-color', 'rgba(0, 0, 0, 0.06)');
  await expect(stateLayer).toHaveCSS('opacity', '1');

  await filled.focus();
  await expect(stateLayer).toHaveCSS('background-color', 'rgba(0, 0, 0, 0.12)');
  await expect(filled.locator('[data-slot="focus-ring"]')).toHaveCSS('opacity', '1');

  await page.keyboard.down('Space');
  await expect(filled).toHaveAttribute('data-pressed', 'true');
  await expect(stateLayer).toHaveCSS('background-color', 'rgba(0, 0, 0, 0.16)');
  await expect(filled.locator('[data-slot="ripple"] > span')).toHaveCount(1);
  await page.keyboard.up('Space');

  const toggle = page.getByRole('button', {
    name: 'large filled add favorite',
    exact: true,
  });
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await toggle.click();
  const selectedToggle = page.getByRole('button', {
    name: 'large filled remove favorite',
    exact: true,
  });
  await expect(selectedToggle).toHaveAttribute('aria-pressed', 'true');
});

test('Checkbox는 Figma 90-variant geometry와 MD3 native interaction을 함께 유지한다', async ({ page }) => {
  await page.goto('/components');

  const geometryCases = [
    { label: 'large Checked', size: 'large', control: 16, icon: 24, stateLayer: 36 },
    { label: 'medium Error indeterminate', size: 'medium', control: 16, icon: 22, stateLayer: 32 },
    { label: 'small Checked', size: 'small', control: 12, icon: 16.5, stateLayer: 24 },
  ] as const;

  for (const sample of geometryCases) {
    const checkbox = page.getByRole('checkbox', { name: sample.label, exact: true });
    await expect(checkbox).toHaveAttribute('data-size', sample.size);
    const controlBox = await checkbox.boundingBox();
    const iconBox = await checkbox.locator('svg').boundingBox();
    const stateLayerBox = await checkbox.locator('[data-slot="state-layer"]').boundingBox();
    expect(controlBox).not.toBeNull();
    expect(iconBox).not.toBeNull();
    expect(stateLayerBox).not.toBeNull();
    expect(controlBox!.width).toBeCloseTo(sample.control, 1);
    expect(controlBox!.height).toBeCloseTo(sample.control, 1);
    expect(iconBox!.width).toBeCloseTo(sample.icon, 1);
    expect(iconBox!.height).toBeCloseTo(sample.icon, 1);
    expect(stateLayerBox!.width).toBeCloseTo(sample.stateLayer, 1);
    expect(stateLayerBox!.height).toBeCloseTo(sample.stateLayer, 1);
    expect(iconBox!.x + iconBox!.width / 2).toBeCloseTo(
      controlBox!.x + controlBox!.width / 2,
      1,
    );
    expect(iconBox!.y + iconBox!.height / 2).toBeCloseTo(
      controlBox!.y + controlBox!.height / 2,
      1,
    );
  }

  const mixedError = page.getByRole('checkbox', {
    name: 'medium Error indeterminate',
    exact: true,
  });
  await expect(mixedError).toHaveAttribute('aria-checked', 'mixed');
  await expect(mixedError).toHaveAttribute('aria-invalid', 'true');
  await expect(mixedError).toHaveAccessibleDescription('선택을 확인하세요.');

  const disabledError = page.getByRole('checkbox', {
    name: 'small Disabled error checked',
    exact: true,
  });
  await expect(disabledError).toHaveAttribute('aria-disabled', 'true');
  await expect(disabledError).toHaveAttribute('aria-invalid', 'true');
  await expect(disabledError).toHaveCSS('opacity', '0.38');

  const interactive = page.getByRole('checkbox', { name: 'large Checked', exact: true });
  const stateLayer = interactive.locator('[data-slot="state-layer"]');
  await interactive.hover();
  await expect(stateLayer).toHaveCSS('background-color', 'rgba(0, 0, 0, 0.06)');
  await expect(stateLayer).toHaveCSS('opacity', '1');

  await page.mouse.move(0, 0);
  await interactive.focus();
  await expect(stateLayer).toHaveCSS('background-color', 'rgba(0, 0, 0, 0.12)');
  await expect(interactive.locator('[data-slot="focus-ring"]')).toHaveCSS('opacity', '1');

  await page.keyboard.down('Space');
  await expect(interactive).toHaveAttribute('data-pressed', 'true');
  await expect(stateLayer).toHaveCSS('background-color', 'rgba(0, 0, 0, 0.12)');
  await expect(interactive.locator('[data-slot="ripple"] > span')).toHaveCount(1);
  await page.keyboard.up('Space');
});

test('Radio는 Figma 30-variant geometry와 MD3 단일 선택 그룹 동작을 함께 유지한다', async ({ page }) => {
  await page.goto('/components');

  const geometryCases = [
    { size: 'large', icon: 24, stateLayer: 36 },
    { size: 'medium', icon: 20, stateLayer: 32 },
    { size: 'small', icon: 16, stateLayer: 24 },
  ] as const;

  await expect(page.locator('#selection-controls [role="radio"]')).toHaveCount(12);

  for (const sample of geometryCases) {
    const radio = page.getByRole('radio', {
      name: `${sample.size} Selected`,
      exact: true,
    });
    const radioBox = await radio.boundingBox();
    const iconBox = await radio.locator('[data-slot="icon"]').boundingBox();
    const stateLayerBox = await radio.locator('[data-slot="state-layer"]').boundingBox();
    const touchTargetBox = await radio.locator('[data-slot="touch-target"]').boundingBox();

    await expect(radio).toHaveAttribute('data-size', sample.size);
    await expect(radio).toHaveAttribute('aria-checked', 'true');
    expect(radioBox).not.toBeNull();
    expect(iconBox).not.toBeNull();
    expect(stateLayerBox).not.toBeNull();
    expect(touchTargetBox).not.toBeNull();
    expect(radioBox!.width).toBe(sample.icon);
    expect(radioBox!.height).toBe(sample.icon);
    expect(iconBox!.width).toBe(sample.icon);
    expect(iconBox!.height).toBe(sample.icon);
    expect(stateLayerBox!.width).toBe(sample.stateLayer);
    expect(stateLayerBox!.height).toBe(sample.stateLayer);
    expect(touchTargetBox!.width).toBe(48);
    expect(touchTargetBox!.height).toBe(48);
    expect(iconBox!.x + iconBox!.width / 2).toBeCloseTo(
      stateLayerBox!.x + stateLayerBox!.width / 2,
      1,
    );
    expect(iconBox!.y + iconBox!.height / 2).toBeCloseTo(
      stateLayerBox!.y + stateLayerBox!.height / 2,
      1,
    );
  }

  const enabledGroup = page.getByRole('radiogroup', { name: 'large enabled group' });
  await expect(enabledGroup).toHaveAccessibleDescription('방향키로 한 항목만 선택합니다.');
  const unselected = page.getByRole('radio', { name: 'large Unselected', exact: true });
  const selected = page.getByRole('radio', { name: 'large Selected', exact: true });
  await expect(unselected).toHaveCSS('color', 'rgb(62, 71, 79)');
  await expect(selected).toHaveCSS('color', 'rgb(0, 124, 140)');

  await unselected.click();
  await expect(unselected).toHaveAttribute('aria-checked', 'true');
  await expect(selected).toHaveAttribute('aria-checked', 'false');
  await unselected.focus();
  await page.keyboard.press('ArrowRight');
  await expect(selected).toBeFocused();
  await expect(selected).toHaveAttribute('aria-checked', 'true');
  await expect(unselected).toHaveAttribute('aria-checked', 'false');

  const disabled = page.getByRole('radio', {
    name: 'large Disabled selected',
    exact: true,
  });
  await expect(disabled).toHaveAttribute('aria-disabled', 'true');
  await expect(disabled).toHaveAttribute('aria-checked', 'true');
  await expect(disabled).toHaveCSS('opacity', '0.38');
  await disabled.click({ force: true });
  await expect(disabled.locator('[data-slot="ripple"] > span')).toHaveCount(0);

  const stateLayer = selected.locator('[data-slot="state-layer"]');
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await selected.hover();
  await expect(stateLayer).toHaveCSS('background-color', 'rgba(0, 0, 0, 0.06)');
  await expect(stateLayer).toHaveCSS('opacity', '1');

  await page.mouse.move(0, 0);
  await selected.focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(selected).toBeFocused();
  const keyboardStateLayer = selected.locator('[data-slot="state-layer"]');
  await expect(keyboardStateLayer).toHaveCSS('background-color', 'rgba(0, 0, 0, 0.12)');
  await expect(selected.locator('[data-slot="focus-ring"]')).toHaveCSS('opacity', '1');

  await page.keyboard.down('Space');
  await expect(selected).toHaveAttribute('data-pressed', 'true');
  await expect(keyboardStateLayer).toHaveCSS('background-color', 'rgba(0, 0, 0, 0.12)');
  await expect(selected.locator('[data-slot="ripple"] > span')).toHaveCount(1);
  await page.keyboard.up('Space');
});

test('Assistive, Filter, Input, Location Chip이 Figma token과 M3 동작을 함께 사용한다', async ({ page }) => {
  await page.goto('/');

  const chipSet = page.getByRole('toolbar', { name: 'Chip 유형 예시' });
  const assistive = chipSet.getByRole('button', { name: 'Assistive' });
  const filter = chipSet.getByRole('button', { name: 'Filter' });
  const input = chipSet.locator('[data-chip-type="input"]');
  const removeInput = chipSet.getByRole('button', { name: 'Input chip 삭제' });
  const location = page.locator('[data-chip-type="location"]');

  await expect(chipSet).toBeVisible();
  await expect(assistive.locator('..')).toHaveCSS('height', '32px');
  await expect(assistive.locator('..')).toHaveCSS('border-radius', '8px');
  await expect(assistive).toHaveCSS('font-size', '14px');
  await expect(assistive).toHaveCSS('font-weight', '500');
  await expect(assistive).toHaveCSS('line-height', '20px');

  await expect(filter).toHaveAttribute('aria-pressed', 'false');
  await filter.click();
  await expect(filter).toHaveAttribute('aria-pressed', 'true');
  await expect(filter.locator('.material-icons').first()).toHaveText('check');
  await expect(filter.locator('..')).toHaveCSS('background-color', 'rgb(215, 228, 255)');

  await assistive.focus();
  await page.keyboard.press('ArrowRight');
  await expect(filter).toBeFocused();
  await expect(assistive).toHaveAttribute('tabindex', '-1');
  await expect(filter).toHaveAttribute('tabindex', '0');

  const filterBox = await filter.boundingBox();
  expect(filterBox).not.toBeNull();
  await page.mouse.move(filterBox!.x + filterBox!.width / 2, filterBox!.y + filterBox!.height / 2);
  await page.mouse.down();
  await expect(filter.locator('[data-slot="ripple"] > span')).toHaveCount(1);
  await page.mouse.up();

  await expect(input).toBeVisible();
  await expect(input.locator('[data-chip-action="primary"]')).toHaveCount(0);
  await removeInput.click();
  await expect(input).toBeHidden();
  await expect(removeInput).toBeHidden();

  await expect(location).toHaveCSS('height', '24px');
  await expect(location).toHaveCSS('border-radius', '4px');
  await expect(location).toHaveCSS('font-size', '12px');
  await expect(location).toHaveCSS('line-height', '16px');
  await expect(location.locator('button')).toHaveCount(0);

  await page.goto('/components');
  const galleryLocation = page.locator('#chips [data-chip-type="location"]');
  const galleryLocationBox = await galleryLocation.boundingBox();
  expect(galleryLocationBox).not.toBeNull();
  expect(galleryLocationBox!.width).toBeLessThan(100);
  await expect(galleryLocation.locator('button')).toHaveCount(0);

  const filterCases = [
    { size: 'large', height: '32px', padding: '8px', inset: '4px', icon: '20px' },
    { size: 'small', height: '24px', padding: '6px', inset: '2px', icon: '16px' },
    { size: 'x-small', height: '20px', padding: '10px', inset: '2px', icon: '16px' },
  ];
  for (const sample of filterCases) {
    const set = page.getByRole('toolbar', { name: `${sample.size} Filter states` });
    const unselected = set.getByRole('button', { name: 'Label' }).first();
    const selected = set.getByRole('button', { name: 'Label' }).nth(1);
    await expect(unselected.locator('..')).toHaveCSS('height', sample.height);
    await expect(unselected).toHaveCSS('padding-left', sample.padding);
    await expect(unselected.locator('span').filter({ hasText: /^Label$/u }).last()).toHaveCSS('margin-left', sample.inset);
    await expect(selected).toHaveAttribute('aria-pressed', 'true');
    await expect(selected.locator('.material-icons').first()).toHaveText('check');
    await expect(selected.locator('.material-icons').first()).toHaveCSS('font-size', sample.icon);
  }

  const largeInputSet = page.getByRole('toolbar', { name: 'large Input states' });
  const largeInput = largeInputSet.locator('[data-chip-type="input"]').first();
  await expect(largeInput.locator('[data-chip-action="primary"]')).toHaveCount(0);
  await expect(largeInput.locator(':scope > span').first()).toHaveCSS('padding-left', '16px');
  await expect(largeInput.locator('button')).toHaveCSS('padding-left', '4px');
  await expect(largeInput.locator('button')).toHaveCSS('padding-right', '8px');
});

test('테마 preview, 저장, reload 흐름이 document root까지 이어진다', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Blue' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme-id', 'blue');
  const previewPrimary = await page.locator('html').evaluate((element) => getComputedStyle(element).getPropertyValue('--md-sys-color-primary'));

  await page.getByRole('button', { name: '테마 적용' }).click();
  await expect(page.getByText('테마가 이 브라우저에 저장되었습니다.')).toBeVisible();
  await page.reload();

  await expect(page.getByRole('button', { name: 'Blue' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('html')).toHaveAttribute('data-theme-id', 'blue');
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
  await expect(seedPreview).toHaveCSS('background-color', 'rgb(0, 124, 140)');

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
  await expect.poll(() => projectFieldControl.locator('[data-slot="outline-start"]').evaluate((element) => ({
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
  expect(await selectPopup.getByRole('option').evaluateAll((options) => (
    options.map((option) => {
      const value = getComputedStyle(option)
        .getPropertyValue('--md-menu-open-item-opacity-duration').trim();
      return value.endsWith('ms') ? Number.parseFloat(value) : Number.parseFloat(value) * 1000;
    })
  ))).toEqual([250, 250, 250]);
  await expect.poll(() => selectPopup.getByRole('option').evaluateAll((options) => (
    options.map((option) => getComputedStyle(option).opacity)
  ))).toEqual(['1', '1', '1']);
  await expect.poll(() => selectPopup.getByRole('option').evaluateAll((options) => (
    options.map((option) => option.getBoundingClientRect().height)
  ))).toEqual([56, 56, 56]);
  await expect(selectPopup.locator('.material-icons')).toHaveCount(0);
  const currentOption = selectPopup.getByRole('option', { name: 'Web application' });
  await expect(currentOption).toBeFocused();
  await expect(currentOption.locator('[data-slot="focus-ring"]')).toHaveCSS('opacity', '1');
  const currentOptionBox = await currentOption.boundingBox();
  await page.mouse.move(
    currentOptionBox!.x + currentOptionBox!.width / 2,
    currentOptionBox!.y + currentOptionBox!.height / 2,
  );
  await page.mouse.down();
  await expect(currentOption.locator('[data-slot="ripple"] > span')).toHaveCount(1);
  await page.mouse.up();
  await expect(selectPopup).toBeHidden();
  await select.click();
  await expect(selectPopup).toBeVisible();
  await expect.poll(() => selectPopup.getByRole('option').evaluateAll((options) => (
    options.map((option) => getComputedStyle(option).opacity)
  ))).toEqual(['1', '1', '1']);
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
  await expect.poll(async () => (await selectPopupSurface.boundingBox())?.height ?? 0)
    .toBeGreaterThan(0);
  await expect(selectPopupPositionedShell).not.toHaveAttribute('data-menu-motion-pending', '');
  await expect(selectPopup.getByRole('option', { name: 'Desktop application' })).toBeVisible();
  await page.keyboard.press('Escape');

  const checkbox = page.getByRole('checkbox', { name: '변경 알림 받기' });
  const checkboxLabel = page.getByText('변경 알림 받기', { exact: true });
  const checkboxBox = await checkbox.boundingBox();
  const checkboxLabelBox = await checkboxLabel.boundingBox();
  expect(checkboxBox).not.toBeNull();
  expect(checkboxLabelBox).not.toBeNull();
  expect(checkboxBox!.width).toBe(16);
  expect(checkboxBox!.height).toBe(16);
  const checkboxMarkBox = await checkbox.locator('svg').boundingBox();
  expect(checkboxMarkBox?.width).toBe(24);
  expect(checkboxMarkBox?.height).toBe(24);
  expect(checkboxMarkBox!.x + checkboxMarkBox!.width / 2)
    .toBe(checkboxBox!.x + checkboxBox!.width / 2);
  expect(checkboxMarkBox!.y + checkboxMarkBox!.height / 2)
    .toBe(checkboxBox!.y + checkboxBox!.height / 2);
  expect(checkboxLabelBox!.x - checkboxBox!.x).toBe(32);
  expect(Math.abs(
    checkboxBox!.y + checkboxBox!.height / 2
      - (checkboxLabelBox!.y + checkboxLabelBox!.height / 2),
  )).toBeLessThanOrEqual(1);
  const checkboxRippleBox = await checkbox.locator('[data-slot="ripple"]').boundingBox();
  expect(checkboxRippleBox?.width).toBe(36);
  expect(checkboxRippleBox?.height).toBe(36);
  await page.mouse.move(
    checkboxBox!.x + checkboxBox!.width / 2,
    checkboxBox!.y + checkboxBox!.height / 2,
  );
  await page.mouse.down();
  await expect(checkbox.locator('[data-slot="ripple"] > span')).toHaveCount(1);
  await page.mouse.up();
  await checkbox.click();

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
  await expect(leadingIconButton).toHaveCSS('padding-left', '20px');
  await expect(leadingIconButton).toHaveCSS('padding-right', '20px');
  await expect(trailingIconButton).toHaveCSS('padding-left', '20px');
  await expect(trailingIconButton).toHaveCSS('padding-right', '20px');
  await expect(leadingIconButton.locator('.material-icons')).toHaveCSS('font-size', '18px');
  await expect(trailingIconButton.locator('.material-icons')).toHaveCSS('font-size', '18px');

  const button = page.getByRole('button', { name: 'Filled', exact: true });
  await button.evaluate((element) => element.scrollIntoView({ block: 'center' }));
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
  await expect.poll(() => checkboxLongMark.evaluate(
    (element) => Number.parseFloat(getComputedStyle(element).width),
  )).toBeGreaterThan(11);
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
  await expect(popup).toHaveCSS('transform', 'none');

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
  expect(Math.abs(await page.evaluate(() => window.scrollY) - scrollBeforeOpen))
    .toBeLessThanOrEqual(4);

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
  const menuPopup = page.getByRole('menu');
  const menuItem = page.getByRole('menuitemcheckbox', { name: '컴팩트 미리보기' });
  await expect(menuItem).toHaveCSS('height', '48px');
  await expect(menuItem).toHaveCSS('font-size', '16px');
  await expect(menuItem).toHaveCSS('line-height', '24px');
  const submenuIcon = page.getByRole('menuitem', { name: '도움말' }).locator('.material-icons');
  expect(await menuItem.evaluate((element) => (
    getComputedStyle(element).getPropertyValue('--md-list-item-trailing-icon-size').trim()
  ))).toBe('1.5rem');
  await expect(submenuIcon).toHaveCSS('width', '24px');
  await expect(submenuIcon).toHaveCSS('height', '24px');
  await expect(submenuIcon).toHaveCSS('font-size', '24px');
  await expect(menuPopup).not.toHaveAttribute('data-menu-motion-phase', /.+/);
  await menuItem.hover();
  await page.mouse.down();
  await expect(menuItem.locator('[data-slot="ripple"] > span')).toHaveCount(1);
  await page.mouse.up();
  await page.keyboard.press('Escape');

  await page.getByRole('button', { name: '프로젝트 생성' }).click();
  const snackbarText = page.getByText('새 디자인 시스템 구성을 저장했습니다.');
  const snackbar = snackbarText.locator('..').locator('..');
  await expect(snackbarText).toHaveCSS('margin', '0px');
  await expect(snackbarText).toHaveCSS('font-size', '14px');
  await expect(snackbarText).toHaveCSS('line-height', '20px');
  await expect(snackbar).toHaveCSS('height', '48px');
});

test('Snackbar는 실제 앱 흐름에서 두 줄 container token을 사용한다', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');

  await page.getByRole('button', { name: 'Theme Lab 메뉴' }).click();
  const helpItem = page.getByRole('menuitem', { name: '도움말' });
  await helpItem.focus();
  await page.keyboard.press('ArrowRight');
  const tokenGuide = page.getByRole('menuitem', { name: '토큰 가이드' });
  await expect(tokenGuide).toBeVisible();
  await tokenGuide.click();

  const snackbarText = page.getByText(/reference, system, component/);
  const snackbar = snackbarText.locator('..').locator('..');
  await expect(snackbar).toHaveAttribute('data-multiline', 'true');
  await expect(snackbar).toHaveCSS('min-height', '68px');
  await expect.poll(async () => (await snackbar.boundingBox())!.height)
    .toBeGreaterThanOrEqual(68);
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
