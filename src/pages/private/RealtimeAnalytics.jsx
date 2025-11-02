import { Activity } from "lucide-react";

const RealtimeAnalytics = () => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Realtime Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your listening patterns and engagement in real-time
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <Activity className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Live Insights Coming Soon</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Get live updates on your listening habits, mood shifts, and favorite genres 
            with real-time visual analytics and dynamic reports.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm">
              Live Tracking
            </span>
            <span className="px-3 py-1 bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 rounded-full text-sm">
              Graph Insights
            </span>
            <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-sm">
              Realtime Trends
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealtimeAnalytics;