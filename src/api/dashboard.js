import api from './client';

/**
 * Dashboard API Functions
 */

// Get complete dashboard overview
export const getDashboardOverview = async () => {
  const { data } = await api.get('/dashboard/overview');
  return data;
};

// Get detailed listening statistics
export const getListeningStats = async (timeRange = 'medium_term') => {
  const { data } = await api.get('/dashboard/listening-stats', {
    params: { timeRange }
  });
  return data;
};

// Get currently playing track
export const getNowPlaying = async () => {
  const { data } = await api.get('/dashboard/now-playing');
  return data;
};

// Get personalized recommendations
export const getDashboardRecommendations = async () => {
  const { data } = await api.get('/dashboard/recommendations');
  return data;
};

/**
 * Analytics API Functions
 */

// Get mood trends from recent listening
export const getMoodTrends = async (limit = 50) => {
  const { data } = await api.get('/analytics/mood-trends', {
    params: { limit }
  });
  return data;
};

// Get listening activity analytics
export const getActivityAnalytics = async () => {
  const { data } = await api.get('/analytics/activity');
  return data;
};

// Get genre analysis
export const getGenreAnalysis = async (timeRange = 'medium_term') => {
  const { data } = await api.get('/analytics/genres', {
    params: { timeRange }
  });
  return data;
};