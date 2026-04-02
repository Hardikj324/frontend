import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import Home from './pages/Home';
import Forecast from './pages/Forecast';
import SavedLocations from './pages/SavedLocations';
import AlertsPage from './pages/AlertsPage';
import Settings from './pages/Settings';
import NewsPage from './pages/NewsPage';
import ChatDashboard from './pages/ChatDashboard';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ErrorBoundary from './components/Common/ErrorBoundary';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  const { isAuthenticated } = useAuthStore();
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {!isAuthenticated && (
            <Route element={<AuthLayout />}>
              <Route path="/login"  element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Route>
          )}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/"          element={<Home />} />
            <Route path="/forecast"  element={<Forecast />} />
            <Route path="/locations" element={<SavedLocations />} />
            <Route path="/alerts"    element={<AlertsPage />} />
            <Route path="/settings"  element={<Settings />} />
            <Route path="/news"      element={<NewsPage />} />
            <Route path="/chat"      element={<ChatDashboard />} />
          </Route>
          <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}
export default App;
