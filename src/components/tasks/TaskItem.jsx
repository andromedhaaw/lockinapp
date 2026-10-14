import { useEffect, useState } from 'react';
import { Check, Trash2, Clock, ChevronRight, ChevronDown, Pencil, CalendarClock } from 'lucide-react';

const formatEstimatedTime = (value) => {
  if (value === null || value === undefined || value === '') return '';
  const text = String(value).trim();
  return /^\d+(?:\.\d+)?$/.test(text) ? `${text} min` : text;
};

const TaskItem = ({ task, onToggle, onDelete, onFocus, onOpen, onEdit, zen = false }) => {
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState({});
  const [microtaskDraft, setMicrotaskDraft] = useState('');

  useEffect(() => {
    if (!editing) return;
    setDraft({
      name: task.name || '',
      urgency: task.urgency || 'Medium',
      deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '',
      microtasks: (task.microtasks || []).map((step) => ({ ...step })),
    });
  }, [editing, task]);

  const save = (event) => {
    event.preventDefault();
    if (!draft.name?.trim()) return;
    onEdit?.(task, {
      ...task,
      name: draft.name.trim(),
      urgency: draft.urgency,
      deadline: draft.deadline ? new Date(draft.deadline).toISOString() : null,
      microtasks: draft.microtasks || [],
    });
    setEditing(false);
  };

  const addMicrotask = () => {
    const title = microtaskDraft.trim();
    if (!title) return;
    setDraft((current) => ({ ...current, microtasks: [...(current.microtasks || []), { title, completed: false }] }));
    setMicrotaskDraft('');
  };

  const microtasks = task.microtasks || [];
  const completedMicrotasks = microtasks.filter((step) => step.completed || step.done).length;

  return (
    <div className={`group rounded-2xl border transition-all ${task.completed ? 'border-green-100 bg-green-50/70 dark:border-green-800 dark:bg-green-900/20' : 'border-slate-200 bg-white hover:border-green-200 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900'}`}>
      {editing ? (
        <form onSubmit={save} className="space-y-3 p-4" onClick={(event) => event.stopPropagation()}>
          <input autoFocus value={draft.name || ''} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium outline-none focus:border-green-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
          <div className="grid grid-cols-2 gap-2">
            <select value={draft.urgency || 'Medium'} onChange={(event) => setDraft((current) => ({ ...current, urgency: event.target.value }))} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"><option>High</option><option>Medium</option><option>Low</option></select>
            <input type="datetime-local" value={draft.deadline || ''} onChange={(event) => setDraft((current) => ({ ...current, deadline: event.target.value }))} className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-xs text-slate-500 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300" />
          </div>
          <div className="space-y-1.5">
            {(draft.microtasks || []).map((step, index) => <label key={`${step.title}-${index}`} className="flex items-center gap-2"><input type="checkbox" checked={!!(step.completed || step.done)} onChange={() => setDraft((current) => ({ ...current, microtasks: current.microtasks.map((item, itemIndex) => itemIndex === index ? { ...item, completed: !(item.completed || item.done) } : item) }))} className="accent-green-500" /><input value={step.title} onChange={(event) => setDraft((current) => ({ ...current, microtasks: current.microtasks.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item) }))} className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white" /></label>)}
            <div className="flex gap-2"><input value={microtaskDraft} onChange={(event) => setMicrotaskDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addMicrotask(); } }} placeholder="Add microtask" className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white" /><button type="button" onClick={addMicrotask} className="rounded-lg px-2 text-xs font-bold text-green-700 hover:bg-green-50">Add</button></div>
          </div>
          <div className="flex justify-end gap-2"><button type="button" onClick={() => setEditing(false)} className="rounded-lg px-3 py-1.5 text-xs font-bold text-slate-500">Cancel</button><button type="submit" className="rounded-lg bg-[#4dcd7d] px-3 py-1.5 text-xs font-black text-slate-950">Save</button></div>
        </form>
      ) : (
        <>
        <div className="flex items-center gap-3 p-3.5" onClick={() => { if (microtasks.length > 0) setExpanded((current) => !current); }}>
          <button onClick={(event) => { event.stopPropagation(); onToggle(task.id || task._id); }} className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border transition-colors ${task.completed ? 'border-green-500 bg-green-500 text-white' : 'border-slate-300 text-transparent hover:border-green-400 dark:border-slate-600'}`}><Check className="h-3.5 w-3.5" strokeWidth={3} /></button>
          <div className="min-w-0 flex-1">
            <div className={`truncate text-sm font-semibold ${task.completed ? 'text-green-800 line-through decoration-green-800/30 dark:text-green-400' : 'text-slate-800 dark:text-slate-100'}`}>{task.name}</div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
              {task.estimatedTime && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{formatEstimatedTime(task.estimatedTime)}</span>}
              {!zen && <><span className={`rounded-full px-2 py-0.5 font-semibold ${task.urgency === 'High' ? 'bg-red-50 text-red-600' : task.urgency === 'Low' ? 'bg-slate-100 text-slate-500' : 'bg-amber-50 text-amber-700'}`}>{task.urgency || 'Medium'}</span>
              {task.deadline && <span className="inline-flex items-center gap-1"><CalendarClock className="h-3 w-3" />{new Date(task.deadline).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>}
              {microtasks.length > 0 && <span>{completedMicrotasks}/{microtasks.length} steps</span>}</>}
            </div>
          </div>
          {microtasks.length > 0 && <button onClick={(event) => { event.stopPropagation(); setExpanded((current) => !current); }} className="flex flex-shrink-0 items-center gap-1 rounded-lg px-1.5 py-1 text-[10px] font-bold text-slate-400 hover:bg-slate-50 hover:text-green-600" aria-expanded={expanded}><span>{completedMicrotasks}/{microtasks.length}</span><ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} /></button>}
          <button onClick={(event) => { event.stopPropagation(); setEditing(true); }} className="rounded-lg p-1.5 text-slate-300 opacity-0 transition group-hover:opacity-100 hover:bg-slate-100 hover:text-green-600 dark:hover:bg-slate-800" title="Edit task"><Pencil className="h-3.5 w-3.5" /></button>
          {!task.completed && <button onClick={(event) => { event.stopPropagation(); onFocus && onFocus(task); }} className="flex flex-shrink-0 items-center gap-1 rounded-full bg-green-100 px-2.5 py-1.5 text-xs font-bold text-green-700 transition hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300"><span>Start</span><ChevronRight className="h-4 w-4" /></button>}
          <button onClick={(event) => { event.stopPropagation(); onDelete(task.id || task._id); }} className="rounded-lg p-1.5 text-slate-300 transition hover:text-red-500" title="Delete task"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
        {expanded && <ul className="space-y-1 border-t border-slate-100 px-12 pb-3 pt-2 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">{microtasks.map((step, index) => <li key={`${step.title}-${index}`} className={`flex items-center gap-2 ${step.completed || step.done ? 'text-slate-300 line-through' : ''}`}><input type="checkbox" checked={!!(step.completed || step.done)} onChange={(event) => { event.stopPropagation(); onEdit?.(task, { ...task, microtasks: microtasks.map((item, itemIndex) => itemIndex === index ? { ...item, completed: !(item.completed || item.done) } : item) }); }} onClick={(event) => event.stopPropagation()} className="h-3.5 w-3.5 rounded border-slate-300 accent-green-500" />{step.title}</li>)}</ul>}
        </>
      )}
    </div>
  );
};

export default TaskItem;
