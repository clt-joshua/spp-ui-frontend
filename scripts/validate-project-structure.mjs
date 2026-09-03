import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];

const requiredFiles = [
  'README.md',
  'AGENTS.md',
  'PROJECT_MEMORY.md',
  'package.json',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'vite.config.ts',
  'tsconfig.app.json',
  'tsconfig.test.json',
  '.github/workflows/ci.yml',
  'playwright.config.ts',
  'docs/README.md',
  'docs/00-governance/00-M3-WEB-COMPLIANCE.md',
  'docs/01-product/02-GOALS-AND-DECISIONS.md',
  'docs/02-architecture/03-ARCHITECTURE-AND-SETUP.md',
  'docs/02-architecture/04-TOKENS-AND-DYNAMIC-THEME.md',
  'docs/02-architecture/05-COMPONENTS-AND-INTERACTIONS.md',
  'docs/03-delivery/06-IMPLEMENTATION-AND-VALIDATION.md',
  'docs/03-delivery/07-VIBE-CODING-PLAYBOOK.md',
  'docs/03-delivery/08-CI-AND-VISUAL-BASELINE-PROPOSAL.md',
  'docs/03-delivery/09-UI-IMPLEMENTATION-STATUS.md',
  'docs/04-reference/01-MATERIAL-WEB-DOC-MAP.md',
  'docs/04-reference/SOURCES.md',
  'docs/project-memory/CURRENT-STATE.md',
  'docs/project-memory/DECISION-INDEX.md',
  'docs/project-memory/OPEN-QUESTIONS.md',
  'src/main.tsx',
  'src/pages/ComponentGalleryPage.tsx',
  'src/pages/ComponentGalleryPage.module.css',
  'src/ui/index.ts',
  'src/ui/compliance/spec-baseline.ts',
  'src/ui/compliance/m3-component-manifest.ts',
  'src/ui/icons/MaterialIcon.tsx',
  'src/ui/styles/layers.css',
  'src/ui/tokens/reference.css',
  'src/ui/tokens/system.css',
  'src/ui/tokens/component.css',
  '.storybook/main.ts',
  '.storybook/preview.tsx',
  'vitest.config.ts',
  'tests/unit/theme-runtime.test.ts',
  'tests/unit/components.test.tsx',
  'tests/unit/compliance.test.ts',
  'scripts/run-playwright-container.mjs',
  'tests/e2e/foundation.spec.ts',
];

const requiredDirectories = [
  'src/ui/providers',
  'src/ui/theme',
  'src/ui/tokens',
  'src/ui/interactions',
  'src/ui/icons',
  'src/ui/styles',
  'src/pages',
  'src/ui/components/Button',
  'src/ui/components/IconButton',
  'src/ui/components/TextField',
  'src/ui/components/Checkbox',
  'src/ui/components/Radio',
  'src/ui/components/Tabs',
  'src/ui/components/SegmentedButton',
  'src/ui/components/Switch',
  'src/ui/components/Chip',
  'src/ui/components/Select',
  'src/ui/components/Dialog',
  'src/ui/components/Menu',
  'src/ui/components/Snackbar',
  'tests/e2e',
];

for (const file of requiredFiles) {
  const absolutePath = join(projectRoot, file);
  if (!existsSync(absolutePath) || !statSync(absolutePath).isFile()) {
    errors.push(`Missing required file: ${file}`);
  }
}

for (const directory of requiredDirectories) {
  const absolutePath = join(projectRoot, directory);
  if (!existsSync(absolutePath) || !statSync(absolutePath).isDirectory()) {
    errors.push(`Missing required directory: ${directory}`);
  }
}

for (const entry of readdirSync(projectRoot, { withFileTypes: true })) {
  if (
    entry.isFile() &&
    (/^\d{2}-.*\.md$/u.test(entry.name) || entry.name === 'SOURCES.md')
  ) {
    errors.push(`Document should be classified under docs/: ${entry.name}`);
  }
}

const canonicalDocuments = requiredFiles.filter((file) =>
  /^docs\/(?:00-governance|01-product|02-architecture|03-delivery|04-reference)\//u.test(
    file,
  ),
);
const expectedCommit = 'b4de401eb665ec63474f39319a4ba8f2145974cc';

for (const document of canonicalDocuments) {
  if (!existsSync(join(projectRoot, document))) {
    continue;
  }

  const content = readFileSync(join(projectRoot, document), 'utf8');
  if (!/^---\r?\n/u.test(content)) {
    continue;
  }
  if (!/^verified_at: 2026-08-25$/mu.test(content)) {
    errors.push(`Missing or inconsistent verified_at baseline: ${document}`);
  }
  if (!new RegExp(`^  commit: ${expectedCommit}$`, 'mu').test(content)) {
    errors.push(`Missing or inconsistent Material Web commit: ${document}`);
  }
  if (!/^compliance_required: true$/mu.test(content)) {
    errors.push(`Missing compliance_required marker: ${document}`);
  }
}

