import { TextField, MaterialIcon } from '@/ui';
import { SampleGroup } from './SampleGroup';
import styles from '../ComponentGalleryPage.module.css';
import { TextFieldExamples } from '../TextFieldExamples';

export function TextFieldGallery() {
  return (
    <>
      <SampleGroup title="TextField variants and states">
        <TextFieldExamples />
        <div className={styles.fieldGrid}>
          <TextField label="Outlined" supportingText="기본 supporting text" />
          <TextField error errorText="입력값을 다시 확인하세요." label="Error" value="Invalid value" readOnly />
          <TextField disabled error label="Disabled" supportingText="비활성 상태 — error보다 disabled 표현 우선" value="Unavailable" />
          <TextField label="Leading icon" leadingIcon={<MaterialIcon name="search" />} value="Search query" readOnly />
          <TextField label="Trailing icon" trailingIcon={<MaterialIcon name="visibility" />} type="password" value="password" readOnly />
        </div>
      </SampleGroup>
    </>
  );
}
