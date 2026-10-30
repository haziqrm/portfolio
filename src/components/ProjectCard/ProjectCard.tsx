import { Link } from 'react-router-dom';
import type { Project } from '../../types/content';
import styles from './ProjectCard.module.css';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link to={project.to} className={styles.card}>
      <span className="sr-only">{project.title}: </span>
      <img
        className={styles.image}
        src={project.image.src}
        alt={project.image.alt}
        width={962}
        height={518}
        loading="lazy"
        decoding="async"
      />
    </Link>
  );
}
