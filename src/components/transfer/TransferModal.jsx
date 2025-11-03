import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { X, ExternalLink, Music2, Apple } from 'lucide-react';

const TransferModal = ({ playlistTracks, playlistName, onClose }) => {
  const [service, setService] = useState('youtube');
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferStatus, setTransferStatus] = useState(null);
  const [linkedServices, setLinkedServices] = useState([]);

  useEffect(() => {
    fetchLinkedServices();
  }, []);

  const fetchLinkedServices = async () => {
    try {
      const { data } = await api.get('/transfer/status');
      setLinkedServices(data.linkedServices || []);
    } catch (err) {
      console.error('Failed to fetch linked services:', err);
    }
  };

  const handleLinkService = (service) => {
    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl) {
      toast.error('API URL not configured');
      return;
    }
    
    const authUrl = `${apiUrl}/auth/${service}/auth`;
    window.location.href = authUrl;
  };

  const handleTransfer = async () => {
    if (!linkedServices.includes(service)) {
      toast.error(`Please link your ${service} account first`);
      return;
    }

    setIsTransferring(true);
    setTransferStatus({ 
      message: `Starting transfer to ${service}...`, 
      progress: 0 
    });

    const tracksToTransfer = playlistTracks.map(t => ({
      name: t.name,
      artist: t.artists?.[0]?.name || t.artist || 'Unknown Artist',
      artists: t.artists?.map(a => a.name) || [t.artist] || ['Unknown Artist'],
    }));

    try {
      const { data } = await api.post(`/transfer/${service}`, {
        playlistName: playlistName || 'MoodiQ Mix',
        tracks: tracksToTransfer,
      });

      setTransferStatus({
        message: 'Transfer complete!',
        progress: 100,
        url: data.playlistUrl,
        successCount: data.tracksAdded,
        failedCount: data.tracksFailed,
        failedTracks: data.failedTracks,
      });

      toast.success(`Successfully transferred ${data.tracksAdded} tracks!`);
    } catch (err) {
      console.error('Transfer failed:', err);
      const errorMsg = err.response?.data?.message || 'Transfer failed';
      
      setTransferStatus({
        message: errorMsg,
        progress: 0,
        error: true,
      });

      if (err.response?.data?.needsAuth) {
        toast.error(`Please link your ${service} account first`);
        setTimeout(() => {
          setTransferStatus(null);
        }, 2000);
      }
    } finally {
      setIsTransferring(false);
    }
  };

  const ServiceIcon = ({ service }) => {
    switch(service) {
      case 'youtube':
        return <Music2 className="w-5 h-5" />;
      case 'apple':
        return <Apple className="w-5 h-5" />;
      default:
        return <Music2 className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold">Transfer Playlist</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Playlist Info */}
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-400">Transferring</div>
            <div className="font-semibold">{playlistName}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {playlistTracks.length} tracks
            </div>
          </div>

          {!transferStatus ? (
            <>
              {/* Service Selection */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Select Destination Service
                </label>
                <div className="space-y-2">
                  {/* YouTube Music */}
                  <button
                    onClick={() => setService('youtube')}
                    className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                      service === 'youtube'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center text-white">
                        <ServiceIcon service="youtube" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">YouTube Music</div>
                        {linkedServices.includes('youtube') ? (
                          <div className="text-sm text-green-600 dark:text-green-400">✓ Connected</div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLinkService('youtube');
                            }}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Connect account
                          </button>
                        )}
                      </div>
                    </div>
                    {service === 'youtube' && (
                      <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </button>

                  {/* Apple Music */}
                  <button
                    onClick={() => setService('apple')}
                    className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                      service === 'apple'
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center text-white">
                        <ServiceIcon service="apple" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">Apple Music</div>
                        {linkedServices.includes('apple') ? (
                          <div className="text-sm text-green-600 dark:text-green-400">✓ Connected</div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLinkService('apple');
                            }}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Connect account
                          </button>
                        )}
                      </div>
                    </div>
                    {service === 'apple' && (
                      <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  💡 Transfer will match tracks by name and artist. Some tracks may not be found on the destination service.
                </div>
              </div>
            </>
          ) : (
            /* Transfer Status */
            <TransferStatusDisplay status={transferStatus} />
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="secondary" onClick={onClose}>
            {transferStatus?.url ? 'Close' : 'Cancel'}
          </Button>
          {!transferStatus && (
            <Button
              onClick={handleTransfer}
              isLoading={isTransferring}
              disabled={!linkedServices.includes(service)}
            >
              Start Transfer
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const TransferStatusDisplay = ({ status }) => {
  const { message, progress, error, url, successCount, failedCount, failedTracks } = status;

  return (
    <div className="space-y-4">
      <div>
        <div className={`text-lg font-semibold mb-2 ${error ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
          {message}
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              error ? 'bg-red-500' : 'bg-green-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Stats */}
        {(successCount !== undefined || failedCount !== undefined) && (
          <div className="flex gap-4 mt-3 text-sm">
            {successCount !== undefined && (
              <div className="text-green-600 dark:text-green-400">
                ✓ {successCount} successful
              </div>
            )}
            {failedCount !== undefined && failedCount > 0 && (
              <div className="text-orange-600 dark:text-orange-400">
                ⚠ {failedCount} failed
              </div>
            )}
          </div>
        )}
      </div>

      {/* Failed Tracks */}
      {failedTracks && failedTracks.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <div className="font-semibold text-sm mb-2">Tracks not found:</div>
          <div className="text-sm space-y-1 max-h-32 overflow-y-auto">
            {failedTracks.slice(0, 5).map((track, idx) => (
              <div key={idx} className="text-gray-600 dark:text-gray-400">
                • {track}
              </div>
            ))}
            {failedTracks.length > 5 && (
              <div className="text-gray-500 dark:text-gray-500 italic">
                ...and {failedTracks.length - 5} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success Link */}
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          <ExternalLink size={18} />
          Open in {status.service || 'Music App'}
        </a>
      )}
    </div>
  );
};

export default TransferModal;