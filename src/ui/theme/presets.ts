import type { ThemeConfig } from './types';

export const THEME_PRESETS = [
  { id: 'material', label: 'Material Purple', seedColor: '#6750A4' },
  { id: 'ocean', label: 'Ocean', seedColor: '#00639B' },
  { id: 'forest', label: 'Forest', seedColor: '#386A20' },
  { id: 'sunset', label: 'Sunset', seedColor: '#8B5000' },
] as const;

export type ThemePresetId = (typeof THEME_PRESETS)[number]['id'];

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  themeId: 'material',
  seedColor: '#6750A4',
  mode: 'system',
  contrast: 'standard',
  variant: 'tonalSpot',
  generatorVersion: 'md3-theme-v1',
};

export function getThemePreset(id: string) {
  return THEME_PRESETS.find((preset) => preset.id === id);
}

export function configFromPreset(
  id: ThemePresetId,
  current: ThemeConfig,
): ThemeConfig {
  const preset = getThemePreset(id);
  return preset
    ? { ...current, themeId: preset.id, seedColor: preset.seedColor }
    : current;
}
