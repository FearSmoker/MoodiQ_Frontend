import { useEffect, useState } from 'react';
import { Heart, TrendingUp, Calendar, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getMoodTrends,
  getActivityAnalytics,
  getGenreAnalysis
} from '../../api/analytics';
import MoodLineChart from '../../components/charts/MoodLineChart';
import MoodCloud from '../../components/charts/MoodCloud';

const MoodAnalyzer = () => {
  const [loading, setLoading] = useState(true);
  const [moodTrends, setMoodTrends] = useState(null);
  const [activityData, setActivityData] = useState(null);
  const [genreData, setGenreData] = useState(null);
  const [timeRange, setTimeRange] = useState('medium_term');
  const [trendsLimit, setTrendsLimit] = useState(50);

  useEffect(() => {
    fetchAllData();
  }, [timeRange, trendsLimit]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      console.log('📊 MoodAnalyzer: Fetching data...');

      const [trends, activity, genres] = await Promise.all([
        getMoodTrends(trendsLimit),
        getActivityAnalytics(),
        getGenreAnalysis(timeRange)
      ]);

      setMoodTrends(trends);
      setActivityData(activity);
      setGenreData(genres);
      
      console.log('✅ MoodAnalyzer: Data loaded');
    } catch (error) {
      console.error('❌ MoodAnalyzer: Failed to load:', error);
      toast.error('Failed to load analytics', { id: 'analytics-error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Analyzing your music mood...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mood Analyzer</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Analyze the emotional patterns in your listening history
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Time Range</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="short_term">Last 4 Weeks</option>
              <option value="medium_term">Last 6 Months</option>
              <option value="long_term">All Time</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Analysis Depth</label>
            <select
              value={trendsLimit}
              onChange={(e) => setTrendsLimit(Number(e.target.value))}
              className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500"
            >
              <option value={25}>25 tracks</option>
              <option value={50}>50 tracks</option>
              <option value={100}>100 tracks</option>
            </select>
          </div>
        </div>
      </div>

      {/* Overall Mood Stats */}
      {moodTrends && (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white shadow-lg">
            <Heart className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">{moodTrends.overallMood}</div>
            <div className="text-sm opacity-90">Overall Mood</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl p-6 text-white shadow-lg">
            <TrendingUp className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">{moodTrends.trends?.length || 0}</div>
            <div className="text-sm opacity-90">Tracks Analyzed</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-6 text-white shadow-lg">
            <Activity className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">
              {Object.keys(moodTrends.moodDistribution || {}).length}
            </div>
            <div className="text-sm opacity-90">Unique Moods</div>
          </div>
        </div>
      )}

      {/* Mood Timeline Chart */}
      {moodTrends && moodTrends.trends && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Mood Timeline</h2>
          <MoodLineChart data={moodTrends.trends} />
        </div>
      )}

      {/* Mood Cloud */}
      {moodTrends && moodTrends.trends && (
        <MoodCloud moodData={moodTrends.trends} />
      )}

      {/* Mood Distribution */}
      {moodTrends && moodTrends.moodDistribution && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Mood Distribution</h2>
          <div className="space-y-3">
            {Object.entries(moodTrends.moodDistribution)
              .sort((a, b) => b[1] - a[1])
              .map(([mood, percentage]) => (
                <div key={mood} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{mood}</span>
                    <span className="text-gray-600 dark:text-gray-400">{percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Activity Patterns */}
      {activityData && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Hourly Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Listening by Hour</h2>
            <div className="space-y-2">
              {activityData.hourlyActivity?.map((item) => (
                <div key={item.hour} className="flex items-center gap-3">
                  <span className="text-sm w-16 text-gray-600 dark:text-gray-400">
                    {item.hour}
                  </span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full"
                      style={{ 
                        width: `${(item.plays / Math.max(...activityData.hourlyActivity.map(h => h.plays))) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm w-8 text-right text-gray-600 dark:text-gray-400">
                    {item.plays}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Peak Hour:</strong> {activityData.insights?.peakHour}
              </p>
            </div>
          </div>

          {/* Daily Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Listening by Day</h2>
            <div className="space-y-2">
              {activityData.dailyActivity?.map((item) => (
                <div key={item.day} className="flex items-center gap-3">
                  <span className="text-sm w-12 text-gray-600 dark:text-gray-400">
                    {item.day}
                  </span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ 
                        width: `${(item.plays / Math.max(...activityData.dailyActivity.map(d => d.plays))) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm w-8 text-right text-gray-600 dark:text-gray-400">
                    {item.plays}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-sm text-purple-800 dark:text-purple-200">
                <strong>Peak Day:</strong> {activityData.insights?.peakDay}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Genre Analysis */}
      {genreData && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Top Genres</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {genreData.allGenres?.slice(0, 10).map((item) => (
              <div key={item.genre} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="font-medium capitalize">{item.genre}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {item.percentage}%
                  </span>
                  <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights Summary */}
      {activityData?.insights && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Listening Insights</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {activityData.insights.totalPlays}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Total Plays
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {activityData.insights.uniqueArtists}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Unique Artists
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">
                {activityData.insights.averagePlaysPerDay}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Avg. Plays/Day
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodAnalyzer;