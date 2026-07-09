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
  Waves,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
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

  const [liveDataPoints, setLiveDataPoints] = useState([]);
  const MAX_LIVE_POINTS = 60; // keep last 60 data points (~10 min at 10s intervals)

  const [localProgress, setLocalProgress] = useState(0);
  const [localDuration, setLocalDuration] = useState(0);
  const lastProgressRef = useRef(0); // for seek detection

  const isMounted = useRef(true);
  const lastTrackIdRef = useRef(null);
  const timelinePollingRef = useRef(null);
  const activityPollingRef = useRef(null);
  const livePollingRef = useRef(null);
  const lastSocketUpdateRef = useRef(0); // timestamp of last socket update

  const appendLivePoint = (data) => {
    if (!data) return;
    const playing = data?.isPlaying || data?.is_playing || false;
    const trackId = data?.track?.id || null;
    const now = Date.now();
    const timeLabel = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // pull audio features from wherever they live in the response
    const af = data.audioFeatures ||
               data.audio_features ||
               data.track?.features ||
               data.features || {};

    setLiveDataPoints(prev => {
      // detect song change → insert gap marker
      const needsGap = prev.length > 0 &&
        lastTrackIdRef.current !== null &&
        trackId !== null &&
        trackId !== lastTrackIdRef.current;

      const gapEntry = needsGap ? [{ time: now, label: timeLabel, gap: true }] : [];

      if (!playing) {
        const wasPlaying = prev.length > 0 && !prev[prev.length - 1].gap;
        const stopGap = wasPlaying ? [{ time: now, label: timeLabel, gap: true }] : [];
        return [...prev, ...stopGap].slice(-MAX_LIVE_POINTS);
      }

      const newPoint = {
        time: now,
        label: timeLabel,
        valence: af.valence != null ? Math.round(af.valence * 100) : null,
        energy: af.energy != null ? Math.round(af.energy * 100) : null,
        mood: data.mood?.primary_mood || data.mood?.fused_mood || null,
        trackName: data.track?.name || null,
      };

      return [...prev, ...gapEntry, newPoint].slice(-MAX_LIVE_POINTS);
    });

    if (trackId) lastTrackIdRef.current = trackId;
  };

  // synchronize local progress with realtimeData updates (with seek detection)
  useEffect(() => {
    if (realtimeData?.track) {
      const newProgress = realtimeData.track.progress || 0;
      const predicted = lastProgressRef.current;
      
      if (Math.abs(newProgress - predicted) > 3000) {
        setLocalProgress(newProgress);
      }
      lastProgressRef.current = newProgress;
      setLocalDuration(realtimeData.track.duration || 0);
    } else {
      setLocalProgress(0);
      setLocalDuration(0);
      lastProgressRef.current = 0;
    }
  }, [realtimeData]);

  useEffect(() => {
    if (!isPlaying) return;
    const progressInterval = setInterval(() => {
      setLocalProgress(prev => {
        const next = prev + 1000;
        lastProgressRef.current = next;
        if (next >= localDuration) {
          clearInterval(progressInterval);
          return prev;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(progressInterval);
  }, [isPlaying, localDuration]);

  useEffect(() => {
    isMounted.current = true;
    fetchData();

    // listen to real-time socket updates via CustomEvent (ws-message)
    const handleWsMessage = (event) => {
      const message = event.detail;
      if (message.type === 'now_playing_update' && isMounted.current) {
        const data = message.data;
        const playing = data?.isPlaying || false;
        const trackId = data?.track?.id || null;

        lastSocketUpdateRef.current = Date.now();

        setRealtimeData(data);
        setIsPlaying(playing);
        setLastUpdate(new Date());

        // append to live graph
        appendLivePoint(data);
      }
    };
    window.addEventListener('ws-message', handleWsMessage);

    // refresh mood timeline every 10 seconds
    timelinePollingRef.current = setInterval(() => {
      if (isMounted.current) fetchMoodTimeline(selectedDays);
    }, 10000);

    // refresh activity analytics (Peak Hours / Weekly Pattern) every 10 seconds,
    // same cadence as the mood timeline, so they no longer need a manual refresh.
    activityPollingRef.current = setInterval(() => {
      if (isMounted.current) fetchActivityData();
    }, 10000);

    // fallback live-graph polling every 5 seconds
    // (fires when socket hasn't updated in the last 4s)
    livePollingRef.current = setInterval(async () => {
      if (!isMounted.current) return;
      const sinceLastSocket = Date.now() - lastSocketUpdateRef.current;
      if (sinceLastSocket < 4000) return; // socket is fresh — skip REST call
      try {
        const data = await getRealtimeAnalysis();
        if (!isMounted.current) return;
        if (data) {
          setRealtimeData(data);
          setIsPlaying(data.isPlaying || false);
          setLastUpdate(new Date());
          appendLivePoint(data);
        }
      } catch {
        // silent — don't spam errors on polling failure
      }
    }, 5000);

    return () => {
      isMounted.current = false;
      window.removeEventListener('ws-message', handleWsMessage);
      if (timelinePollingRef.current) clearInterval(timelinePollingRef.current);
      if (activityPollingRef.current) clearInterval(activityPollingRef.current);
      if (livePollingRef.current) clearInterval(livePollingRef.current);
    };
  }, []);

  useEffect(() => {
    fetchMoodTimeline(selectedDays);
  }, [selectedDays]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [realtime, timeline, activity] = await Promise.all([
        getRealtimeAnalysis().catch(() => ({ isPlaying: false })),
        getMoodTimeline(selectedDays).catch(() => null),
        getActivityAnalytics().catch(() => null),
      ]);
      if (!isMounted.current) return;
      setRealtimeData(realtime);
      setMoodTimeline(timeline);
      setActivityData(activity);
      const playing = realtime?.isPlaying || false;
      setIsPlaying(playing);
      setLastUpdate(new Date());

      // ✅ Seed the live graph from the initial REST fetch
      if (realtime && playing) {
        appendLivePoint(realtime);
      }
    } catch (error) {
      if (!error.response || error.response.status !== 401) {
        toast.error("Failed to load real-time analytics", { id: "analytics-error" });
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const fetchMoodTimeline = async (days) => {
    try {
      const data = await getMoodTimeline(days);
      if (!isMounted.current) return;
      setMoodTimeline(data);
    } catch (error) {
      console.warn("Failed to fetch mood timeline:", error.message);
    }
  };

  // mirrors fetchMoodTimeline — keeps Peak Hours / Weekly Pattern live without
  // requiring a manual page refresh or a full-page Loader flash.
  const fetchActivityData = async () => {
    try {
      const data = await getActivityAnalytics();
      if (!isMounted.current) return;
      setActivityData(data);
    } catch (error) {
      console.warn("Failed to fetch activity analytics:", error.message);
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Activity className="w-8 h-8 text-blue-600" />
          Real-time Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your listening patterns and mood changes in real-time
        </p>
      </div>

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

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Waves className="w-5 h-5 text-indigo-600 animate-pulse" />
            Live Mood Graph
          </h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {liveDataPoints.filter(p => !p.gap).length > 0
              ? `${liveDataPoints.filter(p => !p.gap).length} data points`
              : 'Waiting for playback...'}
          </span>
        </div>

        {liveDataPoints.filter(p => !p.gap).length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={liveDataPoints} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const d = payload[0]?.payload;
                  if (d?.gap) return null;
                  return (
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-xs shadow-lg">
                      <div className="font-bold text-gray-800 dark:text-gray-200 mb-1">{d.trackName || 'Unknown'}</div>
                      {d.mood && <div className="text-indigo-600">Mood: {d.mood}</div>}
                      {d.valence != null && <div className="text-purple-600">Valence: {d.valence}%</div>}
                      {d.energy != null && <div className="text-green-600">Energy: {d.energy}%</div>}
                    </div>
                  );
                }}
              />
              <Line
                type="monotone"
                dataKey="valence"
                stroke="#7c3aed"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                name="Valence"
              />
              <Line
                type="monotone"
                dataKey="energy"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                name="Energy"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-36 text-gray-400 dark:text-gray-500">
            <Waves className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm">Graph starts automatically when music plays</p>
            <p className="text-xs mt-1 opacity-70">Line breaks indicate song changes or pauses</p>
          </div>
        )}

        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="inline-block w-4 h-0.5 bg-purple-600 rounded" />
            Valence (positivity)
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-4 h-0.5 bg-green-500 rounded" />
            Energy (intensity)
          </span>
          <span className="text-gray-400">— line breaks = song change or pause</span>
        </div>
      </div>

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

              {localDuration > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1 font-mono">
                    <span>{formatTime(localProgress)}</span>
                    <span>{formatTime(localDuration)}</span>
                  </div>
                  <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-white h-full rounded-full transition-all duration-1000 ease-linear"
                      style={{
                        width: `${localDuration > 0 ? Math.min((localProgress / localDuration) * 100, 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {realtimeData.device && (
                <div className="mt-3 text-sm text-white/70">
                  Playing on {realtimeData.device.name}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!realtimeData?.isPlaying && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
          <Music className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-bold mb-2">No Track Playing</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Start playing music on Spotify to see real-time analytics
          </p>
        </div>
      )}

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

            {moodTimeline?.aggregatedFeatures?.timeline?.dates?.length > 0 && (
              <MoodLineChart
                data={moodTimeline.timeline.map((day, index) => ({
                  date: day.date,
                  valence:
                    moodTimeline.aggregatedFeatures.timeline.valence?.[index] ?? null,
                  energy:
                    moodTimeline.aggregatedFeatures.timeline.energy?.[index] ?? null,
                  danceability:
                    moodTimeline.aggregatedFeatures.timeline.danceability?.[index] ?? null,
                  acousticness:
                    moodTimeline.aggregatedFeatures.timeline.acousticness?.[index] ?? null,
                }))}
                showAggregated={true}
              />
            )}
          </div>
        )}

      {activityData && (
        <div className="grid md:grid-cols-2 gap-6">
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

      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <Zap className="w-8 h-8 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-bold mb-2">Real-time Insights</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Updates via WebSocket whenever your music changes. The live graph
              above plots valence and energy in real-time — line breaks indicate
              song changes or pauses. Historical timeline and activity insights
              refresh automatically every 10 seconds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// helper function to format time
const formatTime = (ms) => {
  if (!ms || ms < 0) return "0:00";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export default RealtimeAnalytics;