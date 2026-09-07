import { useState } from 'react';
import { AutoComplete, Button, Checkbox, Select } from '@/ui';
import styles from './ComponentGalleryPage.module.css';

const suggestions = [
  { label: 'Seoul 서울' }, { label: 'Busan 부산' }, { label: 'Sejong 세종' },
  { label: 'Daegu 대구', disabled: true }, { label: 'Jeju 제주' },
];

export function AutoCompleteExamples() {
  const [value, setValue] = useState('Seoul 서울');
  const [small, setSmall] = useState(false);
  const [flags, setFlags] = useState({ Prefix: false, Suffix: false, Error: false, Disabled: false, Required: false, ReadOnly: false, Clearable: true });
  const [result, setResult] = useState('아직 제출하지 않았습니다.');
  return (
    <section aria-label="AutoComplete 속성 테스트" className={styles.textFieldExamples}>
      <p>직접 입력하거나 제안을 선택합니다. 방향키로 이동, Enter로 적용, Escape로 닫습니다. 목록에 없는 텍스트도 입력·제출할 수 있습니다.</p>
      <div className={styles.row}>
        <Checkbox label="AutoComplete Small 크기 (해제: Large)" checked={small} onCheckedChange={setSmall} />
        {Object.entries(flags).map(([flag, checked]) => <Checkbox key={flag} label={`AutoComplete ${flag}`} checked={checked} onCheckedChange={(next) => setFlags((current) => ({ ...current, [flag]: next }))} />)}
      </div>
      <form className={styles.textFieldExamples} onReset={() => { setValue(''); setResult('초기화했습니다.'); }}
        onSubmit={(event) => { event.preventDefault(); setResult(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget)))); }}>
        <AutoComplete label="도시 자동완성" name="city" options={suggestions} value={value} onValueChange={setValue}
          size={small ? 'small' : 'large'} placeholder="Seoul 또는 서울" prefix={flags.Prefix ? '도시' : undefined}
          suffix={flags.Suffix ? '지역' : undefined} error={flags.Error} errorText="도시를 확인하세요."
          disabled={flags.Disabled} required={flags.Required} readOnly={flags.ReadOnly} clearable={flags.Clearable}
          supportingText="입력하면 필터링됩니다. 빈 값 + 비포커스에서는 Prefix/Suffix가 숨겨지고, 포커스 또는 입력값이 있으면 표시됩니다." />
        <div className={styles.row}>
          <Button variant="outlined" onClick={() => setValue('Seoul 서울')}>샘플 값 넣기</Button>
          <Button variant="outlined" onClick={() => setValue('')}>빈 값으로 테스트</Button>
        </div>
        <div className={styles.row}><Button type="submit">자동완성 제출</Button><Button type="reset" variant="outlined">자동완성 초기화</Button></div>
        <output aria-label="AutoComplete 제출 결과">{result}</output>
      </form>
      <div className={styles.fieldGrid}>
        <AutoComplete label="빈 제안 목록" options={[]} supportingText="목록이 없어도 직접 입력할 수 있습니다." />
        <AutoComplete label="읽기 전용 자동완성" options={suggestions} defaultValue="Seoul 서울" readOnly />
        <AutoComplete label="비활성 자동완성" options={suggestions} defaultValue="Busan 부산" disabled size="small" />
      </div>
    </section>
  );
}

export function SelectExamples() {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [required, setRequired] = useState(false);
  const [result, setResult] = useState('아직 제출하지 않았습니다.');
  return (
    <section aria-label="Select 속성 테스트" className={styles.textFieldExamples}>
      <p>목록에서만 선택하는 독립 컴포넌트입니다. 입력 검색은 AutoComplete를 사용하세요. 기존 MD3 Select의 56px 필드와 메뉴 동작을 유지합니다.</p>
      <div className={styles.row}>
        <Checkbox label="Select Error" checked={error} onCheckedChange={setError} />
        <Checkbox label="Select Disabled" checked={disabled} onCheckedChange={setDisabled} />
        <Checkbox label="Select Required" checked={required} onCheckedChange={setRequired} />
      </div>
      <form className={styles.textFieldExamples} onReset={() => { setValue(''); setResult('초기화했습니다.'); }}
        onSubmit={(event) => { event.preventDefault(); setResult(JSON.stringify(Object.fromEntries(new FormData(event.currentTarget)))); }}>
        <Select label="선택 테스트" name="destination" value={value} onValueChange={setValue}
          options={[{ value: 'seoul', label: '서울' }, { value: 'daegu', label: '대구 (선택 불가)', disabled: true }, { value: 'busan', label: '부산' }]}
          error={error} errorText="선택값을 확인하세요." disabled={disabled} required={required} supportingText="Space/Enter로 열고 방향키로 이동합니다." />
        <div className={styles.row}><Button type="submit">선택값 제출</Button><Button type="reset" variant="outlined">선택값 초기화</Button></div>
        <output aria-label="Select 제출 결과">{result}</output>
      </form>
    </section>
  );
}
