import { DEFAULT_THEME_CONFIG, getThemePreset } from './presets';
import { isValidSeedColor } from './color-engine';
import type { ThemeConfig } from './types';

export const THEME_STORAGE_KEY = 'ui.theme.v1';

export function normalizeThemeConfig(value: unknown): ThemeConfig {
  if (!value || typeof value !== 'object') {
    return DEFAULT_THEME_CONFIG;
  }

  const candidate = value as Partial<ThemeConfig>;
  if (
    typeof candidate.themeId !== 'string' ||
    typeof candidate.seedColor !== 'string' ||
    !isValidSeedColor(candidate.seedColor) ||
    !['light', 'dark', 'system'].includes(candidate.mode ?? '') ||
    !['standard', 'high'].includes(candidate.contrast ?? '') ||
    candidate.variant !== 'tonalSpot' ||
    candidate.generatorVersion !== 'md3-theme-v1'
  ) {
    return DEFAULT_THEME_CONFIG;
  }

  const preset = getThemePreset(candidate.themeId);
  return {
    themeId: preset?.seedColor === candidate.seedColor ? preset.id : 'custom',
    seedColor: candidate.seedColor,
    mode: candidate.mode as ThemeConfig['mode'],
    contrast: candidate.contrast as ThemeConfig['contrast'],
    variant: 'tonalSpot',
    generatorVersion: 'md3-theme-v1',
  };
}

export function readStoredTheme(storage?: Storage): ThemeConfig {
  if (!storage) {
    return DEFAULT_THEME_CONFIG;
  }

  try {
    const value = storage.getItem(THEME_STORAGE_KEY);
    return value ? normalizeThemeConfig(JSON.parse(value)) : DEFAULT_THEME_CONFIG;
  } catch {
    return DEFAULT_THEME_CONFIG;
  }
}

export function writeStoredTheme(config: ThemeConfig, storage?: Storage) {
  if (!storage) {
    return;
  }
  storage.setItem(THEME_STORAGE_KEY, JSON.stringify(config));
}
