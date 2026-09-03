import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const referenceCss = readFileSync(
  resolve(process.cwd(), 'src/ui/tokens/reference.css'),
  'utf8',
);

const paletteEntries = new Map(
  [...referenceCss.matchAll(
    /(?<name>--md-ref-palette-[a-z0-9-]+):\s*(?<value>#[0-9A-F]{6}(?:[0-9A-F]{2})?);/gu,
  )].map((match) => [match.groups!.name, match.groups!.value]),
);

const solidFamilies = [
  'azure',
  'blue',
  'indigo',
  'purple',
  'crimson',
  'pink',
  'gray',
  'red',
  'orange',
  'peach',
  'khaki',
  'coral',
  'warm-gray',
  'teal',
  'emerald',
  'lime',
  'moss',
  'olive',
] as const;

const solidTones = [25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
const alphaTones = [0, 50, 100, 150, 200, 300, 400, 500, 600, 700, 800, 900] as const;

describe('Figma reference palette', () => {
  it('exposes the complete 250-color reference-token contract', () => {
    expect(paletteEntries).toHaveLength(250);

    for (const family of solidFamilies) {
      for (const tone of solidTones) {
        expect(paletteEntries.has(`--md-ref-palette-${family}-${tone}`)).toBe(true);
      }
    }

    expect(paletteEntries.get('--md-ref-palette-white')).toBe('#FFFFFF');
    expect(paletteEntries.get('--md-ref-palette-black')).toBe('#000000');
  });

  it('preserves source values and the dark-to-light tone direction', () => {
    expect(paletteEntries.get('--md-ref-palette-azure-25')).toBe('#002D33');
    expect(paletteEntries.get('--md-ref-palette-azure-300')).toBe('#008192');
    expect(paletteEntries.get('--md-ref-palette-azure-950')).toBe('#EDFDFF');
    expect(paletteEntries.get('--md-ref-palette-red-300')).toBe('#C4000E');
  });

  it('keeps alpha colors as eight-digit hex reference tokens', () => {
    for (const family of ['black', 'white'] as const) {
      for (const tone of alphaTones) {
        expect(
          paletteEntries.get(`--md-ref-palette-alpha-${family}-${tone}`),
        ).toMatch(/^#[0-9A-F]{8}$/u);
      }
    }

    expect(paletteEntries.get('--md-ref-palette-alpha-primary-normal')).toBe(
      '#0081921F',
    );
    expect(paletteEntries.get('--md-ref-palette-alpha-primary-red')).toBe(
      '#C4000E1F',
    );
  });
});
