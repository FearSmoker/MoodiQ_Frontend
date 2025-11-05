import api from './client';

/**
 * ============================================
 * LYRICS API - Matches lyricsController.js
 * ============================================
 */

/**
 * Get lyrics for a single track
 * @param {string} trackId - Spotify track ID
 * @param {string} trackName - Track name
 * @param {string} artistName - Artist name
 */
export const getTrackLyrics = async (trackId, trackName, artistName) => {
  console.log(`🎤 API: Fetching lyrics for ${trackName} by ${artistName}...`);
  const { data } = await api.get(`/lyrics/track/${trackId}`, {
    params: { trackName, artistName }
  });
  console.log('✅ API: Lyrics received');
  return data;
};

/**
 * Analyze lyrics for multiple tracks
 * @param {Array} tracks - Array of track objects
 */
export const analyzeLyrics = async (tracks) => {
  console.log(`🔍 API: Analyzing lyrics for ${tracks.length} tracks...`);
  const { data } = await api.post('/lyrics/analyze', { tracks });
  console.log('✅ API: Lyrics analysis complete');
  return data;
};

/**
 * Get lyrics with sentiment analysis
 * @param {string} trackName - Track name
 * @param {string} artistName - Artist name
 */
export const getLyricsSentiment = async (trackName, artistName) => {
  console.log(`💭 API: Fetching lyrics sentiment for ${trackName}...`);
  const { data } = await api.post('/lyrics/sentiment', {
    trackName,
    artistName
  });
  console.log('✅ API: Lyrics sentiment received');
  return data;
};

/**
 * Search lyrics
 * @param {string} query - Search query
 * @param {number} limit - Number of results (default: 10)
 */
export const searchLyrics = async (query, limit = 10) => {
  console.log(`🔍 API: Searching lyrics for "${query}"...`);
  const { data } = await api.get('/lyrics/search', {
    params: { query, limit }
  });
  console.log('✅ API: Search results received');
  return data;
};