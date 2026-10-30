import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { useLocation, type Location } from 'react-router-dom';
import { layoutRect } from '../utils/layoutRect';

/**
 * idle  → nothing happening
 * exit  → the shown page's [data-reveal] items fall back toward the screen centre and fade
 * hold  → page hidden, the HUD overlay locks onto the destination
 * enter → the new page's items fly in from the distance
 */
export type TransitionPhase = 'idle' | 'exit' | 'hold' | 'enter';

/* Timings (ms). Layout passes these to CSS as custom properties. */
export const TRANSITION = {
  exitMs: 420,
  exitStaggerMs: 50, // per data-reveal step
  holdMs: 340,
  enterMs: 700,
  enterStaggerMs: 90,
};

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Prepares each [data-reveal] item for the stage animations: its order as --i (for the
 * stagger) and the vector from its centre to the screen centre as --to-x / --to-y (so items
 * converge on one vanishing point). Returns the highest order.
 */
function prepareItems(stage: HTMLElement | null) {
  let last = 0;
  stage?.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    const order = Number(el.dataset.reveal) || 0;
    const { cx, cy } = layoutRect(el);
    el.style.setProperty('--i', String(order));
    el.style.setProperty('--to-x', `${window.innerWidth / 2 - cx}px`);
    el.style.setProperty('--to-y', `${window.innerHeight / 2 - cy}px`);
    last = Math.max(last, order);
  });
  return last;
}

/**
 * Drives page transitions. `shown` is the location to render: it stays on the old page while
 * it animates out and only switches once the HUD overlay is covering the swap. `target` is
 * where the user is going. Navigating again mid-transition just retargets it.
 */
export function usePageTransition(stageRef: RefObject<HTMLElement | null>) {
  const location = useLocation();
  const [shown, setShown] = useState<Location>(location);
  const [target, setTarget] = useState<Location>(location);
  const [phase, setPhase] = useState<TransitionPhase>('idle');

  // New navigation: remember it, and start leaving unless a transition is already running.
  if (location.key !== target.key) {
    setTarget(location);
    if (phase === 'idle') {
      if (location.pathname === shown.pathname || prefersReducedMotion()) setShown(location);
      else setPhase('exit');
    }
  }

  // The phase timers read these, so retargeting mid-phase doesn't restart the clock.
  const latest = useRef({ shown, target });
  useEffect(() => {
    latest.current = { shown, target };
  });

  // Prepare before paint so the first animation frame already has the right delays and vectors.
  useLayoutEffect(() => {
    prepareItems(stageRef.current);
  }, [phase, shown, stageRef]);

  useEffect(() => {
    if (phase === 'idle') return;
    const last = prepareItems(stageRef.current);
    const duration =
      phase === 'exit'
        ? TRANSITION.exitMs + last * TRANSITION.exitStaggerMs
        : phase === 'hold'
          ? TRANSITION.holdMs
          : TRANSITION.enterMs + last * TRANSITION.enterStaggerMs;

    const timer = window.setTimeout(() => {
      const { shown, target } = latest.current;
      if (phase === 'exit') {
        setPhase('hold');
      } else if (phase === 'hold') {
        setShown(target);
        window.scrollTo(0, 0);
        setPhase('enter');
      } else if (target.pathname !== shown.pathname) {
        setPhase('exit'); // the user navigated again while this page was arriving
      } else {
        setShown(target);
        setPhase('idle');
      }
    }, duration);
    return () => window.clearTimeout(timer);
  }, [phase, stageRef]);

  return { shown, target, phase };
}
