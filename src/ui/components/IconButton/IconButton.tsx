import { Button as BaseButton } from '@base-ui/react/button';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { FocusRing, StateLayer, usePressableInteraction } from '../../interactions';
import styles from './IconButton.module.css';

export type IconButtonVariant = 'standard' | 'filled' | 'tonal' | 'outlined';

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  'aria-label': string;
  icon: ReactNode;
  selected?: boolean;
  selectedIcon?: ReactNode;
  variant?: IconButtonVariant;
}

export function IconButton({
  className,
  disabled = false,
  icon,
  onBlur,
  onKeyDown,
  onKeyUp,
  onPointerCancel,
  onPointerDown,
  onPointerUp,
  selected = false,
  selectedIcon,
  variant = 'standard',
  ...props
}: IconButtonProps) {
  const { interactionProps, pressed, ripple } = usePressableInteraction({
    centered: true,
    disabled,
  });
  const classes = [styles.root, styles[variant], className].filter(Boolean).join(' ');

  return (
    <BaseButton
      {...props}
      aria-pressed={selectedIcon ? selected : props['aria-pressed']}
      className={classes}
      data-interactive-root=""
      data-pressed={pressed || undefined}
      data-selected={selected || undefined}
      data-toggle={selectedIcon ? '' : undefined}
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
      type="button"
    >
      <StateLayer />
      {ripple}
      <FocusRing />
      <span className={styles.icon}>{selected && selectedIcon ? selectedIcon : icon}</span>
    </BaseButton>
  );
}
