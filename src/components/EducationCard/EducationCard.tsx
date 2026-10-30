import type { Education } from '../../types/content';
import { BracketFrame } from '../BracketFrame/BracketFrame';
import styles from './EducationCard.module.css';

interface EducationCardProps {
  education: Education;
}

export function EducationCard({ education }: EducationCardProps) {
  const { institution, course, period, crest } = education;

  return (
    <BracketFrame className={styles.card}>
      <img
        className={styles.crest}
        src={crest.src}
        alt={crest.alt}
        width={150}
        height={150}
        loading="lazy"
        decoding="async"
      />
      <div>
        <h3 className={styles.institution}>{institution}</h3>
        <p className={styles.course}>{course}</p>
        <p className={styles.period}>{period}</p>
      </div>
    </BracketFrame>
  );
}
