import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, AreaChart } from 'recharts';
import { motion } from 'framer-motion';

const MoodLineChart = ({ data, showAggregated = false }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No mood data available
      </div>
    );
  }

  // Format data for the chart
  const chartData = data.map((item, index) => {
    if (showAggregated) {
      // Support both flat aggregated objects and nested aggregatedFeatures objects
      return {
        date: item.date || `Day ${index + 1}`,
        valence: item.valence ?? item.aggregatedFeatures?.valence ?? 0.5,
        energy: item.energy ?? item.aggregatedFeatures?.energy ?? 0.5,
        danceability: item.danceability ?? item.aggregatedFeatures?.danceability ?? 0.5,
        acousticness: item.acousticness ?? item.aggregatedFeatures?.acousticness ?? 0.5
      };
    }
    
    // Fallback to individual track data
    return {
      name: item.name || `${index + 1}`,
      trackName: item.name || item.track || 'Unknown',
      valence: item.features?.valence ?? item.mood?.scores?.valence ?? 0.5,
      energy: item.features?.energy ?? item.mood?.scores?.energy ?? 0.5,
      danceability: item.features?.danceability ?? item.mood?.scores?.danceability ?? 0.5,
      acousticness: item.features?.acousticness ?? item.mood?.scores?.acousticness ?? 0.5
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full h-80"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
          <XAxis
            dataKey={showAggregated ? 'date' : 'name'}
            label={{ 
              value: showAggregated ? 'Time Period' : 'Track Position', 
              position: 'insideBottom', 
              offset: -5 
            }}
            stroke="currentColor"
            opacity={0.5}
          />
          <YAxis
            domain={[0, 1]}
            label={{ value: 'Score (0-1)', angle: -90, position: 'insideLeft' }}
            stroke="currentColor"
            opacity={0.5}
          />
          <Tooltip content={<CustomTooltip showAggregated={showAggregated} />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="valence"
            stroke="#8b5cf6"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="Valence (Positivity)"
          />
          <Line
            type="monotone"
            dataKey="energy"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="Energy"
          />
          <Line
            type="monotone"
            dataKey="danceability"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            name="Danceability"
            strokeDasharray="5 5"
          />
          <Line
            type="monotone"
            dataKey="acousticness"
            stroke="#06b6d4"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            name="Acousticness"
            strokeDasharray="3 3"
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

const CustomTooltip = ({ active, payload, showAggregated }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 p-4 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="font-bold text-sm mb-2">
          {showAggregated 
            ? data.date 
            : `Track #${data.name}`
          }
        </p>
        {!showAggregated && data.trackName && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 truncate max-w-xs">
            {data.trackName}
          </p>
        )}
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4 text-sm">
            <span style={{ color: entry.color }}>{entry.name}:</span>
            <span className="font-semibold">{(entry.value * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default MoodLineChart;