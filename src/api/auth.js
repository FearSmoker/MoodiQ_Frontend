import api from './client';

export const getCurrentUser = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};

export const refreshAccessToken = async (refreshToken) => {
  const { data } = await api.post('/auth/refresh', { refreshToken });
  return data;
};