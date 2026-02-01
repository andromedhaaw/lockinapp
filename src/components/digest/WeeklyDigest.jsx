/**
 * Weekly Work Digest
 * Beautiful shareable work receipt for managers/clients
 */

import { useState, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { 
  Download, 
  Share2, 
  Mail, 
  Copy, 
  Check,
  CheckSquare,
  Calendar,
  Clock,
  TrendingUp,
  Zap,
  Award,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Card } from '../ui';
import { getDateKey } from '../../utils/timeUtils';
import { calculateWeeklyDeepWorkScore, getScoreGrade } from '../../utils/deepWorkScore';

export const WeeklyDigest = ({ sessionHistory = [], workHistory = {} }) => {
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const cardRef = useRef(null);

  // Calculate week range
  const weekData = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday

    // Get daily data for the week
    const dailyData = [];
    let totalHours = 0;
    let peakDay = { date: null, hours: 0 };
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateKey = getDateKey(date);
      const hours = workHistory[dateKey] || 0;
      
      dailyData.push({
        date,
        dateKey,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        hours: Math.round(hours * 100) / 100,
      });
      
      totalHours += hours;
      if (hours > peakDay.hours) {
        peakDay = { date, hours };
      }
    }

    // Group sessions by date for score calculation
    const sessionsByDate = {};
    dailyData.forEach(day => {
      sessionsByDate[day.dateKey] = sessionHistory.filter(s => s.dateKey === day.dateKey);
    });

    const weeklyScore = calculateWeeklyDeepWorkScore(sessionsByDate);

    return {
      startDate: startOfWeek,
      endDate: endOfWeek,
      dailyData,
      totalHours: Math.round(totalHours * 100) / 100,
      avgHours: Math.round((totalHours / 7) * 100) / 100,
      peakDay,
      activeDays: dailyData.filter(d => d.hours > 0).length,
      score: weeklyScore.avgScore,
      gradeInfo: getScoreGrade(weeklyScore.avgScore),
    };
  }, [sessionHistory, workHistory]);

  const handleCopyLink = async () => {
    // In a real app, this would generate a shareable URL
    const shareText = `🔒 My Weekly Work Digest\n📅 ${weekData.startDate.toLocaleDateString()} - ${weekData.endDate.toLocaleDateString()}\n⏱️ ${weekData.totalHours} hours of deep work\n🏆 Deep Work Score: ${weekData.score}/100\n\nTracked with Lock In Work`;
    
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'My Weekly Work Digest',
      text: `I logged ${weekData.totalHours} hours of deep work this week with a ${weekData.score}/100 focus score! 🔒`,
      url: window.location.origin,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownload = async () => {
    setGenerating(true);
    // Simulate PDF generation delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real app, this would generate and download a PDF
    alert('PDF download would be generated here. This is a demo feature.');
    setGenerating(false);
  };

  // Calculate bar heights for mini chart
  const maxHours = Math.max(...weekData.dailyData.map(d => d.hours), 1);

  return (
    <div className="space-y-6">
      {/* Digest Card */}
      <Card 
        ref={cardRef}
        className="relative overflow-hidden bg-white dark:bg-slate-900 border-2 border-green-100 dark:border-green-900 shadow-xl p-0"
      >
        {/* Receipt Header Style */}
        <div className="bg-green-600 dark:bg-green-700 p-4 text-white text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Award className="w-5 h-5 text-green-200" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Weekly Work Receipt</span>
          </div>
          <h2 className="text-2xl font-black">
            {weekData.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {weekData.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </h2>
        </div>

        <div className="p-6 relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16 blur-2xl" />

          {/* Main Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/50 rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Total Deep Work</span>
              </div>
              <div className="text-4xl font-black text-green-800 dark:text-green-200">{weekData.totalHours}h</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/50 rounded-2xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400 mb-1">
                <Zap className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Focus Score</span>
              </div>
              <div className="text-4xl font-black text-green-800 dark:text-green-200">
                {weekData.score}<span className="text-lg opacity-50">/100</span>
              </div>
              <div className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 dark:bg-green-800/50 text-green-700 dark:text-green-300`}>
                Grade: {weekData.gradeInfo.grade}
              </div>
            </div>
          </div>

          {/* Mini Chart */}
          <div className="mb-10 p-4 bg-green-50/50 dark:bg-green-900/5 rounded-2xl border border-green-100 dark:border-green-800/30">
            <div className="text-[10px] font-bold uppercase text-green-700 dark:text-green-400 mb-4 tracking-widest text-center">Daily Distribution</div>
            <div className="flex items-end justify-between h-24 gap-3">
              {weekData.dailyData.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className={`w-full rounded-t-sm transition-all shadow-sm ${
                      day.hours === weekData.peakDay.hours && day.hours > 0
                        ? 'bg-yellow-400 dark:bg-yellow-500'
                        : day.hours > 0
                          ? 'bg-green-500 dark:bg-green-400'
                          : 'bg-green-200/30 dark:bg-green-800/20'
                    }`}
                    style={{ 
                      height: `${(day.hours / maxHours) * 100}%`,
                      minHeight: day.hours > 0 ? '8px' : '4px'
                    }}
                  />
                  <span className="text-[10px] font-bold text-green-700/50 dark:text-green-400/50">{day.dayName[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-3 gap-3 mb-8 border-y border-green-100 dark:border-green-800/50 py-6">
            <div className="text-center">
              <div className="text-xl font-black text-green-800 dark:text-green-200">{weekData.activeDays}</div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-green-700/60 dark:text-green-400/60">Active Days</div>
            </div>
            <div className="text-center border-x border-green-100 dark:border-green-800/50">
              <div className="text-xl font-black text-green-800 dark:text-green-200">{weekData.avgHours}h</div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-green-700/60 dark:text-green-400/60">Daily Avg</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-black text-green-800 dark:text-green-200">
                {weekData.peakDay.date?.toLocaleDateString('en-US', { weekday: 'short' }) || '-'}
              </div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-green-700/60 dark:text-green-400/60">Peak Day</div>
            </div>
          </div>

          {/* Verification Badge */}
          <div className="flex items-center justify-center gap-2 py-3 px-4 bg-green-50 dark:bg-green-900/20 rounded-xl mb-8 border border-green-100 dark:border-green-800/50">
            <CheckSquare className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-xs font-bold text-green-800 dark:text-green-300 uppercase tracking-widest">Verified by Lock In Work</span>
          </div>

          {/* Branding */}
          <div className="flex items-center justify-center gap-2 opacity-30 dark:opacity-50">
            <span className="text-xl">🔒</span>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white">Lock In Work</span>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={handleShare}
          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        >
          <Share2 className="w-5 h-5 text-purple-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Share</span>
        </button>
        
        <button
          onClick={handleCopyLink}
          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-green-600">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Copy</span>
            </>
          )}
        </button>
        
        <button
          onClick={handleDownload}
          disabled={generating}
          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
        >
          <Download className={`w-5 h-5 text-green-500 ${generating ? 'animate-bounce' : ''}`} />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {generating ? 'Generating...' : 'Download'}
          </span>
        </button>
      </div>

      {/* Send to Manager/Client */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-100 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">Send to Manager</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Email your weekly report</div>
            </div>
          </div>
          <button className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
            Send
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </Card>
    </div>
  );
};

WeeklyDigest.propTypes = {
  sessionHistory: PropTypes.array,
  workHistory: PropTypes.object,
};

export default WeeklyDigest;
