import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const referenceCss = readFileSync(
  resolve(process.cwd(), 'src/ui/tokens/reference.css'),
  'utf8',
);
const systemCss = readFileSync(
  resolve(process.cwd(), 'src/ui/tokens/system.css'),
  'utf8',
);
const componentCss = readFileSync(
  resolve(process.cwd(), 'src/ui/tokens/component.css'),
  'utf8',
);

const numberValues = new Map([
  [2, '0.125rem'],
  [4, '0.25rem'],
  [6, '0.375rem'],
  [8, '0.5rem'],
  [10, '0.625rem'],
  [12, '0.75rem'],
  [14, '0.875rem'],
  [16, '1rem'],
  [20, '1.25rem'],
  [24, '1.5rem'],
  [32, '2rem'],
  [36, '2.25rem'],
  [40, '2.5rem'],
  [48, '3rem'],
  [56, '3.5rem'],
  [64, '4rem'],
  [72, '4.5rem'],
  [999, '62.4375rem'],
] as const);

const scale = new Map([
  [25, 2],
  [50, 4],
  [75, 6],
  [100, 8],
  [125, 10],
  [150, 12],
  [175, 14],
  [200, 16],
  [250, 20],
  [300, 24],
  [400, 32],
  [450, 36],
  [500, 40],
  [600, 48],
  [700, 56],
  [800, 64],
  [900, 72],
  [950, 999],
] as const);

function declarations(css: string, prefix: string) {
  return new Map(
    [...css.matchAll(
      new RegExp(`(?<name>--${prefix}[a-z0-9-]+):\\s*(?<value>[^;]+);`, 'gu'),
    )].map(({ groups }) => [
      groups?.name ?? '',
      groups?.value?.trim() ?? '',
    ]),
  );
}

