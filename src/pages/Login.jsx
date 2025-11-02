import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

const Login = () => {
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (token) {
      navigate('/dashboard', { replace: true });
      return;
    }

    // Check for error parameters in URL
    const error = searchParams.get('error');
    const message = searchParams.get('message');

    if (error) {
      let errorMessage = 'Authentication failed';
      
      switch(error) {
        case 'access_denied':
          errorMessage = 'You cancelled the Spotify authorization. Please try again to use Moodify-AI.';
          break;
        case 'no_code':
          errorMessage = 'No authorization code received from Spotify. Please try again.';
          break;
        case 'auth_failed':
          // Decode the message if it exists
          if (message) {
            try {
              errorMessage = decodeURIComponent(message);
            } catch (e) {
              errorMessage = 'Authentication failed. Please try again.';
            }
          } else {
            errorMessage = 'Authentication failed. Please try again.';
          }
          break;
        case 'spotify_config_error':
          errorMessage = 'Server configuration error. Please contact support.';
          break;
        default:
          if (message) {
            try {
              errorMessage = decodeURIComponent(message);
            } catch (e) {
              errorMessage = 'An error occurred during login. Please try again.';
            }
          }
      }
      
      toast.error(errorMessage, { duration: 5000 });
      
      // Clear the error from URL without triggering navigation
      window.history.replaceState({}, '', '/login');
    }
  }, [searchParams, token, navigate]);

  const handleLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl) {
      toast.error('API URL not configured. Please check your environment settings.');
      return;
    }
    
    const loginUrl = `${apiUrl}/auth/login`;
    console.log('Redirecting to:', loginUrl);
    window.location.href = loginUrl;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="p-8 bg-white rounded-lg shadow-xl dark:bg-gray-800 text-center max-w-md">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-2">Moodify-AI</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
            Analyze Your Music Mood
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create playlists that match your mood and transfer them across platforms
          </p>
        </div>
        
        <Button onClick={handleLogin} size="lg" className="w-full">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          Login with Spotify
        </Button>
        
        <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
          <p>By logging in, you agree to connect your Spotify account</p>
          <p className="mt-1">to analyze your playlists and create mood-based collections</p>
        </div>
      </div>
    </div>
  );
};

export default Login;