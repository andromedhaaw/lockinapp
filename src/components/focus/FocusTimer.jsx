import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Timer, Settings2 } from 'lucide-react';

const FocusTimer = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(25);
  const [showSettings, setShowSettings] = useState(false);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setIsPaused(false);
    setMinutes(customMinutes);
    setSeconds(0);
  }, [customMinutes]);

  useEffect(() => {
    let interval = null;
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds((seconds) => seconds - 1);
        } else if (minutes > 0) {
          setMinutes((minutes) => minutes - 1);
          setSeconds(59);
        } else {
          setIsActive(false);
          clearInterval(interval);
          // Optional: Add notification or sound
          alert('Focus session finished!');
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, isPaused, minutes, seconds]);

  const toggleTimer = () => {
    if (!isActive) {
      setIsActive(true);
      setIsPaused(false);
    } else {
      setIsPaused(!isPaused);
    }
  };

  const handleCustomMinutesChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= 120) {
      setCustomMinutes(value);
      if (!isActive) {
        setMinutes(value);
        setSeconds(0);
      }
    }
  };

  const formatTime = (m, s) => {
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = ((customMinutes * 60 - (minutes * 60 + seconds)) / (customMinutes * 60)) * 100;

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-8">
      <h2 className="text-2xl font-bold text-green-800 dark:text-green-400">Focus Mode</h2>

      {/* Timer Display */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Simple Progress Ring (SVG) */}
        <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="transparent"
            stroke="rgba(16, 185, 129, 0.1)"
            strokeWidth="8"
            className="dark:stroke-gray-700"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="transparent"
            stroke="rgb(16, 185, 129)"
            strokeWidth="8"
            strokeDasharray="282.7"
            strokeDashoffset={282.7 - (282.7 * progress) / 100}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>

        <div className="text-center z-10">
          <div className="text-5xl font-mono font-bold text-green-700 dark:text-white">
            {formatTime(minutes, seconds)}
          </div>
          <div className="text-sm text-green-600 dark:text-green-400 mt-1 font-medium">
            {isActive ? (isPaused ? 'Paused' : 'Focusing...') : 'Ready to Focus'}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-3 rounded-full bg-white dark:bg-slate-900 shadow-md text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-slate-800 transition-colors"
          title="Settings"
        >
          <Settings2 className="w-6 h-6" />
        </button>

        <button
          onClick={toggleTimer}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all transform active:scale-95 ${
            isActive && !isPaused
              ? 'bg-amber-500 hover:bg-amber-600 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isActive && !isPaused ? (
            <Pause className="w-8 h-8 fill-current" />
          ) : (
            <Play className="w-8 h-8 fill-current ml-1" />
          )}
        </button>

        <button
          onClick={resetTimer}
          className="p-3 rounded-full bg-white dark:bg-slate-900 shadow-md text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-slate-800 transition-colors"
          title="Reset"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>

      {/* Settings Modal/Panel */}
      {showSettings && (
        <div className="w-full max-w-xs bg-white dark:bg-slate-900 p-4 rounded-xl shadow-inner border border-green-50 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2 mb-3 text-green-800 dark:text-green-400 font-semibold">
            <Timer className="w-4 h-4" />
            <span>Set Timer (minutes)</span>
          </div>
          <input
            type="range"
            min="1"
            max="120"
            value={customMinutes}
            onChange={handleCustomMinutesChange}
            className="w-full h-2 bg-green-100 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-600"
          />
          <div className="flex justify-between text-xs text-green-600 dark:text-green-400 mt-2 font-medium">
            <span>1 min</span>
            <span className="text-lg text-green-700 dark:text-white">{customMinutes} min</span>
            <span>120 min</span>
          </div>
        </div>
      )}

      {/* Quick Presets */}
      {!showSettings && (
        <div className="flex gap-2">
          {[15, 25, 45, 60].map((m) => (
            <button
              key={m}
              onClick={() => {
                setCustomMinutes(m);
                setMinutes(m);
                setSeconds(0);
                setIsActive(false);
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                customMinutes === m
                  ? 'bg-green-600 text-white'
                  : 'bg-green-50 dark:bg-slate-900 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-slate-800'
              }`}
            >
              {m}m
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FocusTimer;
