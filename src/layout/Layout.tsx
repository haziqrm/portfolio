import { useRef, type CSSProperties } from 'react';
import { AppRoutes } from '../AppRoutes';
import { CursorHalftone } from '../components/CursorHalftone/CursorHalftone';
import { HudTransition } from '../components/HudTransition/HudTransition';
import { site } from '../data/content';
import { useHudDepth } from '../hooks/useHudDepth';
import { TRANSITION, usePageTransition } from '../hooks/usePageTransition';
import { Header } from './Header';
import { NavBar } from './NavBar';
import styles from './Layout.module.css';

const timing = {
  '--exit-ms': `${TRANSITION.exitMs}ms`,
  '--exit-stagger': `${TRANSITION.exitStaggerMs}ms`,
  '--hold-ms': `${TRANSITION.holdMs}ms`,
  '--enter-ms': `${TRANSITION.enterMs}ms`,
  '--enter-stagger': `${TRANSITION.enterStaggerMs}ms`,
} as CSSProperties;

/**
 * Page shell. The name and nav stay put; only <main> transitions. It keeps rendering the old
 * page (`shown`) while that animates out, then swaps to the new one behind the HUD overlay.
 */
export function Layout() {
  const stageRef = useRef<HTMLElement>(null);
  const { shown, target, phase } = usePageTransition(stageRef);
  useHudDepth(shown.pathname);

  const navIndex = site.nav.findIndex((link) => link.to === target.pathname);
  const leaving = phase === 'exit' || phase === 'hold';

  return (
    <div className={styles.page} style={timing}>
      <Header />
      <main ref={stageRef} className={styles.main} data-phase={phase} inert={leaving}>
        <AppRoutes location={shown} />
      </main>
      <NavBar />
      <HudTransition
        phase={phase}
        label={navIndex >= 0 ? site.nav[navIndex].label : site.notFoundLabel}
        index={navIndex >= 0 ? navIndex + 1 : undefined}
        total={site.nav.length}
      />
      <CursorHalftone />
    </div>
  );
}
