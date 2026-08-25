import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    // Generated report/storybook HTML files are not application entry points.
    entries: ['index.html'],
  },
  server: {
    port: 5173,
    strictPort: true,
    watch: {
      ignored: [
        '**/.pnpm-store/**',
        '**/artifacts/**',
        '**/dist/**',
        '**/playwright-report/**',
        '**/storybook-static/**',
        '**/test-results/**',
      ],
    },
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
});
