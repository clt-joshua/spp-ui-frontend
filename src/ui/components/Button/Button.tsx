import { Button as BaseButton } from '@base-ui/react/button';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { FocusRing, StateLayer, usePressableInteraction } from '../../interactions';
import styles from './Button.module.css';

export type ButtonVariant = 'elevated' | 'filled' | 'tonal' | 'outlined' | 'text';

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  variant?: ButtonVariant;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export function Button({
  children,
  className,
  disabled = false,
  leadingIcon,
  onBlur,
  onKeyDown,
  onKeyUp,
  onPointerCancel,
  onPointerDown,
  onPointerUp,
  trailingIcon,
  type = 'button',
  variant = 'filled',
  ...props
}: ButtonProps) {
  const { interactionProps, pressed, ripple } = usePressableInteraction({ disabled });
  const classes = [styles.root, styles[variant], className].filter(Boolean).join(' ');

  return (
    <BaseButton
      {...props}
      className={classes}
      data-has-leading-icon={leadingIcon ? '' : undefined}
      data-has-trailing-icon={trailingIcon ? '' : undefined}
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
      <FocusRing />
      <span className={styles.content}>
        {leadingIcon ? <span className={styles.icon}>{leadingIcon}</span> : null}
        <span>{children}</span>
        {trailingIcon ? <span className={styles.icon}>{trailingIcon}</span> : null}
      </span>
    </BaseButton>
  );
}
