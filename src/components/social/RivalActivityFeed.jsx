import { useState, useEffect, useRef } from 'react';
import { User, Zap, Trophy, Clock, TrendingUp } from 'lucide-react';

const MOCK_EVENTS = [
  { type: 'session_start', user: 'Marc_Lou', message: 'started a 2h session', icon: '🚀' },
  { type: 'milestone', user: 'Pieter_Levels', message: 'just hit 4h today', icon: '🔥' },
  { type: 'streak', user: 'Sarah_Ships', message: 'extended their streak to 14 days', icon: '⚡' },
  { type: 'join', user: 'Indie_Dev', message: 'is now online and working', icon: '👋' },
  { type: 'complete', user: 'BuilderBob', message: 'completed a 90min session', icon: '✅' },
  { type: 'catchup', user: 'System', message: 'You can catch up! Only 30min behind the leader.', icon: '💪', isMotivation: true },
];

const RivalActivityFeed = ({ userEvents = [] }) => {
  const [events, setEvents] = useState([
    { id: 1, ...MOCK_EVENTS[0], time: '2m ago' },
    { id: 2, ...MOCK_EVENTS[1], time: '5m ago' },
    { id: 3, ...MOCK_EVENTS[4], time: '12m ago' }
  ]);
  const feedRef = useRef(null);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      const randomEvent = MOCK_EVENTS[Math.floor(Math.random() * MOCK_EVENTS.length)];
      setEvents(prev => {
        const newEvent = { ...randomEvent, id: Date.now(), time: 'Just now' };
        return [newEvent, ...prev.slice(0, 9)]; // Keep last 10
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Add user events (like their own session completions)
  useEffect(() => {
    if (userEvents.length > 0) {
      const latestEvent = userEvents[userEvents.length - 1];
      setEvents(prev => [{ ...latestEvent, id: Date.now(), time: 'Just now' }, ...prev.slice(0, 9)]);
    }
  }, [userEvents]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 px-4 py-3 border-b border-gray-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-green-600" />
            Live Activity
          </h3>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        </div>
      </div>

      {/* Feed */}
      <div ref={feedRef} className="max-h-[300px] overflow-y-auto">
        {events.map((event, index) => (
          <div 
            key={event.id}
            className={`flex items-start gap-3 p-3 border-b border-gray-50 dark:border-slate-800 last:border-0 transition-all ${
              index === 0 ? 'animate-in slide-in-from-top-2 fade-in duration-300' : ''
            } ${event.isMotivation ? 'bg-green-50/50 dark:bg-green-900/10' : ''} ${
              event.isMe ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
            }`}
          >
            <div className="text-xl flex-shrink-0">{event.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800 dark:text-gray-200">
                {!event.isMotivation && (
                  <span className={`font-semibold ${event.isMe ? 'text-blue-600' : ''}`}>
                    {event.user}{' '}
                  </span>
                )}
                <span className={event.isMotivation ? 'font-medium text-green-700 dark:text-green-400' : ''}>
                  {event.message}
                </span>
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 uppercase tracking-wide">
                {event.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer - Quick Stats */}
      <div className="bg-gray-50 dark:bg-slate-800/50 px-4 py-2 flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <User className="w-3 h-3" />
          {Math.floor(Math.random() * 20) + 15} rivals online
        </span>
        <span className="text-green-600 font-semibold">
          Join them →
        </span>
      </div>
    </div>
  );
};

export default RivalActivityFeed;
