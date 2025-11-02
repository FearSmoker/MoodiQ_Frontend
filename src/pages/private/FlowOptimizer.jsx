import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { usePlaylistStore } from '../../store/playlistStore';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { GripVertical, Save, Sparkles } from 'lucide-react';

const MOOD_MAP = {
  'Calm': { valence: 0.3, energy: 0.2 },
  'Happy': { valence: 0.8, energy: 0.7 },
  'Sad': { valence: 0.2, energy: 0.3 },
  'Energetic': { valence: 0.7, energy: 0.9 },
  'Angry': { valence: 0.3, energy: 0.8 },
  'Relaxed': { valence: 0.6, energy: 0.3 },
};

const MOOD_OPTIONS = Object.keys(MOOD_MAP);

const Optimize = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { optimizeFlow, reorderPlaylist } = usePlaylistStore();
  
  const initialTracks = location.state?.tracks || [];
  const playlistId = location.state?.playlistId;
  const playlistName = location.state?.playlistName || 'Playlist';

  const [tracks, setTracks] = useState(initialTracks);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [startMood, setStartMood] = useState('Calm');
  const [endMood, setEndMood] = useState('Happy');

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
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);

    try {
      const result = await optimizeFlow(
        tracks,
        MOOD_MAP[startMood],
        MOOD_MAP[endMood]
      );

      // Backend returns optimized order
      if (result.optimizedOrder) {
        const optimizedTracks = result.optimizedOrder.map(index => tracks[index]);
        setTracks(optimizedTracks);
      }
    } catch (err) {
      console.error('Optimization failed:', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSaveToSpotify = async () => {
    if (!playlistId) {
      toast.error('Cannot save: No playlist ID');
      return;
    }

    setIsSaving(true);

    try {
      const trackUris = tracks.map(t => `spotify:track:${t.id}`);
      await reorderPlaylist(playlistId, trackUris);
      toast.success('Playlist updated on Spotify!');
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Optimize: {playlistName}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Drag and drop to reorder manually, or use AI to create the perfect mood arc.
        </p>
      </div>

      {/* Mood Selection */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Mood Journey</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startMood" className="block text-sm font-medium mb-2">
              Start Mood
            </label>
            <select
              id="startMood"
              value={startMood}
              onChange={(e) => setStartMood(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500"
            >
              {MOOD_OPTIONS.map(mood => (
                <option key={mood} value={mood}>{mood}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="endMood" className="block text-sm font-medium mb-2">
              End Mood
            </label>
            <select
              id="endMood"
              value={endMood}
              onChange={(e) => setEndMood(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500"
            >
              {MOOD_OPTIONS.map(mood => (
                <option key={mood} value={mood}>{mood}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-4">
          <Button 
            onClick={handleOptimize} 
            isLoading={isOptimizing}
            className="flex items-center gap-2"
          >
            <Sparkles size={18} />
            Optimize with AI
          </Button>
          
          {playlistId && (
            <Button 
              onClick={handleSaveToSpotify}
              isLoading={isSaving}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <Save size={18} />
              Save to Spotify
            </Button>
          )}
        </div>
      </div>

      {/* Track List with Drag & Drop */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">
          Track Order ({tracks.length} tracks)
        </h2>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="tracks">
            {(provided, snapshot) => (
              <div
                className={`space-y-2 ${snapshot.isDraggingOver ? 'bg-indigo-50 dark:bg-indigo-900/10' : ''}`}
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
                        <GripVertical size={20} className="text-gray-400 flex-shrink-0" />
                        
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center font-semibold text-indigo-600 dark:text-indigo-300">
                          {index + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{track.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {track.artists?.map(a => a.name).join(', ') || 'Unknown Artist'}
                          </p>
                        </div>

                        <div className="flex-shrink-0">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            getMoodColor(track.mood || track.moodScore)
                          }`}>
                            {track.mood || 'Unknown'}
                          </span>
                        </div>

                        {track.features && (
                          <div className="hidden md:flex gap-2 text-xs">
                            <span className="text-gray-500">
                              Energy: {(track.features.energy * 100).toFixed(0)}%
                            </span>
                            <span className="text-gray-500">
                              Valence: {(track.features.valence * 100).toFixed(0)}%
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
    </div>
  );
};

// Helper function to get mood-based colors
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
  } else {
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
};

export default Optimize;