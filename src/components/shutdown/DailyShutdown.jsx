import { useMemo, useState } from 'react';
import { CheckCircle2, ChevronRight, Moon, Sparkles, Trophy, Calendar, CheckSquare } from 'lucide-react';

const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; }
};

const DailyShutdown = () => {
  const today = new Date().toISOString().slice(0, 10);
  const sessions = useMemo(() => read('lockin_focus_sessions', []).filter((item) => item.completedAt?.slice(0, 10) === today), [today]);
  const tasks = useMemo(() => read('lockin_todos', []), []);
  const [answers, setAnswers] = useState(() => read(`lockin_shutdown_${today}`, {}));
  const totalMinutes = sessions.reduce((sum, item) => sum + Number(item.durationMinutes || 0), 0);
  
  const update = (key, value) => {
    const next = { ...answers, [key]: value };
    setAnswers(next);
    localStorage.setItem(`lockin_shutdown_${today}`, JSON.stringify(next));
  };

  const fields = [
    ['win', 'Satu kemenangan hari ini', 'Sekecil apa pun tetap dihitung...'],
    ['tomorrow', 'Apa prioritas besok?', 'Satu hal yang paling penting untuk dimulai besok...'],
  ];

  const stats = [
    { label: 'Total work', value: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`, sub: 'Waktu fokus hari ini', icon: Moon },
    { label: 'Focus sessions', value: sessions.length, sub: 'Blok kerja diselesaikan', icon: Trophy },
    { label: 'Tasks selesai', value: tasks.filter((task) => task.done).length, sub: 'Tuntas hari ini', icon: CheckSquare },
    { label: 'Total to-do', value: tasks.length, sub: 'Item tercatat', icon: Calendar },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6 bg-transparent p-4 sm:p-8">
      {/* Calm Sunsama Header */}
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-indigo-300 shadow-sm dark:bg-slate-800 dark:text-indigo-400">
          <Moon className="h-6 w-6 stroke-[2]" />
        </div>
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
          Daily Shutdown
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Tutup harimu dengan tenang.
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Tinjau progresmu hari ini, lepaskan yang belum selesai, dan tentukan arah tenang untuk esok hari.
        </p>
      </div>

      {/* Stats Grid - Crisp Sunsama White Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-xs transition-all hover:shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {item.value}
            </div>
            <div className="mt-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
              {item.label}
            </div>
            <div className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate">
              {item.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Reflection Card - Crisp White Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-7 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-5 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
          <Sparkles className="h-4 w-4 text-indigo-500" />
          <span>Refleksi Singkat</span>
        </div>
        <div className="space-y-5">
          {fields.map(([key, label, placeholder]) => (
            <label key={key} className="block">
              <span className="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-300">
                {label}
              </span>
              <textarea
                rows={3}
                value={answers[key] || ''}
                onChange={(event) => update(key, event.target.value)}
                placeholder={placeholder}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700/80 dark:bg-slate-800/60 dark:text-white dark:focus:border-indigo-400"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Saved Indicator */}
      <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <span>Shutdown tersimpan otomatis</span>
        <ChevronRight className="h-3.5 w-3.5 opacity-50" />
      </div>
    </div>
  );
};

export default DailyShutdown;
