import api from './client';

/**
 * ============================================
 * LYRICS ENDPOINTS (/api/lyrics)
 * ============================================
 */

/**
 * Get lyrics for a single track
 * @param {string} trackId - Spotify track ID
 * @param {string} trackName - Track name
 * @param {string} artistName - Artist name
 * @returns {Promise} Lyrics data with sentiment and source
 */
export const getTrackLyrics = async (trackId, trackName, artistName) => {
  console.log('🎤 API: Fetching track lyrics...');
  const { data } = await api.get(`/lyrics/track/${trackId}`, {
    params: { trackName, artistName }
  });
  console.log('✅ API: Lyrics received');
  return data;
};

/**
 * Analyze lyrics for multiple tracks
 * @param {array} tracks - Array of track objects with name and artist
 * @returns {Promise} Lyrics analysis with sentiment scores, themes, and keywords
 */
export const analyzeLyrics = async (tracks) => {
  console.log('🔍 API: Analyzing lyrics...');
  const { data } = await api.post('/lyrics/analyze', { tracks });
  console.log('✅ API: Lyrics analyzed');
  return data;
};

/**
 * Get lyrics with sentiment analysis
 * @param {string} trackName - Track name
 * @param {string} artistName - Artist name
 * @returns {Promise} Lyrics with sentiment, mood, and language data
 */
export const getLyricsSentiment = async (trackName, artistName) => {
  console.log('💭 API: Getting lyrics sentiment...');
  const { data } = await api.post('/lyrics/sentiment', {
    trackName,
    artistName
  });
  console.log('✅ API: Lyrics sentiment received');
  return data;
};

/**
 * Search lyrics by query
 * @param {string} query - Search query
 * @param {number} limit - Number of results (default: 10)
 * @returns {Promise} Search results with lyrics matches
 */
export const searchLyrics = async (query, limit = 10) => {
  console.log('🔎 API: Searching lyrics...');
  const { data } = await api.get('/lyrics/search', {
    params: { query, limit }
  });
  console.log('✅ API: Lyrics search results received');
  return data;
};