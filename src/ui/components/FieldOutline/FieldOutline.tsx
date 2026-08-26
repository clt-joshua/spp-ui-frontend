import type { HTMLAttributes } from 'react';
import styles from './FieldOutline.module.css';

interface FieldOutlineProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  open: boolean;
}

export function FieldOutline({ className, label, open, ...props }: FieldOutlineProps) {
  return (
    <div
      {...props}
      aria-hidden="true"
      className={[styles.outline, className].filter(Boolean).join(' ')}
      data-slot="field-outline"
    >
      <span className={styles.start} data-slot="outline-start" />
      <span
        className={styles.notch}
        data-open={open || undefined}
        data-slot="outline-notch"
      >
        <span className={styles.inactivePanel} />
        <span className={styles.activePanel} />
        <span className={styles.label} data-slot="outline-label">{label}</span>
      </span>
      <span className={styles.end} data-slot="outline-end" />
    </div>
  );
}
