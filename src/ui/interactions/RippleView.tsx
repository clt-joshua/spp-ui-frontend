import type { CSSProperties } from 'react';
import styles from './Ripple.module.css';

export interface RippleWave {
  endX: number;
  endY: number;
  ending: boolean;
  id: number;
  scale: number;
  size: number;
  startX: number;
  startY: number;
}

export function RippleView({ waves }: { waves: RippleWave[] }) {
  return (
    <span aria-hidden="true" className={styles.root} data-slot="ripple">
      {waves.map((wave) => (
        <span
          className={styles.wave}
          data-ending={wave.ending || undefined}
          key={wave.id}
          style={{
            '--ripple-end-x': `${wave.endX}px`,
            '--ripple-end-y': `${wave.endY}px`,
            '--ripple-scale': wave.scale,
            '--ripple-size': `${wave.size}px`,
            '--ripple-start-x': `${wave.startX}px`,
            '--ripple-start-y': `${wave.startY}px`,
          } as CSSProperties}
        >
          <span className={styles.surface} />
        </span>
      ))}
    </span>
  );
}
