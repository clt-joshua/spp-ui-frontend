import styles from './FocusRing.module.css';

export interface FocusRingProps {
  inward?: boolean;
  animated?: boolean;
  /** Virtual focus only; callers must distinguish keyboard from pointer highlight. */
  visible?: boolean;
}

export function FocusRing({ inward = false, animated = true, visible = false }: FocusRingProps) {
  return (
    <span
      aria-hidden="true"
      className={styles.root}
      data-inward={inward || undefined}
      data-static={!animated || undefined}
      data-visible={visible || undefined}
      data-slot="focus-ring"
    />
  );
}
