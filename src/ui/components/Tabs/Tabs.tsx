import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import type {
  ButtonHTMLAttributes,
  CSSProperties,
  HTMLAttributes,
  ReactNode,
} from 'react';
import { MaterialIcon } from '../../icons/MaterialIcon';
import { FocusRing, StateLayer, usePressableInteraction } from '../../interactions';
import styles from './Tabs.module.css';

export interface TabsProps<Value extends string = string> {
  children: ReactNode;
  className?: string;
  defaultValue?: Value;
  onValueChange?: (value: Value, details: TabsValueChangeDetails) => void;
  style?: CSSProperties;
  value?: Value;
}

export interface TabsValueChangeDetails {
  activationDirection: 'left' | 'right' | 'up' | 'down' | 'none';
  cancel: () => void;
  isCanceled: boolean;
  reason: 'none' | 'disabled' | 'missing' | 'initial';
}

export interface TabListProps extends HTMLAttributes<HTMLDivElement> {
  /** Accessible name announced for the tab list. */
  label: string;
  /** Matches Stable Material Web's `autoActivate`; manual activation is the default. */
  autoActivate?: boolean;
  loopFocus?: boolean;
}

export interface TabProps<Value extends string = string>
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'value'> {
  children: ReactNode;
  /** Shows the Figma trailing close glyph as decorative tab content. */
  showTrailingIcon?: boolean;
  trailingIcon?: ReactNode;
  value: Value;
}

export interface TabPanelProps<Value extends string = string>
  extends Omit<HTMLAttributes<HTMLDivElement>, 'hidden'> {
  children: ReactNode;
  keepMounted?: boolean;
  value: Value;
}

export function Tabs<Value extends string = string>({
  children,
  className,
  defaultValue,
  onValueChange,
  style,
  value,
}: TabsProps<Value>) {
  return (
    <BaseTabs.Root
      className={[styles.root, className].filter(Boolean).join(' ')}
      defaultValue={defaultValue}
      onValueChange={(nextValue, details) => onValueChange?.(nextValue as Value, details)}
      orientation="horizontal"
      style={style}
      value={value}
    >
      {children}
    </BaseTabs.Root>
  );
}

export function TabList({
  autoActivate = false,
  children,
  className,
  label,
  loopFocus = true,
  ...props
}: TabListProps) {
  return (
    <BaseTabs.List
      {...props}
      activateOnFocus={autoActivate}
      aria-label={label}
      className={[styles.list, className].filter(Boolean).join(' ')}
      loopFocus={loopFocus}
    >
      {children}
      <BaseTabs.Indicator className={styles.indicator} data-slot="active-indicator" />
    </BaseTabs.List>
  );
}

export function Tab<Value extends string = string>({
  children,
  className,
  disabled = false,
  onBlur,
  onKeyDown,
  onKeyUp,
  onPointerCancel,
  onPointerDown,
  onPointerUp,
  showTrailingIcon = true,
  trailingIcon = <MaterialIcon name="close" />,
  type = 'button',
  value,
  ...props
}: TabProps<Value>) {
  const { interactionProps, pressed, ripple } = usePressableInteraction({ disabled });

  return (
    <BaseTabs.Tab
      {...props}
      className={[styles.tab, className].filter(Boolean).join(' ')}
      data-interactive-root=""
      data-pressed={pressed || undefined}
      data-show-trailing-icon={showTrailingIcon || undefined}
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
      value={value}
    >
      <StateLayer />
      {ripple}
      <FocusRing inward />
      <span className={styles.content}>
        <span className={styles.label} data-slot="label">{children}</span>
        {showTrailingIcon ? (
          <span aria-hidden="true" className={styles.trailingIcon} data-slot="trailing-icon">
            {trailingIcon}
          </span>
        ) : null}
      </span>
    </BaseTabs.Tab>
  );
}

export function TabPanel<Value extends string = string>({
  children,
  className,
  keepMounted,
  value,
  ...props
}: TabPanelProps<Value>) {
  return (
    <BaseTabs.Panel
      {...props}
      className={[styles.panel, className].filter(Boolean).join(' ')}
      keepMounted={keepMounted}
      value={value}
    >
      {children}
    </BaseTabs.Panel>
  );
}
