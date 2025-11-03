import api from './client';

export const getCurrentAnalytics = async () => {
  const { data } = await api.get('/realtime/current');
  return data;
};

export const getListeningHistory = async (limit = 50, timeRange = '24h') => {
  const { data } = await api.get('/realtime/history', {
    params: { limit, timeRange }
  });
  return data;
};