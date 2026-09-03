import { Radio as BaseRadio } from '@base-ui/react/radio';
import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group';
import {
  createContext,
  useContext,
  useId,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import { FocusRing, StateLayer, usePressableInteraction } from '../../interactions';
import styles from './Radio.module.css';

const RadioGroupInteractionContext = createContext({ disabled: false, readOnly: false });

export type RadioSize = 'large' | 'medium' | 'small';
export type RadioGroupOrientation = 'horizontal' | 'vertical';

export interface RadioProps {
  className?: string;
  disabled?: boolean;
  id?: string;
  inputRef?: Ref<HTMLInputElement>;
  label: ReactNode;
  readOnly?: boolean;
  required?: boolean;
  size?: RadioSize;
  style?: CSSProperties;
  supportingText?: string;
  value: string;
}

export interface RadioGroupProps<Value extends string = string> {
  children: ReactNode;
  className?: string;
  defaultValue?: Value;
  disabled?: boolean;
  form?: string;
  id?: string;
  inputRef?: Ref<HTMLInputElement>;
  label: ReactNode;
  name: string;
  onValueChange?: (value: Value) => void;
  orientation?: RadioGroupOrientation;
  readOnly?: boolean;
  required?: boolean;
  style?: CSSProperties;
  supportingText?: string;
  value?: Value;
}

export function RadioGroup<Value extends string = string>({
  children,
  className,
  defaultValue,
  disabled,
  form,
  id,
  inputRef,
  label,
  name,
  onValueChange,
  orientation = 'vertical',
  readOnly,
  required,
  style,
  supportingText,
  value,
}: RadioGroupProps<Value>) {
  const generatedId = useId();
  const groupId = id ?? generatedId;
  const labelId = `${groupId}-label`;
  const supportingId = `${groupId}-supporting`;

  return (
    <BaseRadioGroup
      aria-describedby={supportingText ? supportingId : undefined}
      aria-labelledby={labelId}
      className={[styles.group, className].filter(Boolean).join(' ')}
      data-orientation={orientation}
      defaultValue={defaultValue}
      disabled={disabled}
      form={form}
      id={groupId}
      inputRef={inputRef}
      name={name}
      onValueChange={(nextValue) => onValueChange?.(nextValue as Value)}
      readOnly={readOnly}
      required={required}
      style={style}
      value={value}
    >
      <span className={styles.groupLabel} id={labelId}>{label}</span>
      {supportingText ? (
        <span className={styles.groupSupporting} id={supportingId}>{supportingText}</span>
      ) : null}
      <span className={styles.options}>
        <RadioGroupInteractionContext.Provider
          value={{ disabled: disabled ?? false, readOnly: readOnly ?? false }}
        >
          {children}
        </RadioGroupInteractionContext.Provider>
      </span>
    </BaseRadioGroup>
  );
}

export function Radio({
  className,
  disabled,
  id,
  inputRef,
  label,
  readOnly,
  required,
  size = 'large',
  style,
  supportingText,
  value,
}: RadioProps) {
  const generatedId = useId();
  const inputId = id ?? `${generatedId}-input`;
  const labelId = `${generatedId}-label`;
  const supportingId = `${generatedId}-supporting`;
  const groupInteraction = useContext(RadioGroupInteractionContext);
  const { interactionProps, pressed, ripple } = usePressableInteraction({
    centered: true,
    disabled: disabled || readOnly || groupInteraction.disabled || groupInteraction.readOnly,
  });

  return (
    <span
      className={[styles.root, className].filter(Boolean).join(' ')}
      data-size={size}
      style={style}
    >
      <BaseRadio.Root
        aria-describedby={supportingText ? supportingId : undefined}
        aria-labelledby={labelId}
        className={styles.control}
        data-interactive-root=""
        data-pressed={pressed || undefined}
        data-size={size}
        disabled={disabled}
        id={inputId}
        inputRef={inputRef}
        onBlur={interactionProps.onBlur}
        onKeyDown={(event) => {
          if (event.key === ' ') interactionProps.onKeyDown(event);
        }}
        onKeyUp={(event) => {
          if (event.key === ' ') interactionProps.onKeyUp(event);
        }}
        onPointerCancel={interactionProps.onPointerCancel}
        onPointerDown={interactionProps.onPointerDown}
        onPointerUp={interactionProps.onPointerUp}
        readOnly={readOnly}
        required={required}
        value={value}
      >
        <span aria-hidden="true" className={styles.touchTarget} data-slot="touch-target" />
        <StateLayer />
        {ripple}
        <FocusRing />
        <RadioIcon />
      </BaseRadio.Root>
      <span className={styles.text}>
        <label className={styles.label} htmlFor={inputId} id={labelId}>{label}</label>
        {supportingText ? (
          <span className={styles.supporting} id={supportingId}>{supportingText}</span>
        ) : null}
      </span>
    </span>
  );
}

function RadioIcon() {
  return (
    <svg
      aria-hidden="true"
      className={styles.icon}
      data-slot="icon"
      focusable="false"
      viewBox="0 0 24 24"
    >
      <path
        className={styles.outer}
        d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20Z"
      />
      <circle className={styles.inner} cx="12" cy="12" r="5" />
    </svg>
  );
}
