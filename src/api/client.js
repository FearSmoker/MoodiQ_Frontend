import axios from 'axios';
import toast from 'react-hot-toast';

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

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // Handle Spotify token expiry
    if (data?.code === 'SPOTIFY_TOKEN_EXPIRED' && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Get refresh token from local storage or user data
        const userDataStr = localStorage.getItem('auth_user');
        const userData = userDataStr ? JSON.parse(userDataStr) : null;
        const refreshToken = userData?.refreshToken;
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Refresh the Spotify token
        const { data: refreshData } = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          { refreshToken }
        );

        // Token refreshed successfully on backend
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    // Handle JWT expiry
    if (data?.code === 'JWT_EXPIRED' || data?.code === 'INVALID_TOKEN') {
      toast.error('Session expired. Please login again.');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/';
      return Promise.reject(error);
    }

    // Handle unauthorized
    if (status === 401) {
      if (data?.code === 'NO_TOKEN') {
        toast.error('Please login to continue.');
      } else if (data?.code === 'USER_NOT_FOUND') {
        toast.error('User not found. Please login again.');
      }
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/';
      return Promise.reject(error);
    }

    // Handle other errors
    const errorMessage = data?.message || 'An error occurred';
    
    if (status >= 500) {
      toast.error(`Server error: ${errorMessage}`);
    } else if (status === 404) {
      toast.error('Resource not found');
    } else if (status === 400) {
      toast.error(errorMessage);
    } else {
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

export default api;