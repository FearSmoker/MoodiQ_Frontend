import api from './client';

/**
 * ============================================
 * USER PREFERENCES
 * ============================================
 */

/**
 * Get user preferences
 * @returns {Promise} User preferences object
 */
export const getPreferences = async () => {
  console.log('⚙️ API: Fetching user preferences...');
  const { data } = await api.get('/user/preferences');
  console.log('✅ API: Preferences received');
  return data;
};

/**
 * Update user preferences
 * @param {object} preferences - Preferences to update
 * @returns {Promise} Updated preferences
 */
export const updatePreferences = async (preferences) => {
  console.log('⚙️ API: Updating user preferences...');
  const { data } = await api.put('/user/preferences', preferences);
  console.log('✅ API: Preferences updated');
  return data;
};

/**
 * ============================================
 * USER STATISTICS
 * ============================================
 */

/**
 * Get user statistics and learning progress
 * @returns {Promise} User stats including ML personalization data
 */
export const getUserStats = async () => {
  console.log('📊 API: Fetching user stats...');
  const { data } = await api.get('/user/stats');
  console.log('✅ API: User stats received');
  return data;
};

/**
 * ============================================
 * ML FEEDBACK & LEARNING
 * ============================================
 */

/**
 * Submit single mood feedback
 * @param {string} trackId - Track ID
 * @param {string} correctMood - Correct mood label
 * @param {string} playlistId - Optional playlist ID
 * @returns {Promise} Feedback response with personalization status
 */
export const submitFeedback = async (trackId, correctMood, playlistId = null) => {
  console.log('💬 API: Submitting mood feedback...');
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
 * @param {array} feedbacks - Array of feedback objects
 * @returns {Promise} Batch feedback response
 */
export const submitBatchFeedback = async (feedbacks) => {
  console.log('💬 API: Submitting batch feedback...');
  const { data } = await api.post('/user/feedback/batch', { feedbacks });
  console.log('✅ API: Batch feedback submitted');
  return data;
};

/**
 * Log user behavior for implicit learning
 * @param {string} trackId - Track ID
 * @param {string} action - Action type (play, skip, repeat, etc.)
 * @param {string} timeOfDay - Time of day (optional)
 * @returns {Promise} Behavior log response
 */
export const logUserBehavior = async (trackId, action, timeOfDay = null) => {
  console.log('📊 API: Logging user behavior...');
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
 * Get user's mood timeline
 * @param {number} days - Number of days (default: 7)
 * @returns {Promise} Mood timeline data
 */
export const getUserMoodTimeline = async (days = 7) => {
  console.log('📈 API: Fetching mood timeline...');
  const { data } = await api.get('/user/mood-timeline', {
    params: { days }
  });
  console.log('✅ API: Mood timeline received');
  return data;
};

/**
 * Get personalized model information
 * @returns {Promise} Personalized model data
 */
export const getUserPersonalizedModel = async () => {
  console.log('🧠 API: Fetching personalized model...');
  const { data } = await api.get('/user/personalized-model');
  console.log('✅ API: Personalized model received');
  return data;
};

/**
 * Trigger personalized model retraining
 * @param {boolean} force - Force retrain even if not enough samples
 * @returns {Promise} Retrain response with status
 */
export const triggerModelRetrain = async (force = false) => {
  console.log('🔄 API: Triggering model retrain...');
  const { data } = await api.post('/user/retrain-model', { force });
  console.log('✅ API: Model retrain triggered');
  return data;
};

/**
 * Reset user personalization
 * @returns {Promise} Reset response
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
 * Handle voice/chat command
 * @param {string} command - Natural language command
 * @param {object} context - Optional context data
 * @returns {Promise} NLP response with action and parameters
 */
export const handleVoiceCommand = async (command, context = {}) => {
  console.log('🗣️ API: Processing voice command...');
  const { data } = await api.post('/user/voice-command', {
    command,
    context
  });
  console.log('✅ API: Voice command processed');
  return data;
};

/**
 * ============================================
 * PLAYLIST SHARING
 * ============================================
 */

/**
 * Share playlist with mood data
 * @param {string} playlistId - Playlist ID
 * @param {object} moodData - Mood analysis data
 * @param {string} playlistName - Playlist name
 * @param {string} playlistImage - Playlist image URL (optional)
 * @returns {Promise} Share response with share ID and URL
 */
export const sharePlaylist = async (playlistId, moodData, playlistName, playlistImage = null) => {
  console.log('🔗 API: Creating share link...');
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
 * Get shared playlist data (public route)
 * @param {string} shareId - Share ID
 * @returns {Promise} Shared playlist data
 */
export const getSharedPlaylist = async (shareId) => {
  console.log('🔗 API: Fetching shared playlist...');
  const { data } = await api.get(`/user/share/${shareId}`);
  console.log('✅ API: Shared playlist received');
  return data;
};

/**
 * Get user's shared playlists
 * @returns {Promise} List of user's shares
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
 * @returns {Promise} Delete response
 */
export const deleteShare = async (shareId) => {
  console.log('🗑️ API: Deleting share...');
  const { data } = await api.delete(`/user/share/${shareId}`);
  console.log('✅ API: Share deleted');
  return data;
};