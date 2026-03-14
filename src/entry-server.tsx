import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { HelmetProvider, HelmetServerState } from 'react-helmet-async';
import { Routes, Route } from 'react-router-dom';

// Eager imports — no lazy/Suspense so renderToString works on the server
import LandingPage from './pages/LandingPage';
import TracksPage from './pages/TracksPage';
import TrackDetailPage from './pages/TrackDetailPage';
import LessonPage from './pages/LessonPage';
import DashboardPage from './pages/DashboardPage';

function SSRRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/tracks" element={<TracksPage />} />
      <Route path="/tracks/:trackSlug" element={<TrackDetailPage />} />
      <Route path="/tracks/:trackSlug/:lessonSlug" element={<LessonPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
    </Routes>
  );
}

export function render(url: string) {
  const helmetContext: { helmet?: HelmetServerState } = {};

  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={url}>
        <SSRRoutes />
      </StaticRouter>
    </HelmetProvider>
  );

  const { helmet } = helmetContext;

  // Collect all head tags injected by react-helmet-async
  const headTags = helmet
    ? [
        helmet.title.toString(),
        helmet.meta.toString(),
        helmet.link.toString(),
        helmet.script.toString(),
      ]
        .filter(Boolean)
        .join('\n    ')
    : '';

  return { html, headTags };
}
