import styles from './StateLayer.module.css';

export function StateLayer() {
  return <span aria-hidden="true" className={styles.root} data-slot="state-layer" />;
}
