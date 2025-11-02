import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getPlaylists } from '../../api/playlists';
import { Music, ExternalLink } from 'lucide-react';
import { Loader } from '../../components/ui/Loader';

const Playlists = () => {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const data = await getPlaylists();
      setPlaylists(data.playlists || data);
    } catch (error) {
      console.error('Failed to fetch playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96"><Loader /></div>;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Playlists</h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage all your Spotify playlists
        </p>
      </div>

      {playlists.length === 0 ? (
        <div className="text-center py-16">
          <Music className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No playlists found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {playlists.map((playlist) => (
            <div key={playlist.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
              <div className="relative aspect-square">
                {playlist.images?.[0]?.url ? (
                  <img 
                    src={playlist.images[0].url} 
                    alt={playlist.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <Music className="w-16 h-16 text-white opacity-50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition-opacity" />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1 truncate">{playlist.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {playlist.tracks?.total || 0} tracks
                </p>
                <a
                  href={playlist.external_urls?.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Open in Spotify
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Playlists;