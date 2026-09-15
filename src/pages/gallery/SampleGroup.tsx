import type { ReactNode } from 'react';
import styles from '../ComponentGalleryPage.module.css';

export function SampleGroup({ children, title }: { children: ReactNode; title: string }) {
  return <div className={styles.sampleGroup}><h3>{title}</h3><div className={styles.sampleSurface}>{children}</div></div>;
}
