import { useMemo, useState } from 'react';
import { Check, Clock3, Play, Plus } from 'lucide-react';
import TodayIntelligence from './TodayIntelligence';

const START_HOUR = 7;
const END_HOUR = 22;
const HOUR_HEIGHT = 64;
const GRID_HEIGHT = (END_HOUR - START_HOUR) * HOUR_HEIGHT;

const TAG_COLORS = {
  Personal: { fill: '#dff7e8', ink: '#16794b', edge: '#31b875' },
  Admin: { fill: '#fff0d8', ink: '#a35f00', edge: '#f1a338' },
  'Deep Work': { fill: '#e8e4ff', ink: '#5b4eb2', edge: '#7765dc' },
  Work: { fill: '#dcecff', ink: '#2565a9', edge: '#4d91e8' },
  Study: { fill: '#f9e1f0', ink: '#a53f74', edge: '#df74aa' },
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const parseTime = (value) => {
  if (!value) return null;
  const match = String(value).trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2] || 0);
  const meridiem = match[3]?.toLowerCase();
  if (meridiem === 'pm' && hour < 12) hour += 12;
  if (meridiem === 'am' && hour === 12) hour = 0;
  return hour * 60 + minute;
};
const formatTime = (minutes) => {
  const hour = Math.floor(minutes / 60);
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minutes % 60).padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
};
const formatDuration = (minutes) => {
  const safe = Number(minutes || 30);
  return safe >= 60 ? `${Math.floor(safe / 60)}h${safe % 60 ? ` ${safe % 60}m` : ''}` : `${safe}m`;
};

