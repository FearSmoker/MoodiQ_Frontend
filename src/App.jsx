import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Callback from './pages/Callback';
import Optimize from './pages/Optimize';
import Share from './pages/Share';

function App() {
  const token = useAuthStore((state) => state.token);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="/share/:shareId" element={<Share />} />
        
        <Route 
          path="/" 
          element={token ? <Layout /> : <Navigate to="/login" />}
        >
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="optimize" element={<Optimize />} />
          {/* Add other protected routes here */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;