import { Button as BaseButton } from '@base-ui/react/button';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { FocusRing, StateLayer, usePressableInteraction } from '../../interactions';
import styles from './IconButton.module.css';

export type IconButtonVariant = 'standard' | 'filled' | 'tonal' | 'outlined' | 'error';
export type IconButtonSize = 'large' | 'medium' | 'small';

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  'aria-label': string;
  icon: ReactNode;
  selected?: boolean;
  selectedAriaLabel?: string;
  selectedIcon?: ReactNode;
  size?: IconButtonSize;
  variant?: IconButtonVariant;
}

export function IconButton({
  'aria-label': ariaLabel,
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
  selectedAriaLabel,
  selectedIcon,
  size = 'large',
  type = 'button',
  variant = 'standard',
  ...props
}: IconButtonProps) {
  const { interactionProps, pressed, ripple } = usePressableInteraction({
    centered: true,
    disabled,
  });
  const classes = [styles.root, styles[variant], styles[size], className]
    .filter(Boolean)
    .join(' ');

  return (
    <BaseButton
      {...props}
      aria-label={selected && selectedAriaLabel ? selectedAriaLabel : ariaLabel}
      aria-pressed={selectedIcon ? selected : props['aria-pressed']}
      className={classes}
      data-icon-button-variant={variant}
      data-interactive-root=""
      data-pressed={pressed || undefined}
      data-selected={selected || undefined}
      data-size={size}
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
      type={type}
    >
      <span aria-hidden="true" className={styles.touchTarget} data-slot="touch-target" />
      <StateLayer />
      {ripple}
      <FocusRing />
      <span aria-hidden="true" className={styles.icon} data-slot="icon">
        {selected && selectedIcon ? selectedIcon : icon}
      </span>
    </BaseButton>
  );
}
