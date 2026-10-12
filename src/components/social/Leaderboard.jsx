import { ArrowDown, ArrowUp, Flame, Minus, Sparkles } from 'lucide-react';
import { useState } from 'react';

const baseUsers = [
  { name: 'Marc Lou', handle: '@marclou', hours: 142.5, streak: 45, change: 'up', initials: 'ML', color: '#ffe08a' },
  { name: 'Pieter Levels', handle: '@levelsio', hours: 138.2, streak: 32, change: 'up', initials: 'PL', color: '#b9e8c8' },
  { name: 'You', handle: '@productivity_user', hours: 98.5, streak: 12, change: 'same', initials: 'YO', color: '#cfc4f5', isMe: true },
  { name: 'Nikita Bier', handle: '@nikitabier', hours: 82, streak: 8, change: 'down', initials: 'NB', color: '#ffc3b6' },
  { name: 'Indie Hacker', handle: '@indiehacker99', hours: 45.2, streak: 3, change: 'same', initials: 'IH', color: '#b9dff4' },
];

const periods = [['daily', 'Day'], ['weekly', 'Week'], ['monthly', 'Month'], ['yearly', 'Year'], ['all_time', 'All time']];
const multipliers = { daily: .15, weekly: 1, monthly: 4.2, yearly: 50, all_time: 120 };

const Leaderboard = () => {
  const [scope, setScope] = useState('global');
  const [period, setPeriod] = useState('weekly');
  const users = baseUsers.map((user) => ({ ...user, hours: user.hours * multipliers[period] })).sort((a, b) => b.hours - a.hours);

  return <section className="mx-auto max-w-4xl space-y-5">
    <header className="flex flex-wrap items-start justify-between gap-5"><div><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.18em] text-[#8b6a00]"><Sparkles className="h-4 w-4" />Focus League · Season 05</div><h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">Who showed up this week?</h2><p className="mt-1 text-sm text-slate-500">Only completed focus time counts.</p></div><div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900">{[['global', 'Global'], ['friends', 'Friends']].map(([id, label]) => <button key={id} type="button" onClick={() => setScope(id)} className={`rounded-lg px-4 py-2 text-xs font-black transition-all duration-200 ${scope === id ? 'bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950' : 'text-slate-400 hover:text-slate-700'}`}>{label}</button>)}</div></header>

    <div className="flex gap-1 overflow-x-auto rounded-xl bg-[#f2f0eb] p-1.5 dark:bg-slate-900">{periods.map(([id, label]) => <button key={id} type="button" onClick={() => setPeriod(id)} className={`min-w-fit flex-1 rounded-lg px-3 py-2 text-xs font-black transition-all duration-200 ${period === id ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white' : 'text-slate-400 hover:text-slate-700'}`}>{label}</button>)}</div>

    <div className="overflow-hidden rounded-[24px] border border-[#e5e1d8] bg-white shadow-[0_10px_35px_rgba(45,55,48,.06)] dark:border-slate-800 dark:bg-slate-900">
      <div className="hidden grid-cols-[54px_52px_1fr_120px_120px] items-center border-b border-slate-100 bg-[#faf9f6] px-5 py-3 text-[9px] font-black uppercase tracking-[.15em] text-slate-400 sm:grid dark:border-slate-800 dark:bg-slate-900"><span>Rank</span><span /><span>Member</span><span>Streak</span><span className="text-right">Focus time</span></div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">{users.map((user, index) => {
        const ChangeIcon = user.change === 'up' ? ArrowUp : user.change === 'down' ? ArrowDown : Minus;
        return <article key={user.handle} className={`group grid grid-cols-[38px_44px_1fr_auto] items-center gap-3 px-4 py-4 transition-colors duration-200 sm:grid-cols-[42px_52px_1fr_120px_120px] sm:px-5 ${user.isMe ? 'bg-[#f5f1ff]' : 'hover:bg-[#faf9f6]'} dark:${user.isMe ? 'bg-violet-950/20' : 'hover:bg-slate-800/60'}`}>
          <div className="relative"><span className={`font-mono text-sm font-black ${user.isMe ? 'text-[#765cc8]' : 'text-slate-400'}`}>{String(index + 1).padStart(2, '0')}</span><ChangeIcon className={`absolute -bottom-2 left-0 h-2.5 w-2.5 ${user.change === 'up' ? 'text-[#249653]' : user.change === 'down' ? 'text-red-400' : 'text-slate-300'}`} /></div>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-white text-[10px] font-black text-slate-700 shadow-sm" style={{ background: user.color }}>{user.initials}</span>
          <div className="min-w-0"><div className="flex items-center gap-2"><h3 className="truncate text-sm font-black text-slate-900 dark:text-white">{user.name}</h3>{user.isMe && <span className="rounded-md bg-[#ddd5fa] px-1.5 py-0.5 text-[9px] font-black uppercase text-[#604db0]">You</span>}</div><p className="mt-0.5 truncate text-[10px] font-semibold text-slate-400">{user.handle}</p><div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-slate-400 sm:hidden"><Flame className="h-3 w-3 text-orange-500" />{user.streak} day streak</div></div>
          <div className="hidden items-center gap-1.5 text-xs font-bold text-slate-500 sm:flex"><Flame className="h-3.5 w-3.5 text-orange-500" />{user.streak} days</div>
          <div className="text-right"><p className="font-mono text-base font-black text-slate-950 dark:text-white">{user.hours.toFixed(1)}h</p><p className="text-[9px] font-black uppercase tracking-wider text-slate-400">focused</p></div>
        </article>;
      })}</div>
    </div>
  </section>;
};

export default Leaderboard;
