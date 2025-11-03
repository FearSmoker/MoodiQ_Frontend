import api from './client';

export const analyzeLyrics = async (tracks) => {
  const { data } = await api.post('/lyrics/analyze', { tracks });
  return data;
};

export const getTrackLyrics = async (trackId, trackName, artistName) => {
  const { data } = await api.get(`/lyrics/track/${trackId}`, {
    params: { trackName, artistName }
  });
  return data;
};