import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';
import axe from 'axe-core';

// Read-only audit through the app's real controls. Does not grant compliance PASS.
// Requires an already-running Vite host; keeps failures outside the layout regression.
const baseURL = process.env.GALLERY_AUDIT_URL ?? 'http://127.0.0.1:5173';
const output = resolve(process.env.GALLERY_AUDIT_OUTPUT ?? 'test-results/component-gallery-audit');
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const report = { baseURL, capturedAt: new Date().toISOString(), browser: browser.version(), axeVersion: axe.version, themes: [], snackbar: {} };

try {
  for (const [mode, label] of [['light', '라이트'], ['dark', '다크']]) {
    for (const highContrast of [false, true]) {
      const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
      await page.goto(baseURL);
      await page.getByRole('button', { name: 'Normal', exact: true }).click();
      await page.getByRole('button', { name: label, exact: true }).click();
      await page.getByRole('checkbox', { name: '고대비 색상' }).setChecked(highContrast);
      await page.getByRole('button', { name: '테마 적용', exact: true }).click();
      await page.getByRole('link', { name: '컴포넌트 검증', exact: true }).click();
      await page.getByRole('heading', { level: 1, name: '컴포넌트 검증' }).waitFor();
      await page.getByRole('table').nth(5).waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.addScriptTag({ content: axe.source });
      const result = await page.evaluate(async () => {
        const { violations, incomplete } = await window.axe.run();
        return {
          theme: { ...document.documentElement.dataset },
          violations: violations.map(({ id, impact, nodes }) => ({
            id, impact,
            nodes: nodes.map(({ target, failureSummary, any }) => ({
              target, failureSummary,
              contrast: any.find((check) => check.id === 'color-contrast')?.data,
            })),
          })),
          incomplete: incomplete.map(({ id, nodes }) => ({ id, count: nodes.length })),
        };
      });
      report.themes.push({ mode, contrast: highContrast ? 'high' : 'standard', ...result });
      console.log(`${mode}/${highContrast ? 'high' : 'standard'}: ${result.violations.map((v) => `${v.id}=${v.nodes.length}`).join(', ') || 'no automated violations'}`);
      if (mode === 'dark' && !highContrast) {
        await page.getByRole('table').nth(3).screenshot({ path: resolve(output, 'state-table-dark.png') });
        await page.getByRole('button', { name: 'Loading', exact: true }).click();
        await page.getByRole('button', { name: 'Message', exact: true }).click();
        await page.getByRole('button', { name: 'Success', exact: true }).click();
        await page.waitForTimeout(400); // Observe settled entry motion without changing it.
        report.snackbar.simultaneous = await page.locator('[role="dialog"][data-type]').evaluateAll((elements) => elements.map((element) => ({
          text: element.textContent,
          type: element.getAttribute('data-type'),
          rect: element.getBoundingClientRect().toJSON(),
        })));
        await page.screenshot({ path: resolve(output, 'snackbar-stack-dark.png') });
        // Fresh entry removes loading/hover pause; do not focus or hover the snackbar.
        await page.reload();
        await page.getByRole('button', { name: 'Multi-line', exact: true }).click();
        const actionSnackbar = page.locator('[role="dialog"][data-type]').filter({ hasText: '긴 설명은 두 줄' });
        await actionSnackbar.waitFor({ state: 'visible' });
        report.snackbar.actionInitiallyVisible = await actionSnackbar.isVisible();
        await page.mouse.move(5, 100);
        await page.waitForTimeout(6000);
        report.snackbar.actionVisibleAfterSixSeconds = await actionSnackbar.isVisible();
      }
      await page.close();
    }
  }
  report.verdict = report.themes.some(({ violations }) => violations.length > 0)
    || report.snackbar.simultaneous.length > 1
    || !report.snackbar.actionVisibleAfterSixSeconds ? 'FAIL' : 'PASS';
  await writeFile(resolve(output, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Audit ${report.verdict}: ${resolve(output, 'report.json')}`);
  process.exitCode = report.verdict === 'FAIL' ? 1 : 0;
} finally {
  await browser.close();
}
