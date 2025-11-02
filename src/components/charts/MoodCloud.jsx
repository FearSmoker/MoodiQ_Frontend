import { motion } from 'framer-motion';

const MoodCloud = ({ moodData }) => {
  // Process moodData to count mood occurrences
  const moodCounts = (moodData || []).reduce((acc, track) => {
    const mood = track.mood || track.moodScore || 'Unknown';
    acc[mood] = (acc[mood] || 0) + 1;
    return acc;
  }, {});

  const moods = Object.entries(moodCounts)
    .sort((a, b) => b[1] - a[1]) // Sort by count descending
    .slice(0, 15); // Limit to top 15 moods

  if (!moods.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Mood Cloud</h2>
        <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400">
          <p>Analyze a playlist to see its mood cloud</p>
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...moods.map(([, count]) => count));
  const minCount = Math.min(...moods.map(([, count]) => count));

  const getMoodColor = (mood) => {
    const moodLower = mood.toLowerCase();
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
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
    }
  };

  const getFontSize = (count) => {
    const normalized = (count - minCount) / (maxCount - minCount || 1);
    return 0.875 + normalized * 1.5; // Between 0.875rem and 2.375rem
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Mood Cloud</h2>
      <div className="flex flex-wrap gap-3 items-center justify-center min-h-[200px]">
        {moods.map(([mood, count], index) => (
          <motion.span
            key={mood}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className={`px-4 py-2 rounded-full font-medium cursor-default transition-transform hover:scale-110 ${getMoodColor(mood)}`}
            style={{ 
              fontSize: `${getFontSize(count)}rem`,
            }}
            title={`${count} tracks`}
          >
            {mood}
          </motion.span>
        ))}
      </div>
      <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
        Hover over moods to see track counts
      </div>
    </div>
  );
};

export default MoodCloud;