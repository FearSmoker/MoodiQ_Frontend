import { useState, useEffect } from 'react';
import { Sparkles, Music, Zap, ThumbsUp, ThumbsDown, Plus, ExternalLink, Sliders, RefreshCw } from 'lucide-react';
import api from '../../api/client';
import { createPlaylist } from '../../api/playlists';
import { submitFeedback } from '../../api/user';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import toast from 'react-hot-toast';

const MOODS = [
  { label: 'Any', value: null, emoji: '🎵' },
  { label: 'Joyful', value: 'Joyful', emoji: '😄' },
  { label: 'Excited', value: 'Excited', emoji: '🤩' },
  { label: 'Party', value: 'Party', emoji: '🎉' },
  { label: 'Chill', value: 'Chill', emoji: '😎' },
  { label: 'Relaxed', value: 'Relaxed', emoji: '😌' },
  { label: 'Melancholic', value: 'Melancholic', emoji: '😔' },
  { label: 'Focused', value: 'Focused', emoji: '🎯' },
  { label: 'Motivated', value: 'Motivated', emoji: '💪' },
  { label: 'Romantic', value: 'Romantic', emoji: '❤️' },
  { label: 'Dreamy', value: 'Dreamy', emoji: '💭' },
  { label: 'Angry', value: 'Angry', emoji: '😠' },
  { label: 'Ambient', value: 'Ambient', emoji: '🌊' },
];

// Fetch from the new Spotify-native endpoint
const getSpotifyRecommendations = async ({ limit, mood, valence, energy }) => {
  const params = new URLSearchParams({ limit });
  if (mood) params.set('mood', mood);
  if (valence !== null && valence !== undefined) params.set('valence', valence);
  if (energy !== null && energy !== undefined) params.set('energy', energy);
  const { data } = await api.get(`/playlists/recommendations/spotify?${params.toString()}`);
  return data;
};

