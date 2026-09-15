import { defineConfig, devices } from '@playwright/test';

const isCi = Boolean(process.env.CI);
const isWindows = process.platform === 'win32';
const htmlReport = process.env.PLAYWRIGHT_HTML_REPORT ?? 'playwright-report';
const outputDirectory = process.env.PLAYWRIGHT_OUTPUT_DIR ?? 'test-results';
const previewPort = Number(process.env.PLAYWRIGHT_PORT ?? 4173);
if (!Number.isInteger(previewPort) || previewPort < 1024 || previewPort > 65535) {
  throw new Error('PLAYWRIGHT_PORT must be an integer between 1024 and 65535');
}
const previewUrl = `http://127.0.0.1:${previewPort}`;

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
    baseURL: previewUrl,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: `pnpm preview --host 127.0.0.1 --port ${previewPort} --strictPort`,
    url: previewUrl,
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
