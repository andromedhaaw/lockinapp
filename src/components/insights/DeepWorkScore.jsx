/**
 * DeepWorkScore Component
 * Displays the AI-powered focus quality score with breakdown and tips
 */

import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { 
  Zap, 
  TrendingUp, 
  Clock, 
  Target,
  Brain,
  Lightbulb,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Card } from '../ui';
import { 
  calculateDailyDeepWorkScore,
  calculateWeeklyDeepWorkScore,
  getScoreGrade,
  getPersonalizedTips
} from '../../utils/deepWorkScore';
import { getDateKey } from '../../utils/timeUtils';

export const DeepWorkScore = ({ sessionHistory = [], period = 'today' }) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const scoreData = useMemo(() => {
    if (period === 'today') {
      const today = getDateKey(new Date());
      const todaySessions = sessionHistory.filter(s => s.dateKey === today);
      return calculateDailyDeepWorkScore(todaySessions);
    } else {
      // Group sessions by date for weekly view
      const sessionsByDate = {};
      const now = new Date();
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateKey = getDateKey(date);
        sessionsByDate[dateKey] = sessionHistory.filter(s => s.dateKey === dateKey);
      }
      
      return calculateWeeklyDeepWorkScore(sessionsByDate);
    }
  }, [sessionHistory, period]);

  const score = period === 'today' ? scoreData.total : scoreData.avgScore;
  const gradeInfo = getScoreGrade(score);
  const tips = period === 'today' ? getPersonalizedTips(scoreData) : [];

  // Animated ring progress
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <Card className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">Deep Work Score</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {period === 'today' ? "Today's Focus Quality" : 'Weekly Average'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-green-500 dark:text-green-400">
          <Sparkles className="w-3 h-3" />
          AI Powered
        </div>
      </div>

      {/* Score Ring */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <svg className="w-36 h-36 transform -rotate-90">
            {/* Background ring */}
            <circle
              cx="72"
              cy="72"
              r="54"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              className="text-gray-100 dark:text-slate-800"
            />
            {/* Progress ring */}
            <circle
              cx="72"
              cy="72"
              r="54"
              stroke="url(#scoreGradient)"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" className="text-green-500" stopColor="currentColor" />
                <stop offset="100%" className="text-emerald-400" stopColor="currentColor" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-gray-900 dark:text-white">{score}</span>
            <div className={`px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r ${gradeInfo.color} text-white`}>
              {gradeInfo.grade} - {gradeInfo.label}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {period === 'today' && scoreData.stats && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-slate-800">
            <Clock className="w-4 h-4 mx-auto mb-1 text-blue-500" />
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {scoreData.stats.totalHours}h
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-slate-800">
            <Target className="w-4 h-4 mx-auto mb-1 text-green-500" />
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {scoreData.stats.sessionCount}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Sessions</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-slate-800">
            <Zap className="w-4 h-4 mx-auto mb-1 text-yellow-500" />
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {scoreData.stats.avgSessionLength}m
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Avg Block</div>
          </div>
        </div>
      )}

      {/* Weekly Stats */}
      {period === 'week' && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-slate-800">
            <Clock className="w-4 h-4 mx-auto mb-1 text-blue-500" />
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {scoreData.totalHours}h
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">This Week</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-slate-800">
            <Target className="w-4 h-4 mx-auto mb-1 text-green-500" />
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {scoreData.daysWithWork}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Active Days</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-slate-800">
            <TrendingUp className="w-4 h-4 mx-auto mb-1 text-yellow-500" />
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {Math.round(scoreData.totalHours / Math.max(scoreData.daysWithWork, 1))}h
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Daily Avg</div>
          </div>
        </div>
      )}

      {/* Insights */}
      {scoreData.insights && scoreData.insights.length > 0 && (
        <div className="space-y-2 mb-6">
          {scoreData.insights.map((insight, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-sm text-gray-700 dark:text-gray-300"
            >
              {insight}
            </div>
          ))}
        </div>
      )}

      {/* Score Breakdown Toggle */}
      {period === 'today' && (
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
        >
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            View Score Breakdown
          </span>
          <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${showBreakdown ? 'rotate-90' : ''}`} />
        </button>
      )}

      {/* Score Breakdown Details */}
      {showBreakdown && period === 'today' && (
        <div className="mt-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <ScoreBar 
            label="Duration" 
            value={scoreData.components.duration} 
            max={30}
            color="from-blue-400 to-blue-600"
          />
          <ScoreBar 
            label="Consistency" 
            value={scoreData.components.consistency} 
            max={25}
            color="from-green-400 to-green-600"
          />
          <ScoreBar 
            label="Focus Blocks" 
            value={scoreData.components.focusBlocks} 
            max={25}
            color="from-purple-400 to-purple-600"
          />
          <ScoreBar 
            label="Peak Hours" 
            value={scoreData.components.peakAlignment} 
            max={20}
            color="from-yellow-400 to-orange-500"
          />
        </div>
      )}

      {/* Personalized Tips */}
      {tips.length > 0 && period === 'today' && (
        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              Personalized Tips
            </span>
          </div>
          <div className="space-y-3">
            {tips.map((tip, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-800"
              >
                <span className="text-lg">{tip.icon}</span>
                <div>
                  <div className="font-medium text-sm text-gray-900 dark:text-white">
                    {tip.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {tip.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

// Score bar component
const ScoreBar = ({ label, value, max, color }) => {
  const percentage = (value / max) * 100;
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-medium text-gray-900 dark:text-white">{value}/{max}</span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

ScoreBar.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
};

DeepWorkScore.propTypes = {
  sessionHistory: PropTypes.array,
  period: PropTypes.oneOf(['today', 'week']),
};

export default DeepWorkScore;
