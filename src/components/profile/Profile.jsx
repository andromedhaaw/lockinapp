import { useState } from 'react';
import { User } from 'lucide-react';
import ContributionGraph from './ContributionGraph';
import GamificationStats from './GamificationStats';
import ShareModal from './ShareModal';
import ProfileSettings from './ProfileSettings';
import { useWorkHistory } from '../../hooks';
import { calculateStreak, calculateLevel } from '../../utils/gamificationUtils';

const Profile = ({ grindMode, setGrindMode, darkMode, setDarkMode }) => {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const { getTotalYearHours, getHoursForDate } = useWorkHistory();
  
  // Calculate Stats
  const workHistory = JSON.parse(localStorage.getItem('timeTracker_workHistory') || '{}');
  const streak = calculateStreak(workHistory);
  const totalHours = getTotalYearHours();
  const levelData = calculateLevel(totalHours);
  const todayHours = getHoursForDate(new Date());

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

      {/* Settings */}
      <ProfileSettings 
        grindMode={grindMode} 
        setGrindMode={setGrindMode}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
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