const CalendarTaskRail = ({ day, matchesFilter, onToggle, onSelect, onStartFocus, onAddTask }) => {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [minutes, setMinutes] = useState(30);
  const tasks = day.tasks.filter(matchesFilter);
  const scheduledTasks = useMemo(() => tasks.filter((task) => parseTime(task.time) !== null), [tasks]);
  const unscheduledTasks = useMemo(() => tasks.filter((task) => parseTime(task.time) === null), [tasks]);
  const completedCount = tasks.filter((task) => task.completed).length;
  const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;
  const estimatedLabel = useMemo(() => {
    const total = tasks.reduce((sum, task) => sum + Number(task.minutes || 30), 0);
    return `${Math.floor(total / 60)}h ${total % 60}m planned`;
  }, [tasks]);

  const submit = (event) => {
    event.preventDefault();
    if (!title.trim()) return;
    onAddTask(title.trim(), Number(minutes) || 30);
    setTitle('');
    setMinutes(30);
    setAdding(false);
  };

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowTop = ((nowMinutes - START_HOUR * 60) / 60) * HOUR_HEIGHT;

  return (
    <aside className="flex h-[calc(100vh-3.5rem)] w-[340px] shrink-0 flex-col border-l border-[#e5e8e4] bg-[#fbfcfa] dark:border-slate-800 dark:bg-slate-900">
      <header className="shrink-0 border-b border-[#e9ede8] bg-white px-5 pb-4 pt-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#748078]">Day plan</p>
            <h2 className="mt-1 text-[20px] font-extrabold tracking-[-.035em] text-[#17211b] dark:text-white">{day.isToday ? 'Today' : day.dayName}</h2>
            <p className="mt-0.5 text-[11px] font-medium text-[#748078]">{day.isToday ? 'Make space for focused work' : day.dateLabel}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-sm font-extrabold text-[#17211b] dark:text-white">{completedCount}/{tasks.length}</p>
            <p className="text-[9px] font-bold uppercase tracking-[.08em] text-[#8a948d]">done</p>
          </div>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#eceeea] dark:bg-slate-800" aria-label={`${progress}% complete`}>
          <div className="h-full rounded-full bg-[#4dcd7d] transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <div className="shrink-0 border-b border-[#e9ede8] bg-white px-5 py-2.5 dark:border-slate-800 dark:bg-slate-900">
        {adding ? (
          <form onSubmit={submit} className="rounded-xl border border-[#d9ddd8] bg-[#fbfcfa] p-3 shadow-[0_3px_12px_rgba(23,33,27,.06)] dark:border-slate-700 dark:bg-slate-800">
            <input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} onKeyDown={(event) => { if (event.key === 'Escape') { setAdding(false); setTitle(''); } }} placeholder="Task name" className="w-full bg-transparent text-[13px] font-semibold text-[#17211b] outline-none placeholder:text-[#a4aaa6] dark:text-white" />
            <div className="mt-3 flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-[10px] font-semibold text-[#748078]">Estimate <input type="number" min="5" step="5" value={minutes} onChange={(event) => setMinutes(event.target.value)} className="w-14 rounded-lg border border-[#e4e5e2] bg-white px-2 py-1.5 text-center font-mono text-[11px] font-bold text-[#17211b] outline-none focus:border-[#4dcd7d]" /> min</label>
              <div className="flex items-center gap-2"><button type="button" onClick={() => { setAdding(false); setTitle(''); }} className="px-2 py-1.5 text-[10px] font-bold text-[#748078]">Cancel</button><button type="submit" className="rounded-lg bg-[#17211b] px-3 py-1.5 text-[10px] font-bold text-white">Add</button></div>
            </div>
          </form>
        ) : (
          <button type="button" onClick={() => setAdding(true)} className="group flex w-full items-center justify-between py-1.5 text-left">
            <span className="flex items-center gap-2 text-[12px] font-semibold text-[#748078] transition-colors group-hover:text-[#17211b]"><Plus className="h-3.5 w-3.5" /> Add task</span>
            <span className="font-mono text-[9px] font-semibold uppercase tracking-[.08em] text-[#a4aaa6]">{estimatedLabel}</span>
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="relative mx-3 my-3 overflow-hidden rounded-xl border border-[#e6eae5] bg-white shadow-[0_2px_10px_rgba(23,33,27,.04)] dark:border-slate-800 dark:bg-slate-900">
          <div className="relative" style={{ height: GRID_HEIGHT }}>
            {Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, index) => {
              const hour = START_HOUR + index;
              return <div key={hour} className="absolute inset-x-0 border-t border-[#eef0ed] dark:border-slate-800" style={{ top: index * HOUR_HEIGHT }}><span className="absolute left-2 top-[-7px] w-10 text-[9px] font-semibold text-[#9aa29c]">{formatTime(hour * 60).replace(':00', '')}</span><span className="absolute left-[46px] right-0 top-1/2 border-t border-dashed border-[#f2f3f1] dark:border-slate-800" /></div>;
            })}
            {day.isToday && nowTop >= 0 && nowTop <= GRID_HEIGHT && <div className="pointer-events-none absolute left-0 right-0 z-30 border-t-2 border-[#ef5350]" style={{ top: nowTop }}><span className="absolute left-[39px] top-[-4px] h-1.5 w-1.5 rounded-full bg-[#ef5350]" /><span className="absolute left-[48px] top-[-8px] rounded bg-[#ef5350] px-1 py-0.5 font-mono text-[8px] font-bold text-white">now</span></div>}

            {scheduledTasks.map((task) => {
              const start = parseTime(task.time);
              const taskMinutes = Number(task.minutes || 30);
              const top = ((start - START_HOUR * 60) / 60) * HOUR_HEIGHT;
              const height = clamp((taskMinutes / 60) * HOUR_HEIGHT, 34, 150);
              const colors = TAG_COLORS[task.tag] || TAG_COLORS.Work;
              return <article key={task.id} draggable onDragStart={(event) => { event.dataTransfer.effectAllowed = 'copy'; event.dataTransfer.setData('application/lockin-task', JSON.stringify({ type: 'task', task })); }} onClick={() => onSelect(task.id)} className={`group absolute left-[51px] right-2 z-10 cursor-grab overflow-hidden rounded-lg border border-white/70 px-2.5 py-1.5 text-left shadow-[0_2px_5px_rgba(23,33,27,.08)] transition-all duration-200 hover:z-20 hover:-translate-y-0.5 hover:shadow-[0_6px_14px_rgba(23,33,27,.12)] active:cursor-grabbing ${task.completed ? 'opacity-55' : ''}`} style={{ top, height, background: colors.fill, borderLeft: `3px solid ${colors.edge}` }}>
                <div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="font-mono text-[8px] font-bold" style={{ color: colors.ink }}>{formatTime(start)} · {formatDuration(taskMinutes)}</p><p className={`mt-0.5 truncate text-[11px] font-extrabold leading-tight text-[#17211b] ${task.completed ? 'line-through' : ''}`}>{task.title}</p></div>{task.completed && <Check className="h-3.5 w-3.5 shrink-0 text-[#16794b]" strokeWidth={3} />}</div>
                {height > 52 && <div className="mt-1 flex items-center justify-between gap-2"><span className="truncate text-[8px] font-bold" style={{ color: colors.ink }}>{task.tag || 'Work'}</span><div className="flex items-center gap-1"><button type="button" onClick={(event) => { event.stopPropagation(); onToggle(day.id, task.id); }} className="flex h-5 w-5 items-center justify-center rounded-full bg-white/70 text-[#748078] opacity-0 transition group-hover:opacity-100" aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}><Check className="h-3 w-3" /></button><button type="button" onClick={(event) => { event.stopPropagation(); onStartFocus?.(task); }} title="Start focus" className="flex h-5 w-5 items-center justify-center rounded-full bg-white/70 text-[#748078] opacity-0 transition group-hover:opacity-100"><Play className="h-2.5 w-2.5 fill-current" /></button></div></div>}
              </article>;
            })}
          </div>
        </div>

        {unscheduledTasks.length > 0 && <section className="mx-3 mb-3 rounded-xl border border-dashed border-[#dfe4df] bg-[#f7f9f6] p-3 dark:border-slate-700 dark:bg-slate-800/50"><div className="mb-2 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[.12em] text-[#8a948d]"><Clock3 className="h-3 w-3" /> Later today</div><div className="space-y-1.5">{unscheduledTasks.map((task) => <button type="button" key={task.id} onClick={() => onSelect(task.id)} className="flex w-full items-center gap-2 rounded-lg bg-white px-2.5 py-2 text-left text-[10px] font-bold text-[#17211b] shadow-[0_1px_3px_rgba(23,33,27,.04)] dark:bg-slate-900 dark:text-white"><span className="h-2 w-2 rounded-full" style={{ background: (TAG_COLORS[task.tag] || TAG_COLORS.Work).edge }} /><span className="truncate">{task.title}</span></button>)}</div></section>}
        {day.isToday && <div className="px-4 pb-5 pt-2"><TodayIntelligence tasks={tasks} onStartFocus={onStartFocus} /></div>}
      </div>
    </aside>
  );
};

export default CalendarTaskRail;
