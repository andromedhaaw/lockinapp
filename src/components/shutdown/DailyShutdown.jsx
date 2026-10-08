import { useMemo, useState } from 'react';
import { CheckCircle2, ChevronRight, Moon, Sparkles } from 'lucide-react';

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

  return <div className="mx-auto max-w-3xl space-y-6 bg-[#fbfcfb] p-4 sm:p-8">
    <div className="text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf8ee] text-[#249653]"><Moon className="h-6 w-6" /></div><p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-[#249653]">Daily shutdown</p><h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Tutup harimu dengan tenang.</h1><p className="mt-2 text-sm text-slate-500">Lihat progresmu, lepaskan yang belum selesai, lalu siapkan langkah pertama untuk besok.</p></div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {[[`${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`, 'Total work'], [sessions.length, 'Focus sessions'], [tasks.filter((task) => task.done).length, 'Tasks selesai'], [tasks.length, 'Total To Do']].map(([value, label]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="text-2xl font-black text-slate-900 dark:text-white">{value}</div><div className="mt-1 text-xs font-bold text-slate-400">{label}</div></div>)}
    </div>
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 dark:border-slate-800 dark:bg-slate-900"><div className="mb-5 flex items-center gap-2 text-sm font-black text-slate-800 dark:text-white"><Sparkles className="h-4 w-4 text-[#4dcd7d]" /> Refleksi singkat</div><div className="space-y-5">{fields.map(([key, label, placeholder]) => <label key={key} className="block"><span className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-200">{label}</span><textarea rows={3} value={answers[key] || ''} onChange={(event) => update(key, event.target.value)} placeholder={placeholder} className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition focus:border-[#4dcd7d] focus:ring-4 focus:ring-[#4dcd7d]/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white" /></label>)}</div></div>
    <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#249653]"><CheckCircle2 className="h-4 w-4" /> Shutdown tersimpan otomatis <ChevronRight className="h-3.5 w-3.5" /></div>
  </div>;
};

export default DailyShutdown;
