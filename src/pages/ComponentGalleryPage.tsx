import { useEffect, useLayoutEffect, useRef, useSyncExternalStore } from 'react';
import { Select } from '@/ui';
import { galleryComponents, resolveGalleryId, type GalleryComponentId } from './gallery/registry';
import styles from './ComponentGalleryPage.module.css';

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}
const getSnapshot = () => window.location.hash;

export function ComponentGalleryPage() {
  const hash = useSyncExternalStore(subscribe, getSnapshot, () => '#button');
  const id = resolveGalleryId(hash);
  const entry = galleryComponents.find((component) => component.id === id)!;
  const { Example } = entry;
  const heading = useRef<HTMLHeadingElement>(null);
  const previousId = useRef(id);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'SPP UI Component Verification';
    return () => { document.title = previousTitle; };
  }, []);

  useEffect(() => {
    if (hash !== '#' + id) {
      window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search + '#' + id);
    }
  }, [hash, id]);

  useLayoutEffect(() => {
    if (previousId.current !== id) {
      heading.current?.focus({ preventScroll: true });
      heading.current?.scrollIntoView({ block: 'start' });
      previousId.current = id;
    }
  }, [id]);

  const navigate = (next: GalleryComponentId) => { window.location.hash = next; };

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <div>
            <span className={styles.eyebrow}>Verification workspace</span>
            <h1>컴포넌트 검증</h1>
            <p>{galleryComponents.length}개 컴포넌트 · 실제 속성과 상태를 확인하세요.</p>
          </div>
          <div className={styles.mobileNavigation}>
            <Select label="컴포넌트 선택" value={id} onValueChange={navigate}
              options={galleryComponents.map(({ id: value, label }) => ({ value, label }))} />
          </div>
          <nav aria-label="컴포넌트 목록" className={styles.sectionNav}>
            {galleryComponents.map((component) => (
              <a href={'#' + component.id} key={component.id}
                aria-current={component.id === id ? 'page' : undefined}>{component.label}</a>
            ))}
          </nav>
          <div className={styles.checklist}>
            <h2>확인 기준</h2>
            <ul>
              <li>variant와 size 누락 여부</li>
              <li>enabled·selected·error·disabled 상태</li>
              <li>키보드와 포커스 흐름</li>
              <li>현재 Theme token 상속</li>
            </ul>
          </div>
        </aside>
        <div className={styles.content}>
          <section className={styles.gallerySection} id={id} aria-labelledby="component-title" data-gallery-component={id}>
            <div className={styles.sectionHeading}>
              <div>
                <h2 id="component-title" ref={heading} tabIndex={-1}>{entry.label}</h2>
                <p>{entry.description}</p>
                <p>다른 컴포넌트로 이동하면 샘플 상태가 초기화됩니다. 테마는 유지됩니다.</p>
              </div>
            </div>
            <div className={styles.sectionBody}><Example key={id} /></div>
          </section>
        </div>
      </div>
    </main>
  );
}
