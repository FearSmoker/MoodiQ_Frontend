import api from './client';

export const getPreferences = async () => {
  const { data } = await api.get('/user/preferences');
  return data;
};

export const updatePreferences = async (preferences) => {
  const { data } = await api.put('/user/preferences', preferences);
  return data;
};

export const sharePlaylist = async (playlistId, moodData, playlistName, playlistImage) => {
  const { data } = await api.post('/user/share', {
    playlistId,
    moodData,
    playlistName,
    playlistImage
  });
  return data;
};

export const getSharedPlaylist = async (shareId) => {
  const { data } = await api.get(`/user/share/${shareId}`);
  return data;
};

export const getUserStats = async () => {
  const { data } = await api.get('/user/stats');
  return data;
};

export const submitFeedback = async (trackId, correctMood, playlistId) => {
  const { data } = await api.post('/user/feedback', {
    trackId,
    correctMood,
    playlistId
  });
  return data;
};