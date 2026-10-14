import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Check, Flag, Milestone, Plus, RotateCcw, Trash2, X } from 'lucide-react';

const DEADLINE_KEY = 'lockin_deadlines';
const DDAY_KEY = 'lockin_ddays';

const DDAY_COLORS = {
  green: { label: 'Green', accent: '#4dcd7d', soft: '#f1fbf4' },
  blue: { label: 'Blue', accent: '#4f8ff7', soft: '#f2f7ff' },
  red: { label: 'Red', accent: '#ef5350', soft: '#fff4f3' },
  yellow: { label: 'Yellow', accent: '#d5a72f', soft: '#fffaf0' },
  pink: { label: 'Pink', accent: '#ec6aa7', soft: '#fff4f9' },
  orange: { label: 'Orange', accent: '#f08a45', soft: '#fff7f1' },
};

const readJson = (key, fallback = []) => {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; }
};

const normalizeProjectDate = (value) => {
  if (!value || value === 'Set deadline') return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value;
  const parsed = new Date(`${value}, ${new Date().getFullYear()}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

const getRemaining = (value, now = Date.now()) => new Date(value).getTime() - now;
const formatDate = (value, withTime = true) => new Intl.DateTimeFormat('en', withTime
  ? { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }
  : { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(value));
const formatRemaining = (ms) => {
  const absolute = Math.abs(ms);
  const days = Math.floor(absolute / 86_400_000);
  const hours = Math.floor((absolute % 86_400_000) / 3_600_000);
  if (ms < 0) return days ? `${days}d overdue` : `${Math.max(1, hours)}h overdue`;
  if (days) return `${days}d ${hours}h remaining`;
  const minutes = Math.max(1, Math.floor(absolute / 60_000));
  return hours ? `${hours}h remaining` : `${minutes}m remaining`;
};

const urgency = (ms) => {
  if (ms < 0) return { label: 'Overdue', color: '#ef5350', surface: '#fff5f4' };
  if (ms < 86_400_000) return { label: 'Today', color: '#ef5350', surface: '#fff8f7' };
  if (ms < 7 * 86_400_000) return { label: 'This week', color: '#b68a3a', surface: '#fdfaf3' };
  return { label: 'Upcoming', color: '#748078', surface: '#fafaf8' };
};

const priorityTone = { High: '#ef5350', Medium: '#b68a3a', Low: '#4dcd7d' };

const DeadlinePage = ({ tasks = [] }) => {
  const [mode, setMode] = useState(() => localStorage.getItem('lockin_deadline_mode') || 'deadline');
  const [deadlines, setDeadlines] = useState(() => readJson(DEADLINE_KEY));
  const [ddays, setDdays] = useState(() => readJson(DDAY_KEY));
  const [showForm, setShowForm] = useState(false);
  const [undoState, setUndoState] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [deadlineFilter, setDeadlineFilter] = useState('all');

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 60_000);
    const refresh = () => setDeadlines(readJson(DEADLINE_KEY));
    window.addEventListener('lockin:deadlines-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('lockin:deadlines-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  useEffect(() => { localStorage.setItem(DEADLINE_KEY, JSON.stringify(deadlines)); }, [deadlines]);
  useEffect(() => { localStorage.setItem(DDAY_KEY, JSON.stringify(ddays)); }, [ddays]);
  useEffect(() => { localStorage.setItem('lockin_deadline_mode', mode); setShowForm(false); setDeadlineFilter('all'); }, [mode]);
  useEffect(() => { if (!undoState) return undefined; const timer = window.setTimeout(() => setUndoState(null), 5000); return () => window.clearTimeout(timer); }, [undoState]);

  const entries = useMemo(() => {
    const linkedTasks = tasks.filter((task) => task.deadline).map((task) => ({ id: `task-${task.id || task._id}`, title: task.title || task.name, deadline: task.deadline, priority: task.priority || 'Medium', source: 'Task', linked: true }));
    const projects = readJson('lockin_projects').map((project) => {
      const deadline = normalizeProjectDate(project.deadline);
      return deadline ? { id: `project-${project.id}`, title: project.name, deadline, priority: project.priority || 'Medium', source: 'Project', linked: true } : null;
    }).filter(Boolean);
    const merged = [...deadlines.map((item) => ({ ...item, source: item.source || 'Task' })), ...linkedTasks, ...projects];
    const unique = new Map();
    merged.forEach((item) => {
      const key = item.sourceTaskId ? `task-${item.sourceTaskId}` : item.id;
      if (!unique.has(key) && item.deadline && !Number.isNaN(new Date(item.deadline).getTime())) unique.set(key, item);
    });
    return [...unique.values()].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  }, [deadlines, tasks]);

  const groups = useMemo(() => {
    const result = { Overdue: [], Today: [], 'This week': [], Upcoming: [] };
    entries.forEach((entry) => result[urgency(getRemaining(entry.deadline, now)).label].push(entry));
    return result;
  }, [entries, now]);
  const filterOptions = useMemo(() => ([
    { key: 'overdue', label: 'Overdue', hint: 'Needs attention', count: groups.Overdue.length, tone: '#ef5350' },
    { key: 'due', label: 'Due soon', hint: 'Next 7 days', count: groups.Today.length + groups['This week'].length, tone: '#ef5350' },
    { key: 'upcoming', label: 'Upcoming', hint: 'Later on', count: groups.Upcoming.length, tone: '#748078' },
    { key: 'all', label: 'All', hint: 'Everything', count: entries.length, tone: '#17211b' },
  ]), [entries.length, groups]);
  const visibleEntries = useMemo(() => {
    if (deadlineFilter === 'all') return entries;
    if (deadlineFilter === 'due') return [...groups.Today, ...groups['This week']];
    return groups[deadlineFilter === 'upcoming' ? 'Upcoming' : 'Overdue'];
  }, [deadlineFilter, entries, groups]);
  const visibleGroups = useMemo(() => {
    if (deadlineFilter === 'all') return groups;
    const label = deadlineFilter === 'due' ? 'Due soon' : deadlineFilter === 'upcoming' ? 'Upcoming' : 'Overdue';
    return { [label]: visibleEntries };
  }, [deadlineFilter, groups, visibleEntries]);
  const sortedDdays = useMemo(() => [...ddays].sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate)), [ddays]);

  const removeDeadline = (entry) => {
    const index = deadlines.findIndex((item) => item.id === entry.id);
    if (index < 0) return;
    setUndoState({ type: 'deadline', item: deadlines[index], index });
    setDeadlines((current) => current.filter((item) => item.id !== entry.id));
  };
  const removeDDay = (entry) => {
    const index = ddays.findIndex((item) => item.id === entry.id);
    setUndoState({ type: 'dday', item: entry, index });
    setDdays((current) => current.filter((item) => item.id !== entry.id));
  };
  const undo = () => {
    if (!undoState) return;
    const restore = (current) => { const next = [...current]; next.splice(Math.max(0, undoState.index), 0, undoState.item); return next; };
    if (undoState.type === 'dday') setDdays(restore); else setDeadlines(restore);
    setUndoState(null);
  };

  const modeCopy = mode === 'deadline'
    ? { eyebrow: 'Time-sensitive work', title: 'Deadlines', description: 'Task and project dates, ordered by urgency.', action: 'Add deadline' }
    : { eyebrow: 'Important moments', title: 'D-Day', description: 'Keep meaningful events visible without turning them into tasks.', action: 'Add event' };

  return <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[#e9e7e1] pb-5">
      <div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#249653]">{modeCopy.eyebrow}</p><h1 className="mt-1 text-3xl font-extrabold tracking-[-.035em] text-[#17211b]">{modeCopy.title}</h1><p className="mt-1 text-sm text-[#748078]">{modeCopy.description}</p></div>
      <button type="button" onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-xl bg-[#17211b] px-4 py-2.5 text-xs font-bold text-white transition-transform duration-200 active:scale-95"><Plus className="h-4 w-4" />{modeCopy.action}</button>
    </header>

    <nav className="mt-5 inline-flex rounded-xl bg-[#eceeea] p-1" aria-label="Deadline views">
      {[['deadline', Flag, 'Deadline'], ['dday', Milestone, 'D-Day']].map(([value, Icon, label]) => <button key={value} type="button" onClick={() => setMode(value)} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all duration-200 ${mode === value ? 'bg-white text-[#17211b] shadow-[0_1px_3px_rgba(23,33,27,.08)]' : 'text-[#748078] hover:text-[#17211b]'}`}><Icon className="h-3.5 w-3.5" />{label}</button>)}
    </nav>

    {mode === 'deadline' && <>
      <section className="mt-5 grid gap-2 sm:grid-cols-4" aria-label="Deadline views">
        {filterOptions.map((option) => <FilterCard key={option.key} option={option} active={deadlineFilter === option.key} onClick={() => setDeadlineFilter(option.key)} />)}
      </section>
      {showForm && <DeadlineForm onClose={() => setShowForm(false)} onAdd={(entry) => { setDeadlines((current) => [{ id: Date.now(), ...entry, createdAt: new Date().toISOString() }, ...current]); setShowForm(false); }} />}
      <div className="mt-6 space-y-7">{Object.entries(visibleGroups).map(([label, items]) => items.length > 0 && <section key={label}><SectionLabel label={label} count={items.length} /><div className="overflow-hidden rounded-xl border border-[#e9e7e1] bg-white">{items.map((entry, index) => <DeadlineRow key={entry.id} entry={entry} now={now} onRemove={removeDeadline} last={index === items.length - 1} />)}</div></section>)}{visibleEntries.length === 0 && <EmptyState icon={deadlineFilter === 'overdue' ? Check : Flag} title={deadlineFilter === 'overdue' ? 'You are all caught up.' : 'Nothing here yet.'} description={deadlineFilter === 'all' ? 'Deadlines added to Tasks and Projects will appear here.' : 'Try another view or add a new deadline when something needs a date.'} />}</div>
    </>}

    {mode === 'dday' && <>
      {showForm && <DDayForm onClose={() => setShowForm(false)} onAdd={(entry) => { setDdays((current) => [{ id: Date.now(), ...entry, createdAt: new Date().toISOString() }, ...current]); setShowForm(false); }} />}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">{sortedDdays.map((entry) => <DDayCard key={entry.id} entry={entry} now={now} onRemove={removeDDay} />)}</div>
      {sortedDdays.length === 0 && <div className="mt-6"><EmptyState icon={Milestone} title="No important dates yet." description="Add an exam, launch, trip, anniversary, or another moment worth counting toward." /></div>}
    </>}

    {undoState && <div className="fixed bottom-6 left-1/2 z-[110] flex -translate-x-1/2 items-center gap-4 rounded-xl bg-[#17211b] px-4 py-3 text-xs font-bold text-white shadow-xl"><span>{undoState.type === 'dday' ? 'Event removed' : 'Deadline removed'}</span><button type="button" onClick={undo} className="inline-flex items-center gap-1.5 text-[#7ee2a0]"><RotateCcw className="h-3.5 w-3.5" />Undo</button></div>}
  </main>;
};

