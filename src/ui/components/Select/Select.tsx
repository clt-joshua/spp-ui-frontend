import { Select as BaseSelect } from '@base-ui/react/select';
import { useId, useState, type ReactNode } from 'react';
import { MaterialIcon } from '../../icons/MaterialIcon';
import styles from './Select.module.css';

export interface SelectOption<T extends string> {
  value: T;
  label: ReactNode;
  disabled?: boolean;
}

export interface SelectProps<T extends string> {
  defaultValue?: T;
  disabled?: boolean;
  error?: boolean;
  errorText?: string;
  label: string;
  name?: string;
  onValueChange?: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  required?: boolean;
  supportingText?: string;
  value?: T;
  variant?: 'filled' | 'outlined';
}

export function Select<T extends string>({
  defaultValue,
  disabled,
  error,
  errorText,
  label,
  name,
  onValueChange,
  options,
  placeholder = 'Select an option',
  required,
  supportingText,
  value,
  variant = 'outlined',
}: SelectProps<T>) {
  const labelId = useId();
  const messageId = useId();
  const message = error ? errorText || supportingText : supportingText;
  const items = options.map((option) => ({ label: option.label, value: option.value }));
  const [uncontrolledValue, setUncontrolledValue] = useState<T | undefined>(defaultValue);
  const populated = Boolean(value ?? uncontrolledValue);

  return (
    <div
      className={[styles.root, styles[variant]].join(' ')}
      data-disabled={disabled || undefined}
      data-invalid={error || undefined}
      data-populated={populated || undefined}
    >
      <fieldset aria-hidden="true" className={styles.outline}>
        <legend><span>{label}</span></legend>
      </fieldset>
      <span className={styles.label} id={labelId}>{label}</span>
      <BaseSelect.Root
        defaultValue={defaultValue}
        disabled={disabled}
        items={items}
        name={name}
        onValueChange={(nextValue) => {
          if (nextValue !== null) {
            setUncontrolledValue(nextValue as T);
            onValueChange?.(nextValue as T);
          }
        }}
        required={required}
        value={value}
      >
        <BaseSelect.Trigger
          aria-describedby={message ? messageId : undefined}
          aria-invalid={error || undefined}
          aria-labelledby={labelId}
          className={styles.trigger}
        >
          <BaseSelect.Value className={styles.value} placeholder={placeholder} />
          <BaseSelect.Icon className={styles.icon}>
            <MaterialIcon name="arrow_drop_down" />
          </BaseSelect.Icon>
        </BaseSelect.Trigger>
        <BaseSelect.Portal>
          <BaseSelect.Positioner align="start" className={styles.positioner} sideOffset={4}>
            <BaseSelect.Popup className={styles.popup}>
              <BaseSelect.List className={styles.list}>
                {options.map((option) => (
                  <BaseSelect.Item
                    className={styles.item}
                    disabled={option.disabled}
                    key={option.value}
                    value={option.value}
                  >
                    <BaseSelect.ItemText>{option.label}</BaseSelect.ItemText>
                    <BaseSelect.ItemIndicator className={styles.check}>
                      <MaterialIcon name="check" />
                    </BaseSelect.ItemIndicator>
                  </BaseSelect.Item>
                ))}
              </BaseSelect.List>
            </BaseSelect.Popup>
          </BaseSelect.Positioner>
        </BaseSelect.Portal>
      </BaseSelect.Root>
      {message ? (
        <span className={error ? styles.error : styles.supporting} id={messageId}>{message}</span>
      ) : null}
    </div>
  );
}
