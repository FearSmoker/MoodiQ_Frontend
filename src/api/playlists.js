import api from './client';

export const getPlaylists = async () => {
  const { data } = await api.get('/playlists');
  return data;
};

export const getPlaylist = async (id) => {
  const { data } = await api.get(`/playlists/${id}`);
  return data;
};

export const createPlaylist = async (name, trackUris, description, isPublic) => {
  const { data } = await api.post('/playlists/create', {
    name,
    trackUris,
    description,
    isPublic
  });
  return data;
};

export const reorderPlaylist = async (id, trackUris) => {
  const { data } = await api.put(`/playlists/${id}/reorder`, { trackUris });
  return data;
};

export const getAudioFeatures = async (trackIds) => {
  const { data } = await api.post('/playlists/features', { trackIds });
  return data;
};