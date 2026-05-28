import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs">
      <p className="text-text-secondary mb-1">
        {new Date(label).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </p>
      <p className="text-text-primary font-semibold">
        {payload[0].value} kg
      </p>
    </div>
  );
};

export default function WeightChart({ data = [], className = '' }) {
  if (!data.length) {
    return (
      <div className={`glass-card p-6 flex flex-col items-center justify-center min-h-[200px] ${className}`}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-tertiary mb-3">
          <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
        </svg>
        <p className="text-sm text-text-secondary">No weight data yet</p>
        <p className="text-xs text-text-tertiary mt-1">Log your weight to see trends</p>
      </div>
    );
  }

  const chartData = data.map(item => ({
    ...item,
    timestamp: new Date(item.date).getTime(),
  }));

  const weights = data.map(d => d.weight);
  const minW = Math.floor(Math.min(...weights) - 1);
  const maxW = Math.ceil(Math.max(...weights) + 1);

  return (
    <div className={`glass-card p-4 ${className}`}>
      <h3 className="text-sm font-semibold text-text-primary mb-4 px-1">Weight Trend</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <defs>
            <linearGradient id="weightGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#A78BFA" />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.04)"
            vertical={false}
          />
          <XAxis
            dataKey="timestamp"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(tick) => new Date(tick).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            stroke="rgba(255,255,255,0.15)"
            tick={{ fill: '#7a7a8a', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[minW, maxW]}
            stroke="rgba(255,255,255,0.15)"
            tick={{ fill: '#7a7a8a', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            unit=" kg"
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="url(#weightGradient)"
            strokeWidth={2.5}
            dot={{ fill: '#6366F1', r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#A78BFA', stroke: '#6366F1', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
