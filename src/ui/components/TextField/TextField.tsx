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
  type FormEvent,
  type ReactNode,
} from 'react';
import { useFloatingLabelMotion } from '../../interactions/FloatingLabelMotion';
import { FieldOutline } from '../FieldOutline/FieldOutline';
import { IconButton } from '../IconButton';
import { MaterialIcon } from '../../icons/MaterialIcon';
import styles from '../FieldOutline/OutlinedField.module.css';

export type TextFieldSize = 'large' | 'small';
type TextFieldElement = HTMLInputElement | HTMLTextAreaElement;

export interface TextFieldAction {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<TextFieldElement>, 'prefix' | 'size'> {
  clearable?: boolean;
  clearLabel?: string;
  error?: boolean;
  errorText?: string;
  label: string;
  hideLabel?: boolean;
  leadingIcon?: ReactNode;
  prefix?: ReactNode;
  rows?: number;
  size?: TextFieldSize;
  supportingText?: string;
  suffix?: ReactNode;
  trailingIcon?: ReactNode;
  trailingAction?: TextFieldAction;
}

function hasValue(value: unknown) {
  return value !== undefined && value !== null && String(value).length > 0;
}

export function TextField({
  'aria-describedby': describedBy,
  'aria-invalid': ariaInvalid,
  className,
  clearable = false,
  clearLabel,
  defaultValue,
  disabled,
  error,
  errorText,
  id,
  hideLabel = false,
  label,
  leadingIcon,
  onBlur,
  onChange,
  onFocus,
  onInput,
  onInvalid,
  placeholder,
  prefix,
  readOnly,
  required,
  rows = 2,
  size = 'large',
  style,
  supportingText,
  suffix,
  trailingIcon,
  trailingAction,
  type = 'text',
  value,
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-support`;
  const [nativeError, setNativeError] = useState('');
  const invalid = Boolean(error || nativeError);
  const message = invalid ? errorText || nativeError || supportingText : supportingText;
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<TextFieldElement>(null);
  const restingLabelRef = useRef<HTMLLabelElement>(null);
  const floatingLabelRef = useRef<HTMLSpanElement>(null);
  const [focused, setFocused] = useState(false);
  const [uncontrolledPopulated, setUncontrolledPopulated] = useState(() => hasValue(defaultValue));
  const populated = value === undefined ? uncontrolledPopulated : hasValue(value);
  const hasPrefix = prefix !== undefined && prefix !== null && prefix !== false && prefix !== '';
  const hasSuffix = suffix !== undefined && suffix !== null && suffix !== false && suffix !== '';
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
      requestAnimationFrame(() => {
        setUncontrolledPopulated(hasValue(input.value));
        setNativeError('');
      });
    };
    form.addEventListener('reset', handleReset);
    return () => form.removeEventListener('reset', handleReset);
  }, [type, props.form]);

  const syncUncontrolledValue = (currentValue: string) => {
    if (value === undefined) setUncontrolledPopulated(hasValue(currentValue));
  };

  const handleFocus = (event: FocusEvent<TextFieldElement>) => {
    setFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event: FocusEvent<TextFieldElement>) => {
    setFocused(false);
    onBlur?.(event);
  };

  const handleChange = (event: ChangeEvent<TextFieldElement>) => {
    syncUncontrolledValue(event.currentTarget.value);
    setNativeError('');
    onChange?.(event);
  };

  const handleInput = (event: InputEvent<TextFieldElement>) => {
    syncUncontrolledValue(event.currentTarget.value);
    onInput?.(event);
  };

  const clear = () => {
    const input = inputRef.current;
    if (!input || disabled || readOnly) return;
    // Use the native setter so React's change tracking observes the same input
    // event as typing. Controlled consumers remain the value authority.
    const prototype = type === 'textarea' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(prototype, 'value')?.set?.call(input, '');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    syncUncontrolledValue(input.value);
    input.focus();
  };
  const inputProps = {
    ...props,
    // The real label already uses htmlFor. Do not let Base UI's implicit
    // aria-labelledby override a consumer's more descriptive aria-label.
    'aria-labelledby': props['aria-labelledby'],
    'aria-describedby': [describedBy, message ? messageId : undefined].filter(Boolean).join(' ') || undefined,
    'aria-invalid': invalid ? true : ariaInvalid,
    className: styles.input,
    defaultValue,
    disabled,
    id: inputId,
    onBlur: handleBlur,
    onChange: handleChange,
    onFocus: handleFocus,
    onInput: handleInput,
    onInvalid: (event: FormEvent<TextFieldElement>) => {
      setNativeError(event.currentTarget.validationMessage);
      onInvalid?.(event);
    },
    placeholder: placeholder ?? ' ',
    readOnly,
    required,
    value,
  };

  return (
    <Field.Root
      className={[styles.root, styles.outlined, className].filter(Boolean).join(' ')}
      data-floating={floating || undefined}
      data-hide-label={hideLabel || undefined}
      data-populated={populated || undefined}
      data-readonly={readOnly || undefined}
      data-size={size}
      data-text-field-variant="outlined"
      data-type={type}
      disabled={disabled}
      invalid={invalid}
      ref={rootRef}
      style={style}
    >
      <div
        className={styles.control}
        data-has-affix={hasPrefix || hasSuffix ? '' : undefined}
        data-has-leading={leadingIcon ? '' : undefined}
        data-slot="text-field-control"
        onClick={(event) => {
          if (disabled || event.defaultPrevented) return;
          const target = event.target;
          if (target instanceof Element && target.closest('input, textarea, button, a')) return;
          inputRef.current?.focus();
        }}
      >
        <FieldOutline className={styles.outline} label={hideLabel ? '' : label} open={!hideLabel && floating} />
        {leadingIcon ? <span aria-hidden="true" className={[styles.icon, styles.leadingIcon].join(' ')}>{leadingIcon}</span> : null}
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
        {required && !hideLabel ? <span aria-hidden="true" className={styles.required}>*</span> : null}
        <div className={styles.inputRow}>
          {hasPrefix ? <span className={[styles.affix, styles.prefix].join(' ')} data-slot="prefix">{prefix}</span> : null}
          {type === 'textarea' ? (
            <textarea {...inputProps} ref={(element) => { inputRef.current = element; }} rows={rows} />
          ) : (
            <Input {...inputProps} ref={(element) => { inputRef.current = element instanceof HTMLInputElement ? element : null; }} type={type} />
          )}
          {clearable && populated && !disabled && !readOnly ? (
            <IconButton
              aria-label={clearLabel ?? `${label} 지우기`}
              className={[styles.action, styles.clearAction].join(' ')}
              icon={<MaterialIcon name="highlight_off" />}
              onClick={clear}
              size={size === 'small' ? 'small' : 'large'}
            />
          ) : null}
          {hasSuffix ? <span className={[styles.affix, styles.suffix].join(' ')} data-slot="suffix">{suffix}</span> : null}
        </div>
        {trailingAction ? (
          <IconButton
            aria-label={trailingAction.label}
            className={styles.action}
            disabled={disabled}
            icon={trailingAction.icon}
            onClick={trailingAction.onClick}
            size={size === 'small' ? 'small' : 'large'}
          />
        ) : trailingIcon ? <span aria-hidden="true" className={[styles.icon, styles.trailingIcon].join(' ')}>{trailingIcon}</span> : null}
      </div>
      {message ? (
        <Field.Description
          className={invalid ? styles.error : styles.supporting}
          id={messageId}
        >
          {message}
        </Field.Description>
      ) : null}
    </Field.Root>
  );
}
