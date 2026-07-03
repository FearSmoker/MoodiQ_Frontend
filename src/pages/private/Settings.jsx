import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useServiceAuth } from '../../contexts/ServiceAuthContext';
import { 
  User, 
  Music, 
  Bell, 
  Palette, 
  Shield, 
  Youtube, 
  Apple,
  CheckCircle,
  XCircle,
  Loader2,
  Brain,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { 
  getPreferences, 
  updatePreferences,
  getUserStats,
  getUserPersonalizedModel,
  triggerModelRetrain,
  resetUserPersonalization
} from '../../api/user';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, refreshUser } = useAuth();
  const { linkedServices, linkYouTube, unlinkService, isServiceLinked, loading: serviceLoading } = useServiceAuth();
  
  // Initialize to null — never save until API data is loaded
  const [preferences, setPreferences] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [mlModel, setMlModel] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [retraining, setRetraining] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetchPreferences();
    fetchUserStats();
    fetchMLModel();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      console.log('⚙️ Fetching user preferences...');
      const data = await getPreferences();
      // Merge API data with sensible defaults — only after real API load
      setPreferences({
        moodSensitivity: 0.5,
        autoOptimizeFlow: false,
        defaultPlaylistPrivacy: 'public',
        notifications: true,
        ...(data.preferences || {}),
      });
      console.log('✅ Preferences loaded');
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
      toast.error('Failed to load preferences', { id: 'pref-error' });
      // Leave as null so the form stays disabled
    } finally {
      setLoading(false);
    }
  };


  const fetchUserStats = async () => {
    try {
      setLoadingStats(true);
      console.log('📊 Fetching user stats...');
      const data = await getUserStats();
      setUserStats(data.stats);
      console.log('✅ Stats loaded');
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchMLModel = async () => {
    try {
      console.log('🧠 Fetching ML model info...');
      const data = await getUserPersonalizedModel();
      setMlModel(data);
      console.log('✅ ML model info loaded');
    } catch (error) {
      console.error('Failed to fetch ML model:', error);
    }
  };

  const handleSavePreferences = async () => {
    // Guard: don't allow saving if preferences haven't loaded from API
    if (!preferences) {
      toast.error('Preferences not loaded yet. Please wait.', { id: 'pref-not-loaded' });
      return;
    }
    try {
      setSaving(true);
      console.log('💾 Saving preferences...');
      await updatePreferences(preferences);
      await refreshUser();
      toast.success('Preferences saved successfully!', { id: 'save-success' });
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast.error('Failed to save preferences', { id: 'save-error' });
    } finally {
      setSaving(false);
    }
  };

  const handleRetrainModel = async () => {
    if (!window.confirm('Retrain your personalized model? This will take a few minutes.')) {
      return;
    }

    try {
      setRetraining(true);
      console.log('🔄 Triggering model retraining...');
      const result = await triggerModelRetrain(false);
      
      toast.success(result.message || 'Model retraining started!', { id: 'retrain-success' });
      
      // Refresh ML model info after a delay
      setTimeout(() => {
        fetchMLModel();
      }, 2000);
    } catch (error) {
      console.error('Failed to retrain model:', error);
      toast.error(error.response?.data?.message || 'Failed to retrain model', { id: 'retrain-error' });
    } finally {
      setRetraining(false);
    }
  };

  const handleResetPersonalization = async () => {
    if (!window.confirm('Reset all personalization? This will delete your feedback and model. This action cannot be undone.')) {
      return;
    }

    try {
      setResetting(true);
      console.log('🗑️ Resetting personalization...');
      await resetUserPersonalization();
      
      toast.success('Personalization reset successfully!', { id: 'reset-success' });
      
      // Refresh data
      fetchUserStats();
      fetchMLModel();
    } catch (error) {
      console.error('Failed to reset personalization:', error);
      toast.error('Failed to reset personalization', { id: 'reset-error' });
    } finally {
      setResetting(false);
    }
  };

  const handleUnlinkService = async (service) => {
    if (window.confirm(`Are you sure you want to unlink ${service === 'youtube' ? 'YouTube' : 'Apple'} Music?`)) {
      try {
        await unlinkService(service);
        toast.success(`${service === 'youtube' ? 'YouTube' : 'Apple'} Music unlinked`, { id: 'unlink-success' });
      } catch (error) {
        console.error('Failed to unlink service:', error);
        toast.error('Failed to unlink service', { id: 'unlink-error' });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account, preferences, and ML personalization
        </p>
      </div>

      {/* Profile Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-xl font-bold">Profile</h2>
        </div>

        <div className="flex items-center gap-6">
          {user?.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt={user.displayName}
              className="w-20 h-20 rounded-full"
            />
          ) : (
            <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold">{user?.displayName || 'User'}</h3>
            <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Spotify ID: {user?.spotifyId}
            </p>
          </div>
        </div>
      </div>

      {/* Connected Services */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Music className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-xl font-bold">Connected Services</h2>
        </div>

        <div className="space-y-4">
          {/* Spotify (Always Connected) */}
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-green-50 dark:bg-green-900/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Spotify</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Primary account</p>
              </div>
            </div>
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>

          {/* YouTube Music */}
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                <Youtube className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">YouTube Music</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isServiceLinked('youtube') ? 'Connected' : 'Not connected'}
                </p>
              </div>
            </div>
            {isServiceLinked('youtube') ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <button
                  onClick={() => handleUnlinkService('youtube')}
                  disabled={serviceLoading}
                  className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <Button
                onClick={linkYouTube}
                isLoading={serviceLoading}
                size="sm"
              >
                Connect
              </Button>
            )}
          </div>

          {/* Apple Music */}
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Apple className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Apple Music</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isServiceLinked('apple') ? 'Connected' : 'Not connected'}
                </p>
              </div>
            </div>
            {isServiceLinked('apple') ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <button
                  onClick={() => handleUnlinkService('apple')}
                  disabled={serviceLoading}
                  className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                disabled={true}
                className="px-4 py-2 text-sm bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg opacity-50 cursor-not-allowed"
              >
                Coming Soon
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ML Personalization */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <h2 className="text-xl font-bold">ML Personalization</h2>
        </div>

        {loadingStats ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">Feedback Count</div>
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {userStats?.feedbackCount || 0}
                </div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">Personalization</div>
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400 capitalize">
                  {userStats?.personalizationLevel || 'none'}
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">Model Status</div>
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  {userStats?.hasTrainedModel ? 'Trained' : 'Not Trained'}
                </div>
              </div>
              <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">Playlists</div>
                <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                  {userStats?.playlistsAnalyzed || 0}
                </div>
              </div>
            </div>

            {/* Model Info */}
            {mlModel && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-semibold">Model Details</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <span className="font-medium">{mlModel.status || 'Unknown'}</span>
                  </div>
                  {mlModel.last_trained && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Last Trained:</span>
                      <span className="font-medium">
                        {new Date(mlModel.last_trained).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {mlModel.accuracy && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Accuracy:</span>
                      <span className="font-medium">{Math.round(mlModel.accuracy * 100)}%</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleRetrainModel}
                isLoading={retraining}
                disabled={!userStats?.hasTrainedModel && userStats?.feedbackCount < 10}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retrain Model
              </Button>
              <Button
                onClick={handleResetPersonalization}
                isLoading={resetting}
                variant="destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Reset Personalization
              </Button>
            </div>

            {/* Info */}
            {userStats?.feedbackCount < 10 && (
              <div className="mt-4 flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Submit at least 10 feedback items to enable personalized model training. 
                  Current: {userStats?.feedbackCount || 0}/10
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Mood Preferences */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Palette className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-xl font-bold">Mood Preferences</h2>
        </div>

        <div className="space-y-6">
          {!preferences ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading preferences...</span>
            </div>
          ) : (<>

          {/* Mood Sensitivity */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Mood Sensitivity
              <span className="ml-2 text-gray-500">({Math.round(preferences.moodSensitivity * 100)}%)</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={preferences.moodSensitivity}
              onChange={(e) => setPreferences({...preferences, moodSensitivity: parseFloat(e.target.value)})}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Higher sensitivity means more nuanced mood detection
            </p>
          </div>

          {/* Auto Optimize */}
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Auto-Optimize Flow</label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automatically optimize new playlists for smooth transitions
              </p>
            </div>
            <button
              onClick={() => setPreferences({...preferences, autoOptimizeFlow: !preferences.autoOptimizeFlow})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.autoOptimizeFlow ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.autoOptimizeFlow ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Default Privacy */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Default Playlist Privacy
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setPreferences({...preferences, defaultPlaylistPrivacy: 'public'})}
                className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                  preferences.defaultPlaylistPrivacy === 'public'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                Public
              </button>
              <button
                onClick={() => setPreferences({...preferences, defaultPlaylistPrivacy: 'private'})}
                className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                  preferences.defaultPlaylistPrivacy === 'private'
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                Private
              </button>
            </div>
          </div>
          </>)}
        </div>
      </div>

      {/* Notifications */}
      {preferences && (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-xl font-bold">Notifications</h2>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="font-medium">Enable Notifications</label>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Receive updates about analysis completion and recommendations
            </p>
          </div>
          <button
            onClick={() => setPreferences({...preferences, notifications: !preferences.notifications})}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.notifications ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.notifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSavePreferences}
          isLoading={saving}
          disabled={!preferences || saving}
        >
          {!preferences ? 'Loading...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
};

export default Settings;