import { Field } from '@base-ui/react/field';
import { Input } from '@base-ui/react/input';
import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
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

export function TextField({
  className,
  disabled,
  error,
  errorText,
  id,
  label,
  leadingIcon,
  placeholder,
  prefix,
  supportingText,
  suffix,
  trailingIcon,
  variant = 'outlined',
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-support`;
  const message = error ? errorText || supportingText : supportingText;

  return (
    <Field.Root
      className={[styles.root, styles[variant], className].filter(Boolean).join(' ')}
      disabled={disabled}
      invalid={Boolean(error)}
    >
      <div
        className={styles.control}
        data-has-affix={prefix || suffix ? '' : undefined}
        data-has-leading={leadingIcon ? '' : undefined}
      >
        <fieldset aria-hidden="true" className={styles.outline}>
          <legend><span>{label}</span></legend>
        </fieldset>
        {leadingIcon ? <span className={styles.icon}>{leadingIcon}</span> : null}
        <Field.Label className={styles.label} htmlFor={inputId}>
          {label}
        </Field.Label>
        <div className={styles.inputRow}>
          {prefix ? <span className={styles.affix}>{prefix}</span> : null}
          <Input
            {...props}
            aria-describedby={message ? messageId : undefined}
            aria-invalid={Boolean(error)}
            className={styles.input}
            disabled={disabled}
            id={inputId}
            placeholder={placeholder ?? ' '}
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
