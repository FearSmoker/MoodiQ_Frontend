import api from './client';

export const getPreferences = async () => {
  console.log('⚙️ API: Fetching preferences...');
  const { data } = await api.get('/user/preferences');
  console.log('✅ API: Preferences received');
  return data;
};

export const updatePreferences = async (preferences) => {
  console.log('⚙️ API: Updating preferences...');
  const { data } = await api.put('/user/preferences', preferences);
  console.log('✅ API: Preferences updated');
  return data;
};

export const submitFeedback = async (trackId, correctMood, playlistId = null) => {
  console.log(`💬 API: Submitting feedback for ${trackId}...`);
  const { data } = await api.post('/user/feedback', {
    trackId,
    correctMood,
    playlistId
  });
  console.log('✅ API: Feedback submitted');
  return data;
};

export const submitBatchFeedback = async (feedbacks) => {
  console.log(`💬 API: Submitting batch feedback (${feedbacks.length} items)...`);
  const { data } = await api.post('/user/feedback/batch', { feedbacks });
  console.log('✅ API: Batch feedback submitted');
  return data;
};

export const logUserBehavior = async (trackId, action, timeOfDay = null) => {
  console.log(`📊 API: Logging behavior: ${action} for ${trackId}...`);
  const { data } = await api.post('/user/behavior', {
    trackId,
    action,
    timeOfDay
  });
  console.log('✅ API: Behavior logged');
  return data;
};

export const getUserMoodTimeline = async (days = 7) => {
  console.log(`📈 API: Fetching mood timeline (${days} days)...`);
  const { data } = await api.get('/user/mood-timeline', {
    params: { days }
  });
  console.log('✅ API: Mood timeline received');
  return data;
};

export const getUserPersonalizedModel = async () => {
  console.log('🧠 API: Fetching personalized model...');
  const { data } = await api.get('/user/personalized-model');
  console.log('✅ API: Model info received');
  return data;
};

export const triggerModelRetrain = async (force = false) => {
  console.log('🔄 API: Triggering model retraining...');
  const { data } = await api.post('/user/retrain-model', { force });
  console.log('✅ API: Retraining initiated');
  return data;
};

export const resetUserPersonalization = async () => {
  console.log('🗑️ API: Resetting personalization...');
  const { data } = await api.delete('/user/reset-personalization');
  console.log('✅ API: Personalization reset');
  return data;
};

export const handleVoiceCommand = async (command, context = {}) => {
  console.log(`🗣️ API: Processing voice command: "${command}"...`);
  const { data } = await api.post('/user/voice-command', {
    command,
    context
  });
  console.log('✅ API: Voice command processed');
  return data;
};

export const getUserStats = async () => {
  console.log('📊 API: Fetching user stats...');
  const { data } = await api.get('/user/stats');
  console.log('✅ API: User stats received');
  return data;
};

export const sharePlaylist = async (playlistId, moodData, playlistName, playlistImage = null) => {
  console.log(`🔗 API: Sharing playlist ${playlistId}...`);
  const { data } = await api.post('/user/share', {
    playlistId,
    moodData,
    playlistName,
    playlistImage
  });
  console.log('✅ API: Share link created');
  return data;
};

export const getSharedPlaylist = async (shareId) => {
  console.log(`🔗 API: Fetching shared playlist ${shareId}...`);
  const { data } = await api.get(`/user/share/${shareId}`);
  console.log('✅ API: Shared playlist received');
  return data;
};

export const getUserShares = async () => {
  console.log('🔗 API: Fetching user shares...');
  const { data } = await api.get('/user/shares');
  console.log('✅ API: User shares received');
  return data;
};

export const deleteShare = async (shareId) => {
  console.log(`🗑️ API: Deleting share ${shareId}...`);
  const { data } = await api.delete(`/user/share/${shareId}`);
  console.log('✅ API: Share deleted');
  return data;
};