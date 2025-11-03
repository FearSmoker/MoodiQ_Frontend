import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors WITHOUT showing toasts
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors silently
    if (!error.response) {
      console.error('Network error - no response from server');
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // Handle Spotify token expiry
    if (data?.code === 'SPOTIFY_TOKEN_EXPIRED' && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Get user data from localStorage
        const token = localStorage.getItem('auth_token');
        if (!token) {
          throw new Error('No token available');
        }

        // Note: The backend handles refresh automatically
        // Just retry the original request
        return api(originalRequest);
        
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Clear auth data
        localStorage.removeItem('auth_token');
        // Redirect to login
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    // Handle JWT expiry or invalid token
    if (data?.code === 'JWT_EXPIRED' || data?.code === 'INVALID_TOKEN') {
      console.log('Session expired - redirecting to login');
      localStorage.removeItem('auth_token');
      window.location.href = '/';
      return Promise.reject(error);
    }

    // Handle unauthorized (no token)
    if (status === 401 && data?.code === 'NO_TOKEN') {
      console.log('No authentication token - redirecting to login');
      localStorage.removeItem('auth_token');
      window.location.href = '/';
      return Promise.reject(error);
    }

    // Handle user not found
    if (data?.code === 'USER_NOT_FOUND') {
      console.log('User not found - redirecting to login');
      localStorage.removeItem('auth_token');
      window.location.href = '/';
      return Promise.reject(error);
    }

    // For all other errors, just log and reject
    // Components will handle showing appropriate messages
    console.error('API Error:', status, data?.message || error.message);
    
    return Promise.reject(error);
  }
);

export default api;