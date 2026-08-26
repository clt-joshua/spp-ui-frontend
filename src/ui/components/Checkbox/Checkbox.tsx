import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import { useId, useState, type ReactNode } from 'react';
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
  const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked ?? false);
  const currentChecked = checked ?? uncontrolledChecked;
  const currentState = indeterminate
    ? 'indeterminate'
    : currentChecked
      ? 'checked'
      : 'unselected';
  const [transitionState, setTransitionState] = useState({
    current: currentState,
    previous: currentState,
  });
  if (transitionState.current !== currentState) {
    setTransitionState({ current: currentState, previous: transitionState.current });
  }
  const previousState = transitionState.previous;

  return (
    <label className={styles.root} data-disabled={disabled || undefined}>
      <BaseCheckbox.Root
        aria-describedby={supportingText ? supportingId : undefined}
        aria-labelledby={labelId}
        checked={checked}
        className={styles.control}
        defaultChecked={defaultChecked}
        disabled={disabled}
        data-previous-state={previousState}
        indeterminate={indeterminate}
        name={name}
        onCheckedChange={(nextChecked) => {
          if (checked === undefined) setUncontrolledChecked(nextChecked);
          onCheckedChange?.(nextChecked);
        }}
        required={required}
        value={value}
      >
        <span className={styles.box} />
        <BaseCheckbox.Indicator className={styles.indicator} keepMounted>
          <svg
            aria-hidden="true"
            className={styles.icon}
            focusable="false"
            viewBox="0 0 18 18"
          >
            <rect className={[styles.mark, styles.short].join(' ')} />
            <rect className={[styles.mark, styles.long].join(' ')} />
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
