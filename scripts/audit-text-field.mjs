import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';
import axe from 'axe-core';

const baseURL = process.env.TEXT_FIELD_AUDIT_URL ?? 'http://127.0.0.1:5174';
const output = resolve(process.env.TEXT_FIELD_AUDIT_OUTPUT ?? 'test-results/text-field-audit');
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const report = { baseURL, capturedAt: new Date().toISOString(), browser: browser.version(), themes: [] };
try {
  for (const [mode, label] of [['light', '라이트'], ['dark', '다크']]) {
    for (const high of [false, true]) {
      const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
      await page.goto(baseURL);
      if (await page.title() !== 'SPP UI Theme Lab') throw new Error('Unexpected app: refusing to audit a different project');
      await page.getByRole('button', { name: 'Normal', exact: true }).click();
      await page.getByRole('button', { name: label, exact: true }).click();
      await page.getByRole('checkbox', { name: '고대비 색상' }).setChecked(high);
      await page.getByRole('button', { name: '테마 적용', exact: true }).click();
      await page.getByRole('link', { name: '컴포넌트 검증', exact: true }).click();
      await page.getByRole('link', { name: 'Form fields TextField · Select' }).click();
      await page.evaluate(() => document.fonts.ready);
      await page.addScriptTag({ content: axe.source });
      const result = await page.evaluate(async () => {
        const { violations, incomplete } = await window.axe.run(document.getElementById('form-fields'));
        const luminance = (value) => {
          const c = value.match(/[\d.]+/gu).slice(0, 3).map(Number).map((n) => n / 255).map((n) => n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4);
          return c[0] * .2126 + c[1] * .7152 + c[2] * .0722;
        };
        const fields = [...document.querySelectorAll('[data-text-field-variant="outlined"]:not([data-disabled])')].map((root) => {
          const input = root.querySelector('input, textarea');
          const bg = getComputedStyle(root.querySelector('[data-slot="text-field-control"]')).backgroundColor;
          const color = getComputedStyle(input).color;
          const placeholder = getComputedStyle(input, '::placeholder').color;
          const ratio = (fg) => (Math.max(luminance(fg), luminance(bg)) + .05) / (Math.min(luminance(fg), luminance(bg)) + .05);
          const affix = root.querySelector('[data-slot="prefix"], [data-slot="suffix"]');
          const affixColor = affix ? getComputedStyle(affix).color : null;
          return { label: root.querySelector('label').textContent, background: bg, color, placeholder, placeholderVisible: input.value === '' && input.placeholder.trim() !== '', valueContrast: ratio(color), placeholderContrast: ratio(placeholder), affixColor, affixContrast: affixColor ? ratio(affixColor) : null };
        });
        return {
          theme: { ...document.documentElement.dataset }, fields,
          violations: violations.map(({ id, impact, nodes }) => ({ id, impact, nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })) })),
          incomplete: incomplete.map(({ id, nodes }) => ({ id, count: nodes.length })),
        };
      });
      const name = `${mode}-${high ? 'high' : 'standard'}`;
      for (const size of ['small', 'large']) {
        const matrix = page.getByRole('region', { name: `TextField ${size} matrix` });
        await matrix.scrollIntoViewIfNeeded();
        await page.mouse.move(0, 0);
        const box = await matrix.boundingBox();
        // Scroll past the app's sticky header, without changing the rendered UI.
        if (box && box.y < 96) {
          await page.mouse.wheel(0, box.y - 96);
          await page.waitForTimeout(200);
        }
        await matrix.screenshot({ path: resolve(output, `${name}-${size}.png`) });
      }
      report.themes.push({ name, ...result });
      console.log(`${name}: axe violations=${result.violations.length}, incomplete=${result.incomplete.map((v) => `${v.id}:${v.count}`).join(',')}; lowest value/placeholder/affix contrast=${Math.min(...result.fields.map((f) => f.valueContrast)).toFixed(2)}/${Math.min(...result.fields.filter((f) => f.placeholderVisible).map((f) => f.placeholderContrast)).toFixed(2)}/${Math.min(...result.fields.filter((f) => f.affixContrast !== null).map((f) => f.affixContrast)).toFixed(2)}`);
      await page.close();
    }
  }
  report.verdict = report.themes.some((t) => t.violations.length || t.fields.some((f) => f.valueContrast < 4.5 || (f.placeholderVisible && f.placeholderContrast < 4.5) || (f.affixContrast !== null && f.affixContrast < 4.5))) ? 'FAIL' : report.themes.some((t) => t.incomplete.length) ? 'BLOCKED' : 'PASS';
  await writeFile(resolve(output, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  process.exitCode = report.verdict === 'PASS' ? 0 : 1;
} finally {
  await browser.close();
}
