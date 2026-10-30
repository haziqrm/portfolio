import { Route, Routes, type Location } from 'react-router-dom';
import { Home } from './pages/Home';
import { Projects } from './pages/Projects';
import { Experience } from './pages/Experience';
import { Blog } from './pages/Blog';
import { Contact } from './pages/Contact';
import { NotFound } from './pages/NotFound';

interface AppRoutesProps {
  /** The location to render. Layout passes the page being shown, which lags the URL mid-transition. */
  location: Location;
}

export function AppRoutes({ location }: AppRoutesProps) {
  return (
    <Routes location={location}>
      <Route index element={<Home />} />
      <Route path="projects" element={<Projects />} />
      <Route path="experience" element={<Experience />} />
      <Route path="blog" element={<Blog />} />
      <Route path="contact" element={<Contact />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
