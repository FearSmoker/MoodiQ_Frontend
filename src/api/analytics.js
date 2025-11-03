import api from './client';

/**
 * ============================================
 * ANALYTICS ENDPOINTS (/api/analytics)
 * ============================================
 */

/**
 * Get real-time mood trends from recent listening
 * @param {number} limit - Number of recent tracks to analyze (default: 50)
 * @returns {Promise} Mood trends data with distribution and overall mood
 */
export const getMoodTrends = async (limit = 50) => {
  console.log('🎭 API: Fetching mood trends...');
  const { data } = await api.get('/analytics/mood-trends', {
    params: { limit }
  });
  console.log('✅ API: Mood trends received');
  return data;
};

/**
 * Get listening activity analytics (hourly/daily patterns)
 * @returns {Promise} Activity analytics with peak times
 */
export const getActivityAnalytics = async () => {
  console.log('📈 API: Fetching activity analytics...');
  const { data } = await api.get('/analytics/activity');
  console.log('✅ API: Activity analytics received');
  return data;
};

/**
 * Get genre analysis
 * @param {string} timeRange - 'short_term', 'medium_term', or 'long_term'
 * @returns {Promise} Genre distribution and categories
 */
export const getGenreAnalysis = async (timeRange = 'medium_term') => {
  console.log('🎸 API: Fetching genre analysis...');
  const { data } = await api.get('/analytics/genres', {
    params: { timeRange }
  });
  console.log('✅ API: Genre analysis received');
  return data;
};

/**
 * Get user's mood timeline (ML-powered)
 * @param {number} days - Number of days to analyze (default: 7)
 * @returns {Promise} Mood timeline with data points
 */
export const getMoodTimeline = async (days = 7) => {
  console.log('📊 API: Fetching mood timeline...');
  const { data } = await api.get('/analytics/mood-timeline', {
    params: { days }
  });
  console.log('✅ API: Mood timeline received');
  return data;
};

/**
 * Get real-time analysis of currently playing track
 * @returns {Promise} Real-time track analysis with mood
 */
export const getRealtimeAnalysis = async () => {
  console.log('⚡ API: Fetching real-time analysis...');
  const { data } = await api.get('/analytics/realtime');
  console.log('✅ API: Real-time analysis received');
  return data;
};

/**
 * ============================================
 * DASHBOARD ENDPOINTS (/api/dashboard)
 * ============================================
 */

/**
 * Get comprehensive dashboard overview
 * @returns {Promise} Complete dashboard data with stats, playlists, top items, etc.
 */
export const getDashboardOverview = async () => {
  console.log('📊 API: Fetching dashboard overview...');
  const { data } = await api.get('/dashboard/overview');
  console.log('✅ API: Dashboard overview received');
  return data;
};

/**
 * Get detailed listening statistics
 * @param {string} timeRange - 'short_term', 'medium_term', or 'long_term'
 * @returns {Promise} Detailed listening stats with audio features
 */
export const getListeningStats = async (timeRange = 'medium_term') => {
  console.log(`📊 API: Fetching listening stats (${timeRange})...`);
  const { data } = await api.get('/dashboard/listening-stats', {
    params: { timeRange }
  });
  console.log('✅ API: Listening stats received');
  return data;
};

/**
 * Get currently playing track with mood analysis
 * @returns {Promise} Now playing data with mood and device info
 */
export const getNowPlaying = async () => {
  console.log('🎵 API: Fetching now playing...');
  const { data } = await api.get('/dashboard/now-playing');
  console.log('✅ API: Now playing received');
  return data;
};

/**
 * Get personalized recommendations
 * @param {number} limit - Number of recommendations (default: 20)
 * @param {string} seedType - 'tracks' or 'artists'
 * @returns {Promise} Personalized recommendations with seeds
 */
export const getDashboardRecommendations = async (limit = 20, seedType = 'tracks') => {
  console.log('💡 API: Fetching dashboard recommendations...');
  const { data } = await api.get('/dashboard/recommendations', {
    params: { limit, seedType }
  });
  console.log('✅ API: Recommendations received');
  return data;
};