import { useState } from 'react';
import { Button, Checkbox, MaterialIcon, TextField } from '@/ui';
import styles from './ComponentGalleryPage.module.css';

export function TextFieldExamples() {
  const [name, setName] = useState('새 프로젝트');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState(false);
  const [result, setResult] = useState('아직 제출하지 않았습니다.');
  const [preview, setPreview] = useState('Input text');
  const [small, setSmall] = useState(false);
  const [flags, setFlags] = useState({ Prefix: false, Suffix: false, Error: false, Disabled: false, Required: false, ReadOnly: false, Clearable: true, LeadingIcon: false });

  return (
    <div className={styles.textFieldExamples}>
      <section aria-label="TextField 속성 테스트" className={styles.textFieldExamples}>
        <h4>TextField · 속성 실시간 테스트</h4>
        <div className={styles.row}>
          <Checkbox label="Small 크기 (해제: Large)" checked={small} onCheckedChange={setSmall} />
          {Object.entries(flags).map(([flag, checked]) => (
            <Checkbox key={flag} label={flag === 'Required' ? '필수 입력 (Required)' : flag} checked={checked} onCheckedChange={(next) => setFlags((current) => ({ ...current, [flag]: next }))} />
          ))}
        </div>
        <TextField label="테스트 입력" placeholder="내용을 입력하세요" value={preview}
          onChange={(event) => setPreview(event.currentTarget.value)} size={small ? 'small' : 'large'}
          prefix={flags.Prefix ? 'Prefix' : undefined} suffix={flags.Suffix ? 'Suffix' : undefined}
          error={flags.Error} errorText="테스트 오류 메시지" disabled={flags.Disabled} required={flags.Required}
          readOnly={flags.ReadOnly} clearable={flags.Clearable} leadingIcon={flags.LeadingIcon ? <MaterialIcon name="place_outline" /> : undefined}
          supportingText="빈 값 + 비포커스에서는 라벨만 표시됩니다. 포커스 또는 입력값이 있을 때 Prefix/Suffix가 표시됩니다." />
        <div className={styles.row}>
          <Button variant="outlined" onClick={() => setPreview('Input text')}>샘플 값 넣기</Button>
          <Button variant="outlined" onClick={() => setPreview('')}>빈 값으로 테스트</Button>
        </div>
        <output aria-label="TextField 실시간 값">현재 값: {preview || '(비어 있음)'} · {small ? 'Small 32px' : 'Large 48px'}</output>
      </section>
      <p className={styles.matrixHint}>
        Figma: large 48px / small 32px, text / number, 빈 값 / 입력값.
        각 필드에 마우스를 올리거나 Tab으로 이동하면 실제 hover·focus·error-focus 상태가 표시됩니다.
        작은 크기는 조밀한 데스크톱 입력용이며 터치 환경에서는 최소 48px로 확장됩니다.
      </p>
      {(['large', 'small'] as const).map((size) => (
        <section aria-label={`TextField ${size} matrix`} key={size}>
          <h4>Outlined · {size}</h4>
          <div className={styles.fieldGrid}>
            {(['text', 'number'] as const).flatMap((type) => (
              (['empty', 'populated'] as const).flatMap((content) => (
                (['enabled', 'error', 'disabled', 'readonly'] as const).map((state) => {
                  const label = `${size} ${type} ${content} ${state}`;
                  return (
                    <TextField
                      clearable
                      defaultValue={content === 'populated' ? type === 'number' ? '1234' : 'Input text' : ''}
                      disabled={state === 'disabled'}
                      error={state === 'error'}
                      errorText="입력값을 확인하세요."
                      key={label}
                      label={label}
                      leadingIcon={<MaterialIcon name="place_outline" />}
                      placeholder={type === 'number' ? '0' : 'Placeholder text'}
                      prefix={type === 'number' ? '₩' : 'Prefix'}
                      readOnly={state === 'readonly'}
                      required
                      size={size}
                      suffix={type === 'number' ? '원' : 'Suffix'}
                      supportingText="Supporting text"
                      type={type}
                    />
                  );
                })
              ))
            ))}
          </div>
        </section>
      ))}
      <section aria-label="TextField 실제 폼">
        <h4>실제 입력 · 유효성 · 지우기 · 제출 · 초기화</h4>
        <form
          className={styles.textFieldExamples}
          onReset={() => { setName('새 프로젝트'); setError(false); setResult('초기화했습니다.'); }}
          onSubmit={(event) => {
            event.preventDefault();
            setError(false);
            const data = new FormData(event.currentTarget);
            // Never echo password fields into a verification result.
            data.delete('password');
            setResult(JSON.stringify(Object.fromEntries(data), null, 2));
          }}
        >
          <div className={styles.fieldGrid}>
            <TextField
              aria-describedby="text-field-form-note"
              clearable
              error={error}
              errorText="프로젝트 이름을 입력하세요."
              label="검증 프로젝트 이름"
              name="project"
              onChange={(event) => { setName(event.currentTarget.value); setError(false); }}
              onInvalid={() => setError(true)}
              placeholder="프로젝트 이름"
              required
              supportingText="필수 항목입니다. 지우기 후 제출하면 오류를 확인할 수 있습니다."
              value={name}
            />
            <TextField defaultValue="2" label="검증 수량" min={1} max={10} name="quantity" size="small" step={1} suffix="개" type="number" />
            <TextField
              label="검증 비밀번호"
              name="password"
              autoComplete="new-password"
              trailingAction={{
                icon: <MaterialIcon name={passwordVisible ? 'visibility_off' : 'visibility'} />,
                label: passwordVisible ? '비밀번호 숨기기' : '비밀번호 표시',
                onClick: () => setPasswordVisible((visible) => !visible),
              }}
              type={passwordVisible ? 'text' : 'password'}
            />
            <TextField clearable defaultValue="첫 줄" label="검증 메모" name="memo" rows={2} size="small" type="textarea" />
            <TextField defaultValue="SPP-001" label="검증 읽기 전용 코드" name="code" readOnly supportingText="수정할 수 없지만 제출에는 포함됩니다." />
            <TextField defaultValue="Excluded" disabled label="검증 비활성 코드" name="disabledCode" supportingText="Tab 순서와 제출에서 제외됩니다." />
            <TextField hideLabel label="검증 숨김 라벨" name="hiddenLabel" placeholder="보조기기용 이름은 유지됩니다." />
          </div>
          <p id="text-field-form-note">외부 설명 연결과 오류 설명 연결을 함께 유지합니다.</p>
          <div className={styles.row}>
            <Button type="submit">입력값 제출</Button>
            <Button type="reset" variant="outlined">입력값 초기화</Button>
          </div>
          <output aria-label="TextField 제출 결과" className={styles.textFieldResult}>{result}</output>
        </form>
      </section>
    </div>
  );
}
