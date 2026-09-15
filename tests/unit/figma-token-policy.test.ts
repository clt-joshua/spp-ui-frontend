import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { isFigmaContrastObservation } from '../../src/ui/compliance/figma-contrast-policy';

it('keeps Figma component bindings and separates only necessary existing adapters', () => {
  const component = readFileSync('src/ui/tokens/component.css', 'utf8');
  expect(component).toContain('--md-text-field-figma-affix-color: var(--md-sys-color-outline-high)');
  expect(component).toContain('--md-text-field-figma-placeholder-color: var(--md-sys-color-on-surface-variant-bright)');
  expect(component).toContain('--md-filter-chip-extra-small-selected-label-text-color: var(--md-sys-color-on-surface)');
  expect(component).not.toContain('on-selected-compact');
  const extensions = readFileSync('src/ui/tokens/extensions.css', 'utf8');
  expect(extensions.match(/--md-sys-color-[\w-]+:/gu)).toEqual([
    '--md-sys-color-outline:', '--md-sys-color-outline-variant:', '--md-sys-color-shadow:',
  ]);
  expect(extensions).not.toMatch(/#[\da-f]{3,8}\b/iu);
  const layers = readFileSync('src/ui/styles/layers.css', 'utf8');
  expect(layers.indexOf('extensions.css')).toBeGreaterThan(layers.indexOf('system.css'));
  expect(layers.indexOf('extensions.css')).toBeLessThan(layers.indexOf('component.css'));
});

it('does not turn Figma contrast observations into a blanket accessibility exemption', () => {
  for (const id of ['button', 'chip', 'text-field', 'autocomplete']) {
    expect(isFigmaContrastObservation(id, 'color-contrast')).toBe(true);
    expect(isFigmaContrastObservation(id, 'aria-input-field-name')).toBe(false);
  }
  expect(isFigmaContrastObservation('unknown-new-component', 'color-contrast')).toBe(false);
});
