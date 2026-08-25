import { MaterialIcon } from '@/ui';
import styles from './App.module.css';

const foundations = [
  {
    icon: 'account_tree',
    title: '범용 UI 경계',
    description: 'src/ui는 Vite 전용 API 없이 React 공개 API만 제공합니다.',
  },
  {
    icon: 'palette',
    title: '교체 가능한 Theme 기반',
    description: 'Roboto를 기본값으로 사용하고 CSS 변수로 서체를 교체합니다.',
  },
  {
    icon: 'verified_user',
    title: '준수 우선 개발',
    description: 'Stable M3 Web과 실제 앱 흐름을 완료 증거로 사용합니다.',
  },
] as const;

export default function App() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="page-title">
        <span className={styles.eyebrow}>SPP UI Foundation</span>
        <h1 id="page-title">Vite 기반 React UI 시스템 준비 완료</h1>
        <p>
          이 화면은 제품 컴포넌트 구현이 아니라, Node 24와 범용{' '}
          <code>src/ui</code> 경계가 실제 Vite 진입점에서 연결되었음을 보여주는
          foundation 상태 화면입니다.
        </p>
      </section>

      <section className={styles.grid} aria-label="초기 기반 상태">
        {foundations.map((foundation) => (
          <article className={styles.card} key={foundation.title}>
            <MaterialIcon name={foundation.icon} />
            <h2>{foundation.title}</h2>
            <p>{foundation.description}</p>
          </article>
        ))}
      </section>

      <aside className={styles.notice}>
        <MaterialIcon name="info" />
        <p>
          Button 등 8개 MVP 컴포넌트와 Theme Runtime은 아직 구현되지 않았으며,
          각 세로 슬라이스의 준수 검증 후 공개됩니다.
        </p>
      </aside>
    </main>
  );
}
