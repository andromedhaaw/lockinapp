import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer, Clock, Settings2, Zap, Brain, Plus, CheckCircle2, Coffee, Sparkles, Tag, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import VisualTimeTimer from './VisualTimeTimer';

// Preset tags for pomodoro focus sessions
const PRESET_TAGS = [
  { id: 'work',  name: 'Work',  icon: '💼' },
  { id: 'study', name: 'Study', icon: '📚' },
  { id: 'code',  name: 'Code',  icon: '💻' },
  { id: 'write', name: 'Write', icon: '✍️' },
];

// Sensory Audio Chimes using Web Audio API
const playTone = (frequency, duration = 0.15, type = 'sine', gainVal = 0.1) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(gainVal, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration + 0.05);
  } catch (e) {
    // Audio context may be blocked by autoplay policies
  }
};

const playCompletionFanfare = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const chord = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
      gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.1);
      osc.stop(ctx.currentTime + idx * 0.1 + 0.42);
    });
  } catch (e) {}
};

const FocusTimer = ({ initialMinutes = 25, autoStart = false, focusedTaskName = null }) => {
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(initialMinutes);
  const [showSettings, setShowSettings] = useState(false);

  // Timer mode: 'digital' or 'visual' (Time Timer / Llama Life style)
  const [timerMode, setTimerMode] = useState(() => {
    try {
      return localStorage.getItem('lockin_focus_timer_mode') || 'visual';
    } catch {
      return 'visual';
    }
  });

  const handleTimerModeChange = (mode) => {
    setTimerMode(mode);
    try {
      localStorage.setItem('lockin_focus_timer_mode', mode);
    } catch (e) {
      console.warn(e);
    }
  };

  // Session Tag State (Work, Study, atau Custom Tulis Sendiri)
  const [selectedTag, setSelectedTag] = useState(() => {
    try {
      return localStorage.getItem('lockin_focus_tag') || 'Work';
    } catch {
      return 'Work';
    }
  });
  const [isCustomTag, setIsCustomTag] = useState(false);
  const [customTagInput, setCustomTagInput] = useState('');

  const handleSelectTag = (tagName) => {
    setSelectedTag(tagName);
    setIsCustomTag(false);
    playTone(523, 0.08);
    try {
      localStorage.setItem('lockin_focus_tag', tagName);
    } catch {}
  };

  const handleCustomTagSubmit = (e) => {
    if (e) e.preventDefault();
    if (customTagInput.trim()) {
      const val = customTagInput.trim();
      setSelectedTag(val);
      setIsCustomTag(false);
      playTone(587, 0.08);
      try {
        localStorage.setItem('lockin_focus_tag', val);
      } catch {}
    } else {
      setIsCustomTag(false);
    }
  };

  // Completion modal / prompt state
  const [completedSessionType, setCompletedSessionType] = useState(null); // 'warmup' or 'regular'

  // Brain Dump / Distraction Parking Lot state
  const [parkedThought, setParkedThought] = useState('');
  const [parkedSuccessMsg, setParkedSuccessMsg] = useState('');

  // Auto-start effect
  useEffect(() => {
    if (autoStart) {
      setIsActive(true);
      setIsPaused(false);
    }
  }, [autoStart]);

  // Sync if initialMinutes changes (e.g. from task selection)
  useEffect(() => {
    setMinutes(initialMinutes);
    setSeconds(0);
    setCustomMinutes(initialMinutes);
    if (autoStart) {
      setIsActive(true);
      setIsPaused(false);
    }
  }, [initialMinutes, autoStart]);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setIsPaused(false);
    setMinutes(customMinutes);
    setSeconds(0);
    setCompletedSessionType(null);
  }, [customMinutes]);

  const handleStartPreset = (m) => {
    setCustomMinutes(m);
    setMinutes(m);
    setSeconds(0);
    setIsActive(true);
    setIsPaused(false);
    setCompletedSessionType(null);
    playTone(660, 0.1);
  };

  useEffect(() => {
    let interval = null;
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds((prevSeconds) => prevSeconds - 1);
        } else if (minutes > 0) {
          setMinutes((prevMinutes) => prevMinutes - 1);
          setSeconds(59);
        } else {
          // Finished!
          setIsActive(false);
          clearInterval(interval);
          playCompletionFanfare();
          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.6 },
          });

          if (customMinutes <= 2) {
            setCompletedSessionType('warmup');
          } else {
            setCompletedSessionType('regular');
          }
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, isPaused, minutes, seconds, customMinutes]);

  const toggleTimer = () => {
    if (!isActive) {
      setIsActive(true);
      setIsPaused(false);
      playTone(587, 0.12);
    } else {
      setIsPaused(!isPaused);
      playTone(440, 0.1);
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

  // Brain Dump / Parkir Pikiran handler
  const handleParkThought = (e) => {
    e.preventDefault();
    if (!parkedThought.trim()) return;

    try {
      const stored = localStorage.getItem('lockin_tasks_offline');
      const currentTasks = stored ? JSON.parse(stored) : [];
      const newTask = {
        id: Date.now().toString(),
        name: `💭 ${parkedThought.trim()}`,
        estimatedTime: '5m',
        completed: false,
        createdAt: new Date().toISOString(),
      };

      const updated = [newTask, ...currentTasks];
      localStorage.setItem('lockin_tasks_offline', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));

      setParkedSuccessMsg('Tersimpan di To-Do! Otak tenang, lanjut fokus yuk 🧘');
      setParkedThought('');
      playTone(784, 0.15);

      setTimeout(() => {
        setParkedSuccessMsg('');
      }, 3500);
    } catch (err) {
      console.warn('Failed to park thought', err);
    }
  };

  const formatTime = (m, s) => {
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalDurationSecs = Math.max(customMinutes * 60, 1);
  const remainingSecs = minutes * 60 + seconds;
  const progress = ((totalDurationSecs - remainingSecs) / totalDurationSecs) * 100;

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-6 space-y-7 max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-green-800 dark:text-green-400">
          Focus Session
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {isActive
            ? isPaused
              ? '⏸️ Sesi dijeda. Ambil napas sejenak.'
              : '🔥 Sedang fokus. Satu langkah demi satu langkah.'
            : 'Siap mulai? Pilih durasi atau tekan Mulai 2 Menit.'}
        </p>
      </div>

      {/* Timer Mode Switcher (Digital Pomodoro vs Visual Time Timer) */}
      <div className="flex items-center justify-center p-1 bg-gray-100 dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-xs mb-1">
        <button
          onClick={() => handleTimerModeChange('digital')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            timerMode === 'digital'
              ? 'bg-white dark:bg-slate-700 text-green-700 dark:text-green-300 shadow-xs font-bold'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <Timer className="w-4 h-4" />
          <span>Pomodoro Digital</span>
        </button>
        <button
          onClick={() => handleTimerModeChange('visual')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            timerMode === 'visual'
              ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs font-bold'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <Clock className="w-4 h-4 text-rose-500" />
          <span>Visual Time Timer</span>
        </button>
      </div>

      {/* Completion Modal / Celebration Alert */}
      {completedSessionType && (
        <div className="w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-green-500/10 dark:from-emerald-950/40 dark:to-green-950/40 border border-emerald-300 dark:border-emerald-800 text-center space-y-3 animate-in zoom-in-95 duration-200">
          <div className="inline-flex p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300">
            <Sparkles className="w-5 h-5" />
          </div>

          {completedSessionType === 'warmup' ? (
            <div>
              <h4 className="font-extrabold text-gray-900 dark:text-white text-base">
                🎉 Inersia Terlewati!
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 max-w-sm mx-auto">
                2 menit pertama adalah bagian paling berat bagi otak ADHD. Otakmu sudah panas sekarang, mau lanjut 15 menit lagi mumpung momentum sedang jalan?
              </p>
              <div className="flex gap-2 justify-center mt-3">
                <button
                  onClick={() => handleStartPreset(15)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow-md shadow-green-600/20 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Lanjut 15 Menit 🔥</span>
                </button>
                <button
                  onClick={resetTimer}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
                >
                  <Coffee className="w-3.5 h-3.5" />
                  <span>Napas Dulu</span>
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h4 className="font-extrabold text-gray-900 dark:text-white text-base">
                🏆 Sesi Fokus Selesai!
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                Keren banget! Beri dirimu apresiasi kecil. Mau istirahat atau lanjut task berikutnya?
              </p>
              <div className="flex gap-2 justify-center mt-3">
                <button
                  onClick={() => handleStartPreset(5)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5"
                >
                  <Coffee className="w-3.5 h-3.5" />
                  <span>Istirahat 5m</span>
                </button>
                <button
                  onClick={resetTimer}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow-md shadow-green-600/20 transition-all flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Sesi Baru</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Timer View: Visual Time Timer OR Digital Pomodoro */}
      {timerMode === 'visual' ? (
        <VisualTimeTimer
          minutes={minutes}
          seconds={seconds}
          customMinutes={customMinutes}
          isActive={isActive}
          isPaused={isPaused}
          onToggle={toggleTimer}
          onReset={resetTimer}
          onSelectMinutes={(mins) => handleStartPreset(mins)}
          formatTime={formatTime}
        />
      ) : (
        <>
          {/* Visual Sweep Timer (Donut Progress - Smooth & Organic aesthetic) */}
          <div className="relative w-68 h-68 sm:w-76 sm:h-76 flex items-center justify-center select-none">
            <svg className="absolute w-full h-full -rotate-90 drop-shadow-sm" viewBox="0 0 100 100">
              <defs>
                {/* Smooth vibrant gradients for active progress */}
                <linearGradient id="focusProgressGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#16a34a" />
                </linearGradient>
                <linearGradient id="focusProgressAmber" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
                {/* Background gradient matching the exact app background */}
                <linearGradient id="dialBackgroundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f8f9ff" />
                  <stop offset="100%" stopColor="#f3f4f6" />
                </linearGradient>
              </defs>

              {/* Dial Background Disc (Warna disamakan dengan background aplikasi) */}
              <circle
                cx="50"
                cy="50"
                r="47.5"
                fill="url(#dialBackgroundGradient)"
                className="dark:fill-slate-950"
              />

              {/* Smooth Soft Sage/Mint Base Track (Sesuai referensi gambar: warna sage lembut, tidak kaku) */}
              <circle
                cx="50"
                cy="50"
                r="41.5"
                fill="none"
                stroke={customMinutes <= 2 ? '#fef3c7' : '#d5e7d9'}
                strokeWidth="5.5"
                className="dark:stroke-slate-800 transition-colors duration-300"
              />

              {/* Active Animated Sweep Ring (Melaju halus di atas track dengan warna hijau / oren kaya) */}
              <circle
                cx="50"
                cy="50"
                r="41.5"
                fill="none"
                stroke={customMinutes <= 2 ? 'url(#focusProgressAmber)' : 'url(#focusProgressGreen)'}
                strokeWidth="5.5"
                strokeDasharray="260.75"
                strokeDashoffset={260.75 - (260.75 * progress) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
                style={{ opacity: progress > 0 ? 1 : 0 }}
              />
            </svg>

            {/* Center Timer Display (Clean, bold, modern typography matching reference image) */}
            <div className="text-center z-10 space-y-1">
              <div
                className={`text-6xl sm:text-7xl font-mono font-bold tracking-tight transition-colors ${
                  customMinutes <= 2
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-[#233127] dark:text-emerald-300'
                }`}
              >
                {formatTime(minutes, seconds)}
              </div>

              <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {isActive ? (isPaused ? 'Dijeda' : 'Sisa Waktu') : `${customMinutes}m Session`}
              </div>

              {customMinutes <= 2 && (
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                  <Zap className="w-3 h-3 fill-current" />
                  <span>2-Min Warmup</span>
                </div>
              )}
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-3.5 rounded-2xl shadow-sm border transition-colors ${
                showSettings
                  ? 'bg-green-50 border-green-200 text-green-700 dark:bg-slate-800 dark:border-green-600 dark:text-green-400'
                  : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 text-gray-500 hover:text-green-600'
              }`}
              title="Pengaturan Durasi Kustom"
            >
              <Settings2 className="w-5 h-5" />
            </button>

            <button
              onClick={toggleTimer}
              className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg transition-all transform active:scale-95 ${
                isActive && !isPaused
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/25'
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-green-600/30'
              }`}
            >
              {isActive && !isPaused ? (
                <Pause className="w-7 h-7 fill-current" />
              ) : (
                <Play className="w-7 h-7 fill-current ml-1" />
              )}
            </button>

            <button
              onClick={resetTimer}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-gray-100 dark:border-slate-800 text-gray-500 hover:text-red-500 transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Custom Slider Settings Panel */}
          {showSettings && (
            <div className="w-full bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between mb-2 text-xs font-bold text-gray-700 dark:text-gray-300">
                <span className="flex items-center gap-1.5">
                  <Timer className="w-3.5 h-3.5 text-green-600" />
                  <span>Atur Durasi Kustom</span>
                </span>
                <span className="text-sm font-extrabold text-green-600 dark:text-green-400">
                  {customMinutes} Menit
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="120"
                value={customMinutes}
                onChange={handleCustomMinutesChange}
                className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-600"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-medium">
                <span>1 m</span>
                <span>25 m</span>
                <span>60 m</span>
                <span>120 m</span>
              </div>
            </div>
          )}

          {/* Quick Presets (ADHD-Friendly: 2m Warmup highlighted!) */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => handleStartPreset(2)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                customMinutes === 2
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
              }`}
              title="Mulai 2 menit saja untuk melawan task paralysis"
            >
              <Zap className="w-3 h-3 fill-current" />
              <span>2m Warmup</span>
            </button>

            {[10, 15, 25, 45].map((m) => (
              <button
                key={m}
                onClick={() => handleStartPreset(m)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  customMinutes === m
                    ? 'bg-green-600 text-white shadow-md shadow-green-600/20'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                {m}m
              </button>
            ))}
          </div>
        </>
      )}

      {/* ADHD Brain Dump / Distraction Catcher ("Parkir Pikiran") */}
      <div className="w-full bg-amber-50/60 dark:bg-slate-900/60 rounded-2xl p-4 border border-amber-200/50 dark:border-amber-900/30 space-y-2 mt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-400">
            <Brain className="w-4 h-4" />
            <span>Parkir Pikiran (Brain Dump)</span>
          </div>
          <span className="text-[10px] text-gray-400">Anti-Distraksi</span>
        </div>

        <p className="text-[11px] text-gray-500 dark:text-gray-400">
          Tiba-tiba teringat ide atau hal acak saat fokus? Tulis di sini agar otak tenang, nanti bisa dikerjakan setelah sesi.
        </p>

        <form onSubmit={handleParkThought} className="flex gap-2 pt-1">
          <input
            type="text"
            value={parkedThought}
            onChange={(e) => setParkedThought(e.target.value)}
            placeholder="Cth: Cek tagihan internet, ide belanja..."
            className="flex-1 px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          />
          <button
            type="submit"
            disabled={!parkedThought.trim()}
            className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Parkir</span>
          </button>
        </form>

        {parkedSuccessMsg && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 pt-1 animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{parkedSuccessMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FocusTimer;
