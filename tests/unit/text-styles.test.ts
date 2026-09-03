import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const systemCss = readFileSync(
  resolve(process.cwd(), 'src/ui/tokens/system.css'),
  'utf8',
);
const referenceCss = readFileSync(
  resolve(process.cwd(), 'src/ui/tokens/reference.css'),
  'utf8',
);
const layersCss = readFileSync(
  resolve(process.cwd(), 'src/ui/styles/layers.css'),
  'utf8',
);
const componentCss = readFileSync(
  resolve(process.cwd(), 'src/ui/tokens/component.css'),
  'utf8',
);

const figmaTextStyles = [
  ['display-large', '3.5625rem', '4rem', 'semibold', '-0.015625rem', 'none'],
  ['display-medium', '2.8125rem', '3.25rem', 'semibold', '0', 'none'],
  ['display-small', '2.25rem', '2.75rem', 'semibold', '0', 'none'],
  ['headline-large', '2rem', '2.5rem', 'semibold', '0', 'none'],
  ['headline-medium', '1.75rem', '2.25rem', 'semibold', '0', 'none'],
  ['headline-small', '1.5rem', '2rem', 'semibold', '0', 'none'],
  ['title-xxlarge', '1.375rem', '1.75rem', 'semibold', '0', 'none'],
  ['title-xlarge', '1.25rem', '1.625rem', 'semibold', '0', 'none'],
  ['title-large', '1.125rem', '1.5rem', 'semibold', '0', 'none'],
  ['title-medium', '1rem', '1.5rem', 'semibold', '0.009375rem', 'none'],
  ['title-small', '0.875rem', '1.25rem', 'semibold', '0.00625rem', 'none'],
  ['title-xxlarge-underline', '1.375rem', '1.75rem', 'semibold', '0', 'underline'],
  ['title-medium-underline', '1rem', '1.5rem', 'semibold', '0.009375rem', 'underline'],
  ['title-small-underline', '0.875rem', '1.25rem', 'semibold', '0.00625rem', 'underline'],
  ['body-large-prominent', '1rem', '1.5rem', 'semibold', '0.03125rem', 'none'],
  ['body-large', '1rem', '1.5rem', 'regular', '0.03125rem', 'none'],
  ['body-medium-prominent', '0.875rem', '1.25rem', 'semibold', '0.015625rem', 'none'],
  ['body-medium', '0.875rem', '1.25rem', 'regular', '0.015625rem', 'none'],
  ['body-small-prominent', '0.75rem', '1rem', 'semibold', '0.025rem', 'none'],
  ['body-small', '0.75rem', '1rem', 'regular', '0.025rem', 'none'],
  ['body-large-prominent-underline', '1rem', '1.5rem', 'semibold', '0.03125rem', 'underline'],
  ['body-large-underline', '1rem', '1.5rem', 'regular', '0.03125rem', 'underline'],
  ['body-medium-prominent-underline', '0.875rem', '1.25rem', 'semibold', '0.015625rem', 'underline'],
  ['body-medium-underline', '0.875rem', '1.25rem', 'regular', '0.015625rem', 'underline'],
  ['body-small-prominent-underline', '0.75rem', '1rem', 'semibold', '0.025rem', 'underline'],
  ['body-small-underline', '0.75rem', '1rem', 'regular', '0.025rem', 'underline'],
  ['label-large-prominent', '0.875rem', '1.25rem', 'semibold', '0.00625rem', 'none'],
  ['label-large', '0.875rem', '1.25rem', 'medium', '0.00625rem', 'none'],
  ['label-large-underline', '0.875rem', '1.25rem', 'medium', '0', 'underline'],
  ['label-medium-prominent', '0.75rem', '1rem', 'semibold', '0.03125rem', 'none'],
  ['label-medium', '0.75rem', '1rem', 'medium', '0.03125rem', 'none'],
  ['label-small-prominent', '0.6875rem', '1rem', 'semibold', '0.03125rem', 'none'],
  ['label-small', '0.6875rem', '1rem', 'medium', '0.03125rem', 'none'],
  ['label-small-underline', '0.6875rem', '1rem', 'medium', '0.03125rem', 'underline'],
] as const;

const properties = ['font', 'size', 'line-height', 'weight', 'tracking', 'decoration'] as const;

function tokenValue(role: string, property: (typeof properties)[number]) {
  return systemCss.match(
    new RegExp(`--md-sys-typescale-${role}-${property}:\\s*(?<value>[^;]+);`, 'u'),
  )?.groups?.value?.trim();
}

describe('Figma text style tokens', () => {
  it('preserves all 34 source styles as complete system typography roles', () => {
    expect(figmaTextStyles).toHaveLength(34);

    for (const [role, size, lineHeight, weight, tracking, decoration] of figmaTextStyles) {
      const fontRole = /^(display|headline|title)-/u.test(role) ? 'brand' : 'plain';
      expect(tokenValue(role, 'font'), role).toBe(`var(--md-ref-typeface-${fontRole})`);
      expect(tokenValue(role, 'size'), role).toBe(size);
      expect(tokenValue(role, 'line-height'), role).toBe(lineHeight);
      expect(tokenValue(role, 'weight'), role).toBe(`var(--md-ref-typeface-weight-${weight})`);
      expect(tokenValue(role, 'tracking'), role).toBe(tracking);
      expect(tokenValue(role, 'decoration'), role).toBe(decoration);
    }

    const declarations = systemCss.match(/--md-sys-typescale-[a-z0-9-]+:\s*[^;]+;/gu) ?? [];
    expect(declarations).toHaveLength(figmaTextStyles.length * properties.length);
  });

  it('uses the self-hosted Noto Sans Variable reference adapter', () => {
    expect(layersCss).toContain("@import '@fontsource-variable/noto-sans/wght.css'");
    expect(referenceCss).toContain("--app-font-brand: 'Noto Sans Variable', 'Noto Sans'");
    expect(referenceCss).toContain('--md-ref-typeface-weight-semibold: 600;');
  });

  it('maps every component typography role through tracking and decoration', () => {
    for (const role of ['label-large', 'body-large', 'body-medium', 'body-small', 'headline-small']) {
      for (const property of properties) {
        expect(componentCss, `${role}/${property}`).toContain(
          `var(--md-sys-typescale-${role}-${property})`,
        );
      }
    }

    const componentStyleFiles = [
      'Button/Button.module.css',
      'Chip/Chip.module.css',
      'Checkbox/Checkbox.module.css',
      'Dialog/Dialog.module.css',
      'Menu/Menu.module.css',
      'Select/Select.module.css',
      'Snackbar/Snackbar.module.css',
      'TextField/TextField.module.css',
    ];

    for (const file of componentStyleFiles) {
      const css = readFileSync(resolve(process.cwd(), 'src/ui/components', file), 'utf8');
      expect(css, file).toMatch(/letter-spacing:\s*var\(--md-|letter-spacing:\s*var\(--[a-z-]+-tracking\)/u);
      expect(css, file).toMatch(/text-decoration:\s*var\(--md-|text-decoration:\s*var\(--[a-z-]+-decoration\)/u);
    }
  });
});
