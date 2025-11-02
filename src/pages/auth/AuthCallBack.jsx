import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [status, setStatus] = useState('processing'); // processing, success, error

  useEffect(() => {
    const handleCallback = async () => {
      // Get token from URL
      const token = searchParams.get('token');
      const error = searchParams.get('error');
      const message = searchParams.get('message');

      // Handle errors
      if (error) {
        setStatus('error');
        let errorMessage = 'Authentication failed';
        
        try {
          errorMessage = message ? decodeURIComponent(message) : errorMessage;
        } catch (e) {
          errorMessage = 'Authentication failed. Please try again.';
        }

        toast.error(errorMessage, { duration: 5000 });
        
        // Redirect to home after 3 seconds
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 3000);
        return;
      }

      // Handle missing token
      if (!token) {
        setStatus('error');
        toast.error('No authentication token received');
        
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 3000);
        return;
      }

      // Process successful authentication
      try {
        setStatus('processing');
        await login(token);
        setStatus('success');

        // Check if there's a pre-auth URL to return to
        const preAuthUrl = sessionStorage.getItem('preAuthUrl');
        sessionStorage.removeItem('preAuthUrl');

        // Wait a moment to show success state
        setTimeout(() => {
          navigate(preAuthUrl || '/dashboard', { replace: true });
        }, 1500);
      } catch (error) {
        console.error('Login failed:', error);
        setStatus('error');
        toast.error('Failed to complete authentication');
        
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 3000);
      }
    };

    handleCallback();
  }, [location, navigate, login, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 max-w-md w-full mx-4">
        {/* Processing State */}
        {status === 'processing' && (
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Authenticating...</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we complete your authentication
            </p>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-3 text-green-600 dark:text-green-400">
              Success!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Authentication completed. Redirecting to your dashboard...
            </p>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-3 text-red-600 dark:text-red-400">
              Authentication Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We couldn't complete your authentication. Please try again.
            </p>
            <button
              onClick={() => navigate('/', { replace: true })}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Return to Home
            </button>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mt-8">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-1000 ${
                status === 'processing' ? 'w-2/3' : status === 'success' ? 'w-full' : 'w-1/3'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;