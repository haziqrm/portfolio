import { useRef, type CSSProperties } from 'react';
import { AppRoutes } from '../AppRoutes';
import { CursorHalftone } from '../components/CursorHalftone/CursorHalftone';
import { useHudDepth } from '../hooks/useHudDepth';
import { TRANSITION, usePageTransition } from '../hooks/usePageTransition';
import { Header } from './Header';
import { NavBar } from './NavBar';
import styles from './Layout.module.css';

const timing = {
  '--exit-ms': `${TRANSITION.exitMs}ms`,
  '--exit-stagger': `${TRANSITION.exitStaggerMs}ms`,
  '--enter-ms': `${TRANSITION.enterMs}ms`,
  '--enter-stagger': `${TRANSITION.enterStaggerMs}ms`,
} as CSSProperties;

/**
 * Page shell. The name and nav stay put; only <main> transitions. It keeps rendering the old
 * page (`shown`) while that animates out, then swaps to the new one and animates it in.
 */
export function Layout() {
  const stageRef = useRef<HTMLElement>(null);
  const { shown, phase } = usePageTransition(stageRef);
  useHudDepth(shown.pathname);

  return (
    <div className={styles.page} style={timing}>
      <Header />
      <main ref={stageRef} className={styles.main} data-phase={phase} inert={phase === 'exit'}>
        <AppRoutes location={shown} />
      </main>
      <NavBar />
      <CursorHalftone />
    </div>
  );
}
