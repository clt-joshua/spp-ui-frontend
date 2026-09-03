import { defineConfig, devices } from '@playwright/test';

const isCi = Boolean(process.env.CI);
const isWindows = process.platform === 'win32';
const htmlReport = process.env.PLAYWRIGHT_HTML_REPORT ?? 'playwright-report';
const outputDirectory = process.env.PLAYWRIGHT_OUTPUT_DIR ?? 'test-results';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  // Motion assertions sample intermediate frames. Windows headless Firefox also
  // shares a software renderer with the other engines, so serialize there to
  // avoid SWGL teardown stalls and zero-frame geometry readback.
  workers: isCi || isWindows ? 1 : 3,
  reporter: [
    [isCi ? 'line' : 'list'],
    ['html', { open: 'never', outputFolder: htmlReport }],
  ],
  outputDir: outputDirectory,
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
  ],
});
