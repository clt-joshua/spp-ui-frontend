import { useState } from 'react';
import { Checkbox, type CheckboxSize } from '@/ui';
import { SampleGroup } from './SampleGroup';
import styles from '../ComponentGalleryPage.module.css';

const checkboxSizes: CheckboxSize[] = ['large', 'medium', 'small'];

export function CheckboxGallery() {
  const [notifications, setNotifications] = useState(true);

  return (
    <>
      {checkboxSizes.map((size) => (
        <SampleGroup key={size} title={`Checkbox — ${size}`}>
          <div className={styles.checkboxGrid}>
            {size === 'large' ? (
              <Checkbox
                checked={notifications}
                label="large Controlled"
                onCheckedChange={setNotifications}
                size={size}
                supportingText="클릭하여 상태를 확인하세요."
              />
            ) : null}
            <Checkbox label={`${size} Unchecked`} size={size} />
            <Checkbox defaultChecked label={`${size} Checked`} size={size} />
            <Checkbox defaultChecked indeterminate label={`${size} Indeterminate`} size={size} />
            <Checkbox
              error
              errorText="선택을 확인하세요."
              label={`${size} Error unchecked`}
              size={size}
            />
            <Checkbox
              defaultChecked
              error
              errorText="선택을 확인하세요."
              label={`${size} Error checked`}
              size={size}
            />
            <Checkbox
              defaultChecked
              error
              errorText="선택을 확인하세요."
              indeterminate
              label={`${size} Error indeterminate`}
              size={size}
            />
            <Checkbox defaultChecked disabled label={`${size} Disabled checked`} size={size} />
            <Checkbox
              defaultChecked
              disabled
              error
              label={`${size} Disabled error checked`}
              size={size}
            />
          </div>
        </SampleGroup>
      ))}
    </>
  );
}