const FilterCard = ({ option, active, onClick }) => <button type="button" onClick={onClick} aria-pressed={active} className={`group rounded-xl border px-3 py-3 text-left transition-all duration-200 ${active ? 'border-[#17211b] bg-white shadow-[0_4px_14px_rgba(23,33,27,.08)]' : 'border-[#e9e7e1] bg-white/70 hover:-translate-y-0.5 hover:border-[#cfd5cf] hover:bg-white'}`}><div className="flex items-center justify-between gap-2"><span className={`text-xs font-extrabold ${active ? 'text-[#17211b]' : 'text-[#748078]'}`}>{option.label}</span><span className="font-mono text-lg font-extrabold" style={{ color: option.tone }}>{option.count}</span></div><p className="mt-1 text-[10px] font-medium text-[#9aa29c]">{option.hint}</p><div className={`mt-2 h-1 rounded-full transition-all duration-200 ${active ? 'bg-[#4dcd7d]' : 'bg-[#e9e7e1] group-hover:bg-[#dfe3de]'}`} /></button>;
const SectionLabel = ({ label, count }) => <div className="mb-2 flex items-center gap-2"><span className="text-[10px] font-black uppercase tracking-[.14em] text-[#748078]">{label}</span><span className="text-[10px] font-bold text-[#a0a7a2]">{count}</span><div className="h-px flex-1 bg-[#e9e7e1]" /></div>;

