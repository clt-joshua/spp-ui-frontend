import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const stage = process.argv[2] === 'before' ? 'before' : 'after';
const output = 'docs/audits/2026-09-07-micro-motion/runtime';
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto('http://127.0.0.1:5174/');
  await page.getByRole('link', { name: '컴포넌트 검증' }).click();
  const control = page.getByRole('switch', { name: 'enabled switch', exact: true });
  await control.scrollIntoViewIfNeeded();
  const frames = await control.evaluate(async (element) => {
    const thumb = element.querySelector('[data-slot="thumb"]');
    const track = element.querySelector('[data-slot="track"]');
    const read = () => ({ x: thumb.getBoundingClientRect().x - track.getBoundingClientRect().x, transition: getComputedStyle(thumb).transition });
    const values = [{ t: 0, ...read() }];
    const started = performance.now();
    element.click();
    while (performance.now() - started < 2000) {
      await new Promise(requestAnimationFrame);
      values.push({ t: performance.now() - started, ...read() });
      if (performance.now() - started > 350 && thumb.getAnimations().every((animation) => animation.playState === 'finished')) break;
    }
    return values;
  });
  await page.getByRole('tab', { name: 'Tokens', exact: true }).focus();
  const focus = await page.getByRole('tab', { name: 'Tokens', exact: true }).locator('[data-slot="focus-ring"]').evaluate((element) => ({ animation: getComputedStyle(element).animation, transition: getComputedStyle(element).transition }));
  const report = { stage, capturedAt: new Date().toISOString(), sourceCommit: 'c05b4b23485c803f68ff31cde52506cea5cc555a', url: page.url(), switchFrames: frames, focus };
  await writeFile(`${output}/${stage}.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ stage, switchStart: frames[0], switchFirstFrame: frames[1], switchEnd: frames.at(-1), focus }, null, 2));
  if (stage === 'after') {
    const themes = [];
    for (const [mode, label] of [['light', '라이트'], ['dark', '다크']]) {
      for (const high of [false, true]) {
        const sample = await browser.newPage({ viewport: { width: 1280, height: 900 } });
        const errors = [];
        sample.on('pageerror', (error) => errors.push(error.message));
        await sample.goto('http://127.0.0.1:5174/');
        await sample.getByRole('button', { name: 'Normal', exact: true }).click();
        await sample.getByRole('button', { name: label, exact: true }).click();
        await sample.getByRole('checkbox', { name: '고대비 색상' }).setChecked(high);
        await sample.getByRole('button', { name: '테마 적용', exact: true }).click();
        await sample.getByRole('link', { name: '컴포넌트 검증' }).click();
        const tab = sample.getByRole('tab', { name: 'Tokens', exact: true });
        await tab.focus();
        await sample.keyboard.down('Space');
        await expect(tab).toHaveAttribute('data-pressed', 'true');
        await expect(tab).toHaveAttribute('aria-selected', 'true');
        await sample.keyboard.up('Space');
        await expect(tab).not.toHaveAttribute('data-pressed');
        await expect(sample.getByRole('tabpanel', { name: 'Tokens', exact: true })).toBeVisible();
        const indicator = sample.locator('[data-slot="active-indicator"]').first();
        await expect.poll(() => indicator.evaluate((element) => element.getAnimations().length)).toBe(0);
        await sample.screenshot({ path: `${output}/${mode}-${high ? 'high' : 'standard'}-tabs.png` });
        const toggle = sample.getByRole('switch', { name: 'enabled switch', exact: true });
        await toggle.click();
        await expect(toggle).toHaveAttribute('aria-checked', 'true');
        await toggle.press('Space');
        await expect(toggle).toHaveAttribute('aria-checked', 'false');
        const select = sample.getByRole('combobox', { name: '선택 테스트', exact: true });
        await select.focus();
        await select.press('Space');
        await expect(sample.getByRole('option', { name: '서울', exact: true })).toBeFocused();
        await sample.keyboard.press('ArrowDown');
        await sample.keyboard.press('Enter');
        await expect(select).toHaveText(/부산/);
        await sample.getByRole('button', { name: '선택값 제출', exact: true }).click();
        const submission = await sample.getByLabel('Select 제출 결과').textContent();
        expect(submission).toContain('"destination":"busan"');
        const dialogTrigger = sample.getByRole('button', { name: '기본 Dialog 열기', exact: true });
        await dialogTrigger.click();
        await expect(sample.getByRole('dialog', { name: '기본 Dialog', exact: true })).toBeVisible();
        await sample.keyboard.press('Escape');
        await expect(dialogTrigger).toBeFocused();
        expect(errors).toEqual([]);
        themes.push({ mode, contrast: high ? 'high' : 'standard', url: sample.url(), submission, pageErrors: errors, tabs: 'Tokens selected; held/released state preserved', switch: 'click selected; Space unselected', dialog: 'Escape closed; focus returned' });
        await sample.close();
      }
    }
    await writeFile(`${output}/themes.json`, JSON.stringify({ capturedAt: new Date().toISOString(), themes }, null, 2));
    console.log(JSON.stringify({ themes }, null, 2));
  }
} finally { await browser.close(); }
