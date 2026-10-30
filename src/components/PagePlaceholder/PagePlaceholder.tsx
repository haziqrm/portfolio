import styles from './PagePlaceholder.module.css';

interface PagePlaceholderProps {
  title: string;
  message?: string;
}

export function PagePlaceholder({ title, message = 'Coming soon.' }: PagePlaceholderProps) {
  return (
    <section className={styles.placeholder}>
      <h1 className={styles.title} data-reveal="0">
        {title}
      </h1>
      <p className={styles.message} data-reveal="1">
        {message}
      </p>
    </section>
  );
}
