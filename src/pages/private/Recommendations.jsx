import { useState, useEffect } from 'react';
import { Sparkles, Music, Zap, ThumbsUp, ThumbsDown, Plus } from 'lucide-react';
import { getRecommendations, createPlaylist } from '../../api/playlists';
import { getDashboardRecommendations } from '../../api/analytics';
import { submitFeedback } from '../../api/user';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import toast from 'react-hot-toast';

const Recommendations = () => {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [dashboardRecs, setDashboardRecs] = useState([]);
  const [selectedTracks, setSelectedTracks] = useState(new Set());
  const [playlistName, setPlaylistName] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(new Set());

  // Filter options
  const [targetValence, setTargetValence] = useState(0.5);
  const [targetEnergy, setTargetEnergy] = useState(0.5);
  const [seedGenres, setSeedGenres] = useState([]);

  const availableGenres = [
    'pop', 'rock', 'hip-hop', 'electronic', 'indie', 
    'jazz', 'classical', 'r-n-b', 'country', 'metal'
  ];

  useEffect(() => {
    fetchInitialRecommendations();
  }, []);

  const fetchInitialRecommendations = async () => {
    try {
      setLoading(true);
      const [hybridRecs, dashRecs] = await Promise.all([
        getRecommendations({
          target_valence: 0.5,
          target_energy: 0.5,
          limit: 30
        }).catch(() => ({ tracks: [] })),
        getDashboardRecommendations(20, 'tracks').catch(() => ({ recommendations: [] }))
      ]);

      setRecommendations(hybridRecs.tracks || []);
      setDashboardRecs(dashRecs.recommendations || []);
      setPlaylistName(`Recommendations - ${new Date().toLocaleDateString()}`);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshRecommendations = async () => {
    try {
      setLoading(true);
      console.log('🎯 Fetching custom recommendations...');
      
      const result = await getRecommendations({
        seed_genres: seedGenres.length > 0 ? seedGenres : undefined,
        target_valence: targetValence,
        target_energy: targetEnergy,
        limit: 30
      });

      setRecommendations(result.tracks || []);
      toast.success('Recommendations updated!');
    } catch (error) {
      console.error('Failed to refresh recommendations:', error);
      toast.error('Failed to refresh recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackSelect = (trackId) => {
    const newSelected = new Set(selectedTracks);
    if (newSelected.has(trackId)) {
      newSelected.delete(trackId);
    } else {
      newSelected.add(trackId);
    }
    setSelectedTracks(newSelected);
  };

  const handleGenreToggle = (genre) => {
    const newGenres = seedGenres.includes(genre)
      ? seedGenres.filter(g => g !== genre)
      : [...seedGenres, genre].slice(0, 5); // Max 5 genres
    setSeedGenres(newGenres);
  };

  const handleSavePlaylist = async () => {
    if (selectedTracks.size === 0) {
      toast.error('Please select at least one track');
      return;
    }

    if (!playlistName.trim()) {
      toast.error('Please enter a playlist name');
      return;
    }

    setSaving(true);
    try {
      const trackUris = Array.from(selectedTracks).map(id => `spotify:track:${id}`);
      
      const result = await createPlaylist(
        playlistName,
        trackUris,
        `Created by MoodiQ-AI on ${new Date().toLocaleDateString()}`,
        true
      );

      toast.success('Playlist saved to Spotify!');
      window.open(result.url, '_blank');
      setSelectedTracks(new Set());
    } catch (error) {
      console.error('Failed to save playlist:', error);
      toast.error('Failed to save playlist');
    } finally {
      setSaving(false);
    }
  };

  const handleFeedback = async (trackId, liked) => {
    try {
      await submitFeedback(trackId, liked ? 'liked' : 'disliked');
      setFeedbackSubmitted(new Set(feedbackSubmitted).add(trackId));
      toast.success(liked ? 'Thanks for the feedback! 👍' : 'Feedback recorded 👎');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  if (loading && recommendations.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-purple-600" />
          Recommendations
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover new music curated for your taste
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
        <h2 className="text-xl font-bold mb-4">Customize Recommendations</h2>
        
        {/* Mood Sliders */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-3">
              Positivity (Valence): {Math.round(targetValence * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={targetValence}
              onChange={(e) => setTargetValence(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Sad</span>
              <span>Happy</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">
              Energy Level: {Math.round(targetEnergy * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={targetEnergy}
              onChange={(e) => setTargetEnergy(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Calm</span>
              <span>Energetic</span>
            </div>
          </div>
        </div>

        {/* Genre Selection */}
        <div>
          <label className="block text-sm font-medium mb-3">
            Seed Genres (Select up to 5)
          </label>
          <div className="flex flex-wrap gap-2">
            {availableGenres.map((genre) => (
              <button
                key={genre}
                onClick={() => handleGenreToggle(genre)}
                disabled={seedGenres.length >= 5 && !seedGenres.includes(genre)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  seedGenres.includes(genre)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={handleRefreshRecommendations} isLoading={loading}>
          <Zap className="w-5 h-5 mr-2" />
          Get Fresh Recommendations
        </Button>
      </div>

      {/* Selected Tracks Summary */}
      {selectedTracks.size > 0 && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold mb-1">
                {selectedTracks.size} Track{selectedTracks.size !== 1 ? 's' : ''} Selected
              </h3>
              <p className="text-white/80">Ready to create your playlist</p>
            </div>
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <input
                type="text"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                className="px-4 py-2 rounded-lg text-gray-900"
                placeholder="Enter playlist name"
              />
              <Button 
                onClick={handleSavePlaylist}
                isLoading={saving}
                variant="secondary"
              >
                <Plus className="w-5 h-5 mr-2" />
                Save to Spotify
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            Personalized for You ({recommendations.length} tracks)
          </h2>
          <button
            onClick={() => setSelectedTracks(new Set())}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            Clear Selection
          </button>
        </div>

        {recommendations.length > 0 ? (
          <div className="space-y-2">
            {recommendations.map((track) => (
              <div
                key={track.id}
                className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                  selectedTracks.has(track.id)
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 ring-2 ring-indigo-500'
                    : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {/* Selection Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedTracks.has(track.id)}
                  onChange={() => handleTrackSelect(track.id)}
                  className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />

                {/* Album Art */}
                {track.album?.images?.[0]?.url && (
                  <img
                    src={track.album.images[0].url}
                    alt={track.album.name}
                    className="w-16 h-16 rounded"
                  />
                )}

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{track.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {track.artists?.map(a => a.name).join(', ')}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {track.album?.name}
                  </p>
                </div>

                {/* Popularity */}
                {track.popularity && (
                  <div className="hidden md:flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                        style={{ width: `${track.popularity}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-8">{track.popularity}</span>
                  </div>
                )}

                {/* Feedback Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleFeedback(track.id, true)}
                    disabled={feedbackSubmitted.has(track.id)}
                    className="p-2 rounded-lg bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 transition-colors disabled:opacity-50"
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleFeedback(track.id, false)}
                    disabled={feedbackSubmitted.has(track.id)}
                    className="p-2 rounded-lg bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 transition-colors disabled:opacity-50"
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Preview */}
                {track.preview_url && (
                  <a
                    href={track.preview_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
                  >
                    Preview
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No recommendations yet</p>
            <p className="text-sm mt-2">Adjust your preferences and get recommendations</p>
          </div>
        )}
      </div>

      {/* Dashboard Recommendations */}
      {dashboardRecs.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Based on Your Top Tracks</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {dashboardRecs.slice(0, 10).map((track) => (
              <div
                key={track.id}
                className="group relative overflow-hidden rounded-lg hover:scale-105 transition-transform cursor-pointer"
                onClick={() => handleTrackSelect(track.id)}
              >
                {track.album?.images?.[0]?.url && (
                  <img
                    src={track.album.images[0].url}
                    alt={track.name}
                    className="w-full aspect-square object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all flex items-center justify-center">
                  <div className="text-white text-center px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="font-semibold text-sm truncate">{track.name}</p>
                    <p className="text-xs truncate">
                      {track.artists?.map(a => a.name).join(', ')}
                    </p>
                  </div>
                </div>
                {selectedTracks.has(track.id) && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Recommendations;