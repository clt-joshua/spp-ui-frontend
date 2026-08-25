import { describe, expect, it } from 'vitest';
import { generateTheme, isValidSeedColor } from '../../src/ui/theme/color-engine';
import { applyThemeToElement } from '../../src/ui/theme/dom-theme';
import { DEFAULT_THEME_CONFIG } from '../../src/ui/theme/presets';
import {
  normalizeThemeConfig,
  readStoredTheme,
  THEME_STORAGE_KEY,
  writeStoredTheme,
} from '../../src/ui/theme/storage';

describe('theme runtime', () => {
  it('generates deterministic light and dark M3 role sets', () => {
    const theme = generateTheme('#6750A4', 'standard');

    expect(theme.light.primary).toMatch(/^#[0-9A-F]{6}$/u);
    expect(theme.dark.primary).not.toBe(theme.light.primary);
    expect(generateTheme('#6750A4', 'standard')).toEqual(theme);
  });

  it('validates and normalizes persisted configuration', () => {
    expect(isValidSeedColor('#00639B')).toBe(true);
    expect(isValidSeedColor('00639B')).toBe(false);
    expect(normalizeThemeConfig({ seedColor: 'invalid' })).toBe(DEFAULT_THEME_CONFIG);
    expect(normalizeThemeConfig({ ...DEFAULT_THEME_CONFIG, seedColor: '#00639B' }).themeId).toBe('custom');
  });

  it('round-trips storage and applies portal-safe document tokens', () => {
    writeStoredTheme(DEFAULT_THEME_CONFIG, localStorage);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).not.toBeNull();
    expect(readStoredTheme(localStorage)).toEqual(DEFAULT_THEME_CONFIG);

    const roles = generateTheme('#6750A4', 'standard').dark;
    applyThemeToElement(document.documentElement, DEFAULT_THEME_CONFIG, 'dark', roles);
    const firstApply = document.documentElement.style.cssText;
    applyThemeToElement(document.documentElement, DEFAULT_THEME_CONFIG, 'dark', roles);
    expect(document.documentElement.dataset.themeId).toBe('material');
    expect(document.documentElement.style.getPropertyValue('--md-sys-color-primary')).toBe(roles.primary);
    expect(document.documentElement.style.colorScheme).toBe('dark');
    expect(document.documentElement.style.cssText).toBe(firstApply);
  });
});
