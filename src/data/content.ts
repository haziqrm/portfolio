/*
 * All site copy, links and image references. Edit text here, not in components.
 */
import type { HomeContent, SiteContent, Track } from '../types/content';
import portrait from '../assets/images/portrait.jpg';
import edinburghCrest from '../assets/images/edinburgh-crest.png';
import projectCartCard from '../assets/images/project-cart-card.webp';
import blogFavouriteAlbums from '../assets/images/blog-favourite-albums.jpg';
import trackNatoCover from '../assets/images/track-nato-cover.jpg';

export const site: SiteContent = {
  name: 'Haziq Mazuir',
  nav: [
    { label: 'Home', to: '/' },
    { label: 'Projects', to: '/projects' },
    { label: 'Experience', to: '/experience' },
    { label: 'Blog', to: '/blog' },
    { label: 'Contact', to: '/contact' },
  ],
  notFoundLabel: 'Not found',
};

export const home: HomeContent = {
  portrait: {
    src: portrait,
    alt: 'Haziq smiling in a green corduroy puffer jacket, with a snowy hillside town and mountains behind',
  },
  tagline: [
    'Final year Computer Science Student @ The University of Edinburgh',
    'Previous SWE Intern @ NatWest Group',
  ],
  education: {
    heading: 'Currently at',
    action: { label: 'My Journey', to: '/experience' },
    item: {
      institution: 'The University of Edinburgh',
      course: '4th Year BSc (Hons) Computer Science',
      period: '2023 - Present',
      crest: { src: edinburghCrest, alt: 'The University of Edinburgh crest' },
    },
  },
  project: {
    heading: 'What I’ve been working on',
    action: { label: 'More projects', to: '/projects' },
    item: {
      title: 'Featured project',
      image: {
        src: projectCartCard,
        alt: '3D render of an aluminium-frame cart with a touchscreen on an articulated arm',
      },
      to: '/projects',
    },
  },
  blog: {
    heading: 'Recent blog',
    action: { label: 'More blogs', to: '/blog' },
    item: {
      title: 'My Favourite Albums of all time',
      readTimeMinutes: 3,
      cover: { src: blogFavouriteAlbums, alt: 'Cover of Young Thug’s album Jeffery' },
      to: '/blog',
    },
  },
  track: {
    heading: 'Most played track this week',
  },
};

/** Static track used until the Last.fm endpoint exists, and as its fallback afterwards. */
export const topTrackFallback: Track = {
  title: '漂亮男孩',
  artist: 'nato',
  cover: { src: trackNatoCover, alt: 'Cover art for 漂亮男孩 by nato' },
};
