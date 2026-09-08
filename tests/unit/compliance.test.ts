import { describe, expect, it } from 'vitest';
import {
  M3_CHECKED_AREAS,
  M3_COMPONENT_MANIFEST,
} from '../../src/ui/compliance/m3-component-manifest';

describe('M3 compliance manifest', () => {
  it('records the complete governance schema without claiming premature PASS', () => {
    expect(M3_COMPONENT_MANIFEST).toHaveLength(15);

    for (const record of M3_COMPONENT_MANIFEST) {
      expect(record.m3WebUrl).toBe('https://m3.material.io/develop/web');
      expect(record.m3ComponentUrls.length).toBeGreaterThan(0);
      expect(record.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/u);
      expect(new Date(record.verifiedAt).toISOString().slice(0, 10)).toBe(record.verifiedAt);
      expect(record.checkedAreas).toEqual(M3_CHECKED_AREAS);
      if (record.component === 'DataGrid') {
        expect(record.materialWebReferenceStatus).toBe('unavailable');
        expect(record.deviations).toHaveLength(2);
      } else if (record.component === 'Button') {
        expect(record.deviations).toHaveLength(3);
      } else if (record.component === 'IconButton') {
        expect(record.deviations).toHaveLength(3);
      } else if (record.component === 'Checkbox') {
        expect(record.deviations).toHaveLength(2);
      } else if (record.component === 'Radio') {
        expect(record.deviations).toHaveLength(3);
      } else if (record.component === 'Tabs') {
        expect(record.deviations).toHaveLength(3);
      } else if (record.component === 'Switch') {
        expect(record.deviations).toHaveLength(3);
        expect(record.blockers).toHaveLength(1);
        expect(record.blockers.join(' ')).not.toContain('M3_WEB_SPEC_CONFLICT');
      } else if (record.component === 'SegmentedButton') {
        expect(record.deviations).toHaveLength(4);
        expect(record.materialWebReferenceStatus).toBe('unavailable');
      } else if (record.component === 'Chip') {
        expect(record.deviations).toHaveLength(1);
      } else if (record.component === 'TextField') {
        expect(record.verifiedAt).toBe('2026-09-07');
        expect(record.deviations).toHaveLength(4);
        expect(record.deviations.join(' ')).toContain('Figma 10724:14659');
        expect(record.deviations.join(' ')).toContain('67ms delay + 83ms');
        expect(record.deviations.join(' ')).toContain('empty unfocused affixes remain hidden');
        expect(record.blockers.join(' ')).toContain('M3_WEB_SPEC_CONFLICT');
        expect(record.blockers.join(' ')).toContain('placeholder and affix');
      } else if (record.component === 'AutoComplete') {
        expect(record.materialWebReferenceStatus).toBe('unavailable');
        expect(record.deviations).toHaveLength(2);
      } else if (record.component === 'Menu' || record.component === 'Select') {
        expect(record.deviations).toHaveLength(1);
      } else {
        expect(record.deviations).toEqual([]);
      }
      expect(record.implementationStatus).toBe('implemented');
      expect(record.status).toBe('BLOCKED');
      expect(record.blockers.length).toBeGreaterThan(0);
      expect(record.blockers.join(' ')).not.toMatch(/Linux|visual baseline/iu);
      if (['Menu', 'Select', 'AutoComplete'].includes(record.component)) {
        expect(record.deviations.join(' ')).toContain('static neutral 3px inward ring');
        expect(record.deviations.join(' ')).toContain('10742:16969');
        expect(record.deviations.join(' ')).toContain('Pointer highlighting does not imply focus-visible');
      }

      if (record.materialWebReferenceStatus === 'available') {
        expect(record.materialWebMainDocs.length).toBeGreaterThan(0);
        expect(record.materialWebSnapshotDocs.length).toBeGreaterThan(0);
      }
    }

    expect(M3_COMPONENT_MANIFEST.find((record) => record.component === 'Chip'))
      .toMatchObject({
        materialWebReferenceStatus: 'available',
        verifiedAt: '2026-09-02',
      });
    expect(M3_COMPONENT_MANIFEST.find((record) => record.component === 'Button'))
      .toMatchObject({
        materialWebReferenceStatus: 'available',
        verifiedAt: '2026-09-02',
      });
    expect(M3_COMPONENT_MANIFEST.find((record) => record.component === 'Checkbox'))
      .toMatchObject({
        materialWebReferenceStatus: 'available',
        verifiedAt: '2026-09-02',
      });
    expect(M3_COMPONENT_MANIFEST.find((record) => record.component === 'IconButton'))
      .toMatchObject({
        materialWebReferenceStatus: 'available',
        verifiedAt: '2026-09-03',
      });
    expect(M3_COMPONENT_MANIFEST.find((record) => record.component === 'Radio'))
      .toMatchObject({
        materialWebReferenceStatus: 'available',
        verifiedAt: '2026-09-03',
      });
    expect(M3_COMPONENT_MANIFEST.find((record) => record.component === 'Tabs'))
      .toMatchObject({
        materialWebReferenceStatus: 'available',
        verifiedAt: '2026-09-03',
      });
    expect(M3_COMPONENT_MANIFEST.find((record) => record.component === 'Switch'))
      .toMatchObject({
        materialWebReferenceStatus: 'available',
        verifiedAt: '2026-09-03',
      });
    expect(M3_COMPONENT_MANIFEST.find((record) => record.component === 'SegmentedButton'))
      .toMatchObject({
        materialWebReferenceStatus: 'unavailable',
        verifiedAt: '2026-09-03',
      });
  });
});
