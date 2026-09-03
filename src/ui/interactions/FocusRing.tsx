import styles from './FocusRing.module.css';

export interface FocusRingProps {
  inward?: boolean;
}

export function FocusRing({ inward = false }: FocusRingProps) {
  return (
    <span
      aria-hidden="true"
      className={styles.root}
      data-inward={inward || undefined}
      data-slot="focus-ring"
    />
  );
}
