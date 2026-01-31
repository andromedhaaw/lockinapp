import { useState } from 'react';
import { X, Heart, Zap, TrendingUp, Target } from 'lucide-react';

const EncouragementModal = ({ isOpen, onClose, completedMinutes, goalMinutes }) => {
  if (!isOpen) return null;

  const percentComplete = Math.round((completedMinutes / goalMinutes) * 100);
  const shortBy = goalMinutes - completedMinutes;
  
  // Different messages based on how close they got
  const getMessage = () => {
    if (percentComplete >= 90) {
      return {
        emoji: "🔥",
        title: "So Close!",
        message: `You hit ${completedMinutes} out of ${goalMinutes} minutes - that's ${percentComplete}%!`,
        subtext: "Just a few more minutes next time and you'll crush it.",
        color: "text-green-600"
      };
    } else if (percentComplete >= 70) {
      return {
        emoji: "💪",
        title: "Great Effort!",
        message: `${completedMinutes} minutes of focused work is still a win!`,
        subtext: "Your rivals respect the hustle. Keep building momentum.",
        color: "text-blue-600"
      };
    } else if (percentComplete >= 50) {
      return {
        emoji: "🌱",
        title: "Progress, Not Perfection",
        message: `You got ${completedMinutes} minutes in today.`,
        subtext: "Every session makes you stronger. Tomorrow, go longer.",
        color: "text-amber-600"
      };
    } else {
      return {
        emoji: "🤝",
        title: "We've All Been There",
        message: `${completedMinutes} minutes is still ${completedMinutes} minutes more than zero.`,
        subtext: "The best thing you can do now? Start another session when you're ready.",
        color: "text-purple-600"
      };
    }
  };

  const content = getMessage();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        {/* Header */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-8 text-center relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-6xl mb-4">{content.emoji}</div>
          <h2 className={`text-2xl font-bold ${content.color} dark:text-green-400`}>
            {content.title}
          </h2>
        </div>

        {/* Body */}
        <div className="p-6 text-center space-y-4">
          <p className="text-lg text-gray-800 dark:text-gray-200 font-medium">
            {content.message}
          </p>
          
          {/* Progress Bar */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(percentComplete, 100)}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {percentComplete}% of your goal
          </p>

          <p className="text-sm text-gray-600 dark:text-gray-400 italic">
            {content.subtext}
          </p>

          {/* Motivational Stats */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedMinutes}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wide">Minutes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">+1</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wide">Session</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">🔥</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wide">Streak</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 space-y-3">
          <button
            onClick={onClose}
            className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-95"
          >
            Keep Going! 💪
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Take a break
          </button>
        </div>
      </div>
    </div>
  );
};

export default EncouragementModal;
