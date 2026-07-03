import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, ExternalLink, Sparkles, Play, TrendingUp, Share2, Loader2 } from 'lucide-react';
import { getPlaylists, getPlaylist, getPlaylistMood } from '../../api/playlists';
import { sharePlaylist } from '../../api/user';
import { Loader } from '../../components/ui/Loader';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

const Playlists = () => {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [playlistDetails, setPlaylistDetails] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [moodData, setMoodData] = useState(null);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      console.log('🎵 Fetching user playlists...');
      const data = await getPlaylists();
      
      // Remove duplicates by unique ID
      const uniquePlaylists = Array.from(
        new Map(data.map(p => [p.id, p])).values()
      );
      
      setPlaylists(uniquePlaylists);
      console.log(`✅ Loaded ${uniquePlaylists.length} unique playlists`);
    } catch (error) {
      console.error('Failed to fetch playlists:', error);
      toast.error('Failed to load playlists', { id: 'playlist-error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePlaylistClick = async (playlist) => {
    try {
      setSelectedPlaylist(playlist);
      setPlaylistDetails(null);
      setMoodData(null);
      
      console.log('📋 Loading playlist details:', playlist.name);
      const details = await getPlaylist(playlist.id);
      setPlaylistDetails(details);
    } catch (error) {
      console.error('Failed to load playlist details:', error);
      toast.error('Failed to load playlist details', { id: 'details-error' });
    }
  };

  const handleAnalyzeMood = async (playlist) => {
    if (analyzing) return;
    
    try {
      setAnalyzing(true);
      console.log('🎭 Analyzing playlist mood:', playlist.name);
      
      const analysis = await getPlaylistMood(playlist.id);
      setMoodData(analysis);
      
      if (analysis.features_available === false) {
        toast.error(analysis.message || 'Mood analysis is degraded — mood data unavailable for these tracks', { id: 'analyze-degraded' });
      } else {
        toast.success('Playlist analyzed successfully!', { id: 'analyze-success' });
      }
    } catch (error) {
      console.error('Failed to analyze playlist:', error);
      toast.error(error.response?.data?.message || 'Failed to analyze playlist', { id: 'analyze-error' });
    } finally {
      setAnalyzing(false);
    }
  };

  /**
   * Normalise track shape before passing to FlowOptimizer.
   * The backend's normalizeTrackForFlow already does this, but cached
   * responses from before the fix might still arrive in the old shape.
   * This is a cheap O(n) safety pass on the frontend.
   */
  const normalizeTracksForOptimizer = (tracks) => {
    if (!Array.isArray(tracks)) return [];
    return tracks.map(t => {
      // artists: ensure array of {name} objects
      let artists = t.artists;
      if (!Array.isArray(artists) || artists.length === 0) {
        artists = [{ name: t.artist || 'Unknown Artist' }];
      }

      // album: ensure { name, images:[] } shape
      let album = t.album;
      if (typeof album === 'string' || !album) {
        album = {
          name: typeof album === 'string' ? album : '',
          images: Array.isArray(t.images) ? t.images : [],
        };
      } else if (!Array.isArray(album.images)) {
        album = { ...album, images: [] };
      }

      // mood: ensure string
      const mood =
        typeof t.mood === 'string'
          ? t.mood
          : t.moodDetails?.primary_mood || t.primary_mood || 'Unknown';

      // features: prefer explicit features, fall back to moodDetails scores
      const features = t.features || t.moodDetails?.scores || null;

      return { ...t, artists, album, mood, features };
    });
  };

  const handleOptimizeFlow = (playlist, moodAnalysis) => {
    if (!moodAnalysis || !moodAnalysis.tracks || !moodAnalysis.tracks.length) {
      toast.error('Please analyze the playlist first', { id: 'opt-error' });
      return;
    }

    const normalizedTracks = normalizeTracksForOptimizer(moodAnalysis.tracks);

    navigate('/flow-optimizer', {
      state: {
        tracks: normalizedTracks,
        playlistId: playlist.id,
        playlistName: playlist.name,
      }
    });
  };


  const handleShare = async (playlist, moodAnalysis) => {
    if (!moodAnalysis) {
      toast.error('Please analyze the playlist first', { id: 'share-error' });
      return;
    }

    setSharing(true);
    try {
      const result = await sharePlaylist(
        playlist.id,
        moodAnalysis,
        playlist.name,
        playlist.images?.[0]?.url
      );
      
      await navigator.clipboard.writeText(result.fullUrl);
      toast.success('Share link copied to clipboard!', { id: 'share-success' });
    } catch (error) {
      console.error('Failed to share playlist:', error);
      toast.error('Failed to create share link', { id: 'share-error' });
    } finally {
      setSharing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Playlists</h1>
        <p className="text-gray-600 dark:text-gray-400">
          View, analyze, and optimize all your Spotify playlists
        </p>
      </div>

      {playlists.length === 0 ? (
        <div className="text-center py-16">
          <Music className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">No playlists found</p>
          <p className="text-sm text-gray-500">
            Create some playlists on Spotify to get started
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Playlist Grid */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">
                All Playlists ({playlists.length})
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => handlePlaylistClick(playlist)}
                    className={`group relative overflow-hidden rounded-lg transition-all hover:scale-105 ${
                      selectedPlaylist?.id === playlist.id
                        ? 'ring-4 ring-indigo-500'
                        : ''
                    }`}
                  >
                    <div className="aspect-square">
                      {playlist.images?.[0]?.url ? (
                        <img
                          src={playlist.images[0].url}
                          alt={playlist.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                          <Music className="w-12 h-12 text-white opacity-50" />
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-end p-3">
                      <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity w-full">
                        <p className="font-semibold text-sm truncate">{playlist.name}</p>
                        <p className="text-xs">{playlist.tracks?.total || 0} tracks</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Playlist Details Panel */}
          <div className="lg:col-span-1">
            {selectedPlaylist ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4 sticky top-6">
                <div className="flex items-start gap-4">
                  {selectedPlaylist.images?.[0]?.url && (
                    <img
                      src={selectedPlaylist.images[0].url}
                      alt={selectedPlaylist.name}
                      className="w-20 h-20 rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg truncate">{selectedPlaylist.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedPlaylist.tracks?.total || 0} tracks
                    </p>
                    {selectedPlaylist.owner && (
                      <p className="text-xs text-gray-400">
                        by {selectedPlaylist.owner.display_name}
                      </p>
                    )}
                  </div>
                </div>

                {selectedPlaylist.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedPlaylist.description}
                  </p>
                )}

                <div className="space-y-2">
                  <Button
                    onClick={() => handleAnalyzeMood(selectedPlaylist)}
                    isLoading={analyzing}
                    className="w-full justify-center"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {moodData ? 'Re-analyze Mood' : 'Analyze Mood'}
                  </Button>

                  {moodData && moodData.tracks?.length > 0 && (
                    <>
                      {/* Prominent Optimize Flow CTA */}
                      <button
                        onClick={() => handleOptimizeFlow(selectedPlaylist, moodData)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all active:scale-95"
                      >
                        <TrendingUp className="w-4 h-4" />
                        Optimize Flow
                        <svg className="w-4 h-4 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>

                      <Button
                        onClick={() => handleShare(selectedPlaylist, moodData)}
                        isLoading={sharing}
                        variant="secondary"
                        className="w-full justify-center"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </>
                  )}

                  {moodData && !moodData.tracks?.length && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 text-center py-1">
                      ⚠️ No track data returned — try re-analyzing
                    </p>
                  )}

                  <a
                    href={selectedPlaylist.external_urls?.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in Spotify
                  </a>
                </div>

                {/* Mood Analysis Results */}
                {moodData && (
                  <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <h4 className="font-semibold mb-2">Overall Mood</h4>
                      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                          {moodData.overallMood}
                        </p>
                      </div>
                    </div>

                    {moodData.moodDistribution && (
                      <div>
                        <h4 className="font-semibold mb-2">Mood Distribution</h4>
                        <div className="space-y-2">
                          {Object.entries(moodData.moodDistribution)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 5)
                            .map(([mood, count]) => (
                              <div key={mood} className="flex justify-between items-center text-sm">
                                <span>{mood}</span>
                                <span className="font-semibold">{count}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Analyzed {moodData.total_tracks} tracks
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(moodData.analyzedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {/* Playlist Tracks Preview */}
                {playlistDetails && playlistDetails.tracks && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold mb-3">Tracks Preview</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {playlistDetails.tracks.items?.slice(0, 10).map((item, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <span className="text-gray-400 w-6">{index + 1}.</span>
                          <div className="flex-1 min-w-0">
                            <p className="truncate font-medium">{item.track?.name}</p>
                            <p className="truncate text-xs text-gray-500">
                              {item.track?.artists?.map(a => a.name).join(', ')}
                            </p>
                          </div>
                        </div>
                      ))}
                      {playlistDetails.tracks.items?.length > 10 && (
                        <p className="text-xs text-gray-400 text-center pt-2">
                          +{playlistDetails.tracks.items.length - 10} more tracks
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center sticky top-6">
                <Play className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400">
                  Select a playlist to view details
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-bold mb-2">What you can do</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• <strong>Analyze Mood:</strong> Get AI-powered emotional analysis of your playlist</li>
              <li>• <strong>Optimize Flow:</strong> Reorder tracks for smooth mood transitions</li>
              <li>• <strong>Share:</strong> Create shareable links with mood visualizations</li>
              <li>• <strong>View Details:</strong> See all tracks and playlist information</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Playlists;