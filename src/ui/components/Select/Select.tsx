import { Select as BaseSelect } from '@base-ui/react/select';
import { useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { MaterialIcon } from '../../icons/MaterialIcon';
import { FocusRing, StateLayer, usePressableInteraction } from '../../interactions';
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
  className?: string;
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
  style?: CSSProperties;
  value?: T;
  variant?: 'filled' | 'outlined';
}

export function Select<T extends string>({
  className,
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
  style,
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
      className={[styles.root, styles[variant], className].filter(Boolean).join(' ')}
      data-disabled={disabled || undefined}
      data-floating={floating || undefined}
      data-invalid={error || undefined}
      data-populated={populated || undefined}
      ref={rootRef}
      style={style}
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
                    <SelectOptionItem
                      key={option.value}
                      option={option}
                      setItemElement={setItemElement}
                    />
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

interface SelectOptionItemProps<T extends string> {
  option: SelectOption<T>;
  setItemElement: (element: HTMLDivElement | null) => void;
}

function SelectOptionItem<T extends string>({
  option,
  setItemElement,
}: SelectOptionItemProps<T>) {
  const { interactionProps, pressed, ripple } = usePressableInteraction({
    disabled: option.disabled,
  });

  return (
    <BaseSelect.Item
      className={styles.item}
      data-interactive-root=""
      data-pressed={pressed || undefined}
      disabled={option.disabled}
      onBlur={interactionProps.onBlur}
      onKeyDown={interactionProps.onKeyDown}
      onKeyUp={interactionProps.onKeyUp}
      onPointerCancel={interactionProps.onPointerCancel}
      onPointerDown={interactionProps.onPointerDown}
      onPointerUp={interactionProps.onPointerUp}
      ref={setItemElement}
      value={option.value}
    >
      <StateLayer />
      {ripple}
      <FocusRing inward />
      <span className={styles.itemContent}>
        <BaseSelect.ItemText>{option.label}</BaseSelect.ItemText>
      </span>
    </BaseSelect.Item>
  );
}
