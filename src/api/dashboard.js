import api from './client';

/**
 * ============================================
 * Dashboard API Functions
 * ============================================
 */

/**
 * Get complete dashboard overview
 * Returns user stats, playlists, top artists, top tracks, recent activity, etc.
 */
export const getDashboardOverview = async () => {
  console.log('📊 API: Fetching dashboard overview...');
  const { data } = await api.get('/dashboard/overview');
  console.log('✅ API: Dashboard overview received');
  return data;
};

/**
 * Get detailed listening statistics
 * @param {string} timeRange - 'short_term', 'medium_term', or 'long_term'
 */
export const getListeningStats = async (timeRange = 'medium_term') => {
  console.log(`📊 API: Fetching listening stats (${timeRange})...`);
  const { data } = await api.get('/dashboard/listening-stats', {
    params: { timeRange }
  });
  console.log('✅ API: Listening stats received');
  return data;
};

/**
 * Get currently playing track with mood analysis
 */
export const getNowPlaying = async () => {
  console.log('🎵 API: Fetching now playing...');
  const { data } = await api.get('/dashboard/now-playing');
  console.log('✅ API: Now playing received');
  return data;
};

/**
 * Get personalized recommendations
 * @param {number} limit - Number of recommendations (default: 20)
 * @param {string} seedType - 'tracks' or 'artists'
 */
export const getDashboardRecommendations = async (limit = 20, seedType = 'tracks') => {
  console.log('💡 API: Fetching recommendations...');
  const { data } = await api.get('/dashboard/recommendations', {
    params: { limit, seedType }
  });
  console.log('✅ API: Recommendations received');
  return data;
};

/**
 * Get mood trends from recent listening
 * @param {number} limit - Number of recent tracks to analyze (default: 50)
 */
export const getMoodTrends = async (limit = 50) => {
  console.log('🎭 API: Fetching mood trends...');
  const { data } = await api.get('/dashboard/mood-trends', {
    params: { limit }
  });
  console.log('✅ API: Mood trends received');
  return data;
};

/**
 * ============================================
 * Analytics API Functions
 * ============================================
 */

/**
 * Get listening activity analytics
 */
export const getActivityAnalytics = async () => {
  console.log('📈 API: Fetching activity analytics...');
  const { data } = await api.get('/analytics/activity');
  console.log('✅ API: Activity analytics received');
  return data;
};

/**
 * Get genre analysis
 * @param {string} timeRange - 'short_term', 'medium_term', or 'long_term'
 */
export const getGenreAnalysis = async (timeRange = 'medium_term') => {
  console.log('🎸 API: Fetching genre analysis...');
  const { data } = await api.get('/analytics/genres', {
    params: { timeRange }
  });
  console.log('✅ API: Genre analysis received');
  return data;
};

/**
 * ============================================
 * Real-time Analytics Functions
 * ============================================
 */

/**
 * Get real-time listening analytics for current track
 */
export const getCurrentAnalytics = async () => {
  console.log('⚡ API: Fetching current analytics...');
  const { data } = await api.get('/realtime/current');
  console.log('✅ API: Current analytics received');
  return data;
};

/**
 * Get listening history with mood timeline
 * @param {number} limit - Number of tracks (default: 50)
 * @param {string} timeRange - Time range filter (default: '24h')
 */
export const getListeningHistory = async (limit = 50, timeRange = '24h') => {
  console.log('📜 API: Fetching listening history...');
  const { data } = await api.get('/realtime/history', {
    params: { limit, timeRange }
  });
  console.log('✅ API: Listening history received');
  return data;
};

/**
 * ============================================
 * Playlist API Functions
 * ============================================
 */

/**
 * Get user's playlists
 */
export const getPlaylists = async () => {
  console.log('🎵 API: Fetching playlists...');
  const { data } = await api.get('/playlists');
  console.log('✅ API: Playlists received');
  return data;
};

/**
 * Get specific playlist details
 * @param {string} playlistId - Spotify playlist ID
 */
export const getPlaylist = async (playlistId) => {
  console.log(`🎵 API: Fetching playlist ${playlistId}...`);
  const { data } = await api.get(`/playlists/${playlistId}`);
  console.log('✅ API: Playlist received');
  return data;
};

/**
 * Analyze playlist mood
 * @param {string} playlistId - Spotify playlist ID
 */
