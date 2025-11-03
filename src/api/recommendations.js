import api from './client';

export const getMoodBasedRecommendations = async (targetMood, seedTracks, seedGenres, limit = 20, diversity = 0.5) => {
  const { data } = await api.post('/recommendations/mood-based', {
    targetMood,
    seedTracks,
    seedGenres,
    limit,
    diversity
  });
  return data;
};

export const getPersonalizedRecommendations = async (limit = 30, includeNew = true) => {
  const { data } = await api.get('/recommendations/personalized', {
    params: { limit, includeNew }
  });
  return data;
};

export const submitRecommendationFeedback = async (trackId, liked, reason) => {
  const { data } = await api.post('/recommendations/feedback', {
    trackId,
    liked,
    reason
  });
  return data;
};