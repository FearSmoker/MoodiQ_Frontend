import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Loader } from '../components/ui/Loader';

const Callback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      setToken(token);
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [location, navigate, setToken]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader />
      <p className="ml-4">Authenticating...</p>
    </div>
  );
};

export default Callback;