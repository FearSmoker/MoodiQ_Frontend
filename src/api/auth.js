import api from './client';

/**
 * Get current user details
 * Returns complete user object with preferences and linked services
 */
export const getCurrentUser = async () => {
  try {
    console.log('📋 API: Fetching current user...');
    const { data } = await api.get('/auth/me');
    console.log('✅ API: User data received:', data.displayName);
    return data;
  } catch (error) {
    console.error('❌ API: Failed to get current user:', error.message);
    throw error;
  }
};

/**
 * Refresh Spotify access token
 * Used when Spotify token expires
 */
export const refreshAccessToken = async (refreshToken) => {
  try {
    console.log('🔄 API: Refreshing access token...');
    const { data } = await api.post('/auth/refresh', { refreshToken });
    console.log('✅ API: Token refreshed successfully');
    return data;
  } catch (error) {
    console.error('❌ API: Failed to refresh token:', error.message);
    throw error;
  }
};