const DeadlineRow = ({ entry, now, onRemove, last }) => {
  const remaining = getRemaining(entry.deadline, now);
  const state = urgency(remaining);
  return <article className={`group flex items-center gap-3 px-4 py-3.5 transition-colors duration-200 hover:bg-white ${last ? '' : 'border-b border-[#efede8]'}`} style={{ backgroundColor: state.surface }}><span className="h-8 w-1 shrink-0 rounded-full" style={{ background: state.color }} /><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h2 className="truncate text-sm font-bold text-[#17211b]">{entry.title}</h2><span className="rounded-md bg-white/80 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-[#748078]">{entry.source}</span></div><p className="mt-1 flex items-center gap-1.5 text-[10px] font-medium text-[#748078]"><CalendarDays className="h-3 w-3" />{formatDate(entry.deadline)}<span>·</span><span style={{ color: priorityTone[entry.priority] || priorityTone.Medium }}>{entry.priority || 'Medium'}</span></p></div><div className="shrink-0 text-right"><p className="font-mono text-[11px] font-bold" style={{ color: state.color }}>{formatRemaining(remaining)}</p><p className="mt-0.5 text-[9px] font-semibold text-[#8a948d]">{state.label}</p></div>{!entry.linked && <button type="button" onClick={() => onRemove(entry)} className="rounded-lg p-2 text-[#b2b8b3] opacity-0 transition hover:bg-white hover:text-[#ef5350] group-hover:opacity-100" aria-label={`Remove ${entry.title}`}><Trash2 className="h-3.5 w-3.5" /></button>}</article>;
};

