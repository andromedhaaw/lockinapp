import { useState, useEffect } from 'react';
import { Bot, X, MessageSquare } from 'lucide-react';

const AICoach = ({ isTimerRunning, sessionGoal, progress }) => {
  const [message, setMessage] = useState("Let's lock in.");
  const [isVisible, setIsVisible] = useState(true);
  const [mood, setMood] = useState('neutral'); // neutral, happy, angry

  useEffect(() => {
    if (isTimerRunning) {
      setMood('happy');
      const messages = [
        "You're in the zone. Keep pushing.",
        "Don't stop now. You're building momentum.",
        "Deep work is rare. You are becoming rare.",
        "Focus is currency. You are getting rich.",
      ];
      const interval = setInterval(() => {
        setMessage(messages[Math.floor(Math.random() * messages.length)]);
      }, 30000); // Change message every 30s while working
      return () => clearInterval(interval);
    } else {
      setMood('neutral');
       if (progress > 0 && progress < sessionGoal) {
         setMood('angry');
         setMessage("Why did you stop? You haven't hit your goal.");
       } else if (progress >= sessionGoal && sessionGoal > 0) {
         setMood('happy');
         setMessage("Goal crushed. I'm proud of you.");
       } else {
         setMessage("Waiting for you to become a legend.");
       }
    }
  }, [isTimerRunning, progress, sessionGoal]);

  if (!isVisible) return (
     <button 
      onClick={() => setIsVisible(true)}
      className="fixed bottom-4 left-4 bg-gray-900 text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition-all z-40"
    >
      <Bot className="w-6 h-6" />
    </button>
  );

  return (
    <div className={`fixed bottom-4 left-4 max-w-[280px] bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 p-4 transition-all duration-500 z-40 ${
      mood === 'angry' ? 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800' : ''
    }`}>
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        <X className="w-3 h-3" />
      </button>

      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
          mood === 'happy' ? 'bg-green-100 text-green-600' : 
          mood === 'angry' ? 'bg-red-100 text-red-600' : 
          'bg-gray-100 text-gray-600'
        }`}>
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <div className="font-bold text-xs text-gray-500 dark:text-gray-400 uppercase mb-0.5 flex items-center gap-1">
             AI Coach
          </div>
          <p className={`text-sm font-medium leading-snug ${
             mood === 'angry' ? 'text-red-800 dark:text-red-300' : 'text-gray-800 dark:text-gray-200'
          }`}>
            "{message}"
          </p>
        </div>
      </div>
    </div>
  );
};

export default AICoach;
