import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

const materialRuntimeRestrictions = {
  patterns: [
    {
      group: ['@material/web', '@material/web/*', 'lit', 'lit/*'],
      message:
        'Material Web and Lit are reference-only and are not runtime dependencies.',
    },
  ],
};

export default defineConfig([
  globalIgnores([
    'dist',
    'coverage',
    'storybook-static',
    'playwright-report',
    'test-results',
  ]),
  {
    files: ['**/*.{js,mjs,ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-restricted-imports': ['error', materialRuntimeRestrictions],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/ui/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            ...materialRuntimeRestrictions.patterns,
            {
              group: ['@base-ui/react', '@base-ui/react/*'],
              message: 'Base UI may only be imported from src/ui/** adapters.',
            },
          ],
        },
      ],
    },
  },
]);
