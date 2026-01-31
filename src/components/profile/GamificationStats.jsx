import { Flame, Trophy, Share2 } from 'lucide-react';

const GamificationStats = ({ streak, levelData, onShare }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Streak Card */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-100 flex items-center justify-between">
        <div>
          <div className="text-sm text-orange-600 font-medium mb-1">Current Streak</div>
          <div className="text-3xl font-bold text-gray-800 flex items-baseline gap-1">
            {streak} <span className="text-sm font-normal text-gray-500">days</span>
          </div>
        </div>
        <div className={`p-3 rounded-full ${streak > 0 ? 'bg-orange-100 text-orange-500' : 'bg-gray-100 text-gray-400'}`}>
          <Flame className="w-6 h-6 fill-current" />
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
