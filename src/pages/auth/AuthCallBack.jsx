import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get token from URL
        const token = searchParams.get('token');

        if (!token) {
          setStatus('error');
          setError('No authentication token received');
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        console.log('🔐 Processing authentication...');
        setStatus('processing');

        // Login with token (stores in localStorage and fetches user)
        await login(token);

        console.log('✅ Authentication successful');
        setStatus('success');

        // Wait a moment then redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1000);

      } catch (error) {
        console.error('❌ Authentication failed:', error);
        setStatus('error');
        setError(error.message || 'Authentication failed');
        
        // Redirect to home after showing error
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 max-w-md w-full mx-4">
        
        {/* Processing State */}
        {status === 'processing' && (
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Completing Sign In...</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we set up your account
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
              Welcome to MoodiQ-AI!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Redirecting to your dashboard...
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
              {error || 'Something went wrong. Please try again.'}
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