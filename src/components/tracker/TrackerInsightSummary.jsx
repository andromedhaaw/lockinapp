import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BarChart3, Clock3, Target, Tag, TrendingUp } from 'lucide-react';

const readSessions = () => {
  try { return JSON.parse(localStorage.getItem('lockin_focus_sessions') || '[]'); } catch { return []; }
};

const TrackerInsightSummary = () => {
  const [sessions, setSessions] = useState(readSessions);
  const [protectedWindow, setProtectedWindow] = useState(() => localStorage.getItem('lockin_protected_focus_window') || '');

  useEffect(() => {
    const sync = () => setSessions(readSessions());
    window.addEventListener('local-data-updated', sync);
    return () => window.removeEventListener('local-data-updated', sync);
  }, []);

  const insight = useMemo(() => {
    const recent = sessions.filter((session) => session.completedAt && Date.now() - new Date(session.completedAt).getTime() < 28 * 86400000);
    const actual = recent.reduce((sum, session) => sum + Number(session.actualMinutes || session.durationMinutes || 0), 0);
    const planned = recent.reduce((sum, session) => sum + Number(session.plannedMinutes || session.durationMinutes || 0), 0);
    const tags = recent.reduce((map, session) => ({ ...map, [session.tag || 'Work']: (map[session.tag || 'Work'] || 0) + Number(session.actualMinutes || session.durationMinutes || 0) }), {});
    const hours = recent.reduce((map, session) => { const hour = new Date(session.completedAt).getHours(); map[hour] = (map[hour] || 0) + Number(session.actualMinutes || session.durationMinutes || 0); return map; }, {});
    const days = recent.reduce((map, session) => { const day = new Date(session.completedAt).toLocaleDateString('en-US', { weekday: 'short' }); map[day] = (map[day] || 0) + Number(session.actualMinutes || session.durationMinutes || 0); return map; }, {});
    const bestHour = Number(Object.entries(hours).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 9);
    const bestWindow = `${String(bestHour).padStart(2, '0')}:00–${String((bestHour + 2) % 24).padStart(2, '0')}:00`;
    const topTag = Object.entries(tags).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Not enough data';
    const bestDay = Object.entries(days).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
    const accuracy = planned ? Math.max(0, Math.round(100 - Math.abs(actual - planned) / planned * 100)) : 0;
    return { recent, actual, planned, bestWindow, topTag, bestDay, accuracy };
  }, [sessions]);

  const protect = () => {
    localStorage.setItem('lockin_protected_focus_window', insight.bestWindow);
    setProtectedWindow(insight.bestWindow);
  };

  return <section className="mt-12 border-t border-[#e9e7e1] pt-8">
    <div className="flex items-end justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#249653]">Work patterns</p><h2 className="mt-1 text-xl font-extrabold tracking-tight text-[#17211b] dark:text-white">What your focus data is telling you</h2></div><span className="text-xs font-medium text-[#748078]">Last 28 days</span></div>
    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Insight icon={BarChart3} label="Actual vs planned" value={`${insight.actual}m / ${insight.planned}m`} detail={insight.planned ? `${insight.accuracy}% estimation accuracy` : 'Complete a planned session'} />
      <Insight icon={Tag} label="Focus by tag" value={insight.topTag} detail="Your strongest work category" />
      <Insight icon={Clock3} label="Best focus window" value={insight.bestWindow} detail="Based on completed sessions" />
      <Insight icon={TrendingUp} label="Weekly pattern" value={insight.bestDay} detail="Your most focused day" />
    </div>
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#cfe9d7] bg-[#f4fbf6] px-4 py-3.5"><div className="flex items-start gap-3"><Target className="mt-0.5 h-4 w-4 shrink-0 text-[#249653]" /><div><p className="text-sm font-extrabold text-[#17211b]">{insight.recent.length < 2 ? 'Complete two focus blocks to unlock a personal pattern.' : `Protect ${insight.bestWindow} for your highest-value work.`}</p><p className="mt-0.5 text-xs text-[#748078]">One recommendation, grounded in your completed sessions.</p></div></div><button type="button" disabled={insight.recent.length < 2} onClick={protect} className="inline-flex items-center gap-1.5 rounded-xl bg-[#17211b] px-3.5 py-2.5 text-xs font-bold text-white transition-transform duration-200 enabled:active:scale-95 disabled:cursor-not-allowed disabled:opacity-40">{protectedWindow === insight.bestWindow ? 'Protected for tomorrow' : 'Protect this time tomorrow'} <ArrowRight className="h-3.5 w-3.5" /></button></div>
  </section>;
};

const Insight = ({ icon: Icon, label, value, detail }) => <div className="rounded-2xl border border-[#e9e7e1] bg-white p-4 shadow-[0_1px_2px_rgba(34,51,39,.035)] dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center gap-2 text-[#748078]"><Icon className="h-4 w-4" /><span className="text-[10px] font-black uppercase tracking-[.1em]">{label}</span></div><p className="mt-3 truncate text-lg font-extrabold tracking-tight text-[#17211b] dark:text-white">{value}</p><p className="mt-1 text-[11px] font-medium text-[#748078]">{detail}</p></div>;

export default TrackerInsightSummary;
