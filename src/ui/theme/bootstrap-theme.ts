import { generateTheme } from './color-engine';
import { applyThemeToElement } from './dom-theme';
import { usesFigmaSystemColorPreset } from './presets';
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
  const roles = usesFigmaSystemColorPreset(config, resolvedMode)
    ? null
    : generateTheme(config.seedColor, config.contrast)[resolvedMode];
  applyThemeToElement(
    document.documentElement,
    config,
    resolvedMode,
    roles,
  );
}
