import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
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

      const refreshToken = useAuthStore.getState().user?.refreshToken;
      
      if (!refreshToken) {
        toast.error('Session expired. Please login again.');
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
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
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle JWT expiry
    if (data?.code === 'JWT_EXPIRED' || data?.code === 'INVALID_TOKEN') {
      toast.error('Session expired. Please login again.');
      useAuthStore.getState().logout();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Handle unauthorized
    if (status === 401 && data?.code === 'NO_TOKEN') {
      toast.error('Please login to continue.');
      useAuthStore.getState().logout();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Handle user not found
    if (data?.code === 'USER_NOT_FOUND') {
      toast.error('User not found. Please login again.');
      useAuthStore.getState().logout();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Generic error handling
    const errorMessage = data?.message || 'An error occurred';
    
    if (status >= 500) {
      toast.error(`Server error: ${errorMessage}`);
    } else if (status === 404) {
      toast.error('Resource not found');
    } else if (status === 400) {
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

export default api;