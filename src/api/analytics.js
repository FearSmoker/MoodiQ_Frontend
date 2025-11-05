import api from './client';

/**
 * ============================================
 * ANALYTICS API - Matches analyticsController.js
 * ============================================
 */

/**
 * Get mood trends from recent listening (ML-powered)
 * @param {number} limit - Number of tracks to analyze (default: 50)
 */
export const getMoodTrends = async (limit = 50) => {
  console.log(`📊 API: Fetching mood trends (${limit} tracks)...`);
  const { data } = await api.get('/analytics/mood-trends', {
    params: { limit }
  });
  console.log('✅ API: Mood trends received');
  return data;
};

/**
 * Get listening activity analytics
 */
export const getActivityAnalytics = async () => {
  console.log('📊 API: Fetching activity analytics...');
  const { data } = await api.get('/analytics/activity');
  console.log('✅ API: Activity analytics received');
  return data;
};

/**
 * Get genre analysis
 * @param {string} timeRange - 'short_term', 'medium_term', or 'long_term'
 */
export const getGenreAnalysis = async (timeRange = 'medium_term') => {
  console.log(`🎸 API: Fetching genre analysis (${timeRange})...`);
  const { data } = await api.get('/analytics/genres', {
    params: { timeRange }
  });
  console.log('✅ API: Genre analysis received');
  return data;
};

/**
 * Get user mood timeline (ML-powered)
 * @param {number} days - Number of days (default: 7)
 */
export const getMoodTimeline = async (days = 7) => {
  console.log(`📈 API: Fetching mood timeline (${days} days)...`);
  const { data } = await api.get('/analytics/mood-timeline', {
    params: { days }
  });
  console.log('✅ API: Mood timeline received');
  return data;
};

/**
 * Get real-time current track analysis (HYBRID ML)
 */
export const getRealtimeAnalysis = async () => {
  console.log('⚡ API: Fetching real-time analysis...');
  const { data } = await api.get('/analytics/realtime');
  console.log('✅ API: Real-time analysis received');
  return data;
};

/**
 * ============================================
 * DASHBOARD API - Matches dashboardController.js
 * ============================================
 */

/**
 * Get complete dashboard overview (ML-enhanced)
 * Includes: stats, playlists, top artists/tracks, now playing, ML insights
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
 * Get currently playing track with ML mood analysis
 */
export const getNowPlaying = async () => {
  console.log('🎵 API: Fetching now playing...');
  const { data } = await api.get('/dashboard/now-playing');
  console.log('✅ API: Now playing received');
  return data;
};

/**
 * Get personalized recommendations (ML-powered)
 * @param {number} limit - Number of recommendations (default: 20)
 */
export const getDashboardRecommendations = async (limit = 20) => {
  console.log('💡 API: Fetching personalized recommendations...');
  const { data } = await api.get('/dashboard/recommendations', {
    params: { limit }
  });
  console.log('✅ API: Recommendations received');
  return data;
};

/**
 * ============================================
 * HELPER FUNCTIONS
 * ============================================
 */

/**
 * Get mood color for visualization
 */
export const getMoodColor = (mood) => {
  const moodLower = mood?.toLowerCase() || '';
  
  if (moodLower.includes('happy') || moodLower.includes('joy')) {
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  } else if (moodLower.includes('sad') || moodLower.includes('melancholy')) {
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  } else if (moodLower.includes('energetic') || moodLower.includes('excited')) {
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  } else if (moodLower.includes('calm') || moodLower.includes('relaxed')) {
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  } else if (moodLower.includes('angry') || moodLower.includes('aggressive')) {
    return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
  } else {
    return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
  }
};

/**
 * Format duration from milliseconds to MM:SS
 */
export const formatDuration = (ms) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return Math.round((value / total) * 100);
};