import { Flame, Trophy, Share2, Coins } from 'lucide-react';
import { useGarden } from '../../context/GardenContext';

const getLocalDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const GamificationStats = ({ streak, levelData, onShare }) => {
  const { coins } = useGarden();
  const workHistory = JSON.parse(localStorage.getItem('timeTracker_workHistory') || '{}');
  const streakDays = Array.from({ length: 5 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (4 - index));
    return {
      label: date.toLocaleDateString('en-US', { weekday: 'narrow' }),
      active: (workHistory[getLocalDateKey(date)] || 0) > 0,
    };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Coins Card */}
      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-4 rounded-xl border border-amber-100 flex items-center justify-between">
        <div>
          <div className="text-sm text-amber-600 font-medium mb-1">Focus Coins</div>
          <div className="text-3xl font-bold text-gray-800 flex items-baseline gap-1">
            {coins} <span className="text-sm font-normal text-gray-500">LC</span>
          </div>
        </div>
        <div className="p-3 rounded-full bg-amber-100 text-amber-500">
          <Coins className="w-6 h-6 fill-current" />
        </div>
      </div>

      {/* Streak Card */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-orange-100 dark:border-slate-800 text-gray-800 dark:text-white flex items-center gap-3 shadow-sm">
        <Flame className="w-10 h-10 shrink-0 fill-orange-400 text-orange-500" />
        <div className="min-w-0">
          <div className="text-lg font-extrabold leading-tight">{streak} Day Streak</div>
          <div className="mt-1 flex items-end gap-1.5">
            {streakDays.map((day, index) => (
              <div key={`${day.label}-${index}`} className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-gray-400">{day.label}</span>
                <span className={`flex h-6 w-6 items-center justify-center rounded-md text-sm font-black ${day.active ? 'bg-[#4dcd7d] text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-400'}`}>
                  {day.active ? '✓' : '·'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Level Card */}
      <div className={`${levelData.level.bg} p-4 rounded-xl border border-gray-100 flex flex-col justify-between`}>
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className={`text-sm font-medium ${levelData.level.color}`}>Current Rank</div>
            <div className="text-2xl font-bold text-gray-800">{levelData.level.title}</div>
          </div>
          <Trophy className={`w-6 h-6 ${levelData.level.color}`} />
        </div>
        
        {/* Progress Bar */}
        {levelData.nextLevel && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Progress to {levelData.nextLevel.title}</span>
              <span>{Math.round(levelData.progress)}%</span>
            </div>
            <div className="h-2 w-full bg-white/50 rounded-full overflow-hidden">
              <div 
                className={`h-full ${levelData.level.color.replace('text-', 'bg-')} transition-all duration-500`}
                style={{ width: `${levelData.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Share Button (Full Width) */}
      <button 
        onClick={onShare}
        className="md:col-span-2 py-3 px-4 bg-gray-900 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors shadow-sm active:scale-[0.98] transform"
      >
        <Share2 className="w-4 h-4" />
        Share My Stats
      </button>
    </div>
  );
};

export default GamificationStats;
