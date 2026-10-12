import { useState } from 'react';
import PropTypes from 'prop-types';
import { Bell, Check, Copy, MessageCircle, Settings, Target, UserPlus, Users } from 'lucide-react';

const POD = {
  name: 'Productivity Legends', code: 'LOCK-7X9K', weeklyGoal: 25, week: 5,
  members: [
    { id: 3, name: 'Mike R.', initials: 'MR', role: 'Research', streak: 15, today: 5.1, week: 32.5 },
    { id: 1, name: 'You', initials: 'YO', role: 'Builder', streak: 12, today: 4.5, week: 28.5, isYou: true },
    { id: 2, name: 'Sarah K.', initials: 'SK', role: 'Design', streak: 8, today: 3.2, week: 24 },
    { id: 4, name: 'Emma L.', initials: 'EL', role: 'Operations', streak: 6, today: 2.8, week: 18 },
    { id: 5, name: 'Alex T.', initials: 'AT', role: 'Product', streak: 3, today: 0, week: 12.5, needsPing: true },
  ],
};

export const AccountabilityPods = () => {
  const [copied, setCopied] = useState(false);
  const [pinged, setPinged] = useState(new Set());
  const completed = POD.members.filter((member) => member.week >= POD.weeklyGoal).length;
  const podProgress = Math.round((POD.members.reduce((sum, member) => sum + Math.min(member.week, POD.weeklyGoal), 0) / (POD.weeklyGoal * POD.members.length)) * 100);

  const copyCode = async () => {
    await navigator.clipboard.writeText(POD.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return <div className="mx-auto max-w-4xl space-y-6">
    <section className="border-b border-slate-200 pb-6 dark:border-slate-800">
      <div className="flex flex-wrap items-start justify-between gap-5"><div><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.18em] text-[#249653]"><Users className="h-4 w-4" />Your accountability pod</div><h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">{POD.name}</h2><p className="mt-1 text-sm text-slate-500">{POD.members.length} members · Week {POD.week} · one shared commitment</p></div><button type="button" className="rounded-xl border border-slate-200 p-2.5 text-slate-400 transition hover:text-slate-700 dark:border-slate-700"><Settings className="h-4 w-4" /></button></div>
      <div className="mt-5 flex w-fit items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"><span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Invite code</span><span className="font-mono text-sm font-black text-slate-900 dark:text-white">{POD.code}</span><button type="button" onClick={copyCode} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-[#249653] dark:hover:bg-slate-800">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</button></div>
    </section>

    <section><div className="flex items-end justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-slate-400">Weekly standing</p><h3 className="mt-1 text-xl font-black text-slate-900 dark:text-white">The pod this week</h3></div><p className="text-xs font-bold text-slate-400">Goal · {POD.weeklyGoal}h each</p></div>
      <div className="mt-4 divide-y divide-slate-100 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800">{POD.members.map((member, index) => <div key={member.id} className={`grid grid-cols-[32px_42px_1fr_auto] items-center gap-3 px-1 py-4 ${member.isYou ? 'bg-[#f3faf5]' : ''} dark:${member.isYou ? 'bg-emerald-950/20' : ''}`}><span className="text-center font-mono text-xs font-black text-slate-400">{String(index + 1).padStart(2, '0')}</span><span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-[11px] font-black text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-white">{member.initials}</span><div className="min-w-0"><div className="flex items-center gap-2"><span className="truncate text-sm font-black text-slate-900 dark:text-white">{member.name}</span>{member.isYou && <span className="text-[9px] font-black uppercase text-[#249653]">You</span>}</div><p className="mt-0.5 text-[11px] text-slate-400">{member.role} · {member.streak} day streak · {member.today}h today</p></div><div className="flex items-center gap-4"><div className="w-24"><div className="mb-1 text-right font-mono text-sm font-black text-slate-900 dark:text-white">{member.week}h</div><div className="h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-[#4dcd7d] transition-[width] duration-200" style={{ width: `${Math.min(100, (member.week / POD.weeklyGoal) * 100)}%` }} /></div></div>{member.needsPing && <button type="button" onClick={() => setPinged((current) => new Set([...current, member.id]))} className={`rounded-lg border p-2 transition ${pinged.has(member.id) ? 'border-[#bcebc9] text-[#249653]' : 'border-slate-200 text-slate-400 hover:text-[#249653]'}`} title="Send encouragement">{pinged.has(member.id) ? <Check className="h-4 w-4" /> : <Bell className="h-4 w-4" />}</button>}</div></div>)}</div>
    </section>

    <div className="grid gap-4 sm:grid-cols-[1.35fr_.65fr]"><section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-start gap-3"><Target className="mt-0.5 h-5 w-5 text-[#249653]" /><div className="flex-1"><div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-black text-slate-900 dark:text-white">Weekly pod challenge</h3><p className="mt-1 text-xs text-slate-500">Everyone reaches 25 focused hours.</p></div><span className="font-mono text-sm font-black text-slate-900 dark:text-white">{completed}/5</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-[#4dcd7d] transition-[width] duration-200" style={{ width: `${podProgress}%` }} /></div><p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">{podProgress}% of the shared goal</p></div></div></section><button type="button" className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900"><div><MessageCircle className="h-5 w-5 text-slate-500" /><p className="mt-3 text-sm font-black text-slate-900 dark:text-white">Pod chat</p><p className="mt-1 text-xs text-slate-400">3 unread messages</p></div><span className="h-2 w-2 rounded-full bg-[#4dcd7d]" /></button></div>

    <button type="button" className="inline-flex items-center gap-2 text-xs font-black text-slate-400 transition hover:text-[#249653]"><UserPlus className="h-4 w-4" />Invite another member</button>
  </div>;
};

AccountabilityPods.propTypes = { workHistory: PropTypes.object, todayHours: PropTypes.number };
export default AccountabilityPods;
