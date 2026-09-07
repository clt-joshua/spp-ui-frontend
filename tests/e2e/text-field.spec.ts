import { expect, test, type Locator } from '@playwright/test';

const fieldRoot = (input: Locator) => input.locator('xpath=ancestor::*[@data-text-field-variant]');
const control = (input: Locator) => fieldRoot(input).locator('[data-slot="text-field-control"]');
const outline = (input: Locator, pseudo = '::before') => control(input).locator('[data-slot="outline-start"]').evaluate((element, layer) => {
  const style = getComputedStyle(element, layer);
  return { width: style.borderTopWidth, color: style.borderTopColor, opacity: style.opacity };
}, pseudo);

for (const size of ['large', 'small'] as const) {
  test(`TextField ${size} Figma variants use actual hover/focus and size-specific colors`, async ({ page, browserName }, testInfo) => {
    await page.goto('/components#form-fields');
    await page.evaluate(() => document.fonts.ready);
    const matrix = page.getByRole('region', { name: `TextField ${size} matrix` });
    await expect(matrix.locator('input')).toHaveCount(16);
    for (const type of ['text', 'number'] as const) {
      for (const content of ['empty', 'populated'] as const) {
        const input = page.getByRole(type === 'text' ? 'textbox' : 'spinbutton', { name: `${size} ${type} ${content} enabled`, exact: true });
        await page.mouse.move(0, 0);
        await expect(control(input)).toHaveCSS('height', size === 'large' ? '48px' : '32px');
        await expect(control(input)).toHaveCSS('border-radius', '4px');
        await expect(input).toHaveCSS('font-size', size === 'large' ? '16px' : '12px');
        // HTML rendering requires native input used line-height >= font normal.
        // Firefox resolves this Noto Sans 12px input to 17px, despite the 16px
        // author token. Preserve native editing rather than clip/reduce the font.
        expect(await input.evaluate((element) => getComputedStyle(element).getPropertyValue('--md-text-field-input-text-line-height').trim())).toBe(size === 'large' ? '1.5rem' : '1rem');
        await expect(input).toHaveCSS('line-height', size === 'large' ? '24px' : browserName === 'firefox' ? '17px' : '16px');
        const label = control(input).locator('[data-slot="floating-label"]');
        await expect(label).toHaveCSS('font-size', size === 'large' ? '12px' : '11px');
        await expect(label).toHaveCSS('font-weight', size === 'large' ? '400' : '500');
        await expect(label).toHaveCSS('opacity', content === 'populated' ? '1' : '0');
        // The label sits above the editable glyph box; its real hit area must
        // still focus the input instead of being a decorative dead zone.
        if (content === 'populated') await label.locator('..').click();
        else await control(input).locator('[data-slot="resting-label"]').click();
        await expect(input).toBeFocused();
        await page.getByRole('heading', { name: 'Form fields', exact: true }).click();
        expect((await outline(input)).width).toBe('1px');
        const labelColor = await label.evaluate((element) => getComputedStyle(element).color);
        await control(input).hover();
        expect((await outline(input)).width).toBe('2px');
        await input.focus();
        await expect.poll(async () => ({ width: (await outline(input, '::after')).width, opacity: (await outline(input, '::after')).opacity })).toEqual({ width: size === 'large' ? '3px' : '2px', opacity: '1' });
        await expect(label).toHaveCSS('color', labelColor);
        const icon = control(input).locator('.material-icons').first();
        await expect(icon).toHaveCSS('font-size', size === 'large' ? '24px' : '16px');
        const iconBox = await icon.boundingBox();
        const box = await control(input).boundingBox();
        expect(iconBox!.x - box!.x).toBe(size === 'large' ? 16 : 8);
        const error = page.getByRole(type === 'text' ? 'textbox' : 'spinbutton', { name: `${size} ${type} ${content} error`, exact: true });
        const errorLabel = control(error).locator('[data-slot="floating-label"]');
        await page.getByRole('heading', { name: 'Form fields', exact: true }).click();
        const emptyErrorColor = await errorLabel.evaluate((element) => getComputedStyle(element).color);
        expect(emptyErrorColor === labelColor).toBe(size === 'small' || content === 'empty');
        await error.focus();
        expect((await outline(error, '::after')).width).toBe(size === 'large' ? '3px' : '2px');
        if (size === 'small') await expect(errorLabel).toHaveCSS('color', labelColor);
        else await expect(errorLabel).toHaveCSS('color', (await outline(error, '::after')).color);
        const disabled = page.getByRole(type === 'text' ? 'textbox' : 'spinbutton', { name: `${size} ${type} ${content} disabled`, exact: true });
        await expect(disabled).toBeDisabled();
        await expect(fieldRoot(disabled)).toHaveCSS('opacity', '0.38');
        await control(disabled).hover();
        expect((await outline(disabled)).width).toBe('1px');
        const readonly = page.getByRole(type === 'text' ? 'textbox' : 'spinbutton', { name: `${size} ${type} ${content} readonly`, exact: true });
        await expect(readonly).toHaveAttribute('readonly', '');
        expect(await control(readonly).evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe(await control(input).evaluate((element) => getComputedStyle(element).backgroundColor));
        await readonly.focus();
        await expect(readonly).toBeFocused();
      }
    }
    await matrix.screenshot({ path: testInfo.outputPath(`text-field-${size}.png`) });
  });
}

test('TextField real form supports keyboard clear, validation, number, password, multiline and reset', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: '컴포넌트 검증' }).click();
  await page.getByRole('link', { name: 'Form fields TextField · Select · AutoComplete' }).click();
  const name = page.getByRole('textbox', { name: '검증 프로젝트 이름', exact: true });
  await name.focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: '검증 프로젝트 이름 지우기' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(name).toHaveValue('');
  await expect(name).toBeFocused();
  await page.getByRole('button', { name: '입력값 제출', exact: true }).click();
  await expect(name).toHaveAttribute('aria-invalid', 'true');
  await expect(name).toHaveAccessibleDescription('외부 설명 연결과 오류 설명 연결을 함께 유지합니다. 프로젝트 이름을 입력하세요.');
  await name.fill('TextField 검증');
  const number = page.getByRole('spinbutton', { name: '검증 수량', exact: true });
  await number.focus();
  await page.keyboard.press('ArrowUp');
  await expect(number).toHaveValue('3');
  await page.getByLabel('검증 비밀번호', { exact: true }).fill('demo');
  await page.getByRole('button', { name: '비밀번호 표시', exact: true }).click();
  await expect(page.getByRole('textbox', { name: '검증 비밀번호', exact: true })).toHaveAttribute('type', 'text');
  const memo = page.getByRole('textbox', { name: '검증 메모', exact: true });
  await memo.fill('첫 줄\n둘째 줄');
  await expect(memo).toHaveCSS('resize', 'vertical');
  await page.getByRole('button', { name: '입력값 제출', exact: true }).click();
  const result = page.getByLabel('TextField 제출 결과', { exact: true });
  await expect(result).toContainText('TextField 검증');
  await expect(result).toContainText('"quantity": "3"');
  await expect(result).toContainText('SPP-001');
  await expect(result).not.toContainText('disabledCode');
  await expect(result).not.toContainText('password');
  await expect(result).toContainText('첫 줄\\n둘째 줄');
  await page.getByRole('button', { name: '입력값 초기화', exact: true }).click();
  await expect(name).toHaveValue('새 프로젝트');
  await expect(number).toHaveValue('2');
  await expect(memo).toHaveValue('첫 줄');
  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});

