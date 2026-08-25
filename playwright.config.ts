import { defineConfig, devices } from '@playwright/test';

const isCi = Boolean(process.env.CI);
const htmlReport = process.env.PLAYWRIGHT_HTML_REPORT ?? 'playwright-report';
const outputDirectory = process.env.PLAYWRIGHT_OUTPUT_DIR ?? 'test-results';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  workers: isCi ? 1 : undefined,
  reporter: [
    [isCi ? 'line' : 'list'],
    ['html', { open: 'never', outputFolder: htmlReport }],
  ],
  outputDir: outputDirectory,
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
    },
  },
  snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}{ext}',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'pnpm preview --host 127.0.0.1',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !isCi,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      testMatch: /e2e\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      testMatch: /e2e\/.*\.spec\.ts/,
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      testMatch: /e2e\/.*\.spec\.ts/,
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'visual-chromium',
      testMatch: /visual\/.*\.visual\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
