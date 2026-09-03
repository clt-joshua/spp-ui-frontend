import type {
  ResolvedThemeMode,
  ThemeColorRoles,
  ThemeConfig,
} from './types';
import { COLOR_ROLES } from './color-engine';

const GENERATED_FIGMA_ROLE_FALLBACKS = {
  '--md-sys-color-custom-container': 'secondaryContainer',
  '--md-sys-color-on-custom-container': 'onSecondaryContainer',
} as const satisfies Record<string, keyof ThemeColorRoles>;

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
  roles: ThemeColorRoles | null,
) {
  element.style.removeProperty('color-scheme');
  for (const role of COLOR_ROLES) {
    element.style.removeProperty(themeRoleVariable(role));
  }
  for (const variable of Object.keys(GENERATED_FIGMA_ROLE_FALLBACKS)) {
    element.style.removeProperty(variable);
  }
  if (roles) {
    for (const [role, value] of Object.entries(roles)) {
      element.style.setProperty(
        themeRoleVariable(role as keyof ThemeColorRoles),
        value,
      );
    }
    for (const [variable, role] of Object.entries(GENERATED_FIGMA_ROLE_FALLBACKS)) {
      element.style.setProperty(variable, roles[role]);
    }
  }
  element.style.colorScheme = resolvedMode;

  element.dataset.themeId = config.themeId;
  element.dataset.colorScheme = resolvedMode;
  element.dataset.contrast = config.contrast;
}
