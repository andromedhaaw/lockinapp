import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CalendarDays, Check, ChevronLeft, ChevronRight, GripHorizontal, RotateCcw, X } from 'lucide-react';

const START_HOUR = 6;
const END_HOUR = 22;
const HOUR_HEIGHT = 64;
const SNAP = 15;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const snap = (value) => Math.round(value / SNAP) * SNAP;
const clock = (hourValue) => { const total = Math.round(hourValue * 60); const hour = Math.floor(total / 60); const minute = total % 60; return `${hour % 12 || 12}:${String(minute).padStart(2, '0')}${hour >= 12 ? 'pm' : 'am'}`; };
const range = (startHour, durationHours) => `${clock(startHour)} – ${clock(startHour + durationHours)}`;
const TAG_COLOR = { 'Deep Work': 'indigo', Admin: 'orange', Personal: 'green' };
const PALETTE = {
  lavender: { border: '#6366f1' },
  indigo: { border: '#4f46e5' },
  sky: { border: '#0284c7' },
  orange: { border: '#f59e0b' },
  green: { border: '#10b981' },
  purple: { border: '#8b5cf6' },
};

const DayTimebox = ({ events, setEvents, onToggle }) => {
  const scrollRef = useRef(null);
  const resizeValue = useRef(null);
  const [draggingId, setDraggingId] = useState(null);
  const [dropMinute, setDropMinute] = useState(null);
  const [resizing, setResizing] = useState(null);
  const [notice, setNotice] = useState('');
  const [undoState, setUndoState] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState(null);
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, index) => START_HOUR + index);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = Math.max(0, (new Date().getHours() - START_HOUR) * HOUR_HEIGHT - 80); }, []);
  useEffect(() => {
    if (!resizing) return undefined;
    const move = (event) => { const delta = snap(((event.clientY - resizing.startY) / HOUR_HEIGHT) * 60) / 60; const durationHours = clamp(resizing.initialDuration + delta, .25, 6); resizeValue.current = durationHours; setResizing((value) => ({ ...value, preview: durationHours })); };
    const up = () => { const durationHours = resizeValue.current || resizing.initialDuration; setEvents((current) => current.map((item) => item.id === resizing.id ? { ...item, durationHours, timeRange: range(item.startHour, durationHours) } : item)); setResizing(null); resizeValue.current = null; setNotice('Duration updated'); };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up, { once: true });
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  }, [resizing, setEvents]);
  useEffect(() => { if (!notice) return undefined; const timer = window.setTimeout(() => setNotice(''), 1600); return () => window.clearTimeout(timer); }, [notice]);
  const undo = () => { if (!undoState) return; const current = events; setEvents(undoState); setUndoState(current); setNotice('Change undone'); };
  const unschedule = (id) => { if (!id) return; setUndoState(events); setEvents((current) => current.filter((item) => item.id !== id)); setSelectedId(null); setNotice('Moved to unscheduled'); };
  useEffect(() => {
    const keydown = (event) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); undo(); return; }
      if (!selectedId) return;
      if (event.key === 'Delete' || event.key === 'Backspace') { event.preventDefault(); unschedule(selectedId); return; }
      if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return;
      event.preventDefault(); const delta = event.key === 'ArrowUp' ? -.25 : .25; setUndoState(events); setEvents((current) => current.map((item) => item.id !== selectedId ? item : { ...item, startHour: clamp(item.startHour + delta, START_HOUR, END_HOUR - item.durationHours), timeRange: range(clamp(item.startHour + delta, START_HOUR, END_HOUR - item.durationHours), item.durationHours) })); setNotice('Moved 15 minutes');
    };
    window.addEventListener('keydown', keydown); return () => window.removeEventListener('keydown', keydown);
  }, [selectedId, events, undoState]);

  const minuteAt = (event) => { const rect = event.currentTarget.getBoundingClientRect(); return clamp(snap(START_HOUR * 60 + ((event.clientY - rect.top) / HOUR_HEIGHT) * 60), START_HOUR * 60, END_HOUR * 60 - 15); };
  const onDragOver = (event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; setDropMinute(minuteAt(event)); };
  const onDrop = (event) => {
    event.preventDefault();
    const startMinutes = minuteAt(event); const startHour = startMinutes / 60;
    let payload = null; try { payload = JSON.parse(event.dataTransfer.getData('application/lockin-task')); } catch {}
    if (payload?.type === 'timebox') {
      setUndoState(events);
      setEvents((current) => current.map((item) => item.id === payload.id ? { ...item, startHour, timeRange: range(startHour, item.durationHours) } : item));
      setNotice(`Moved to ${clock(startHour)}`);
    } else if (payload?.task) {
      setUndoState(events);
      const task = payload.task; const durationHours = Math.max(.25, Number(task.minutes || 30) / 60);
      setEvents((current) => { const existing = current.find((item) => item.taskId === task.id || item.title === task.title); const nextEvent = { id: existing?.id || `tb-${Date.now()}`, taskId: task.id, title: task.title, startHour, durationHours, timeRange: range(startHour, durationHours), colorStyle: TAG_COLOR[task.tag] || 'indigo', completed: Boolean(task.completed), hasCheckbox: true }; return existing ? current.map((item) => item.id === existing.id ? nextEvent : item) : [...current, nextEvent]; });
      setNotice(`Scheduled at ${clock(startHour)}`);
    }
    setDraggingId(null); setDropMinute(null);
  };
  const createBlock = (event) => { event.preventDefault(); if (!draft?.title.trim()) return; const item = { id: `tb-${Date.now()}`, title: draft.title.trim(), startHour: draft.startMinute / 60, durationHours: .5, timeRange: range(draft.startMinute / 60, .5), colorStyle: 'indigo', hasCheckbox: true, completed: false }; setUndoState(events); setEvents((current) => [...current, item]); setSelectedId(item.id); setDraft(null); setNotice('Focus block created'); };
  const conflict = (eventItem) => events.some((other) => other.id !== eventItem.id && eventItem.startHour < other.startHour + other.durationHours && eventItem.startHour + eventItem.durationHours > other.startHour);
  const now = new Date(); const nowTop = ((now.getHours() + now.getMinutes() / 60) - START_HOUR) * HOUR_HEIGHT;

  return <aside className="flex h-[calc(100vh-3.5rem)] w-72 shrink-0 flex-col overflow-hidden border-l border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
    <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 px-3 dark:border-slate-800"><div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-indigo-500" /><div><p className="text-sm font-black text-slate-800 dark:text-white">Today</p><p className="text-[9px] font-semibold text-slate-400">Click space · drag · resize</p></div></div><div className="flex items-center gap-1"><button type="button" onClick={undo} disabled={!undoState} title="Undo" className="rounded p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-30"><RotateCcw className="h-3.5 w-3.5" /></button><button type="button" className="rounded p-1 text-slate-400 hover:bg-slate-100"><ChevronLeft className="h-3.5 w-3.5" /></button><span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-black text-white">{new Date().getDate()}</span><button type="button" className="rounded p-1 text-slate-400 hover:bg-slate-100"><ChevronRight className="h-3.5 w-3.5" /></button></div></div>
    <div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); let payload; try { payload = JSON.parse(event.dataTransfer.getData('application/lockin-task')); } catch {} if (payload?.type === 'timebox') unschedule(payload.id); }} className={`border-b border-dashed px-3 py-2 text-center text-[9px] font-black uppercase tracking-wider transition ${draggingId ? 'border-indigo-300 bg-indigo-50 text-indigo-600' : 'border-slate-200 bg-slate-50 text-slate-400'}`}>Unscheduled · drop event here</div>
    <div className="flex border-b border-slate-100 px-1 py-2 dark:border-slate-800">{['M','T','W','T','F','S','S'].map((day, index) => { const today = (new Date().getDay() + 6) % 7; const number = new Date(Date.now() - (today - index) * 86400000).getDate(); return <div key={`${day}-${index}`} className="flex flex-1 flex-col items-center"><span className={`text-[8px] font-black ${index === today ? 'text-indigo-500' : 'text-slate-300'}`}>{day}</span><span className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black ${index === today ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>{number}</span></div>; })}</div>
    {notice && <div className="border-b border-emerald-100 bg-emerald-50 px-3 py-2 text-center text-[10px] font-black text-emerald-700">{notice}</div>}
    <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto scroll-smooth">
      <div onDragOver={onDragOver} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDropMinute(null); }} onDrop={onDrop} onClick={(event) => { if (draggingId || resizing || event.target.closest('[data-timebox-event]') || event.target.closest('[data-timebox-create]')) return; const startMinute = minuteAt(event); setDraft({ startMinute, title: '' }); }} className="relative" style={{ height: (END_HOUR - START_HOUR) * HOUR_HEIGHT }}>
        {hours.map((hour) => <div key={hour} className="absolute inset-x-0 border-t border-slate-100 dark:border-slate-800" style={{ top: (hour - START_HOUR) * HOUR_HEIGHT }}><span className="absolute left-0 top-1 w-12 pr-2 text-right font-mono text-[9px] text-slate-300">{clock(hour).replace(':00', '')}</span><span className="absolute left-12 right-0 top-8 border-t border-dashed border-slate-100 dark:border-slate-800/60" /></div>)}
        {nowTop >= 0 && nowTop <= (END_HOUR - START_HOUR) * HOUR_HEIGHT && <div className="pointer-events-none absolute left-11 right-1 z-30 border-t border-rose-500" style={{ top: nowTop }}><span className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-rose-500" /></div>}
        {dropMinute !== null && <div className="pointer-events-none absolute left-12 right-2 z-40 rounded-lg border-2 border-dashed border-indigo-500 bg-indigo-50/50" style={{ top: ((dropMinute / 60) - START_HOUR) * HOUR_HEIGHT, height: HOUR_HEIGHT / 2 }}><span className="absolute -top-5 left-0 rounded bg-indigo-600 px-2 py-0.5 text-[8px] font-black text-white">{clock(dropMinute / 60)}</span></div>}
        {draft && <form data-timebox-create onSubmit={createBlock} className="absolute left-12 right-2 z-50 rounded-xl border border-slate-200 bg-white p-2.5 shadow-xl dark:border-slate-700 dark:bg-slate-800" style={{ top: ((draft.startMinute / 60) - START_HOUR) * HOUR_HEIGHT }}><div className="flex items-center justify-between"><span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400">{clock(draft.startMinute / 60)}</span><button type="button" onClick={() => setDraft(null)}><X className="h-3.5 w-3.5 text-slate-400" /></button></div><input autoFocus value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} onKeyDown={(event) => { if (event.key === 'Escape') setDraft(null); }} placeholder="New focus block" className="mt-1 w-full bg-transparent text-xs font-bold outline-none text-slate-800 dark:text-white" /><p className="mt-1 text-[8px] text-slate-400">Enter · 30 minutes</p></form>}
        <div className="absolute inset-y-0 left-12 right-1">{events.map((item) => { const preview = resizing?.id === item.id ? resizing.preview : item.durationHours; const style = PALETTE[item.colorStyle] || PALETTE.indigo; const isConflict = conflict(item); return <article data-timebox-event key={item.id} tabIndex={0} draggable={!resizing} onClick={(event) => { event.stopPropagation(); setSelectedId(item.id); }} onDragStart={(event) => { setDraggingId(item.id); setSelectedId(item.id); event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('application/lockin-task', JSON.stringify({ type: 'timebox', id: item.id })); }} onDragEnd={() => { setDraggingId(null); setDropMinute(null); }} className={`group absolute left-1 right-1 z-10 overflow-hidden rounded-lg border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800 border-l-[3.5px] px-2.5 py-1.5 shadow-xs transition-all hover:z-20 hover:shadow-md hover:border-slate-300 ${draggingId === item.id ? 'opacity-40' : ''} ${selectedId === item.id ? 'ring-2 ring-indigo-500/20 border-indigo-400' : ''}`} style={{ top: (item.startHour - START_HOUR) * HOUR_HEIGHT, height: Math.max(28, preview * HOUR_HEIGHT - 3), borderLeftColor: style.border }}><div className="flex items-start gap-1.5">{item.hasCheckbox && <button type="button" onClick={(event) => { event.stopPropagation(); onToggle(item.id); }} className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border transition-colors ${item.completed ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 bg-white dark:bg-slate-800'}`}>{item.completed && <Check className="h-2.5 w-2.5 text-white stroke-[3]" />}</button>}<div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-1"><p className={`truncate text-[11px] font-semibold leading-tight text-slate-800 dark:text-slate-100 ${item.completed ? 'line-through opacity-50' : ''}`}>{item.title || 'Focus block'}</p>{isConflict && <AlertTriangle className="h-3 w-3 shrink-0 text-amber-500" />}</div><p className="mt-0.5 font-mono text-[9px] font-medium text-slate-400 dark:text-slate-500">{range(item.startHour, preview)}</p></div></div><button type="button" aria-label={`Resize ${item.title}`} onPointerDown={(event) => { event.preventDefault(); event.stopPropagation(); setUndoState(events); setResizing({ id: item.id, startY: event.clientY, initialDuration: item.durationHours, preview: item.durationHours }); }} className="absolute inset-x-0 bottom-0 flex h-3 cursor-ns-resize items-end justify-center opacity-0 group-hover:opacity-100"><GripHorizontal className="h-3 w-3 opacity-40 text-slate-400" /></button></article>; })}</div>
      </div>
    </div>
    <div className="border-t border-slate-100 px-3 py-2 text-center text-[9px] font-semibold text-slate-400 dark:border-slate-800">Drag to move · Pull bottom edge to resize</div>
  </aside>;
};

export default DayTimebox;
