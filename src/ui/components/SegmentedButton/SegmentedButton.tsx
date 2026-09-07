import {
  createContext,
  useContext,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { FocusRing, StateLayer, usePressableInteraction } from '../../interactions';
import styles from './SegmentedButton.module.css';

export type SegmentedButtonSelectionMode = 'single' | 'multiple';

export interface SegmentedButtonChangeDetails<Value extends string = string> {
  index: number;
  selected: boolean;
  value: Value;
}

interface SegmentedButtonSetCommonProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  children: ReactNode;
  /** Accessible name announced for the complete segmented button group. */
  label: string;
  style?: CSSProperties;
}

export interface SingleSelectSegmentedButtonSetProps<Value extends string = string>
  extends SegmentedButtonSetCommonProps {
  defaultValue?: Value;
  onValueChange?: (
    value: Value,
    details: SegmentedButtonChangeDetails<Value>,
  ) => void;
  selectionMode?: 'single';
  value?: Value;
}

export interface MultiSelectSegmentedButtonSetProps<Value extends string = string>
  extends SegmentedButtonSetCommonProps {
  defaultValue?: readonly Value[];
  onValueChange?: (
    value: Value[],
    details: SegmentedButtonChangeDetails<Value>,
  ) => void;
  selectionMode: 'multiple';
  value?: readonly Value[];
}

export type SegmentedButtonSetProps<Value extends string = string> =
  | SingleSelectSegmentedButtonSetProps<Value>
  | MultiSelectSegmentedButtonSetProps<Value>;

export interface SegmentedButtonProps<Value extends string = string>
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'value'> {
  /** Optional text label. Icon-only segments must provide an accessible name. */
  children?: ReactNode;
  /** Figma's configurable leading icon. A selected labeled segment replaces it with the check. */
  icon?: ReactNode;
  /** Hides the MD3 selected checkmark and keeps the configured icon visible. */
  hideSelectedIcon?: boolean;
  selectedIcon?: ReactNode;
  value: Value;
}

interface SegmentedButtonContextValue {
  isSelected: (value: string) => boolean;
  select: (value: string, index: number) => void;
}

const SegmentedButtonContext = createContext<SegmentedButtonContextValue | null>(null);

export function SegmentedButtonSet<Value extends string = string>(
  props: SegmentedButtonSetProps<Value>,
) {
  const {
    children,
    className,
    defaultValue,
    label,
    selectionMode = 'single',
    style,
    value,
    ...rootProps
  } = props;
  const multiple = selectionMode === 'multiple';
  const [uncontrolledSingle, setUncontrolledSingle] = useState<Value | undefined>(
    multiple ? undefined : defaultValue as Value | undefined,
  );
  const [uncontrolledMultiple, setUncontrolledMultiple] = useState<Value[]>(
    multiple ? [...(defaultValue as readonly Value[] | undefined ?? [])] : [],
  );
  const controlled = value !== undefined;
  const selectedSingle = multiple
    ? undefined
    : (controlled ? value as Value : uncontrolledSingle);
  const selectedMultiple = multiple
    ? (controlled ? [...(value as readonly Value[])] : uncontrolledMultiple)
    : [];

  const context: SegmentedButtonContextValue = {
    isSelected: (candidate) => multiple
      ? selectedMultiple.includes(candidate as Value)
      : selectedSingle === candidate,
    select: (candidate, index) => {
      const nextValue = candidate as Value;
      if (multiple) {
        const selected = selectedMultiple.includes(nextValue);
        const nextSelected = selected
          ? selectedMultiple.filter((item) => item !== nextValue)
          : [...selectedMultiple, nextValue];
        if (!controlled) setUncontrolledMultiple(nextSelected);
        (props as MultiSelectSegmentedButtonSetProps<Value>).onValueChange?.(
          nextSelected,
          { index, selected: !selected, value: nextValue },
        );
        return;
      }

      // The accepted MD3 single-select contract cannot clear its active segment.
      if (selectedSingle === nextValue) return;
      if (!controlled) setUncontrolledSingle(nextValue);
      (props as SingleSelectSegmentedButtonSetProps<Value>).onValueChange?.(
        nextValue,
        { index, selected: true, value: nextValue },
      );
    },
  };

  return (
    <SegmentedButtonContext.Provider value={context}>
      <div
        {...rootProps}
        aria-label={label}
        className={[styles.set, className].filter(Boolean).join(' ')}
        data-selection-mode={selectionMode}
        role="group"
        style={style}
      >
        {children}
      </div>
    </SegmentedButtonContext.Provider>
  );
}

