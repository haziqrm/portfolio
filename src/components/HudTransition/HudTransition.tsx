import type { TransitionPhase } from '../../hooks/usePageTransition';
import { BracketFrame } from '../BracketFrame/BracketFrame';
import styles from './HudTransition.module.css';

interface HudTransitionProps {
  phase: TransitionPhase;
  /** Destination page name. */
  label: string;
  /** 1-based position of the destination in the nav, if it's in there. */
  index?: number;
  total: number;
}

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Overlay for page transitions. As the old page falls away, corner brackets sweep in from the
 * screen edges and lock onto a target box naming the destination; as the new page flies in,
 * they spring back out to the edges and fade. Decorative: the page's own heading carries the
 * real name.
 */
export function HudTransition({ phase, label, index, total }: HudTransitionProps) {
  return (
    <div className={styles.overlay} data-phase={phase} aria-hidden="true">
      <BracketFrame className={styles.frame}>
        <div className={styles.dots} />
        <div className={styles.scan} />
        <div className={styles.readout}>
          <span className={styles.label}>{label}</span>
          <span className={styles.count}>
            {index ? `${pad(index)} / ${pad(total)}` : `-- / ${pad(total)}`}
          </span>
        </div>
        <div className={styles.progress} />
      </BracketFrame>
    </div>
  );
}
