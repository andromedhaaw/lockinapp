import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Leaf, Play, Sparkles } from 'lucide-react';
import { useGarden } from '../../context/GardenContext';

const ForYou = ({ onStartFocus }) => {
  const [task, setTask] = useState('');
  const taskInputRef = useRef(null);
  const [activeFocus, setActiveFocus] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lockin_active_focus') || 'null'); } catch { return null; }
  });
  const { grid, inventory } = useGarden();
  const sessions = useMemo(() => { try { return JSON.parse(localStorage.getItem('lockin_focus_sessions') || '[]'); } catch { return []; } }, []);
  const todayKey = new Date().toISOString().slice(0, 10);
  const todaySessions = sessions.filter((session) => session.completedAt?.slice(0, 10) === todayKey);
  const todayTasks = (() => { try { return JSON.parse(localStorage.getItem('lockin_todos') || '[]').filter((item) => !item.done && new Date(item.due).toDateString() === new Date().toDateString()).length; } catch { return 0; } })();
  const plantedCount = grid.filter(Boolean).length;
  const seedCount = Object.values(inventory).reduce((sum, count) => sum + count, 0);
  useEffect(() => {
    const sync = () => { try { setActiveFocus(JSON.parse(localStorage.getItem('lockin_active_focus') || 'null')); } catch {} };
    window.addEventListener('lockin-focus-sync', sync);
    const interval = setInterval(sync, 1000);
    return () => { window.removeEventListener('lockin-focus-sync', sync); clearInterval(interval); };
  }, []);
  const remaining = activeFocus ? Math.max(0, Math.ceil((activeFocus.endAt - Date.now()) / 1000)) : 0;
  const formatRemaining = (value) => `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
  const start = (minutes) => {
    const focusTask = task.trim() || 'Focus session';
    const session = { minutes, task: focusTask, startedAt: Date.now(), endAt: Date.now() + minutes * 60 * 1000 };
    localStorage.setItem('lockin_pending_focus_task', focusTask);
    localStorage.setItem('lockin_pending_focus_minutes', String(minutes));
    localStorage.setItem('lockin_active_focus', JSON.stringify(session));
    setActiveFocus(session);
    window.dispatchEvent(new Event('lockin-focus-start'));
    onStartFocus?.(minutes, focusTask);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5 bg-[#fbfcfb] p-4 sm:p-8">
      <div className="space-y-1"><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#249653]">For you</p><h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Make today count.</h1><p className="text-sm text-slate-500 dark:text-slate-400">{todayTasks > 0 ? `You have ${todayTasks} task${todayTasks === 1 ? '' : 's'} left today.` : 'Choose one meaningful thing to begin.'}</p></div>
      {!activeFocus && todaySessions.length === 0 && (
        <div className="rounded-3xl border border-[#bcebc9] bg-[#f0fbf3] p-5 shadow-sm dark:border-[#4dcd7d]/25 dark:bg-[#4dcd7d]/10 sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#249653]">Your first move</p>
          <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900 dark:text-white">Choose one task. Start small.</h2>
          <div className="mt-4 grid gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 sm:grid-cols-3">
            <div className="rounded-xl bg-white/70 px-3 py-2 dark:bg-slate-900/40">① Choose a task</div>
            <div className="rounded-xl bg-white/70 px-3 py-2 dark:bg-slate-900/40">② Focus for 2 minutes</div>
            <div className="rounded-xl bg-white/70 px-3 py-2 dark:bg-slate-900/40">③ Grow your garden</div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => start(2)} className="rounded-xl bg-[#4dcd7d] px-4 py-2.5 text-xs font-black text-slate-950 shadow-sm transition hover:-translate-y-0.5 active:scale-95">Start 2-minute focus</button>
            <button onClick={() => taskInputRef.current?.focus()} className="rounded-xl border border-[#a9dfb8] bg-white px-4 py-2.5 text-xs font-black text-[#249653] transition hover:bg-white/70 active:scale-95 dark:border-[#4dcd7d]/30 dark:bg-slate-900/50">Choose a task</button>
          </div>
        </div>
      )}
      {!activeFocus && todaySessions.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div><p className="text-sm font-black text-slate-900 dark:text-white">Ready for the next block?</p><p className="text-xs text-slate-500">A small start keeps the momentum going.</p></div>
          <div className="flex gap-2"><button onClick={() => start(2)} className="rounded-xl bg-[#4dcd7d] px-3 py-2 text-xs font-black text-slate-950 transition active:scale-95">Start 2 minutes</button><button onClick={() => taskInputRef.current?.focus()} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-[#4dcd7d] dark:border-slate-700 dark:text-slate-300">Choose a task</button></div>
        </div>
      )}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
        <div className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Start with one task</div>
        <textarea ref={taskInputRef} value={task} onChange={(event) => setTask(event.target.value)} placeholder="Write a task..." rows={2} className="mt-3 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base text-slate-900 outline-none transition focus:border-[#4dcd7d] focus:ring-4 focus:ring-[#4dcd7d]/15 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
        <div className="mt-4 grid grid-cols-3 gap-2">{[2, 10, 25].map((minutes) => <button key={minutes} onClick={() => start(minutes)} className="flex items-center justify-center gap-1.5 rounded-2xl bg-[#4dcd7d] px-3 py-3 text-sm font-extrabold text-slate-950 shadow-sm shadow-[#4dcd7d]/25 transition hover:-translate-y-0.5 active:scale-95"><Play className="h-3.5 w-3.5 fill-current" /> Start {minutes}m</button>)}</div>
      </div>
      <div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${activeFocus && remaining > 0 ? '[&>div:nth-child(2)]:hidden' : '[&>div:first-child]:hidden'}`}>
        {activeFocus && remaining > 0 && <div className="rounded-2xl border border-[#4dcd7d]/30 bg-[#eaf8ee] p-4 shadow-sm"><div className="text-xs font-bold text-[#249653]">Start your session</div><div className="mt-1 text-4xl font-black tracking-tight text-slate-900">{formatRemaining(remaining)}</div><div className="text-xs font-semibold text-[#249653]">{activeFocus.task}</div></div>}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400"><Sparkles className="h-4 w-4 text-[#4dcd7d]" /> Focus now</div><div className="mt-2 text-4xl font-black tracking-tight text-slate-900 dark:text-white">25:00</div><div className="mt-1 text-xs font-semibold text-[#249653]">Ready when you are · Work</div></div>
        <div className="rounded-2xl border border-[#d9f1df] bg-[#eaf8ee] p-4 shadow-sm dark:border-[#4dcd7d]/20 dark:bg-[#4dcd7d]/10"><div className="flex items-center gap-2 text-xs font-bold text-[#249653]"><Leaf className="h-4 w-4" /> Garden reward</div><div className="mt-3 flex items-center gap-3 text-4xl">🌱 <span className="text-3xl">🌿</span> <span className="text-3xl">🪴</span></div><div className="mt-2 text-xs font-semibold text-slate-500">{plantedCount} growing · {seedCount} seeds collected</div></div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center gap-2 text-xs font-bold text-slate-500"><Sparkles className="h-4 w-4 text-[#4dcd7d]" /> Today’s progress</div><div className="mt-2 flex items-end justify-between"><div className="text-2xl font-black text-slate-900 dark:text-white">{todaySessions.length} <span className="text-sm font-medium text-slate-400">sessions</span></div><div className="text-xs font-bold text-slate-400">Small starts count.</div></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-[#4dcd7d]" style={{ width: `${Math.min(todaySessions.length * 25, 100)}%` }} /></div></div>
      <button onClick={() => onStartFocus?.()} className="mx-auto flex items-center gap-2 text-xs font-bold text-slate-400 transition hover:text-[#4dcd7d]">Open full focus timer <ArrowRight className="h-3.5 w-3.5" /></button>
    </div>
  );
};

export default ForYou;
