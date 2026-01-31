import PropTypes from 'prop-types';
import { X, Clock, Zap, ArrowRight, Activity, Sparkles } from 'lucide-react';
import { Card } from '../ui';
import { formatDuration } from '../../utils/timeUtils';

// Demo data for beautiful distribution visualization
const generateDemoSessions = (baseDate) => {
  const patterns = [
    { start: 8, duration: 1.5 },     // 8:00 AM - 9:30 AM
    { start: 10, duration: 1.25 },   // 10:00 AM - 11:15 AM
    { start: 14, duration: 1.5 },    // 2:00 PM - 3:30 PM
    { start: 16, duration: 1 },      // 4:00 PM - 5:00 PM
    { start: 20, duration: 1 },      // 8:00 PM - 9:00 PM
  ];
  
  return patterns.map((block, index) => {
    const startTime = new Date(baseDate);
    startTime.setHours(Math.floor(block.start), (block.start % 1) * 60, 0, 0);
    const durationMs = block.duration * 60 * 60 * 1000;
    const endTime = new Date(startTime.getTime() + durationMs);
    
    return {
      id: Date.now() + index,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: durationMs,
    };
  });
};

export const DailyBreakdown = ({ date, sessions: propSessions, onClose }) => {
  // Use demo data if no sessions available
  const isDemo = !propSessions || propSessions.length === 0;
  const sessions = isDemo ? generateDemoSessions(date) : propSessions;

  // Calculate stats
  const sortedSessions = [...sessions].sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  const firstSession = sortedSessions[0];
  const lastSession = sortedSessions[sortedSessions.length - 1];
  
  const startTime = new Date(firstSession.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const endTime = new Date(lastSession.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Calculate "Most Productive Hour"
  const hourCounts = {};
  sessions.forEach(session => {
    const start = new Date(session.startTime).getHours();
    const end = new Date(session.endTime).getHours();
    for (let h = start; h <= end; h++) {
      hourCounts[h] = (hourCounts[h] || 0) + 1; // Simple frequency count
    }
  });
  
  const bestHour = Object.keys(hourCounts).reduce((a, b) => hourCounts[a] > hourCounts[b] ? a : b);
  const bestHourFormatted = new Date(0, 0, 0, bestHour).toLocaleTimeString([], { hour: 'numeric', hour12: true });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-950 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-800 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {new Date(date).toLocaleDateString('en-US', { weekday: 'long' })}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            {isDemo && (
              <div className="flex items-center gap-1.5 mt-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <Sparkles className="w-3 h-3" />
                  Demo Data
                </span>
              </div>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-8">
          
          {/* Key Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Start & End</span>
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {startTime} <span className="text-gray-400 font-normal text-sm mx-1">to</span> {endTime}
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
                <Zap className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Peak Hour</span>
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {bestHourFormatted}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
                <Activity className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Sessions</span>
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {sessions.length} <span className="text-sm font-normal text-gray-500">focus blocks</span>
              </div>
            </div>
          </div>

          {/* Timeline Visual */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <ArrowRight className="w-4 h-4" /> Work Distribution
            </h3>
            <div className="h-12 bg-gray-100 dark:bg-slate-900 rounded-lg relative overflow-hidden flex border border-gray-200 dark:border-slate-800">
              {/* Hour markers */}
              {[0, 6, 12, 18, 24].map(h => (
                <div key={h} className="absolute top-0 bottom-0 border-l border-gray-300 dark:border-slate-700 text-[10px] text-gray-400 pl-1 pt-1" style={{ left: `${(h/24)*100}%` }}>
                  {h}h
                </div>
              ))}
              
              {/* Session blocks */}
              {sessions.map((session, i) => {
                const startHour = new Date(session.startTime).getHours() + new Date(session.startTime).getMinutes()/60;
                const durationHours = session.duration / (1000 * 60 * 60); // ms to hours
                const widthPercent = (durationHours / 24) * 100;
                const leftPercent = (startHour / 24) * 100;
                
                return (
                  <div 
                    key={i}
                    className="absolute top-2 bottom-2 bg-green-500 dark:bg-green-500 rounded-sm opacity-80 hover:opacity-100 transition-opacity cursor-help"
                    style={{ left: `${leftPercent}%`, width: `${Math.max(0.5, widthPercent)}%` }}
                    title={`${new Date(session.startTime).toLocaleTimeString()} - ${formatDuration(session.duration)}`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-gray-400 px-1">
              <span>12 AM</span>
              <span>6 AM</span>
              <span>12 PM</span>
              <span>6 PM</span>
              <span>11:59 PM</span>
            </div>
          </div>

          {/* Detailed List */}
          <div className="space-y-3">
             <h3 className="font-semibold text-gray-900 dark:text-white">Session Log</h3>
             <div className="space-y-2">
               {sortedSessions.map((session, index) => (
                 <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-100 dark:border-slate-800">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-gray-400 text-xs font-mono border border-gray-200 dark:border-slate-700">
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           {' - '}
                          {new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                   </div>
                   <div className="text-sm font-bold text-gray-600 dark:text-gray-400 font-mono">
                     {formatDuration(session.duration)}
                   </div>
                 </div>
               ))}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

DailyBreakdown.propTypes = {
  date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
  sessions: PropTypes.array,
  onClose: PropTypes.func.isRequired
};


