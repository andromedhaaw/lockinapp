import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Clock3, GripHorizontal, RotateCcw, X } from 'lucide-react';

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
  const [undoState, setUndoState] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [draft, setDraft] = useState(null);
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
      setUndoState(days);
      setDays((current) => current.map((day) => day.id !== resizing.dayId ? day : ({ ...day, tasks: day.tasks.map((task) => task.id !== resizing.taskId ? task : { ...task, minutes, duration: formatDuration(minutes) }) })));
      setNotice(`Duration changed to ${formatDuration(minutes)}`);
      setResizing(null);
      resizeRef.current = null;
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up, { once: true });
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  }, [resizing, setDays, days]);

  useEffect(() => { if (!notice) return undefined; const timer = window.setTimeout(() => setNotice(''), 1800); return () => window.clearTimeout(timer); }, [notice]);

  const undo = () => { if (!undoState) return; const current = days; setDays(undoState); setUndoState(current); setNotice('Change undone'); };
  const unschedule = (dayId, taskId) => { setUndoState(days); setDays((current) => current.map((day) => day.id !== dayId ? day : ({ ...day, tasks: day.tasks.map((task) => task.id === taskId ? { ...task, time: undefined } : task) }))); setSelectedEvent(null); setNotice('Moved to unscheduled'); };

  useEffect(() => {
    const keydown = (event) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); undo(); return; }
      if (!selectedEvent) return;
      if (event.key === 'Delete' || event.key === 'Backspace') { event.preventDefault(); unschedule(selectedEvent.dayId, selectedEvent.taskId); return; }
      if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return;
      event.preventDefault();
      const delta = event.key === 'ArrowUp' ? -SNAP_MINUTES : SNAP_MINUTES;
      setUndoState(days);
      setDays((current) => current.map((day) => day.id !== selectedEvent.dayId ? day : ({ ...day, tasks: day.tasks.map((task) => task.id !== selectedEvent.taskId ? task : { ...task, time: formatTime(clamp((parseTime(task.time) || START_HOUR * 60) + delta, START_HOUR * 60, END_HOUR * 60 - 15)) }) })));
      setNotice(`Moved ${event.key === 'ArrowUp' ? 'earlier' : 'later'} by 15m`);
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [selectedEvent, days, undoState]);

  const moveTask = (targetDayId, event) => {
    event.preventDefault();
    if (!dragging) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const minute = clamp(snap(START_HOUR * 60 + ((event.clientY - rect.top) / HOUR_HEIGHT) * 60), START_HOUR * 60, END_HOUR * 60 - 15);
    setUndoState(days);
    setDays((current) => {
      let moved;
      const removed = current.map((day) => ({ ...day, tasks: day.tasks.filter((task) => { if (day.id === dragging.dayId && task.id === dragging.taskId) { moved = task; return false; } return true; }) }));
      if (!moved) return current;
      return removed.map((day) => day.id === targetDayId ? { ...day, tasks: [...day.tasks, { ...moved, time: formatTime(minute) }] } : day);
    });
    setNotice(`Moved to ${formatTime(minute)}`);
    setDragging(null);
  };

  const createTask = (event) => {
    event.preventDefault();
    if (!draft?.title?.trim()) return;
    const minutes = 30;
    const task = { id: `calendar-${Date.now()}`, title: draft.title.trim(), tag: 'Deep Work', tagColor: 'blue', time: formatTime(draft.startMinute), duration: formatDuration(minutes), minutes, completed: false, icons: [] };
    setUndoState(days);
    setDays((current) => current.map((day) => day.id === draft.dayId ? { ...day, tasks: [...day.tasks, task] } : day));
    setDraft(null); setSelectedEvent({ dayId: draft.dayId, taskId: task.id }); setNotice('Focus block created');
  };

  const overlaps = (task, tasks) => {
    const start = parseTime(task.time);
    if (start === null) return false;
    const end = start + (task.minutes || 30);
    return tasks.some((other) => { if (other.id === task.id) return false; const otherStart = parseTime(other.time); return otherStart !== null && start < otherStart + (other.minutes || 30) && end > otherStart; });
  };

  return <section className="flex h-[calc(100vh-3.5rem)] min-w-0 flex-1 flex-col bg-[#f7f8fa] dark:bg-slate-950">
    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3 dark:border-slate-800 dark:bg-slate-900"><div><p className="text-sm font-black text-slate-900 dark:text-white">Week calendar</p><p className="text-[11px] font-semibold text-slate-400">Click empty space to create · drag · resize · 15 minute snap</p></div><div className="flex items-center gap-2"><button type="button" onClick={undo} disabled={!undoState} title="Undo (Ctrl/⌘ Z)" className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-black text-slate-500 disabled:opacity-35 dark:bg-slate-800"><RotateCcw className="h-3 w-3" />Undo</button><span className="rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-black text-slate-500 dark:bg-slate-800">GMT+7</span>{notice && <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-[10px] font-black text-emerald-700">{notice}</span>}</div></div>
    <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto scroll-smooth">
      <div className="min-w-[900px] bg-white dark:bg-slate-900">
        <div className="sticky top-0 z-30 grid grid-cols-[64px_repeat(5,minmax(160px,1fr))] border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/95"><div className="flex items-center justify-center text-[10px] font-bold uppercase tracking-wider text-slate-400">Time</div>{days.slice(0, 5).map((day) => <div key={day.id} className={`border-l border-slate-200 px-4 py-3 dark:border-slate-800 ${day.isToday ? 'bg-indigo-50/70 dark:bg-indigo-950/20' : ''}`}><div className="flex items-center justify-between"><div><p className={`text-xs font-black ${day.isToday ? 'text-indigo-600' : 'text-slate-800 dark:text-white'}`}>{day.dayName}</p><p className="text-[10px] font-semibold text-slate-400">{day.dateLabel}</p></div>{day.isToday && <span className="rounded-full bg-indigo-600 px-2 py-1 text-[8px] font-black uppercase text-white">Today</span>}</div></div>)}</div>
        <div className="grid grid-cols-[64px_repeat(5,minmax(160px,1fr))]">
          <div className="relative border-r border-slate-200 dark:border-slate-800" style={{ height: GRID_HEIGHT }}>{hours.map((hour) => <div key={hour} className="absolute right-2 -translate-y-1/2 text-[10px] font-semibold text-slate-400" style={{ top: (hour - START_HOUR) * HOUR_HEIGHT }}>{String(hour).padStart(2, '0')}:00</div>)}</div>
          {days.slice(0, 5).map((day) => { const timedTasks = day.tasks.filter((task) => parseTime(task.time) !== null && matchesFilter(task)); const unscheduled = day.tasks.filter((task) => parseTime(task.time) === null && matchesFilter(task)); const now = new Date(); const nowTop = ((now.getHours() * 60 + now.getMinutes() - START_HOUR * 60) / 60) * HOUR_HEIGHT; return <div key={day.id} onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }} onDrop={(event) => moveTask(day.id, event)} onClick={(event) => { if (dragging || resizing || event.target.closest('[data-calendar-event]') || event.target.closest('[data-unscheduled]') || event.target.closest('[data-create-popover]')) return; const rect = event.currentTarget.getBoundingClientRect(); const startMinute = clamp(snap(START_HOUR * 60 + ((event.clientY - rect.top) / HOUR_HEIGHT) * 60), START_HOUR * 60, END_HOUR * 60 - 30); setDraft({ dayId: day.id, startMinute, title: '' }); }} className={`relative border-r border-slate-200 dark:border-slate-800 ${day.isToday ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''}`} style={{ height: GRID_HEIGHT }}>
            {hours.map((hour) => <div key={hour} className="absolute inset-x-0 border-t border-slate-100 dark:border-slate-800" style={{ top: (hour - START_HOUR) * HOUR_HEIGHT }}><span className="absolute inset-x-0 top-[18px] border-t border-dashed border-slate-100 dark:border-slate-800/60" /><span className="absolute inset-x-0 top-[36px] border-t border-slate-100 dark:border-slate-800/60" /><span className="absolute inset-x-0 top-[54px] border-t border-dashed border-slate-100 dark:border-slate-800/60" /></div>)}
            {day.isToday && nowTop >= 0 && nowTop <= GRID_HEIGHT && <div className="pointer-events-none absolute inset-x-0 z-20 border-t-2 border-red-500" style={{ top: nowTop }}><span className="absolute -left-1 -top-1.5 h-3 w-3 rounded-full bg-red-500" /></div>}
            <div data-unscheduled onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); event.stopPropagation(); if (dragging) unschedule(dragging.dayId, dragging.taskId); setDragging(null); }} className={`absolute left-2 right-2 top-2 z-20 rounded-xl border border-dashed p-2 shadow-sm backdrop-blur transition ${dragging ? 'border-indigo-400 bg-indigo-50' : 'border-slate-300 bg-white/90'} dark:border-slate-700 dark:bg-slate-900/90`}><p className="text-[8px] font-black uppercase tracking-wider text-slate-400">Unscheduled · drop here</p>{unscheduled.length > 0 && <p className="truncate text-[10px] font-bold text-slate-600 dark:text-slate-300">{unscheduled.map((task) => task.title).join(' · ')}</p>}</div>
            {draft?.dayId === day.id && <form data-create-popover onSubmit={createTask} className="absolute left-2 right-2 z-40 rounded-xl border border-slate-200 bg-white p-2 shadow-xl" style={{ top: ((draft.startMinute - START_HOUR * 60) / 60) * HOUR_HEIGHT }}><div className="flex items-center justify-between"><span className="text-[9px] font-black text-indigo-600">{formatTime(draft.startMinute)}</span><button type="button" onClick={() => setDraft(null)} className="text-slate-400"><X className="h-3.5 w-3.5" /></button></div><input autoFocus value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} onKeyDown={(event) => { if (event.key === 'Escape') setDraft(null); }} placeholder="New focus block" className="mt-1 w-full bg-transparent text-xs font-bold outline-none" /><p className="mt-1 text-[8px] text-slate-400">Enter to create · 30 minutes</p></form>}
            {timedTasks.map((task) => { const start = parseTime(task.time); const previewMinutes = resizing?.taskId === task.id ? resizing.previewMinutes : task.minutes || 30; const top = ((start - START_HOUR * 60) / 60) * HOUR_HEIGHT; const height = Math.max(28, (previewMinutes / 60) * HOUR_HEIGHT); const conflict = overlaps(task, timedTasks); const isSelected = selectedEvent?.taskId === task.id; return <article data-calendar-event key={task.id} tabIndex={0} draggable={!resizing} onDragStart={(event) => { setDragging({ dayId: day.id, taskId: task.id }); event.dataTransfer.effectAllowed = 'move'; }} onDragEnd={() => setDragging(null)} onClick={(event) => { event.stopPropagation(); setSelectedEvent({ dayId: day.id, taskId: task.id }); onSelect(task.id); }} className={`group absolute left-1.5 right-1.5 z-10 overflow-hidden rounded-lg border-l-4 px-2 py-1.5 text-left shadow-sm transition hover:z-20 hover:shadow-lg ${COLORS[task.tag] || 'border-sky-500 bg-sky-50 text-sky-950'} ${dragging?.taskId === task.id ? 'scale-[.98] opacity-45' : ''} ${isSelected ? 'ring-2 ring-slate-900/20' : ''}`} style={{ top, height }}><div className="flex items-start justify-between gap-1"><div className="min-w-0"><p className="text-[9px] font-black opacity-70">{formatTime(start)} · {formatDuration(previewMinutes)}</p><p className="truncate text-[11px] font-black leading-tight">{task.title}</p>{height > 52 && <p className="mt-1 truncate text-[9px] font-semibold opacity-60">{task.tag}</p>}</div>{conflict && <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-500" />}</div><button type="button" aria-label={`Resize ${task.title}`} onPointerDown={(event) => { event.preventDefault(); event.stopPropagation(); setUndoState(days); setResizing({ dayId: day.id, taskId: task.id, startY: event.clientY, startMinutes: task.minutes || 30, previewMinutes: task.minutes || 30 }); }} className="absolute inset-x-0 bottom-0 flex h-3 cursor-ns-resize items-end justify-center opacity-0 transition group-hover:opacity-100"><GripHorizontal className="h-3 w-3 opacity-60" /></button></article>; })}
          </div>; })}
        </div>
      </div>
    </div>
    <div className="flex items-center justify-between border-t border-slate-200 bg-white px-5 py-2 text-[10px] font-semibold text-slate-400 dark:border-slate-800 dark:bg-slate-900"><span className="flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />7:00am–10:00pm</span><span>Conflicts are marked automatically</span></div>
  </section>;
};

export default WeekCalendar;
