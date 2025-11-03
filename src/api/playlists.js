import api from './client';

/**
 * ============================================
 * BASIC PLAYLIST OPERATIONS
 * ============================================
 */

/**
 * Get user's playlists
 * @returns {Promise} List of user playlists
 */
export const getPlaylists = async () => {
  console.log('🎵 API: Fetching playlists...');
  const { data } = await api.get('/playlists');
  console.log('✅ API: Playlists received');
  return data;
};

/**
 * Get specific playlist details
 * @param {string} id - Spotify playlist ID
 * @returns {Promise} Playlist details with tracks
 */
export const getPlaylist = async (id) => {
  console.log(`🎵 API: Fetching playlist ${id}...`);
  const { data } = await api.get(`/playlists/${id}`);
  console.log('✅ API: Playlist received');
  return data;
};

/**
 * Create new playlist on Spotify
 * @param {string} name - Playlist name
 * @param {array} trackUris - Array of track URIs
 * @param {string} description - Playlist description
 * @param {boolean} isPublic - Public/private
 * @returns {Promise} Created playlist info
 */
export const createPlaylist = async (name, trackUris, description, isPublic) => {
  console.log('➕ API: Creating playlist...');
  const { data } = await api.post('/playlists/create', {
    name,
    trackUris,
    description,
    isPublic
  });
  console.log('✅ API: Playlist created');
  return data;
};

/**
 * Reorder playlist tracks
 * @param {string} id - Playlist ID
 * @param {array} trackUris - Reordered track URIs
 * @returns {Promise} Success response
 */
export const reorderPlaylist = async (id, trackUris) => {
  console.log('🔄 API: Reordering playlist...');
  const { data } = await api.put(`/playlists/${id}/reorder`, { trackUris });
  console.log('✅ API: Playlist reordered');
  return data;
};

/**
 * ============================================
 * AUDIO FEATURES
 * ============================================
 */

/**
 * Get audio features for tracks
 * @param {array} trackIds - Array of track IDs
 * @returns {Promise} Audio features data
 */
export const getAudioFeatures = async (trackIds) => {
  console.log('🎼 API: Fetching audio features...');
  const { data } = await api.post('/playlists/features', { trackIds });
  console.log('✅ API: Audio features received');
  return data;
};

/**
 * ============================================
 * ML-POWERED MOOD FEATURES
 * ============================================
 */

/**
 * Analyze playlist mood using ML
 * @param {string} playlistId - Spotify playlist ID
 * @returns {Promise} Mood analysis with distribution
 */
export const getPlaylistMood = async (playlistId) => {
  console.log(`🎭 API: Analyzing playlist ${playlistId}...`);
  const { data } = await api.post('/playlists/mood', { playlistId });
  console.log('✅ API: Playlist analysis complete');
  return data;
};

/**
 * Optimize playlist flow for smooth transitions
 * @param {array} tracks - Array of track objects
 * @param {string} startMood - Starting mood (optional)
 * @param {string} endMood - Ending mood (optional)
 * @param {string} algorithm - Optimization algorithm
 * @returns {Promise} Optimized track order
 */
export const optimizePlaylistFlow = async (tracks, startMood = null, endMood = null, algorithm = 'dynamic_programming') => {
  console.log('⚡ API: Optimizing playlist flow...');
  const { data } = await api.post('/playlists/optimize', {
    tracks,
    startMood,
    endMood,
    algorithm
  });
  console.log('✅ API: Flow optimized');
  return data;
};

/**
 * Detect mood gaps in playlist
 * @param {array} tracks - Array of track objects
 * @param {number} threshold - Gap detection threshold (default: 1.5)
 * @returns {Promise} Detected mood gaps
 */
export const detectMoodGaps = async (tracks, threshold = 1.5) => {
  console.log('🔍 API: Detecting mood gaps...');
  const { data } = await api.post('/playlists/gaps', {
    tracks,
    threshold
  });
  console.log('✅ API: Mood gaps detected');
  return data;
};

/**
 * Fill mood gaps with recommendations
 * @param {array} tracks - Array of track objects
 * @returns {Promise} Gap filling recommendations
 */
export const fillMoodGaps = async (tracks) => {
  console.log('🎵 API: Filling mood gaps...');
  const { data } = await api.post('/playlists/fill-gaps', { tracks });
  console.log('✅ API: Mood gaps filled');
  return data;
};

/**
 * ============================================
 * PLAYLIST GENERATION
 * ============================================
 */

/**
 * Generate mood-based playlist
 * @param {string} targetMood - Target mood
 * @param {number} limit - Number of tracks (default: 20)
 * @param {array} seedTracks - Seed track IDs (optional)
 * @returns {Promise} Generated playlist
 */
export const generateMoodPlaylist = async (targetMood, limit = 20, seedTracks = []) => {
  console.log('🎨 API: Generating mood playlist...');
  const { data } = await api.post('/playlists/generate/mood', {
    targetMood,
    limit,
    seedTracks
  });
  console.log('✅ API: Mood playlist generated');
  return data;
};

/**
 * Generate activity-based playlist
 * @param {string} activity - Activity type (study, workout, party, etc.)
 * @param {number} limit - Number of tracks (default: 20)
 * @returns {Promise} Generated playlist
 */
export const generateActivityPlaylist = async (activity, limit = 20) => {
  console.log('🏃 API: Generating activity playlist...');
  const { data } = await api.post('/playlists/generate/activity', {
    activity,
    limit
  });
  console.log('✅ API: Activity playlist generated');
  return data;
};

/**
 * ============================================
 * RECOMMENDATIONS
 * ============================================
 */

/**
 * Get hybrid ML recommendations
 * @param {object} options - Recommendation options
 * @returns {Promise} Hybrid recommendations
 */
export const getRecommendations = async (options = {}) => {
  const {
    seed_tracks = [],
    seed_genres = [],
    target_valence,
    target_energy,
    limit = 20
  } = options;

  console.log('🎯 API: Getting hybrid recommendations...');
  const { data } = await api.post('/playlists/recommendations', {
    seed_tracks,
    seed_genres,
    target_valence,
    target_energy,
    limit
  });
  console.log('✅ API: Recommendations received');
  return data;
};