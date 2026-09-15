import { useState } from 'react';
import { Button, Chip, ChipSet, type ChipSize, type ChipAssistiveLevel } from '@/ui';
import { SampleGroup } from './SampleGroup';
import styles from '../ComponentGalleryPage.module.css';

const chipSizes: ChipSize[] = ['large', 'small', 'x-small'];
const assistiveLevels: ChipAssistiveLevel[] = [
  'primary',
  'secondary',
  'neutral',
  'outline',
  'systemError',
  'systemWarning',
  'systemGood',
  'systemInfo',
  'systemErrorVariant',
  'systemWarningVariant',
  'systemGoodVariant',
  'systemInfoVariant',
];

export function ChipGallery() {
  const [filterSelected, setFilterSelected] = useState(false);
  const [inputChipVisible, setInputChipVisible] = useState(true);

  return (
    <>
      {chipSizes.map((size) => (
        <SampleGroup key={size} title={`Assistive · ${size}`}>
          <ChipSet label={`${size} Assistive level 전체`}>
            {assistiveLevels.map((level) => (
              <Chip key={level} level={level} size={size}>{level}</Chip>
            ))}
          </ChipSet>
        </SampleGroup>
      ))}
      
      <SampleGroup title="Filter · state × size">
        {chipSizes.map((size) => (
          <div className={styles.variantRow} key={size}>
            <span className={styles.variantLabel}>{size}</span>
            <ChipSet label={`${size} Filter states`}>
              <Chip
                chipType="filter"
                onSelectedChange={size === 'large' ? setFilterSelected : undefined}
                selected={size === 'large' ? filterSelected : undefined}
                size={size}
              >
                Label
              </Chip>
              <Chip chipType="filter" selected size={size}>Label</Chip>
            </ChipSet>
          </div>
        ))}
      </SampleGroup>
      
      <SampleGroup title="Input · state × size">
        {chipSizes.map((size) => (
          <div className={styles.variantRow} key={size}>
            <span className={styles.variantLabel}>{size}</span>
            <ChipSet label={`${size} Input states`}>
              {size !== 'large' || inputChipVisible ? (
                <Chip
                  chipType="input"
                  onRemove={size === 'large' ? () => setInputChipVisible(false) : undefined}
                  removeLabel={size === 'large' ? 'Gallery Input chip 삭제' : undefined}
                  removeOnly
                  size={size}
                >
                  Label
                </Chip>
              ) : null}
              <Chip chipType="input" removeOnly selected size={size}>Label</Chip>
            </ChipSet>
          </div>
        ))}
        {!inputChipVisible ? (
          <Button onClick={() => setInputChipVisible(true)} variant="text">Input Chip 다시 표시</Button>
        ) : null}
      </SampleGroup>
      
      <SampleGroup title="Location · project-specific display">
        <div className={styles.variantRow}>
          <span className={styles.variantLabel}>small</span>
          <Chip chipType="location" prefix="X">6.058m</Chip>
        </div>
      </SampleGroup>
      
      <SampleGroup title="Disabled">
        <ChipSet label="비활성 Chip 상태">
          <Chip chipType="filter" disabled>Filter</Chip>
          <Chip chipType="input" disabled removeOnly>Input</Chip>
        </ChipSet>
      </SampleGroup>
    </>
  );
}
