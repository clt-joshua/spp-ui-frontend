import styles from './FocusRing.module.css';

export function FocusRing() {
  return <span aria-hidden="true" className={styles.root} data-slot="focus-ring" />;
}
