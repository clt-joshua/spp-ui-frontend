import { useState } from 'react';
import { SegmentedButton, SegmentedButtonSet, MaterialIcon } from '@/ui';
import { SampleGroup } from './SampleGroup';
import styles from '../ComponentGalleryPage.module.css';

export function SegmentedButtonGallery() {
  const [segmentValue, setSegmentValue] = useState<'day' | 'week' | 'month' | 'year' | 'agenda'>('day');
  const [visibleLayers, setVisibleLayers] = useState<Array<'labels' | 'routes' | 'restricted'>>(['labels']);

  return (
    <>
      <SampleGroup title="Segmented Button · single selection">
        <p className={styles.matrixHint}>
          단일 선택은 활성 세그먼트를 다시 눌러 해제하지 않습니다. 각 native button은 Tab으로 이동하고 Space/Enter로 선택합니다.
          {' '}선택 시 아이콘 영역이 150ms 동안 펼쳐지고 체크가 나타납니다. 빠르게 선택을 바꾸거나 모션 감소 설정으로 비교할 수 있습니다.
        </p>
        <div className={styles.segmentedButtonViewport}>
          <SegmentedButtonSet<'day' | 'week' | 'month' | 'year' | 'agenda'>
            label="일정 보기 범위"
            onValueChange={setSegmentValue}
            style={{ inlineSize: '32.25rem' }}
            value={segmentValue}
          >
            <SegmentedButton icon={<MaterialIcon name="today" />} value="day">Day</SegmentedButton>
            <SegmentedButton value="week">Week</SegmentedButton>
            <SegmentedButton value="month">Month</SegmentedButton>
            <SegmentedButton value="year">Year</SegmentedButton>
            <SegmentedButton aria-label="Agenda view" icon={<MaterialIcon name="view_agenda" />} value="agenda" />
          </SegmentedButtonSet>
        </div>
      </SampleGroup>
      
      <SampleGroup title="Segmented Button · multiple and disabled">
        <div className={styles.segmentedButtonStack}>
          <SegmentedButtonSet<'labels' | 'routes' | 'restricted'>
            label="지도 레이어"
            onValueChange={setVisibleLayers}
            selectionMode="multiple"
            value={visibleLayers}
          >
            <SegmentedButton icon={<MaterialIcon name="label" />} value="labels">Labels</SegmentedButton>
            <SegmentedButton icon={<MaterialIcon name="route" />} value="routes">Routes</SegmentedButton>
            <SegmentedButton disabled icon={<MaterialIcon name="lock" />} value="restricted">Restricted</SegmentedButton>
          </SegmentedButtonSet>
          <SegmentedButtonSet defaultValue="selected" label="비활성 선택 상태">
            <SegmentedButton disabled value="selected">Selected disabled</SegmentedButton>
            <SegmentedButton disabled value="unavailable">Disabled</SegmentedButton>
          </SegmentedButtonSet>
        </div>
      </SampleGroup>
      <SampleGroup title="Segmented Button · selection icon options">
        <SegmentedButtonSet label="선택 아이콘 모션 옵션" selectionMode="multiple">
          <SegmentedButton hideSelectedIcon icon={<MaterialIcon name="visibility" />} value="hidden">체크 숨김</SegmentedButton>
          <SegmentedButton selectedIcon={<MaterialIcon name="star" />} value="custom">사용자 아이콘</SegmentedButton>
        </SegmentedButtonSet>
      </SampleGroup>
    </>
  );
}
