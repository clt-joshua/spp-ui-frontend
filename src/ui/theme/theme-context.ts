import { createContext } from 'react';
import type { ThemePresetId } from './presets';
import type {
  ContrastMode,
  ResolvedThemeMode,
  ThemeConfig,
  ThemeMode,
} from './types';

export interface ThemeContextValue {
  config: ThemeConfig;
  appliedConfig: ThemeConfig;
  resolvedMode: ResolvedThemeMode;
  previewTheme(config: ThemeConfig): void;
  applyTheme(config?: ThemeConfig): void;
  cancelPreview(): void;
  setThemePreset(id: ThemePresetId): void;
  setSeedColor(color: `#${string}`): void;
  setMode(mode: ThemeMode): void;
  setContrast(contrast: ContrastMode): void;
  resetTheme(): void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