export function SegmentedButton<Value extends string = string>({
  children,
  className,
  disabled = false,
  hideSelectedIcon = false,
  icon,
  onBlur,
  onClick,
  onKeyDown,
  onKeyUp,
  onPointerCancel,
  onPointerDown,
  onPointerUp,
  selectedIcon,
  type = 'button',
  value,
  ...buttonProps
}: SegmentedButtonProps<Value>) {
  const group = useContext(SegmentedButtonContext);
  if (!group) {
    throw new Error('SegmentedButton must be rendered inside SegmentedButtonSet.');
  }

  const selected = group.isSelected(value);
  const hasLabel = children !== undefined && children !== null && children !== false && children !== '';
  const showSelectedIcon = selected && !hideSelectedIcon;
  const showConfiguredIcon = Boolean(icon) && (!selected || !hasLabel || hideSelectedIcon);
  const hasLeading = !hideSelectedIcon || (hasLabel && Boolean(icon));
  const leadingVisible = showSelectedIcon || (hasLabel && Boolean(icon));
  // Adapted from Material Web Labs nextAnimationState (Apache-2.0).
  // Derive during render so the delayed check never flashes fully drawn before an effect.
  const [animation, setAnimation] = useState({
    selected, hideSelectedIcon, disabled, phase: '' as '' | 'selecting' | 'deselecting',
  });
  if (animation.selected !== selected || animation.hideSelectedIcon !== hideSelectedIcon || animation.disabled !== disabled) {
    setAnimation({
      selected,
      hideSelectedIcon,
      disabled,
      phase: animation.selected !== selected && !hideSelectedIcon
        ? selected ? 'selecting' : 'deselecting'
        : '',
    });
  }
  const { interactionProps, pressed, ripple } = usePressableInteraction({ disabled });

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || disabled) return;
    const siblings = Array.from(event.currentTarget.parentElement?.children ?? []);
    group.select(value, siblings.indexOf(event.currentTarget));
  };

  return (
    <button
      {...buttonProps}
      aria-pressed={selected}
      className={[styles.segment, className].filter(Boolean).join(' ')}
      data-has-icon={Boolean(icon) || undefined}
      data-has-label={hasLabel || undefined}
      data-leading-visible={leadingVisible || undefined}
      data-selection-motion={animation.phase || undefined}
      data-interactive-root=""
      data-pressed={pressed || undefined}
      data-selected={selected || undefined}
      disabled={disabled}
      onBlur={(event) => {
        onBlur?.(event);
        interactionProps.onBlur();
      }}
      onClick={handleClick}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (!event.defaultPrevented) interactionProps.onKeyDown(event);
      }}
      onKeyUp={(event) => {
        onKeyUp?.(event);
        interactionProps.onKeyUp(event);
      }}
      onPointerCancel={(event) => {
        onPointerCancel?.(event);
        interactionProps.onPointerCancel();
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        if (!event.defaultPrevented) interactionProps.onPointerDown(event);
      }}
      onPointerUp={(event) => {
        onPointerUp?.(event);
        interactionProps.onPointerUp();
      }}
      type={type}
    >
      <StateLayer />
      {ripple}
      <FocusRing inward />
      <span aria-hidden="true" className={styles.touchTarget} data-slot="touch-target" />
      <span className={styles.content} data-slot="content">
        {hasLeading ? (
          <span aria-hidden="true" className={styles.leading} data-slot="leading">
            <span className={styles.graphic} data-slot="graphic">
              {!hideSelectedIcon ? (
                <span
                  className={[styles.icon, styles.selectedIcon].join(' ')}
                  data-slot="selected-icon"
                  data-visible={showSelectedIcon || undefined}
                  data-custom={selectedIcon !== undefined || undefined}
                >
                  {selectedIcon === undefined ? (
                    // Material Web Labs check geometry; Copyright 2021 Google LLC, Apache-2.0.
                    <svg viewBox="0 0 24 24" focusable="false">
                      <path
                        className={styles.checkPath}
                        data-slot="checkmark-path"
                        fill="none"
                        d="M1.73,12.91 8.1,19.28 22.79,4.59"
                      />
                    </svg>
                  ) : selectedIcon}
                </span>
              ) : null}
              {hasLabel && icon ? (
                <span
                  className={[styles.icon, styles.configuredIcon].join(' ')}
                  data-slot="icon"
                  data-visible={showConfiguredIcon || undefined}
                >{icon}</span>
              ) : null}
            </span>
            {!hasLabel && icon ? (
              <span className={styles.icon} data-slot="icon">{icon}</span>
            ) : null}
          </span>
        ) : null}
        {!hasLeading && !hasLabel && icon ? (
          <span aria-hidden="true" className={styles.icon} data-slot="icon">{icon}</span>
        ) : null}
        {hasLabel ? <span className={styles.label} data-slot="label">{children}</span> : null}
      </span>
    </button>
  );
}
