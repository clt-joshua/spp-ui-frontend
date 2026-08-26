import { Field } from '@base-ui/react/field';
import { Input } from '@base-ui/react/input';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type InputHTMLAttributes,
  type InputEvent,
  type ReactNode,
} from 'react';
import { useFloatingLabelMotion } from '../../interactions/FloatingLabelMotion';
import { FieldOutline } from '../FieldOutline/FieldOutline';
import styles from './TextField.module.css';

export type TextFieldVariant = 'filled' | 'outlined';

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'size'> {
  error?: boolean;
  errorText?: string;
  label: string;
  leadingIcon?: ReactNode;
  prefix?: ReactNode;
  supportingText?: string;
  suffix?: ReactNode;
  trailingIcon?: ReactNode;
  variant?: TextFieldVariant;
}

function hasValue(value: unknown) {
  return value !== undefined && value !== null && String(value).length > 0;
}

export function TextField({
  className,
  defaultValue,
  disabled,
  error,
  errorText,
  id,
  label,
  leadingIcon,
  onBlur,
  onChange,
  onFocus,
  onInput,
  placeholder,
  prefix,
  supportingText,
  suffix,
  trailingIcon,
  value,
  variant = 'outlined',
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-support`;
  const message = error ? errorText || supportingText : supportingText;
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const restingLabelRef = useRef<HTMLLabelElement>(null);
  const floatingLabelRef = useRef<HTMLSpanElement>(null);
  const [focused, setFocused] = useState(false);
  const [uncontrolledPopulated, setUncontrolledPopulated] = useState(() => hasValue(defaultValue));
  const populated = value === undefined ? uncontrolledPopulated : hasValue(value);
  const floating = focused || populated;
  useFloatingLabelMotion({
    durationProperty: '--md-text-field-motion-duration',
    easingProperty: '--md-text-field-motion-easing',
    floating,
    floatingLabelRef,
    restingLabelRef,
    rootRef,
  });

  useEffect(() => {
    const input = inputRef.current;
    const form = input?.form;
    if (!input || !form) return;

    const handleReset = () => {
      requestAnimationFrame(() => setUncontrolledPopulated(hasValue(input.value)));
    };
    form.addEventListener('reset', handleReset);
    return () => form.removeEventListener('reset', handleReset);
  }, []);

  const syncUncontrolledValue = (currentValue: string) => {
    if (value === undefined) setUncontrolledPopulated(hasValue(currentValue));
  };

  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    onBlur?.(event);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    syncUncontrolledValue(event.currentTarget.value);
    onChange?.(event);
  };

  const handleInput = (event: InputEvent<HTMLInputElement>) => {
    syncUncontrolledValue(event.currentTarget.value);
    onInput?.(event);
  };

  return (
    <Field.Root
      className={[styles.root, styles[variant], className].filter(Boolean).join(' ')}
      data-floating={floating || undefined}
      disabled={disabled}
      invalid={Boolean(error)}
      ref={rootRef}
    >
      <div
        className={styles.control}
        data-has-affix={prefix || suffix ? '' : undefined}
        data-has-leading={leadingIcon ? '' : undefined}
        data-slot="text-field-control"
      >
        <FieldOutline className={styles.outline} label={label} open={floating} />
        {leadingIcon ? <span className={styles.icon}>{leadingIcon}</span> : null}
        <Field.Label
          className={[styles.label, styles.restingLabel].join(' ')}
          data-slot="resting-label"
          htmlFor={inputId}
          ref={restingLabelRef}
        >
          {label}
        </Field.Label>
        <span aria-hidden="true" className={styles.floatingLabelPosition}>
          <span
            className={[styles.label, styles.floatingLabel].join(' ')}
            data-slot="floating-label"
            ref={floatingLabelRef}
          >
            {label}
          </span>
        </span>
        <div className={styles.inputRow}>
          {prefix ? <span className={styles.affix}>{prefix}</span> : null}
          <Input
            {...props}
            aria-describedby={message ? messageId : undefined}
            aria-invalid={Boolean(error)}
            className={styles.input}
            defaultValue={defaultValue}
            disabled={disabled}
            id={inputId}
            onBlur={handleBlur}
            onChange={handleChange}
            onFocus={handleFocus}
            onInput={handleInput}
            placeholder={placeholder ?? ' '}
            ref={inputRef}
            value={value}
          />
          {suffix ? <span className={styles.affix}>{suffix}</span> : null}
        </div>
        {trailingIcon ? <span className={styles.icon}>{trailingIcon}</span> : null}
      </div>
      {message ? (
        <Field.Description
          className={error ? styles.error : styles.supporting}
          id={messageId}
        >
          {message}
        </Field.Description>
      ) : null}
    </Field.Root>
  );
}
