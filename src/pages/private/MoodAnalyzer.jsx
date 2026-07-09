import { useEffect, useState, useRef, Component } from 'react';
import { Heart, TrendingUp, Activity, BarChart3, RefreshCw, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import {
  getMoodTrends,
  getMoodDistribution,
  getMoodPatterns,
  getActivityAnalytics,
  getGenreAnalysis
} from '../../api/analytics';

class MoodAnalyzerErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('MoodAnalyzer crashed:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-4">
              The Mood Analyzer hit an unexpected error while rendering your data.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const SafeMoodChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400">
        No timeline data available
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 240 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 1]} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v) => `${Math.round(v * 100)}%`} />
          <Line type="monotone" dataKey="valence" stroke="#8b5cf6" dot={false} strokeWidth={2} name="Valence" />
          <Line type="monotone" dataKey="energy" stroke="#10b981" dot={false} strokeWidth={2} name="Energy" />
          <Line type="monotone" dataKey="danceability" stroke="#f59e0b" dot={false} strokeWidth={2} name="Danceability" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// static class strings (never dynamically built) so Tailwind's JIT/purge

const FEATURE_COLOR_CLASSES = {
  purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400' },
  green: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400' },
  cyan: { bg: 'bg-cyan-50 dark:bg-cyan-900/20', text: 'text-cyan-600 dark:text-cyan-400' },
};

const MOOD_COLORS = {
  Joyful: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200',
  Happy: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200',
  Excited: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200',
  Party: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-200',
  Energetic: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
  Motivated: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
  Melancholic: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  Sad: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  Dreamy: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200',
  Relaxed: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  Chill: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200',
  Focused: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-200',
  Romantic: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
  Angry: 'bg-red-200 text-red-900 dark:bg-red-900/40 dark:text-red-200',
  Ambient: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  Unknown: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
};

