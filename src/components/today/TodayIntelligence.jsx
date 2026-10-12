import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, ChevronUp, Play, Sparkles } from 'lucide-react';

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
    return <section className="mx-4 mt-3 flex items-center justify-between gap-4 rounded-2xl border border-[#cfe9d7] bg-[#f4fbf6] px-4 py-3 dark:border-[#4dcd7d]/20 dark:bg-[#4dcd7d]/10 sm:px-5">
      <div className="flex min-w-0 items-center gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#4dcd7d] text-white"><Check className="h-4 w-4" strokeWidth={3} /></span><div className="min-w-0"><p className="text-sm font-extrabold text-[#17211b] dark:text-white">You’ve completed {context.sessions.length} focus blocks.</p><p className="truncate text-xs font-medium text-[#748078]">One more block will move today’s goal forward.</p></div></div>
      <button type="button" onClick={() => start(nextTask?.minutes || 25)} className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#17211b] px-3 py-2 text-xs font-bold text-white transition-transform duration-200 active:scale-95">Start next block <ArrowRight className="h-3.5 w-3.5" /></button>
    </section>;
  }

  if (context.sessions.length > 0) {
    return <section className="mx-4 mt-3 flex items-center justify-between gap-4 border-b border-[#e9e7e1] px-1 pb-3">
      <div><p className="text-sm font-extrabold text-[#17211b] dark:text-white">Ready for the next block?</p><p className="text-xs text-[#748078]">Keep the next action small and visible.</p></div>
      <button type="button" onClick={() => start(nextTask?.minutes || 25)} className="inline-flex items-center gap-2 rounded-xl bg-[#4dcd7d] px-3.5 py-2.5 text-xs font-black text-[#17211b] transition-transform duration-200 active:scale-95"><Play className="h-3.5 w-3.5 fill-current" />Start focus</button>
    </section>;
  }

  return <section className="mx-4 mt-3 rounded-2xl border border-[#e9e7e1] bg-white px-4 py-4 shadow-[0_1px_2px_rgba(34,51,39,.035)] sm:px-5">
    <div className="flex items-start justify-between gap-4"><div className="flex items-start gap-3"><span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#f0ecfb] text-[#8b6cd9]"><Sparkles className="h-4 w-4" /></span><div><p className="text-sm font-extrabold text-[#17211b]">{expanded ? 'Not sure where to begin?' : 'Start gently'}</p><p className="mt-0.5 text-xs font-medium leading-relaxed text-[#748078]">{expanded ? `Let’s make “${nextTask?.title || 'your first task'}” smaller.` : 'Choose one task and focus for two minutes.'}</p></div></div>{expanded && <button type="button" onClick={() => setExpanded(false)} className="rounded-lg p-1.5 text-[#748078] hover:bg-[#faf9f6]" aria-label="Collapse suggestion"><ChevronUp className="h-4 w-4" /></button>}</div>
    {expanded && <div className="ml-11 mt-3 rounded-xl bg-[#faf9f6] px-3 py-2.5"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#8b6cd9]">Smallest step</p><p className="mt-1 text-sm font-semibold text-[#17211b]">{smallestStep}</p></div>}
    <div className="ml-11 mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => setExpanded(true)} className="rounded-xl border border-[#e9e7e1] px-3 py-2 text-xs font-bold text-[#17211b] transition-colors duration-200 hover:bg-[#faf9f6]">Help me choose</button><button type="button" onClick={() => start(2)} className="inline-flex items-center gap-1.5 rounded-xl bg-[#4dcd7d] px-3 py-2 text-xs font-black text-[#17211b] transition-transform duration-200 active:scale-95"><Play className="h-3.5 w-3.5 fill-current" />Start 2 minutes</button></div>
  </section>;
};

export default TodayIntelligence;
