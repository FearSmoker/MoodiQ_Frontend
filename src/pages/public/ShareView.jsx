import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader } from '../../components/ui/Loader';
import MoodLineChart from '../../components/charts/MoodLineChart';
import api from '../../lib/api';
import { Eye, Music, Calendar } from 'lucide-react';

const Share = () => {
  const { shareId } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSharedPlaylist();
  }, [shareId]);

  const fetchSharedPlaylist = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/user/share/${shareId}`);
      setPlaylist(data);
    } catch (err) {
      console.error('Failed to fetch shared playlist:', err);
      setError(err.response?.data?.message || 'Could not find this shared playlist');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <Music size={64} className="text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Playlist Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
          {error}
        </p>
      </div>
    );
  }

  const tracks = playlist.moodData?.tracks || [];
  const moodDistribution = playlist.moodData?.moodDistribution || {};

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-8 text-white">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="text-sm opacity-80 mb-2">Shared MoodiQ Mix</div>
            <h1 className="text-4xl font-bold mb-3">
              {playlist.playlistName || 'Untitled Playlist'}
            </h1>
            
            {playlist.owner && (
              <div className="flex items-center gap-2 text-sm opacity-90">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  {playlist.owner.avatarUrl ? (
                    <img 
                      src={playlist.owner.avatarUrl} 
                      alt={playlist.owner.displayName}
                      className="w-full h-full rounded-full"
                    />
                  ) : (
                    <Music size={16} />
                  )}
                </div>
                <span>Shared by {playlist.owner.displayName || 'Anonymous'}</span>
              </div>
            )}
          </div>

          {playlist.playlistImage && (
            <img 
              src={playlist.playlistImage} 
              alt={playlist.playlistName}
              className="w-32 h-32 rounded-lg shadow-lg"
            />
          )}
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
            <Music size={16} />
            <span>{tracks.length} tracks</span>
          </div>
          {playlist.views !== undefined && (
            <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
              <Eye size={16} />
              <span>{playlist.views} views</span>
            </div>
          )}
          {playlist.createdAt && (
            <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
              <Calendar size={16} />
              <span>{new Date(playlist.createdAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Mood Visualization */}
      {tracks.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Mood Journey</h2>
          <MoodLineChart data={tracks} />
        </div>
      )}

      {/* Mood Distribution */}
      {Object.keys(moodDistribution).length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Mood Distribution</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(moodDistribution)
              .sort((a, b) => b[1] - a[1])
              .map(([mood, count]) => (
                <div
                  key={mood}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg"
                >
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {mood}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {count} tracks
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Track List */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Tracklist</h2>
        <div className="space-y-2">
          {tracks.map((track, index) => (
            <div
              key={track.id || index}
              className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center gap-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center font-semibold text-indigo-600 dark:text-indigo-300 text-sm">
                {index + 1}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{track.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {track.artists?.map(a => a.name || a).join(', ') || 'Unknown Artist'}
                </p>
              </div>

              {track.mood && (
                <div className="flex-shrink-0">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMoodColor(track.mood)}`}>
                    {track.mood}
                  </span>
                </div>
              )}

              {track.features && (
                <div className="hidden md:flex gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <span>Energy: {(track.features.energy * 100).toFixed(0)}%</span>
                  <span>Valence: {(track.features.valence * 100).toFixed(0)}%</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Create Your Own CTA */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-8 text-white text-center">
        <h3 className="text-2xl font-bold mb-2">Create Your Own Mood Mix</h3>
        <p className="mb-4 opacity-90">
          Analyze your playlists and discover the perfect mood flow
        </p>
        <a
          href="/login"
          className="inline-block px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          Get Started
        </a>
      </div>
    </div>
  );
};

// Helper function to get mood-based colors
const getMoodColor = (mood) => {
  const moodLower = mood?.toLowerCase() || '';
  
  if (moodLower.includes('happy') || moodLower.includes('joy')) {
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  } else if (moodLower.includes('sad') || moodLower.includes('melancholy')) {
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  } else if (moodLower.includes('energetic') || moodLower.includes('excited')) {
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  } else if (moodLower.includes('calm') || moodLower.includes('relaxed')) {
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  } else if (moodLower.includes('angry') || moodLower.includes('aggressive')) {
    return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
  } else {
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
};

export default Share;