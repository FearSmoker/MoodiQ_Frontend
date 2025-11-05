import api from './client';

/**
 * ============================================
 * PLAYLIST OPERATIONS - Matches playlistController.js
 * ============================================
 */

/**
 * Get user's playlists
 */
export const getPlaylists = async () => {
  console.log('🎵 API: Fetching playlists...');
  const { data } = await api.get('/playlists');
  console.log('✅ API: Playlists received');
  
  // CRITICAL: Always return array and deduplicate by ID
  const playlists = data.playlists || data || [];
  
  // Remove duplicates using Map (keeps first occurrence)
  const uniquePlaylists = Array.from(
    new Map(playlists.map(p => [p.id, p])).values()
  );
  
  console.log(`🔍 Deduplication: ${playlists.length} → ${uniquePlaylists.length} playlists`);
  
  return uniquePlaylists;
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
 * ============================================
 * ML-POWERED MOOD FEATURES (HYBRID)
 * ============================================
 */

/**
 * Analyze playlist mood using HYBRID ML approach
 * @param {string} playlistId - Spotify playlist ID
 */
export const getPlaylistMood = async (playlistId) => {
  console.log(`🎭 API: Analyzing playlist ${playlistId}...`);
  const { data } = await api.post('/playlists/mood', { playlistId });
  console.log('✅ API: Playlist mood analysis complete');
  return data;
};

/**
 * Analyze currently playing track (HYBRID ML)
 */
export const getCurrentlyPlayingMood = async () => {
  console.log('🎧 API: Analyzing currently playing track...');
  const { data } = await api.get('/playlists/currently-playing');
  console.log('✅ API: Currently playing analysis complete');
  return data;
};

/**
 * Optimize playlist flow for smooth transitions (ML)
 * @param {Array} tracks - Array of track objects
 * @param {string} startMood - Starting mood (optional)
 * @param {string} endMood - Ending mood (optional)
 * @param {string} algorithm - Optimization algorithm (default: 'dynamic_programming')
 */
export const optimizePlaylistFlow = async (tracks, startMood = null, endMood = null, algorithm = 'dynamic_programming') => {
  console.log(`⚡ API: Optimizing playlist flow (${tracks.length} tracks)...`);
  const { data } = await api.post('/playlists/optimize', {
    tracks,
    startMood,
    endMood,
    algorithm
  });
  console.log('✅ API: Flow optimization complete');
  return data;
};

/**
 * Detect mood gaps in playlist (ML)
 * @param {Array} tracks - Array of track objects
 * @param {number} threshold - Gap detection threshold (default: 1.5)
 */
export const detectMoodGaps = async (tracks, threshold = 1.5) => {
  console.log(`🔍 API: Detecting mood gaps (${tracks.length} tracks)...`);
  const { data } = await api.post('/playlists/gaps', {
    tracks,
    threshold
  });
  console.log('✅ API: Gap detection complete');
  return data;
};

/**
 * Fill mood gaps with recommendations (ML)
 * @param {Array} tracks - Array of track objects
 */
export const fillMoodGaps = async (tracks) => {
  console.log(`🎵 API: Filling mood gaps (${tracks.length} tracks)...`);
  const { data } = await api.post('/playlists/fill-gaps', { tracks });
  console.log('✅ API: Gap filling recommendations received');
  return data;
};

/**
 * ============================================
 * PLAYLIST GENERATION (HYBRID ML)
 * ============================================
 */

/**
 * Generate mood-based playlist (HYBRID)
 * @param {string} targetMood - Target mood
 * @param {string} seedTrackId - Seed track ID (optional)
 * @param {number} limit - Number of tracks (default: 20)
 */
export const generateMoodPlaylist = async (targetMood, seedTrackId = null, limit = 20) => {
  console.log(`🎨 API: Generating ${targetMood} playlist...`);
  const { data } = await api.post('/playlists/generate/mood', {
    targetMood,
    seedTrackId,
    limit
  });
  console.log('✅ API: Mood playlist generated');
  return data;
};

/**
 * Generate activity-based playlist (HYBRID)
 * @param {string} activity - Target activity
 * @param {string} seedTrackId - Seed track ID (optional)
 * @param {number} limit - Number of tracks (default: 20)
 */
export const generateActivityPlaylist = async (activity, seedTrackId = null, limit = 20) => {
  console.log(`🏃 API: Generating ${activity} playlist...`);
  const { data } = await api.post('/playlists/generate/activity', {
    activity,
    seedTrackId,
    limit
  });
  console.log('✅ API: Activity playlist generated');
  return data;
};

/**
 * Generate from user's top tracks (SPOTIFY INTEGRATION)
 * @param {string} targetMood - Target mood (optional)
 * @param {number} limit - Number of tracks (default: 20)
 * @param {string} timeRange - Time range (default: 'medium_term')
 */
export const generateFromTopTracks = async (targetMood = null, limit = 20, timeRange = 'medium_term') => {
  console.log(`🎯 API: Generating from top tracks...`);
  const { data } = await api.post('/playlists/generate/from-top-tracks', {
    targetMood,
    limit,
    timeRange
  });
  console.log('✅ API: Top tracks playlist generated');
  return data;
};

/**
 * Generate from recently played (SPOTIFY INTEGRATION)
 * @param {string} targetMood - Target mood (optional)
 * @param {number} limit - Number of tracks (default: 20)
 */
export const generateFromRecentlyPlayed = async (targetMood = null, limit = 20) => {
  console.log(`⏮️ API: Generating from recently played...`);
  const { data } = await api.post('/playlists/generate/from-recently-played', {
    targetMood,
    limit
  });
  console.log('✅ API: Recently played playlist generated');
  return data;
};

/**
 * ============================================
 * RECOMMENDATIONS (HYBRID ML)
 * ============================================
 */

/**
 * Get personalized recommendations (HYBRID)
 * @param {number} limit - Number of recommendations (default: 20)
 */
export const getRecommendations = async (limit = 20) => {
  console.log(`💡 API: Fetching recommendations (limit: ${limit})...`);
  const { data } = await api.post('/playlists/recommendations', { limit });
  console.log('✅ API: Recommendations received');
  return data;
};

/**
 * ============================================
 * PLAYLIST MANAGEMENT
 * ============================================
 */

/**
 * Create new playlist on Spotify
 * @param {string} name - Playlist name
 * @param {Array} trackUris - Track URIs
 * @param {string} description - Playlist description (optional)
 * @param {boolean} isPublic - Public/private (default: true)
 */
export const createPlaylist = async (name, trackUris, description = '', isPublic = true) => {
  console.log(`➕ API: Creating playlist "${name}"...`);
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
 * @param {string} playlistId - Playlist ID
 * @param {Array} trackUris - Reordered track URIs
 */
export const reorderPlaylist = async (playlistId, trackUris) => {
  console.log(`🔄 API: Reordering playlist ${playlistId}...`);
  const { data } = await api.put(`/playlists/${playlistId}/reorder`, { trackUris });
  console.log('✅ API: Playlist reordered');
  return data;
};

/**
 * ============================================
 * HELPER FUNCTIONS
 * ============================================
 */

/**
 * Format tracks for API
 */
export const formatTracksForAPI = (tracks) => {
  return tracks.map(track => ({
    id: track.id,
    name: track.name,
    artist: track.artists?.[0]?.name || track.artist || 'Unknown',
    artists: track.artists?.map(a => a.name) || [track.artist] || ['Unknown'],
    features: track.features || null,
    mood: track.mood || null
  }));
};

/**
 * Get track URIs from tracks
 */
export const getTrackURIs = (tracks) => {
  return tracks.map(track => {
    if (track.uri) return track.uri;
    if (track.id) return `spotify:track:${track.id}`;
    return null;
  }).filter(Boolean);
};