export const analyzePlaylistMood = async (playlistId) => {
  console.log(`🎭 API: Analyzing playlist ${playlistId}...`);
  const { data } = await api.post('/playlists/mood', { playlistId });
  console.log('✅ API: Playlist analysis complete');
  return data;
};

/**
 * Create new playlist
 * @param {string} name - Playlist name
 * @param {string} description - Playlist description
 * @param {array} trackUris - Array of Spotify track URIs
 * @param {boolean} isPublic - Whether playlist is public
 */
export const createPlaylist = async (name, description = '', trackUris = [], isPublic = true) => {
  console.log('➕ API: Creating playlist...');
  const { data } = await api.post('/playlists/create', {
    name,
    description,
    trackUris,
    isPublic
  });
  console.log('✅ API: Playlist created');
  return data;
};

/**
 * ============================================
 * Mood Generator Functions
 * ============================================
 */

/**
 * Generate mood-based playlist
 * @param {string} mood - Target mood
 * @param {string} activity - Target activity
 * @param {string} description - Custom description
 * @param {number} limit - Number of tracks
 */
export const generateMoodPlaylist = async (mood, activity, description, limit = 30) => {
  console.log('🎨 API: Generating mood playlist...');
  const { data } = await api.post('/mood-generator/generate', {
    mood,
    activity,
    description,
    limit
  });
  console.log('✅ API: Mood playlist generated');
  return data;
};

/**
 * Save generated playlist to Spotify
 * @param {string} name - Playlist name
 * @param {array} trackUris - Track URIs
 * @param {string} description - Playlist description
 * @param {boolean} isPublic - Public/private
 */
export const saveMoodPlaylist = async (name, trackUris, description, isPublic = true) => {
  console.log('💾 API: Saving mood playlist...');
  const { data } = await api.post('/mood-generator/save', {
    name,
    trackUris,
    description,
    isPublic
  });
  console.log('✅ API: Mood playlist saved');
  return data;
};

/**
 * ============================================
 * Flow Optimizer Functions
 * ============================================
 */

/**
 * Optimize playlist flow
 * @param {array} tracks - Array of track objects
 * @param {string} startMood - Starting mood (optional)
 * @param {string} endMood - Ending mood (optional)
 * @param {string} algorithm - Optimization algorithm
 */
export const optimizePlaylistFlow = async (tracks, startMood = null, endMood = null, algorithm = 'dynamic_programming') => {
  console.log('⚡ API: Optimizing playlist flow...');
  const { data } = await api.post('/flow/optimize', {
    tracks,
    startMood,
    endMood,
    algorithm
  });
  console.log('✅ API: Flow optimized');
  return data;
};

/**
 * Apply optimized order to Spotify playlist
 * @param {string} playlistId - Spotify playlist ID
 * @param {array} trackUris - Reordered track URIs
 */
export const applyOptimizedFlow = async (playlistId, trackUris) => {
  console.log('💾 API: Applying optimized flow...');
  const { data } = await api.put(`/flow/apply/${playlistId}`, { trackUris });
  console.log('✅ API: Flow applied');
  return data;
};

/**
 * ============================================
 * Recommendations Functions
 * ============================================
 */

/**
 * Get mood-based recommendations
 * @param {string} targetMood - Target mood
 * @param {array} seedTracks - Seed track IDs
 * @param {array} seedGenres - Seed genres
 * @param {number} limit - Number of recommendations
 * @param {number} diversity - Diversity factor (0-1)
 */
export const getMoodBasedRecommendations = async (targetMood, seedTracks = [], seedGenres = [], limit = 20, diversity = 0.5) => {
  console.log('🎯 API: Getting mood-based recommendations...');
  const { data } = await api.post('/recommendations/mood-based', {
    targetMood,
    seedTracks,
    seedGenres,
    limit,
    diversity
  });
  console.log('✅ API: Mood recommendations received');
  return data;
};

/**
 * Get personalized recommendations using ML
 * @param {number} limit - Number of recommendations
 * @param {boolean} includeNew - Include new artists
 */
export const getPersonalizedRecommendations = async (limit = 30, includeNew = true) => {
  console.log('🤖 API: Getting personalized recommendations...');
  const { data } = await api.get('/recommendations/personalized', {
    params: { limit, includeNew }
  });
  console.log('✅ API: Personalized recommendations received');
  return data;
};

