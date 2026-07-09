import { useState, useEffect, useRef } from 'react';
import { Music, Search, FileText, Heart, TrendingUp, Sparkles, ExternalLink, RefreshCcw } from 'lucide-react';
import { getPlaylists, getPlaylist } from '../../api/playlists';
import { getTrackLyrics, analyzeLyrics, searchLyrics } from '../../api/lyrics';
import toast from 'react-hot-toast';

// ── small helpers ──────────────────────────────────────────────────────────

const Loader = () => (
  <div className="flex items-center justify-center py-12">
    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const sentimentBg = (label) => {
  if (label === 'Positive') return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400';
  if (label === 'Negative') return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400';
  return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400';
};

const sentimentColor = (label) => {
  if (label === 'Positive') return 'text-green-400';
  if (label === 'Negative') return 'text-red-400';
  return 'text-yellow-400';
};

const sourceBadge = (source) => {
  if (source === 'genius') return { label: 'Genius', cls: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' };
  if (source === 'gemini') return { label: '✨ Gemini AI', cls: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
  return null;
};

// ── main component ─────────────────────────────────────────────────────────

const LyricsFusion = () => {
  const [playlists, setPlaylists]             = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [playlistTracks, setPlaylistTracks]   = useState([]);
  const [selectedTrack, setSelectedTrack]     = useState(null);
  const [trackLyrics, setTrackLyrics]         = useState(null);
  const [lyricsAnalysis, setLyricsAnalysis]   = useState(null);
  const [searchQuery, setSearchQuery]         = useState('');
  const [searchResults, setSearchResults]     = useState([]);

  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [loadingTracks, setLoadingTracks]       = useState(false);
  const [loadingLyrics, setLoadingLyrics]       = useState(false);
  const [analyzing, setAnalyzing]               = useState(false);
  const [searching, setSearching]               = useState(false);

  // track in-flight lyrics request to prevent race conditions
  const lyricsRequestRef = useRef(0);

  useEffect(() => { fetchPlaylists(); }, []);

  const fetchPlaylists = async () => {
    try {
      setLoadingPlaylists(true);
      const data = await getPlaylists();
      // getPlaylists already returns a deduped array
      setPlaylists(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch playlists:', err);
      toast.error('Failed to load playlists');
    } finally {
      setLoadingPlaylists(false);
    }
  };

  const handlePlaylistSelect = async (playlist) => {
    if (selectedPlaylist?.id === playlist.id) return;
    try {
      setSelectedPlaylist(playlist);
      setSelectedTrack(null);
      setTrackLyrics(null);
      setLyricsAnalysis(null);
      setLoadingTracks(true);

      const data = await getPlaylist(playlist.id);
      const tracks = (data.tracks?.items || [])
        .filter(item => item?.track?.id)
        .map(item => ({
          id: item.track.id,
          name: item.track.name,
          artists: item.track.artists || [],
          album: item.track.album || {}
        }));

      setPlaylistTracks(tracks);
    } catch (err) {
      console.error('Failed to load playlist:', err);
      toast.error('Failed to load playlist tracks');
    } finally {
      setLoadingTracks(false);
    }
  };

  const handleTrackSelect = async (track) => {
    if (selectedTrack?.id === track.id && trackLyrics) return;

    // assign a unique request ID — discard response if a newer request started
    const requestId = ++lyricsRequestRef.current;
    const toastId = toast.loading(`Fetching lyrics…`);

    setSelectedTrack(track);
    setTrackLyrics(null);
    setLoadingLyrics(true);

    try {
      const artistName = track.artists?.[0]?.name || 'Unknown Artist';
      const lyrics = await getTrackLyrics(track.id, track.name, artistName);

      // discard if a newer request has fired
      if (requestId !== lyricsRequestRef.current) return;

      setTrackLyrics(lyrics);
      toast.success(
        lyrics.source === 'gemini' ? '✨ Lyrics from Gemini AI' : 'Lyrics loaded!',
        { id: toastId }
      );
    } catch (err) {
      if (requestId !== lyricsRequestRef.current) return;
      console.error('Failed to fetch lyrics:', err);
      const status = err.response?.status;
      toast.dismiss(toastId);
      if (status === 404) {
        toast.error('Lyrics not found for this track (tried Genius + Gemini)');
        setTrackLyrics({ lyrics: null, trackName: track.name, artistName: track.artists?.[0]?.name });
      } else {
        toast.error('Failed to fetch lyrics');
      }
    } finally {
      if (requestId === lyricsRequestRef.current) setLoadingLyrics(false);
    }
  };

  const handleAnalyzePlaylist = async () => {
    if (!playlistTracks.length) { toast.error('No tracks to analyze'); return; }

    const toastId = toast.loading('Analyzing lyrics…');
    try {
      setAnalyzing(true);
      const tracksToAnalyze = playlistTracks.slice(0, 20).map(track => ({
        name: track.name,
        artist: track.artists?.[0]?.name || 'Unknown Artist'
      }));
      const analysis = await analyzeLyrics(tracksToAnalyze);
      setLyricsAnalysis(analysis);
      toast.success('Playlist lyrics analyzed!', { id: toastId });
    } catch (err) {
      console.error('Failed to analyze lyrics:', err);
      toast.dismiss(toastId);
      toast.error(err.response?.status === 503 ? 'Lyrics service unavailable' : 'Failed to analyze lyrics');
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
      const items = results.results || [];
      setSearchResults(items);
      if (!items.length) toast('No results found for your search');
    } catch (err) {
      console.error('Failed to search lyrics:', err);
      toast.error('Failed to search lyrics');
    } finally {
      setSearching(false);
    }
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-full p-4 md:p-6 text-gray-900 dark:text-white">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lyrics Fusion</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Explore lyrics, analyze sentiment, and discover themes</p>
          </div>
        </div>

        {/* search bar */}
        <div className="bg-white dark:bg-gray-900/70 border border-gray-200 dark:border-white/10 rounded-2xl p-5">
          <h2 className="font-semibold mb-3 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            <Search className="w-4 h-4 text-blue-500 dark:text-blue-400" /> Search Lyrics
          </h2>
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              id="lyrics-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a song or artist…"
              className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-white/15 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
            />
            <button
              id="lyrics-search-btn"
              type="submit"
              disabled={searching}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              {searching
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Searching…</>
                : <><Search className="w-4 h-4" />Search</>
              }
            </button>
          </form>

          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs text-gray-400 dark:text-gray-500">{searchResults.length} result(s)</p>
              {searchResults.map((result, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-colors">
                  {result.thumbnail && (
                    <img src={result.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate text-gray-900 dark:text-white">{result.title || 'Unknown'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{result.artist || 'Unknown Artist'}</p>
                  </div>
                  {result.url && (
                    <a href={result.url} target="_blank" rel="noopener noreferrer"
                      className="text-gray-500 hover:text-white flex-shrink-0 transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* three-panel grid */}
        <div className="grid lg:grid-cols-3 gap-5">

          {/* panel 1: playlists */}
          <div className="bg-white dark:bg-gray-900/70 border border-gray-200 dark:border-white/10 rounded-2xl p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-sm text-gray-500 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <Music className="w-4 h-4 text-orange-500 dark:text-orange-400" /> Playlists
              </h2>
              <button onClick={fetchPlaylists} disabled={loadingPlaylists}
                className="text-gray-500 hover:text-white transition-colors disabled:opacity-40">
                <RefreshCcw className="w-3.5 h-3.5" />
              </button>
            </div>
            {loadingPlaylists ? <Loader /> : (
              <div className="space-y-1.5 overflow-y-auto max-h-96" style={{ scrollbarWidth: 'thin' }}>
                {playlists.length === 0 && (
                  <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-8">No playlists found</p>
                )}
                {playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    id={`playlist-${playlist.id}`}
                    onClick={() => handlePlaylistSelect(playlist)}
                    className={`w-full p-3 rounded-xl text-left transition-all ${
                      selectedPlaylist?.id === playlist.id
                        ? 'bg-orange-100 dark:bg-orange-900/30 border border-orange-400 dark:border-orange-500/50'
                        : 'bg-gray-50 dark:bg-white/5 border border-transparent hover:border-gray-300 dark:hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {playlist.images?.[0]?.url ? (
                        <img src={playlist.images[0].url} alt={playlist.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Music className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate text-gray-900 dark:text-white">{playlist.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">{playlist.tracks?.total || 0} tracks</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* panel 2: tracks */}
          <div className="bg-white dark:bg-gray-900/70 border border-gray-200 dark:border-white/10 rounded-2xl p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-sm text-gray-500 dark:text-gray-300 uppercase tracking-wider truncate">
                {selectedPlaylist ? selectedPlaylist.name : 'Tracks'}
              </h2>
              {selectedPlaylist && playlistTracks.length > 0 && (
                <button
                  id="analyze-all-btn"
                  onClick={handleAnalyzePlaylist}
                  disabled={analyzing}
                  className="text-xs px-3 py-1.5 rounded-lg bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:bg-purple-600/50 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {analyzing
                    ? <><div className="w-3 h-3 border border-purple-400 border-t-transparent rounded-full animate-spin" />Analyzing…</>
                    : <><Sparkles className="w-3 h-3" />Analyze All</>
                  }
                </button>
              )}
            </div>

            {!selectedPlaylist ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-400 dark:text-gray-600 text-sm text-center">Select a playlist to see tracks</p>
              </div>
            ) : loadingTracks ? <Loader /> : (
              <div className="space-y-1.5 overflow-y-auto max-h-96" style={{ scrollbarWidth: 'thin' }}>
                {playlistTracks.length === 0 && (
                  <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-8">No tracks in this playlist</p>
                )}
                {playlistTracks.map((track) => (
                  <button
                    key={track.id}
                    id={`track-${track.id}`}
                    onClick={() => handleTrackSelect(track)}
                    className={`w-full p-3 rounded-xl text-left transition-all ${
                      selectedTrack?.id === track.id
                        ? 'bg-purple-100 dark:bg-purple-900/30 border border-purple-400 dark:border-purple-500/50'
                        : 'bg-gray-50 dark:bg-white/5 border border-transparent hover:border-gray-300 dark:hover:border-white/15'
                    }`}
                  >
                    <p className="font-medium text-sm truncate text-gray-900 dark:text-white">{track.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 truncate">{track.artists?.map(a => a.name).join(', ')}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* panel 3: lyrics */}
          <div className="bg-white dark:bg-gray-900/70 border border-gray-200 dark:border-white/10 rounded-2xl p-5 flex flex-col">
            <h2 className="font-semibold text-sm text-gray-500 dark:text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-green-600 dark:text-green-400" /> Lyrics
            </h2>

            {loadingLyrics ? <Loader /> : !trackLyrics ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-400 dark:text-gray-600 text-sm text-center">Select a track to view lyrics</p>
              </div>
            ) : (
              <div className="space-y-4 overflow-y-auto max-h-[520px]" style={{ scrollbarWidth: 'thin' }}>
                {/* track info */}
                <div className="pb-3 border-b border-gray-200 dark:border-white/10">
                  <p className="font-semibold text-gray-900 dark:text-white">{trackLyrics.trackName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{trackLyrics.artistName}</p>
                  {trackLyrics.source && (() => {
                    const badge = sourceBadge(trackLyrics.source);
                    return badge ? (
                      <span className={`mt-1.5 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${badge.cls}`}>
                        {badge.label}
                      </span>
                    ) : null;
                  })()}
                </div>

                {/* sentiment */}
                {trackLyrics.sentiment && (
                  <div className="grid grid-cols-2 gap-2 pb-3 border-b border-gray-200 dark:border-white/10">
                    <div className="bg-gray-100 dark:bg-white/5 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-1">Sentiment</p>
                      <p className={`font-bold text-sm ${sentimentColor(trackLyrics.sentiment.label)}`}>
                        {trackLyrics.sentiment.label || 'Neutral'}
                      </p>
                    </div>
                    <div className="bg-gray-100 dark:bg-white/5 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-1">Score</p>
                      <p className="font-bold text-sm text-gray-900 dark:text-white">
                        {trackLyrics.sentiment.score != null
                          ? Math.round(trackLyrics.sentiment.score * 100) + '%'
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                )}

                {/* lyrics text */}
                {trackLyrics.lyrics ? (
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 dark:text-gray-200 font-sans">
                    {trackLyrics.lyrics}
                  </pre>
                ) : (
                  <div className="py-8 text-center">
                    <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-700" />
                    <p className="text-gray-500 text-sm">Lyrics not available for this track</p>
                    <p className="text-gray-400 dark:text-gray-700 text-xs mt-1">Neither Genius nor Gemini could find them</p>
                  </div>
                )}

                {/* genius link */}
                {trackLyrics.geniusUrl && (
                  <a
                    href={trackLyrics.geniusUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-yellow-400 hover:text-yellow-300 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" /> View on Genius
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* playlist analysis results */}
        {lyricsAnalysis && (
          <div className="bg-white dark:bg-gray-900/70 border border-gray-200 dark:border-white/10 rounded-2xl p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Playlist Lyrics Analysis</h2>

            {lyricsAnalysis.sentimentScores && (
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-green-900/30 border border-green-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-semibold text-green-300">Avg Sentiment</span>
                  </div>
                  <p className="text-3xl font-bold text-green-400">
                    {lyricsAnalysis.sentimentScores.average != null
                      ? Math.round(lyricsAnalysis.sentimentScores.average * 100) + '%'
                      : 'N/A'}
                  </p>
                </div>
                <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-semibold text-blue-300">Positive Songs</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-400">
                    {lyricsAnalysis.sentimentScores.positive || 0}
                  </p>
                </div>
                <div className="bg-purple-900/30 border border-purple-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Music className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-semibold text-purple-300">Analyzed</span>
                  </div>
                  <p className="text-3xl font-bold text-purple-400">
                    {lyricsAnalysis.lyricsData?.length || 0}
                  </p>
                </div>
              </div>
            )}

            {/* per-track breakdown */}
            {lyricsAnalysis.lyricsData?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-gray-500 dark:text-gray-300 text-sm uppercase tracking-wider">Track Breakdown</h3>
                <div className="space-y-1.5">
                  {lyricsAnalysis.lyricsData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm">
                      <div className="flex-1 min-w-0">
                        <span className="font-medium truncate block text-gray-900 dark:text-white">{item.track}</span>
                        <span className="text-xs text-gray-500 truncate block">{item.artist}</span>
                      </div>
                      {item.status === 'analyzed' && item.sentiment ? (
                        <span className={`text-xs font-semibold flex-shrink-0 ${sentimentColor(item.sentiment.label)}`}>
                          {item.sentiment.label}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-gray-600 flex-shrink-0">
                          {item.status === 'not_found' ? 'Not found' : 'Error'}
                        </span>
                      )}
                      {item.source && (() => {
                        const badge = sourceBadge(item.source);
                        return badge ? (
                          <span className={`text-xs px-1.5 py-0.5 rounded border flex-shrink-0 ${badge.cls}`}>
                            {badge.label}
                          </span>
                        ) : null;
                      })()}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {lyricsAnalysis.themes?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-gray-500 dark:text-gray-300 text-sm uppercase tracking-wider">Common Themes</h3>
                <div className="flex flex-wrap gap-2">
                  {lyricsAnalysis.themes.map((theme, idx) => (
                    <span key={idx} className="px-4 py-2 bg-indigo-900/40 border border-indigo-500/40 text-indigo-300 rounded-full text-sm font-medium">
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {lyricsAnalysis.keywords?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 text-gray-500 dark:text-gray-300 text-sm uppercase tracking-wider">Top Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {lyricsAnalysis.keywords.slice(0, 20).map((kw, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* empty state */}
        {!selectedPlaylist && (
          <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-500/20 rounded-2xl p-10 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-orange-400/60" />
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Lyrical Insights Await</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
              Select a playlist to explore lyrics and sentiment. Lyrics are fetched from Genius,
              with Gemini AI as a fallback for songs that Genius doesn't have.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default LyricsFusion;