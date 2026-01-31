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
        className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6"
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-300">Weekly Work Receipt</span>
              </div>
              <h2 className="text-xl font-bold">
                {weekData.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekData.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </h2>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r ${weekData.gradeInfo.color}`}>
              {weekData.gradeInfo.grade} Score
            </div>
          </div>

          {/* Main Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center gap-2 text-purple-300 mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Total Deep Work</span>
              </div>
              <div className="text-3xl font-bold">{weekData.totalHours}h</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center gap-2 text-purple-300 mb-2">
                <Zap className="w-4 h-4" />
                <span className="text-sm">Focus Score</span>
              </div>
              <div className="text-3xl font-bold">{weekData.score}<span className="text-lg text-purple-300">/100</span></div>
            </div>
          </div>

          {/* Mini Chart */}
          <div className="mb-6">
            <div className="text-sm text-purple-300 mb-3">Daily Distribution</div>
            <div className="flex items-end justify-between h-20 gap-2">
              {weekData.dailyData.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className={`w-full rounded-t-lg transition-all ${
                      day.hours === weekData.peakDay.hours && day.hours > 0
                        ? 'bg-gradient-to-t from-yellow-500 to-yellow-400'
                        : day.hours > 0
                          ? 'bg-gradient-to-t from-purple-500 to-pink-400'
                          : 'bg-white/10'
                    }`}
                    style={{ 
                      height: `${(day.hours / maxHours) * 100}%`,
                      minHeight: day.hours > 0 ? '8px' : '4px'
                    }}
                  />
                  <span className="text-xs text-purple-300">{day.dayName[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{weekData.activeDays}</div>
              <div className="text-xs text-purple-300">Active Days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{weekData.avgHours}h</div>
              <div className="text-xs text-purple-300">Daily Avg</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {weekData.peakDay.date?.toLocaleDateString('en-US', { weekday: 'short' }) || '-'}
              </div>
              <div className="text-xs text-purple-300">Peak Day</div>
            </div>
          </div>

          {/* Verification Badge */}
          <div className="flex items-center justify-center gap-2 py-3 px-4 bg-white/5 rounded-xl mb-6">
            <Award className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-300">Verified by Lock In Work</span>
            <Sparkles className="w-3 h-3 text-yellow-400" />
          </div>

          {/* Branding */}
          <div className="flex items-center justify-center gap-2 text-purple-300/60">
            <span className="text-2xl">🔒</span>
            <span className="text-sm font-medium">Lock In Work</span>
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