/**
 * Submit recommendation feedback
 * @param {string} trackId - Track ID
 * @param {boolean} liked - Whether user liked it
 * @param {string} reason - Optional feedback reason
 */
export const submitRecommendationFeedback = async (trackId, liked, reason = null) => {
  console.log('💬 API: Submitting recommendation feedback...');
  const { data } = await api.post('/recommendations/feedback', {
    trackId,
    liked,
    reason
  });
  console.log('✅ API: Feedback submitted');
  return data;
};

/**
 * ============================================
 * Lyrics Functions (PLACEHOLDER)
 * ============================================
 */

/**
 * Analyze lyrics for tracks
 * @param {array} tracks - Array of track objects
 */
export const analyzeLyrics = async (tracks) => {
  console.log('📝 API: Analyzing lyrics...');
  const { data } = await api.post('/lyrics/analyze', { tracks });
  console.log('✅ API: Lyrics analyzed');
  return data;
};

/**
 * Get lyrics for a single track
 * @param {string} trackId - Spotify track ID
 * @param {string} trackName - Track name
 * @param {string} artistName - Artist name
 */
export const getTrackLyrics = async (trackId, trackName, artistName) => {
  console.log('📝 API: Fetching track lyrics...');
  const { data } = await api.get(`/lyrics/track/${trackId}`, {
    params: { trackName, artistName }
  });
  console.log('✅ API: Lyrics received');
  return data;
};

/**
 * ============================================
 * User Functions
 * ============================================
 */

/**
 * Get user preferences
 */
export const getUserPreferences = async () => {
  console.log('⚙️ API: Fetching user preferences...');
  const { data } = await api.get('/user/preferences');
  console.log('✅ API: Preferences received');
  return data;
};

/**
 * Update user preferences
 * @param {object} preferences - Preferences object
 */
export const updateUserPreferences = async (preferences) => {
  console.log('⚙️ API: Updating user preferences...');
  const { data } = await api.put('/user/preferences', preferences);
  console.log('✅ API: Preferences updated');
  return data;
};

/**
 * Submit mood feedback
 * @param {string} trackId - Track ID
 * @param {string} correctMood - Correct mood
 * @param {string} playlistId - Optional playlist ID
 */
export const submitMoodFeedback = async (trackId, correctMood, playlistId = null) => {
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
 * Get user statistics
 */
export const getUserStats = async () => {
  console.log('📊 API: Fetching user stats...');
  const { data } = await api.get('/user/stats');
  console.log('✅ API: User stats received');
  return data;
};

/**
 * Share playlist
 * @param {string} playlistId - Playlist ID
 * @param {object} moodData - Mood analysis data
 * @param {string} playlistName - Playlist name
 * @param {string} playlistImage - Playlist image URL
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
 * Get shared playlist
 * @param {string} shareId - Share ID
 */
export const getSharedPlaylist = async (shareId) => {
  console.log('🔗 API: Fetching shared playlist...');
  const { data } = await api.get(`/user/share/${shareId}`);
  console.log('✅ API: Shared playlist received');
  return data;
};

/**
 * ============================================
 * Transfer Functions
 * ============================================
 */

/**
 * Transfer playlist to YouTube Music
 * @param {string} playlistName - Playlist name
 * @param {array} tracks - Array of track objects
 */
export const transferToYouTube = async (playlistName, tracks) => {
  console.log('🎥 API: Transferring to YouTube...');
  const { data } = await api.post('/transfer/youtube', {
    playlistName,
    tracks
  });
  console.log('✅ API: Transfer complete');
  return data;
};

/**
 * Transfer playlist to Apple Music
 * @param {string} playlistName - Playlist name
 * @param {array} tracks - Array of track objects
 */
export const transferToApple = async (playlistName, tracks) => {
  console.log('🍎 API: Transferring to Apple Music...');
  const { data } = await api.post('/transfer/apple', {
    playlistName,
    tracks
  });
  console.log('✅ API: Transfer complete');
  return data;
};

/**
 * Get transfer status
 */
export const getTransferStatus = async () => {
  console.log('📊 API: Fetching transfer status...');
  const { data } = await api.get('/transfer/status');
  console.log('✅ API: Transfer status received');
  return data;
};