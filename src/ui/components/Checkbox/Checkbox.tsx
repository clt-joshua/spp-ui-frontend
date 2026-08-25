import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import { useId, type ReactNode } from 'react';
import styles from './Checkbox.module.css';

export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  indeterminate?: boolean;
  label: ReactNode;
  name?: string;
  onCheckedChange?: (checked: boolean) => void;
  required?: boolean;
  supportingText?: string;
  value?: string;
}

export function Checkbox({
  checked,
  defaultChecked,
  disabled,
  indeterminate,
  label,
  name,
  onCheckedChange,
  required,
  supportingText,
  value,
}: CheckboxProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const supportingId = `${id}-supporting`;

  return (
    <label className={styles.root} data-disabled={disabled || undefined}>
      <BaseCheckbox.Root
        aria-describedby={supportingText ? supportingId : undefined}
        aria-labelledby={labelId}
        checked={checked}
        className={styles.control}
        defaultChecked={defaultChecked}
        disabled={disabled}
        indeterminate={indeterminate}
        name={name}
        onCheckedChange={(nextChecked) => onCheckedChange?.(nextChecked)}
        required={required}
        value={value}
      >
        <span className={styles.box} />
        <BaseCheckbox.Indicator className={styles.indicator} keepMounted>
          <svg
            aria-hidden="true"
            className={styles.mark}
            focusable="false"
            viewBox="0 0 18 18"
          >
            {indeterminate ? (
              <path d="M4 9h10" />
            ) : (
              <path d="m4 9 3.25 3.25L14 5.5" />
            )}
          </svg>
        </BaseCheckbox.Indicator>
      </BaseCheckbox.Root>
      <span className={styles.text}>
        <span className={styles.label} id={labelId}>{label}</span>
        {supportingText ? <span className={styles.supporting} id={supportingId}>{supportingText}</span> : null}
      </span>
    </label>
  );
}
