import { Sparkles } from "lucide-react";

const Recommendations = () => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Recommendations</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover songs curated specially for your current mood
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Smart Recommendations Coming Soon</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Get AI-powered song suggestions tailored to your emotions, listening 
            patterns, and evolving tastes.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="px-3 py-1 bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 rounded-full text-sm">
              AI Curation
            </span>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
              Personalized Playlists
            </span>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
              Smart Discovery
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;