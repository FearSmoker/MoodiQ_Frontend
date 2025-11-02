import { Wand2, Plus } from 'lucide-react';

const MoodGenerator = () => {
  const moods = [
    { name: 'Happy & Energetic', color: 'from-yellow-400 to-orange-500', emoji: '😄' },
    { name: 'Calm & Relaxed', color: 'from-blue-400 to-cyan-500', emoji: '😌' },
    { name: 'Sad & Melancholic', color: 'from-gray-400 to-blue-500', emoji: '😢' },
    { name: 'Focused & Productive', color: 'from-purple-400 to-pink-500', emoji: '🎯' },
    { name: 'Romantic', color: 'from-red-400 to-pink-500', emoji: '❤️' },
    { name: 'Workout Energy', color: 'from-orange-500 to-red-500', emoji: '💪' },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mood Generator</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create new playlists based on your desired mood
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {moods.map((mood, index) => (
          <button
            key={index}
            className={`bg-gradient-to-br ${mood.color} text-white rounded-xl p-8 text-left hover:scale-105 transition-transform shadow-lg`}
          >
            <div className="text-4xl mb-3">{mood.emoji}</div>
            <h3 className="text-xl font-bold mb-2">{mood.name}</h3>
            <div className="flex items-center gap-2 text-sm opacity-90">
              <Plus className="w-4 h-4" />
              <span>Generate Playlist</span>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Custom Mood</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Describe the mood you want and let AI create a perfect playlist
        </p>
        <textarea
          placeholder="E.g., 'Upbeat music for a road trip' or 'Cozy evening vibes'"
          className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 mb-4"
          rows={3}
        />
        <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <Wand2 className="w-5 h-5" />
          Generate Custom Playlist
        </button>
      </div>
    </div>
  );
};


export default MoodGenerator;
