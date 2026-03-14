import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';

const LandingPage = lazy(() => import('@/pages/LandingPage'));
const TracksPage = lazy(() => import('@/pages/TracksPage'));
const TrackDetailPage = lazy(() => import('@/pages/TrackDetailPage'));
const LessonPage = lazy(() => import('@/pages/LessonPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const DonatePage = lazy(() => import('@/pages/DonatePage'));
const NetworkStatsPage = lazy(() => import('@/pages/NetworkStatsPage'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 rounded-full border-2 border-btc-orange border-t-transparent animate-spin" />
    </div>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/tracks" element={<TracksPage />} />
        <Route path="/tracks/:trackSlug" element={<TrackDetailPage />} />
        <Route path="/tracks/:trackSlug/:lessonSlug" element={<LessonPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/donate" element={<DonatePage />} />
        <Route path="/network" element={<NetworkStatsPage />} />
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-background text-center px-4">
            <div className="space-y-4">
              <div className="text-6xl font-black text-btc-orange">404</div>
              <h1 className="text-2xl font-bold text-foreground">Page not found</h1>
              <p className="text-muted-foreground">This block doesn't exist on the chain.</p>
              <a href="/" className="inline-block mt-4 px-6 py-2 bg-btc-orange text-black font-bold rounded-lg hover:bg-btc-orange-dim transition-colors">
                Back to Home
              </a>
            </div>
          </div>
        } />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