const DDayCard = ({ entry, now, onRemove }) => {
  const palette = DDAY_COLORS[entry.color] || DDAY_COLORS.green;
  const remaining = getRemaining(`${entry.targetDate}T23:59:59`, now);
  const dayCount = Math.max(0, Math.ceil(Math.abs(remaining) / 86_400_000));
  return <article className="group relative overflow-hidden rounded-2xl border border-[#e2e5e0] bg-white p-5 shadow-[0_2px_10px_rgba(23,33,27,.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(23,33,27,.07)]"><div className="absolute inset-x-0 top-0 h-1" style={{ background: palette.accent }} /><div className="flex items-start justify-between gap-4"><div className="min-w-0"><span className="rounded-md px-2 py-1 text-[9px] font-black uppercase tracking-[.12em]" style={{ background: palette.soft, color: palette.accent }}>{remaining < 0 ? 'Passed' : 'D-Day'}</span><h2 className="mt-3 truncate text-lg font-extrabold tracking-tight text-[#17211b]">{entry.title}</h2>{entry.notes && <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#748078]">{entry.notes}</p>}</div><div className="shrink-0 text-right"><p className="font-mono text-3xl font-extrabold tracking-[-.06em]" style={{ color: palette.accent }}>{remaining < 0 ? '+' : ''}{dayCount}</p><p className="text-[9px] font-bold uppercase tracking-[.1em] text-[#8a948d]">days</p></div></div><div className="mt-5 flex items-center justify-between border-t border-[#efede8] pt-3"><p className="flex items-center gap-1.5 text-[10px] font-semibold text-[#748078]"><CalendarDays className="h-3.5 w-3.5" />{formatDate(`${entry.targetDate}T12:00:00`, false)}</p><button type="button" onClick={() => onRemove(entry)} className="rounded-lg p-2 text-[#b2b8b3] opacity-0 transition hover:bg-[#fff1f0] hover:text-[#ef5350] group-hover:opacity-100" aria-label={`Remove ${entry.title}`}><Trash2 className="h-3.5 w-3.5" /></button></div></article>;
};

const Field = ({ className = '', ...props }) => <input {...props} className={`rounded-xl border border-[#e2e5e0] bg-white px-3 py-2.5 text-sm font-semibold text-[#17211b] outline-none transition focus:border-[#4dcd7d] ${className}`} />;

const DeadlineForm = ({ onClose, onAdd }) => {
  const [title, setTitle] = useState(''); const [deadline, setDeadline] = useState(''); const [priority, setPriority] = useState('Medium');
  const submit = (event) => { event.preventDefault(); if (title.trim() && deadline) onAdd({ title: title.trim(), deadline, priority, source: 'Task' }); };
  return <EditorShell title="New deadline" prompt="What needs a firm date?" onClose={onClose}><form onSubmit={submit}><div className="mt-4 grid gap-3 sm:grid-cols-[1fr_190px_120px]"><Field autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Task or milestone" /><Field type="datetime-local" value={deadline} onChange={(event) => setDeadline(event.target.value)} className="text-xs" /><select value={priority} onChange={(event) => setPriority(event.target.value)} className="rounded-xl border border-[#e2e5e0] px-3 py-2.5 text-xs font-semibold outline-none"><option>High</option><option>Medium</option><option>Low</option></select></div><FormActions onClose={onClose} /></form></EditorShell>;
};

const DDayForm = ({ onClose, onAdd }) => {
  const [title, setTitle] = useState(''); const [targetDate, setTargetDate] = useState(''); const [notes, setNotes] = useState(''); const [color, setColor] = useState('green');
  const submit = (event) => { event.preventDefault(); if (title.trim() && targetDate) onAdd({ title: title.trim(), targetDate, notes: notes.trim(), color }); };
  return <EditorShell title="New D-Day" prompt="Which moment do you want to keep visible?" onClose={onClose}><form onSubmit={submit}><div className="mt-4 grid gap-3 sm:grid-cols-2"><Field autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Exam, launch, trip…" /><Field type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} /></div><Field value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional note" className="mt-3 w-full" /><fieldset className="mt-4"><legend className="text-[10px] font-bold uppercase tracking-[.12em] text-[#748078]">Card color</legend><div className="mt-2 flex flex-wrap gap-2">{Object.entries(DDAY_COLORS).map(([key, palette]) => <button key={key} type="button" onClick={() => setColor(key)} aria-label={palette.label} aria-pressed={color === key} className={`flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-200 ${color === key ? 'scale-110 ring-2 ring-[#17211b] ring-offset-2' : 'hover:scale-105'}`} style={{ background: palette.accent }}>{color === key && <Check className="h-4 w-4 text-white" strokeWidth={3} />}</button>)}</div></fieldset><FormActions onClose={onClose} /></form></EditorShell>;
};

const EditorShell = ({ title, prompt, onClose, children }) => <section className="mt-5 rounded-xl border border-[#e2e5e0] bg-white p-4 shadow-[0_8px_30px_rgba(23,33,27,.06)]"><div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.12em] text-[#748078]">{title}</p><p className="mt-1 text-sm font-bold text-[#17211b]">{prompt}</p></div><button type="button" onClick={onClose} className="rounded-lg p-2 text-[#748078] hover:bg-[#fafaf8]"><X className="h-4 w-4" /></button></div>{children}</section>;
const FormActions = ({ onClose }) => <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={onClose} className="px-3 py-2 text-xs font-bold text-[#748078]">Cancel</button><button type="submit" className="inline-flex items-center gap-1.5 rounded-lg bg-[#17211b] px-3.5 py-2 text-xs font-bold text-white"><Check className="h-3.5 w-3.5" />Save</button></div>;
const EmptyState = ({ icon: Icon, title, description }) => <div className="rounded-xl border border-dashed border-[#d9ddd8] bg-white py-16 text-center"><Icon className="mx-auto h-6 w-6 text-[#a0a7a2]" /><p className="mt-3 text-sm font-bold text-[#17211b]">{title}</p><p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-[#748078]">{description}</p></div>;

export default DeadlinePage;
