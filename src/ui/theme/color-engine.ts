import {
  Hct,
  SchemeTonalSpot,
  argbFromHex,
  hexFromArgb,
} from '@material/material-color-utilities';
import type {
  ContrastMode,
  GeneratedTheme,
  ThemeColorRole,
  ThemeColorRoles,
} from './types';

const CONTRAST_LEVELS: Record<ContrastMode, number> = {
  standard: 0,
  high: 0.5,
};

export const COLOR_ROLES = [
  'primary',
  'onPrimary',
  'primaryContainer',
  'onPrimaryContainer',
  'secondary',
  'onSecondary',
  'secondaryContainer',
  'onSecondaryContainer',
  'tertiary',
  'onTertiary',
  'tertiaryContainer',
  'onTertiaryContainer',
  'error',
  'onError',
  'errorContainer',
  'onErrorContainer',
  'surface',
  'surfaceDim',
  'surfaceBright',
  'surfaceContainerLowest',
  'surfaceContainerLow',
  'surfaceContainer',
  'surfaceContainerHigh',
  'surfaceContainerHighest',
  'onSurface',
  'onSurfaceVariant',
  'outline',
  'outlineVariant',
  'inverseSurface',
  'inverseOnSurface',
  'inversePrimary',
  'primaryFixed',
  'primaryFixedDim',
  'onPrimaryFixed',
  'onPrimaryFixedVariant',
  'secondaryFixed',
  'secondaryFixedDim',
  'onSecondaryFixed',
  'onSecondaryFixedVariant',
  'tertiaryFixed',
  'tertiaryFixedDim',
  'onTertiaryFixed',
  'onTertiaryFixedVariant',
  'scrim',
  'shadow',
  'surfaceTint',
] as const satisfies readonly ThemeColorRole[];

export function isValidSeedColor(value: string): value is `#${string}` {
  return /^#[0-9A-F]{6}$/iu.test(value);
}

function createScheme(
  seedColor: `#${string}`,
  dark: boolean,
  contrast: ContrastMode,
) {
  const source = Hct.fromInt(argbFromHex(seedColor));
  return new SchemeTonalSpot(source, dark, CONTRAST_LEVELS[contrast]);
}

function extractRoles(
  scheme: SchemeTonalSpot,
): ThemeColorRoles {
  return Object.fromEntries(
    COLOR_ROLES.map((role) => [
      role,
      hexFromArgb(scheme[role]).toUpperCase() as `#${string}`,
    ]),
  ) as ThemeColorRoles;
}

export function generateTheme(
  seedColor: `#${string}`,
  contrast: ContrastMode,
): GeneratedTheme {
  if (!isValidSeedColor(seedColor)) {
    throw new Error(`Invalid theme seed: ${seedColor}`);
  }

  return {
    light: extractRoles(createScheme(seedColor, false, contrast)),
    dark: extractRoles(createScheme(seedColor, true, contrast)),
  };
}
