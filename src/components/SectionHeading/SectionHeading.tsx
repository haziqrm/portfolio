import type { ReactNode } from 'react';
import styles from './SectionHeading.module.css';

interface SectionHeadingProps {
  title: string;
  /** Optional element (usually a ChamferButton) shown at the end of the row. */
  action?: ReactNode;
  align?: 'start' | 'center';
  className?: string;
}

export function SectionHeading({ title, action, align = 'start', className }: SectionHeadingProps) {
  return (
    <div className={[styles.row, className].filter(Boolean).join(' ')} data-align={align}>
      <h2 className={styles.title}>{title}</h2>
      {action}
    </div>
  );
}
