export interface ImageRef {
  src: string;
  alt: string;
}

export interface LinkRef {
  label: string;
  to: string;
}

export interface Education {
  institution: string;
  course: string;
  period: string;
  crest: ImageRef;
}

export interface Project {
  title: string;
  image: ImageRef;
  to: string;
}

export interface BlogPost {
  title: string;
  readTimeMinutes: number;
  cover: ImageRef;
  to: string;
}

/** Shape a Last.fm-backed /api/top-track endpoint should return. */
export interface Track {
  title: string;
  artist: string;
  cover: ImageRef;
  /** Optional external link (Last.fm, Spotify…). The card only becomes a link when set. */
  url?: string;
}

export interface HomeSection<T> {
  heading: string;
  action?: LinkRef;
  item: T;
}

export interface SiteContent {
  name: string;
  nav: LinkRef[];
}

export interface HomeContent {
  portrait: ImageRef;
  tagline: string[];
  education: HomeSection<Education>;
  project: HomeSection<Project>;
  blog: HomeSection<BlogPost>;
  track: { heading: string };
}
