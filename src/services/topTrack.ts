import { topTrackFallback } from '../data/content';
import type { Track } from '../types/content';

/**
 * Most-played track this week.
 *
 * Static for now. To go live: add a Vercel function at api/top-track.ts that calls Last.fm
 * `user.gettoptracks` (period=7day, limit=1) with LASTFM_API_KEY / LASTFM_USER env vars and
 * maps the result to `Track`. Then replace this body with fetch('/api/top-track'), falling
 * back to `topTrackFallback` on error. Components don't need to change.
 */
export async function getTopTrack(): Promise<Track> {
  return topTrackFallback;
}
