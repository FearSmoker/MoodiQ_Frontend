import api from './client';

export const generateMoodPlaylist = async (mood, activity, description, limit = 30) => {
  const { data } = await api.post('/mood-generator/generate', {
    mood,
    activity,
    description,
    limit
  });
  return data;
};

export const saveMoodPlaylist = async (name, trackUris, description, isPublic = true) => {
  const { data } = await api.post('/mood-generator/save', {
    name,
    trackUris,
    description,
    isPublic
  });
  return data;
};