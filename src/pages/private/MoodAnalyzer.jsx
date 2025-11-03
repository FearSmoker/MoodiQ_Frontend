import { useState, useEffect } from 'react';
import { Heart, TrendingUp, Music, Activity } from 'lucide-react';
import { getMoodTrends, getActivityAnalytics, getGenreAnalysis } from '../../api/analytics';
import { getPlaylists, getPlaylistMood } from '../../api/playlists';
import MoodLineChart from '../../components/charts/MoodLineChart';
import MoodCloud from '../../components/charts/MoodCloud';
import { Loader } from '../../components/ui/Loader';
import toast from 'react-hot-toast';

const MoodAnalyzer = () => {
  const [loading, setLoading] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [moodData, setMoodData] = useState(null);
  const [moodTrends, setMoodTrends] = useState(null);
  const [activityData, setActivityData] = useState(null);
  const [genreData, setGenreData] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [playlistsData, trendsData, activityRes, genresRes] = await Promise.all([
        getPlaylists(),
        getMoodTrends(50).catch(() => null),
        getActivityAnalytics().catch(() => null),
        getGenreAnalysis('medium_term').catch(() => null)
      ]);

      setPlaylists(playlistsData.playlists || playlistsData);
      setMoodTrends(trendsData);
      setActivityData(activityRes);
      setGenreData(genresRes);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load mood analyzer data');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzePlaylist = async (playlist) => {
    setSelectedPlaylist(playlist);
    setAnalyzing(true);
    
    try {
      console.log('🎭 Analyzing playlist:', playlist.name);
      const analysis = await getPlaylistMood(playlist.id);
      setMoodData(analysis);
      toast.success('Playlist analyzed successfully!');
    } catch (error) {
      console.error('Failed to analyze playlist:', error);
      toast.error('Failed to analyze playlist mood');
    } finally {
      setAnalyzing(false);
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Heart className="w-8 h-8 text-red-500" />
          Mood Analyzer
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Deep dive into the emotional patterns of your music
        </p>
      </div>

      {/* Mood Trends Overview */}
      {moodTrends && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            Recent Mood Trends
          </h2>
          
          {moodTrends.trends && moodTrends.trends.length > 0 ? (
            <>
              <div className="mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Overall Mood</div>
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {moodTrends.overallMood || 'Mixed'}
                    </div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Tracks</div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {moodTrends.statistics?.totalTracks || 0}
                    </div>
                  </div>
                  {moodTrends.moodDistribution && Object.keys(moodTrends.moodDistribution).length > 0 && (
                    <>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Dominant Mood</div>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {Object.entries(moodTrends.moodDistribution)
                            .sort((a, b) => b[1] - a[1])[0][0]}
                        </div>
                      </div>
                      <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Mood Variety</div>
                        <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                          {Object.keys(moodTrends.moodDistribution).length}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <MoodLineChart data={moodTrends.trends} />
              
              {moodTrends.moodDistribution && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Mood Distribution</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(moodTrends.moodDistribution).map(([mood, count]) => (
                      <div
                        key={mood}
                        className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm font-medium"
                      >
                        {mood}: {count}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No recent listening data available</p>
            </div>
          )}
        </div>
      )}

      {/* Activity Analytics */}
      {activityData && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Listening Activity
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Peak Hour</span>
                <span className="font-semibold">{activityData.insights?.peakHour}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Peak Day</span>
                <span className="font-semibold">{activityData.insights?.peakDay}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Total Plays</span>
                <span className="font-semibold">{activityData.insights?.totalPlays}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Unique Artists</span>
                <span className="font-semibold">{activityData.insights?.uniqueArtists}</span>
              </div>
            </div>
          </div>

          {genreData && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Music className="w-5 h-5 text-purple-600" />
                Top Genres
              </h3>
              <div className="space-y-2">
                {genreData.allGenres?.slice(0, 8).map((genre, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{genre.genre}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-600"
                          style={{ width: `${genre.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-10 text-right">
                        {genre.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Playlist Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Analyze a Playlist</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {playlists.slice(0, 12).map((playlist) => (
            <button
              key={playlist.id}
              onClick={() => handleAnalyzePlaylist(playlist)}
              disabled={analyzing}
              className={`group relative overflow-hidden rounded-lg transition-all hover:scale-105 ${
                selectedPlaylist?.id === playlist.id
                  ? 'ring-4 ring-indigo-500'
                  : ''
              } ${analyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
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
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center">
                <span className="text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity px-2 text-center text-sm">
                  {playlist.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Playlist Analysis Results */}
      {analyzing && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
          <Loader />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Analyzing {selectedPlaylist?.name}...
          </p>
        </div>
      )}

      {moodData && !analyzing && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">
              Analysis: {selectedPlaylist?.name}
            </h2>
            
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">Overall Mood</div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {moodData.overallMood}
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Tracks</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {moodData.totalTracks}
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">Analyzed At</div>
                <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                  {new Date(moodData.analyzedAt).toLocaleString()}
                </div>
              </div>
            </div>

            {moodData.tracks && <MoodLineChart data={moodData.tracks} />}
          </div>

          {moodData.moodDistribution && (
            <MoodCloud moodData={moodData.tracks} />
          )}
        </div>
      )}
    </div>
  );
};

export default MoodAnalyzer;