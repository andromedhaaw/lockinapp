import { useState } from 'react';
import { User } from 'lucide-react';
import ContributionGraph from './ContributionGraph';
import GamificationStats from './GamificationStats';
import ShareModal from './ShareModal';
import ProfileSettings from './ProfileSettings';
import BadgeCollection from './BadgeCollection';
import { useWorkHistory } from '../../hooks';
import { calculateStreak, calculateLevel } from '../../utils/gamificationUtils';

const Profile = ({ grindMode, setGrindMode, darkMode, setDarkMode, adhdMode, setAdhdMode }) => {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const { getTotalYearHours, getHoursForDate } = useWorkHistory();
  
  // Calculate Stats
  const workHistory = JSON.parse(localStorage.getItem('timeTracker_workHistory') || '{}');
  const streak = calculateStreak(workHistory);
  const totalHours = getTotalYearHours();
  const levelData = calculateLevel(totalHours);
  const todayHours = getHoursForDate(new Date());
  const focusSessions = JSON.parse(localStorage.getItem('lockin_focus_sessions') || '[]');
  const sessionHistory = JSON.parse(localStorage.getItem('timeTracker_workSessions') || '[]');
  const allSessions = [...focusSessions, ...sessionHistory];
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - 6);
  const weekHours = Object.entries(workHistory).reduce((sum, [dateKey, hours]) => {
    const date = new Date(`${dateKey}T00:00:00`);
    return date >= weekStart ? sum + Number(hours || 0) : sum;
  }, 0);
  const xp = Math.round(totalHours * 100 + allSessions.length * 25);
  const storedTasks = JSON.parse(localStorage.getItem('lockin_tasks_offline') || '[]');
  const completedTasks = storedTasks.filter((task) => task.completed || task.done).length;
  const trees = JSON.parse(localStorage.getItem('lockin_garden_data_v2') || '[]').filter(Boolean).length;
  const recentDates = new Set(allSessions.filter((session) => session.completedAt || session.startTime).map((session) => (session.completedAt || session.startTime).slice(0, 10)));
  const activeDays = [...recentDates].filter((date) => {
    const day = new Date(`${date}T00:00:00`);
    return day >= weekStart;
  }).length;
  const earlySession = allSessions.some((session) => new Date(session.completedAt || session.startTime || 0).getHours() < 9);
  const longSession = allSessions.some((session) => Number(session.durationMinutes || 0) >= 90 || Number(session.duration || 0) >= 90 * 60 * 1000);
  const weeklyRank = Number(localStorage.getItem('lockin_weekly_rank') || 0);
  const monthlyRank = Number(localStorage.getItem('lockin_monthly_rank') || 0);

  const shareStats = {
    sessionHours: todayHours.toFixed(1),
    streak: streak,
    level: levelData.level.title
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-center gap-4 p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400 border-4 border-white dark:border-slate-800 shadow-sm">
          <User className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Productivity Master</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Keep locking in!</p>
          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#4dcd7d]/10 px-3 py-1 text-xs font-bold text-[#249653]">Level {levelData.level.title} · {xp.toLocaleString()} XP</div>
        </div>
      </div>

      {/* Gamification Stats */}
      <GamificationStats 
        streak={streak} 
        levelData={levelData} 
        onShare={() => setIsShareOpen(true)}
      />

      {/* Stats/Graph */}
      <div>
        <h3 className="text-lg font-semibold text-green-800 dark:text-green-400 mb-3 px-1">Your Productivity Graph</h3>
        <ContributionGraph />
      </div>

      <BadgeCollection
        totalHours={totalHours}
        weekHours={weekHours}
        streak={streak}
        sessions={allSessions.length}
        tasks={completedTasks}
        trees={trees}
        weeklyRank={weeklyRank}
        monthlyRank={monthlyRank}
        activeDays={activeDays}
        earlySession={earlySession}
        longSession={longSession}
      />

      {/* Settings */}
      <ProfileSettings 
        grindMode={grindMode} 
        setGrindMode={setGrindMode}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        adhdMode={adhdMode}
        setAdhdMode={setAdhdMode}
      />

      <ShareModal 
        isOpen={isShareOpen} 
        onClose={() => setIsShareOpen(false)} 
        stats={shareStats} 
      />

      {/* Logout Button */}
      <button
        onClick={() => {
          // Clear user session data if needed
          localStorage.removeItem('lockin_user');
          // Redirect to landing/home page
          window.location.href = '/';
        }}
        className="w-full py-3 px-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors border border-red-100 dark:border-red-800"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" x2="9" y1="12" y2="12" />
        </svg>
        Logout
      </button>
    </div>
  );
};

export default Profile;
