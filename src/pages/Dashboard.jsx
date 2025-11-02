import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { usePlaylistStore } from '../store/playlistStore';
import { useSocket } from '../hooks/useSocket';
import MoodLineChart from '../components/charts/MoodLineChart';
import MoodCloud from '../components/charts/MoodCloud';
import { Loader } from '../components/ui/Loader';
import TransferModal from '../components/transfer/TransferModal';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Share2, Sparkles } from 'lucide-react';

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const { playlists, fetchPlaylists, analyzePlaylist, moodData, loading } = usePlaylistStore();
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [stats, setStats] = useState(null);

  // Connect to WebSocket
  const { isConnected } = useSocket();

  useEffect(() => {
    fetchPlaylists();
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const { data } = await api.get('/user/stats');
      setStats(data.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handlePlaylistClick = async (playlist) => {
    setSelectedPlaylistId(playlist.id);
    try {
      await analyzePlaylist(playlist.id);
    } catch (err) {
      console.error('Analysis failed:', err);
    }
  };

  const handleShare = async () => {
    if (!moodData) return;

    try {
      const { data } = await api.post('/user/share', {
        playlistId: selectedPlaylistId,
        moodData: moodData,
        playlistName: moodData.playlistName || 'Shared Playlist',
      });

      const shareUrl = `${window.location.origin}/share/${data.shareId}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
    } catch (err) {
      console.error('Failed to share:', err);
      toast.error('Failed to create share link');
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user?.displayName}!</h1>
          <div className="flex items-center gap-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        
        {/* Stats */}
        {stats && (
          <div className="flex gap-4 text-sm">
            <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow">
              <div className="text-gray-500 dark:text-gray-400">Shares</div>
              <div className="text-2xl font-bold">{stats.sharesCount}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow">
              <div className="text-gray-500 dark:text-gray-400">Total Views</div>
              <div className="text-2xl font-bold">{stats.totalViews}</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Playlist List */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Your Playlists</h2>
          {loading && !playlists.length ? (
            <Loader />
          ) : (
            <ul className="space-y-2 max-h-96 overflow-y-auto">
              {playlists.map((pl) => (
                <li
                  key={pl.id}
                  onClick={() => handlePlaylistClick(pl)}
                  className={`p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                    selectedPlaylistId === pl.id ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {pl.images?.[0]?.url && (
                      <img 
                        src={pl.images[0].url} 
                        alt={pl.name}
                        className="w-12 h-12 rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{pl.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {pl.tracks?.total || 0} tracks
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Mood Visualization */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow min-h-[400px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Mood Analysis</h2>
            {moodData && (
              <div className="flex gap-2">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Share2 size={16} />
                  Share
                </button>
              </div>
            )}
          </div>

          {loading && <Loader />}
          
          {!loading && !moodData && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Sparkles size={48} className="mb-4 opacity-50" />
              <p>Select a playlist to analyze its mood</p>
            </div>
          )}
          
          {moodData && (
            <div className="space-y-6">
              <MoodLineChart data={moodData.tracks} />
              
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/optimize"
                  state={{ 
                    tracks: moodData.tracks,
                    playlistId: selectedPlaylistId,
                    playlistName: moodData.playlistName 
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  <Sparkles size={18} />
                  Optimize Flow
                </Link>
                
                <button
                  onClick={() => setShowTransferModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Transfer Playlist
                </button>
              </div>

              {/* Mood Distribution */}
              {moodData.moodDistribution && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <h3 className="font-semibold mb-2">Mood Distribution</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(moodData.moodDistribution).map(([mood, count]) => (
                      <span
                        key={mood}
                        className="px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 rounded-full text-sm"
                      >
                        {mood}: {count}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mood Cloud */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MoodCloud moodData={moodData?.tracks} />
      </div>

      {/* Transfer Modal */}
      {showTransferModal && moodData && (
        <TransferModal
          playlistTracks={moodData.tracks}
          playlistName={moodData.playlistName || 'Moodify Mix'}
          onClose={() => setShowTransferModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;