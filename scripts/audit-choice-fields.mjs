import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const output = 'docs/audits/2026-09-07-choice-fields/runtime';
const baseURL = 'http://127.0.0.1:5174';
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const report = { baseURL, capturedAt: new Date().toISOString(), browser: browser.version(), themes: [] };
try {
  for (const [mode, label] of [['light', '라이트'], ['dark', '다크']]) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(baseURL);
    await expect(page).toHaveTitle('SPP UI Theme Lab');
    await page.getByRole('button', { name: 'Normal', exact: true }).click();
    await page.getByRole('button', { name: label, exact: true }).click();
    await page.getByRole('button', { name: '테마 적용', exact: true }).click();
    await page.getByRole('link', { name: '컴포넌트 검증' }).click();
    await page.getByRole('link', { name: 'Form fields TextField · Select · AutoComplete' }).click();
    const select = page.getByRole('combobox', { name: '선택 테스트', exact: true });
    await select.focus();
    await select.press('Space');
    await expect(page.getByRole('option', { name: '서울', exact: true })).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('option', { name: '부산', exact: true })).toBeFocused();
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: '선택값 제출', exact: true }).click();
    const selectSubmission = await page.getByLabel('Select 제출 결과').textContent();
    expect(selectSubmission).toContain('"destination":"busan"');
    const preview = page.getByRole('region', { name: 'TextField 속성 테스트' });
    await preview.getByRole('checkbox', { name: 'Prefix', exact: true }).check();
    await preview.getByRole('checkbox', { name: 'Suffix', exact: true }).check();
    await expect(preview.locator('[data-slot="prefix"]').locator('..')).toHaveCSS('opacity', '1');
    await preview.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${output}/${mode}-text-field-playground.png` });
    const input = page.getByRole('combobox', { name: '도시 자동완성', exact: true });
    const autoPreview = page.getByRole('region', { name: 'AutoComplete 속성 테스트' });
    await autoPreview.getByRole('checkbox', { name: 'AutoComplete Prefix', exact: true }).check();
    await autoPreview.getByRole('checkbox', { name: 'AutoComplete Suffix', exact: true }).check();
    await expect(autoPreview.locator('[data-slot="prefix"]').locator('..')).toHaveCSS('opacity', '1');
    await input.fill('Se');
    await input.evaluate((element) => element.scrollIntoView({ block: 'center' }));
    await expect(page.getByRole('option')).toHaveCount(2);
    await page.waitForTimeout(650);
    await page.screenshot({ path: `${output}/${mode}-autocomplete-dropdown.png` });
    const options = await page.getByRole('option').allTextContents();
    await input.press('ArrowDown');
    await input.press('Enter');
    await page.getByRole('button', { name: '자동완성 제출', exact: true }).click();
    const submission = await page.getByLabel('AutoComplete 제출 결과').textContent();
    expect(submission).toContain('"city":"Seoul 서울"');
    expect(errors).toEqual([]);
    report.themes.push({ mode, url: page.url(), affixToggles: 'TextField/AutoComplete visible before typing', options, submission, selectSubmission, errors });
    console.log(`${mode}: Select disabled skipping, AutoComplete filter/select/FormData PASS; page errors=${errors.length}`);
    await page.close();
  }
  report.functionalVerdict = 'PASS';
  report.complianceVerdict = 'BLOCKED: inherited token contrast and manual Windows/AT evidence remain unresolved';
  await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
