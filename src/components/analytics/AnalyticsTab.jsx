import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { TrendingUp, Calendar, Zap, ArrowUpRight } from 'lucide-react';
import { useWorkHistory } from '../../hooks';
import { useMemo } from 'react';

const AnalyticsTab = () => {
  const { getWeekDataByOffset } = useWorkHistory();
  
  // Get current week data
  const weekData = useMemo(() => getWeekDataByOffset(0), [getWeekDataByOffset]);
  
  const chartData = weekData.data.map(day => ({
    name: day.label, // Mon, Tue
    fullDate: day.sublabel,
    hours: parseFloat(day.hours.toFixed(1)),
    isToday: day.isToday
  }));

  const totalHours = weekData.totalHours.toFixed(1);
  const averageHours = weekData.averageHours.toFixed(1);
  
  // Calculate most productive day
  const mostProductiveDay = useMemo(() => {
    return weekData.data.reduce((max, day) => day.hours > max.hours ? day : max, weekData.data[0]);
  }, [weekData]);

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-green-100 dark:border-green-900 shadow-xl shadow-green-900/10">
          <p className="font-bold text-gray-800 dark:text-white mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <p className="text-sm font-medium text-gray-600 dark:text-green-400">
              {payload[0].value} hours
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Stats Card */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xl shadow-green-900/5">
        {/* Glow effect background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Your Productivity This Week
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
                {totalHours}
              </span>
              <span className="text-xl font-medium text-gray-500 dark:text-gray-500 mb-1">hours</span>
              <div className="ml-2 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>Top 5%</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              This Week
            </button>
          </div>
        </div>

        {/* Beautiful Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={1} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0.4} />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" strokeOpacity={0.1} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(34, 197, 94, 0.05)', radius: 8 }} />
              <Bar 
                dataKey="hours" 
                fill="url(#barGradient)" 
                radius={[8, 8, 8, 8]}
                barSize={32}
                animationDuration={1500}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isToday ? '#22c55e' : 'url(#barGradient)'}
                    style={{ filter: entry.isToday ? 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.4))' : 'none' }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Most Productive Day */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-green-500/30 transition-colors">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap className="w-12 h-12 text-green-500" />
          </div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Most Productive Day</p>
          <div className="flex items-end gap-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{mostProductiveDay.label}</h3>
            <span className="text-green-600 dark:text-green-400 font-bold mb-0.5">({mostProductiveDay.hours.toFixed(1)}h)</span>
          </div>
        </div>

        {/* Daily Average */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm group hover:border-green-500/30 transition-colors">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Daily Average</p>
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{averageHours}h</h3>
            <span className="text-xs font-medium text-gray-400">/ day</span>
          </div>
        </div>

        {/* Focus Score */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm group hover:border-green-500/30 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Focus Score</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">85%</h3>
            </div>
            <div className="w-10 h-10 rounded-full border-4 border-green-500/30 border-t-green-500 flex items-center justify-center transform -rotate-45">
              <ArrowUpRight className="w-4 h-4 text-green-500 transform rotate-45" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;
