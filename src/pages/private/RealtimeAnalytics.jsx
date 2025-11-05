import { useState, useEffect, useRef } from "react";
import {
  Activity,
  Music,
  Clock,
  TrendingUp,
  Heart,
  Zap,
  Radio,
  RefreshCw,
} from "lucide-react";
import {
  getRealtimeAnalysis,
  getMoodTimeline,
  getActivityAnalytics,
} from "../../api/analytics";
import MoodLineChart from "../../components/charts/MoodLineChart";
import { Loader } from "../../components/ui/Loader";
import { Button } from "../../components/ui/Button";
import toast from "react-hot-toast";

const RealtimeAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [realtimeData, setRealtimeData] = useState(null);
  const [moodTimeline, setMoodTimeline] = useState(null);
  const [activityData, setActivityData] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedDays, setSelectedDays] = useState(7);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Use ref to track if component is mounted
  const isMounted = useRef(true);
  const pollingInterval = useRef(null);

  useEffect(() => {
    isMounted.current = true;
    fetchData();

    // Poll real-time data every 10 seconds
    pollingInterval.current = setInterval(() => {
      if (isMounted.current) {
        fetchRealtimeData();
      }
    }, 10000);

    return () => {
      isMounted.current = false;
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    fetchMoodTimeline(selectedDays);
  }, [selectedDays]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log("📊 RealtimeAnalytics: Loading data...");

      const [realtime, timeline, activity] = await Promise.all([
        getRealtimeAnalysis().catch((err) => {
          console.warn("Real-time fetch failed:", err);
          return { isPlaying: false };
        }),
        getMoodTimeline(selectedDays).catch((err) => {
          console.warn("Timeline fetch failed:", err);
          return null;
        }),
        getActivityAnalytics().catch((err) => {
          console.warn("Activity fetch failed:", err);
          return null;
        }),
      ]);

      if (!isMounted.current) return;

      setRealtimeData(realtime);
      setMoodTimeline(timeline);
      setActivityData(activity);
      setIsPlaying(realtime?.isPlaying || false);
      setLastUpdate(new Date());

      console.log("✅ RealtimeAnalytics: Data loaded");
    } catch (error) {
      console.error("Failed to load analytics:", error);
      if (!error.response || error.response.status !== 401) {
        toast.error("Failed to load real-time analytics", {
          id: "analytics-error",
        });
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const fetchRealtimeData = async () => {
    try {
      const data = await getRealtimeAnalysis();
      if (!isMounted.current) return;

      setRealtimeData(data);
      setIsPlaying(data?.isPlaying || false);
      setLastUpdate(new Date());
    } catch (error) {
      // Silently fail for polling errors
      console.log("Polling failed:", error.message);
    }
  };

  const fetchMoodTimeline = async (days) => {
    try {
      console.log(`📈 Fetching mood timeline for ${days} days...`);
      const data = await getMoodTimeline(days);
      if (!isMounted.current) return;

      setMoodTimeline(data);
    } catch (error) {
      console.error("Failed to fetch mood timeline:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast.success("Data refreshed!", { id: "refresh-success" });
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

      {/* Connection Status */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                isPlaying ? "bg-green-500 animate-pulse" : "bg-gray-400"
              }`}
            ></div>
            <div>
              <span className="font-medium">
                {isPlaying ? "Currently Playing" : "Not Playing"}
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
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Currently Playing */}
      {realtimeData?.isPlaying && realtimeData.track && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <Radio className="w-5 h-5 animate-pulse" />
            <span className="font-semibold">Now Playing</span>
          </div>

          <div className="flex items-start gap-6">
            {realtimeData.track.albumImage && (
              <img
                src={realtimeData.track.albumImage}
                alt={realtimeData.track.album?.name || "Album"}
                className="w-24 h-24 rounded-lg shadow-lg flex-shrink-0"
              />
            )}

            <div className="flex-1 min-w-0">
              <h3 className="text-2xl font-bold mb-2 truncate">
                {realtimeData.track.name}
              </h3>
              <p className="text-white/90 mb-2 truncate">
                {realtimeData.track.artists?.map((a) => a.name).join(", ")}
              </p>

              {/* Mood Analysis */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                {realtimeData.mood?.primary_mood && (
                  <div className="bg-white/20 backdrop-blur rounded-lg p-3">
                    <div className="text-sm text-white/80">Mood</div>
                    <div className="text-lg font-bold">
                      {realtimeData.mood.primary_mood}
                    </div>
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
                {realtimeData.audioFeatures?.energy !== undefined && (
                  <div className="bg-white/20 backdrop-blur rounded-lg p-3">
                    <div className="text-sm text-white/80">Energy</div>
                    <div className="text-lg font-bold">
                      {Math.round(realtimeData.audioFeatures.energy * 100)}%
                    </div>
                  </div>
                )}
                {realtimeData.audioFeatures?.valence !== undefined && (
                  <div className="bg-white/20 backdrop-blur rounded-lg p-3">
                    <div className="text-sm text-white/80">Valence</div>
                    <div className="text-lg font-bold">
                      {Math.round(realtimeData.audioFeatures.valence * 100)}%
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {realtimeData.track.progress !== undefined &&
                realtimeData.track.duration && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{formatTime(realtimeData.track.progress)}</span>
                      <span>{formatTime(realtimeData.track.duration)}</span>
                    </div>
                    <div className="bg-white/20 rounded-full h-2">
                      <div
                        className="bg-white h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            (realtimeData.track.progress /
                              realtimeData.track.duration) *
                              100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

              {/* Device Info */}
              {realtimeData.device && (
                <div className="mt-3 text-sm text-white/70">
                  Playing on {realtimeData.device.name}
                </div>
              )}
            </div>
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
      {moodTimeline &&
        moodTimeline.timeline &&
        moodTimeline.timeline.length > 0 && (
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
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {days}d
                  </button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {moodTimeline.overall_statistics?.most_common_mood && (
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Dominant Mood
                  </div>
                  <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    {moodTimeline.overall_statistics.most_common_mood}
                  </div>
                </div>
              )}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Data Points
                </div>
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {moodTimeline.timeline.length}
                </div>
              </div>
              {moodTimeline.overall_statistics?.mood_diversity && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Mood Diversity
                  </div>
                  <div className="text-xl font-bold text-green-600 dark:text-green-400">
                    {moodTimeline.overall_statistics.mood_diversity}
                  </div>
                </div>
              )}
              <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Tracks
                </div>
                <div className="text-xl font-bold text-pink-600 dark:text-pink-400">
                  {moodTimeline.total_tracked || 0}
                </div>
              </div>
            </div>

            {/* Timeline Chart - Use aggregated features */}
            {moodTimeline.aggregatedFeatures && (
              <MoodLineChart
                data={moodTimeline.timeline.map((day, index) => ({
                  date: day.date,
                  valence:
                    moodTimeline.aggregatedFeatures.timeline.valence[index],
                  energy:
                    moodTimeline.aggregatedFeatures.timeline.energy[index],
                  danceability:
                    moodTimeline.aggregatedFeatures.timeline.danceability[
                      index
                    ],
                  acousticness:
                    moodTimeline.aggregatedFeatures.timeline.acousticness[
                      index
                    ],
                }))}
                showAggregated={true}
              />
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
                        width: `${Math.max(
                          (day.plays /
                            Math.max(
                              ...activityData.dailyActivity.map((d) => d.plays)
                            )) *
                            100,
                          5
                        )}%`,
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
              This page updates automatically every 10 seconds to show your
              current playback and mood analysis. Keep Spotify playing to see
              live updates and build your personalized mood timeline.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to format time
const formatTime = (ms) => {
  if (!ms || ms < 0) return "0:00";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export default RealtimeAnalytics;
