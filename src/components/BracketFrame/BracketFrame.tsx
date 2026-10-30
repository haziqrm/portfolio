import type { ReactNode } from 'react';
import styles from './BracketFrame.module.css';

interface BracketFrameProps {
  children: ReactNode;
  className?: string;
}

/** Draws four L-shaped corner marks around its content. */
export function BracketFrame({ children, className }: BracketFrameProps) {
  return <div className={[styles.frame, className].filter(Boolean).join(' ')}>{children}</div>;
}
