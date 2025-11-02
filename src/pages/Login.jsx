import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Login = () => {
  const token = useAuthStore((state) => state.token);

  if (token) {
    return <Navigate to="/dashboard" />;
  }

  const handleLogin = () => {
    // Remove /api from the URL since VITE_API_URL already includes it
    const baseUrl = API_URL.replace('/api', '');
    window.location.href = `${baseUrl}/api/auth/login`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="p-8 bg-white rounded-lg shadow-xl dark:bg-gray-800 text-center">
        <h1 className="text-4xl font-bold mb-2">Moodify-AI</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">Create playlists that match your mood.</p>
        <Button onClick={handleLogin} size="lg">
          Login with Spotify
        </Button>
      </div>
    </div>
  );
};

export default Login;