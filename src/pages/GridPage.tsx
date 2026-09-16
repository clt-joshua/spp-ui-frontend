import { useEffect } from 'react';
import { Button, useTheme } from '@/ui';
import { GridExamples, GridGuideExamples } from './GridExamples';
import styles from './GridPage.module.css';

export function GridPage() {
  const theme = useTheme();
  useEffect(() => { document.title = 'SPP UI · 업무용 그리드'; }, []);
  return <main className={styles.page}>
    <section className={styles.intro}><span>DATA GRID</span><h1>업무 요청 목록</h1><p>요청을 조회하고 담당자·분류·수량을 바로 수정합니다.</p></section>
    <div className={styles.actions}><a href="/components#data-grid">그리드 컴포넌트 검증</a><Button variant="outlined" size="small" onClick={() => theme.previewTheme({ ...theme.config, mode: theme.resolvedMode === 'dark' ? 'light' : 'dark' })}>테마 전환</Button></div>
    <section className={styles.card} aria-label="요청 관리">
      <div className={styles.cardHeading}><h2>전체 요청</h2><span>기본 높이 · 헤더 32px · 바디 40px</span></div>
      <GridExamples />
    </section>
    <p className={styles.help}>예시 목록입니다. 편집 내용은 현재 화면에서만 유지됩니다. 정렬 아이콘을 누르면 오름차순·내림차순·해제를 전환합니다. 필터는 입력한 문자를 포함하는 행을 표시합니다.</p>
    <p className={styles.help}>Tab으로 컨트롤을 이동하고, 셀에 초점이 있을 때 방향키로 인접 셀을 이동합니다. 잠긴 행은 선택·편집할 수 없습니다.</p>
    <section className={styles.guide} aria-label="그리드 셀 가이드"><GridGuideExamples /></section>
  </main>;
}