function collectMarkdownFiles(directory) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') {
      continue;
    }
    const absolutePath = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectMarkdownFiles(absolutePath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(absolutePath);
    }
  }
  return files;
}

const markdownFiles = collectMarkdownFiles(projectRoot);
const linkPattern = /\[[^\]]*\]\((?<target>[^)]+)\)/gu;

for (const markdownFile of markdownFiles) {
  const content = readFileSync(markdownFile, 'utf8');
  for (const match of content.matchAll(linkPattern)) {
    const target = match.groups?.target.trim().replace(/^<|>$/gu, '');
    if (!target || /^(?:https?:\/\/|mailto:|#)/u.test(target)) {
      continue;
    }
    const pathPart = target.split('#', 1)[0];
    if (!pathPart) {
      continue;
    }
    const resolvedPath = resolve(dirname(markdownFile), decodeURIComponent(pathPart));
    if (!existsSync(resolvedPath)) {
      errors.push(
        `Broken relative link in ${relative(projectRoot, markdownFile)}: ${target}`,
      );
    }
  }
}

const manifestPath = join(
  projectRoot,
  'src/ui/compliance/m3-component-manifest.ts',
);
if (existsSync(manifestPath)) {
  const manifest = readFileSync(manifestPath, 'utf8');
  for (const field of [
    'm3WebUrl',
    'materialWebMainDocs',
    'materialWebSnapshotDocs',
    'verifiedAt',
    'checkedAreas',
    'deviations',
    'status',
  ]) {
    if (!manifest.includes(`${field}:`)) {
      errors.push(`MVP manifest is missing governance field: ${field}`);
    }
  }
  for (const component of [
    'Button',
    'IconButton',
    'TextField',
    'Checkbox',
    'Radio',
    'Tabs',
    'SegmentedButton',
    'Switch',
    'Chip',
    'Select',
    'Dialog',
    'Menu',
    'Snackbar',
  ]) {
    if (!manifest.includes(`component: '${component}'`)) {
      errors.push(`Missing MVP component in manifest: ${component}`);
    }
  }
}

function collectSourceFiles(directory) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(absolutePath));
    } else if (entry.isFile() && /\.[cm]?[jt]sx?$/u.test(entry.name)) {
      files.push(absolutePath);
    }
  }
  return files;
}

for (const sourceFile of collectSourceFiles(join(projectRoot, 'src'))) {
  const sourcePath = relative(projectRoot, sourceFile).replaceAll('\\', '/');
  if (sourcePath.startsWith('src/ui/')) continue;
  const source = readFileSync(sourceFile, 'utf8');
  if (/from\s+['"](?:@\/ui\/|(?:\.\.\/|\.\/)ui\/)/u.test(source)) {
    errors.push(`Application code bypasses src/ui/index.ts: ${sourcePath}`);
  }
}

const publicUiPath = join(projectRoot, 'src/ui/index.ts');
if (existsSync(publicUiPath) && readFileSync(publicUiPath, 'utf8').includes('DialogPrimitive')) {
  errors.push('Public UI entry point exposes the internal Base UI Dialog namespace.');
}

const workflowPath = join(projectRoot, '.github/workflows/ci.yml');
if (existsSync(workflowPath)) {
  const workflow = readFileSync(workflowPath, 'utf8');
  for (const requiredPolicy of [
    'node-version-file: .nvmrc',
    'pnpm install --frozen-lockfile',
    'mcr.microsoft.com/playwright:v1.62.1-noble@sha256:dcc5531e97840b9b5e794f2814476b21571c5124a3fca2267d73041f56e7580e',
    'browser: [chromium, firefox, webkit]',
    'retention-days: 14',
    'HOME: /root',
    'actions/upload-artifact@v7',
    'rhysd/actionlint:1.7.12@sha256:b1934ee5f1c509618f2508e6eb47ee0d3520686341fec936f3b79331f9315667',
  ]) {
    if (!workflow.includes(requiredPolicy)) {
      errors.push(`CI workflow is missing policy: ${requiredPolicy}`);
    }
  }
}

const workspaceConfigPath = join(projectRoot, 'pnpm-workspace.yaml');
if (existsSync(workspaceConfigPath)) {
  const workspaceConfig = readFileSync(workspaceConfigPath, 'utf8');
  for (const requiredRuntimePolicy of [
    'useNodeVersion: 24.19.0',
    'nodeVersion: 24.19.0',
    'engineStrict: true',
    'onlyBuiltDependencies:',
    '  - esbuild',
  ]) {
    if (!workspaceConfig.includes(requiredRuntimePolicy)) {
      errors.push(
        `pnpm workspace is missing runtime policy: ${requiredRuntimePolicy}`,
      );
    }
  }
}

if (errors.length > 0) {
  console.error(`Project structure validation failed with ${errors.length} error(s):`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log('Project structure validation passed.');
  console.log(`- Required files: ${requiredFiles.length}`);
  console.log(`- Required directories: ${requiredDirectories.length}`);
  console.log(`- Markdown files checked: ${markdownFiles.length}`);
  console.log('- Component manifest entries: 13');
}
