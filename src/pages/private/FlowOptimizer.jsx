import { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { toast } from 'react-hot-toast';
import {
  Sparkles, AlertTriangle, Plus, Save, Music, GripVertical,
  X, ArrowRight, RotateCcw, TrendingUp, Star, Zap, ChevronDown,
} from 'lucide-react';
import {
  detectMoodGaps,
  fillGapsWithSpotify,
  optimizeAndEnrichFlow,
  createPlaylist,
  reorderPlaylist,
} from '../../api/playlists';

// ── Constants ──────────────────────────────────────────────────────────────────

const MOOD_OPTIONS = [
  'Joyful', 'Excited', 'Party', 'Romantic', 'Chill',
  'Relaxed', 'Melancholic', 'Dreamy', 'Focused', 'Motivated', 'Angry', 'Ambient',
];

const MOOD_COLOR = {
  Joyful: '#f59e0b', Excited: '#ef4444', Party: '#8b5cf6', Romantic: '#ec4899',
  Chill: '#06b6d4', Relaxed: '#10b981', Melancholic: '#6366f1', Dreamy: '#a78bfa',
  Focused: '#3b82f6', Motivated: '#f97316', Angry: '#dc2626', Ambient: '#64748b',
  Energetic: '#ef4444', Anxious: '#f59e0b', Unknown: '#6b7280',
};

const moodColor = (m) => MOOD_COLOR[m] || '#6b7280';

const SEVERITY_CONFIG = {
  high:   { bg: 'bg-red-900/40',    border: 'border-red-500/60',    text: 'text-red-300',    label: '⚡ Severe gap' },
  medium: { bg: 'bg-orange-900/40', border: 'border-orange-500/60', text: 'text-orange-300', label: '⚠ Moderate gap' },
  low:    { bg: 'bg-yellow-900/30', border: 'border-yellow-500/50', text: 'text-yellow-300', label: '↕ Minor gap'  },
};

// ── Sub-components ─────────────────────────────────────────────────────────────

/** Single track row — shared between both panels. */
const TrackRow = ({ track, index, isDraggable = false, draggableId, provided }) => {
  const artists = Array.isArray(track.artists)
    ? track.artists.map(a => a.name).join(', ')
    : (track.artist || 'Unknown Artist');
  const img = track.album?.images?.[0]?.url || track.album?.images?.[1]?.url;
  const mood = track.mood || 'Unknown';
  const val  = track.features?.valence != null ? Math.round(track.features.valence * 100) : null;
  const ene  = track.features?.energy  != null ? Math.round(track.features.energy  * 100) : null;
  const isNew = track.isNew;
  const isBridge = track.isBridge;

  const inner = (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all
        ${isNew
          ? 'bg-purple-900/30 border-purple-500/40 hover:border-purple-400/60'
          : 'bg-white/5 border-white/10 hover:border-white/20'
        }`}
    >
      {/* Drag handle (only in preview panel) */}
      {isDraggable && (
        <div {...provided.dragHandleProps} className="text-gray-500 hover:text-gray-300 cursor-grab active:cursor-grabbing flex-shrink-0">
          <GripVertical className="w-4 h-4" />
        </div>
      )}

      {/* Number */}
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
        ${isNew ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-400'}`}>
        {index + 1}
      </div>

      {/* Cover art */}
      {img ? (
        <img src={img} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
      ) : (
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
          <Music className="w-4 h-4 text-white/60" />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-white truncate leading-tight">{track.name || 'Unknown Track'}</p>
        <p className="text-xs text-gray-400 truncate">{artists}</p>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Mood badge */}
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold text-white"
          style={{ backgroundColor: `${moodColor(mood)}33`, border: `1px solid ${moodColor(mood)}80`, color: moodColor(mood) }}>
          {mood}
        </span>
        {/* Energy/Valence */}
        {ene != null && (
          <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-xs bg-blue-900/40 text-blue-300 font-mono">E {ene}</span>
        )}
        {val != null && (
          <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-xs bg-green-900/40 text-green-300 font-mono">V {val}</span>
        )}
        {/* New badge */}
        {isNew && (
          <span className="px-1.5 py-0.5 rounded text-xs bg-purple-600/60 text-purple-200 font-semibold border border-purple-500/40">
            {isBridge ? '🌉' : '✨'}NEW
          </span>
        )}
      </div>
    </div>
  );

  return inner;
};

/** Gap annotation banner shown between tracks in the original panel. */
const GapBanner = ({ gap }) => {
  const cfg = SEVERITY_CONFIG[gap.severity] || SEVERITY_CONFIG.low;
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs ${cfg.bg} ${cfg.border} ${cfg.text} my-1`}>
      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{cfg.label} — {gap.from_track} → {gap.to_track}</span>
      <span className="ml-auto font-mono opacity-70">Δ{(gap.distance * 100).toFixed(0)}%</span>
    </div>
  );
};

/** Save-to-Spotify modal. */
const SaveModal = ({ onClose, onReplace, onCreateNew, isSaving }) => (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-gray-900 border border-white/20 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
      <h3 className="text-lg font-bold text-white mb-2">Save to Spotify</h3>
      <p className="text-gray-400 text-sm mb-6">How would you like to save the optimized playlist?</p>
      <div className="space-y-3">
        <button
          onClick={onReplace}
          disabled={isSaving}
          className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" /> Replace existing playlist
        </button>
        <button
          onClick={onCreateNew}
          disabled={isSaving}
          className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Save as new playlist
        </button>
        <button onClick={onClose} className="w-full py-2 text-gray-400 hover:text-white text-sm transition-colors">
          Cancel
        </button>
      </div>
    </div>
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────────

const FlowOptimizer = () => {
  const location  = useLocation();
  const navigate  = useNavigate();

  const originalTracks = (location.state?.tracks || []).map((t, i) => ({
    ...t,
    _uid: `orig-${t.id || i}-${i}`,  // stable unique id
  }));
  const playlistId   = location.state?.playlistId;
  const playlistName = location.state?.playlistName || 'My Playlist';

  // ── State ──────────────────────────────────────────────────────────────────
  const [startMood, setStartMood] = useState('');
  const [endMood,   setEndMood]   = useState('');

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isDetecting,  setIsDetecting]  = useState(false);
  const [isFilling,    setIsFilling]    = useState(false);
  const [isSaving,     setIsSaving]     = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Left panel: gap annotations (from Detect Gaps)
  const [gapAnnotations, setGapAnnotations] = useState(null); // null = not run yet

  // Right panel: preview tracks (null = no action run yet)
  const [previewTracks, setPreviewTracks] = useState(null);
  const [previewMode,   setPreviewMode]   = useState(null);   // 'optimized'|'filled'
  const [previewInfo,   setPreviewInfo]   = useState(null);   // { addedCount, mode, message }
  const [flowScore,     setFlowScore]     = useState(null);

  // For drag-and-drop in the preview panel
  const [draggedPreview, setDraggedPreview] = useState(null);
  const effectivePreview = draggedPreview ?? previewTracks;

  // ── Guards ────────────────────────────────────────────────────────────────
  if (!originalTracks.length) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="text-center">
          <Music className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No tracks to optimize</h2>
          <p className="text-gray-400 mb-6">Please open a playlist and analyze its mood first.</p>
          <button
            onClick={() => navigate('/playlists')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold transition-colors"
          >
            Go to Playlists
          </button>
        </div>
      </div>
    );
  }

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleOptimizeWithAI = async () => {
    if (!startMood) { toast.error('Please select a Start Mood', { id: 'no-start' }); return; }
    if (!endMood)   { toast.error('Please select an End Mood', { id: 'no-end' });   return; }
    if (startMood === endMood) { toast.error('Start and End mood must be different', { id: 'same-mood' }); return; }

    setIsOptimizing(true);
    const toastId = toast.loading(`Building ${startMood} → ${endMood} arc…`);
    try {
      const result = await optimizeAndEnrichFlow(originalTracks, startMood, endMood);
      const tracks = (result.optimizedTracks || []).map((t, i) => ({
        ...t,
        _uid: `opt-${t.id || i}-${i}`,
      }));
      setPreviewTracks(tracks);
      setDraggedPreview(null);
      setPreviewMode('optimized');
      setFlowScore(result.flowScore);
      setPreviewInfo({ addedCount: result.addedCount, keptCount: result.keptCount, mode: result.mode, message: result.message });
      toast.success(result.message || `${tracks.length} tracks optimized!`, { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Optimization failed', { id: toastId });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleDetectGaps = async () => {
    setIsDetecting(true);
    const toastId = toast.loading('Scanning for mood gaps…');
    try {
      const result = await detectMoodGaps(originalTracks, 0.3);
      const gaps = result.gaps || [];
      if (!gaps.length) {
        toast.success('No significant gaps — this playlist flows smoothly! 🎵', { id: toastId });
        setGapAnnotations([]);
        return;
      }
      // Build a map: position → gap info
      const annotationMap = {};
      gaps.forEach(g => { annotationMap[g.position] = g; });
      setGapAnnotations(annotationMap);
      toast.success(`Found ${gaps.length} gap(s) in the original playlist`, { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Gap detection failed', { id: toastId });
    } finally {
      setIsDetecting(false);
    }
  };

  const handleFillGaps = async () => {
    setIsFilling(true);
    const toastId = toast.loading('Finding bridge tracks…');
    try {
      const result = await fillGapsWithSpotify(originalTracks, 0.3);
      if (result.total_gaps === 0) {
        toast.success('No gaps found — playlist already flows smoothly! 🎵', { id: toastId });
        return;
      }
      const tracks = (result.augmentedTracks || []).map((t, i) => ({
        ...t,
        _uid: `fill-${t.id || i}-${i}`,
      }));
      setPreviewTracks(tracks);
      setDraggedPreview(null);
      setPreviewMode('filled');
      setPreviewInfo({ addedCount: result.addedCount, message: result.message });
      toast.success(result.message || `Added ${result.addedCount} bridge track(s)`, { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Failed to fill gaps', { id: toastId });
    } finally {
      setIsFilling(false);
    }
  };

  const handleDragEnd = useCallback((result) => {
    if (!result.destination) return;
    const src = result.source.index;
    const dst = result.destination.index;
    if (src === dst) return;
    const current = [...(effectivePreview || [])];
    const [moved] = current.splice(src, 1);
    current.splice(dst, 0, moved);
    setDraggedPreview(current);
  }, [effectivePreview]);

  const handleSave = async (mode) => {
    if (!effectivePreview?.length) {
      toast.error('No preview to save'); return;
    }
    setIsSaving(true);
    const toastId = toast.loading('Saving to Spotify…');
    try {
      if (mode === 'replace' && playlistId) {
        const uris = effectivePreview.map(t => `spotify:track:${t.id}`).filter(u => !u.includes('undefined'));
        await reorderPlaylist(playlistId, uris);
        toast.success('Playlist updated on Spotify! 🎵', { id: toastId });
      } else {
        const newName = `${playlistName} — Optimized (${new Date().toLocaleDateString()})`;
        const trackUris = effectivePreview.map(t => `spotify:track:${t.id}`).filter(u => !u.includes('undefined'));
        await createPlaylist(newName, trackUris);
        toast.success(`New playlist "${newName}" created on Spotify! 🎵`, { id: toastId });
      }
      setShowSaveModal(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save to Spotify', { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPreview = () => {
    setPreviewTracks(null);
    setDraggedPreview(null);
    setPreviewMode(null);
    setPreviewInfo(null);
    setFlowScore(null);
  };

  // ── Render helpers ────────────────────────────────────────────────────────

  const flowLabel = (score) => {
    if (score >= 0.85) return { text: 'Excellent arc', color: 'text-green-400' };
    if (score >= 0.65) return { text: 'Good flow',     color: 'text-blue-400'  };
    if (score >= 0.40) return { text: 'Moderate',      color: 'text-yellow-400'};
    return { text: 'Needs work', color: 'text-red-400' };
  };

  const isAnyLoading = isOptimizing || isDetecting || isFilling || isSaving;

  // ── JSX ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-5">

        {/* ── Header ── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold">Flow Optimizer</h1>
                <span className="text-gray-400">·</span>
                <span className="text-gray-300 text-sm">{playlistName}</span>
              </div>
              <p className="text-gray-500 text-xs mt-0.5">
                Drag to reorder manually, or use AI to build a smooth mood arc from start to finish.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {effectivePreview && (
              <button
                onClick={() => setShowSaveModal(true)}
                disabled={isAnyLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold text-sm transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> Save to Spotify
              </button>
            )}
          </div>
        </div>

        {/* ── Controls ── */}
        <div className="bg-gray-900/70 border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="font-semibold text-sm text-white">Optimization Controls</span>
          </div>

          {/* Mood selectors */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                Start Mood <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  value={startMood}
                  onChange={e => setStartMood(e.target.value)}
                  className="w-full bg-gray-800 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-purple-500 cursor-pointer"
                  style={startMood ? { borderColor: `${moodColor(startMood)}60` } : {}}
                >
                  <option value="">— Select mood —</option>
                  {MOOD_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <ArrowRight className="w-5 h-5 text-gray-500 mt-4 flex-shrink-0" />

            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                End Mood <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  value={endMood}
                  onChange={e => setEndMood(e.target.value)}
                  className="w-full bg-gray-800 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-purple-500 cursor-pointer"
                  style={endMood ? { borderColor: `${moodColor(endMood)}60` } : {}}
                >
                  <option value="">— Select mood —</option>
                  {MOOD_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            {/* Optimize with AI */}
            <button
              id="btn-optimize-ai"
              onClick={handleOptimizeWithAI}
              disabled={isAnyLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white
                bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500
                shadow-lg hover:shadow-purple-500/20 transition-all disabled:opacity-50 active:scale-95"
            >
              {isOptimizing
                ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Optimizing…</>
                : <><Sparkles className="w-4 h-4" />Optimize with AI</>
              }
            </button>

            {/* Detect Gaps */}
            <button
              id="btn-detect-gaps"
              onClick={handleDetectGaps}
              disabled={isAnyLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white
                bg-orange-600/30 border border-orange-500/50 hover:bg-orange-600/50
                transition-all disabled:opacity-50 active:scale-95"
            >
              {isDetecting
                ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Detecting…</>
                : <><AlertTriangle className="w-4 h-4" />Detect Gaps</>
              }
            </button>

            {/* Fill Gaps */}
            <button
              id="btn-fill-gaps"
              onClick={handleFillGaps}
              disabled={isAnyLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white
                bg-emerald-600/30 border border-emerald-500/50 hover:bg-emerald-600/50
                transition-all disabled:opacity-50 active:scale-95"
            >
              {isFilling
                ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Filling…</>
                : <><Plus className="w-4 h-4" />Fill Gaps</>
              }
            </button>

            {/* Reset preview */}
            {effectivePreview && (
              <button
                id="btn-reset"
                onClick={handleResetPreview}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-gray-400
                  bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white
                  transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4" /> Reset Preview
              </button>
            )}
          </div>

          {/* Flow Score (only if optimized) */}
          {flowScore != null && (() => {
            const lbl = flowLabel(flowScore);
            return (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-bold ${lbl.color}`}>{Math.round(flowScore * 100)}%</span>
                    <span className={`text-sm ${lbl.color}`}>{lbl.text}</span>
                  </div>
                  <p className="text-xs text-gray-500">Flow Score</p>
                </div>
                {previewInfo?.mode && (
                  <span className={`ml-auto px-2 py-1 rounded-lg text-xs font-semibold border
                    ${previewInfo.mode === 'generated'
                      ? 'bg-purple-900/40 text-purple-300 border-purple-500/40'
                      : 'bg-blue-900/40 text-blue-300 border-blue-500/40'}`}>
                    {previewInfo.mode === 'generated' ? '🌟 Fresh playlist' : '⚡ Enriched'}
                  </span>
                )}
              </div>
            );
          })()}

          {/* Preview info banner */}
          {previewInfo?.message && (
            <p className="text-xs text-gray-400 bg-white/5 rounded-lg px-3 py-2 border border-white/10">
              {previewInfo.message}
            </p>
          )}
        </div>

        {/* ── Two-panel track view ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* ── LEFT: Original Playlist ── */}
          <div className="bg-gray-900/70 border border-white/10 rounded-2xl p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-gray-400" />
                <h2 className="font-semibold text-sm text-white">Original Playlist</h2>
                <span className="text-xs text-gray-500 bg-white/10 px-2 py-0.5 rounded-full">
                  {originalTracks.length} tracks
                </span>
              </div>
              {gapAnnotations && Object.keys(gapAnnotations).length > 0 && (
                <span className="text-xs text-orange-400 bg-orange-900/30 border border-orange-500/40 px-2 py-1 rounded-lg flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {Object.keys(gapAnnotations).length} gap{Object.keys(gapAnnotations).length > 1 ? 's' : ''} detected
                </span>
              )}
              {gapAnnotations !== null && Object.keys(gapAnnotations).length === 0 && (
                <span className="text-xs text-green-400 bg-green-900/30 border border-green-500/40 px-2 py-1 rounded-lg">
                  ✓ Smooth flow
                </span>
              )}
            </div>

            <div className="space-y-1.5 overflow-y-auto max-h-[600px] pr-1" style={{ scrollbarWidth: 'thin' }}>
              {originalTracks.map((track, i) => (
                <div key={track._uid || i}>
                  <TrackRow track={track} index={i} />
                  {/* Gap annotation after this track */}
                  {gapAnnotations && gapAnnotations[i] && (
                    <GapBanner gap={gapAnnotations[i]} />
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-3 text-center">Read-only · Run Detect Gaps to annotate</p>
          </div>

          {/* ── RIGHT: Optimized Preview ── */}
          <div className="bg-gray-900/70 border border-white/10 rounded-2xl p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-purple-400" />
                <h2 className="font-semibold text-sm text-white">
                  {previewMode === 'optimized' ? 'AI-Optimized Preview' : previewMode === 'filled' ? 'Gap-Filled Preview' : 'Optimized Preview'}
                </h2>
                {effectivePreview && (
                  <span className="text-xs text-gray-500 bg-white/10 px-2 py-0.5 rounded-full">
                    {effectivePreview.length} tracks
                  </span>
                )}
              </div>
              {previewInfo?.addedCount > 0 && (
                <span className="text-xs text-purple-300 bg-purple-900/30 border border-purple-500/40 px-2 py-1 rounded-lg">
                  ✨ {previewInfo.addedCount} new from Spotify
                </span>
              )}
            </div>

            {!effectivePreview ? (
              /* Empty state */
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-purple-900/30 border border-purple-500/30 flex items-center justify-center mb-4">
                  <Sparkles className="w-7 h-7 text-purple-400" />
                </div>
                <p className="text-gray-400 font-medium mb-1">No preview yet</p>
                <p className="text-gray-600 text-xs max-w-[220px] leading-relaxed">
                  Select Start &amp; End Mood, then click <strong className="text-gray-400">Optimize with AI</strong> — or click <strong className="text-gray-400">Fill Gaps</strong> to preserve the original trajectory.
                </p>
              </div>
            ) : (
              /* Draggable preview tracks */
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="preview-list">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-1.5 overflow-y-auto max-h-[600px] pr-1"
                      style={{ scrollbarWidth: 'thin' }}
                    >
                      {effectivePreview.map((track, i) => (
                        <Draggable
                          key={track._uid || `p-${track.id || i}-${i}`}
                          draggableId={track._uid || `p-${track.id || i}-${i}`}
                          index={i}
                        >
                          {(prov, snap) => (
                            <div
                              ref={prov.innerRef}
                              {...prov.draggableProps}
                              className={snap.isDragging ? 'opacity-80 scale-[1.02]' : ''}
                            >
                              <TrackRow
                                track={track}
                                index={i}
                                isDraggable
                                draggableId={track._uid || `p-${track.id || i}-${i}`}
                                provided={prov}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}

            {effectivePreview && (
              <p className="text-xs text-gray-600 mt-3 text-center">Drag to reorder · Click "Save to Spotify" to apply</p>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-purple-600/60 border border-purple-500/40 inline-block" />
            ✨ NEW — fetched from Spotify catalog
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-white/10 border border-white/10 inline-block" />
            Kept from your original playlist
          </div>
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3 text-orange-400" />
            Gap annotation (from Detect Gaps)
          </div>
        </div>

      </div>

      {/* ── Save Modal ── */}
      {showSaveModal && (
        <SaveModal
          onClose={() => setShowSaveModal(false)}
          onReplace={() => handleSave('replace')}
          onCreateNew={() => handleSave('new')}
          isSaving={isSaving}
        />
      )}
    </div>
  );
};

export default FlowOptimizer;