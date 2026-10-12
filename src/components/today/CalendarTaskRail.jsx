import { useState } from 'react';
import { CalendarDays, Check, Clock3, Play, Plus } from 'lucide-react';

const CalendarTaskRail = ({ day, matchesFilter, onToggle, onSelect, onStartFocus, onAddTask }) => {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [minutes, setMinutes] = useState(30);
  const tasks = day.tasks.filter(matchesFilter);

  const submit = (event) => {
    event.preventDefault();
    if (!title.trim()) return;
    onAddTask(title.trim(), Number(minutes) || 30);
    setTitle('');
    setMinutes(30);
    setAdding(false);
  };

  return <aside className="flex h-[calc(100vh-3.5rem)] w-72 shrink-0 flex-col border-l border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
    <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 px-4 dark:border-slate-800"><div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-amber-500" /><span className="text-sm font-black text-slate-800 dark:text-white">Tasks</span></div><span className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-black text-slate-600 dark:border-slate-700 dark:text-slate-300">Today</span></div>
    <div className="border-b border-slate-100 px-4 py-4 dark:border-slate-800"><div className="flex items-end gap-1"><span className="text-2xl font-black text-slate-900 dark:text-white">{day.dayName}</span><span className="text-sm font-bold text-slate-400">{day.dateLabel}</span></div><p className="mt-1 text-[10px] font-semibold text-slate-400">{tasks.filter((task) => !task.completed).length} tasks left · drag a task to schedule it</p></div>
    <div className="p-3">{adding ? <form onSubmit={submit} className="rounded-xl border border-indigo-200 bg-indigo-50 p-2"><div className="flex items-center gap-2"><Plus className="h-4 w-4 shrink-0 text-indigo-500" /><input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} onKeyDown={(event) => { if (event.key === 'Escape') { setAdding(false); setTitle(''); } }} placeholder="What needs doing?" className="min-w-0 flex-1 bg-transparent text-xs font-bold outline-none" /><button type="submit" className="rounded-lg bg-indigo-600 px-2 py-1 text-[10px] font-black text-white">Add</button></div><label className="mt-2 flex items-center gap-2 pl-6 text-[10px] font-bold text-slate-500">Estimate <input type="number" min="5" step="5" value={minutes} onChange={(event) => setMinutes(event.target.value)} className="w-16 rounded-md border border-indigo-200 bg-white px-2 py-1 text-xs font-black text-slate-700 outline-none" /><span>minutes</span></label></form> : <button type="button" onClick={() => setAdding(true)} className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-left text-xs font-bold text-slate-500 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800"><Plus className="h-4 w-4" />Add a task</button>}</div>
    <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 pb-5">{tasks.map((task) => <article key={task.id} draggable onDragStart={(event) => { event.dataTransfer.effectAllowed = 'copy'; event.dataTransfer.setData('application/lockin-task', JSON.stringify({ type: 'task', task })); }} onClick={() => onSelect(task.id)} className={`group cursor-grab rounded-2xl border bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing dark:bg-slate-800 ${task.completed ? 'border-slate-100 opacity-60 dark:border-slate-700' : 'border-slate-200 dark:border-slate-700'}`}><div className="flex items-start gap-2"><button type="button" onClick={(event) => { event.stopPropagation(); onToggle(day.id, task.id); }} className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${task.completed ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-300 text-transparent'}`}><Check className="h-3 w-3 stroke-[3]" /></button><div className="min-w-0 flex-1"><p className={`text-sm font-black leading-snug text-slate-800 dark:text-slate-100 ${task.completed ? 'line-through' : ''}`}>{task.title}</p><div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-slate-400"><span className="flex items-center gap-1"><Clock3 className="h-3 w-3" />{task.time || 'Unscheduled'}</span><span>·</span><span>{task.duration || `${task.minutes || 30}m`}</span></div></div><button type="button" onClick={(event) => { event.stopPropagation(); onStartFocus?.(task); }} title="Start focus" className="rounded-lg p-1.5 text-slate-300 opacity-0 transition hover:bg-indigo-50 hover:text-indigo-600 group-hover:opacity-100"><Play className="h-3.5 w-3.5 fill-current" /></button></div></article>)}{tasks.length === 0 && <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center dark:border-slate-700"><CalendarDays className="mx-auto h-6 w-6 text-slate-300" /><p className="mt-2 text-xs font-bold text-slate-400">No tasks for this day.</p></div>}</div>
  </aside>;
};

export default CalendarTaskRail;
