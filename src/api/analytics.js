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
  console.log(`📊 API: Fetching mood trends (${limit} tracks, ${days} days)...`);
  const { data } = await api.get('/analytics/mood-trends', {
    params: { limit, days }
  });
  console.log('✅ API: Mood trends received');
  return data;
};

/**
 * Get mood distribution (12-mood system)
 */
export const getMoodDistribution = async () => {
  console.log('📊 API: Fetching mood distribution...');
  const { data } = await api.get('/analytics/mood-distribution');
  console.log('✅ API: Mood distribution received');
  return data;
};

/**
 * Get mood patterns (co-occurrence analysis)
 */
export const getMoodPatterns = async () => {
  console.log('🔍 API: Fetching mood patterns...');
  const { data } = await api.get('/analytics/mood-patterns');
  console.log('✅ API: Mood patterns received');
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
 * Get user mood timeline (PRIMARY ENDPOINT FOR GRAPHS)
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
 * Get real-time current track analysis (ENHANCED)
 */
export const getRealtimeAnalysis = async () => {
  console.log('⚡ API: Fetching real-time analysis...');
  const { data } = await api.get('/analytics/realtime');
  console.log('✅ API: Real-time analysis received');
  return data;
};

/**
 * Get global mood trends
 */
export const getGlobalMoodTrends = async (limit = 100) => {
  console.log('🌍 API: Fetching global mood trends...');
  const { data } = await api.get('/analytics/global-trends', {
    params: { limit }
  });
  console.log('✅ API: Global trends received');
  return data;
};

/**
 * Get live session analytics
 * @param {string} userId - User ID
 */
export const getLiveSessionAnalytics = async (userId) => {
  console.log(`🎧 API: Fetching live session for ${userId}...`);
  const { data } = await api.get(`/analytics/live-session/${userId}`);
  console.log('✅ API: Live session received');
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
  console.log('📊 API: Fetching dashboard overview...');
  const { data } = await api.get('/dashboard/overview');
  console.log('✅ API: Dashboard overview received');
  return data;
};

/**
 * Get detailed listening statistics
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
 * LIVE LISTENING API (NEW)
 * ============================================
 */

/**
 * Start a new live listening session
 */
export const startLiveSession = async () => {
  console.log('🎧 API: Starting live session...');
  const { data } = await api.post('/live/session/start');
  console.log('✅ API: Live session started');
  return data;
};

/**
 * Add track to live session
 */
export const addTrackToLiveSession = async (sessionId, trackId, trackName, artistName) => {
  console.log(`➕ API: Adding track to session...`);
  const { data } = await api.post('/live/session/add-track', {
    sessionId,
    trackId,
    trackName,
    artistName
  });
  console.log('✅ API: Track added to session');
  return data;
};

/**
 * Get current live session
 */
export const getCurrentLiveSession = async () => {
  console.log('📊 API: Fetching current live session...');
  const { data } = await api.get('/live/session/current');
  console.log('✅ API: Current session received');
  return data;
};

/**
 * End live session
 */
export const endLiveSession = async (sessionId) => {
  console.log('🛑 API: Ending live session...');
  const { data } = await api.post('/live/session/end', { sessionId });
  console.log('✅ API: Session ended');
  return data;
};

/**
 * Auto-check session for inactivity
 */
export const autoCheckLiveSession = async () => {
  console.log('⏰ API: Auto-checking session...');
  const { data } = await api.post('/live/session/auto-check');
  console.log('✅ API: Session checked');
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