/**
 * Social Proof Components
 * Global counters, community stats, and social proof elements
 */

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Users, 
  Clock, 
  Flame, 
  TrendingUp,
  Globe,
  Zap,
  Award,
  Target
} from 'lucide-react';
import { Card } from '../ui';

// Simulated global stats (in a real app, this would come from an API)
const getGlobalStats = () => ({
  totalUsers: 12847,
  hoursThisWeek: 156234,
  activeNow: 845,
  longestStreak: 156,
  avgDailyHours: 4.2,
  completedGoals: 8934,
});

/**
 * Global Community Banner
 * Shows real-time community activity
 */
export const CommunityBanner = () => {
  const [stats, setStats] = useState(getGlobalStats);
  const [activeNow, setActiveNow] = useState(stats.activeNow);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNow(prev => prev + Math.floor(Math.random() * 3) - 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-teal-500 rounded-2xl p-4">
      {/* Background animation */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
      
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping" />
            </div>
            <span className="text-white font-medium">{activeNow.toLocaleString()} locking in now</span>
          </div>
          <div className="h-4 w-px bg-white/30" />
          <div className="flex items-center gap-2 text-white/90">
            <Clock className="w-4 h-4" />
            <span>{stats.hoursThisWeek.toLocaleString()}h this week</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-white">
          <Globe className="w-4 h-4" />
          <span className="font-medium">{stats.totalUsers.toLocaleString()} members</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Live Activity Feed
 * Shows real-time activity from the community
 */
export const LiveActivityFeed = () => {
  const [activities, setActivities] = useState([
    { id: 1, user: 'Sarah K.', action: 'completed', value: '4.5h session', time: '2m ago', avatar: '👩‍🎨' },
    { id: 2, user: 'Mike R.', action: 'started', value: 'deep work', time: '5m ago', avatar: '👨‍🔬' },
    { id: 3, user: 'Emma L.', action: 'achieved', value: '30-day streak! 🔥', time: '12m ago', avatar: '👩‍💼' },
    { id: 4, user: 'Alex T.', action: 'logged', value: '6.2h today', time: '15m ago', avatar: '🧑‍🚀' },
  ]);

  return (
    <Card className="p-4 bg-white dark:bg-slate-900">
      <div className="flex items-center gap-2 mb-4">
        <div className="relative">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping" />
        </div>
        <span className="font-semibold text-gray-900 dark:text-white">Live Activity</span>
      </div>
      
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div 
            key={activity.id}
            className="flex items-center gap-3 animate-in slide-in-from-left-2"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <span className="text-xl">{activity.avatar}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                <span className="font-medium">{activity.user}</span>
                {' '}{activity.action}{' '}
                <span className="text-purple-600 dark:text-purple-400 font-medium">{activity.value}</span>
              </p>
            </div>
            <span className="text-xs text-gray-400">{activity.time}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

/**
 * Social Proof Stats Grid
 * Display impressive community statistics
 */
export const SocialProofStats = () => {
  const stats = getGlobalStats();

  const statCards = [
    {
      icon: Users,
      value: stats.totalUsers.toLocaleString(),
      label: 'Professionals',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Clock,
      value: `${(stats.hoursThisWeek / 1000).toFixed(0)}k`,
      label: 'Hours This Week',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Flame,
      value: stats.longestStreak,
      label: 'Longest Streak',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Target,
      value: stats.completedGoals.toLocaleString(),
      label: 'Goals Completed',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {statCards.map((stat, index) => (
        <Card 
          key={index}
          className="p-4 bg-white dark:bg-slate-900 hover:scale-105 transition-transform cursor-default"
        >
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
            <stat.icon className="w-5 h-5 text-white" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stat.value}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {stat.label}
          </div>
        </Card>
      ))}
    </div>
  );
};

/**
 * Trending Banner
 * "X people achieved Y this week"
 */
export const TrendingBanner = ({ metric = 'hours', value = 5000 }) => {
  const messages = {
    hours: `${value.toLocaleString()} professionals logged 20+ hours this week`,
    streaks: `${value.toLocaleString()} members maintained their streak today`,
    goals: `${value.toLocaleString()} goals completed this week`,
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-100 dark:border-green-800 rounded-xl">
      <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
        <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
      </div>
      <div>
        <div className="font-medium text-green-800 dark:text-green-300">
          🚀 Trending Now
        </div>
        <div className="text-sm text-green-700 dark:text-green-400">
          {messages[metric]}
        </div>
      </div>
    </div>
  );
};

TrendingBanner.propTypes = {
  metric: PropTypes.oneOf(['hours', 'streaks', 'goals']),
  value: PropTypes.number,
};

/**
 * Achievement Showcase
 * Display top achievers for social proof
 */
export const AchievementShowcase = () => {
  const topAchievers = [
    { name: 'Jennifer M.', achievement: '100 Day Streak', avatar: '👩‍💻', badge: '🔥' },
    { name: 'David K.', achievement: '1000 Hours Logged', avatar: '👨‍🏫', badge: '⭐' },
    { name: 'Lisa W.', achievement: 'Perfect Week x10', avatar: '👩‍🔬', badge: '🏆' },
  ];

  return (
    <Card className="p-4 bg-white dark:bg-slate-900">
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5 text-yellow-500" />
        <span className="font-semibold text-gray-900 dark:text-white">Top Achievers</span>
      </div>
      
      <div className="space-y-3">
        {topAchievers.map((achiever, index) => (
          <div 
            key={index}
            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl"
          >
            <span className="text-2xl">{achiever.avatar}</span>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 dark:text-white truncate">
                {achiever.name}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {achiever.achievement}
              </div>
            </div>
            <span className="text-2xl">{achiever.badge}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default {
  CommunityBanner,
  LiveActivityFeed,
  SocialProofStats,
  TrendingBanner,
  AchievementShowcase,
};
