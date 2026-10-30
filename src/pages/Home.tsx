import { home } from '../data/content';
import { BlogCard } from '../components/BlogCard/BlogCard';
import { ChamferButton } from '../components/ChamferButton/ChamferButton';
import { EducationCard } from '../components/EducationCard/EducationCard';
import { NowPlayingCard } from '../components/NowPlayingCard/NowPlayingCard';
import { ProjectCard } from '../components/ProjectCard/ProjectCard';
import { SectionHeading } from '../components/SectionHeading/SectionHeading';
import styles from './Home.module.css';

export function Home() {
  const { portrait, tagline, education, project, blog, track } = home;

  return (
    // The four content blocks marked data-depth are driven by the HUD effect (useHudDepth);
    // data-reveal sets the order things fly in and out during page transitions (Layout). Keep the
    // two apart: a transition animation on a data-depth element would override the HUD's transform.
    <div className={styles.grid}>
      <div className={styles.centre} data-reveal="1">
        <img
          className={styles.portrait}
          src={portrait.src}
          alt={portrait.alt}
          width={1008}
          height={1344}
          fetchPriority="high"
        />
      </div>

      <p className={styles.tagline} data-reveal="2">
        {tagline.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </p>

      <section className={styles.left} aria-label="Education and projects" data-reveal="0">
        <div data-depth>
          <SectionHeading
            title={education.heading}
            action={
              education.action && (
                <ChamferButton to={education.action.to} corners="tr-bl">
                  {education.action.label}
                </ChamferButton>
              )
            }
          />
          <div className={styles.educationCard}>
            <EducationCard education={education.item} />
          </div>
        </div>

        <div className={styles.projectGroup} data-depth>
          <SectionHeading title={project.heading} />
          <div className={styles.projectCard}>
            <ProjectCard project={project.item} />
          </div>
          {project.action && (
            <div className={styles.projectAction}>
              <ChamferButton to={project.action.to} corners="tl-br">
                {project.action.label}
              </ChamferButton>
            </div>
          )}
        </div>
      </section>

      <section className={styles.right} aria-label="Blog and music" data-reveal="0">
        <div data-depth>
          <SectionHeading
            className={styles.blogHeading}
            title={blog.heading}
            action={
              blog.action && (
                <ChamferButton to={blog.action.to} corners="tl-br">
                  {blog.action.label}
                </ChamferButton>
              )
            }
          />
          <div className={styles.blogCard}>
            <BlogCard post={blog.item} />
          </div>
        </div>

        <div className={styles.trackGroup} data-depth>
          <SectionHeading title={track.heading} align="center" />
          <div className={styles.trackCard}>
            <NowPlayingCard />
          </div>
        </div>
      </section>
    </div>
  );
}
