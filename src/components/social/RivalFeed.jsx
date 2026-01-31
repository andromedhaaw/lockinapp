
import React, { useEffect, useState, useRef } from 'react';
import { User, AlertCircle, Zap } from 'lucide-react';

const MOCK_EVENTS = [
  { type: 'start', user: 'Sarah_99', message: 'started a session', color: 'text-green-500' },
  { type: 'streak', user: 'David_Builds', message: 'hit a 4h streak', color: 'text-orange-500' },
  { type: 'shame', user: 'Lazy_Dev', message: 'abandoned their session', color: 'text-red-500' },
  { type: 'join', user: 'Elon_Clone', message: 'entered the arena', color: 'text-blue-500' },
  { type: 'milestone', user: 'Indie_Hacker', message: 'completed 100 hours this month', color: 'text-yellow-500' },
  { type: 'pressure', user: 'System', message: 'YOU ARE FALLING BEHIND', color: 'text-red-600 font-bold' },
];

const RivalFeed = () => {
  const [events, setEvents] = useState([
    { id: 1, ...MOCK_EVENTS[0], time: 'Just now' },
    { id: 2, ...MOCK_EVENTS[1], time: '2m ago' },
    { id: 3, ...MOCK_EVENTS[4], time: '5m ago' }
  ]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomEvent = MOCK_EVENTS[Math.floor(Math.random() * MOCK_EVENTS.length)];
      setEvents(prev => {
        const newEvent = { ...randomEvent, id: Date.now(), time: 'Just now' };
        // Keep last 10 events
        return [...prev.slice(-9), newEvent];
      });
    }, 4000); // New event every 4 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events]);

  return (
    <div className="flex flex-col h-full bg-black border border-gray-800 font-mono text-sm max-h-[300px] md:max-h-full overflow-hidden">
      <div className="bg-gray-900 px-4 py-2 border-b border-gray-800 flex items-center justify-between">
        <span className="text-gray-400 uppercase tracking-widest text-xs font-bold flex items-center gap-2">
          <Zap className="w-3 h-3 text-red-500" />
          Live Rival Feed
        </span>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
        {events.map((event) => (
          <div key={event.id} className="flex items-start gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="mt-0.5">
              {event.type === 'shame' ? (
                <AlertCircle className="w-4 h-4 text-red-500" />
              ) : (
                <User className="w-4 h-4 text-gray-600" />
              )}
            </div>
            <div>
              <div className="flex items-baseline flex-wrap gap-x-2">
                <span className="font-bold text-gray-300">{event.user}</span>
                <span className={event.color}>{event.message}</span>
              </div>
              <div className="text-[10px] text-gray-600 mt-0.5 uppercase">{event.time}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="bg-gray-900/50 p-2 text-center border-t border-gray-800">
        <span className="text-xs text-red-500 animate-pulse font-bold">
          {Math.floor(Math.random() * 20) + 10} rivals active now
        </span>
      </div>
    </div>
  );
};

export default RivalFeed;
