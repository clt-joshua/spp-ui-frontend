import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox';
import { useId, useState, type CSSProperties, type ReactNode } from 'react';
import { FocusRing, StateLayer, usePressableInteraction } from '../../interactions';
import styles from './Checkbox.module.css';

export type CheckboxSize = 'large' | 'medium' | 'small';

export interface CheckboxProps {
  checked?: boolean;
  className?: string;
  defaultChecked?: boolean;
  disabled?: boolean;
  error?: boolean;
  errorText?: string;
  indeterminate?: boolean;
  label: ReactNode;
  name?: string;
  onCheckedChange?: (checked: boolean) => void;
  required?: boolean;
  size?: CheckboxSize;
  supportingText?: string;
  style?: CSSProperties;
  value?: string;
}

export function Checkbox({
  checked,
  className,
  defaultChecked,
  disabled,
  error = false,
  errorText,
  indeterminate,
  label,
  name,
  onCheckedChange,
  required,
  size = 'large',
  supportingText,
  style,
  value,
}: CheckboxProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const supportingId = `${id}-supporting`;
  const visibleSupportingText = error && errorText ? errorText : supportingText;
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
  const { interactionProps, pressed, ripple } = usePressableInteraction({
    centered: true,
    disabled,
  });

  return (
    <label
      className={[styles.root, className].filter(Boolean).join(' ')}
      data-disabled={disabled || undefined}
      data-error={error || undefined}
      data-size={size}
      style={style}
    >
      <BaseCheckbox.Root
        aria-describedby={visibleSupportingText ? supportingId : undefined}
        aria-invalid={error || undefined}
        aria-labelledby={labelId}
        checked={checked}
        className={styles.control}
        defaultChecked={defaultChecked}
        disabled={disabled}
        data-error={error || undefined}
        data-interactive-root=""
        data-pressed={pressed || undefined}
        data-previous-state={previousState}
        data-selection-state={currentState}
        data-size={size}
        indeterminate={indeterminate}
        name={name}
        onCheckedChange={(nextChecked) => {
          if (checked === undefined) setUncontrolledChecked(nextChecked);
          onCheckedChange?.(nextChecked);
        }}
        onBlur={interactionProps.onBlur}
        onKeyDown={interactionProps.onKeyDown}
        onKeyUp={interactionProps.onKeyUp}
        onPointerCancel={interactionProps.onPointerCancel}
        onPointerDown={interactionProps.onPointerDown}
        onPointerUp={interactionProps.onPointerUp}
        required={required}
        value={value}
      >
        <StateLayer />
        {ripple}
        <FocusRing />
        <span className={styles.box} />
        <BaseCheckbox.Indicator className={styles.indicator} keepMounted>
          <svg
            aria-hidden="true"
            className={styles.icon}
            focusable="false"
            viewBox="-3 -3 24 24"
          >
            <rect className={[styles.mark, styles.short].join(' ')} />
            <rect className={[styles.mark, styles.long].join(' ')} />
          </svg>
        </BaseCheckbox.Indicator>
      </BaseCheckbox.Root>
      <span className={styles.text}>
        <span className={styles.label} id={labelId}>{label}</span>
        {visibleSupportingText ? (
          <span className={styles.supporting} id={supportingId}>{visibleSupportingText}</span>
        ) : null}
      </span>
    </label>
  );
}
