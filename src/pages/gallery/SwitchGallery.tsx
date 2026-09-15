import { useState } from 'react';
import { Switch } from '@/ui';
import { SampleGroup } from './SampleGroup';
import styles from '../ComponentGalleryPage.module.css';

export function SwitchGallery() {
  const [switchSelected, setSwitchSelected] = useState(false);

  return (
    <>
      <SampleGroup title="Switch · selection × disabled">
        <p className={styles.matrixHint}>
          Small 단일 규격입니다. Space와 Enter로 실제 binary 상태를 전환합니다.
        </p>
        <div className={styles.switchMatrix}>
          <div className={styles.switchRow}>
            <span className={styles.variantLabel}>32 × 18</span>
            <span className={styles.switchSample}>
              <Switch
                aria-label="enabled switch"
                onSelectedChange={setSwitchSelected}
                selected={switchSelected}
              />
              <span>Enabled</span>
            </span>
            <span className={styles.switchSample}>
              <Switch aria-label="selected switch" defaultSelected />
              <span>Selected</span>
            </span>
            <span className={styles.switchSample}>
              <Switch aria-label="disabled switch" disabled />
              <span>Disabled</span>
            </span>
            <span className={styles.switchSample}>
              <Switch aria-label="disabled selected switch" defaultSelected disabled />
              <span>Disabled selected</span>
            </span>
          </div>
        </div>
      </SampleGroup>
    </>
  );
}
