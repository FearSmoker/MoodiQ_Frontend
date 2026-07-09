import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const forceLogout = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('moodiq_closed_at');
  window.location.href = '/';
};

let requestCount = 0;

api.interceptors.request.use(
  (config) => {
    requestCount++;
    const reqId = requestCount;
    
    console.log(`📤 API Request #${reqId}:`, config.method?.toUpperCase(), config.url);
    
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`   🔑 Auth token added (first 20 chars): ${token.substring(0, 20)}...`);
    } else {
      console.log('   ⚠️ No auth token available');
    }
    
    config.metadata = { requestId: reqId, startTime: Date.now() };
    
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    const duration = Date.now() - response.config.metadata.startTime;
    console.log(`✅ API Response #${response.config.metadata.requestId}:`, 
      response.status, 
      response.config.url,
      `(${duration}ms)`
    );
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const reqId = originalRequest?.metadata?.requestId;

    console.error(`❌ API Error #${reqId}:`, {
      url: originalRequest?.url,
      status: error.response?.status,
      message: error.message,
      code: error.response?.data?.code
    });

    if (!error.response) {
      console.error('🌐 Network error - no response from server');
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    if (data?.code === 'SPOTIFY_TOKEN_EXPIRED' && !originalRequest._retry) {
      console.log('🔄 Spotify token expired, retrying request...');
      originalRequest._retry = true;
      try {
        return api(originalRequest);
      } catch (refreshError) {
        console.error('❌ Retry after Spotify token expiry failed:', refreshError);
        forceLogout();
        return Promise.reject(refreshError);
      }
    }

    if (data?.code === 'SPOTIFY_TOKEN_REFRESH_FAILED') {
      console.log('🚪 Spotify refresh token expired — forcing logout');
      forceLogout();
      return Promise.reject(error);
    }

    if (data?.code === 'JWT_EXPIRED' || data?.code === 'INVALID_TOKEN') {
      console.log('🚪 JWT expired or invalid — forcing logout');
      forceLogout();
      return Promise.reject(error);
    }

    if (status === 401 && data?.code === 'NO_TOKEN') {
      console.log('🚪 No authentication token — forcing logout');
      forceLogout();
      return Promise.reject(error);
    }

    if (data?.code === 'USER_NOT_FOUND') {
      console.log('🚪 User not found — forcing logout');
      forceLogout();
      return Promise.reject(error);
    }

    console.error('⚠️ API Error Details:', {
      status: status,
      message: data?.message || error.message,
      code: data?.code
    });
    
    return Promise.reject(error);
  }
);

export default api;