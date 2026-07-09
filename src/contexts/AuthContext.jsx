import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { getCurrentUser } from '../api/auth';
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

  // initialize auth state on mount
  useEffect(() => {
    console.log('🔐 AuthContext: Initializing...');
    initAuth();
  }, []);

  const initAuth = async () => {
    const storedToken = localStorage.getItem('auth_token');
    
    console.log('🔍 AuthContext: Checking for stored token...');
    console.log('Token exists:', !!storedToken);
    
    if (storedToken) {
      try {
        // decode and validate JWT
        console.log('🔓 AuthContext: Decoding JWT token...');
        const decoded = jwtDecode(storedToken);
        console.log('JWT decoded:', { id: decoded.id, exp: decoded.exp });
        
        // check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
          console.log('⚠️ AuthContext: Token expired');
          handleLogout();
          setLoading(false);
          return;
        }

        console.log('✅ AuthContext: Token is valid');
        
        // token is valid, fetch user profile
        setToken(storedToken);
        console.log('📋 AuthContext: Fetching user profile...');
        
        await fetchUserProfile();
        setIsAuthenticated(true);
        console.log('✅ AuthContext: User authenticated successfully');
        
      } catch (error) {
        console.error('❌ AuthContext: Token validation failed:', error.message);
        handleLogout();
      }
    } else {
      console.log('ℹ️ AuthContext: No token found, user not authenticated');
    }
    
    setLoading(false);
  };

  // fetch user profile from API
  const fetchUserProfile = async () => {
    try {
      console.log('📞 AuthContext: Calling getCurrentUser API...');
      const userData = await getCurrentUser();
      
      console.log('✅ AuthContext: User data received:', {
        id: userData._id,
        name: userData.displayName,
        email: userData.email,
      });
      
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('❌ AuthContext: Failed to fetch user profile:', error.message);
      
      // if API returns 401, token is invalid
      if (error.response?.status === 401) {
        console.log('🚪 AuthContext: Unauthorized, logging out...');
        handleLogout();
      }
      
      throw error;
    }
  };

  // handle login with JWT token
  const handleLogin = async (newToken) => {
    try {
      console.log('🔑 AuthContext: Handling login...');
      console.log('Token received (first 20 chars):', newToken?.substring(0, 20) + '...');
      
      // validate token format
      if (!newToken || typeof newToken !== 'string') {
        throw new Error('Invalid token format');
      }

      // decode and validate token
      console.log('🔓 AuthContext: Decoding JWT...');
      const decoded = jwtDecode(newToken);
      console.log('JWT decoded:', { id: decoded.id, exp: decoded.exp });
      
      if (decoded.exp * 1000 < Date.now()) {
        throw new Error('Token expired');
      }

      console.log('💾 AuthContext: Storing token in localStorage...');
      // store token in localStorage
      localStorage.setItem('auth_token', newToken);
      setToken(newToken);
      
      console.log('📋 AuthContext: Fetching user data...');
      // fetch user data
      const userData = await fetchUserProfile();
      setIsAuthenticated(true);
      
      console.log('✅ AuthContext: Login successful');
      console.log('User logged in:', userData.displayName);
      
      // show success message only once
      toast.success(`Welcome back, ${userData.displayName}!`, { 
        id: 'login-success',
        duration: 3000 
      });
      
      return userData;
    } catch (error) {
      console.error('❌ AuthContext: Login failed:', error.message);
      
      // show error only once
      toast.error('Login failed. Please try again.', { 
        id: 'login-error',
        duration: 4000 
      });
      
      handleLogout();
      throw error;
    }
  };

  // handle logout
  const handleLogout = () => {
    console.log('🚪 AuthContext: Logging out...');
    
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    
    console.log('✅ AuthContext: Logout complete');
    
    // redirect to home
    window.location.href = '/';
  };

  // update user data (without API call)
  const updateUser = (updates) => {
    console.log('🔄 AuthContext: Updating user data:', Object.keys(updates));
    setUser(prev => ({ ...prev, ...updates }));
  };

  // refresh user data from API
  const refreshUser = async () => {
    try {
      console.log('🔄 AuthContext: Refreshing user data...');
      const userData = await fetchUserProfile();
      console.log('✅ AuthContext: User data refreshed');
      return userData;
    } catch (error) {
      console.error('❌ AuthContext: Failed to refresh user:', error.message);
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