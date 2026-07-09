import api from './client';

export const getPlaylists = async () => {
  console.log('🎵 API: Fetching playlists...');
  const { data } = await api.get('/playlists');
  console.log('✅ API: Playlists received');
  
  // cRITICAL: Always return array and deduplicate by ID
  const playlists = data.playlists || data || [];
  
  // remove duplicates using Map (keeps first occurrence)
  const uniquePlaylists = Array.from(
    new Map(playlists.map(p => [p.id, p])).values()
  );
  
  console.log(`🔍 Deduplication: ${playlists.length} → ${uniquePlaylists.length} playlists`);
  
  return uniquePlaylists;
};

export const getPlaylist = async (playlistId) => {
  console.log(`🎵 API: Fetching playlist ${playlistId}...`);
  const { data } = await api.get(`/playlists/${playlistId}`);
  console.log('✅ API: Playlist received');
  return data;
};

export const getPlaylistMood = async (playlistId) => {
  console.log(`🎭 API: Analyzing playlist ${playlistId}...`);
  const { data } = await api.post('/playlists/mood', { playlistId });
  console.log('✅ API: Playlist mood analysis complete');
  return data;
};

export const getCurrentlyPlayingMood = async () => {
  console.log('🎧 API: Analyzing currently playing track...');
  const { data } = await api.get('/playlists/currently-playing');
  console.log('✅ API: Currently playing analysis complete');
  return data;
};

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

export const detectMoodGaps = async (tracks, threshold = 1.5) => {
  console.log(`🔍 API: Detecting mood gaps (${tracks.length} tracks)...`);
  const { data } = await api.post('/playlists/gaps', {
    tracks,
    threshold
  });
  console.log('✅ API: Gap detection complete');
  return data;
};

export const fillMoodGaps = async (tracks) => {
  console.log(`🎵 API: Filling mood gaps (${tracks.length} tracks)...`);
  const { data } = await api.post('/playlists/fill-gaps', { tracks });
  console.log('✅ API: Gap filling recommendations received');
  return data;
};

export const fillGapsWithSpotify = async (tracks, threshold = 0.3) => {
  console.log(`🎸 API: Smart gap fill with Spotify catalog (${tracks.length} tracks)...`);
  const { data } = await api.post('/playlists/fill-gaps-smart', { tracks, threshold });
  console.log('✅ API: Smart gap fill complete');
  return data;
};

export const optimizeAndEnrichFlow = async (tracks, startMood, endMood) => {
  console.log(`🤖 API: Optimize+Enrich (${tracks.length} tracks, ${startMood}→${endMood})...`);
  const { data } = await api.post('/playlists/optimize-enrich', { tracks, startMood, endMood });
  console.log(`✅ API: Optimize+Enrich done — mode=${data.mode}`);
  return data;
};

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

export const generateFromRecentlyPlayed = async (targetMood = null, limit = 20) => {
  console.log(`⏮️ API: Generating from recently played...`);
  const { data } = await api.post('/playlists/generate/from-recently-played', {
    targetMood,
    limit
  });
  console.log('✅ API: Recently played playlist generated');
  return data;
};

export const getRecommendations = async (limit = 20) => {
  console.log(`💡 API: Fetching recommendations (limit: ${limit})...`);
  const { data } = await api.post('/playlists/recommendations', { limit });
  console.log('✅ API: Recommendations received');
  return data;
};

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

export const reorderPlaylist = async (playlistId, trackUris) => {
  console.log(`🔄 API: Reordering playlist ${playlistId}...`);
  const { data } = await api.put(`/playlists/${playlistId}/reorder`, { trackUris });
  console.log('✅ API: Playlist reordered');
  return data;
};

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

export const getTrackURIs = (tracks) => {
  return tracks.map(track => {
    if (track.uri) return track.uri;
    if (track.id) return `spotify:track:${track.id}`;
    return null;
  }).filter(Boolean);
};