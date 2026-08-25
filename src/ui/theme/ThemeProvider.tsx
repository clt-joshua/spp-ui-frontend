import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { generateTheme, isValidSeedColor } from './color-engine';
import { applyThemeToElement } from './dom-theme';
import {
  DEFAULT_THEME_CONFIG,
  configFromPreset,
} from './presets';
import {
  normalizeThemeConfig,
  readStoredTheme,
  writeStoredTheme,
} from './storage';
import type { ResolvedThemeMode, ThemeConfig } from './types';
import { ThemeContext, type ThemeContextValue } from './theme-context';

function getInitialConfig() {
  return typeof window === 'undefined'
    ? DEFAULT_THEME_CONFIG
    : readStoredTheme(window.localStorage);
}

function getSystemMode(): ResolvedThemeMode {
  return typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [appliedConfig, setAppliedConfig] = useState(getInitialConfig);
  const [previewConfig, setPreviewConfig] = useState<ThemeConfig | null>(null);
  const [systemMode, setSystemMode] = useState<ResolvedThemeMode>(getSystemMode);
  const config = previewConfig ?? appliedConfig;
  const resolvedMode = config.mode === 'system' ? systemMode : config.mode;
  const generatedTheme = useMemo(
    () => generateTheme(config.seedColor, config.contrast),
    [config.contrast, config.seedColor],
  );

  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const updateMode = () => setSystemMode(query.matches ? 'dark' : 'light');
    updateMode();
    query.addEventListener('change', updateMode);
    return () => query.removeEventListener('change', updateMode);
  }, []);

  useLayoutEffect(() => {
    applyThemeToElement(
      document.documentElement,
      config,
      resolvedMode,
      generatedTheme[resolvedMode],
    );
  }, [config, generatedTheme, resolvedMode]);

  const persist = useCallback((nextConfig: ThemeConfig) => {
    const normalized = normalizeThemeConfig(nextConfig);
    setAppliedConfig(normalized);
    setPreviewConfig(null);
    try {
      writeStoredTheme(normalized, window.localStorage);
    } catch (error) {
      window.dispatchEvent(
        new CustomEvent('ui-theme-storage-error', { detail: error }),
      );
    }
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      config,
      appliedConfig,
      resolvedMode,
      previewTheme: (nextConfig) => setPreviewConfig(normalizeThemeConfig(nextConfig)),
      applyTheme: (nextConfig = config) => persist(nextConfig),
      cancelPreview: () => setPreviewConfig(null),
      setThemePreset: (id) => persist(configFromPreset(id, config)),
      setSeedColor: (color) => {
        if (isValidSeedColor(color)) {
          persist({ ...config, themeId: 'custom', seedColor: color });
        }
      },
      setMode: (mode) => persist({ ...config, mode }),
      setContrast: (contrast) => persist({ ...config, contrast }),
      resetTheme: () => persist(DEFAULT_THEME_CONFIG),
    }),
    [appliedConfig, config, persist, resolvedMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
