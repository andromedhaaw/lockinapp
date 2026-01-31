import { useState, useEffect } from 'react';
import { Lock, Target, Plus, Trash2, Check, Trophy, TrendingUp } from 'lucide-react';
import { useWorkHistory } from '../../hooks';

const GoalsTab = () => {
  // Check if user has "unlocked" the feature (simulated payment)
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return localStorage.getItem('lockin_goals_unlocked') === 'true';
  });

  // Goals state
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('lockin_goals');
    return saved ? JSON.parse(saved) : [
      { id: 1, title: 'Work 40 hours this week', target: 40, type: 'weekly', unit: 'hours' },
      { id: 2, title: 'Complete 5 focus sessions daily', target: 5, type: 'daily', unit: 'sessions' },
    ];
  });

  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', target: '', type: 'weekly', unit: 'hours' });

  const { getTotalYearHours, getHoursForDate, getWeekDataByOffset } = useWorkHistory();

  // Save goals to localStorage
  useEffect(() => {
    localStorage.setItem('lockin_goals', JSON.stringify(goals));
  }, [goals]);

  // Calculate current progress for goals
  const getProgress = (goal) => {
    if (goal.unit === 'hours') {
      if (goal.type === 'daily') {
        return getHoursForDate(new Date());
      } else if (goal.type === 'weekly') {
        const weekData = getWeekDataByOffset(0);
        return weekData.totalHours;
      }
    }
    
    // Feature: Real Task Tracking
    if (goal.unit === 'tasks') {
        const tasks = JSON.parse(localStorage.getItem('work_tracker_tasks') || '[]');
        
        if (goal.type === 'daily') {
            const today = new Date().toDateString();
            return tasks.filter(t => t.completed && t.completedAt && new Date(t.completedAt).toDateString() === today).length;
        }
        
        if (goal.type === 'weekly') {
            const now = new Date();
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return tasks.filter(t => t.completed && t.completedAt && new Date(t.completedAt) > weekAgo).length;
        }
        
        return tasks.filter(t => t.completed).length; 
    }

    // For sessions, placeholder 0 for now until tracking is added
    return 0; 
  };

  const handleUnlock = () => {
    // Simulate successful payment
    localStorage.setItem('lockin_goals_unlocked', 'true');
    setIsUnlocked(true);
  };

  const addGoal = () => {
    if (!newGoal.title || !newGoal.target) return;
    
    setGoals([...goals, {
      id: Date.now(),
      title: newGoal.title,
      target: parseFloat(newGoal.target),
      type: newGoal.type,
      unit: newGoal.unit
    }]);
    setNewGoal({ title: '', target: '', type: 'weekly', unit: 'hours' });
    setShowAddGoal(false);
  };

  const deleteGoal = (id) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  // If not unlocked, show paywall
  if (!isUnlocked) {
    return (
      <div className="relative h-[600px] overflow-hidden rounded-xl bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800">
        
        {/* Blurred "Fake" Content */}
        <div className="p-6 filter blur-sm select-none pointer-events-none opacity-50">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Weekly Goals</h2>
          
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800">
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
              <div className="h-2 bg-gray-100 dark:bg-slate-600 rounded w-full"></div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800">
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mb-2"></div>
              <div className="h-2 bg-gray-100 dark:bg-slate-600 rounded w-2/3"></div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 h-32"></div>
          </div>
        </div>

        {/* Paywall Overlay */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-t from-white via-white/80 to-transparent dark:from-slate-950 dark:via-slate-950/80 p-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-xl mb-6 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
            <Lock className="w-8 h-8" />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Unlock Smart Goals
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 max-w-sm mb-8 text-sm leading-relaxed">
            Set custom targets, get AI-powered insights, and track your efficiency with advanced analytics. Join the top 1% of producers.
          </p>
          
          <button 
            onClick={handleUnlock}
            className="w-full max-w-xs py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold shadow-lg hover:bg-gray-800 dark:hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            Unlock for $5/mo
          </button>
          
          <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
            30-day money-back guarantee. Cancel anytime.
          </p>
        </div>
      </div>
    );
  }

  // Unlocked: Show real Goals UI
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white shadow-lg">
          <Target className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Smart Goals</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Track your productivity targets</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
            <Trophy className="w-4 h-4" />
            <span className="text-xs font-medium">Completed</span>
          </div>
          <div className="text-2xl font-bold text-gray-800 dark:text-white">
            {goals.filter(g => getProgress(g) >= g.target).length}/{goals.length}
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">Avg Progress</span>
          </div>
          <div className="text-2xl font-bold text-gray-800 dark:text-white">
            {goals.length > 0 
              ? Math.round(goals.reduce((sum, g) => sum + Math.min(100, (getProgress(g) / g.target) * 100), 0) / goals.length)
              : 0}%
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 dark:text-white">Your Goals</h3>
          <button
            onClick={() => setShowAddGoal(true)}
            className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {goals.map(goal => {
          const progress = getProgress(goal);
          const percentage = Math.min(100, (progress / goal.target) * 100);
          const isComplete = progress >= goal.target;

          return (
            <div 
              key={goal.id}
              className={`p-4 rounded-xl border transition-all ${
                isComplete 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {isComplete ? (
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-slate-600" />
                  )}
                  <span className={`font-medium ${isComplete ? 'text-green-700 dark:text-green-400' : 'text-gray-800 dark:text-white'}`}>
                    {goal.title}
                  </span>
                </div>
                <button 
                  onClick={() => deleteGoal(goal.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      isComplete ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[80px] text-right">
                  {progress.toFixed(1)} / {goal.target} {goal.unit}
                </span>
              </div>
              
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                {goal.type === 'daily' ? '📅 Daily Goal' : '📆 Weekly Goal'}
              </div>
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No goals yet. Add one to get started!</p>
          </div>
        )}
      </div>

      {/* Add Goal Form */}
      {showAddGoal && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-800 space-y-3">
          <h4 className="font-semibold text-gray-800 dark:text-white">Add New Goal</h4>
          
          <input
            type="text"
            placeholder="Goal title (e.g. Work 8 hours today)"
            value={newGoal.title}
            onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
            className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:border-green-500 focus:ring-0 transition-colors text-sm dark:text-white"
          />
          
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Target"
              value={newGoal.target}
              onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
              className="flex-1 px-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:border-green-500 focus:ring-0 transition-colors text-sm dark:text-white"
            />
            <select
              value={newGoal.type}
              onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value })}
              className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm dark:text-white"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
            <select
              value={newGoal.unit}
              onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
              className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm dark:text-white"
            >
              <option value="hours">Hours</option>
              <option value="sessions">Sessions</option>
              <option value="tasks">Tasks</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddGoal(false)}
              className="flex-1 py-2 px-4 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={addGoal}
              className="flex-1 py-2 px-4 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Add Goal
            </button>
          </div>
        </div>
      )}

      {/* Pro Badge */}
      <div className="flex items-center justify-center gap-2 text-xs text-amber-600 dark:text-amber-400">
        <Trophy className="w-4 h-4" />
        <span>Pro Features Unlocked</span>
      </div>
    </div>
  );
};

export default GoalsTab;
