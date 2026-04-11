import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { lazy, Suspense } from 'react';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import LoadingSpinner from './components/Common/LoadingSpinner';
import ErrorBoundary from './components/Common/ErrorBoundary';

// ── Code-split all pages — only load when user navigates to them ──
const Home           = lazy(() => import('./pages/Home'));
const Forecast       = lazy(() => import('./pages/Forecast'));
const SavedLocations = lazy(() => import('./pages/SavedLocations'));
const AlertsPage     = lazy(() => import('./pages/AlertsPage'));
const Settings       = lazy(() => import('./pages/Settings'));
const NewsPage       = lazy(() => import('./pages/NewsPage'));
const ChatDashboard  = lazy(() => import('./pages/ChatDashboard'));
const SkyStories     = lazy(() => import('./pages/SkyStories'));
const RadarPage      = lazy(() => import('./pages/RadarPage'));
const Login          = lazy(() => import('./pages/Auth/Login'));
const Signup         = lazy(() => import('./pages/Auth/Signup'));

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  const { isAuthenticated } = useAuthStore();
  return (
    <ErrorBoundary>
      <Router>
        <Suspense fallback={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#020818' }}>
            <LoadingSpinner />
          </div>
        }>
          <Routes>
            {!isAuthenticated && (
              <Route element={<AuthLayout />}>
                <Route path="/login"  element={<Login />} />
                <Route path="/signup" element={<Signup />} />
              </Route>
            )}
            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route path="/"            element={<Home />} />
              <Route path="/forecast"    element={<Forecast />} />
              <Route path="/locations"   element={<SavedLocations />} />
              <Route path="/alerts"      element={<AlertsPage />} />
              <Route path="/settings"    element={<Settings />} />
              <Route path="/news"        element={<NewsPage />} />
              <Route path="/chat"        element={<ChatDashboard />} />
              <Route path="/skystories"  element={<SkyStories />} />
              <Route path="/radar"       element={<RadarPage />} />
            </Route>
            <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />} />
          </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}
export default App;
