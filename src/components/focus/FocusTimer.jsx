import { useState, useEffect, useCallback, useMemo } from 'react';
import { Play, Pause, RotateCcw, Timer, Clock, Settings2, Zap, Coffee, Sparkles, Tag, Check, Square, BarChart3, X, Leaf } from 'lucide-react';
import VisualTimeTimer from './VisualTimeTimer';
import { useGarden } from '../../context/GardenContext';
import FocusShareModal from './FocusShareModal';
import FocusCompletionMoment from './FocusCompletionMoment';

// Preset tags for pomodoro focus sessions
const PRESET_TAGS = [
  { id: 'work',  name: 'Work',  icon: '💼' },
  { id: 'study', name: 'Study', icon: '📚' },
  { id: 'code',  name: 'Code',  icon: '💻' },
  { id: 'write', name: 'Write', icon: '✍️' },
];

const completeFocusedTask = (focusTask, focusedTaskName) => {
  if (!focusedTaskName && !focusTask) return;
  const taskId = focusTask?._id || focusTask?.id;
  const matches = (task) => (taskId && (task.id === taskId || task._id === taskId)) || (task.title || task.name) === focusedTaskName;
  try {
    const updateFlat = (key, completionField) => {
      const saved = JSON.parse(localStorage.getItem(key) || '[]');
      localStorage.setItem(key, JSON.stringify(saved.map((task) => matches(task) ? { ...task, [completionField]: true, completedAt: new Date().toISOString() } : task)));
    };
    updateFlat('lockin_tasks_offline', 'completed');
    updateFlat('lockin_todos', 'done');
    updateFlat('lockin_today_braindump', 'completed');
    const days = JSON.parse(localStorage.getItem('lockin_today_days') || '[]');
    localStorage.setItem('lockin_today_days', JSON.stringify(days.map((day) => ({ ...day, tasks: (day.tasks || []).map((task) => matches(task) ? { ...task, completed: true, completedAt: new Date().toISOString() } : task) }))));
    window.dispatchEvent(new CustomEvent('focus-task-completed', { detail: { id: taskId, title: focusedTaskName } }));
    window.dispatchEvent(new Event('local-data-updated'));
  } catch (error) {
    console.warn('Could not sync completed focus task', error);
  }
};

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

