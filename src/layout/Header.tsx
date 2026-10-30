import { Link, useMatch } from 'react-router-dom';
import { site } from '../data/content';
import styles from './Header.module.css';

export function Header() {
  // The name is the page's h1 on Home only; other pages supply their own h1.
  const Tag = useMatch('/') ? 'h1' : 'p';

  return (
    <header className={styles.header}>
      <Tag className={styles.name}>
        <Link to="/">{site.name}</Link>
      </Tag>
    </header>
  );
}
