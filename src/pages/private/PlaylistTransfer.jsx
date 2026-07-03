import { ArrowRightLeft, Youtube, Apple, CheckCircle } from 'lucide-react';
import { useServiceAuth } from '../../contexts/ServiceAuthContext';

const PlaylistTransfer = () => {
  const { linkedServices, linkYouTube, linkAppleMusic, isServiceLinked } = useServiceAuth();

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Playlist Transfer</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Transfer your playlists across different music platforms
        </p>
      </div>

      {/* Connected Services */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Connected Services</h2>
        <div className="space-y-4">
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
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <button
                onClick={linkYouTube}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
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
              <CheckCircle className="w-6 h-6 text-green-500" />
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

      {/* Transfer Instructions */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <ArrowRightLeft className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          How to Transfer
        </h2>
        <ol className="space-y-3 text-gray-700 dark:text-gray-300">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
            <span>Connect the services you want to transfer to</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
            <span>Go to Dashboard and analyze a playlist</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
            <span>Click "Transfer Playlist" and select your destination</span>
          </li>
        </ol>
      </div>
    </div>
  );
};


export default PlaylistTransfer;