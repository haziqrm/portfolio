import { useEffect, useState } from 'react';
import { topTrackFallback } from '../data/content';
import { getTopTrack } from '../services/topTrack';
import type { Track } from '../types/content';

export function useTopTrack(): Track {
  const [track, setTrack] = useState<Track>(topTrackFallback);

  useEffect(() => {
    let cancelled = false;
    getTopTrack()
      .then((next) => {
        if (!cancelled) setTrack(next);
      })
      .catch(() => {
        // Keep the fallback.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return track;
}
