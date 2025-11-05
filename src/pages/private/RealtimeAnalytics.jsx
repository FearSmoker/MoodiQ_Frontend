import { useState, useEffect } from 'react';
import { Activity, Music, Clock, TrendingUp, Heart, Zap, Radio, RefreshCw, AlertCircle } from 'lucide-react';
import { 
  getRealtimeAnalysis, 
  getMoodTimeline, 
  getActivityAnalytics 
} from '../../api/analytics';
import MoodLineChart from '../../components/charts/MoodLineChart';
import { Loader } from '../../components/ui/Loader';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

/**
 * RealtimeAnalytics Component - Updated for Spotify Service v2.5.1
 * 
 * Updates:
 * - ✅ Handles new response structure from updated spotify_service.py
 * - ✅ Supports podcast episodes
 * - ✅ Better error handling with retry logic
 * - ✅ Rate limit awareness
 * - ✅ Enhanced playback state display
 */

const RealtimeAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [realtimeData, setRealtimeData] = useState(null);
  const [moodTimeline, setMoodTimeline] = useState(null);
  const [activityData, setActivityData] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedDays, setSelectedDays] = useState(7);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [rateLimited, setRateLimited] = useState(false);

  useEffect(() => {
    fetchData();
    
    // Poll real-time data every 10 seconds if not rate limited
    const interval = setInterval(() => {
      if (!rateLimited) {
        fetchRealtimeData();
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [rateLimited]);

  useEffect(() => {
    fetchMoodTimeline(selectedDays);
  }, [selectedDays]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📊 RealtimeAnalytics: Loading data...');
      
      const [realtime, timeline, activity] = await Promise.all([
        getRealtimeAnalysis().catch(handleFetchError),
        getMoodTimeline(selectedDays).catch(handleFetchError),
        getActivityAnalytics().catch(handleFetchError)
      ]);

      setRealtimeData(realtime);
      setMoodTimeline(timeline);
      setActivityData(activity);
      setIsPlaying(realtime?.isPlaying || false);
      setLastUpdate(new Date());
      setRateLimited(false);
      
      console.log('✅ RealtimeAnalytics: Data loaded');
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setError(error.message || 'Failed to load analytics');
      
      if (error.code === 'RATE_LIMIT' || error.status === 429) {
        setRateLimited(true);
        const retryAfter = error.retryAfter || 60;
        toast.error(`Rate limited. Retrying in ${retryAfter}s`, { id: 'rate-limit', duration: retryAfter * 1000 });
        
        // Auto-retry after rate limit expires
        setTimeout(() => {
          setRateLimited(false);
          fetchData();
        }, retryAfter * 1000);
      } else if (error.code === 'SPOTIFY_TOKEN_EXPIRED') {
        toast.error('Spotify session expired. Please refresh the page.', { id: 'token-expired' });
      } else {
        toast.error('Failed to load real-time analytics', { id: 'analytics-error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRealtimeData = async () => {
    try {
      const data = await getRealtimeAnalysis();
      setRealtimeData(data);
      setIsPlaying(data?.isPlaying || false);
      setLastUpdate(new Date());
      setError(null);
    } catch (error) {
      // Handle rate limits gracefully during polling
      if (error.code === 'RATE_LIMIT' || error.status === 429) {
        setRateLimited(true);
        console.log('Rate limited during polling');
        return;
      }
      
      // Silently fail for other polling errors
      console.log('Could not fetch real-time data:', error.message);
    }
  };

  const fetchMoodTimeline = async (days) => {
    try {
      console.log(`📈 Fetching mood timeline for ${days} days...`);
      const data = await getMoodTimeline(days);
      setMoodTimeline(data);
    } catch (error) {
      console.error('Failed to fetch mood timeline:', error);
      // Don't show error toast for timeline failures
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast.success('Data refreshed!', { id: 'refresh-success' });
  };

  const handleFetchError = (error) => {
    // Transform error for better handling
    return {
      error: true,
      message: error.message,
      code: error.code,
      status: error.status,
      retryAfter: error.retryAfter
    };
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
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Activity className="w-8 h-8 text-blue-600" />
          Real-time Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your listening patterns and mood changes in real-time
        </p>
      </div>

      {/* Error Alert */}
      {error && !rateLimited && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 dark:text-red-200">Error Loading Analytics</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
            </div>
            <Button onClick={fetchData} variant="secondary" size="sm">
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Rate Limit Alert */}
      {rateLimited && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-200">Rate Limit Reached</h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Too many requests. Auto-polling paused. Click refresh to try again.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Connection Status */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <div>
              <span className="font-medium">
                {isPlaying ? 'Currently Playing' : 'Not Playing'}
              </span>
              {lastUpdate && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
          <Button
            onClick={handleRefresh}
            isLoading={refreshing}
            variant="secondary"
            size="sm"
            disabled={rateLimited}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Currently Playing - Track */}
      {realtimeData?.isPlaying && realtimeData.type === 'track' && realtimeData.track && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <Radio className="w-5 h-5 animate-pulse" />
            <span className="font-semibold">Now Playing</span>
          </div>
          
          <div className="flex items-start gap-6">
            {realtimeData.track.albumImage && (
              <img
                src={realtimeData.track.albumImage}
                alt={realtimeData.track.album?.name || 'Album'}
                className="w-24 h-24 rounded-lg shadow-lg flex-shrink-0"
              />
            )}
            
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl font-bold mb-2 truncate">{realtimeData.track.name}</h3>
              <p className="text-white/90 mb-2 truncate">
                {realtimeData.track.artists?.map(a => a.name).join(', ')}
              </p>
              {realtimeData.track.explicit && (
                <span className="inline-block bg-white/20 text-xs px-2 py-1 rounded mb-4">
                  EXPLICIT
                </span>
              )}
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {realtimeData.mood?.fused_mood && (
                  <div className="bg-white/20 backdrop-blur rounded-lg p-3">
                    <div className="text-sm text-white/80">Mood</div>
                    <div className="text-lg font-bold">{realtimeData.mood.fused_mood}</div>
                    {realtimeData.mood.source && (
                      <div className="text-xs text-white/60 mt-1">
                        {realtimeData.mood.source === 'ml_model' ? '🤖 ML' : '📊 Rule-based'}
                      </div>
                    )}
                  </div>
                )}
                {realtimeData.mood?.confidence !== undefined && (
                  <div className="bg-white/20 backdrop-blur rounded-lg p-3">
                    <div className="text-sm text-white/80">Confidence</div>
                    <div className="text-lg font-bold">
                      {Math.round(realtimeData.mood.confidence * 100)}%
                    </div>
                  </div>
                )}
                {realtimeData.mood?.scores?.energy !== undefined && (
                  <div className="bg-white/20 backdrop-blur rounded-lg p-3">
                    <div className="text-sm text-white/80">Energy</div>
                    <div className="text-lg font-bold">
                      {Math.round(realtimeData.mood.scores.energy * 100)}%
                    </div>
                  </div>
                )}
                {realtimeData.mood?.scores?.valence !== undefined && (
                  <div className="bg-white/20 backdrop-blur rounded-lg p-3">
                    <div className="text-sm text-white/80">Valence</div>
                    <div className="text-lg font-bold">
                      {Math.round(realtimeData.mood.scores.valence * 100)}%
                    </div>
                  </div>
                )}
              </div>

              {/* Secondary Moods */}
              {realtimeData.mood?.audio_mood && realtimeData.mood?.lyrics_mood && (
                <div className="mt-3 flex gap-2 text-sm">
                  <span className="bg-white/20 px-3 py-1 rounded">
                    🎹 Audio: {realtimeData.mood.audio_mood}
                  </span>
                  <span className="bg-white/20 px-3 py-1 rounded">
                    📝 Lyrics: {realtimeData.mood.lyrics_mood}
                  </span>
                </div>
              )}

              {/* Progress Bar */}
              {realtimeData.track.progress !== undefined && realtimeData.track.duration && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{formatTime(realtimeData.track.progress)}</span>
                    <span>{formatTime(realtimeData.track.duration)}</span>
                  </div>
                  <div className="bg-white/20 rounded-full h-2">
                    <div 
                      className="bg-white h-2 rounded-full transition-all"
                      style={{ 
                        width: `${Math.min((realtimeData.track.progress / realtimeData.track.duration) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Playback Controls Info */}
              {realtimeData.playback && (
                <div className="mt-3 flex gap-3 text-sm text-white/70">
                  {realtimeData.playback.shuffleState && (
                    <span>🔀 Shuffle</span>
                  )}
                  {realtimeData.playback.repeatState && realtimeData.playback.repeatState !== 'off' && (
                    <span>🔁 Repeat: {realtimeData.playback.repeatState}</span>
                  )}
                </div>
              )}

              {/* Device */}
              {realtimeData.device && (
                <div className="mt-4 flex items-center gap-2 text-sm text-white/70">
                  <span>Playing on {realtimeData.device.name}</span>
                  {realtimeData.device.type && (
                    <span className="bg-white/10 px-2 py-0.5 rounded text-xs">
                      {realtimeData.device.type}
                    </span>
                  )}
                  {realtimeData.device.volume !== undefined && (
                    <span>🔊 {realtimeData.device.volume}%</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {realtimeData.timestamp && (
            <div className="mt-4 text-sm text-white/70">
              Analyzed at: {new Date(realtimeData.timestamp).toLocaleTimeString()}
            </div>
          )}
        </div>
      )}

      {/* Currently Playing - Podcast Episode */}
      {realtimeData?.isPlaying && realtimeData.type === 'episode' && realtimeData.episode && (
        <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <Radio className="w-5 h-5 animate-pulse" />
            <span className="font-semibold">Podcast Playing</span>
          </div>
          
          <div className="flex items-start gap-6">
            {realtimeData.episode.images?.[0]?.url && (
              <img
                src={realtimeData.episode.images[0].url}
                alt={realtimeData.episode.show?.name || 'Podcast'}
                className="w-24 h-24 rounded-lg shadow-lg flex-shrink-0"
              />
            )}
            
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl font-bold mb-2">{realtimeData.episode.name}</h3>
              <p className="text-white/90 mb-4">
                {realtimeData.episode.show?.name}
              </p>
              
              {realtimeData.episode.description && (
                <p className="text-sm text-white/80 line-clamp-3 mb-4">
                  {realtimeData.episode.description}
                </p>
              )}

              {/* Progress Bar */}
              {realtimeData.progress !== undefined && realtimeData.episode.duration && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{formatTime(realtimeData.progress)}</span>
                    <span>{formatTime(realtimeData.episode.duration)}</span>
                  </div>
                  <div className="bg-white/20 rounded-full h-2">
                    <div 
                      className="bg-white h-2 rounded-full transition-all"
                      style={{ 
                        width: `${Math.min((realtimeData.progress / realtimeData.episode.duration) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Device */}
              {realtimeData.device && (
                <div className="mt-4 text-sm text-white/70">
                  Playing on {realtimeData.device.name}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 text-sm text-white/70">
            Note: Mood analysis is only available for music tracks
          </div>
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
          {/* Peak Hours */}
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

          {/* Weekly Pattern */}
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
              {rateLimited && ' Auto-polling is currently paused due to rate limiting.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to format time
const formatTime = (ms) => {
  if (!ms || ms < 0) return '0:00';
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export default RealtimeAnalytics;