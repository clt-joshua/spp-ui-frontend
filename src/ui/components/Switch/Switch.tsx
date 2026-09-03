import { Switch as BaseSwitch } from '@base-ui/react/switch';
import type { CSSProperties, Ref } from 'react';
import { MaterialIcon } from '../../icons/MaterialIcon';
import { FocusRing, StateLayer, usePressableInteraction } from '../../interactions';
import styles from './Switch.module.css';

export interface SwitchChangeDetails {
  cancel: () => void;
  isCanceled: boolean;
  reason: 'none';
}

export interface SwitchProps {
  /** Every standalone switch must have an explicit accessible name. */
  'aria-label': string;
  'aria-describedby'?: string;
  className?: string;
  defaultSelected?: boolean;
  disabled?: boolean;
  form?: string;
  id?: string;
  inputRef?: Ref<HTMLInputElement>;
  name?: string;
  onSelectedChange?: (selected: boolean, details: SwitchChangeDetails) => void;
  readOnly?: boolean;
  required?: boolean;
  selected?: boolean;
  style?: CSSProperties;
  uncheckedValue?: string;
  value?: string;
}

export function Switch({
  'aria-describedby': ariaDescribedBy,
  'aria-label': ariaLabel,
  className,
  defaultSelected,
  disabled,
  form,
  id,
  inputRef,
  name,
  onSelectedChange,
  readOnly,
  required,
  selected,
  style,
  uncheckedValue,
  value,
}: SwitchProps) {
  const { interactionProps, pressed, ripple } = usePressableInteraction({
    centered: true,
    disabled: disabled || readOnly,
  });

  return (
    <BaseSwitch.Root
      aria-describedby={ariaDescribedBy}
      aria-label={ariaLabel}
      checked={selected}
      className={[styles.control, className].filter(Boolean).join(' ')}
      data-interactive-root=""
      data-pressed={pressed || undefined}
      defaultChecked={defaultSelected}
      disabled={disabled}
      form={form}
      id={id}
      inputRef={inputRef}
      name={name}
      onBlur={interactionProps.onBlur}
      onCheckedChange={(nextSelected, details) => {
        onSelectedChange?.(nextSelected, details);
      }}
      onKeyDown={interactionProps.onKeyDown}
      onKeyUp={interactionProps.onKeyUp}
      onPointerCancel={interactionProps.onPointerCancel}
      onPointerDown={interactionProps.onPointerDown}
      onPointerUp={interactionProps.onPointerUp}
      readOnly={readOnly}
      required={required}
      style={style}
      uncheckedValue={uncheckedValue}
      value={value}
    >
      <span aria-hidden="true" className={styles.visual} data-slot="visual">
        <span className={styles.track} data-slot="track">
          <BaseSwitch.Thumb className={styles.thumb} data-slot="thumb">
            <span className={styles.handle} data-slot="handle">
              <MaterialIcon className={styles.selectedIcon} name="check" />
              <MaterialIcon className={styles.unselectedIcon} name="close" />
            </span>
          </BaseSwitch.Thumb>
        </span>
        <StateLayer />
        {ripple}
      </span>
      <FocusRing />
    </BaseSwitch.Root>
  );
}
