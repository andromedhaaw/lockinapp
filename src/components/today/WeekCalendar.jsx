import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Clock3, GripHorizontal } from 'lucide-react';

const START_HOUR = 7;
const END_HOUR = 22;
const HOUR_HEIGHT = 72;
const SNAP_MINUTES = 15;
const GRID_HEIGHT = (END_HOUR - START_HOUR) * HOUR_HEIGHT;
const COLORS = {
  'Deep Work': 'border-indigo-500 bg-indigo-50 text-indigo-950',
  Admin: 'border-orange-400 bg-orange-50 text-orange-950',
  Personal: 'border-emerald-500 bg-emerald-50 text-emerald-950',
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const snap = (minutes) => Math.round(minutes / SNAP_MINUTES) * SNAP_MINUTES;
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
  const safe = clamp(minutes, 0, 1439);
  const hour = Math.floor(safe / 60);
  const minute = safe % 60;
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, '0')}${hour >= 12 ? 'pm' : 'am'}`;
};
const formatDuration = (minutes) => `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}`;

const WeekCalendar = ({ days, setDays, matchesFilter, onSelect }) => {
  const scrollRef = useRef(null);
  const resizeRef = useRef(null);
  const [dragging, setDragging] = useState(null);
  const [resizing, setResizing] = useState(null);
  const [notice, setNotice] = useState('');
  const hours = useMemo(() => Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, index) => START_HOUR + index), []);

  useEffect(() => {
    const now = new Date();
    const target = now.getHours() >= START_HOUR && now.getHours() < END_HOUR ? (now.getHours() - START_HOUR) * HOUR_HEIGHT - 90 : HOUR_HEIGHT;
    if (scrollRef.current) scrollRef.current.scrollTop = Math.max(0, target);
  }, []);

  useEffect(() => {
    if (!resizing) return undefined;
    const move = (event) => {
      const deltaMinutes = snap(((event.clientY - resizing.startY) / HOUR_HEIGHT) * 60);
      const minutes = clamp(resizing.startMinutes + deltaMinutes, 15, 360);
      resizeRef.current = minutes;
      setResizing((current) => ({ ...current, previewMinutes: minutes }));
    };
    const up = () => {
      const minutes = resizeRef.current || resizing.startMinutes;
      setDays((current) => current.map((day) => day.id !== resizing.dayId ? day : ({ ...day, tasks: day.tasks.map((task) => task.id !== resizing.taskId ? task : { ...task, minutes, duration: formatDuration(minutes) }) })));
      setNotice(`Duration changed to ${formatDuration(minutes)}`);
      setResizing(null);
      resizeRef.current = null;
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up, { once: true });
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  }, [resizing, setDays]);

  useEffect(() => { if (!notice) return undefined; const timer = window.setTimeout(() => setNotice(''), 1800); return () => window.clearTimeout(timer); }, [notice]);

  const moveTask = (targetDayId, event) => {
    event.preventDefault();
    if (!dragging) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const minute = clamp(snap(START_HOUR * 60 + ((event.clientY - rect.top) / HOUR_HEIGHT) * 60), START_HOUR * 60, END_HOUR * 60 - 15);
    setDays((current) => {
      let moved;
      const removed = current.map((day) => ({ ...day, tasks: day.tasks.filter((task) => { if (day.id === dragging.dayId && task.id === dragging.taskId) { moved = task; return false; } return true; }) }));
      if (!moved) return current;
      return removed.map((day) => day.id === targetDayId ? { ...day, tasks: [...day.tasks, { ...moved, time: formatTime(minute) }] } : day);
    });
    setNotice(`Moved to ${formatTime(minute)}`);
    setDragging(null);
  };

  const overlaps = (task, tasks) => {
    const start = parseTime(task.time);
    if (start === null) return false;
    const end = start + (task.minutes || 30);
    return tasks.some((other) => { if (other.id === task.id) return false; const otherStart = parseTime(other.time); return otherStart !== null && start < otherStart + (other.minutes || 30) && end > otherStart; });
  };

  return <section className="flex h-[calc(100vh-3.5rem)] min-w-0 flex-1 flex-col bg-[#f7f8fa] dark:bg-slate-950">
    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3 dark:border-slate-800 dark:bg-slate-900"><div><p className="text-sm font-black text-slate-900 dark:text-white">Week calendar</p><p className="text-[11px] font-semibold text-slate-400">Drag to reschedule · pull the bottom edge to resize · 15 minute snap</p></div><div className="flex items-center gap-2"><span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-black text-slate-500 dark:bg-slate-800">GMT+7</span>{notice && <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-[10px] font-black text-emerald-700">{notice}</span>}</div></div>
    <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto scroll-smooth">
      <div className="min-w-[900px] bg-white dark:bg-slate-900">
        <div className="sticky top-0 z-30 grid grid-cols-[64px_repeat(5,minmax(160px,1fr))] border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/95"><div className="flex items-center justify-center text-[10px] font-bold uppercase tracking-wider text-slate-400">Time</div>{days.slice(0, 5).map((day) => <div key={day.id} className={`border-l border-slate-200 px-4 py-3 dark:border-slate-800 ${day.isToday ? 'bg-indigo-50/70 dark:bg-indigo-950/20' : ''}`}><div className="flex items-center justify-between"><div><p className={`text-xs font-black ${day.isToday ? 'text-indigo-600' : 'text-slate-800 dark:text-white'}`}>{day.dayName}</p><p className="text-[10px] font-semibold text-slate-400">{day.dateLabel}</p></div>{day.isToday && <span className="rounded-full bg-indigo-600 px-2 py-1 text-[8px] font-black uppercase text-white">Today</span>}</div></div>)}</div>
        <div className="grid grid-cols-[64px_repeat(5,minmax(160px,1fr))]">
          <div className="relative border-r border-slate-200 dark:border-slate-800" style={{ height: GRID_HEIGHT }}>{hours.map((hour) => <div key={hour} className="absolute right-2 -translate-y-1/2 text-[10px] font-semibold text-slate-400" style={{ top: (hour - START_HOUR) * HOUR_HEIGHT }}>{String(hour).padStart(2, '0')}:00</div>)}</div>
          {days.slice(0, 5).map((day) => { const timedTasks = day.tasks.filter((task) => parseTime(task.time) !== null && matchesFilter(task)); const unscheduled = day.tasks.filter((task) => parseTime(task.time) === null && matchesFilter(task)); const now = new Date(); const nowTop = ((now.getHours() * 60 + now.getMinutes() - START_HOUR * 60) / 60) * HOUR_HEIGHT; return <div key={day.id} onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }} onDrop={(event) => moveTask(day.id, event)} className={`relative border-r border-slate-200 dark:border-slate-800 ${day.isToday ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''}`} style={{ height: GRID_HEIGHT }}>
            {hours.map((hour) => <div key={hour} className="absolute inset-x-0 border-t border-slate-100 dark:border-slate-800" style={{ top: (hour - START_HOUR) * HOUR_HEIGHT }}><span className="absolute inset-x-0 top-[18px] border-t border-dashed border-slate-100 dark:border-slate-800/60" /><span className="absolute inset-x-0 top-[36px] border-t border-slate-100 dark:border-slate-800/60" /><span className="absolute inset-x-0 top-[54px] border-t border-dashed border-slate-100 dark:border-slate-800/60" /></div>)}
            {day.isToday && nowTop >= 0 && nowTop <= GRID_HEIGHT && <div className="pointer-events-none absolute inset-x-0 z-20 border-t-2 border-red-500" style={{ top: nowTop }}><span className="absolute -left-1 -top-1.5 h-3 w-3 rounded-full bg-red-500" /></div>}
            {unscheduled.length > 0 && <div className="absolute left-2 right-2 top-2 z-10 rounded-xl border border-dashed border-slate-300 bg-white/90 p-2 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/90"><p className="text-[8px] font-black uppercase tracking-wider text-slate-400">{unscheduled.length} unscheduled</p><p className="truncate text-[10px] font-bold text-slate-600 dark:text-slate-300">{unscheduled.map((task) => task.title).join(' · ')}</p></div>}
            {timedTasks.map((task) => { const start = parseTime(task.time); const previewMinutes = resizing?.taskId === task.id ? resizing.previewMinutes : task.minutes || 30; const top = ((start - START_HOUR * 60) / 60) * HOUR_HEIGHT; const height = Math.max(28, (previewMinutes / 60) * HOUR_HEIGHT); const conflict = overlaps(task, timedTasks); return <article key={task.id} draggable={!resizing} onDragStart={(event) => { setDragging({ dayId: day.id, taskId: task.id }); event.dataTransfer.effectAllowed = 'move'; }} onDragEnd={() => setDragging(null)} onClick={() => onSelect(task.id)} className={`group absolute left-1.5 right-1.5 z-10 overflow-hidden rounded-lg border-l-4 px-2 py-1.5 text-left shadow-sm transition hover:z-20 hover:shadow-lg ${COLORS[task.tag] || 'border-sky-500 bg-sky-50 text-sky-950'} ${dragging?.taskId === task.id ? 'scale-[.98] opacity-45' : ''}`} style={{ top, height }}><div className="flex items-start justify-between gap-1"><div className="min-w-0"><p className="text-[9px] font-black opacity-70">{formatTime(start)} · {formatDuration(previewMinutes)}</p><p className="truncate text-[11px] font-black leading-tight">{task.title}</p>{height > 52 && <p className="mt-1 truncate text-[9px] font-semibold opacity-60">{task.tag}</p>}</div>{conflict && <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-500" />}</div><button type="button" aria-label={`Resize ${task.title}`} onPointerDown={(event) => { event.preventDefault(); event.stopPropagation(); setResizing({ dayId: day.id, taskId: task.id, startY: event.clientY, startMinutes: task.minutes || 30, previewMinutes: task.minutes || 30 }); }} className="absolute inset-x-0 bottom-0 flex h-3 cursor-ns-resize items-end justify-center opacity-0 transition group-hover:opacity-100"><GripHorizontal className="h-3 w-3 opacity-60" /></button></article>; })}
          </div>; })}
        </div>
      </div>
    </div>
    <div className="flex items-center justify-between border-t border-slate-200 bg-white px-5 py-2 text-[10px] font-semibold text-slate-400 dark:border-slate-800 dark:bg-slate-900"><span className="flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />7:00am–10:00pm</span><span>Conflicts are marked automatically</span></div>
  </section>;
};

export default WeekCalendar;
