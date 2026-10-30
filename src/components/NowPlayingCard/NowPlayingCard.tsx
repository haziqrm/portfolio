import { useTopTrack } from '../../hooks/useTopTrack';
import styles from './NowPlayingCard.module.css';

export function NowPlayingCard() {
  const track = useTopTrack();

  const content = (
    <>
      <div className={styles.disc}>
        <img
          className={styles.cover}
          src={track.cover.src}
          alt={track.cover.alt}
          width={320}
          height={320}
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className={styles.banner}>
        <p className={styles.title}>{track.title}</p>
        <p className={styles.artist}>{track.artist}</p>
      </div>
    </>
  );

  return track.url ? (
    <a className={styles.card} href={track.url} target="_blank" rel="noreferrer">
      {content}
    </a>
  ) : (
    <div className={styles.card}>{content}</div>
  );
}