const Recommendations = () => {
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [meta, setMeta] = useState(null);
  const [selectedTracks, setSelectedTracks] = useState(new Set());
  const [playlistName, setPlaylistName] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Filter options
  const [selectedMood, setSelectedMood] = useState(null);
  const [targetValence, setTargetValence] = useState(null);
  const [targetEnergy, setTargetEnergy] = useState(null);
  const [limit, setLimit] = useState(30);

  useEffect(() => {
    fetchRecommendations();
  }, [selectedMood, targetValence, targetEnergy, limit]);


  const fetchRecommendations = async (opts = {}) => {
    try {
      setLoading(true);
      console.log('🎯 Fetching Spotify-native recommendations...');
      const result = await getSpotifyRecommendations({
        limit: opts.limit ?? limit,
        mood: opts.mood ?? selectedMood,
        valence: opts.valence ?? targetValence,
        energy: opts.energy ?? targetEnergy,
      });
      setRecommendations(result.tracks || []);
      setMeta(result);
      setPlaylistName(`Recommendations - ${new Date().toLocaleDateString()}`);
      console.log(`✅ Loaded ${result.tracks?.length || 0} recommendations`);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      toast.error('Failed to load recommendations. Make sure Spotify is connected.', { id: 'rec-error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshRecommendations = async () => {
    try {
      setLoading(true);
      const result = await getSpotifyRecommendations({ limit, mood: selectedMood, valence: targetValence, energy: targetEnergy });
      setRecommendations(result.tracks || []);
      setMeta(result);
      toast.success('Recommendations updated!', { id: 'refresh-success' });
    } catch (error) {
      console.error('Failed to refresh recommendations:', error);
      toast.error('Failed to refresh recommendations', { id: 'refresh-error' });
    } finally {
      setLoading(false);
    }
  };

  const handleMoodSelect = (moodValue) => {
    setSelectedMood(moodValue);
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

  const handleSelectAll = () => {
    if (selectedTracks.size === recommendations.length) {
      setSelectedTracks(new Set());
    } else {
      setSelectedTracks(new Set(recommendations.map(t => t.id)));
    }
  };

  const handleSavePlaylist = async () => {
    if (selectedTracks.size === 0) {
      toast.error('Please select at least one track', { id: 'save-error' });
      return;
    }

    if (!playlistName.trim()) {
      toast.error('Please enter a playlist name', { id: 'save-error' });
      return;
    }

    setSaving(true);
    try {
      const trackUris = Array.from(selectedTracks).map(id => `spotify:track:${id}`);
      
      const result = await createPlaylist(
        playlistName,
        trackUris,
        `Created by MoodiQ on ${new Date().toLocaleDateString()}`,
        true
      );

      toast.success('Playlist saved to Spotify!', { id: 'save-success' });
      window.open(result.url, '_blank');
      setSelectedTracks(new Set());
    } catch (error) {
      console.error('Failed to save playlist:', error);
      toast.error('Failed to save playlist', { id: 'save-error' });
    } finally {
      setSaving(false);
    }
  };

  const handleFeedback = async (trackId, liked) => {
    try {
      await submitFeedback(trackId, liked ? 'Happy' : 'Sad');
      setFeedbackSubmitted(new Set(feedbackSubmitted).add(trackId));
      toast.success(liked ? 'Thanks for the feedback! 👍' : 'Feedback recorded 👎', { id: 'feedback' });
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
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
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
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Customize Recommendations</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Sliders className="w-4 h-4" />
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>
        </div>

        {/* Mood Chips — always visible */}
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Filter by Mood</p>
          <div className="flex flex-wrap gap-2">
            {MOODS.map(mood => (
              <button
                key={mood.label}
                onClick={() => handleMoodSelect(mood.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedMood === mood.value
                    ? 'bg-indigo-600 text-white shadow-md scale-105'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {mood.emoji} {mood.label}
              </button>
            ))}
          </div>
        </div>

        {showFilters && (
          <>
            {/* Audio Sliders */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-3">
                  Positivity (Valence): {targetValence !== null ? Math.round(targetValence * 100) + '%' : 'Auto'}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={targetValence ?? 0.5}
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
                  Energy Level: {targetEnergy !== null ? Math.round(targetEnergy * 100) + '%' : 'Auto'}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={targetEnergy ?? 0.5}
                  onChange={(e) => setTargetEnergy(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Calm</span>
                  <span>Energetic</span>
                </div>
              </div>
            </div>

            {/* Limit */}
            <div>
              <label className="block text-sm font-medium mb-3">
                Number of Recommendations: {limit}
              </label>
              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10</span>
                <span>50</span>
              </div>
            </div>
          </>
        )}

        <div className="flex items-center gap-4">
          <Button onClick={handleRefreshRecommendations} isLoading={loading}>
            <Zap className="w-5 h-5 mr-2" />
            Get Recommendations
          </Button>
          {meta && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {meta.metadata?.tracksAnalyzed || 0} tracks analyzed • {meta.total || 0} matched
              {meta.dominantMood && ` • Dominant: ${meta.dominantMood}`}
            </span>
          )}
        </div>
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
          <div className="flex gap-2">
            <button
              onClick={handleSelectAll}
              className="text-sm px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {selectedTracks.size === recommendations.length ? 'Deselect All' : 'Select All'}
            </button>
            <button
              onClick={() => setSelectedTracks(new Set())}
              className="text-sm px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            >
              Clear
            </button>
          </div>
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
                    className="w-16 h-16 rounded flex-shrink-0"
                  />
                )}

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{track.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {track.artists?.map(a => a.name).join(', ')}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
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

                {/* External Link */}
                {track.external_urls?.spotify && (
                  <a
                    href={track.external_urls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No recommendations yet</p>
            <p className="text-sm mt-2">Click "Get Fresh Recommendations" to start</p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-bold mb-2">AI-Powered Recommendations</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Recommendations are personalized based on your listening history</li>
              <li>• Use feedback buttons (👍/👎) to improve future recommendations</li>
              <li>• Adjust filters to fine-tune the mood and energy of suggestions</li>
              <li>• Save selected tracks directly to Spotify as a new playlist</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;