import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const systemCss = fs.readFileSync(
  path.resolve(process.cwd(), 'src/ui/tokens/system.css'),
  'utf8',
);
const referenceCss = fs.readFileSync(
  path.resolve(process.cwd(), 'src/ui/tokens/reference.css'),
  'utf8',
);

const MODES = [
  'normal',
  'pink',
  'yellowgreen',
  'purple',
  'blue',
  'green',
  'orange',
  'red',
] as const;

const FIGMA_MODE_DIGESTS = {
  normal: '979009edf08baf2c',
  pink: '1d12b8e868d6cde0',
  yellowgreen: '9e0d61e0f1398bd9',
  purple: '18d42af0fe6efae2',
  blue: 'b4dd6b13edc2fc5d',
  green: '7543697a68b04885',
  orange: 'e24165a7a402da70',
  red: '1ca6284f76a1aa3c',
} as const;

function declarationsFor(mode: (typeof MODES)[number]) {
  const selector =
    mode === 'normal'
      ? String.raw`:root,\s*:root\[data-theme-id='normal'\]`
      : String.raw`:root\[data-theme-id='${mode}'\]`;
  const match = systemCss.match(new RegExp(`${selector}\\s*\\{(?<body>[^}]*)\\}`, 'u'));
  const body = match?.groups?.body ?? '';
  return [...body.matchAll(/^\s*(?<name>--md-sys-color-[a-z0-9-]+):\s*(?<value>[^;]+);/gmu)]
    .map(({ groups }) => [groups?.name ?? '', groups?.value?.trim() ?? ''] as const);
}

function fnv1a64(value: string) {
  let hash = 14_695_981_039_346_656_037n;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= BigInt(value.charCodeAt(index));
    hash = BigInt.asUintN(64, hash * 1_099_511_628_211n);
  }
  return hash.toString(16).padStart(16, '0');
}

describe('Figma system color tokens', () => {
  it('preserves all 78 source roles in every Figma mode', () => {
    for (const mode of MODES) {
      const declarations = declarationsFor(mode);
      expect(declarations, mode).toHaveLength(78);
      const canonical = declarations
        .map(([name, value]) => `${name}:${value}`)
        .sort()
        .join('\n');
      expect(fnv1a64(canonical), mode).toBe(FIGMA_MODE_DIGESTS[mode]);
    }
  });

  it('keeps the reference-system boundary and the one direct Figma literal', () => {
    const referenceNames = new Set(
      [...referenceCss.matchAll(/(?<name>--md-ref-palette-[a-z0-9-]+):/gu)]
        .map(({ groups }) => groups?.name ?? ''),
    );
    const allDeclarations = MODES.flatMap(declarationsFor);
    const literals: Array<readonly [string, string, string]> = [];

    for (const mode of MODES) {
      for (const [name, value] of declarationsFor(mode)) {
        const alias = value.match(/^var\((--md-ref-palette-[a-z0-9-]+)\)$/u)?.[1];
        if (alias) {
          expect(referenceNames.has(alias), `${mode}/${name}`).toBe(true);
        } else {
          literals.push([mode, name, value]);
        }
      }
    }

    expect(allDeclarations).toHaveLength(624);
    expect(literals).toEqual([
      ['green', '--md-sys-color-on-background', '#171D1A'],
    ]);
  });

  it('exposes the status and state-layer roles used by components', () => {
    const normal = new Map(declarationsFor('normal'));
    expect(normal.get('--md-sys-color-good')).toBe('var(--md-ref-palette-teal-400)');
    expect(normal.get('--md-sys-color-warning-container')).toBe('var(--md-ref-palette-khaki-700)');
    expect(normal.get('--md-sys-color-error')).toBe('var(--md-ref-palette-red-400)');
    expect(normal.get('--md-sys-color-state-layer-table-selected')).toBe(
      'var(--md-ref-palette-alpha-primary-normal)',
    );
  });
});
