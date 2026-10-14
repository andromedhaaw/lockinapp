import { useEffect, useMemo, useState } from 'react';
import { ChevronUp, Play, Sparkles } from 'lucide-react';

const todayKey = () => new Date().toISOString().slice(0, 10);

const readContext = () => {
  try {
    const sessions = JSON.parse(localStorage.getItem('lockin_focus_sessions') || '[]');
    return {
      sessions: sessions.filter((session) => session.completedAt?.slice(0, 10) === todayKey()),
      active: Boolean(JSON.parse(localStorage.getItem('lockin_active_focus') || 'null')),
    };
  } catch {
    return { sessions: [], active: false };
  }
};

const TodayIntelligence = ({ tasks = [], onStartFocus }) => {
  const [context, setContext] = useState(readContext);
  const [expanded, setExpanded] = useState(false);
  const unfinished = useMemo(() => tasks.filter((task) => !task.completed), [tasks]);
  const nextTask = unfinished[0];
  const smallestStep = nextTask?.subtasks?.find((step) => !step.completed)?.title || 'Open what you need and make the first visible move.';

  useEffect(() => {
    const sync = () => setContext(readContext());
    window.addEventListener('local-data-updated', sync);
    window.addEventListener('focus-session-started', sync);
    return () => {
      window.removeEventListener('local-data-updated', sync);
      window.removeEventListener('focus-session-started', sync);
    };
  }, []);

  if (context.active) return null;

  const start = (minutes) => onStartFocus?.({
    ...(nextTask || {}),
    title: nextTask?.title || 'Gentle start',
    name: nextTask?.title || 'Gentle start',
    minutes,
    estimatedTime: `${minutes}m`,
  });

  if (context.sessions.length >= 3) {
    return <section className="flex items-center justify-between gap-3 rounded-xl border border-[#e2e5e0] bg-[#fbfbf9] p-3.5 shadow-[0_3px_12px_rgba(23,33,27,.045)] dark:border-slate-700 dark:bg-slate-800">
      <div className="min-w-0 border-l-2 border-[#4dcd7d] pl-3">
        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#748078]">{context.sessions.length} blocks complete · Up next</p>
        <p className="mt-1 truncate text-[12px] font-semibold text-[#17211b] dark:text-white">{nextTask?.title || 'Choose your next task'}</p>
      </div>
      <button type="button" onClick={() => start(nextTask?.minutes || 25)} className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-[#dfe3de] bg-white px-2.5 text-[10px] font-bold text-[#17211b] transition-colors duration-200 hover:border-[#aeb7b0] hover:bg-[#fafaf8] active:bg-[#f0f1ee] dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"><Play className="h-3 w-3 fill-current" />Start</button>
    </section>;
  }

  if (context.sessions.length > 0) {
    return <section className="flex items-center justify-between gap-3 rounded-xl border border-[#e2e5e0] bg-[#fbfbf9] p-3.5 shadow-[0_3px_12px_rgba(23,33,27,.045)] dark:border-slate-700 dark:bg-slate-800">
      <div className="min-w-0 border-l-2 border-[#4dcd7d] pl-3">
        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#748078]">Up next</p>
        <p className="mt-1 truncate text-[12px] font-semibold text-[#17211b] dark:text-white">{nextTask?.title || 'Choose your next task'}</p>
        {nextTask && <p className="mt-0.5 font-mono text-[9px] font-semibold text-[#8a948d]">{nextTask.minutes || 25} min focus</p>}
      </div>
      <button type="button" onClick={() => start(nextTask?.minutes || 25)} className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-[#dfe3de] bg-white px-2.5 text-[10px] font-bold text-[#17211b] transition-colors duration-200 hover:border-[#aeb7b0] hover:bg-[#fafaf8] active:bg-[#f0f1ee] dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"><Play className="h-3 w-3 fill-current" />Start</button>
    </section>;
  }

  return <section className="mx-0 mt-0 rounded-xl border border-[#e9e7e1] bg-white px-3 py-3 shadow-sm sm:px-4">
    <div className="flex items-start justify-between gap-4"><div className="flex items-start gap-3"><span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#f0ecfb] text-[#8b6cd9]"><Sparkles className="h-4 w-4" /></span><div><p className="text-sm font-extrabold text-[#17211b]">{expanded ? 'Not sure where to begin?' : 'Start gently'}</p><p className="mt-0.5 text-xs font-medium leading-relaxed text-[#748078]">{expanded ? `Let’s make “${nextTask?.title || 'your first task'}” smaller.` : 'Choose one task and focus for two minutes.'}</p></div></div>{expanded && <button type="button" onClick={() => setExpanded(false)} className="rounded-lg p-1.5 text-[#748078] hover:bg-[#faf9f6]" aria-label="Collapse suggestion"><ChevronUp className="h-4 w-4" /></button>}</div>
    {expanded && <div className="ml-11 mt-3 rounded-xl bg-[#faf9f6] px-3 py-2.5"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#8b6cd9]">Smallest step</p><p className="mt-1 text-sm font-semibold text-[#17211b]">{smallestStep}</p></div>}
    <div className="ml-11 mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => setExpanded(true)} className="rounded-xl border border-[#e9e7e1] px-3 py-2 text-xs font-bold text-[#17211b] transition-colors duration-200 hover:bg-[#faf9f6]">Help me choose</button><button type="button" onClick={() => start(2)} className="inline-flex items-center gap-1.5 rounded-xl bg-[#4dcd7d] px-3 py-2 text-xs font-black text-[#17211b] transition-transform duration-200 active:scale-95"><Play className="h-3.5 w-3.5 fill-current" />Start 2 minutes</button></div>
  </section>;
};

export default TodayIntelligence;
