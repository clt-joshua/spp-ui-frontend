import type { HTMLAttributes } from 'react';
import styles from './MaterialIcon.module.css';

export interface MaterialIconProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'aria-label' | 'children'> {
  name: string;
  label?: string;
}

export function MaterialIcon({
  name,
  label,
  className,
  ...props
}: MaterialIconProps) {
  const classes = ['material-icons', styles.root, className]
    .filter(Boolean)
    .join(' ');

  return (
    <span
      {...props}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      className={classes}
      role={label ? 'img' : undefined}
    >
      {name}
    </span>
  );
}
