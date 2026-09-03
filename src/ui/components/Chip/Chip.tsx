import {
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { MaterialIcon } from '../../icons/MaterialIcon';
import { FocusRing, StateLayer, usePressableInteraction } from '../../interactions';
import styles from './Chip.module.css';

export type ChipType = 'assistive' | 'filter' | 'input' | 'location';
export type ChipSize = 'large' | 'small' | 'x-small';
export type ChipAssistiveLevel =
  | 'primary'
  | 'secondary'
  | 'neutral'
  | 'outline'
  | 'systemError'
  | 'systemWarning'
  | 'systemGood'
  | 'systemInfo'
  | 'systemErrorVariant'
  | 'systemWarningVariant'
  | 'systemGoodVariant'
  | 'systemInfoVariant';

interface ChipCommonProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'children' | 'className' | 'defaultValue' | 'size' | 'style' | 'type' | 'value'
  > {
  children: ReactNode;
  className?: string;
  size?: ChipSize;
  style?: CSSProperties;
}

export interface AssistiveChipProps extends ChipCommonProps {
  chipType?: 'assistive';
  leadingIcon?: ReactNode;
  level?: ChipAssistiveLevel;
}

export interface FilterChipProps extends ChipCommonProps {
  chipType: 'filter';
  defaultSelected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  selected?: boolean;
  selectedIcon?: ReactNode;
  showTrailingIcon?: boolean;
  trailingIcon?: ReactNode;
}

export interface InputChipProps extends ChipCommonProps {
  chipType: 'input';
  onRemove?: (event: MouseEvent<HTMLButtonElement>) => void;
  removeOnly?: boolean;
  removeLabel?: string;
  selected?: boolean;
}

export interface LocationChipProps {
  'aria-describedby'?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  children: ReactNode;
  chipType: 'location';
  className?: string;
  id?: string;
  prefix?: ReactNode;
  size?: 'small';
  style?: CSSProperties;
  title?: string;
}

export type ChipProps =
  | AssistiveChipProps
  | FilterChipProps
  | InputChipProps
  | LocationChipProps;

export interface ChipSetProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
}

export function ChipSet({ children, className, label, onKeyDown, ...props }: ChipSetProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const actions = getEnabledActions(rootRef.current);
    const focused = actions.find((action) => action === document.activeElement);
    const active = focused ?? actions.find((action) => action.tabIndex === 0) ?? actions[0];
    for (const action of actions) action.tabIndex = action === active ? 0 : -1;
  });

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    const isPrevious = event.key === 'ArrowLeft';
    const isNext = event.key === 'ArrowRight';
    const isFirst = event.key === 'Home';
    const isLast = event.key === 'End';
    if (!isPrevious && !isNext && !isFirst && !isLast) return;

    const actions = getEnabledActions(rootRef.current);
    if (actions.length < 2) return;
    event.preventDefault();

    const currentIndex = Math.max(0, actions.findIndex((action) => action === document.activeElement));
    const direction = getComputedStyle(event.currentTarget).direction;
    const nextDelta = direction === 'rtl' ? -1 : 1;
    const delta = isNext ? nextDelta : -nextDelta;
    const nextIndex = isFirst
      ? 0
      : isLast
        ? actions.length - 1
        : (currentIndex + delta + actions.length) % actions.length;

    for (const action of actions) action.tabIndex = -1;
    actions[nextIndex]!.tabIndex = 0;
    actions[nextIndex]!.focus();
  };

  return (
    <div
      {...props}
      aria-label={label}
      className={[styles.set, className].filter(Boolean).join(' ')}
      onKeyDown={handleKeyDown}
      ref={rootRef}
      role="toolbar"
    >
      {children}
    </div>
  );
}

export function Chip(props: ChipProps) {
  if (props.chipType === 'filter') return <FilterChip {...props} />;
  if (props.chipType === 'input') return <InputChip {...props} />;
  if (props.chipType === 'location') return <LocationChip {...props} />;
  return <AssistiveChip {...props} />;
}

function AssistiveChip({
  children,
  chipType: _chipType,
  className,
  leadingIcon,
  level = 'primary',
  size = 'large',
  style,
  ...actionProps
}: AssistiveChipProps) {
  void _chipType;
  return (
    <ChipRoot
      chipType="assistive"
      className={className}
      disabled={actionProps.disabled}
      level={level}
      size={size}
      style={style}
    >
      <ChipAction {...actionProps} action="primary" className={styles.primaryAction}>
        {leadingIcon ? <ChipIcon>{leadingIcon}</ChipIcon> : null}
        <span className={styles.label}>{children}</span>
      </ChipAction>
    </ChipRoot>
  );
}

