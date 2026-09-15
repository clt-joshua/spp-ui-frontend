import { describe, expect, it } from 'vitest';
import { galleryComponents, resolveGalleryId } from '../../src/pages/gallery/registry';

describe('component gallery registry', () => {
  it('owns a unique route and example for all 13 public components', () => {
    expect(galleryComponents.map(({ id }) => id)).toEqual([
      'button', 'icon-button', 'tabs', 'segmented-button', 'text-field', 'select', 'autocomplete',
      'checkbox', 'radio', 'switch', 'chip', 'dialog', 'menu',
    ]);
    for (const entry of galleryComponents) {
      expect(resolveGalleryId('#' + entry.id)).toBe(entry.id);
      expect(typeof entry.Example).toBe('function');
    }
  });
  it('resolves legacy and unknown URLs without retaining group routes', () => {
    const aliases = { actions: 'button', navigation: 'tabs', 'form-fields': 'text-field', inputs: 'text-field',
      'selection-controls': 'checkbox', chips: 'chip', dialogs: 'dialog', overlays: 'dialog',
      menus: 'menu', feedback: 'button', snackbar: 'button', unknown: 'button', '': 'button' };
    for (const [alias, expected] of Object.entries(aliases)) expect(resolveGalleryId('#' + alias)).toBe(expected);
    for (const unknown of ['toString', 'constructor', '__proto__']) {
      expect(resolveGalleryId('#' + unknown)).toBe('button');
    }
  });
});
