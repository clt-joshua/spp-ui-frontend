import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const mode = process.argv[2];
const testCommands = {
  e2e: 'test tests/e2e --project=chromium --project=firefox --project=webkit',
  visual: 'test tests/visual --project=visual-chromium',
  'visual-update':
    'test tests/visual --project=visual-chromium --update-snapshots',
};

if (!mode || !(mode in testCommands)) {
  console.error(
    'Usage: node scripts/run-playwright-container.mjs <e2e|visual|visual-update>',
  );
  process.exit(1);
}

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dockerImage =
  process.env.PLAYWRIGHT_DOCKER_IMAGE ??
  'mcr.microsoft.com/playwright:v1.62.1-noble@sha256:dcc5531e97840b9b5e794f2814476b21571c5124a3fca2267d73041f56e7580e';
const reportGroup = mode === 'e2e' ? 'e2e' : 'visual';
const containerCommand = [
  'npm install --global pnpm@10.33.0 --silent',
  'PNPM_CLI="$(npm root --global)/pnpm/bin/pnpm.cjs"',
  'npx --yes node@24.19.0 "$PNPM_CLI" install --frozen-lockfile',
  'npx --yes node@24.19.0 "$PNPM_CLI" build',
  `npx --yes node@24.19.0 ./node_modules/@playwright/test/cli.js ${testCommands[mode]}`,
].join(' && ');

const dockerArguments = [
  'run',
  '--rm',
  '--init',
  '--ipc=host',
  '--volume',
  `${projectRoot}:/work`,
  '--volume',
  '/work/node_modules',
  '--volume',
  'spp-ui-playwright-pnpm-store:/root/.local/share/pnpm/store',
  '--workdir',
  '/work',
  '--env',
  'CI=true',
  '--env',
  `PLAYWRIGHT_HTML_REPORT=playwright-report/${reportGroup}`,
  '--env',
  `PLAYWRIGHT_OUTPUT_DIR=test-results/${reportGroup}`,
  dockerImage,
  'bash',
  '-lc',
  containerCommand,
];

const result = spawnSync('docker', dockerArguments, {
  stdio: 'inherit',
  windowsHide: true,
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
