const MoodAnalyzer = () => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mood Analyzer</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Analyze the emotional patterns in your playlists
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
            <Heart className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Deep Mood Analysis Coming Soon</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            This feature will provide detailed mood analysis including emotional trajectories, 
            mood transitions, and personalized insights about your listening patterns.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
              Emotion Detection
            </span>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
              Pattern Recognition
            </span>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
              Trend Analysis
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};


export {
  MoodAnalyzer
};