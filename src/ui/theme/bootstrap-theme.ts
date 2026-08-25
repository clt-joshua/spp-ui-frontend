import { generateTheme } from './color-engine';
import { applyThemeToElement } from './dom-theme';
import { readStoredTheme } from './storage';
import type { ResolvedThemeMode } from './types';

export function bootstrapTheme() {
  const config = readStoredTheme(window.localStorage);
  const resolvedMode: ResolvedThemeMode =
    config.mode === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : config.mode;
  const theme = generateTheme(config.seedColor, config.contrast);
  applyThemeToElement(
    document.documentElement,
    config,
    resolvedMode,
    theme[resolvedMode],
  );
}
