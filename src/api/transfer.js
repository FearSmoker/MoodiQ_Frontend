import api from './client';

export const transferToYouTube = async (playlistName, tracks) => {
  const { data } = await api.post('/transfer/youtube', {
    playlistName,
    tracks
  });
  return data;
};

export const transferToApple = async (playlistName, tracks) => {
  const { data } = await api.post('/transfer/apple', {
    playlistName,
    tracks
  });
  return data;
};

export const getTransferStatus = async () => {
  const { data } = await api.get('/transfer/status');
  return data;
};