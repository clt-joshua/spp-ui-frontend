import { Select as BaseSelect } from '@base-ui/react/select';
import { useId, useRef, useState, type ReactNode } from 'react';
import { MaterialIcon } from '../../icons/MaterialIcon';
import { useFloatingLabelMotion } from '../../interactions/FloatingLabelMotion';
import { useMaterialMenuMotion } from '../../interactions/MenuMotion';
import { FieldOutline } from '../FieldOutline/FieldOutline';
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
  const [focused, setFocused] = useState(false);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const restingLabelRef = useRef<HTMLSpanElement>(null);
  const floatingLabelRef = useRef<HTMLSpanElement>(null);
  const populated = Boolean(value ?? uncontrolledValue);
  const floating = populated || focused || open;
  const {
    setItemElement,
    setPopupElement,
    setPositionerElement,
  } = useMaterialMenuMotion<HTMLDivElement>(open);

  useFloatingLabelMotion({
    durationProperty: '--md-select-motion-duration',
    easingProperty: '--md-select-motion-easing',
    floating,
    floatingLabelRef,
    restingLabelRef,
    rootRef,
  });

  return (
    <div
      className={[styles.root, styles[variant]].join(' ')}
      data-disabled={disabled || undefined}
      data-floating={floating || undefined}
      data-invalid={error || undefined}
      data-populated={populated || undefined}
      ref={rootRef}
    >
      <FieldOutline className={styles.outline} label={label} open={floating} />
      <span
        className={[styles.label, styles.restingLabel].join(' ')}
        id={labelId}
        ref={restingLabelRef}
      >
        {label}
      </span>
      <span aria-hidden="true" className={styles.floatingLabelPosition}>
        <span
          className={[styles.label, styles.floatingLabel].join(' ')}
          ref={floatingLabelRef}
        >
          {label}
        </span>
      </span>
      <BaseSelect.Root
        defaultValue={defaultValue}
        disabled={disabled}
        items={items}
        name={name}
        onOpenChange={setOpen}
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
          onBlur={() => setFocused(false)}
          onFocus={() => setFocused(true)}
        >
          <BaseSelect.Value className={styles.value} placeholder={placeholder} />
          <BaseSelect.Icon className={styles.icon}>
            <MaterialIcon name="arrow_drop_down" />
          </BaseSelect.Icon>
        </BaseSelect.Trigger>
        <BaseSelect.Portal>
          <BaseSelect.Positioner
            align="start"
            alignItemWithTrigger={false}
            className={styles.positioner}
            ref={setPositionerElement}
            sideOffset={0}
          >
            <BaseSelect.Popup className={styles.popup} ref={setPopupElement}>
              <div className={styles.surface} data-slot="menu-surface">
                <BaseSelect.List className={styles.list} data-slot="menu-content">
                  {options.map((option) => (
                    <BaseSelect.Item
                      className={styles.item}
                      disabled={option.disabled}
                      key={option.value}
                      ref={setItemElement}
                      value={option.value}
                    >
                      <BaseSelect.ItemText>{option.label}</BaseSelect.ItemText>
                    </BaseSelect.Item>
                  ))}
                </BaseSelect.List>
              </div>
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
