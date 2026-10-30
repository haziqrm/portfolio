import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from './ChamferButton.module.css';

/** Which pair of opposite corners is cut. */
export type ChamferCorners = 'tr-bl' | 'tl-br';

interface ChamferButtonProps {
  to: string;
  corners?: ChamferCorners;
  children: ReactNode;
}

export function ChamferButton({ to, corners = 'tl-br', children }: ChamferButtonProps) {
  return (
    <Link to={to} className={styles.button} data-corners={corners}>
      {children}
    </Link>
  );
}
