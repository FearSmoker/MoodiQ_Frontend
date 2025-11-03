import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Music, Sparkles, Activity, TrendingUp, 
  Heart, Share2, Eye, ArrowRight, Zap, Target, BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  getDashboardOverview, 
  getNowPlaying, 
  getMoodTrends 
} from '../../api/analytics';
import { getPlaylistMood } from '../../api/playlists';
import { sharePlaylist } from '../../api/user';

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [nowPlaying, setNowPlaying] = useState(null);
  const [moodTrends, setMoodTrends] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [analyzedMood, setAnalyzedMood] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    initDashboard();
    checkAuthCallbacks();
    
    // Poll now playing every 10 seconds
    const interval = setInterval(fetchNowPlaying, 10000);
    return () => clearInterval(interval);
  }, []);

  const checkAuthCallbacks = () => {
    const error = searchParams.get('error');
    const success = searchParams.get('success');
    const message = searchParams.get('message');

    if (success) {
      let successMessage = message || 'Operation successful';
      if (success === 'youtube_linked') {
        successMessage = 'YouTube Music account linked successfully!';
      }
      toast.success(successMessage, { duration: 4000, id: 'auth-success' });
      window.history.replaceState({}, '', '/dashboard');
    }

    if (error) {
      const errorMessages = {
        'youtube_denied': 'You cancelled YouTube authorization',
        'youtube_no_code': 'YouTube authorization failed',
        'user_not_found': 'Session expired. Please login again.'
      };
      const errorMessage = errorMessages[error] || message || 'An error occurred';
      toast.error(errorMessage, { duration: 5000, id: 'auth-error' });
      window.history.replaceState({}, '', '/dashboard');
    }
  };

  const initDashboard = async () => {
    try {
      setLoading(true);
      console.log('📊 Dashboard: Initializing...');
      
      const [overview, playing, trends] = await Promise.all([
        getDashboardOverview(),
        getNowPlaying().catch(() => null),
        getMoodTrends(50).catch(() => null)
      ]);

      console.log('✅ Dashboard: Data loaded successfully');
      setDashboardData(overview);
      setNowPlaying(playing);
      setMoodTrends(trends);
    } catch (error) {
      console.error('❌ Dashboard: Failed to load:', error);
      
      if (!error.response || error.response.status !== 401) {
        toast.error('Failed to load dashboard data', { id: 'dashboard-error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchNowPlaying = async () => {
    try {
      const playing = await getNowPlaying();
      setNowPlaying(playing);
    } catch (error) {
      console.log('Could not fetch now playing');
    }
  };

  const handlePlaylistSelect = async (playlist) => {
    setSelectedPlaylist(playlist);
    setAnalyzing(true);
    
    try {
      console.log('🎵 Analyzing playlist:', playlist.name);
      const moodData = await getPlaylistMood(playlist.id);
      setAnalyzedMood(moodData);
      console.log('✅ Playlist analyzed');
    } catch (error) {
      console.error('❌ Failed to analyze:', error);
      toast.error('Failed to analyze playlist', { id: 'analyze-error' });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleShare = async () => {
    if (!analyzedMood || !selectedPlaylist) return;
    
    try {
      const result = await sharePlaylist(
        selectedPlaylist.id,
        analyzedMood,
        selectedPlaylist.name,
        selectedPlaylist.images?.[0]?.url
      );
      
      await navigator.clipboard.writeText(result.fullUrl);
      toast.success('Share link copied to clipboard!', { id: 'share-success' });
    } catch (error) {
      console.error('Failed to share:', error);
      toast.error('Failed to create share link', { id: 'share-error' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Failed to load dashboard</p>
          <button 
            onClick={initDashboard}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { user, stats, playlists, topArtists, topTracks, topGenres } = dashboardData;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Welcome back, {user.displayName}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-green-800 dark:text-green-200">Connected</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Music} label="Playlists" value={stats.totalPlaylists} color="indigo" />
        <StatCard icon={Heart} label="Saved Tracks" value={stats.totalTracks} color="pink" />
        <StatCard icon={Share2} label="Shares" value={stats.totalShares} color="green" />
        <StatCard icon={Eye} label="Total Views" value={stats.totalShareViews} color="purple" />
      </div>

      {/* Now Playing */}
      {nowPlaying?.isPlaying && nowPlaying.track && (
        <NowPlayingCard nowPlaying={nowPlaying} />
      )}

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Playlists */}
        <PlaylistsSection 
          playlists={playlists}
          selectedPlaylist={selectedPlaylist}
          onSelectPlaylist={handlePlaylistSelect}
        />

        {/* Mood Analysis */}
        <MoodAnalysisSection
          analyzing={analyzing}
          analyzedMood={analyzedMood}
          selectedPlaylist={selectedPlaylist}
          onShare={handleShare}
        />
      </div>

      {/* Top Artists & Tracks */}
      <div className="grid md:grid-cols-2 gap-6">
        <TopArtistsSection artists={topArtists} />
        <TopTracksSection tracks={topTracks} />
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-4">
        <QuickActionCard 
          icon={Sparkles}
          title="Generate Playlist"
          description="Create mood-based playlists"
          to="/mood-generator"
          color="purple"
        />
        <QuickActionCard 
          icon={Activity}
          title="Analytics"
          description="Detailed listening insights"
          to="/realtime"
          color="blue"
        />
        <QuickActionCard 
          icon={Target}
          title="Recommendations"
          description="Discover new music"
          to="/recommendations"
          color="green"
        />
        <QuickActionCard 
          icon={BarChart3}
          title="Flow Optimizer"
          description="Perfect transitions"
          to="/flow-optimizer"
          color="pink"
        />
      </div>
    </div>
  );
};

// Sub-components
const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    indigo: 'from-indigo-500 to-purple-500',
    pink: 'from-pink-500 to-rose-500',
    green: 'from-green-500 to-emerald-500',
    purple: 'from-purple-500 to-pink-500',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-xl p-4 text-white shadow-lg`}>
      <Icon className="w-6 h-6 mb-2 opacity-80" />
      <div className="text-3xl font-bold mb-1">{value?.toLocaleString() || 0}</div>
      <div className="text-sm opacity-90">{label}</div>
    </div>
  );
};

const NowPlayingCard = ({ nowPlaying }) => (
  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
    <div className="flex items-center gap-2 mb-3">
      <Music className="w-5 h-5 animate-pulse" />
      <span className="font-semibold">Now Playing</span>
    </div>
    <div className="flex items-center gap-4">
      {nowPlaying.track.album?.images?.[0]?.url && (
        <img 
          src={nowPlaying.track.album.images[0].url} 
          alt={nowPlaying.track.album.name}
          className="w-20 h-20 rounded-lg shadow-lg"
        />
      )}
      <div className="flex-1">
        <h3 className="text-xl font-bold mb-1">{nowPlaying.track.name}</h3>
        <p className="text-white/80">
          {nowPlaying.track.artists.map(a => a.name).join(', ')}
        </p>
        <div className="mt-2 flex items-center gap-3">
          {nowPlaying.mood?.mood && (
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
              🎭 {nowPlaying.mood.mood}
            </span>
          )}
          {nowPlaying.device?.name && (
            <span className="text-sm text-white/60">
              Playing on {nowPlaying.device.name}
            </span>
          )}
        </div>
      </div>
    </div>
    {nowPlaying.track.progressPercentage && (
      <div className="mt-4 bg-white/20 rounded-full h-1">
        <div 
          className="bg-white h-1 rounded-full transition-all"
          style={{ width: `${nowPlaying.track.progressPercentage}%` }}
        />
      </div>
    )}
  </div>
);

const PlaylistsSection = ({ playlists, selectedPlaylist, onSelectPlaylist }) => (
  <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Music className="w-5 h-5 text-indigo-600" />
        Your Playlists
      </h2>
      <span className="text-sm text-gray-500">{playlists?.length || 0}</span>
    </div>
    
    <div className="space-y-2 max-h-[600px] overflow-y-auto">
      {playlists?.map(playlist => (
        <button
          key={playlist.id}
          onClick={() => onSelectPlaylist(playlist)}
          className={`w-full p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left ${
            selectedPlaylist?.id === playlist.id 
              ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500' 
              : ''
          }`}
        >
          <div className="flex items-center gap-3">
            {playlist.images?.[0]?.url ? (
              <img 
                src={playlist.images[0].url} 
                alt={playlist.name}
                className="w-12 h-12 rounded"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                <Music className="w-6 h-6 text-gray-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{playlist.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {playlist.tracksCount} tracks
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  </div>
);

const MoodAnalysisSection = ({ analyzing, analyzedMood, selectedPlaylist, onShare }) => (
  <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-purple-600" />
        Mood Analysis
      </h2>
      {analyzedMood && (
        <div className="flex gap-2">
          <button
            onClick={onShare}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <Link
            to="/flow-optimizer"
            state={{ 
              tracks: analyzedMood.tracks,
              playlistId: selectedPlaylist?.id,
              playlistName: selectedPlaylist?.name 
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            <Zap className="w-4 h-4" />
            Optimize
          </Link>
        </div>
      )}
    </div>

    {analyzing && (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Analyzing playlist mood...</p>
      </div>
    )}

    {!analyzing && !analyzedMood && (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Sparkles className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg">Select a playlist to analyze its mood</p>
        <p className="text-sm mt-2 text-gray-400">AI-powered emotional analysis</p>
      </div>
    )}

    {analyzedMood && (
      <div className="space-y-6">
        <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
          <h3 className="font-semibold mb-2">Overall Mood</h3>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {analyzedMood.overallMood}
          </p>
        </div>

        {analyzedMood.moodDistribution && (
          <div className="space-y-3">
            <h3 className="font-semibold">Mood Distribution</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(analyzedMood.moodDistribution).map(([mood, count]) => (
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

        <div className="space-y-2">
          <h3 className="font-semibold">Track Moods</h3>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {analyzedMood.tracks?.slice(0, 10).map((track, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-700"
              >
                <span className="text-sm truncate flex-1">{track.name}</span>
                <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded ml-2">
                  {track.mood}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
  </div>
);

const TopArtistsSection = ({ artists }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
      <TrendingUp className="w-5 h-5 text-green-600" />
      Top Artists
    </h2>
    <div className="space-y-3">
      {artists?.slice(0, 5).map((artist, index) => (
        <div key={artist.id} className="flex items-center gap-3">
          <span className="text-lg font-bold text-gray-400 w-6">#{index + 1}</span>
          {artist.images?.[0]?.url && (
            <img 
              src={artist.images[0].url} 
              alt={artist.name}
              className="w-12 h-12 rounded-full"
            />
          )}
          <div className="flex-1">
            <div className="font-medium">{artist.name}</div>
            <div className="text-sm text-gray-500">
              {artist.genres?.slice(0, 2).join(', ')}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const TopTracksSection = ({ tracks }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
      <Music className="w-5 h-5 text-pink-600" />
      Top Tracks
    </h2>
    <div className="space-y-3">
      {tracks?.slice(0, 5).map((track, index) => (
        <div key={track.id} className="flex items-center gap-3">
          <span className="text-lg font-bold text-gray-400 w-6">#{index + 1}</span>
          {track.album?.images?.[0]?.url && (
            <img 
              src={track.album.images[0].url} 
              alt={track.album.name}
              className="w-12 h-12 rounded"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{track.name}</div>
            <div className="text-sm text-gray-500 truncate">
              {track.artists?.map(a => a.name).join(', ')}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const QuickActionCard = ({ icon: Icon, title, description, to, color }) => {
  const colors = {
    purple: 'from-purple-500 to-pink-500',
    blue: 'from-blue-500 to-indigo-500',
    green: 'from-green-500 to-emerald-500',
    pink: 'from-pink-500 to-rose-500',
  };

  return (
    <Link 
      to={to}
      className="group bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
    >
      <div className={`w-12 h-12 bg-gradient-to-br ${colors[color]} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="font-bold mb-1">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      <ArrowRight className="w-5 h-5 mt-3 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
    </Link>
  );
};

export default Dashboard;