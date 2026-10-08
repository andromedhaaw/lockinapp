import { ArrowLeft, BarChart3, Clock3, Hash, TrendingUp } from 'lucide-react';

const MOCK_TAGS = [
  { tag: 'Work', hours: 18.4, sessions: 27, color: '#4dcd7d' },
  { tag: 'Study', hours: 9.6, sessions: 14, color: '#8b5cf6' },
  { tag: 'Marketing', hours: 6.8, sessions: 10, color: '#f59e0b' },
  { tag: 'Personal', hours: 4.2, sessions: 8, color: '#38bdf8' },
  { tag: 'Research', hours: 3.5, sessions: 5, color: '#f472b6' },
];

const TagAnalytics = ({ onBack }) => {
  let sessions = [];
  try { sessions = JSON.parse(localStorage.getItem('lockin_focus_sessions') || '[]'); } catch {}
  const live = sessions.reduce((acc, session) => {
    const tag = session.tag || 'Work';
    const row = acc[tag] || { tag, hours: 0, sessions: 0, color: '#4dcd7d' };
    row.hours += Number(session.durationMinutes || 0) / 60;
    row.sessions += 1;
    acc[tag] = row;
    return acc;
  }, {});
  const rows = MOCK_TAGS.map((mock) => ({ ...mock, ...(live[mock.tag] ? { hours: live[mock.tag].hours, sessions: live[mock.tag].sessions } : {}) }));
  Object.values(live).forEach((row) => { if (!rows.some((item) => item.tag === row.tag)) rows.push(row); });
  const totalHours = rows.reduce((sum, row) => sum + row.hours, 0);
  const maxHours = Math.max(...rows.map((row) => row.hours), 1);

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-8">
      <div>{onBack && <button onClick={onBack} className="mb-5 inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#249653]"><ArrowLeft className="h-4 w-4" /> Back to Focus</button>}<div className="flex items-center gap-2 text-sm font-bold text-[#249653]"><BarChart3 className="h-4 w-4" /> Focus analytics</div><h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Where your focus goes</h1><p className="mt-2 text-sm text-slate-500">See how your time is distributed across Work, Study, Marketing, and your custom tags.</p></div>
      <div className="grid grid-cols-3 gap-3"><Summary icon={<Clock3 />} label="Total focus" value={`${totalHours.toFixed(1)}h`} /><Summary icon={<Hash />} label="Sessions" value={rows.reduce((sum, row) => sum + row.sessions, 0)} /><Summary icon={<TrendingUp />} label="Top tag" value={rows.sort((a, b) => b.hours - a.hours)[0]?.tag || '—'} /></div>
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7"><div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Time by tag</h2><span className="text-xs text-slate-400">Last 30 days · sample data</span></div><div className="space-y-5">{rows.map((row) => <div key={row.tag}><div className="mb-2 flex items-center justify-between text-sm"><span className="font-bold text-slate-700 dark:text-slate-200">{row.tag}</span><span className="text-slate-400">{row.hours.toFixed(1)}h · {row.sessions} sessions</span></div><div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full" style={{ width: `${(row.hours / maxHours) * 100}%`, backgroundColor: row.color }} /></div></div>)}</div></div>
      <p className="text-center text-xs text-slate-400">Complete more tagged focus sessions to replace the sample view with your real breakdown.</p>
    </div>
  );
};

const Summary = ({ icon, label, value }) => <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center gap-2 text-xs font-bold text-slate-400">{icon}<span>{label}</span></div><div className="mt-2 truncate text-xl font-black text-slate-900 dark:text-white">{value}</div></div>;

export default TagAnalytics;
