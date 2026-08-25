import { SPEC_BASELINE } from './spec-baseline';

export const M3_CHECKED_AREAS = [
  'anatomy',
  'usage',
  'api-semantics',
  'color',
  'typography',
  'shape',
  'size',
  'elevation',
  'state',
  'ripple',
  'focus',
  'motion',
  'accessibility',
] as const;

export type M3CheckedArea = (typeof M3_CHECKED_AREAS)[number];

export interface M3ComponentManifestEntry {
  component: string;
  m3ComponentUrls: readonly string[];
  materialWebDocPath: string | null;
  materialWebReferenceStatus: 'available' | 'unavailable';
  implementationStatus: 'not-started' | 'implemented';
  complianceStatus: 'BLOCKED' | 'IN_REVIEW' | 'PASS';
  blockers: readonly string[];
}

export const M3_COMPONENT_MANIFEST = [
  {
    component: 'Button',
    m3ComponentUrls: ['https://m3.material.io/components/buttons/overview'],
    materialWebDocPath: 'components/button.md',
    materialWebReferenceStatus: 'available',
    implementationStatus: 'implemented',
    complianceStatus: 'IN_REVIEW',
    blockers: ['Actual assistive technology and forced-colors review is pending.'],
  },
  {
    component: 'IconButton',
    m3ComponentUrls: [
      'https://m3.material.io/components/icon-buttons/overview',
    ],
    materialWebDocPath: 'components/icon-button.md',
    materialWebReferenceStatus: 'available',
    implementationStatus: 'implemented',
    complianceStatus: 'IN_REVIEW',
    blockers: ['Actual assistive technology and forced-colors review is pending.'],
  },
  {
    component: 'TextField',
    m3ComponentUrls: [
      'https://m3.material.io/components/text-fields/overview',
    ],
    materialWebDocPath: 'components/text-field.md',
    materialWebReferenceStatus: 'available',
    implementationStatus: 'implemented',
    complianceStatus: 'IN_REVIEW',
    blockers: ['Actual assistive technology and forced-colors review is pending.'],
  },
  {
    component: 'Checkbox',
    m3ComponentUrls: ['https://m3.material.io/components/checkbox/overview'],
    materialWebDocPath: 'components/checkbox.md',
    materialWebReferenceStatus: 'available',
    implementationStatus: 'implemented',
    complianceStatus: 'IN_REVIEW',
    blockers: ['Actual assistive technology and forced-colors review is pending.'],
  },
  {
    component: 'Select',
    m3ComponentUrls: [],
    materialWebDocPath: 'components/select.md',
    materialWebReferenceStatus: 'available',
    implementationStatus: 'implemented',
    complianceStatus: 'IN_REVIEW',
    blockers: [
      'A direct official M3 component source has not been pinned.',
      'Actual assistive technology and forced-colors review is pending.',
    ],
  },
  {
    component: 'Dialog',
    m3ComponentUrls: ['https://m3.material.io/components/dialogs/overview'],
    materialWebDocPath: 'components/dialog.md',
    materialWebReferenceStatus: 'available',
    implementationStatus: 'implemented',
    complianceStatus: 'IN_REVIEW',
    blockers: ['Actual assistive technology and forced-colors review is pending.'],
  },
  {
    component: 'Menu',
    m3ComponentUrls: ['https://m3.material.io/components/menus/overview'],
    materialWebDocPath: 'components/menu.md',
    materialWebReferenceStatus: 'available',
    implementationStatus: 'implemented',
    complianceStatus: 'IN_REVIEW',
    blockers: ['Actual assistive technology and forced-colors review is pending.'],
  },
  {
    component: 'Snackbar',
    m3ComponentUrls: ['https://m3.material.io/components/snackbar/overview'],
    materialWebDocPath: null,
    materialWebReferenceStatus: 'unavailable',
    implementationStatus: 'implemented',
    complianceStatus: 'IN_REVIEW',
    blockers: [
      'Actual screen reader announcement and forced-colors verification is pending.',
    ],
  },
] as const satisfies readonly M3ComponentManifestEntry[];

export function materialWebMainUrl(docPath: string): string {
  return `${SPEC_BASELINE.materialWeb.docsMain.replace('/tree/', '/blob/')}/${docPath}`;
}

export function materialWebSnapshotUrl(docPath: string): string {
  return `${SPEC_BASELINE.materialWeb.docsSnapshot.replace('/tree/', '/blob/')}/${docPath}`;
}
