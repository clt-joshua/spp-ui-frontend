import type { ResolvedThemeMode, ThemeConfig } from './types';

export const THEME_PRESETS = [
  { id: 'normal', label: 'Normal', seedColor: '#007C8C' },
  { id: 'pink', label: 'Pink', seedColor: '#9A0057' },
  { id: 'yellowgreen', label: 'Yellow Green', seedColor: '#4F6D36' },
  { id: 'purple', label: 'Purple', seedColor: '#794F9E' },
  { id: 'blue', label: 'Blue', seedColor: '#0051B0' },
  { id: 'green', label: 'Green', seedColor: '#13804D' },
  { id: 'orange', label: 'Orange', seedColor: '#913304' },
  { id: 'red', label: 'Red', seedColor: '#9C000B' },
] as const;

export type ThemePresetId = (typeof THEME_PRESETS)[number]['id'];

const LEGACY_PRESET_MIGRATIONS = {
  material: { seedColor: '#6750A4', target: 'purple' },
  ocean: { seedColor: '#00639B', target: 'blue' },
  forest: { seedColor: '#386A20', target: 'green' },
  sunset: { seedColor: '#8B5000', target: 'orange' },
} as const;

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  themeId: 'normal',
  seedColor: '#007C8C',
  mode: 'system',
  contrast: 'standard',
  variant: 'tonalSpot',
  generatorVersion: 'md3-theme-v1',
};

export function getThemePreset(id: string) {
  return THEME_PRESETS.find((preset) => preset.id === id);
}

export function getMigratedThemePreset(id: string, seedColor: string) {
  const legacy = LEGACY_PRESET_MIGRATIONS[
    id as keyof typeof LEGACY_PRESET_MIGRATIONS
  ];
  return legacy?.seedColor === seedColor
    ? getThemePreset(legacy.target)
    : undefined;
}

export function usesFigmaSystemColorPreset(
  config: ThemeConfig,
  resolvedMode: ResolvedThemeMode,
) {
  const preset = getThemePreset(config.themeId);
  return Boolean(
    preset &&
      preset.seedColor === config.seedColor &&
      config.contrast === 'standard' &&
      resolvedMode === 'light',
  );
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
