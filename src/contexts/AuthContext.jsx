import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import { getCurrentUser } from '../api/auth';
import toast from 'react-hot-toast';

const CLOSURE_TIMEOUT_MS = 10 * 60 * 1000;

const CLOSED_AT_KEY = 'moodiq_closed_at';
const TOKEN_KEY     = 'auth_token';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken]               = useState(null);
  const [user, setUser]                 = useState(null);
  const [loading, setLoading]           = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const isAuthenticatedRef = useRef(false);
  isAuthenticatedRef.current = isAuthenticated;

  const initCalledRef = useRef(false);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isAuthenticatedRef.current) {
        localStorage.setItem(CLOSED_AT_KEY, String(Date.now()));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    if (initCalledRef.current) return;
    initCalledRef.current = true;
    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initAuth = async () => {
    const storedToken = localStorage.getItem(TOKEN_KEY);

    if (!storedToken) {
      setLoading(false);
      return;
    }

    const closedAtStr = localStorage.getItem(CLOSED_AT_KEY);
    if (closedAtStr) {
      const closedAt = parseInt(closedAtStr, 10);
      const elapsed  = Date.now() - closedAt;

      localStorage.removeItem(CLOSED_AT_KEY);

      if (elapsed > CLOSURE_TIMEOUT_MS) {
        clearSession();
        setLoading(false);
        return;
      }
    }

    let decoded;
    try {
      decoded = jwtDecode(storedToken);
    } catch {
      clearSession();
      setLoading(false);
      return;
    }

    if (decoded.exp * 1000 < Date.now()) {
      clearSession();
      setLoading(false);
      return;
    }

    setToken(storedToken);
    setIsAuthenticated(true);
    setLoading(false);

    try {
      await fetchUserProfile();
    } catch (err) {
      const status = err.response?.status;
      if (status === 401 || status === 403 || status === 404) {
        clearSession();
      }
    }
  };

  const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CLOSED_AT_KEY);
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const fetchUserProfile = async () => {
    const userData = await getCurrentUser();
    setUser(userData);
    return userData;
  };

  const handleLogin = async (newToken) => {
    if (!newToken || typeof newToken !== 'string') {
      throw new Error('Invalid token format');
    }

    let decoded;
    try {
      decoded = jwtDecode(newToken);
    } catch {
      throw new Error('Could not decode token');
    }

    if (decoded.exp * 1000 < Date.now()) {
      throw new Error('Token already expired');
    }

    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.removeItem(CLOSED_AT_KEY);
    setToken(newToken);

    try {
      const userData = await fetchUserProfile();
      setIsAuthenticated(true);

      toast.success(`Welcome back, ${userData.displayName}!`, {
        id: 'login-success',
        duration: 3000,
      });

      return userData;
    } catch (err) {
      clearSession();
      toast.error('Login failed. Please try again.', { id: 'login-error', duration: 4000 });
      throw err;
    }
  };

  const handleLogout = () => {
    clearSession();
    window.location.href = '/';
  };

  const updateUser  = (updates) => setUser(prev => ({ ...prev, ...updates }));

  const refreshUser = async () => {
    const userData = await fetchUserProfile();
    return userData;
  };

  const value = {
    token,
    user,
    loading,
    isAuthenticated,
    login: handleLogin,
    logout: handleLogout,
    updateUser,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};