import { NavLink } from 'react-router-dom';
import { site } from '../data/content';
import styles from './NavBar.module.css';

export function NavBar() {
  return (
    <nav className={styles.nav} aria-label="Main">
      <ul className={styles.list}>
        {site.nav.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.active}` : styles.link
              }
              data-label={item.label}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
