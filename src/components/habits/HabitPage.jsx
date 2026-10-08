import { useMemo, useState } from 'react';
import { CalendarCheck, Check, Grid3X3, List, Plus } from 'lucide-react';

const GREEN = '#4dcd7d';
const initialHabits = [
  { id: 'focus', icon: '🎯', name: 'Deep work' },
  { id: 'walk', icon: '🚶', name: 'Take a walk' },
  { id: 'read', icon: '📖', name: 'Read 20 minutes' },
];

const HabitPage = () => {
  const [view, setView] = useState('streak');
  const [habits, setHabits] = useState(initialHabits);
  const [completed, setCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lockin_habits') || '{}'); } catch { return {}; }
  });
  const days = useMemo(() => Array.from({ length: 196 }, (_, index) => {
    const date = new Date(); date.setDate(date.getDate() - (83 - index)); return date;
  }), []);
  const weekDays = days.slice(-7);
  const monthLabels = useMemo(() => {
    const seen = [];
    days.forEach((day) => {
      const label = day.toLocaleDateString('en-US', { month: 'short' });
      if (!seen.includes(label)) seen.push(label);
    });
    return seen;
  }, [days]);
  const dateKey = (date) => date.toISOString().slice(0, 10);
  const toggle = (habitId, date) => setCompleted((current) => {
    const key = `${habitId}:${dateKey(date)}`;
    const next = { ...current, [key]: !current[key] };
    localStorage.setItem('lockin_habits', JSON.stringify(next));
    return next;
  });

  return <div className="mx-auto max-w-5xl space-y-6 bg-[#fbfcfb] p-4 sm:p-8">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#249653]">Habits</p><h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Small actions, repeated.</h1></div>
      <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <button onClick={() => setView('streak')} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${view === 'streak' ? 'bg-[#eaf8ee] text-[#249653]' : 'text-slate-400'}`}><List className="h-4 w-4" /> Streak</button>
        <button onClick={() => setView('grid')} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${view === 'grid' ? 'bg-[#eaf8ee] text-[#249653]' : 'text-slate-400'}`}><Grid3X3 className="h-4 w-4" /> Grid</button>
      </div>
    </div>
    <div className="flex items-center justify-between rounded-2xl border border-[#d9f1df] bg-[#eaf8ee] px-4 py-3"><div className="flex items-center gap-2 text-sm font-bold text-[#249653]"><CalendarCheck className="h-4 w-4" /> This week · keep showing up</div><button onClick={() => setHabits((current) => [...current, { id: `habit-${Date.now()}`, icon: '✨', name: 'New habit' }])} className="flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-xs font-extrabold text-[#249653] shadow-sm"><Plus className="h-3.5 w-3.5" /> Add habit</button></div>
    <div className={`grid gap-4 ${view === 'grid' ? 'md:grid-cols-2' : ''}`}>
      {habits.map((habit) => {
        const progress = Math.round((weekDays.filter((day) => completed[`${habit.id}:${dateKey(day)}`]).length / 7) * 100);
        return <div key={habit.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-base font-black text-slate-800 dark:text-white"><span>{habit.icon}</span>{habit.name}</h2><span className="text-xs font-bold text-[#249653]">{progress}%</span></div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-[#4dcd7d]" style={{ width: `${progress}%` }} /></div>
          {view === 'grid' && <div className="mt-4 flex justify-between text-[10px] font-semibold text-slate-400">{monthLabels.map((month) => <span key={month}>{month}</span>)}</div>}
          {view === 'streak' ? <div className="mt-5 flex justify-between gap-2">{weekDays.map((day) => { const done = completed[`${habit.id}:${dateKey(day)}`]; return <div key={dateKey(day)} className="flex flex-col items-center gap-1"><span className="text-[10px] font-bold text-slate-400">{day.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1)}</span><button onClick={() => toggle(habit.id, day)} title={dateKey(day)} className="flex h-10 w-10 items-center justify-center rounded-full transition hover:scale-105" style={{ background: done ? GREEN : '#d1d5db' }}>{done && <Check className="h-6 w-6 text-white stroke-[4]" />}</button></div>; })}</div> : <div className="mt-5 grid grid-cols-[repeat(28,minmax(0,1fr))] gap-[2px]">{days.map((day) => { const done = completed[`${habit.id}:${dateKey(day)}`]; return <button key={dateKey(day)} onClick={() => toggle(habit.id, day)} title={dateKey(day)} className="aspect-square w-full rounded-[3px] transition hover:scale-125" style={{ background: done ? GREEN : '#e8eee9' }} />; })}</div>}
        </div>;
      })}
    </div>
  </div>;
};

export default HabitPage;
