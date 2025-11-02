import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';

const MoodLineChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No mood data available
      </div>
    );
  }

  const chartData = data.map((track, index) => ({
    name: `${index + 1}`,
    trackName: track.name,
    valence: track.features?.valence ?? track.mood?.scores?.valence ?? 0,
    energy: track.features?.energy ?? track.mood?.scores?.energy ?? 0,
    danceability: track.features?.danceability ?? track.mood?.scores?.danceability ?? 0,
  }));

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
            dataKey="name"
            label={{ value: 'Track Position', position: 'insideBottom', offset: -5 }}
            stroke="currentColor"
            opacity={0.5}
          />
          <YAxis
            domain={[0, 1]}
            label={{ value: 'Score', angle: -90, position: 'insideLeft' }}
            stroke="currentColor"
            opacity={0.5}
          />
          <Tooltip content={<CustomTooltip />} />
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
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 p-4 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="font-bold text-sm mb-2">Track #{data.name}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 truncate max-w-xs">
          {data.trackName}
        </p>
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