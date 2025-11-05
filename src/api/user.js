import api from './client';

/**
 * ============================================
 * USER PREFERENCES - Matches userController.js
 * ============================================
 */

/**
 * Get user preferences
 */
export const getPreferences = async () => {
  console.log('⚙️ API: Fetching preferences...');
  const { data } = await api.get('/user/preferences');
  console.log('✅ API: Preferences received');
  return data;
};

/**
 * Update user preferences
 * @param {Object} preferences - Preferences object
 */
export const updatePreferences = async (preferences) => {
  console.log('⚙️ API: Updating preferences...');
  const { data } = await api.put('/user/preferences', preferences);
  console.log('✅ API: Preferences updated');
  return data;
};

/**
 * ============================================
 * ML FEEDBACK & LEARNING
 * ============================================
 */

/**
 * Submit mood feedback for ML learning
 * @param {string} trackId - Track ID
 * @param {string} correctMood - Correct mood
 * @param {string} playlistId - Playlist ID (optional)
 */
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

/**
 * Submit batch feedback
 * @param {Array} feedbacks - Array of feedback objects
 */
export const submitBatchFeedback = async (feedbacks) => {
  console.log(`💬 API: Submitting batch feedback (${feedbacks.length} items)...`);
  const { data } = await api.post('/user/feedback/batch', { feedbacks });
  console.log('✅ API: Batch feedback submitted');
  return data;
};

/**
 * Log user behavior for implicit learning
 * @param {string} trackId - Track ID
 * @param {string} action - Action type (play, skip, like, etc.)
 * @param {string} timeOfDay - Time of day (optional)
 */
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

/**
 * ============================================
 * PERSONALIZATION & MODEL TRAINING
 * ============================================
 */

/**
 * Get user's mood timeline (ML)
 * @param {number} days - Number of days (default: 7)
 */
export const getUserMoodTimeline = async (days = 7) => {
  console.log(`📈 API: Fetching mood timeline (${days} days)...`);
  const { data } = await api.get('/user/mood-timeline', {
    params: { days }
  });
  console.log('✅ API: Mood timeline received');
  return data;
};

/**
 * Get user's personalized model info
 */
export const getUserPersonalizedModel = async () => {
  console.log('🧠 API: Fetching personalized model...');
  const { data } = await api.get('/user/personalized-model');
  console.log('✅ API: Model info received');
  return data;
};

/**
 * Trigger model retraining
 * @param {boolean} force - Force retrain even if not enough data (default: false)
 */
export const triggerModelRetrain = async (force = false) => {
  console.log('🔄 API: Triggering model retraining...');
  const { data } = await api.post('/user/retrain-model', { force });
  console.log('✅ API: Retraining initiated');
  return data;
};

/**
 * Reset user personalization
 */
export const resetUserPersonalization = async () => {
  console.log('🗑️ API: Resetting personalization...');
  const { data } = await api.delete('/user/reset-personalization');
  console.log('✅ API: Personalization reset');
  return data;
};

/**
 * ============================================
 * VOICE/NLP COMMANDS
 * ============================================
 */

/**
 * Process NLP voice command
 * @param {string} command - Voice command text
 * @param {Object} context - Context object (optional)
 */
export const handleVoiceCommand = async (command, context = {}) => {
  console.log(`🗣️ API: Processing voice command: "${command}"...`);
  const { data } = await api.post('/user/voice-command', {
    command,
    context
  });
  console.log('✅ API: Voice command processed');
  return data;
};

/**
 * ============================================
 * USER STATISTICS
 * ============================================
 */

/**
 * Get user statistics
 */
export const getUserStats = async () => {
  console.log('📊 API: Fetching user stats...');
  const { data } = await api.get('/user/stats');
  console.log('✅ API: User stats received');
  return data;
};

/**
 * ============================================
 * PLAYLIST SHARING
 * ============================================
 */

/**
 * Share a playlist
 * @param {string} playlistId - Playlist ID
 * @param {Object} moodData - Mood analysis data
 * @param {string} playlistName - Playlist name
 * @param {string} playlistImage - Playlist image URL (optional)
 */
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

/**
 * Get shared playlist data
 * @param {string} shareId - Share ID
 */
export const getSharedPlaylist = async (shareId) => {
  console.log(`🔗 API: Fetching shared playlist ${shareId}...`);
  const { data } = await api.get(`/user/share/${shareId}`);
  console.log('✅ API: Shared playlist received');
  return data;
};

/**
 * Get user's shared playlists
 */
export const getUserShares = async () => {
  console.log('🔗 API: Fetching user shares...');
  const { data } = await api.get('/user/shares');
  console.log('✅ API: User shares received');
  return data;
};

/**
 * Delete a shared playlist
 * @param {string} shareId - Share ID
 */
export const deleteShare = async (shareId) => {
  console.log(`🗑️ API: Deleting share ${shareId}...`);
  const { data } = await api.delete(`/user/share/${shareId}`);
  console.log('✅ API: Share deleted');
  return data;
};