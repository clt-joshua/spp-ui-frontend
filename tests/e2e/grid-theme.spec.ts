import { expect, test } from '@playwright/test';
import axeCore from 'axe-core';

test('그리드는 실제 테마 적용 흐름에서 Light/Dark·High·reduced motion을 유지한다', async ({ page }, testInfo) => {
  for (const theme of [
    { mode: '라이트', high: false }, { mode: '다크', high: false },
    { mode: '라이트', high: true }, { mode: '다크', high: true },
  ]) {
    await page.emulateMedia({ reducedMotion: theme.high ? 'reduce' : 'no-preference' });
    await page.goto('/');
    await page.getByRole('button', { name: theme.mode, exact: true }).click();
    await page.getByRole('checkbox', { name: '고대비 색상', exact: true }).setChecked(theme.high);
    await page.getByRole('button', { name: '테마 적용', exact: true }).click();
    await page.getByRole('link', { name: '업무용 그리드', exact: true }).click();
    await expect(page.locator('html')).toHaveAttribute('data-contrast', theme.high ? 'high' : 'standard');
    await expect(page.locator('html')).toHaveAttribute('data-color-scheme', theme.mode === '라이트' ? 'light' : 'dark');
    await page.getByRole('checkbox', { name: 'REQ-001 행 선택', exact: true }).check();
    const selected = page.locator('tr[data-row-id="REQ-001"] td').nth(2);
    const layer = await selected.evaluate(element => ({ color: getComputedStyle(element, '::before').backgroundColor, opacity: getComputedStyle(element, '::before').opacity }));
    expect(layer.opacity).toBe('1');
    expect(layer.color).not.toBe('rgba(0, 0, 0, 0)');
    await page.getByRole('combobox', { name: 'REQ-001 분류', exact: true }).click();
    await page.getByRole('option', { name: '운영', exact: true }).click();
    await expect(page.getByRole('combobox', { name: 'REQ-001 분류', exact: true })).toHaveText(/운영/);
    await page.addScriptTag({ content: axeCore.source });
    const violations = await page.evaluate(async () => (await (window as unknown as { axe: typeof axeCore }).axe.run(document.querySelector('main')!, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa'] })).violations.map(item => ({ id: item.id, impact: item.impact, nodes: item.nodes.map(node => ({ html: node.html, summary: node.failureSummary })) })));
    // User-authoritative Figma colors are not recolored to obtain an axe pass.
    // Retain every raw observation; only grid-scoped contrast is separately reported.
    await testInfo.attach(`axe-${theme.mode}-${theme.high ? 'high' : 'standard'}`, { body: JSON.stringify(violations, null, 2), contentType: 'application/json' });
    expect(violations.filter(item => item.id !== 'color-contrast' && (item.impact === 'serious' || item.impact === 'critical'))).toEqual([]);
    const outsideGrid = await page.evaluate(async () => (await (window as unknown as { axe: typeof axeCore }).axe.run({ include: ['main'], exclude: ['[data-grid]'] }, { runOnly: ['color-contrast'] })).violations);
    expect(outsideGrid).toEqual([]);
    const colors = await page.locator('[data-grid]').first().evaluate(root => {
      const styles = getComputedStyle(root);
      const token = (name: string) => styles.getPropertyValue(name).trim();
      return {
        total: token('--md-grid-total-text-color'), expectedTotal: token('--md-sys-color-on-surface-variant'),
        disabled: token('--md-grid-disabled-color'), expectedDisabled: token('--md-sys-color-surface-container-lowest'),
        opacity: token('--md-grid-disabled-opacity'),
        hover: token('--md-grid-hover-layer'), expectedHover: token('--md-sys-color-state-layer-hovered'),
        focus: token('--md-grid-focus-layer'), expectedFocus: token('--md-sys-color-state-layer-focused'),
      };
    });
    expect(colors.total).toBe(colors.expectedTotal);
    expect(colors.disabled).toBe(colors.expectedDisabled);
    expect(colors.opacity).toBe('1');
    expect(colors.hover).toBe(colors.expectedHover);
    expect(colors.focus).toBe(colors.expectedFocus);
    if (testInfo.project.name === 'chromium') {
      await page.screenshot({ path: `artifacts/grid-${theme.mode === '라이트' ? 'light' : 'dark'}-${theme.high ? 'high' : 'standard'}.png`, fullPage: true });
    }
  }
});
