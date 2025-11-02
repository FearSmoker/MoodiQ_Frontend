import { Music } from "lucide-react";

const LyricsFusion = () => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Lyrics Fusion</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Explore lyrical themes and emotions across your favorite tracks
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
            <Music className="w-10 h-10 text-orange-600 dark:text-orange-400" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Lyrical Insights Coming Soon</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Dive deep into your songs’ lyrics to uncover emotions, patterns, and 
            meaningful connections between words and mood.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full text-sm">
              Emotion Mapping
            </span>
            <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-sm">
              Keyword Trends
            </span>
            <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
              Theme Detection
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LyricsFusion;