import api from './client';

export const analyzePlaylistMood = async (playlistId) => {
  const { data } = await api.post('/playlists/mood', { playlistId });
  return data;
};

export const optimizeFlow = async (tracks, startMood, endMood) => {
  const { data } = await api.post('/playlists/optimize', {
    tracks,
    startMood,
    endMood,
    algorithm: 'dynamic_programming'
  });
  return data;
};

export const getRecommendations = async (params) => {
  const { data } = await api.post('/playlists/recommendations', params);
  return data;
};