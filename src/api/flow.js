import api from './client';

export const optimizePlaylistFlow = async (tracks, startMood, endMood, algorithm = 'dynamic_programming') => {
  const { data } = await api.post('/flow/optimize', {
    tracks,
    startMood,
    endMood,
    algorithm
  });
  return data;
};

export const applyOptimizedFlow = async (playlistId, trackUris) => {
  const { data } = await api.put(`/flow/apply/${playlistId}`, { trackUris });
  return data;
};