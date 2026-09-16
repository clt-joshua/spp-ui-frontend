import { MaterialIcon, useTheme } from '@/ui';
import styles from './AppHeader.module.css';

export function AppHeader({ currentPage }: { currentPage: 'theme' | 'components' | 'grid' }) {
  const theme = useTheme();
  return (
    <header className={styles.header}>
      <a className={styles.brand} href="/" aria-label="SPP UI Theme Lab 홈">
        <span className={styles.brandMark}><MaterialIcon name="widgets" /></span>
        <span>SPP UI</span>
      </a>
      <nav aria-label="주요 페이지" className={styles.navigation}>
        <a href="/" aria-current={currentPage === 'theme' ? 'page' : undefined}>Theme Lab</a>
        <a href="/components" aria-current={currentPage === 'components' ? 'page' : undefined}>컴포넌트 검증</a>
        <a href="/grid" aria-current={currentPage === 'grid' ? 'page' : undefined}>업무용 그리드</a>
      </nav>
      <span className={styles.status}>
        <span className={styles.statusDot} />
        {theme.resolvedMode === 'dark' ? 'Dark' : 'Light'} · {theme.config.contrast === 'high' ? 'High contrast' : 'Standard'}
      </span>
    </header>
  );
}
