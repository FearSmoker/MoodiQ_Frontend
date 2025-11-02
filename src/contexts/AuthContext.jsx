import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../lib/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('auth_token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('auth_token');
      
      if (storedToken) {
        try {
          const decoded = jwtDecode(storedToken);
          
          // Check if token is expired
          if (decoded.exp * 1000 < Date.now()) {
            handleLogout();
            return;
          }

          setToken(storedToken);
          await fetchUserProfile();
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Token validation failed:', error);
          handleLogout();
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
      return data;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
      throw error;
    }
  };

  // Handle login with token
  const handleLogin = async (newToken) => {
    try {
      const decoded = jwtDecode(newToken);
      
      if (decoded.exp * 1000 < Date.now()) {
        throw new Error('Token expired');
      }

      localStorage.setItem('auth_token', newToken);
      setToken(newToken);
      
      const userData = await fetchUserProfile();
      setIsAuthenticated(true);
      
      toast.success(`Welcome back, ${userData.displayName}!`);
      return userData;
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Login failed. Please try again.');
      throw error;
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/';
  };

  // Update user data
  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      return await fetchUserProfile();
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
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