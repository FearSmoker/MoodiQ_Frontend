import { useState, useEffect } from 'react';
import { Activity, Music, Clock, TrendingUp, Heart, Zap } from 'lucide-react';
import { getRealtimeAnalysis, getMoodTimeline, getActivityAnalytics } from '../../api/analytics';
import MoodLineChart from '../../components/charts/MoodLineChart';
import { Loader } from '../../components/ui/Loader';
import toast from 'react-hot-toast';

const RealtimeAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [realtimeData, setRealtimeData] = useState(null);
  const [moodTimeline, setMoodTimeline] = useState(null);
  const [activityData, setActivityData] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedDays, setSelectedDays] = useState(7);

  useEffect(() => {
    fetchData();
    
    // Poll real-time data every 10 seconds
    const interval = setInterval(fetchRealtimeData, 10000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchMoodTimeline(selectedDays);
  }, [selectedDays]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [realtime, timeline, activity] = await Promise.all([
        getRealtimeAnalysis().catch(() => null),
        getMoodTimeline(selectedDays).catch(() => null),
        getActivityAnalytics().catch(() => null)
      ]);

      setRealtimeData(realtime);
      setMoodTimeline(timeline);
      setActivityData(activity);
      setIsPlaying(realtime?.isPlaying || false);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast.error('Failed to load real-time analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchRealtimeData = async () => {
    try {
      const data = await getRealtimeAnalysis();
      setRealtimeData(data);
      setIsPlaying(data?.isPlaying || false);
    } catch (error) {
      console.log('Could not fetch real-time data');
    }
  };

  const fetchMoodTimeline = async (days) => {
    try {
      const data = await getMoodTimeline(days);
      setMoodTimeline(data);
    } catch (error) {
      console.error('Failed to fetch mood timeline:', error);
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
          <Activity className="w-8 h-8 text-blue-600" />
          Real-time Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your listening patterns and mood changes in real-time
        </p>
      </div>

      {/* Connection Status */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="font-medium">
              {isPlaying ? 'Currently Playing' : 'Not Playing'}
            </span>
          </div>
          <button
            onClick={fetchRealtimeData}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Currently Playing */}
      {realtimeData?.isPlaying && realtimeData.track && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <Music className="w-5 h-5 animate-pulse" />
            <span className="font-semibold">Now Playing</span>
          </div>
          
          <div className="flex items-start gap-6">
            {realtimeData.track.album?.images?.[0]?.url && (
              <img
                src={realtimeData.track.album.images[0].url}
                alt={realtimeData.track.album.name}
                className="w-24 h-24 rounded-lg shadow-lg"
              />
            )}
            
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2">{realtimeData.track.name}</h3>
              <p className="text-white/90 mb-4">
                {realtimeData.track.artists?.map(a => a.name).join(', ')}
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {realtimeData.mood?.mood && (
                  <div className="bg-white/20 rounded-lg p-3">
                    <div className="text-sm text-white/80">Mood</div>
                    <div className="text-lg font-bold">{realtimeData.mood.mood}</div>
                  </div>
                )}
                {realtimeData.mood?.confidence && (
                  <div className="bg-white/20 rounded-lg p-3">
                    <div className="text-sm text-white/80">Confidence</div>
                    <div className="text-lg font-bold">
                      {Math.round(realtimeData.mood.confidence * 100)}%
                    </div>
                  </div>
                )}
                {realtimeData.mood?.audioFeatures?.energy !== undefined && (
                  <div className="bg-white/20 rounded-lg p-3">
                    <div className="text-sm text-white/80">Energy</div>
                    <div className="text-lg font-bold">
                      {Math.round(realtimeData.mood.audioFeatures.energy * 100)}%
                    </div>
                  </div>
                )}
                {realtimeData.mood?.audioFeatures?.valence !== undefined && (
                  <div className="bg-white/20 rounded-lg p-3">
                    <div className="text-sm text-white/80">Valence</div>
                    <div className="text-lg font-bold">
                      {Math.round(realtimeData.mood.audioFeatures.valence * 100)}%
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {realtimeData.timestamp && (
            <div className="mt-4 text-sm text-white/70">
              Last updated: {new Date(realtimeData.timestamp).toLocaleTimeString()}
            </div>
          )}
        </div>
      )}

      {/* Not Playing State */}
      {!realtimeData?.isPlaying && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
          <Music className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-bold mb-2">No Track Playing</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Start playing music on Spotify to see real-time analytics
          </p>
        </div>
      )}

      {/* Mood Timeline */}
      {moodTimeline && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
              Mood Timeline
            </h2>
            <div className="flex gap-2">
              {[7, 14, 30].map((days) => (
                <button
                  key={days}
                  onClick={() => setSelectedDays(days)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedDays === days
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {days}d
                </button>
              ))}
            </div>
          </div>

          {moodTimeline.timeline && moodTimeline.timeline.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {moodTimeline.dominantMood && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Dominant Mood</div>
                    <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                      {moodTimeline.dominantMood}
                    </div>
                  </div>
                )}
                {moodTimeline.totalListeningTime && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Listening Time</div>
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {Math.round(moodTimeline.totalListeningTime / 3600)}h
                    </div>
                  </div>
                )}
                {moodTimeline.averageMood && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Avg Mood</div>
                    <div className="text-xl font-bold text-green-600 dark:text-green-400">
                      {moodTimeline.averageMood}
                    </div>
                  </div>
                )}
                <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Data Points</div>
                  <div className="text-xl font-bold text-pink-600 dark:text-pink-400">
                    {moodTimeline.timeline.length}
                  </div>
                </div>
              </div>

              <MoodLineChart data={moodTimeline.timeline} />
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No mood data available for the selected period</p>
              <p className="text-sm mt-2">Start listening to build your mood timeline</p>
            </div>
          )}
        </div>
      )}

      {/* Activity Insights */}
      {activityData && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Hourly Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Peak Hours
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="font-medium">Peak Hour</span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {activityData.insights?.peakHour}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <span className="font-medium">Peak Day</span>
                <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {activityData.insights?.peakDay}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="font-medium">Total Plays</span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  {activityData.insights?.totalPlays}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                <span className="font-medium">Unique Artists</span>
                <span className="text-lg font-bold text-pink-600 dark:text-pink-400">
                  {activityData.insights?.uniqueArtists}
                </span>
              </div>
            </div>
          </div>

          {/* Daily Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-600" />
              Weekly Pattern
            </h3>
            <div className="space-y-3">
              {activityData.dailyActivity?.map((day, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-12">{day.day}</span>
                  <div className="flex-1 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg transition-all"
                      style={{
                        width: `${Math.max((day.plays / Math.max(...activityData.dailyActivity.map(d => d.plays))) * 100, 5)}%`
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-8">{day.plays}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <Zap className="w-8 h-8 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-bold mb-2">Real-time Insights</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              This page updates automatically every 10 seconds to show your current playback and mood analysis.
              Keep Spotify playing to see live updates and build your personalized mood timeline.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealtimeAnalytics;