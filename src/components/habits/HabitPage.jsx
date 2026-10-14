import { useMemo, useState } from 'react';
import { CalendarCheck, Check, ChevronLeft, ChevronRight, Grid3X3, List, Plus, X } from 'lucide-react';

const HABIT_COLORS = [
  { name: 'Green', hex: '#34C759' },
  { name: 'Blue', hex: '#007AFF' },
  { name: 'Yellow', hex: '#FFCC00' },
  { name: 'Red', hex: '#FF3B30' },
  { name: 'Purple', hex: '#AF52DE' },
];

const initialHabits = [
  { id: 'focus', icon: '🎯', name: 'Deep work', color: '#34C759' },
  { id: 'walk', icon: '🚶', name: 'Take a walk', color: '#007AFF' },
  { id: 'read', icon: '📖', name: 'Read 20 minutes', color: '#AF52DE' },
];

const dateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const HabitPage = () => {
  const [view, setView] = useState('streak');
  const [gridView, setGridView] = useState('history');
  const [monthCursor, setMonthCursor] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [habits, setHabits] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lockin_habit_definitions') || 'null') || initialHabits; } catch { return initialHabits; }
  });
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState({ name: '', icon: '✨', color: HABIT_COLORS[0].hex });
  const [completed, setCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lockin_habits') || '{}'); } catch { return {}; }
  });

  const days = useMemo(() => Array.from({ length: 196 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (83 - index));
    return date;
  }), []);
  const weekDays = days.slice(-7);
  const monthLabels = useMemo(() => [...new Set(days.map((day) => day.toLocaleDateString('en-US', { month: 'short' })))], [days]);
  const monthDays = useMemo(() => {
    const firstDay = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
    const lastDay = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0);
    const mondayOffset = (firstDay.getDay() + 6) % 7;
    return [
      ...Array(mondayOffset).fill(null),
      ...Array.from({ length: lastDay.getDate() }, (_, index) => new Date(monthCursor.getFullYear(), monthCursor.getMonth(), index + 1)),
    ];
  }, [monthCursor]);
  const monthLabel = monthCursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const toggle = (habitId, date) => setCompleted((current) => {
    const key = `${habitId}:${dateKey(date)}`;
    const next = { ...current, [key]: !current[key] };
    localStorage.setItem('lockin_habits', JSON.stringify(next));
    return next;
  });

  const getStreak = (habitId) => {
    let streak = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    while (completed[`${habitId}:${dateKey(cursor)}`]) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  };

  const addHabit = (event) => {
    event.preventDefault();
    if (!draft.name.trim()) return;
    const next = [...habits, { id: `habit-${Date.now()}`, name: draft.name.trim(), icon: draft.icon || '✨', color: draft.color }];
    setHabits(next);
    localStorage.setItem('lockin_habit_definitions', JSON.stringify(next));
    setDraft({ name: '', icon: '✨', color: HABIT_COLORS[0].hex });
    setShowAdd(false);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 bg-[#fbfcfb] p-4 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#249653]">Habits</p><h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Small actions, repeated.</h1></div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <button type="button" onClick={() => setView('streak')} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${view === 'streak' ? 'bg-[#eaf8ee] text-[#249653]' : 'text-slate-400'}`}><List className="h-4 w-4" /> Streak</button>
            <button type="button" onClick={() => setView('grid')} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${view === 'grid' ? 'bg-[#eaf8ee] text-[#249653]' : 'text-slate-400'}`}><Grid3X3 className="h-4 w-4" /> Grid</button>
          </div>
          {view === 'grid' && <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm"><button type="button" onClick={() => setGridView('history')} className={`rounded-lg px-3 py-2 text-xs font-bold ${gridView === 'history' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>History</button><button type="button" onClick={() => setGridView('month')} className={`rounded-lg px-3 py-2 text-xs font-bold ${gridView === 'month' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>Month</button></div>}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-[#d9f1df] bg-[#eaf8ee] px-4 py-3"><div className="flex items-center gap-2 text-sm font-bold text-[#249653]"><CalendarCheck className="h-4 w-4" /> This week · keep showing up</div><button type="button" onClick={() => setShowAdd((current) => !current)} className="flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-xs font-extrabold text-[#249653] shadow-sm"><Plus className="h-3.5 w-3.5" /> Add habit</button></div>

      {showAdd && <form onSubmit={addHabit} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><h2 className="text-base font-black text-slate-900">Create a habit</h2><button type="button" onClick={() => setShowAdd(false)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button></div><div className="grid gap-3 sm:grid-cols-[70px_1fr_auto] sm:items-end"><label className="text-xs font-black text-slate-500">Icon<input value={draft.icon} onChange={(event) => setDraft({ ...draft, icon: event.target.value })} maxLength="2" className="mt-2 w-full rounded-xl border border-slate-200 px-2 py-2 text-center text-xl" /></label><label className="text-xs font-black text-slate-500">Habit name<input autoFocus value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="e.g. Drink water" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#34C759]" /></label><button type="submit" className="rounded-xl bg-[#34C759] px-5 py-3 text-sm font-black text-white">Create habit</button></div><div className="mt-5"><p className="text-xs font-black text-slate-500">Choose a color</p><div className="mt-2 flex flex-wrap gap-2">{HABIT_COLORS.map((color) => <button type="button" key={color.hex} onClick={() => setDraft({ ...draft, color: color.hex })} className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold transition ${draft.color === color.hex ? 'ring-2 ring-slate-900 ring-offset-2' : ''}`} style={{ backgroundColor: `${color.hex}18`, color: color.hex }}><span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: color.hex }} />{color.name}</button>)}</div></div></form>}

      {view === 'grid' && gridView === 'month' && <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"><button type="button" onClick={() => setMonthCursor((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900" aria-label="Previous month"><ChevronLeft className="h-4 w-4" /></button><div className="text-center"><p className="text-sm font-black text-slate-900">{monthLabel}</p><p className="text-[10px] font-semibold text-slate-400">Tap a day to update a habit</p></div><button type="button" onClick={() => setMonthCursor((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900" aria-label="Next month"><ChevronRight className="h-4 w-4" /></button></div>}

      <div className={`grid gap-4 ${view === 'grid' ? (gridView === 'month' ? 'sm:grid-cols-2 lg:grid-cols-4 lg:gap-4' : 'md:grid-cols-2') : ''}`}>
        {habits.map((habit) => {
          const progress = Math.round((weekDays.filter((day) => completed[`${habit.id}:${dateKey(day)}`]).length / 7) * 100);
          const streak = getStreak(habit.id);
          const monthCompleted = monthDays.filter(Boolean).filter((day) => completed[`${habit.id}:${dateKey(day)}`]).length;
          return <div key={habit.id} className={`rounded-3xl border border-slate-200 bg-white shadow-sm ${view === 'grid' && gridView === 'month' ? 'p-4' : 'p-5'}`}>
            <div className="flex items-start justify-between gap-2"><div className="min-w-0"><h2 className={`flex items-center gap-2 truncate font-black text-slate-800 ${view === 'grid' && gridView === 'month' ? 'text-sm' : 'text-base'}`}><span>{habit.icon}</span>{habit.name}</h2>{view === 'grid' && gridView === 'month' && <p className="mt-0.5 text-[10px] font-semibold text-slate-400">Total streak: {streak}</p>}</div><span className="shrink-0 text-[11px] font-bold" style={{ color: habit.color }}>{progress}%</span></div>
            <div className={`overflow-hidden rounded-full bg-slate-100 ${view === 'grid' && gridView === 'month' ? 'mt-2 h-1.5' : 'mt-3 h-2'}`}><div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: habit.color }} /></div>
            {view === 'streak' && <div className="mt-5 flex justify-between gap-2">{weekDays.map((day) => { const done = completed[`${habit.id}:${dateKey(day)}`]; return <div key={dateKey(day)} className="flex flex-col items-center gap-1"><span className="text-[10px] font-bold text-slate-400">{day.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1)}</span><button type="button" onClick={() => toggle(habit.id, day)} title={dateKey(day)} className="flex h-10 w-10 items-center justify-center rounded-full transition hover:scale-105" style={{ backgroundColor: done ? habit.color : '#d1d5db' }}>{done && <Check className="h-6 w-6 text-white stroke-[4]" />}</button></div>; })}</div>}
            {view === 'grid' && gridView === 'history' && <><div className="mt-4 flex justify-between text-[10px] font-semibold text-slate-400">{monthLabels.map((month) => <span key={month}>{month}</span>)}</div><div className="mt-5 grid grid-cols-[repeat(28,minmax(0,1fr))] gap-[2px]">{days.map((day) => { const done = completed[`${habit.id}:${dateKey(day)}`]; return <button type="button" key={dateKey(day)} onClick={() => toggle(habit.id, day)} title={dateKey(day)} className="aspect-square w-full rounded-[3px] transition hover:scale-125" style={{ backgroundColor: done ? habit.color : '#e8eee9' }} />; })}</div></>}
            {view === 'grid' && gridView === 'month' && <div className="mt-3"><div className="grid grid-cols-7 gap-0.5 text-center text-[8px] font-black uppercase text-slate-400">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((label, index) => <span key={`${label}-${index}`}>{label}</span>)}</div><div className="mt-1.5 grid grid-cols-7 gap-0.5">{monthDays.map((day, index) => day ? <button type="button" key={dateKey(day)} onClick={() => toggle(habit.id, day)} title={dateKey(day)} className="aspect-square w-full rounded-[3px] transition hover:scale-110" style={{ backgroundColor: completed[`${habit.id}:${dateKey(day)}`] ? habit.color : '#e2e8f0' }}><span className="sr-only">{dateKey(day)}</span></button> : <span key={`empty-${index}`} className="aspect-square" />)}</div><div className="mt-2 flex items-center justify-between text-[8px] font-semibold text-slate-400"><span>{monthCompleted} completed</span><span>{monthCursor.toLocaleDateString('en-US', { month: 'short' })}</span></div></div>}
          </div>;
        })}
      </div>
    </div>
  );
};

export default HabitPage;
