import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// layouts
import PublicLayout from './components/layout/PublicLayout';
import PrivateLayout from './components/layout/PrivateLayout';

// public Pages
import Home from './pages/public/Home';
import Features from './pages/public/Features';
import About from './pages/public/About';
import ShareView from './pages/public/ShareView';

// auth Pages
import AuthCallback from './pages/auth/AuthCallBack.jsx';

// private/Protected Pages
import Dashboard from './pages/private/Dashboard';
import Playlists from './pages/private/Playlists';
import MoodAnalyzer from './pages/private/MoodAnalyzer';
import FlowOptimizer from './pages/private/FlowOptimizer';
import MoodGenerator from './pages/private/MoodGenerator';
import PlaylistTransfer from './pages/private/PlaylistTransfer';
import LyricsFusion from './pages/private/LyricsFusion';
import RealtimeAnalytics from './pages/private/RealtimeAnalytics';
import Recommendations from './pages/private/Recommendations';
import Settings from './pages/private/Settings';

// loading Component
const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
);

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/about" element={<About />} />
          <Route path="/share/:shareId" element={<ShareView />} />
        </Route>

        <Route path="/auth/callback" element={<AuthCallback />} />

        <Route 
          element={isAuthenticated ? <PrivateLayout /> : <Navigate to="/" replace />}
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/playlists" element={<Playlists />} />
          <Route path="/mood-analyzer" element={<MoodAnalyzer />} />
          <Route path="/flow-optimizer" element={<FlowOptimizer />} />
          <Route path="/mood-generator" element={<MoodGenerator />} />
          <Route path="/transfer" element={<PlaylistTransfer />} />
          <Route path="/lyrics" element={<LyricsFusion />} />
          <Route path="/realtime" element={<RealtimeAnalytics />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route 
          path="*" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;