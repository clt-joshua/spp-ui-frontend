import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const output = 'docs/audits/2026-09-07-segmented-button-labs/runtime';
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const themes = [];
try {
  for (const [mode, label] of [['light', '라이트'], ['dark', '다크']]) {
    for (const high of [false, true]) {
      const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto('http://127.0.0.1:5174/');
      await page.getByRole('button', { name: 'Normal', exact: true }).click();
      await page.getByRole('button', { name: label, exact: true }).click();
      await page.getByRole('checkbox', { name: '고대비 색상' }).setChecked(high);
      await page.getByRole('button', { name: '테마 적용', exact: true }).click();
      await page.getByRole('link', { name: '컴포넌트 검증' }).click();
      await page.getByRole('link', { name: 'Navigation Tabs · Segmented Button' }).click();
      const week = page.getByRole('group', { name: '일정 보기 범위', exact: true }).getByRole('button', { name: 'Week', exact: true });
      await week.scrollIntoViewIfNeeded();
      const frames = await week.evaluate(async (element) => {
        const leading = element.querySelector('[data-slot="graphic"]');
        const path = element.querySelector('[data-slot="checkmark-path"]');
        const read = () => ({ width: leading.getBoundingClientRect().width, groupWidth: element.parentElement.getBoundingClientRect().width, phase: element.dataset.selectionMotion ?? '', stroke: parseFloat(getComputedStyle(path).strokeDashoffset), animation: getComputedStyle(path).animationName });
        const values = [{ t: 0, ...read() }];
        const start = performance.now();
        element.click();
        while (performance.now() - start < 2000) {
          await new Promise(requestAnimationFrame);
          values.push({ t: performance.now() - start, ...read() });
          if (performance.now() - start > 350 && values.at(-1).width === 26 && leading.getAnimations().length === 0) break;
        }
        return values;
      });
      expect(frames[0].width).toBe(0);
      expect(frames.some(({ width }) => width > 0 && width < 26)).toBe(true);
      expect(frames.at(-1).width).toBe(26);
      expect(frames.some(({ phase, stroke }) => phase === 'selecting' && stroke > 0 && stroke < 29.7833385)).toBe(true);
      expect(frames.at(-1).stroke).toBe(0);
      expect(frames.every(({ groupWidth }) => groupWidth === frames[0].groupWidth)).toBe(true);
      await expect(week).toHaveAttribute('aria-pressed', 'true');
      const labels = page.getByRole('group', { name: '지도 레이어', exact: true }).getByRole('button', { name: 'Labels', exact: true });
      await labels.press('Space');
      await expect(labels).toHaveAttribute('aria-pressed', 'false');
      await expect(labels.locator('[data-slot="icon"]')).toHaveCSS('opacity', '1');
      await labels.press('Space');
      await expect(labels).toHaveAttribute('aria-pressed', 'true');
      await expect(labels.locator('[data-slot="icon"]')).toHaveCSS('opacity', '0');
      await page.getByRole('button', { name: '사용자 아이콘', exact: true }).click();
      await expect(page.getByRole('button', { name: '사용자 아이콘', exact: true }).locator('[data-slot="selected-icon"]')).toHaveCSS('opacity', '1');
      await week.scrollIntoViewIfNeeded();
      await page.screenshot({ path: `${output}/${mode}-${high ? 'high' : 'standard'}.png` });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await expect(week.locator('[data-slot="graphic"]')).toHaveCSS('transition-duration', '0s');
      await expect(week.locator('[data-slot="checkmark-path"]')).toHaveCSS('animation-name', 'none');
      expect(errors).toEqual([]);
      themes.push({ mode, contrast: high ? 'high' : 'standard', url: page.url(), frames, selected: await week.getAttribute('aria-pressed'), keyboardToggle: 'Space deselect/select passed', reducedMotion: '0s', pageErrors: errors });
      await page.close();
    }
  }
  await writeFile(`${output}/themes.json`, JSON.stringify({ capturedAt: new Date().toISOString(), sourceCommit: 'c05b4b23485c803f68ff31cde52506cea5cc555a', themes }, null, 2));
  console.log(JSON.stringify(themes.map(({ frames, ...theme }) => ({ ...theme, samples: frames.length, start: frames[0], end: frames.at(-1) })), null, 2));
} finally {
  await browser.close();
}
