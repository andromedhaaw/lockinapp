import { Trophy, ChevronUp, ChevronDown, Minus, Crown } from 'lucide-react';
import { useState } from 'react';

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState('global');
  const [timePeriod, setTimePeriod] = useState('weekly');

  const generateMockData = (period) => {
    // Simulate different data for different periods
    const multipliers = {
      daily: 0.15,
      weekly: 1,
      monthly: 4.2,
      yearly: 50,
      all_time: 120
    };
    
    const mult = multipliers[period] || 1;
    
    return [
      { rank: 1, name: "Marc_Lou", hours: 142.5 * mult, streak: 45, change: 'up', avatar: 'bg-blue-100 text-blue-600' },
      { rank: 2, name: "Pieter_Levels", hours: 138.2 * mult, streak: 32, change: 'up', avatar: 'bg-purple-100 text-purple-600' },
      { rank: 3, name: "Productivity_User", hours: 98.5 * mult, streak: 12, change: 'same', avatar: 'bg-green-100 text-green-600', isMe: true },
      { rank: 4, name: "Nikita_Bier", hours: 82.0 * mult, streak: 8, change: 'down', avatar: 'bg-amber-100 text-amber-600' },
      { rank: 5, name: "Indie_Hacker_99", hours: 45.2 * mult, streak: 3, change: 'same', avatar: 'bg-gray-100 text-gray-600' },
    ].sort((a, b) => b.hours - a.hours).map((u, i) => ({ ...u, rank: i + 1 }));
  };

  const users = generateMockData(timePeriod);

  const periods = [
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'yearly', label: 'Yearly' },
    { id: 'all_time', label: 'All Time' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-500">
          <Trophy className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Leaderboard</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">See who is locking in the most.</p>
      </div>

      {/* Main Tabs (Global/Friends) */}
      <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
        <button
          onClick={() => setActiveTab('global')}
          className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'global' ? 'bg-white dark:bg-gray-700 shadow text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Global Elite
        </button>
        <button
          onClick={() => setActiveTab('friends')}
          className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'friends' ? 'bg-white dark:bg-gray-700 shadow text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Friends
        </button>
      </div>

      {/* Time Period Filters */}
      <div className="flex justify-center flex-wrap gap-2">
        {periods.map((p) => (
          <button
            key={p.id}
            onClick={() => setTimePeriod(p.id)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              timePeriod === p.id
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500 ring-1 ring-amber-200 dark:ring-amber-800'
                : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
        {users.map((user) => (
          <div 
            key={user.rank}
            className={`flex items-center gap-4 p-4 border-b border-gray-50 dark:border-slate-800 last:border-0 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors ${
              user.isMe ? 'bg-green-50/50 dark:bg-green-900/10 hover:bg-green-50 dark:hover:bg-green-900/20' : ''
            }`}
          >
            <div className="text-sm font-bold w-6 text-gray-400 dark:text-gray-500 text-center">
              {user.rank <= 3 ? (
                <Crown className={`w-5 h-5 ${
                  user.rank === 1 ? 'text-amber-500 fill-amber-500' : 
                  user.rank === 2 ? 'text-gray-400 fill-gray-400' : 
                  'text-amber-700 fill-amber-700'
                }`} />
              ) : user.rank}
            </div>
            
            <div className={`w-10 h-10 rounded-full ${user.avatar} flex items-center justify-center font-bold text-xs relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black/10 dark:bg-white/10" />
              {user.name.substring(0, 2).toUpperCase()}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${user.isMe ? 'text-green-800 dark:text-green-400' : 'text-gray-800 dark:text-white'}`}>
                  {user.name} {user.isMe && '(You)'}
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {user.streak} day streak
              </div>
            </div>

            <div className="text-right">
              <div className="font-bold text-gray-800 dark:text-white">
                {user.hours.toFixed(1)}h
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-normal ml-1">
                  {timePeriod === 'daily' ? 'today' : timePeriod === 'all_time' ? 'total' : 'this ' + timePeriod.replace('ly', '')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