describe('Figma spatial and elevation foundation tokens', () => {
  it('preserves all 18 number primitives as rem-equivalent reference values', () => {
    const numbers = declarations(referenceCss, 'md-ref-number-');
    expect(numbers).toHaveLength(18);

    for (const [number, value] of numberValues) {
      expect(numbers.get(`--md-ref-number-${number}`), String(number)).toBe(value);
    }
  });

  it('maps the complete space, gap, and radius sets to reference numbers', () => {
    const spaces = declarations(systemCss, 'md-sys-space-');
    const gaps = declarations(systemCss, 'md-sys-gap-');
    const radii = declarations(systemCss, 'md-sys-radius-');

    expect(spaces).toHaveLength(18);
    expect(gaps).toHaveLength(17);
    expect(radii).toEqual(new Map([
      ['--md-sys-radius-xxs', 'var(--md-ref-number-4)'],
      ['--md-sys-radius-xs', 'var(--md-ref-number-8)'],
      ['--md-sys-radius-s', 'var(--md-ref-number-12)'],
      ['--md-sys-radius-m', 'var(--md-ref-number-16)'],
      ['--md-sys-radius-l', 'var(--md-ref-number-24)'],
      ['--md-sys-radius-xl', 'var(--md-ref-number-32)'],
      ['--md-sys-radius-xxl', 'var(--md-ref-number-48)'],
      ['--md-sys-radius-full', 'var(--md-ref-number-999)'],
    ]));
    expect(systemCss).toContain('--md-sys-shape-corner-extra-small: var(--md-sys-radius-xxs);');
    expect(systemCss).toContain('--md-sys-shape-corner-small: var(--md-sys-radius-xs);');
    expect(systemCss).toContain('--md-sys-shape-corner-medium: var(--md-sys-radius-s);');
    expect(systemCss).toContain('--md-sys-shape-corner-large: var(--md-sys-radius-m);');
    expect(systemCss).toContain('--md-sys-shape-corner-extra-large: 1.75rem;');
    expect(systemCss).toContain('--md-sys-shape-corner-full: var(--md-sys-radius-full);');

    for (const [step, number] of scale) {
      expect(spaces.get(`--md-sys-space-${step}`), `space/${step}`).toBe(
        `var(--md-ref-number-${number})`,
      );
      if (step !== 950) {
        expect(gaps.get(`--md-sys-gap-${step}`), `gap/${step}`).toBe(
          `var(--md-ref-number-${number})`,
        );
      }
    }
  });

  it('preserves all five Figma elevation effect styles and their bound alpha colors', () => {
    const elevations = declarations(systemCss, 'md-sys-elevation-level');
    expect(elevations).toEqual(new Map([
      ['--md-sys-elevation-level0', 'none'],
      ['--md-sys-elevation-level1', '0 1px 3px 1px var(--md-ref-palette-alpha-black-100), 0 1px 2px 0 var(--md-ref-palette-alpha-black-300)'],
      ['--md-sys-elevation-level2', '0 2px 6px 2px var(--md-ref-palette-alpha-black-100), 0 1px 2px 0 var(--md-ref-palette-alpha-black-300)'],
      ['--md-sys-elevation-level3', '0 1px 3px 0 var(--md-ref-palette-alpha-black-100), 0 4px 8px 3px var(--md-ref-palette-alpha-black-300)'],
      ['--md-sys-elevation-level4', '0 2px 3px 0 var(--md-ref-palette-alpha-black-100), 0 6px 10px 4px var(--md-ref-palette-alpha-black-300)'],
      ['--md-sys-elevation-level5', '0 4px 4px 0 var(--md-ref-palette-alpha-black-100), 0 8px 12px 6px var(--md-ref-palette-alpha-black-300)'],
    ]));
    expect(referenceCss).toContain('--md-ref-palette-alpha-black-100: #0000001F;');
    expect(referenceCss).toContain('--md-ref-palette-alpha-black-300: #00000052;');
  });

  it('routes component spacing through system aliases without bypassing component tokens', () => {
    const expectedMappings = [
      '--md-button-large-horizontal-space: var(--md-sys-space-250);',
      '--md-button-medium-horizontal-space: var(--md-sys-space-200);',
      '--md-button-small-horizontal-space: var(--md-sys-space-150);',
      '--md-text-field-content-gap: var(--md-sys-gap-150);',
      '--md-select-text-field-vertical-space: var(--md-sys-space-100);',
      '--md-menu-item-content-gap: var(--md-sys-gap-200);',
      '--md-dialog-content-gap: var(--md-sys-gap-200);',
      '--md-snackbar-content-gap: var(--md-sys-gap-100);',
      '--md-chip-large-container-height: var(--md-sys-space-400);',
      '--md-chip-small-container-height: var(--md-sys-space-300);',
      '--md-chip-extra-small-container-height: var(--md-sys-space-250);',
      '--md-location-chip-content-gap: var(--md-sys-gap-75);',
      '--md-checkbox-large-container-size: var(--md-sys-space-200);',
      '--md-checkbox-medium-container-size: var(--md-sys-space-200);',
      '--md-checkbox-small-container-size: var(--md-sys-space-150);',
      '--md-checkbox-large-state-layer-size: var(--md-sys-space-450);',
      '--md-checkbox-medium-state-layer-size: var(--md-sys-space-400);',
      '--md-checkbox-small-state-layer-size: var(--md-sys-space-300);',
      '--md-icon-button-large-container-height: var(--md-sys-space-500);',
      '--md-icon-button-medium-container-height: var(--md-sys-space-400);',
      '--md-icon-button-small-container-height: var(--md-sys-space-300);',
      '--md-icon-button-large-icon-size: var(--md-sys-space-300);',
      '--md-icon-button-medium-icon-size: var(--md-sys-space-250);',
      '--md-icon-button-small-icon-size: var(--md-sys-space-200);',
      '--md-button-container-shape: var(--md-sys-shape-corner-full);',
      '--md-icon-button-container-shape: var(--md-sys-radius-xxl);',
      '--md-checkbox-state-layer-shape: var(--md-sys-shape-corner-full);',
      '--md-outlined-text-field-container-shape: var(--md-sys-shape-corner-extra-small);',
      '--md-outlined-select-text-field-container-shape: var(--md-sys-shape-corner-extra-small);',
      '--md-menu-container-shape: var(--md-sys-shape-corner-extra-small);',
      '--md-dialog-container-shape: var(--md-sys-shape-corner-extra-large);',
      '--md-snackbar-container-shape: var(--md-sys-shape-corner-extra-small);',
      '--md-assistive-chip-container-shape: var(--md-sys-shape-corner-small);',
      '--md-location-chip-container-shape: var(--md-sys-shape-corner-extra-small);',
      '--md-elevated-button-container-elevation: var(--md-sys-elevation-level1);',
      '--md-menu-container-elevation: var(--md-sys-elevation-level2);',
      '--md-dialog-container-elevation: var(--md-sys-elevation-level3);',
      '--md-snackbar-container-elevation: var(--md-sys-elevation-level3);',
    ];

    for (const mapping of expectedMappings) expect(componentCss).toContain(mapping);

    const componentModules = [
      'Button/Button.module.css',
      'IconButton/IconButton.module.css',
      'Checkbox/Checkbox.module.css',
      'TextField/TextField.module.css',
      'Select/Select.module.css',
      'Menu/Menu.module.css',
      'Dialog/Dialog.module.css',
      'Snackbar/Snackbar.module.css',
      'Chip/Chip.module.css',
    ];
    for (const file of componentModules) {
      const css = readFileSync(resolve(process.cwd(), 'src/ui/components', file), 'utf8');
      expect(css, file).not.toMatch(/var\(--md-(?:ref|sys)-(?:number|space|gap|radius)-/u);
    }
  });
});