const MoodAnalyzer = () => {
  // `loading` = true only until we have data for the very first time ever.
  // after that, we never wipe the page again — updates happen "underneath"
  // the already-rendered content via `updating`.
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [moodTrends, setMoodTrends] = useState(null);
  const [moodDistribution, setMoodDistribution] = useState(null);
  const [moodPatterns, setMoodPatterns] = useState(null);
  const [activityData, setActivityData] = useState(null);
  const [genreData, setGenreData] = useState(null);
  const [timeRange, setTimeRange] = useState('medium_term');
  const [selectedDays, setSelectedDays] = useState(7);
  const [sectionErrors, setSectionErrors] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const pollingRef = useRef(null);
  const isMounted = useRef(true);
  const hasLoadedOnce = useRef(false);
  const isFetchingRef = useRef(false);
  // bumped on every fetch; lets a slow/late response detect it's been
  // superseded and bail out instead of overwriting fresher data on screen.
  const requestIdRef = useRef(0);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange, selectedDays]);

  // auto-refresh every 10 seconds. Skips a tick entirely if a fetch
  // (from polling, a filter change, or manual refresh) is already in
  // flight, so requests can never stack up behind a slow backend.
  useEffect(() => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(() => {
      if (isMounted.current && !isFetchingRef.current) fetchAllData(true);
    }, 10000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange, selectedDays]);

  const fetchAllData = async (silent = false) => {
    if (isFetchingRef.current) return; // never let requests overlap
    isFetchingRef.current = true;
    const myRequestId = ++requestIdRef.current;

    // only show the full skeleton the very first time. Every subsequent
    // fetch (filter change, poll, manual refresh) keeps the current
    // dashboard on screen and just shows a small "updating" indicator.
    if (!hasLoadedOnce.current) {
      setLoading(true);
    } else if (!silent) {
      setUpdating(true);
    }
    setSectionErrors({});

    const [trendsResult, distResult, patternResult, activityResult, genreResult] = await Promise.allSettled([
      getMoodTrends(50, selectedDays),
      getMoodDistribution(),
      getMoodPatterns(),
      getActivityAnalytics(),
      getGenreAnalysis(timeRange),
    ]);

    // bail out if unmounted, or if a newer request has since started
    // (e.g. the user changed a filter again while this call was pending).
    if (!isMounted.current || myRequestId !== requestIdRef.current) {
      isFetchingRef.current = false;
      return;
    }

    const newErrors = {};

    if (trendsResult.status === 'fulfilled') {
      setMoodTrends(trendsResult.value);
    } else {
      newErrors.trends = 'Mood trends unavailable';
      if (!hasLoadedOnce.current) setMoodTrends(null);
    }

    if (distResult.status === 'fulfilled') {
      setMoodDistribution(distResult.value);
    } else {
      newErrors.distribution = 'Distribution unavailable';
      if (!hasLoadedOnce.current) setMoodDistribution(null);
    }

    if (patternResult.status === 'fulfilled') {
      setMoodPatterns(patternResult.value);
    } else {
      newErrors.patterns = 'Patterns unavailable';
      if (!hasLoadedOnce.current) setMoodPatterns(null);
    }

    if (activityResult.status === 'fulfilled') {
      setActivityData(activityResult.value);
    } else {
      newErrors.activity = 'Activity data unavailable';
      if (!hasLoadedOnce.current) setActivityData(null);
    }

    if (genreResult.status === 'fulfilled') {
      setGenreData(genreResult.value);
    } else {
      newErrors.genre = 'Genre analysis unavailable';
      if (!hasLoadedOnce.current) setGenreData(null);
    }

    setSectionErrors(newErrors);
    setLastUpdated(new Date());

    const successCount = [trendsResult, distResult, patternResult, activityResult, genreResult]
      .filter(r => r.status === 'fulfilled').length;

    if (!silent && successCount === 0 && !hasLoadedOnce.current) {
      toast.error('Could not load mood data. Make sure you have listened to music recently.', { id: 'analytics-error' });
    }

    hasLoadedOnce.current = true;
    isFetchingRef.current = false;
    if (isMounted.current) {
      setLoading(false);
      setUpdating(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
    toast.success('Data refreshed!', { id: 'refresh' });
  };

  // build chart data from aggregatedFeatures.timeline
  const getChartData = () => {
    const tl = moodTrends?.aggregatedFeatures?.timeline;
    if (!tl?.dates?.length) return null;
    return tl.dates.map((date, i) => ({
      date,
      valence: tl.valence?.[i] ?? null,
      energy: tl.energy?.[i] ?? null,
      danceability: tl.danceability?.[i] ?? null,
    })).filter(d => d.valence !== null || d.energy !== null);
  };

  if (loading && !hasLoadedOnce.current) {
    return (
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mood Analyzer</h1>
          <p className="text-gray-600 dark:text-gray-400">Analyzing your music mood patterns...</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse mb-6" />
        <div className="grid md:grid-cols-2 gap-4">
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  const chartData = getChartData();

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold mb-1">Mood Analyzer</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Emotional patterns in your listening history · auto-refreshes every 10s
          </p>
        </div>
        <div className="flex items-center gap-3">
          {updating && !refreshing && (
            <span className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Updating...
            </span>
          )}
          {lastUpdated && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5">
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

      {Object.keys(sectionErrors).length > 0 && Object.keys(sectionErrors).length < 5 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 text-sm text-yellow-800 dark:text-yellow-200">
          Some sections unavailable: {Object.values(sectionErrors).join(' · ')}
        </div>
      )}

      {!moodTrends && !moodDistribution && !activityData && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
          <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No Mood Data Yet</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Listen to music on Spotify and come back. Your mood patterns will appear here as you listen.
          </p>
        </div>
      )}

      {moodTrends && (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white shadow-lg">
            <Heart className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">
              {moodTrends.overallMood || 'Unknown'}
            </div>
            <div className="text-sm opacity-90">Overall Mood</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl p-6 text-white shadow-lg">
            <TrendingUp className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">
              {moodTrends.statistics?.totalTracks ?? 0}
            </div>
            <div className="text-sm opacity-90">Tracks Analyzed</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-6 text-white shadow-lg">
            <Activity className="w-8 h-8 mb-3 opacity-80" />
            <div className="text-3xl font-bold mb-1">
              {moodTrends.statistics?.uniqueMoods ?? 0}
            </div>
            <div className="text-sm opacity-90">Unique Moods</div>
          </div>
        </div>
      )}

      {moodTrends?.aggregatedFeatures && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            Audio Features Over Time
            {moodTrends.aggregatedFeatures?.summary && (
              <span className="text-xs font-normal text-gray-500 ml-2">
                (based on {moodTrends.statistics?.totalTracks} tracks)
              </span>
            )}
          </h2>

          {moodTrends.aggregatedFeatures.summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Avg Valence', key: 'avgValence', classes: FEATURE_COLOR_CLASSES.purple },
                { label: 'Avg Energy', key: 'avgEnergy', classes: FEATURE_COLOR_CLASSES.green },
                { label: 'Avg Danceability', key: 'avgDanceability', classes: FEATURE_COLOR_CLASSES.orange },
                { label: 'Avg Acousticness', key: 'avgAcousticness', classes: FEATURE_COLOR_CLASSES.cyan },
              ].map(({ label, key, classes }) => (
                <div key={key} className={`${classes.bg} rounded-lg p-3`}>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{label}</div>
                  <div className={`text-2xl font-bold ${classes.text}`}>
                    {Math.round((moodTrends.aggregatedFeatures.summary[key] ?? 0) * 100)}%
                  </div>
                </div>
              ))}
            </div>
          )}

          {chartData ? (
            <SafeMoodChart data={chartData} />
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400">
              Not enough timeline data yet — keep listening!
            </div>
          )}

          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            💡 Shows audio feature patterns from your listening history over time.
          </p>
        </div>
      )}

      {moodTrends?.trends && moodTrends.trends.length > 0 && (() => {
        const moodCounts = {};
        moodTrends.trends.forEach(day => {
          if (day.moods) Object.entries(day.moods).forEach(([m, c]) => { moodCounts[m] = (moodCounts[m] || 0) + c; });
          if (day.dominantMood) moodCounts[day.dominantMood] = (moodCounts[day.dominantMood] || 0) + 1;
        });
        const sorted = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]).slice(0, 15);
        if (!sorted.length) return null;
        const max = sorted[0][1];
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Mood Cloud</h2>
            <div className="flex flex-wrap gap-3 items-center justify-center min-h-[160px]">
              {sorted.map(([mood, count]) => {
                const size = 0.875 + (count / max) * 1.4;
                const colorClass = MOOD_COLORS[mood] || MOOD_COLORS.Unknown;
                return (
                  <span
                    key={mood}
                    className={`px-4 py-2 rounded-full font-medium cursor-default hover:scale-110 transition-transform ${colorClass}`}
                    style={{ fontSize: `${size}rem` }}
                    title={`${count} plays`}
                  >
                    {mood}
                  </span>
                );
              })}
            </div>
          </div>
        );
      })()}

      {moodDistribution?.distribution && Object.keys(moodDistribution.distribution).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Mood Distribution</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(moodDistribution.distribution)
              // backend sends each entry as either a plain number (legacy)
              // or an object { count, percentage, avg_confidence } (current
              // mL service / fallback shape). Normalize both to primitives
              // before sorting/rendering so we never hand React an object
              // as a child.
              .map(([mood, entry]) => [
                mood,
                typeof entry === 'object' && entry !== null ? (entry.count ?? 0) : (entry ?? 0),
                typeof entry === 'object' && entry !== null ? entry.percentage : null,
                typeof entry === 'object' && entry !== null ? entry.avg_confidence : null,
              ])
              .sort((a, b) => b[1] - a[1])
              .map(([mood, count, backendPct, avgConfidence]) => {
                const pct = backendPct != null
                  ? backendPct
                  : (moodDistribution.totalTracks > 0
                      ? Math.round((count / moodDistribution.totalTracks) * 100)
                      : 0);
                return (
                  <div key={mood} className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-4">
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">{count}</div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{mood}</div>
                    <div className="text-xs text-gray-500 mt-1">{pct}% of listens</div>
                    {avgConfidence != null && (
                      <div className="text-xs text-gray-400 mt-0.5">{Math.round(avgConfidence * 100)}% confidence</div>
                    )}
                  </div>
                );
              })}
          </div>
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-gray-600 dark:text-gray-400">Total Tracks:</span> <span className="font-bold ml-1">{moodDistribution.totalTracks ?? 0}</span></div>
            <div><span className="text-gray-600 dark:text-gray-400">Mood Tags:</span> <span className="font-bold ml-1">{moodDistribution.totalMoodTags ?? 0}</span></div>
            <div><span className="text-gray-600 dark:text-gray-400">Avg Moods/Track:</span> <span className="font-bold ml-1">{(moodDistribution.avgMoodsPerTrack ?? 0).toFixed(2)}</span></div>
            <div><span className="text-gray-600 dark:text-gray-400">Diversity:</span> <span className="font-bold ml-1">{moodDistribution.moodDiversity ?? 0} moods</span></div>
          </div>
        </div>
      )}

      {moodPatterns?.patterns?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Mood Co-occurrence Patterns</h2>
          <div className="space-y-3">
            {moodPatterns.patterns.slice(0, 10).map((pattern, i) => {
              // mL service returns { moods: [mood1, mood2], co_occurrence_count,
              // co_occurrence_rate }, not { mood1, mood2, count, percentage }.
              // support both shapes so this survives future backend tweaks.
              const [mood1, mood2] = pattern.moods ?? [pattern.mood1, pattern.mood2];
              const count = pattern.co_occurrence_count ?? pattern.count ?? 0;
              const rate = pattern.co_occurrence_rate ?? pattern.percentage ?? 0;
              return (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">#{i + 1}</span>
                    <div>
                      <div className="font-semibold">{mood1} + {mood2}</div>
                      <div className="text-sm text-gray-500">Appear together in {count} tracks</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {Number(rate ?? 0).toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">co-occurrence</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activityData && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Listening by Hour</h2>
            <div className="space-y-2">
              {(activityData.hourlyActivity || []).map((item) => {
                const max = Math.max(...(activityData.hourlyActivity || []).map(h => h.plays), 1);
                return (
                  <div key={item.hour} className="flex items-center gap-3">
                    <span className="text-sm w-16 text-gray-600 dark:text-gray-400">{item.hour}</span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${(item.plays / max) * 100}%` }} />
                    </div>
                    <span className="text-sm w-8 text-right text-gray-600 dark:text-gray-400">{item.plays}</span>
                  </div>
                );
              })}
            </div>
            {activityData.insights?.peakHour && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-800 dark:text-blue-200">
                <strong>Peak Hour:</strong> {activityData.insights.peakHour}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Listening by Day</h2>
            <div className="space-y-2">
              {(activityData.dailyActivity || []).map((item) => {
                const max = Math.max(...(activityData.dailyActivity || []).map(d => d.plays), 1);
                return (
                  <div key={item.day} className="flex items-center gap-3">
                    <span className="text-sm w-12 text-gray-600 dark:text-gray-400">{item.day}</span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(item.plays / max) * 100}%` }} />
                    </div>
                    <span className="text-sm w-8 text-right text-gray-600 dark:text-gray-400">{item.plays}</span>
                  </div>
                );
              })}
            </div>
            {activityData.insights?.peakDay && (
              <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-sm text-purple-800 dark:text-purple-200">
                <strong>Peak Day:</strong> {activityData.insights.peakDay}
              </div>
            )}
          </div>
        </div>
      )}

      {genreData?.allGenres?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Top Genres</h2>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {genreData.source === 'recently_played'
                ? 'Based on your recent plays'
                : 'Based on Spotify\'s top artists for this range'}
            </span>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {genreData.allGenres.slice(0, 10).map((item) => (
              <div key={item.genre} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="font-medium capitalize">{item.genre}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{item.percentage}%</span>
                  <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activityData?.insights && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Listening Insights</h2>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{activityData.insights.totalPlays ?? 0}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Plays</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{activityData.insights.uniqueArtists ?? 0}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Unique Artists</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">{activityData.insights.averagePlaysPerDay ?? 0}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Avg. Plays/Day</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MoodAnalyzerWithBoundary = () => (
  <MoodAnalyzerErrorBoundary>
    <MoodAnalyzer />
  </MoodAnalyzerErrorBoundary>
);

export default MoodAnalyzerWithBoundary;