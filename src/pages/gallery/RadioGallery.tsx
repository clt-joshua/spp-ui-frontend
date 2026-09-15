import { useState } from 'react';
import { Radio, RadioGroup, type RadioSize } from '@/ui';
import { SampleGroup } from './SampleGroup';
import styles from '../ComponentGalleryPage.module.css';

const radioSizes: RadioSize[] = ['large', 'medium', 'small'];

export function RadioGallery() {
  const [radioValue, setRadioValue] = useState('selected');

  return (
    <>
      {radioSizes.map((size) => (
        <SampleGroup key={size} title={`Radio — ${size}`}>
          <div className={styles.radioMatrix}>
            <RadioGroup
              defaultValue={size === 'large' ? undefined : 'selected'}
              label={`${size} enabled group`}
              name={`gallery-radio-${size}-enabled`}
              onValueChange={size === 'large' ? setRadioValue : undefined}
              orientation="horizontal"
              supportingText="방향키로 한 항목만 선택합니다."
              value={size === 'large' ? radioValue : undefined}
            >
              <Radio label={`${size} Unselected`} size={size} value="unselected" />
              <Radio label={`${size} Selected`} size={size} value="selected" />
            </RadioGroup>
            <RadioGroup
              defaultValue="selected"
              disabled
              label={`${size} disabled group`}
              name={`gallery-radio-${size}-disabled`}
              orientation="horizontal"
            >
              <Radio label={`${size} Disabled unselected`} size={size} value="unselected" />
              <Radio label={`${size} Disabled selected`} size={size} value="selected" />
            </RadioGroup>
          </div>
        </SampleGroup>
      ))}
    </>
  );
}
