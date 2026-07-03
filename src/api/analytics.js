import api from './client';

/**
 * ============================================
 * ANALYTICS API - Complete Integration v3.0
 * ============================================
 */

/**
 * Get mood trends from recent listening (12-mood system)
 * @param {number} limit - Number of tracks to analyze
 * @param {number} days - Number of days to analyze
 */
export const getMoodTrends = async (limit = 50, days = 7) => {
  const { data } = await api.get('/analytics/mood-trends', {
    params: { limit, days }
  });
  return data;
};

/**
 * Get mood distribution (12-mood system)
 */
export const getMoodDistribution = async () => {
  const { data } = await api.get('/analytics/mood-distribution');
  return data;
};

/**
 * Get mood patterns (co-occurrence analysis)
 */
export const getMoodPatterns = async () => {
  const { data } = await api.get('/analytics/mood-patterns');
  return data;
};

/**
 * Get listening activity analytics
 */
export const getActivityAnalytics = async () => {
  const { data } = await api.get('/analytics/activity');
  return data;
};

/**
 * Get genre analysis
 * @param {string} timeRange - 'short_term', 'medium_term', or 'long_term'
 */
export const getGenreAnalysis = async (timeRange = 'medium_term') => {
  const { data } = await api.get('/analytics/genres', {
    params: { timeRange }
  });
  return data;
};

/**
 * Get user mood timeline (PRIMARY ENDPOINT FOR GRAPHS)
 * @param {number} days - Number of days (default: 7)
 */
export const getMoodTimeline = async (days = 7) => {
  const { data } = await api.get('/analytics/mood-timeline', {
    params: { days }
  });
  return data;
};

/**
 * Get real-time current track analysis (ENHANCED)
 */
export const getRealtimeAnalysis = async () => {
  const { data } = await api.get('/analytics/realtime');
  return data;
};

/**
 * Get global mood trends
 */
export const getGlobalMoodTrends = async (limit = 100) => {
  const { data } = await api.get('/analytics/global-trends', {
    params: { limit }
  });
  return data;
};

/**
 * Get live session analytics
 * @param {string} userId - User ID
 */
export const getLiveSessionAnalytics = async (userId) => {
  const { data } = await api.get(`/analytics/live-session/${userId}`);
  return data;
};

/**
 * ============================================
 * DASHBOARD API
 * ============================================
 */

/**
 * Get complete dashboard overview (ML-enhanced)
 */
export const getDashboardOverview = async () => {
  const { data } = await api.get('/dashboard/overview');
  return data;
};

/**
 * Get detailed listening statistics
 */
export const getListeningStats = async (timeRange = 'medium_term') => {
  const { data } = await api.get('/dashboard/listening-stats', {
    params: { timeRange }
  });
  return data;
};

/**
 * Get currently playing track with ML mood analysis
 */
export const getNowPlaying = async () => {
  const { data } = await api.get('/dashboard/now-playing');
  return data;
};

/**
 * Get personalized recommendations (ML-powered)
 */
export const getDashboardRecommendations = async (limit = 20) => {
  const { data } = await api.get('/dashboard/recommendations', {
    params: { limit }
  });
  return data;
};

/**
 * ============================================
 * LIVE LISTENING API (NEW)
 * ============================================
 */

/**
 * Start a new live listening session
 */
export const startLiveSession = async () => {
  const { data } = await api.post('/live/session/start');
  return data;
};

/**
 * Add track to live session
 */
export const addTrackToLiveSession = async (sessionId, trackId, trackName, artistName) => {
  const { data } = await api.post('/live/session/add-track', {
    sessionId,
    trackId,
    trackName,
    artistName
  });
  return data;
};

/**
 * Get current live session
 */
export const getCurrentLiveSession = async () => {
  const { data } = await api.get('/live/session/current');
  return data;
};

/**
 * End live session
 */
export const endLiveSession = async (sessionId) => {
  const { data } = await api.post('/live/session/end', { sessionId });
  return data;
};

/**
 * Auto-check session for inactivity
 */
export const autoCheckLiveSession = async () => {
  const { data } = await api.post('/live/session/auto-check');
  return data;
};

/**
 * ============================================
 * HELPER FUNCTIONS
 * ============================================
 */

/**
 * Get mood color for visualization (12-mood system)
 */
export const getMoodColor = (mood) => {
  const moodLower = mood?.toLowerCase() || '';
  
  const moodColors = {
    'joyful': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'excited': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    'party': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    'melancholic': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'dreamy': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'relaxed': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    'chill': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    'focused': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    'romantic': 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
    'motivated': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'angry': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'ambient': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  };

  for (const [key, color] of Object.entries(moodColors)) {
    if (moodLower.includes(key)) {
      return color;
    }
  }
  
  return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
};

/**
 * Format duration from milliseconds to MM:SS
 */
export const formatDuration = (ms) => {
  if (!ms || ms < 0) return '0:00';
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

/**
 * Get 12-mood label with emoji
 */
export const getMoodLabel = (mood) => {
  const moodLabels = {
    'Joyful': '😄 Joyful',
    'Excited': '🤩 Excited',
    'Party': '🎉 Party',
    'Melancholic': '😔 Melancholic',
    'Dreamy': '💭 Dreamy',
    'Relaxed': '😌 Relaxed',
    'Chill': '😎 Chill',
    'Focused': '🎯 Focused',
    'Romantic': '❤️ Romantic',
    'Motivated': '💪 Motivated',
    'Angry': '😠 Angry',
    'Ambient': '🌊 Ambient'
  };
  
  return moodLabels[mood] || mood;
};