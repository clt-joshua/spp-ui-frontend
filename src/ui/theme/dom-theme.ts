import type {
  ResolvedThemeMode,
  ThemeColorRoles,
  ThemeConfig,
} from './types';

function toKebabCase(value: string) {
  return value.replace(/[A-Z]/gu, (match) => `-${match.toLowerCase()}`);
}

export function themeRoleVariable(role: keyof ThemeColorRoles) {
  return `--md-sys-color-${toKebabCase(role)}`;
}

export function applyThemeToElement(
  element: HTMLElement,
  config: ThemeConfig,
  resolvedMode: ResolvedThemeMode,
  roles: ThemeColorRoles,
) {
  const roleDeclarations = Object.entries(roles)
    .map(
      ([role, value]) =>
        `${themeRoleVariable(role as keyof ThemeColorRoles)}: ${value}`,
    )
    .join('; ');

  // One style-attribute write prevents an intermediate mixed color scheme.
  element.style.cssText = `${element.style.cssText}; ${roleDeclarations}; color-scheme: ${resolvedMode}`;

  element.dataset.themeId = config.themeId;
  element.dataset.colorScheme = resolvedMode;
  element.dataset.contrast = config.contrast;
}
