import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  optimizePlaylistFlow, 
  reorderPlaylist, 
  detectMoodGaps, 
  fillMoodGaps 
} from '../../api/playlists';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { 
  GripVertical, 
  Save, 
  Sparkles, 
  Zap, 
  AlertTriangle, 
  Plus,
  Info,
  TrendingUp
} from 'lucide-react';

const FlowOptimizer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const initialTracks = location.state?.tracks || [];
  const playlistId = location.state?.playlistId;
  const playlistName = location.state?.playlistName || 'Playlist';

  const [tracks, setTracks] = useState(initialTracks);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDetectingGaps, setIsDetectingGaps] = useState(false);
  const [isFillingGaps, setIsFillingGaps] = useState(false);
  const [startMood, setStartMood] = useState('Chill');
  const [endMood, setEndMood] = useState('Joyful');
  const [algorithm, setAlgorithm] = useState('dynamic_programming');
  const [moodGaps, setMoodGaps] = useState(null);
  const [gapRecommendations, setGapRecommendations] = useState(null);
  const [flowScore, setFlowScore] = useState(null);

  const MOOD_OPTIONS = [
    'Joyful', 'Excited', 'Party', 'Melancholic', 'Dreamy',
    'Relaxed', 'Chill', 'Focused', 'Romantic', 'Motivated', 'Angry', 'Ambient'
  ];

  const ALGORITHMS = [
    { value: 'dynamic_programming', label: 'Dynamic Programming', desc: 'Optimal solution (recommended)' },
    { value: 'greedy', label: 'Greedy', desc: 'Fast but less optimal' },
    { value: 'simulated_annealing', label: 'Simulated Annealing', desc: 'Good balance' }
  ];

  useEffect(() => {
    if (!tracks.length) {
      // No tracks, show info message
    }
  }, [tracks]);

  if (!tracks.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <Sparkles size={64} className="text-gray-400 mb-4" />
        <h1 className="text-3xl font-bold mb-4">Optimize Playlist Flow</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
          Go to the dashboard, analyze a playlist, and then click "Optimize Flow" to get started.
        </p>
        <Button onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  const onDragEnd = (result) => {
    const { source, destination } = result;
    
    if (!destination) return;
    if (source.index === destination.index) return;

    const newTracks = Array.from(tracks);
    const [reorderedItem] = newTracks.splice(source.index, 1);
    newTracks.splice(destination.index, 0, reorderedItem);

    setTracks(newTracks);
    toast.success('Track order updated', { id: 'reorder' });
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    setFlowScore(null);

    try {
      console.log('⚡ Optimizing playlist flow...');
      const result = await optimizePlaylistFlow(
        tracks,
        startMood,
        endMood,
        algorithm
      );

      if (result.optimizedOrder) {
        const optimizedTracks = result.optimizedOrder.map(index => tracks[index]);
        setTracks(optimizedTracks);
        setFlowScore(result.flowScore);
        toast.success(`Flow optimized! Score: ${result.flowScore?.toFixed(2) || 'N/A'}`, { id: 'opt-success' });
      } else if (result.tracks) {
        setTracks(result.tracks);
        setFlowScore(result.flowScore);
        toast.success('Flow optimized successfully!', { id: 'opt-success' });
      }
    } catch (err) {
      console.error('Optimization failed:', err);
      toast.error(err.response?.data?.message || 'Failed to optimize flow', { id: 'opt-error' });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleDetectGaps = async () => {
    setIsDetectingGaps(true);

    try {
      console.log('🔍 Detecting mood gaps...');
      const result = await detectMoodGaps(tracks, 1.5);
      setMoodGaps(result);
      
      if (result.analysis_incomplete) {
        toast.error('Could not analyze mood gaps: these tracks are missing mood data. Try re-analyzing the playlist.', { id: 'gap-error' });
      } else if (result.gaps && result.gaps.length > 0) {
        toast.success(`Found ${result.gaps.length} mood gaps!`, { id: 'gap-success' });
      } else {
        toast.info('No significant mood gaps detected', { id: 'gap-info' });
      }
    } catch (err) {
      console.error('Gap detection failed:', err);
      toast.error('Failed to detect mood gaps', { id: 'gap-error' });
    } finally {
      setIsDetectingGaps(false);
    }
  };

  const handleFillGaps = async () => {
    setIsFillingGaps(true);

    try {
      console.log('🎵 Filling mood gaps...');
      const result = await fillMoodGaps(tracks);
      setGapRecommendations(result);
      
      if (result.recommendations && result.recommendations.length > 0) {
        toast.success(`Found ${result.recommendations.length} recommendations!`, { id: 'fill-success' });
      } else {
        toast.info('No gap-filling recommendations available', { id: 'fill-info' });
      }
    } catch (err) {
      console.error('Gap filling failed:', err);
      toast.error('Failed to fill mood gaps', { id: 'fill-error' });
    } finally {
      setIsFillingGaps(false);
    }
  };

  const handleSaveToSpotify = async () => {
    if (!playlistId) {
      toast.error('Cannot save: No playlist ID', { id: 'save-error' });
      return;
    }

    setIsSaving(true);

    try {
      const trackUris = tracks.map(t => `spotify:track:${t.id}`);
      await reorderPlaylist(playlistId, trackUris);
      toast.success('Playlist updated on Spotify!', { id: 'save-success' });
    } catch (err) {
      console.error('Failed to save:', err);
      toast.error('Failed to save to Spotify', { id: 'save-error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddGapRecommendation = (recommendation, position) => {
    if (!recommendation?.id) return;

    const newTracks = [...tracks];
    const newTrack = {
      id: recommendation.id,
      name: recommendation.name,
      artists: recommendation.artists || [],
      album: recommendation.album || {},
      mood: recommendation.targetMood || 'Unknown',
      features: recommendation.features || {}
    };

    newTracks.splice(position + 1, 0, newTrack);
    setTracks(newTracks);
    toast.success(`Added "${newTrack.name}" to playlist`, { id: 'add-success' });
  };

  const getMoodColor = (mood) => {
    const moodLower = mood?.toLowerCase() || '';
    
    if (moodLower.includes('happy') || moodLower.includes('joy')) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    } else if (moodLower.includes('sad') || moodLower.includes('melancholy')) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    } else if (moodLower.includes('energetic') || moodLower.includes('excited')) {
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    } else if (moodLower.includes('calm') || moodLower.includes('relaxed')) {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    } else if (moodLower.includes('angry') || moodLower.includes('aggressive')) {
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    } else if (moodLower.includes('romantic')) {
      return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
    } else if (moodLower.includes('focus')) {
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    } else {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-purple-600" />
          Flow Optimizer: {playlistName}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Drag and drop to reorder manually, or use AI to create the perfect mood arc.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-semibold">Optimization Settings</h2>
        </div>

        {/* Mood Journey */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Start Mood</label>
            <select
              value={startMood}
              onChange={(e) => setStartMood(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
            >
              {MOOD_OPTIONS.map(mood => (
                <option key={mood} value={mood}>{mood}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">End Mood</label>
            <select
              value={endMood}
              onChange={(e) => setEndMood(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
            >
              {MOOD_OPTIONS.map(mood => (
                <option key={mood} value={mood}>{mood}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Algorithm</label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
            >
              {ALGORITHMS.map(alg => (
                <option key={alg.value} value={alg.value}>{alg.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={handleOptimize} 
            isLoading={isOptimizing}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Optimize with AI
          </Button>

          <Button 
            onClick={handleDetectGaps}
            isLoading={isDetectingGaps}
            variant="secondary"
          >
            <AlertTriangle className="w-5 h-5 mr-2" />
            Detect Gaps
          </Button>

          <Button 
            onClick={handleFillGaps}
            isLoading={isFillingGaps}
            variant="secondary"
            disabled={!moodGaps || moodGaps.gaps?.length === 0}
          >
            <Plus className="w-5 h-5 mr-2" />
            Fill Gaps
          </Button>
          
          {playlistId && (
            <Button 
              onClick={handleSaveToSpotify}
              isLoading={isSaving}
              variant="secondary"
            >
              <Save className="w-5 h-5 mr-2" />
              Save to Spotify
            </Button>
          )}
        </div>

        {/* Flow Score */}
        {flowScore !== null && (
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            <div>
              <div className="font-semibold">Flow Score</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {flowScore.toFixed(2)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mood Gaps */}
      {moodGaps && moodGaps.gaps && moodGaps.gaps.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Detected Mood Gaps ({moodGaps.gaps.length})
          </h3>
          <div className="space-y-2">
            {moodGaps.gaps.map((gap, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      Gap at position {gap.position}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      From: {gap.from_track} → {gap.to_track}
                    </p>
                    <p className="text-xs text-gray-400">
                      Distance: {gap.distance?.toFixed(2)} • {gap.severity}
                    </p>
                  </div>
                  <span className="text-2xl">
                    {gap.severity === 'high' ? '🔴' : gap.severity === 'medium' ? '🟡' : '🟢'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gap Recommendations */}
      {gapRecommendations && gapRecommendations.recommendations && gapRecommendations.recommendations.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Plus className="w-5 h-5 text-green-600" />
            Recommended Gap Fillers ({gapRecommendations.recommendations.length})
          </h3>
          <div className="space-y-3">
            {gapRecommendations.recommendations.slice(0, 10).map((rec, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center gap-4">
                {rec.album?.images?.[0]?.url && (
                  <img
                    src={rec.album.images[0].url}
                    alt={rec.name}
                    className="w-16 h-16 rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{rec.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {rec.artists?.map(a => a.name).join(', ')}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleAddGapRecommendation(rec, index)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Track List */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4">
          Track Order ({tracks.length} tracks)
        </h2>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="tracks">
            {(provided, snapshot) => (
              <div
                className={`space-y-2 ${snapshot.isDraggingOver ? 'bg-indigo-50 dark:bg-indigo-900/10 rounded-lg p-2' : ''}`}
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {tracks.map((track, index) => (
                  <Draggable
                    key={track.id}
                    draggableId={track.id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex items-center gap-4 transition-shadow ${
                          snapshot.isDragging ? 'shadow-lg ring-2 ring-indigo-500' : 'hover:shadow-md'
                        }`}
                      >
                        <GripVertical className="text-gray-400 flex-shrink-0" />
                        
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center font-semibold text-indigo-600 dark:text-indigo-300">
                          {index + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{track.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {track.artists?.map(a => a.name).join(', ') || 'Unknown Artist'}
                          </p>
                        </div>

                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMoodColor(track.mood)}`}>
                          {track.mood || 'Unknown'}
                        </span>

                        {track.features && (
                          <div className="hidden md:flex gap-2 text-xs">
                            <span className="text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                              E: {Math.round((track.features.energy || 0) * 100)}%
                            </span>
                            <span className="text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                              V: {Math.round((track.features.valence || 0) * 100)}%
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Info */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <Info className="w-8 h-8 text-purple-600 dark:text-purple-400 flex-shrink-0" />
          <div>
            <h3 className="font-bold mb-2">💡 How it works</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• <strong>Optimize with AI:</strong> Reorders tracks for smooth mood transitions</li>
              <li>• <strong>Detect Gaps:</strong> Finds abrupt mood changes</li>
              <li>• <strong>Fill Gaps:</strong> Suggests tracks to bridge transitions</li>
              <li>• <strong>Manual Reorder:</strong> Drag and drop to customize</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowOptimizer;