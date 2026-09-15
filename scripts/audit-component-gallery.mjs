import { selectComponent } from './gallery-navigation.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';
import axe from 'axe-core';
import { isFigmaContrastObservation } from '../src/ui/compliance/figma-contrast-policy.ts';

// Read-only audit through the app's real controls. Does not grant compliance PASS.
// Requires an already-running Vite host; keeps failures outside the layout regression.
const baseURL = process.env.GALLERY_AUDIT_URL ?? 'http://localhost:5174';
const output = resolve(process.env.GALLERY_AUDIT_OUTPUT ?? 'test-results/component-gallery-audit');
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const report = { baseURL, capturedAt: new Date().toISOString(), browser: browser.version(), axeVersion: axe.version, themes: [] };

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
      const componentIds = await page.locator('nav[aria-label="컴포넌트 목록"] a').evaluateAll((links) => links.map((link) => link.hash.slice(1)));
      if (componentIds.length !== 13) throw new Error('Incomplete component inventory');
      for (const componentId of componentIds) {
      await selectComponent(page, componentId);
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
      report.themes.push({ mode, contrast: highContrast ? 'high' : 'standard', componentId, ...result });
      console.log(`${componentId} ${mode}/${highContrast ? 'high' : 'standard'}: ${result.violations.map((v) => `${v.id}=${v.nodes.length}`).join(', ') || 'no automated violations'}`);
      if (mode === 'dark' && !highContrast && componentId === 'icon-button') {
        await page.getByRole('table').first().screenshot({ path: resolve(output, 'state-table-dark.png') });
      }
      }
      await page.close();
    }
  }
  report.automatedVerdict = report.themes.some(({ violations }) => violations.length > 0)
    ? 'FAIL' : 'PASS';
  report.verdict = report.themes.some(({ componentId, violations }) =>
    violations.some(({ id }) => !isFigmaContrastObservation(componentId, id))) ? 'FAIL' : 'PASS';
  report.policy = 'Figma-defined contrast observations are non-blocking by product decision; raw axe findings are retained. Not WCAG certification.';
  await writeFile(resolve(output, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Project audit ${report.verdict}; raw axe ${report.automatedVerdict}: ${resolve(output, 'report.json')}`);
  process.exitCode = report.verdict === 'FAIL' ? 1 : 0;
} finally {
  await browser.close();
}