function FilterChip({
  children,
  chipType: _chipType,
  className,
  defaultSelected = false,
  onClick,
  onSelectedChange,
  selected,
  selectedIcon = <MaterialIcon name="check" />,
  showTrailingIcon = true,
  size = 'large',
  style,
  trailingIcon = <MaterialIcon name="arrow_drop_down" />,
  ...actionProps
}: FilterChipProps) {
  void _chipType;
  const [uncontrolledSelected, setUncontrolledSelected] = useState(defaultSelected);
  const currentSelected = selected ?? uncontrolledSelected;

  return (
    <ChipRoot
      chipType="filter"
      className={className}
      disabled={actionProps.disabled}
      selected={currentSelected}
      size={size}
      style={style}
    >
      <ChipAction
        {...actionProps}
        action="primary"
        aria-pressed={currentSelected}
        className={styles.primaryAction}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented || actionProps.disabled) return;
          const nextSelected = !currentSelected;
          if (selected === undefined) setUncontrolledSelected(nextSelected);
          onSelectedChange?.(nextSelected);
        }}
      >
        {currentSelected ? <ChipIcon>{selectedIcon}</ChipIcon> : null}
        <span className={styles.label}>{children}</span>
        {showTrailingIcon ? <ChipIcon>{trailingIcon}</ChipIcon> : null}
      </ChipAction>
    </ChipRoot>
  );
}

function InputChip({
  children,
  chipType: _chipType,
  className,
  disabled,
  onRemove,
  removeOnly = false,
  removeLabel,
  selected = false,
  size = 'large',
  style,
  ...actionProps
}: InputChipProps) {
  void _chipType;
  const [removed, setRemoved] = useState(false);
  const accessibleRemoveLabel = removeLabel
    ?? (typeof children === 'string' ? `${children} 삭제` : 'Chip 삭제');

  if (removed) return null;

  return (
    <ChipRoot
      chipType="input"
      className={className}
      disabled={disabled}
      selected={selected}
      size={size}
      style={style}
    >
      {removeOnly ? (
        <span className={[styles.action, styles.primaryAction, styles.passiveAction].join(' ')}>
          <span className={styles.actionContent}>
            <span className={styles.label}>{children}</span>
          </span>
        </span>
      ) : (
        <ChipAction
          {...actionProps}
          action="primary"
          className={styles.primaryAction}
          disabled={disabled}
        >
          <span className={styles.label}>{children}</span>
        </ChipAction>
      )}
      <ChipAction
        action="remove"
        aria-label={accessibleRemoveLabel}
        className={styles.removeAction}
        disabled={disabled}
        onClick={(event) => {
          event.stopPropagation();
          onRemove?.(event);
          if (!event.defaultPrevented) setRemoved(true);
        }}
      >
        <ChipIcon><MaterialIcon name="close" /></ChipIcon>
      </ChipAction>
    </ChipRoot>
  );
}

function LocationChip({
  children,
  chipType: _chipType,
  className,
  prefix = 'X',
  size: _size,
  style,
  ...displayProps
}: LocationChipProps) {
  void _chipType;
  void _size;
  return (
    <span
      {...displayProps}
      className={[styles.root, styles.location, className].filter(Boolean).join(' ')}
      data-chip-type="location"
      data-size="small"
      style={style}
    >
      <span className={[styles.actionContent, styles.locationContent].join(' ')}>
        <span className={styles.locationPrefix}>{prefix}</span>
        <span className={styles.label}>{children}</span>
      </span>
    </span>
  );
}

interface ChipRootProps {
  children: ReactNode;
  chipType: ChipType;
  className?: string;
  disabled?: boolean;
  level?: ChipAssistiveLevel;
  selected?: boolean;
  size: ChipSize;
  style?: CSSProperties;
}

function ChipRoot({
  children,
  chipType,
  className,
  disabled,
  level,
  selected,
  size,
  style,
}: ChipRootProps) {
  return (
    <span
      className={[styles.root, styles[chipType], className].filter(Boolean).join(' ')}
      data-chip-type={chipType}
      data-disabled={disabled || undefined}
      data-level={level}
      data-selected={selected || undefined}
      data-size={size}
      style={style}
    >
      {children}
    </span>
  );
}

interface ChipActionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  action: 'primary' | 'remove';
}

function ChipAction({
  action,
  children,
  className,
  disabled = false,
  onBlur,
  onKeyDown,
  onKeyUp,
  onPointerCancel,
  onPointerDown,
  onPointerUp,
  type = 'button',
  ...props
}: ChipActionProps) {
  const { interactionProps, pressed, ripple } = usePressableInteraction({ disabled });

  return (
    <button
      {...props}
      className={[styles.action, className].filter(Boolean).join(' ')}
      data-chip-action={action}
      data-interactive-root=""
      data-pressed={pressed || undefined}
      disabled={disabled}
      onBlur={(event) => {
        onBlur?.(event);
        interactionProps.onBlur();
      }}
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
      <span className={styles.actionContent}>{children}</span>
    </button>
  );
}

function ChipIcon({ children }: { children: ReactNode }) {
  return <span aria-hidden="true" className={styles.icon}>{children}</span>;
}

function getEnabledActions(root: HTMLElement | null): HTMLButtonElement[] {
  if (!root) return [];
  return Array.from(
    root.querySelectorAll<HTMLButtonElement>('[data-chip-action]:not(:disabled)'),
  );
}
