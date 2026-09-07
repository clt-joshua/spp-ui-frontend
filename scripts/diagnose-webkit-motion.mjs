import { spawn } from 'node:child_process';
import { webkit } from '@playwright/test';

// Compare the same real app with and without a window under the CI renderer.
// This only observes animations; it never changes durations or assertion rules.
const url = 'http://127.0.0.1:4175';
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4175', '--strictPort'], { stdio: 'ignore', windowsHide: true });
try {
  let ready = false;
  for (let i = 0; i < 100; i++) {
    if (await fetch(url).then((response) => response.ok).catch(() => false)) { ready = true; break; }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  if (!ready) throw new Error('Diagnostic preview did not start');
  for (const headless of [true, false]) {
    const browser = await webkit.launch({ headless });
    try {
      const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 });
      await page.goto(`${url}/components#form-fields`);
      await page.evaluate(() => document.fonts.ready);
      const input = page.getByRole('textbox', { name: 'large text empty enabled', exact: true });
      await input.scrollIntoViewIfNeeded();
      const evidence = await input.evaluate(async (input) => {
        const label = input.closest('[data-text-field-variant]').querySelector('[data-slot="floating-label"]');
        const observed = [];
        const started = performance.now();
        const observer = new MutationObserver(() => {
          for (const animation of label.getAnimations()) {
            observed.push({ elapsed: performance.now() - started, duration: animation.effect.getTiming().duration, currentTime: animation.currentTime });
          }
        });
        observer.observe(label, { attributes: true, attributeFilter: ['style'] });
        input.focus();
        const frames = [];
        for (let i = 0; i < 12; i++) {
          await new Promise(requestAnimationFrame);
          frames.push({ elapsed: performance.now() - started, animations: label.getAnimations().length, y: label.getBoundingClientRect().y });
        }
        observer.disconnect();
        return { reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches, visibility: document.visibilityState, focused: document.activeElement === input, observed, frames };
      });
      console.log(JSON.stringify({ headless, ...evidence }));
    } finally { await browser.close(); }
  }
} finally { server.kill(); }
