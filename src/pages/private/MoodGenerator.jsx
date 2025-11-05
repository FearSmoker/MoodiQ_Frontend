import { useState } from 'react';
import { Wand2, Plus, Music, Zap, Sparkles, Loader2, ExternalLink } from 'lucide-react';
import { 
  generateMoodPlaylist, 
  generateActivityPlaylist,
  generateFromTopTracks,
  generateFromRecentlyPlayed,
  createPlaylist 
} from '../../api/playlists';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

const MoodGenerator = () => {
  const [activeTab, setActiveTab] = useState('mood'); // 'mood', 'activity', 'smart'
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [smartMode, setSmartMode] = useState('top-tracks'); // 'top-tracks', 'recent'
  const [targetMood, setTargetMood] = useState('Happy');
  const [timeRange, setTimeRange] = useState('medium_term');
  const [generating, setGenerating] = useState(false);
  const [generatedTracks, setGeneratedTracks] = useState(null);
  const [playlistName, setPlaylistName] = useState('');
  const [saving, setSaving] = useState(false);

  const moods = [
    { name: 'Happy', emoji: '😄', color: 'from-yellow-400 to-orange-500', targetMood: 'Happy' },
    { name: 'Calm', emoji: '😌', color: 'from-blue-400 to-cyan-500', targetMood: 'Calm' },
    { name: 'Sad', emoji: '😢', color: 'from-gray-400 to-blue-500', targetMood: 'Sad' },
    { name: 'Energetic', emoji: '⚡', color: 'from-red-400 to-pink-500', targetMood: 'Energetic' },
    { name: 'Romantic', emoji: '❤️', color: 'from-pink-400 to-rose-500', targetMood: 'Romantic' },
    { name: 'Focused', emoji: '🎯', color: 'from-purple-400 to-indigo-500', targetMood: 'Focus' },
  ];

  const activities = [
    { name: 'Study', emoji: '📚', activity: 'study', color: 'from-blue-500 to-indigo-500' },
    { name: 'Workout', emoji: '💪', activity: 'workout', color: 'from-red-500 to-orange-500' },
    { name: 'Party', emoji: '🎉', activity: 'party', color: 'from-purple-500 to-pink-500' },
    { name: 'Sleep', emoji: '😴', activity: 'sleep', color: 'from-indigo-500 to-purple-500' },
    { name: 'Work', emoji: '💼', activity: 'work', color: 'from-gray-500 to-blue-500' },
    { name: 'Meditation', emoji: '🧘', activity: 'meditation', color: 'from-green-500 to-teal-500' },
  ];

  const handleGenerateMood = async (mood) => {
    setSelectedMood(mood);
    setGenerating(true);
    setGeneratedTracks(null);

    try {
      console.log('🎨 Generating mood playlist:', mood.name);
      const result = await generateMoodPlaylist(mood.targetMood, null, 30);
      setGeneratedTracks(result);
      setPlaylistName(`${mood.name} Vibes - ${new Date().toLocaleDateString()}`);
      toast.success(`Generated ${result.total || result.tracks?.length || 0} tracks!`, { id: 'gen-success' });
    } catch (error) {
      console.error('Failed to generate mood playlist:', error);
      toast.error(error.response?.data?.message || 'Failed to generate playlist', { id: 'gen-error' });
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateActivity = async (activity) => {
    setSelectedActivity(activity);
    setGenerating(true);
    setGeneratedTracks(null);

    try {
      console.log('🏃 Generating activity playlist:', activity.name);
      const result = await generateActivityPlaylist(activity.activity, null, 30);
      setGeneratedTracks(result);
      setPlaylistName(`${activity.name} Mix - ${new Date().toLocaleDateString()}`);
      toast.success(`Generated ${result.total || result.tracks?.length || 0} tracks!`, { id: 'gen-success' });
    } catch (error) {
      console.error('Failed to generate activity playlist:', error);
      toast.error(error.response?.data?.message || 'Failed to generate playlist', { id: 'gen-error' });
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateSmart = async () => {
    setGenerating(true);
    setGeneratedTracks(null);

    try {
      console.log('🎯 Generating smart playlist:', smartMode);
      
      let result;
      if (smartMode === 'top-tracks') {
        result = await generateFromTopTracks(targetMood, 30, timeRange);
        setPlaylistName(`Top Tracks Mix - ${new Date().toLocaleDateString()}`);
      } else {
        result = await generateFromRecentlyPlayed(targetMood, 30);
        setPlaylistName(`Recently Played Mix - ${new Date().toLocaleDateString()}`);
      }
      
      setGeneratedTracks(result);
      toast.success(`Generated ${result.total || result.tracks?.length || 0} tracks!`, { id: 'gen-success' });
    } catch (error) {
      console.error('Failed to generate smart playlist:', error);
      toast.error(error.response?.data?.message || 'Failed to generate playlist', { id: 'gen-error' });
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveToSpotify = async () => {
    if (!generatedTracks || !playlistName) {
      toast.error('Please generate a playlist first', { id: 'save-error' });
      return;
    }

    setSaving(true);
    try {
      const tracks = generatedTracks.tracks || [];
      const trackUris = tracks.map(t => `spotify:track:${t.id}`);
      
      const result = await createPlaylist(
        playlistName,
        trackUris,
        `Generated by MoodiQ-AI on ${new Date().toLocaleDateString()}`,
        true
      );

      toast.success('Playlist saved to Spotify!', { id: 'save-success' });
      window.open(result.url, '_blank');
    } catch (error) {
      console.error('Failed to save playlist:', error);
      toast.error('Failed to save playlist to Spotify', { id: 'save-error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Wand2 className="w-8 h-8 text-purple-600" />
          Mood Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create personalized playlists based on your mood, activity, or listening history
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('mood')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'mood'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            🎭 By Mood
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'activity'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            🏃 By Activity
          </button>
          <button
            onClick={() => setActiveTab('smart')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'smart'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            ✨ Smart Mix
          </button>
        </div>
      </div>

      {/* Mood Selection */}
      {activeTab === 'mood' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            Choose Your Mood
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {moods.map((mood, index) => (
              <button
                key={index}
                onClick={() => handleGenerateMood(mood)}
                disabled={generating}
                className={`bg-gradient-to-br ${mood.color} text-white rounded-xl p-6 text-center hover:scale-105 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedMood?.name === mood.name ? 'ring-4 ring-white scale-105' : ''
                }`}
              >
                <div className="text-4xl mb-2">{mood.emoji}</div>
                <h3 className="text-lg font-bold">{mood.name}</h3>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Activity Selection */}
      {activeTab === 'activity' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-green-600" />
            Choose Your Activity
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {activities.map((activity, index) => (
              <button
                key={index}
                onClick={() => handleGenerateActivity(activity)}
                disabled={generating}
                className={`bg-gradient-to-br ${activity.color} text-white rounded-xl p-6 text-center hover:scale-105 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedActivity?.name === activity.name ? 'ring-4 ring-white scale-105' : ''
                }`}
              >
                <div className="text-4xl mb-2">{activity.emoji}</div>
                <h3 className="text-lg font-bold">{activity.name}</h3>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Smart Mix */}
      {activeTab === 'smart' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
          <h2 className="text-2xl font-bold mb-4">Smart Mix Generator</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-3">Source</label>
              <div className="space-y-2">
                <button
                  onClick={() => setSmartMode('top-tracks')}
                  className={`w-full p-4 rounded-lg border-2 transition-colors text-left ${
                    smartMode === 'top-tracks'
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <div className="font-semibold mb-1">Top Tracks</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Generate from your most played songs
                  </div>
                </button>
                <button
                  onClick={() => setSmartMode('recent')}
                  className={`w-full p-4 rounded-lg border-2 transition-colors text-left ${
                    smartMode === 'recent'
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <div className="font-semibold mb-1">Recently Played</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Generate from your recent listening
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {smartMode === 'top-tracks' && (
                <div>
                  <label className="block text-sm font-medium mb-3">Time Range</label>
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  >
                    <option value="short_term">Last 4 Weeks</option>
                    <option value="medium_term">Last 6 Months</option>
                    <option value="long_term">All Time</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-3">Target Mood</label>
                <select
                  value={targetMood}
                  onChange={(e) => setTargetMood(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                >
                  {moods.map((mood) => (
                    <option key={mood.name} value={mood.targetMood}>
                      {mood.emoji} {mood.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleGenerateSmart} 
            isLoading={generating}
            className="w-full"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Generate Smart Mix
          </Button>
        </div>
      )}

      {/* Generation Progress */}
      {generating && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
          <Loader2 className="animate-spin w-16 h-16 mx-auto mb-4 text-indigo-600" />
          <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            Generating your perfect playlist...
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            AI is analyzing millions of tracks to find your vibe
          </p>
        </div>
      )}

      {/* Generated Playlist */}
      {generatedTracks && !generating && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Generated Playlist</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {generatedTracks.total || generatedTracks.tracks?.length || 0} tracks • {generatedTracks.personalized ? '✨ Personalized' : '🎵 Standard'}
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full md:w-auto">
              <input
                type="text"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                placeholder="Enter playlist name"
              />
              <Button 
                onClick={handleSaveToSpotify} 
                isLoading={saving}
                className="w-full"
              >
                <Plus className="w-5 h-5 mr-2" />
                Save to Spotify
              </Button>
            </div>
          </div>

          {/* Track List */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {generatedTracks.tracks?.map((track, index) => (
              <div
                key={track.id || index}
                className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center font-semibold text-indigo-600 dark:text-indigo-300 text-sm">
                  {index + 1}
                </div>

                {track.album?.images?.[0]?.url && (
                  <img
                    src={track.album.images[0].url}
                    alt={track.album.name}
                    className="w-12 h-12 rounded"
                  />
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{track.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {track.artists?.map(a => a.name).join(', ')}
                  </p>
                </div>

                {track.external_urls?.spotify && (
                  <a
                    href={track.external_urls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      {!generatedTracks && !generating && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-8 text-center">
          <Music className="w-16 h-16 mx-auto mb-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-xl font-bold mb-2">AI-Powered Playlist Generation</h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Select a mood, activity, or use smart mix to generate a personalized playlist. Our AI analyzes
            millions of tracks to find the perfect songs that match your preferences.
          </p>
        </div>
      )}
    </div>
  );
};

export default MoodGenerator;