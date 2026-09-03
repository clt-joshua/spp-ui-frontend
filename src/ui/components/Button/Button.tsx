import { Button as BaseButton } from '@base-ui/react/button';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { FocusRing, StateLayer, usePressableInteraction } from '../../interactions';
import styles from './Button.module.css';

export type ButtonVariant = 'elevated' | 'filled' | 'tonal' | 'outlined' | 'text';
export type ButtonSize = 'large' | 'medium' | 'small';

type ButtonIconProps =
  | { leadingIcon?: ReactNode; trailingIcon?: never }
  | { leadingIcon?: never; trailingIcon?: ReactNode };

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  error?: boolean;
} & ButtonIconProps;

export function Button({
  children,
  className,
  disabled = false,
  error = false,
  leadingIcon,
  onBlur,
  onKeyDown,
  onKeyUp,
  onPointerCancel,
  onPointerDown,
  onPointerUp,
  size = 'large',
  trailingIcon,
  type = 'button',
  variant = 'filled',
  ...props
}: ButtonProps) {
  const { interactionProps, pressed, ripple } = usePressableInteraction({ disabled });
  const classes = [styles.root, styles[variant], styles[size], className]
    .filter(Boolean)
    .join(' ');
  const contentType = leadingIcon && trailingIcon
    ? 'both-icons'
    : leadingIcon
      ? 'left-icon'
      : trailingIcon
        ? 'right-icon'
        : 'text-only';

  return (
    <BaseButton
      {...props}
      className={classes}
      data-button-variant={variant}
      data-content-type={contentType}
      data-error={error || undefined}
      data-has-leading-icon={leadingIcon ? '' : undefined}
      data-has-trailing-icon={trailingIcon ? '' : undefined}
      data-interactive-root=""
      data-pressed={pressed || undefined}
      data-size={size}
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
      <span className={styles.content}>
        {leadingIcon ? <span className={styles.icon}>{leadingIcon}</span> : null}
        <span className={styles.label} data-slot="label">{children}</span>
        {trailingIcon ? <span className={styles.icon}>{trailingIcon}</span> : null}
      </span>
    </BaseButton>
  );
}
