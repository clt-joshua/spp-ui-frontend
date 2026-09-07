import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const stage = process.argv[2] === 'before' ? 'before' : 'after';
const output = 'docs/audits/2026-09-07-choice-fields/runtime';
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto('http://127.0.0.1:5174/');
  await page.getByRole('link', { name: '컴포넌트 검증' }).click();
  await page.getByRole('link', { name: 'Form fields TextField · Select · AutoComplete' }).click();
  await page.evaluate(() => document.fonts.ready);
  const region = page.getByRole('region', { name: 'TextField 속성 테스트' });
  await region.getByRole('checkbox', { name: 'Prefix', exact: true }).check();
  await region.getByRole('checkbox', { name: 'Suffix', exact: true }).check();
  const input = region.getByRole('textbox', { name: '테스트 입력', exact: true });
  const initial = await region.evaluate((element) => {
    const input = element.querySelector('input:not([type="checkbox"])');
    return { value: input.value, affixes: ['prefix', 'suffix'].map((slot) => {
      const affix = element.querySelector(`[data-slot="${slot}"]`);
      return { slot, opacity: getComputedStyle(affix).opacity, visibility: getComputedStyle(affix).visibility, contentOpacity: getComputedStyle(affix.parentElement).opacity };
    }) };
  });
  await region.screenshot({ path: `${output}/${stage}-affix-toggles.png` });
  await input.fill('');
  await region.getByRole('heading').click();
  await page.waitForTimeout(200);
  const reversal = await input.evaluate(async (input) => {
    const root = input.closest('[data-text-field-variant]');
    const label = root.querySelector('[data-slot="floating-label"]');
    input.focus();
    let animation;
    for (let i = 0; i < 8 && !animation; i++) {
      await new Promise(requestAnimationFrame);
      animation = label.getAnimations()[0];
    }
    animation.pause();
    animation.currentTime = 50;
    const before = getComputedStyle(label).transform;
    input.blur();
    await new Promise(requestAnimationFrame);
    const next = label.getAnimations()[0];
    return { before, restart: next?.effect.getKeyframes()[0].transform, contentTransition: getComputedStyle(input.parentElement).transition };
  });
  const report = { stage, url: page.url(), initial, reversal };
  console.log(JSON.stringify(report, null, 2));
  await writeFile(`${output}/${stage}-field-motion.json`, JSON.stringify(report, null, 2));
} finally { await browser.close(); }
