import { describe, expect, it } from 'vitest';
import {
  M3_CHECKED_AREAS,
  M3_COMPONENT_MANIFEST,
} from '../../src/ui/compliance/m3-component-manifest';

describe('M3 compliance manifest', () => {
  it('records the complete governance schema without claiming premature PASS', () => {
    expect(M3_COMPONENT_MANIFEST).toHaveLength(13);

    for (const record of M3_COMPONENT_MANIFEST) {
      expect(record.m3WebUrl).toBe('https://m3.material.io/develop/web');
      expect(record.m3ComponentUrls.length).toBeGreaterThan(0);
      expect(record.verifiedAt).toMatch(/^2026-(?:08-26|09-02|09-03)$/u);
      expect(record.checkedAreas).toEqual(M3_CHECKED_AREAS);
      if (record.component === 'Button') {
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
      } else {
        expect(record.deviations).toEqual([]);
      }
      expect(record.implementationStatus).toBe('implemented');
      expect(record.status).toBe('BLOCKED');
      expect(record.blockers.length).toBeGreaterThan(0);
      expect(record.blockers.join(' ')).not.toMatch(/Linux|visual baseline/iu);

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
