import type { CSSProperties } from 'react';
import styles from './Ripple.module.css';

export interface RippleWave {
  id: number;
  x: number;
  y: number;
  size: number;
  ending: boolean;
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
            '--ripple-size': `${wave.size}px`,
            '--ripple-x': `${wave.x}px`,
            '--ripple-y': `${wave.y}px`,
          } as CSSProperties}
        />
      ))}
    </span>
  );
}
