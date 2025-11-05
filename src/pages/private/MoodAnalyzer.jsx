import { useEffect, useState } from 'react';
import { Heart, TrendingUp, Calendar, Activity, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getMoodTrends,
  getMoodDistribution,
  getMoodPatterns,
  getActivityAnalytics,
  getGenreAnalysis
} from '../../api/analytics';
import MoodLineChart from '../../components/charts/MoodLineChart';
import MoodCloud from '../../components/charts/MoodCloud';

const MoodAnalyzer = () => {
  const [loading, setLoading] = useState(true);
  const [moodTrends, setMoodTrends] = useState(null);
  const [moodDistribution, setMoodDistribution] = useState(null);
  const [moodPatterns, setMoodPatterns] = useState(null);
  const [activityData, setActivityData] = useState(null);
  const [genreData, setGenreData] = useState(null);
  const [timeRange, setTimeRange] = useState('medium_term');
  const [selectedDays, setSelectedDays] = useState(7);

  useEffect(() => {
    fetchAllData();
  }, [timeRange, selectedDays]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      console.log('📊 MoodAnalyzer: Fetching data...');

      const [trends, distribution, patterns, activity, genres] = await Promise.all([
        getMoodTrends(50, selectedDays),
        getMoodDistribution(),
        getMoodPatterns(),
        getActivityAnalytics(),
        getGenreAnalysis(timeRange)
      ]);

      setMoodTrends(trends);
      setMoodDistribution(distribution);
      setMoodPatterns(patterns);
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
          Analyze the emotional patterns in your listening history with our 12-mood system
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
            <label className="block text-sm font-medium mb-2">Analysis Period</label>
            <select
              value={selectedDays}
              onChange={(e) => setSelectedDays(Number(e.target.value))}
              className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500"
            >
              <option value={7}>Last 7 Days</option>
              <option value={14}>Last 14 Days</option>
              <option value={30}>Last 30 Days</option>
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
            <div className="text-3xl font-bold mb-1">
              {moodTrends.statistics?.totalTracks || 0}
            </div>
            <div className="text-sm opacity-90">Tracks Analyzed</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-6 text-white shadow-lg">
            <Activity className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">
              {moodTrends.statistics?.uniqueMoods || 0}
            </div>
            <div className="text-sm opacity-90">Unique Moods (12-System)</div>
          </div>
        </div>
      )}

      {/* Mood Timeline Chart with Aggregated Features */}
      {moodTrends && moodTrends.aggregatedFeatures && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            Mood Timeline - Audio Features Over Time
          </h2>
          
          {/* Feature Averages */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
              <div className="text-xs text-gray-600 dark:text-gray-400">Avg Valence</div>
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {Math.round(moodTrends.aggregatedFeatures.summary.avgValence * 100)}%
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
              <div className="text-xs text-gray-600 dark:text-gray-400">Avg Energy</div>
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {Math.round(moodTrends.aggregatedFeatures.summary.avgEnergy * 100)}%
              </div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
              <div className="text-xs text-gray-600 dark:text-gray-400">Avg Danceability</div>
              <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {Math.round(moodTrends.aggregatedFeatures.summary.avgDanceability * 100)}%
              </div>
            </div>
            <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-3">
              <div className="text-xs text-gray-600 dark:text-gray-400">Avg Acousticness</div>
              <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                {Math.round(moodTrends.aggregatedFeatures.summary.avgAcousticness * 100)}%
              </div>
            </div>
          </div>

          <MoodLineChart 
            data={moodTrends.aggregatedFeatures.timeline.dates.map((date, index) => ({
              date: date,
              valence: parseFloat(moodTrends.aggregatedFeatures.timeline.valence[index]),
              energy: parseFloat(moodTrends.aggregatedFeatures.timeline.energy[index]),
              danceability: parseFloat(moodTrends.aggregatedFeatures.timeline.danceability[index]),
              acousticness: parseFloat(moodTrends.aggregatedFeatures.timeline.acousticness[index])
            }))}
            showAggregated={true}
          />
          
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            💡 This chart shows aggregated audio features from your listening history, 
            revealing patterns in your mood preferences over time.
          </div>
        </div>
      )}

      {/* Mood Cloud - 12 Mood System */}
      {moodTrends && moodTrends.trends && (
        <MoodCloud moodData={moodTrends.trends} />
      )}

      {/* Mood Distribution (12-Mood System) */}
      {moodDistribution && moodDistribution.distribution && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">12-Mood Distribution</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(moodDistribution.distribution)
              .sort((a, b) => b[1] - a[1])
              .map(([mood, count]) => (
                <div key={mood} className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                    {count}
                  </div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {mood}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {Math.round((count / moodDistribution.totalTracks) * 100)}%
                  </div>
                </div>
              ))}
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Total Tracks:</span>
                <span className="font-bold ml-2">{moodDistribution.totalTracks}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Mood Tags:</span>
                <span className="font-bold ml-2">{moodDistribution.totalMoodTags}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Avg Moods/Track:</span>
                <span className="font-bold ml-2">{moodDistribution.avgMoodsPerTrack?.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Diversity:</span>
                <span className="font-bold ml-2">{moodDistribution.moodDiversity} moods</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mood Patterns - Co-occurrence */}
      {moodPatterns && moodPatterns.patterns && moodPatterns.patterns.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Mood Co-occurrence Patterns</h2>
          <div className="space-y-3">
            {moodPatterns.patterns.slice(0, 10).map((pattern, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    #{index + 1}
                  </span>
                  <div>
                    <div className="font-semibold">
                      {pattern.mood1} + {pattern.mood2}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Appear together in {pattern.count} tracks
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {pattern.percentage?.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">co-occurrence</div>
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