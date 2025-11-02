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
  Loader2
} from 'lucide-react';
import { getPreferences, updatePreferences } from '../../api/user';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, refreshUser } = useAuth();
  const { linkedServices, linkYouTube, unlinkService, isServiceLinked, loading: serviceLoading } = useServiceAuth();
  
  const [preferences, setPreferences] = useState({
    moodSensitivity: 0.5,
    autoOptimizeFlow: false,
    defaultPlaylistPrivacy: 'public',
    notifications: true,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const data = await getPreferences();
      if (data.preferences) {
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      await updatePreferences(preferences);
      await refreshUser();
      toast.success('Preferences saved successfully!');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleUnlinkService = async (service) => {
    if (window.confirm(`Are you sure you want to unlink ${service === 'youtube' ? 'YouTube' : 'Apple'} Music?`)) {
      try {
        await unlinkService(service);
      } catch (error) {
        console.error('Failed to unlink service:', error);
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
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
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
              <button
                onClick={linkYouTube}
                disabled={serviceLoading}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {serviceLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Connect
              </button>
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
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg opacity-50 cursor-not-allowed"
              >
                Coming Soon
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mood Preferences */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <Palette className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-xl font-bold">Mood Preferences</h2>
        </div>

        <div className="space-y-6">
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
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
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

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSavePreferences}
          disabled={saving}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Preferences'
          )}
        </button>
      </div>
    </div>
  );
};

export default Settings;