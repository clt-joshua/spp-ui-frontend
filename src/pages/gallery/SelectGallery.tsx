import { useState } from 'react';
import { Select } from '@/ui';
import { SampleGroup } from './SampleGroup';
import styles from '../ComponentGalleryPage.module.css';
import { SelectExamples } from '../ChoiceFieldExamples';

export function SelectGallery() {
  const [platform, setPlatform] = useState<'web' | 'desktop' | 'mobile'>('web');

  return (
    <>
      <SampleGroup title="Select variants and states">
        <SelectExamples />
        <div className={styles.fieldGrid}>
          <Select
            label="대상 플랫폼"
            onValueChange={setPlatform}
            options={[
              { value: 'web', label: 'Web application' },
              { value: 'desktop', label: 'Desktop application' },
              { value: 'mobile', label: 'Mobile application' },
            ]}
            supportingText="방향키로 option을 이동합니다."
            value={platform}
          />
          <Select label="Filled select" options={[{ value: 'one', label: 'Option one' }]} value="one" variant="filled" />
          <Select error errorText="필수 항목입니다." label="Error select" options={[{ value: 'one', label: 'Option one' }]} />
          <Select disabled label="Disabled select" options={[{ value: 'one', label: 'Option one' }]} supportingText="비활성 상태" />
        </div>
      </SampleGroup>
    </>
  );
}