const FocusTimer = ({ initialMinutes = 25, autoStart = false, focusedTaskName = null, focusTask = null }) => {
  const { rewardFocusSession } = useGarden();
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
  const [lastReward, setLastReward] = useState(null);
  const [showRewardToast, setShowRewardToast] = useState(false);
  const [recentSessions, setRecentSessions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lockin_focus_sessions') || '[]').slice(0, 3);
    } catch {
      return [];
    }
  });
  const [showShareCard, setShowShareCard] = useState(false);
  const [showTagAnalytics, setShowTagAnalytics] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [showBrainDump, setShowBrainDump] = useState(false);
  const [brainDump, setBrainDump] = useState('');
  const [sessionEndAt, setSessionEndAt] = useState(null);
  const [sessionStartedAt, setSessionStartedAt] = useState(null);

  const taskContext = useMemo(() => {
    if (focusTask) return focusTask;
    if (!focusedTaskName) return null;
    try {
      const brainDump = JSON.parse(localStorage.getItem('lockin_today_braindump') || '[]');
      const days = JSON.parse(localStorage.getItem('lockin_today_days') || '[]');
      const candidates = [...brainDump, ...days.flatMap((day) => day.tasks || [])];
      return candidates.find((task) => (task.title || task.name) === focusedTaskName) || null;
    } catch { return null; }
  }, [focusedTaskName, focusTask]);
  const focusTag = taskContext?.tag || selectedTag;

  useEffect(() => {
    if (!showRewardToast) return undefined;
    const timeout = setTimeout(() => setShowRewardToast(false), 3000);
    return () => clearTimeout(timeout);
  }, [showRewardToast]);

  // Keep the share card celebratory, not obstructive.
  useEffect(() => {
    if (!showShareCard) return undefined;
    const timeout = setTimeout(() => setShowShareCard(false), 5000);
    return () => clearTimeout(timeout);
  }, [showShareCard]);

  // Auto-start effect
  useEffect(() => {
    if (autoStart) {
      setIsActive(true);
      setIsPaused(false);
    }
  }, [autoStart]);

  // Keep For You and Focus on the same running session.
  useEffect(() => {
    const syncSharedFocus = () => {
      try {
        const session = JSON.parse(localStorage.getItem('lockin_active_focus') || 'null');
        if (!session) return;
        const remaining = Math.max(0, Math.ceil((session.endAt - Date.now()) / 1000));
        setMinutes(Math.floor(remaining / 60));
        setSeconds(remaining % 60);
        setCustomMinutes(session.minutes);
        setSessionEndAt(session.endAt);
        setSessionStartedAt(session.startedAt || Date.now());
        setIsActive(remaining > 0);
        setIsPaused(false);
      } catch {}
    };
    window.addEventListener('lockin-focus-start', syncSharedFocus);
    syncSharedFocus();
    return () => window.removeEventListener('lockin-focus-start', syncSharedFocus);
  }, []);

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
    setSessionEndAt(null);
    setSessionStartedAt(null);
  }, [customMinutes]);

  const handleStartPreset = (m) => {
    setCustomMinutes(m);
    setMinutes(m);
    setSeconds(0);
    setIsActive(true);
    setIsPaused(false);
    setCompletedSessionType(null);
    setLastReward(null);
    setShowRewardToast(false);
    setShowShareCard(false);
    const session = { minutes: m, task: focusedTaskName || 'Focus session', startedAt: Date.now(), endAt: Date.now() + m * 60 * 1000 };
    setSessionEndAt(session.endAt);
    setSessionStartedAt(session.startedAt);
    localStorage.setItem('lockin_active_focus', JSON.stringify(session));
    window.dispatchEvent(new Event('lockin-focus-sync'));
    window.dispatchEvent(new Event('focus-session-started'));
    playTone(660, 0.1);
  };

  useEffect(() => {
    let interval = null;
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        const sharedRemaining = sessionEndAt ? Math.max(0, Math.ceil((sessionEndAt - Date.now()) / 1000)) : null;
        if (sharedRemaining !== null && sharedRemaining > 0) {
          setMinutes(Math.floor(sharedRemaining / 60));
          setSeconds(sharedRemaining % 60);
        } else if (sharedRemaining === null && seconds > 0) {
          setSeconds((prevSeconds) => prevSeconds - 1);
        } else if (sharedRemaining === null && minutes > 0) {
          setMinutes((prevMinutes) => prevMinutes - 1);
          setSeconds(59);
        } else {
          // Finished!
          setIsActive(false);
          clearInterval(interval);
          playCompletionFanfare();
          if (customMinutes <= 2) {
            setCompletedSessionType('warmup');
          } else {
            setCompletedSessionType('regular');
          }

          const reward = rewardFocusSession(customMinutes);
          completeFocusedTask(focusTask, focusedTaskName);
          const session = {
            id: Date.now().toString(),
            durationMinutes: customMinutes,
            actualMinutes: Math.max(1, Math.round((Date.now() - (sessionStartedAt || Date.now() - customMinutes * 60000)) / 60000)),
            plannedMinutes: customMinutes,
            completedAt: new Date().toISOString(),
            taskName: focusedTaskName || 'Focus session',
            tag: selectedTag,
            ...reward,
          };
          const existing = JSON.parse(localStorage.getItem('lockin_focus_sessions') || '[]');
          localStorage.setItem('lockin_focus_sessions', JSON.stringify([session, ...existing].slice(0, 100)));
          localStorage.setItem('lockin_pet_last_focus', JSON.stringify({ sessionId: session.id, minutes: session.actualMinutes, taskName: session.taskName, completedAt: session.completedAt }));
          localStorage.setItem('lockin_farm_pending_session', JSON.stringify(session));
          window.dispatchEvent(new Event('local-data-updated'));
          setLastReward(session);
          setShowRewardToast(false);
          setRecentSessions([session, ...existing].slice(0, 3));
          setShowShareCard(false);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, isPaused, minutes, seconds, customMinutes, sessionEndAt, sessionStartedAt, selectedTag, focusedTaskName, focusTask, rewardFocusSession]);

  const toggleTimer = () => {
    if (!isActive) {
      const newEndAt = Date.now() + (minutes * 60 + seconds) * 1000;
      setSessionEndAt(newEndAt);
      localStorage.setItem('lockin_active_focus', JSON.stringify({ minutes: customMinutes, task: focusedTaskName || 'Focus session', startedAt: Date.now(), endAt: newEndAt }));
      setIsActive(true);
      setIsPaused(false);
      setSessionStartedAt(Date.now());
      playTone(587, 0.12);
    } else {
      setIsPaused(!isPaused);
      playTone(440, 0.1);
    }
  };

  const formatActual = (startedAt) => {
    if (!startedAt) return '00:00:00';
    const elapsed = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
    return `${String(Math.floor(elapsed / 3600)).padStart(2, '0')}:${String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`;
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.code === 'Space') { event.preventDefault(); toggleTimer(); }
      if (event.key === 'Escape' && zenMode) setZenMode(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isActive, isPaused, minutes, seconds, zenMode]);

  const finishSessionNow = () => {
    if (!isActive) return;
    setMinutes(0);
    setSeconds(0);
    setSessionEndAt(null);
    localStorage.removeItem('lockin_active_focus');
    setIsPaused(false);
  };

  const handleRescueMe = () => {
    handleStartPreset(2);
    setLastReward(null);
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

  const totalDurationSecs = Math.max(customMinutes * 60, 1);
  const remainingSecs = minutes * 60 + seconds;
  const progress = ((totalDurationSecs - remainingSecs) / totalDurationSecs) * 100;

  return (
    <div className="relative flex flex-col items-center justify-center p-4 sm:p-6 space-y-7 max-w-lg mx-auto">
      {isActive && (
        <div className="flex w-full items-end justify-center gap-7 rounded-2xl border border-slate-100 bg-white px-5 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div>
            <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">Actual</div>
            <div className="mt-1 font-mono text-lg font-bold leading-7 text-[#4dcd7d]">{formatActual(sessionStartedAt)}</div>
          </div>
          <div>
            <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">Planned</div>
            <div className="mt-1 font-mono text-lg font-bold leading-7 text-slate-600 dark:text-slate-300">{customMinutes}m</div>
          </div>
          <div className="pt-[15px]">
            <button onClick={finishSessionNow} className="inline-flex h-7 items-center gap-1 text-[10px] font-black uppercase leading-7 tracking-wider text-[#249653] transition hover:text-red-500"><Square className="h-3 w-3 fill-current" /> Stop</button>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="relative w-full min-h-[60px]">
        <div className="space-y-1 px-16 text-center sm:px-20">
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
        <button
          type="button"
          onClick={() => setZenMode((enabled) => !enabled)}
          aria-label="Toggle Zen Mode"
          aria-pressed={zenMode}
          className={`absolute right-0 top-0 inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-all duration-200 active:scale-95 ${zenMode ? 'border-[#34C759] bg-[#eaf8ee] text-[#249653] shadow-sm dark:bg-[#34C759]/10' : 'border-slate-200 bg-white text-slate-500 hover:border-[#bcebc9] hover:text-[#249653] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'}`}
          title={zenMode ? 'Exit Zen Mode' : 'Enter Zen Mode'}
        >
          <Leaf className="h-4 w-4" />
          Zen
        </button>
      </div>

      {/* Timer Mode Switcher (Digital Pomodoro vs Visual Time Timer) */}
      {!isActive && <div className="flex items-center justify-center p-1 bg-gray-100 dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-xs mb-8">
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
      </div>}

      {/* Completion Modal / Celebration Alert */}
      {false && completedSessionType && (
        <div className="relative w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-green-500/10 dark:from-emerald-950/40 dark:to-green-950/40 border border-emerald-300 dark:border-emerald-800 text-center space-y-3 animate-in zoom-in-95 duration-200">
          <button type="button" onClick={() => setCompletedSessionType(null)} aria-label="Tutup pesan" title="Tutup" className="absolute right-3 top-3 rounded-lg p-1 text-slate-400 transition hover:bg-white/70 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"><X className="h-4 w-4" /></button>
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

      {completedSessionType && <FocusCompletionMoment type={completedSessionType} session={lastReward} taskName={focusedTaskName} onContinue={() => { setCompletedSessionType(null); handleStartPreset(completedSessionType === 'warmup' ? 15 : customMinutes); }} onNewSession={() => { resetTimer(); setCompletedSessionType(null); }} onShare={() => setShowShareCard(true)} onClose={() => setCompletedSessionType(null)} />}

      {/* Timer View: Visual Time Timer OR Digital Pomodoro */}
      {!completedSessionType && (timerMode === 'visual' ? (
        <VisualTimeTimer
          minutes={minutes}
          seconds={seconds}
          customMinutes={customMinutes}
          isActive={isActive}
          isPaused={isPaused}
          onToggle={toggleTimer}
          onFinish={finishSessionNow}
          onCustomMinutesChange={handleCustomMinutesChange}
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
                  <stop offset="0%" stopColor="#4dcd7d" />
                  <stop offset="100%" stopColor="#4dcd7d" />
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
            {!isActive && <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-3.5 rounded-2xl shadow-sm border transition-colors ${
                showSettings
                  ? 'bg-green-50 border-green-200 text-green-700 dark:bg-slate-800 dark:border-green-600 dark:text-green-400'
                  : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 text-gray-500 hover:text-green-600'
              }`}
              title="Pengaturan Durasi Kustom"
            >
              <Settings2 className="w-5 h-5" />
            </button>}

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

            {isActive && (
              <button
                onClick={finishSessionNow}
                className="flex h-16 w-16 items-center justify-center rounded-3xl bg-red-500 text-sm font-extrabold text-white shadow-lg shadow-red-500/25 transition-colors hover:bg-red-600"
                title="Hentikan sesi sekarang"
              >
                <Square className="h-6 w-6 fill-current" />
              </button>
            )}

            {!isActive && <button
              onClick={resetTimer}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-gray-100 dark:border-slate-800 text-gray-500 hover:text-red-500 transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>}
          </div>

          {/* Custom Slider Settings Panel */}
          {!isActive && showSettings && (
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
          {!isActive && <div className="flex flex-wrap items-center justify-center gap-2">
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
          </div>}
        </>
      ))}

      {showRewardToast && lastReward && (
        <div className="fixed right-4 top-24 z-50 w-[min(360px,calc(100vw-2rem))] rounded-2xl bg-[#eaf8ee] border border-[#4dcd7d]/40 px-4 py-3 text-xs text-[#245b36] shadow-lg">
          <span className="font-bold">Sesi selesai!</span> +{lastReward.earnedCoins} coins · seed {lastReward.rewardPlantId} masuk koleksi 🌱
        </div>
      )}

      {showShareCard && lastReward && (
        <FocusShareModal
          session={lastReward}
          sessionCount={JSON.parse(localStorage.getItem('lockin_focus_sessions') || '[]').filter((session) => session.completedAt?.slice(0, 10) === new Date().toISOString().slice(0, 10)).length}
          onClose={() => setShowShareCard(false)}
        />
      )}

      {!isActive && !sessionEndAt && !completedSessionType && (
        <div className="w-full rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200">Session tag</span>
            <button onClick={() => window.dispatchEvent(new Event('open-tag-analytics'))} className="flex items-center gap-1 text-[10px] font-bold text-[#249653] hover:underline"><BarChart3 className="h-3 w-3" /> Analytics</button>
          </div>
          {!isCustomTag ? (
            <div className="flex flex-wrap gap-2">
              {PRESET_TAGS.map((tag) => (
                <button key={tag.id} onClick={() => handleSelectTag(tag.name)} className={`rounded-xl px-3 py-2 text-xs font-bold transition ${selectedTag === tag.name ? 'bg-[#4dcd7d] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-[#4dcd7d]/15 dark:bg-slate-800 dark:text-slate-300'}`}>
                  {tag.icon} {tag.name}
                </button>
              ))}
              <button onClick={() => setIsCustomTag(true)} className="rounded-xl border border-dashed border-slate-300 px-3 py-2 text-xs font-bold text-slate-500 hover:border-[#4dcd7d] hover:text-[#249653]">+ Custom</button>
            </div>
          ) : (
            <form onSubmit={handleCustomTagSubmit} className="flex gap-2">
              <input autoFocus value={customTagInput} onChange={(event) => setCustomTagInput(event.target.value)} placeholder="Marketing, Research..." className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#4dcd7d] dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
              <button type="submit" className="rounded-xl bg-[#4dcd7d] px-3 py-2 text-xs font-bold text-white">Save</button>
              <button type="button" onClick={() => setIsCustomTag(false)} className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500">Cancel</button>
            </form>
          )}

          {showTagAnalytics && (() => {
            let sessions = [];
            try { sessions = JSON.parse(localStorage.getItem('lockin_focus_sessions') || '[]'); } catch {}
            const tagTotals = sessions.reduce((acc, session) => {
              const tag = session.tag || 'Work';
              const minutes = Number(session.durationMinutes || 0);
              acc[tag] = { minutes: (acc[tag]?.minutes || 0) + minutes, sessions: (acc[tag]?.sessions || 0) + 1 };
              return acc;
            }, {});
            const rows = Object.entries(tagTotals).sort((a, b) => b[1].minutes - a[1].minutes);
            return (
              <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Tag analytics</div>
                {rows.length === 0 ? <div className="text-xs text-slate-400">Selesaikan sesi pertama untuk mulai melihat analytics.</div> : rows.map(([tag, data]) => (
                  <div key={tag} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs dark:bg-slate-900">
                    <span className="font-bold text-slate-700 dark:text-slate-200">{tag}</span>
                    <span className="text-slate-500">{(data.minutes / 60).toFixed(1)}h · {data.sessions} sesi · avg {Math.round(data.minutes / data.sessions)}m</span>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {false && !isActive && recentSessions.length > 0 && (
        <div className="w-full rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-extrabold text-gray-700 dark:text-gray-200">Sesi terakhir</span>
            <span className="text-[10px] text-gray-400">tersimpan offline</span>
          </div>
          <div className="space-y-2">
            {recentSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between text-xs">
                <span className="truncate text-gray-600 dark:text-gray-300">{session.taskName}</span>
                <span className="ml-3 shrink-0 font-bold text-[#4dcd7d]">{session.durationMinutes}m · +{session.earnedCoins}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {zenMode && isActive && (
        <div className="fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center bg-white px-6 text-slate-900 dark:bg-slate-950 dark:text-white">
          <div className="absolute right-5 top-5 flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#249653]">Zen focus</span>
            <button onClick={() => setZenMode(false)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Exit</button>
          </div>
          <div className="w-full max-w-md text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#8bb99a]">Now focusing</p>
            <h2 className="mb-10 truncate text-2xl font-black sm:text-3xl">{focusedTaskName || 'Focus session'}</h2>
            <div className="font-mono text-7xl font-bold tracking-tight text-[#baf3ca] sm:text-8xl">{formatTime(minutes, seconds)}</div>
            <div className="mx-auto mt-8 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full rounded-full bg-[#4dcd7d] transition-all duration-1000" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-10 flex items-center justify-center gap-4">
              <button onClick={toggleTimer} className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-500 text-white shadow-lg shadow-amber-500/20 hover:bg-amber-600" title="Pause">
                {isPaused ? <Play className="h-7 w-7 fill-current" /> : <Pause className="h-7 w-7 fill-current" />}
              </button>
              <button onClick={finishSessionNow} className="flex h-16 w-16 items-center justify-center rounded-3xl bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-600" title="Stop">
                <Square className="h-6 w-6 fill-current" />
              </button>
            </div>
            <button onClick={() => setShowBrainDump((visible) => !visible)} className="mt-8 text-xs font-bold text-[#249653] hover:text-[#1d7a42]">
              I’m distracted · brain dump
            </button>
            {showBrainDump && (
              <textarea value={brainDump} onChange={(event) => setBrainDump(event.target.value)} autoFocus rows={3} placeholder="Tulis dulu, lanjut fokus..." className="mt-3 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#4dcd7d] dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
            )}
          </div>
        </div>
      )}

      {!isActive && !completedSessionType && (
        <div className="w-full rounded-2xl border border-[#4dcd7d]/30 bg-[#4dcd7d]/10 p-4 text-center space-y-3">
          <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Sulit mulai?</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Tidak perlu menyelesaikan semuanya. Cukup mulai 2 menit.</p>
          <button
            onClick={handleRescueMe}
            className="w-full rounded-xl bg-[#4dcd7d] px-4 py-3 text-sm font-extrabold text-white shadow-md shadow-[#4dcd7d]/25 transition-transform active:scale-95"
          >
            Rescue Me · Mulai 2 Menit
          </button>
        </div>
      )}

      {!isActive && recentSessions.length > 0 && (
        <div className="w-full rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-2 flex items-center justify-between"><span className="text-xs font-extrabold text-gray-700 dark:text-gray-200">Sesi terakhir</span><span className="text-[10px] text-gray-400">tersimpan offline</span></div>
          <div className="space-y-2">{recentSessions.map((session) => <div key={session.id} className="flex items-center justify-between text-xs"><span className="truncate text-gray-600 dark:text-gray-300">{session.taskName}</span><span className="ml-3 shrink-0 font-bold text-[#4dcd7d]">{session.durationMinutes}m · +{session.earnedCoins}</span></div>)}</div>
        </div>
      )}

    </div>
  );
};

export default FocusTimer;
