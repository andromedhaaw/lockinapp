import { useState, useEffect } from 'react';
import { X, User, TrendingUp, Zap, Target } from 'lucide-react';

const SocialNotification = () => {
  const [visible, setVisible] = useState(false);
  const [notification, setNotification] = useState(null);
  const [notificationIndex, setNotificationIndex] = useState(0);

  const NOTIFICATIONS = [
    { 
      name: "Marc_Lou", 
      message: "just hit 4 hours today.", 
      cta: "You can catch up! Start a session.",
      icon: "🔥",
      type: "rival" 
    },
    { 
      name: "Pieter_Levels", 
      message: "is currently locked in.", 
      cta: "Join them and work together.",
      icon: "💪",
      type: "online" 
    },
    { 
      name: "Your Pod", 
      message: "3 members are working right now.", 
      cta: "Don't miss out on the momentum!",
      icon: "👥",
      type: "pod" 
    },
    { 
      name: "Streak Alert", 
      message: "Your 5-day streak is at risk!", 
      cta: "Just 30 minutes to keep it alive.",
      icon: "⚡",
      type: "streak" 
    },
    { 
      name: "Motivation", 
      message: "You're only 45min behind today's leader.", 
      cta: "One session and you're back in the race!",
      icon: "🏆",
      type: "motivation" 
    },
  ];

  useEffect(() => {
    // Show notifications periodically
    const showNotification = () => {
      const notif = NOTIFICATIONS[notificationIndex % NOTIFICATIONS.length];
      setNotification(notif);
      setVisible(true);
      setNotificationIndex(prev => prev + 1);

      // Auto-hide after 8 seconds
      setTimeout(() => setVisible(false), 8000);
    };

    // First notification after 10 seconds
    const initialTimer = setTimeout(showNotification, 10000);
    
    // Then every 45 seconds
    const interval = setInterval(showNotification, 45000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [notificationIndex]);

  if (!visible || !notification) return null;

  const bgColors = {
    rival: 'border-l-amber-500',
    online: 'border-l-green-500',
    pod: 'border-l-purple-500',
    streak: 'border-l-red-500',
    motivation: 'border-l-blue-500',
  };

  return (
    <div className={`fixed bottom-4 right-4 max-w-sm w-full bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-800 border-l-4 ${bgColors[notification.type]} p-4 animate-in slide-in-from-right-10 fade-in duration-500 z-50`}>
      <button 
        onClick={() => setVisible(false)}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      
      <div className="flex items-start gap-3">
        <div className="text-2xl flex-shrink-0">{notification.icon}</div>
        <div className="flex-1">
          <div className="font-bold text-sm text-gray-800 dark:text-white">
            {notification.name}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
            {notification.message}
          </div>
          <div className="text-xs text-green-600 dark:text-green-400 font-semibold mt-2 cursor-pointer hover:underline">
            {notification.cta} →
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialNotification;
