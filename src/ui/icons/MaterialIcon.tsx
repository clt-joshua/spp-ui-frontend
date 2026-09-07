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

  // Figma TextField's outlined place glyph is not the Filled font's `place`.
  // Preserve the exported path while retaining this replaceable icon adapter.
  if (name === 'place_outline') {
    return (
      <span {...props} aria-hidden={label ? undefined : true} aria-label={label} className={classes} role={label ? 'img' : undefined}>
        <svg aria-hidden="true" focusable="false" height="100%" viewBox="0 0 16 16" width="100%">
          <path d="M8 8C7.26667 8 6.66667 7.4 6.66667 6.66667C6.66667 5.93333 7.26667 5.33333 8 5.33333C8.73333 5.33333 9.33333 5.93333 9.33333 6.66667C9.33333 7.4 8.73333 8 8 8ZM12 6.8C12 4.38 10.2333 2.66667 8 2.66667C5.76667 2.66667 4 4.38 4 6.8C4 8.36 5.3 10.4267 8 12.8933C10.7 10.4267 12 8.36 12 6.8ZM8 1.33333C10.8 1.33333 13.3333 3.48 13.3333 6.8C13.3333 9.01333 11.5533 11.6333 8 14.6667C4.44667 11.6333 2.66667 9.01333 2.66667 6.8C2.66667 3.48 5.2 1.33333 8 1.33333Z" fill="currentColor" />
        </svg>
      </span>
    );
  }

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