test('outlined TextField floats on focus/value and returns after clearing and blur', async ({ page }) => {
  await page.goto('/components');
  const input = page.getByRole('textbox', { name: '테스트 입력', exact: true });
  await page.getByRole('region', { name: 'TextField 속성 테스트' }).getByRole('button', { name: '빈 값으로 테스트' }).click();
  await expect(control(input).locator('[data-slot="floating-label"]')).toHaveCSS('opacity', '0');
  await expect(page.locator('[data-text-field-variant="filled"]')).toHaveCount(0);
  await expect(control(input)).toHaveCSS('height', '48px');
  await input.scrollIntoViewIfNeeded();
  await page.evaluate(() => document.fonts.ready);
  const timing = await control(input).evaluate(async (element) => {
    element.querySelector('input')?.focus();
    for (let frame = 0; frame < 8; frame++) {
      await new Promise(requestAnimationFrame);
      const animation = element.querySelector('[data-slot="floating-label"]')?.getAnimations()[0];
      if (animation) return animation.effect?.getTiming();
    }
  });
  expect(timing?.duration).toBe(150);
  expect(timing?.easing).toBe('cubic-bezier(0.2, 0, 0, 1)');
  await input.fill('Value');
  await page.getByRole('heading', { name: 'Form fields', exact: true }).click();
  await expect(control(input).locator('[data-slot="floating-label"]')).toHaveCSS('opacity', '1');
  await input.focus();
  await page.getByRole('button', { name: '테스트 입력 지우기', exact: true }).click();
  await expect(input).toHaveValue('');
  await expect(input).toBeFocused();
  await expect(control(input).locator('[data-slot="floating-label"]')).toHaveCSS('opacity', '1');
  await page.getByRole('heading', { name: 'Form fields', exact: true }).click();
  await expect(control(input).locator('[data-slot="resting-label"]')).toHaveCSS('opacity', '1');
  await expect(control(input).locator('[data-slot="floating-label"]')).toHaveCSS('opacity', '0');
});

test.describe('TextField touch density', () => {
  test.use({ hasTouch: true, viewport: { width: 375, height: 812 } });
  test('compact visuals expand into real disjoint 48px input and action targets', async ({ page }) => {
    await page.goto('/components#form-fields');
    const small = page.getByRole('textbox', { name: 'small text populated enabled', exact: true });
    await expect(control(small)).toHaveCSS('height', '48px');
    await expect(control(small).locator('[data-slot="field-outline"]')).toHaveCSS('height', '48px');
    await control(small).click({ position: { x: 2, y: 46 } });
    await expect(small).toBeFocused();
    const clear = control(small).getByRole('button');
    await expect(clear).toHaveCSS('width', '48px');
    await expect(clear).toHaveCSS('height', '48px');
    const inputBox = await small.boundingBox();
    const actionBox = await clear.boundingBox();
    expect(actionBox!.x).toBeGreaterThanOrEqual(inputBox!.x + inputBox!.width);
    await clear.click();
    await expect(small).toHaveValue('');
    const disabledError = page.getByRole('textbox', { name: 'Disabled', exact: true });
    const disabled = page.getByRole('textbox', { name: 'large text populated disabled', exact: true });
    await expect(control(disabledError).locator('[data-slot="floating-label"]')).toHaveCSS('color', await control(disabled).locator('[data-slot="floating-label"]').evaluate((element) => getComputedStyle(element).color));
    await expect(fieldRoot(disabledError)).toHaveCSS('opacity', '0.38');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  });
});
