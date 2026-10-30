import { Link } from 'react-router-dom';
import type { BlogPost } from '../../types/content';
import styles from './BlogCard.module.css';

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Link to={post.to} className={styles.card}>
      <div className={styles.body}>
        <h3 className={styles.title}>{post.title}</h3>
        <p className={styles.meta}>{post.readTimeMinutes} min read</p>
      </div>
      <img
        className={styles.cover}
        src={post.cover.src}
        alt={post.cover.alt}
        width={793}
        height={793}
        loading="lazy"
        decoding="async"
      />
    </Link>
  );
}
