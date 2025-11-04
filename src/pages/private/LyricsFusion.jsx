import { useState, useEffect } from 'react';
import { Music, Search, FileText, Heart, TrendingUp } from 'lucide-react';
import { getPlaylists, getPlaylist } from '../../api/playlists';
import { getTrackLyrics, analyzeLyrics, searchLyrics } from '../../api/lyrics';
import { Button } from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import toast from 'react-hot-toast';

const LyricsFusion = () => {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [trackLyrics, setTrackLyrics] = useState(null);
  const [lyricsAnalysis, setLyricsAnalysis] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const data = await getPlaylists();
      setPlaylists(data); // Already returns array directly
    } catch (error) {
      console.error('Failed to fetch playlists:', error);
      toast.error('Failed to load playlists');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaylistSelect = async (playlist) => {
    try {
      setSelectedPlaylist(playlist);
      setLoading(true);
      
      const data = await getPlaylist(playlist.id);
      const tracks = data.tracks?.items?.map(item => ({
        id: item.track.id,
        name: item.track.name,
        artists: item.track.artists,
        album: item.track.album
      })) || [];
      
      setPlaylistTracks(tracks);
    } catch (error) {
      console.error('Failed to load playlist:', error);
      toast.error('Failed to load playlist tracks');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackSelect = async (track) => {
    try {
      setSelectedTrack(track);
      setLoading(true);
      
      const artistName = track.artists?.[0]?.name || 'Unknown Artist';
      const lyrics = await getTrackLyrics(track.id, track.name, artistName);
      
      setTrackLyrics(lyrics);
      toast.success('Lyrics loaded!');
    } catch (error) {
      console.error('Failed to fetch lyrics:', error);
      if (error.response?.status === 404) {
        toast.error('Lyrics not found for this track');
        setTrackLyrics({ lyrics: 'Lyrics not available for this track.' });
      } else {
        toast.error('Failed to fetch lyrics');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzePlaylist = async () => {
    if (!playlistTracks || playlistTracks.length === 0) {
      toast.error('No tracks to analyze');
      return;
    }

    try {
      setAnalyzing(true);
      
      const tracksToAnalyze = playlistTracks.slice(0, 20).map(track => ({
        name: track.name,
        artist: track.artists?.[0]?.name || 'Unknown Artist'
      }));

      const analysis = await analyzeLyrics(tracksToAnalyze);
      setLyricsAnalysis(analysis);
      toast.success('Playlist lyrics analyzed!');
    } catch (error) {
      console.error('Failed to analyze lyrics:', error);
      if (error.response?.status === 503) {
        toast.error('Lyrics service temporarily unavailable');
      } else {
        toast.error('Failed to analyze lyrics');
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      const results = await searchLyrics(searchQuery, 10);
      setSearchResults(results.results || []);
      
      if (results.results?.length === 0) {
        toast.info('No lyrics found for your search');
      }
    } catch (error) {
      console.error('Failed to search lyrics:', error);
      toast.error('Failed to search lyrics');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <FileText className="w-8 h-8 text-orange-600" />
          Lyrics Fusion
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Explore lyrics, analyze sentiment, and discover themes in your music
        </p>
      </div>

      {/* Search Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Search className="w-6 h-6 text-blue-600" />
          Search Lyrics
        </h2>
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for song lyrics..."
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
          />
          <Button type="submit" isLoading={searching}>
            <Search className="w-5 h-5" />
          </Button>
        </form>

        {searchResults.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="font-semibold">Search Results ({searchResults.length})</h3>
            {searchResults.map((result, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="font-medium">{result.title || 'Unknown'}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {result.artist || 'Unknown Artist'}
                </p>
                {result.snippet && (
                  <p className="text-sm mt-2 text-gray-600 dark:text-gray-400 line-clamp-2">
                    {result.snippet}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Playlist Selection */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Select Playlist</h2>
          {loading && playlists.length === 0 ? (
            <Loader />
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {playlists.slice(0, 10).map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => handlePlaylistSelect(playlist)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedPlaylist?.id === playlist.id
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 ring-2 ring-indigo-500'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
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
                      <p className="font-medium truncate">{playlist.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {playlist.tracks?.total || 0} tracks
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Track List */}
        {selectedPlaylist && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Tracks</h2>
              <Button
                onClick={handleAnalyzePlaylist}
                isLoading={analyzing}
                size="sm"
              >
                Analyze All
              </Button>
            </div>
            {loading ? (
              <Loader />
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {playlistTracks.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => handleTrackSelect(track)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      selectedTrack?.id === track.id
                        ? 'bg-purple-50 dark:bg-purple-900/20 ring-2 ring-purple-500'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <p className="font-medium truncate">{track.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {track.artists?.map(a => a.name).join(', ')}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Lyrics Display */}
        {trackLyrics && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Lyrics</h2>
            {loading ? (
              <Loader />
            ) : (
              <div className="space-y-4">
                <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                  <p className="font-semibold text-lg">{trackLyrics.trackName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {trackLyrics.artistName}
                  </p>
                  {trackLyrics.source && (
                    <p className="text-xs text-gray-400 mt-1">
                      Source: {trackLyrics.source}
                    </p>
                  )}
                </div>

                {trackLyrics.sentiment && (
                  <div className="grid grid-cols-2 gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Sentiment</p>
                      <p className="font-semibold text-blue-600 dark:text-blue-400">
                        {trackLyrics.sentiment.label || 'Neutral'}
                      </p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Score</p>
                      <p className="font-semibold text-purple-600 dark:text-purple-400">
                        {trackLyrics.sentiment.score
                          ? Math.round(trackLyrics.sentiment.score * 100) + '%'
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                    {trackLyrics.lyrics || 'No lyrics available'}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lyrics Analysis Results */}
      {lyricsAnalysis && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
          <h2 className="text-2xl font-bold">Playlist Lyrics Analysis</h2>

          {/* Sentiment Overview */}
          {lyricsAnalysis.sentimentScores && (
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-green-600" />
                  <span className="font-semibold">Average Sentiment</span>
                </div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {lyricsAnalysis.sentimentScores.average
                    ? Math.round(lyricsAnalysis.sentimentScores.average * 100) + '%'
                    : 'N/A'}
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold">Positive Songs</span>
                </div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {lyricsAnalysis.sentimentScores.positive || 0}
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Music className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold">Analyzed Tracks</span>
                </div>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {lyricsAnalysis.lyricsData?.length || 0}
                </p>
              </div>
            </div>
          )}

          {/* Themes */}
          {lyricsAnalysis.themes && lyricsAnalysis.themes.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Common Themes</h3>
              <div className="flex flex-wrap gap-2">
                {lyricsAnalysis.themes.map((theme, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm font-medium"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Keywords */}
          {lyricsAnalysis.keywords && lyricsAnalysis.keywords.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Top Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {lyricsAnalysis.keywords.slice(0, 20).map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      {!selectedPlaylist && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-8 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-orange-600 dark:text-orange-400" />
          <h3 className="text-xl font-bold mb-2">Lyrical Insights Await</h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Select a playlist to explore lyrics, analyze sentiment, and discover recurring themes
            in your favorite songs. Our AI-powered analysis reveals the emotional and thematic
            patterns in your music.
          </p>
        </div>
      )}
    </div>
  );
};

export default LyricsFusion;