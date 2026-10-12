import { useEffect, useMemo, useState } from 'react';
import { Brain, Check, ChevronLeft, ChevronRight, Pause, Play, Plus, Square, X } from 'lucide-react';
import TiimoTimerView from './TiimoTimerView';

const COLORS = ['#9381ff', '#f3b75b', '#62c88a', '#ef8790', '#78b7f2'];
const DEFAULT_TASKS = [
  { id: 't1', title: 'Submit final report', emoji: '🏁', minutes: 30, category: 'School', priority: 'High', period: 'Morning', done: false, subtasks: [{ id: 't1-1', title: 'Open the final draft', emoji: '📄', done: false }, { id: 't1-2', title: 'Check the key findings', emoji: '🔎', done: false }, { id: 't1-3', title: 'Submit the document', emoji: '🚀', done: false }] },
  { id: 't2', title: 'Prepare slides for presentation', emoji: '📊', minutes: 45, category: 'School', priority: 'High', period: 'Morning', done: false, subtasks: [{ id: 't2-1', title: 'Choose the main story', emoji: '💡', done: false }, { id: 't2-2', title: 'Build three key slides', emoji: '🖼️', done: false }, { id: 't2-3', title: 'Practice the opening', emoji: '🎤', done: false }] },
  { id: 't3', title: 'Proofread final report', emoji: '🧑🏻‍💻', minutes: 20, category: 'School', priority: 'High', period: 'Day', done: false, subtasks: [{ id: 't3-1', title: 'Read one section slowly', emoji: '📚', done: false }, { id: 't3-2', title: 'Fix unclear sentences', emoji: '✍️', done: false }] },
  { id: 't4', title: 'Add citations and references', emoji: '✍️', minutes: 25, category: 'School', priority: 'Medium', period: 'Day', done: false, subtasks: [{ id: 't4-1', title: 'Collect missing sources', emoji: '🔖', done: false }, { id: 't4-2', title: 'Format the bibliography', emoji: '🗂️', done: false }] },
  { id: 't5', title: 'Pay my bills', emoji: '💰', minutes: 15, category: 'Home', priority: 'Medium', period: 'Anytime', done: false },
  { id: 't6', title: 'Morning routine', emoji: '🌅', minutes: 60, category: 'Home', priority: 'Medium', period: 'Morning', done: false },
];

const readTasks = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('lockin_tiimo_tasks_v2') || 'null');
    return Array.isArray(saved) && saved.length ? saved.map((task) => {
      const template = DEFAULT_TASKS.find((item) => item.id === task.id);
      return { ...task, subtasks: task.subtasks?.length ? task.subtasks : (template?.subtasks || []) };
    }) : DEFAULT_TASKS;
  } catch { return DEFAULT_TASKS; }
};

const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
const todayLabel = () => new Intl.DateTimeFormat('en', { weekday: 'long' }).format(new Date());

const TiimoExperiment = () => {
  const [view, setView] = useState('day');
  const [tasks, setTasks] = useState(readTasks);
  const [category, setCategory] = useState('School');
  const [activeTaskId, setActiveTaskId] = useState(() => readTasks().find((task) => !task.done)?.id || 't1');
  const [showAdd, setShowAdd] = useState(null);
  const [draft, setDraft] = useState({ title: '', emoji: '🎯', minutes: 25, subtasks: '' });
  const [timerStatus, setTimerStatus] = useState('idle');
  const activeTask = tasks.find((task) => task.id === activeTaskId) || tasks.find((task) => !task.done) || tasks[0];
  const [plannedSeconds, setPlannedSeconds] = useState((activeTask?.minutes || 25) * 60);
  const [remaining, setRemaining] = useState((activeTask?.minutes || 25) * 60);
  const [brainDump, setBrainDump] = useState('');
  const [thoughts, setThoughts] = useState([]);

  useEffect(() => { localStorage.setItem('lockin_tiimo_tasks_v2', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => {
    const seconds = (activeTask?.minutes || 25) * 60;
    setPlannedSeconds(seconds);
    setRemaining(seconds);
    setTimerStatus('idle');
  }, [activeTask?.id, activeTask?.minutes]);
  useEffect(() => {
    if (timerStatus !== 'running') return undefined;
    const id = window.setInterval(() => setRemaining((value) => {
      if (value <= 1) { window.clearInterval(id); setTimerStatus('complete'); return 0; }
      return value - 1;
    }), 1000);
    return () => window.clearInterval(id);
  }, [timerStatus]);

  const pendingTasks = tasks.filter((task) => !task.done);
  const nextTask = pendingTasks.find((task) => task.id !== activeTask?.id);
  const elapsed = Math.max(0, plannedSeconds - remaining);

  const toggleTask = (id) => setTasks((current) => current.map((task) => task.id === id ? { ...task, done: !task.done } : task));
  const toggleSubtask = (taskId, subtaskId) => setTasks((current) => current.map((task) => task.id === taskId ? { ...task, subtasks: (task.subtasks || []).map((subtask) => subtask.id === subtaskId ? { ...subtask, done: !subtask.done } : subtask) } : task));
  const chooseTask = (task) => { setActiveTaskId(task.id); setView('timer'); };
  const finishEarly = () => setTimerStatus('complete');
  const stopTimer = () => { setTimerStatus('idle'); setRemaining(plannedSeconds); };
  const finishAndNext = () => {
    toggleTask(activeTask.id);
    if (nextTask) setActiveTaskId(nextTask.id);
    else setView('day');
  };
  const addTask = (event) => {
    event.preventDefault();
    if (!draft.title.trim()) return;
    const context = showAdd || {};
    const taskId = `tiimo-${Date.now()}`;
    const subtasks = draft.subtasks.split(',').map((title) => title.trim()).filter(Boolean).map((title, index) => ({ id: `${taskId}-sub-${index}`, title, emoji: ['✨', '✍️', '🎉'][index % 3], done: false }));
    const task = { id: taskId, title: draft.title.trim(), emoji: draft.emoji || '🎯', minutes: Math.max(5, Number(draft.minutes) || 25), category: context.category || category, priority: context.priority || 'Medium', period: context.period || 'Anytime', done: false, subtasks };
    setTasks((current) => [...current, task]);
    setDraft({ title: '', emoji: '🎯', minutes: 25, subtasks: '' });
    setShowAdd(null);
  };
  const saveThought = (event) => { event.preventDefault(); if (!brainDump.trim()) return; setThoughts((items) => [{ id: Date.now(), text: brainDump.trim() }, ...items]); setBrainDump(''); };

  return <main className="min-h-[calc(100vh-2rem)] bg-[#f6f2ff] p-3 text-slate-950 sm:p-6">
    <div className="mx-auto max-w-5xl overflow-hidden rounded-[34px] border border-white/80 bg-[#fcfbf8] shadow-[0_30px_90px_rgba(64,51,110,.14)]">
      <header className="border-b border-[#ece9e3] bg-white/90 px-5 pt-5 backdrop-blur-xl sm:px-8 sm:pt-7">
        <div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.22em] text-[#806ee8]">Tiimo concept lab</p><h1 className="mt-1 font-serif text-2xl font-semibold">Visual planning</h1></div><div className="rounded-full bg-[#f5f2ff] px-3 py-2 text-xs font-black text-[#7662df]">🎉 {tasks.filter((task) => task.done).length}</div></div>
        <nav aria-label="Tiimo pages" className="mt-7 flex gap-8 overflow-x-auto pb-4 sm:gap-11">
          {[['lists', 'Lists'], ['day', 'My day'], ['timer', 'Timer']].map(([id, label]) => <button key={id} type="button" onClick={() => setView(id)} className={`relative shrink-0 font-serif text-2xl transition sm:text-3xl ${view === id ? 'font-bold text-slate-950' : 'font-medium text-slate-300 hover:text-slate-500'}`}>{label}{view === id && <span className="absolute -bottom-4 left-0 right-0 h-0.5 rounded-full bg-slate-950" />}</button>)}
        </nav>
      </header>

      <div key={view} className="tiimo-page-enter min-h-[690px] p-5 sm:p-8">
        {view === 'lists' && <ListsView tasks={tasks} category={category} setCategory={setCategory} onToggle={toggleTask} onChoose={chooseTask} onAdd={setShowAdd} />}
        {view === 'day' && <DayView tasks={tasks} onToggle={toggleTask} onChoose={chooseTask} onAdd={setShowAdd} />}
        {view === 'timer' && activeTask && <TiimoTimerView task={activeTask} nextTask={nextTask} status={timerStatus} setStatus={setTimerStatus} remaining={remaining} setRemaining={setRemaining} plannedSeconds={plannedSeconds} setPlannedSeconds={setPlannedSeconds} elapsed={elapsed} onFinishEarly={finishEarly} onStop={stopTimer} onNext={finishAndNext} onSelectTask={setActiveTaskId} onToggleSubtask={toggleSubtask} brainDump={brainDump} setBrainDump={setBrainDump} saveThought={saveThought} thoughts={thoughts} />}
      </div>
    </div>
    {showAdd && <AddTaskModal draft={draft} setDraft={setDraft} onSubmit={addTask} onClose={() => setShowAdd(null)} />}
    <style>{`@keyframes tiimo-enter{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}.tiimo-page-enter{animation:tiimo-enter .22s cubic-bezier(.2,.8,.2,1)}.tiimo-scroll::-webkit-scrollbar{display:none}`}</style>
  </main>;
};

const ListsView = ({ tasks, category, setCategory, onToggle, onChoose, onAdd }) => {
  const categories = ['School', 'Groceries', 'Home', 'Wishlist'];
  const categoryTasks = tasks.filter((task) => task.category === category);
  const todoTasks = categoryTasks.filter((task) => !task.done);
  const doneTasks = categoryTasks.filter((task) => task.done);
  return <section className="relative mx-auto min-h-[620px] max-w-2xl pb-24">
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 gap-6 overflow-x-auto pb-3 tiimo-scroll">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`shrink-0 font-serif text-3xl transition sm:text-4xl ${category === item ? 'font-bold text-slate-950' : 'text-slate-300 hover:text-slate-500'}`}>{item}</button>)}</div>
      <button className="mt-1 shrink-0 text-xl font-black tracking-[.12em] text-slate-700">•••</button>
    </div>

    <div className="mt-7">
      <div className="mb-3 flex items-center justify-between"><span className="rounded-full bg-slate-100 px-3 py-2 text-[10px] font-black uppercase tracking-wide text-slate-600">To-do ({todoTasks.length})⌄</span><button onClick={() => onAdd({ category, priority: 'Medium' })} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-300 transition hover:bg-violet-100 hover:text-violet-600"><Plus className="h-4 w-4" /></button></div>
      <div className="space-y-2">{todoTasks.map((task, index) => <ListTaskRow key={task.id} task={task} color={COLORS[index % COLORS.length]} onToggle={onToggle} onChoose={onChoose} />)}{todoTasks.length === 0 && <EmptyState onAdd={() => onAdd({ category, priority: 'Medium' })} label={`Add a task to ${category}`} />}</div>
    </div>

    {doneTasks.length > 0 && <div className="mt-8"><div className="mb-3"><span className="rounded-full bg-slate-100 px-3 py-2 text-[10px] font-black uppercase tracking-wide text-slate-500">Done ({doneTasks.length})⌄</span></div><div className="space-y-2">{doneTasks.map((task, index) => <ListTaskRow key={task.id} task={task} color={COLORS[(index + 2) % COLORS.length]} onToggle={onToggle} onChoose={onChoose} />)}</div></div>}

    <div className="sticky bottom-4 mt-10 flex justify-end"><button onClick={() => onAdd({ category, priority: 'Medium' })} aria-label="Add task" className="flex h-14 w-14 items-center justify-center rounded-full bg-[#9a7cff] text-white shadow-[0_10px_25px_rgba(130,96,235,.35)] transition hover:-translate-y-1 active:scale-95"><Plus className="h-6 w-6" /></button></div>
  </section>;
};

const ListTaskRow = ({ task, color, onToggle, onChoose }) => <article className={`group flex items-center gap-3 rounded-2xl border border-[#eeece7] bg-white px-4 py-3 shadow-[0_3px_14px_rgba(15,23,42,.06)] transition ${task.done ? 'opacity-45' : 'hover:-translate-y-0.5 hover:shadow-md'}`}><button onClick={() => onChoose(task)} className="flex min-w-0 flex-1 items-center gap-3 text-left"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg" style={{ background: `${color}20` }}>{task.emoji}</span><span className={`truncate text-sm font-black text-slate-800 ${task.done ? 'line-through' : ''}`}>{task.title}</span></button><button onClick={() => onToggle(task.id)} aria-label={`Complete ${task.title}`} className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition ${task.done ? 'border-slate-800 bg-slate-800 text-white' : 'border-slate-700 text-transparent hover:border-[#9274f5]'}`}><Check className="h-4 w-4 stroke-[3]" /></button></article>;

const DayView = ({ tasks, onToggle, onChoose, onAdd }) => <section className="mx-auto max-w-2xl"><div className="flex items-center justify-center gap-8"><button className="text-slate-300 hover:text-slate-700"><ChevronLeft className="h-7 w-7" /></button><h2 className="font-serif text-5xl font-semibold tracking-tight">{todayLabel()}</h2><button className="text-slate-300 hover:text-slate-700"><ChevronRight className="h-7 w-7" /></button></div><div className="mx-auto mt-7 flex max-w-md justify-between">{[-2,-1,0,1,2].map((offset) => { const date = new Date(); date.setDate(date.getDate() + offset); return <div key={offset} className={`flex h-14 w-12 flex-col items-center justify-center rounded-2xl text-xs font-bold ${offset === 0 ? 'bg-[#f2efff] text-[#7662df]' : 'text-slate-300'}`}><span>{new Intl.DateTimeFormat('en',{weekday:'narrow'}).format(date)}</span><span className="mt-1 text-base">{date.getDate()}</span></div>; })}</div><div className="mt-9 space-y-8">{['Anytime','Morning','Day'].map((period) => <TaskGroup key={period} title={period} items={tasks.filter((task) => task.period === period)} tone={period === 'Morning' ? 'rose' : period === 'Day' ? 'blue' : 'slate'} onToggle={onToggle} onChoose={onChoose} onAdd={() => onAdd({ period })} />)}</div></section>;

const TaskGroup = ({ title, items, tone, onToggle, onChoose, onAdd }) => {
  const tones = { rose: 'bg-rose-50 text-rose-700', amber: 'bg-amber-50 text-amber-700', blue: 'bg-blue-50 text-blue-700', slate: 'bg-slate-100 text-slate-600' };
  return <section><div className="mb-3 flex items-center justify-between"><span className={`rounded-full px-3 py-2 text-[11px] font-black uppercase tracking-wide ${tones[tone]}`}>{title} ({items.length})⌄</span><button onClick={onAdd} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-300 transition hover:bg-violet-100 hover:text-violet-600"><Plus className="h-4 w-4" /></button></div><div className="space-y-2">{items.map((task, index) => <article key={task.id} className={`group flex items-center gap-3 rounded-2xl border border-[#eeece7] bg-white px-4 py-3 shadow-[0_3px_14px_rgba(15,23,42,.05)] transition ${task.done ? 'opacity-50' : 'hover:-translate-y-0.5 hover:shadow-md'}`}><button onClick={() => onChoose(task)} className="flex min-w-0 flex-1 items-center gap-3 text-left"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl" style={{ background: `${COLORS[index % COLORS.length]}18` }}>{task.emoji}</span><span className="min-w-0"><span className={`block truncate text-sm font-black ${task.done ? 'line-through' : ''}`}>{task.title}</span><span className="mt-0.5 block text-[11px] font-semibold text-slate-400">{task.minutes} minutes</span></span></button><button onClick={() => onToggle(task.id)} aria-label={`Complete ${task.title}`} className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition ${task.done ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-800 text-transparent hover:border-[#806ee8]'}`}><Check className="h-4 w-4 stroke-[3]" /></button></article>)}{items.length === 0 && <p className="rounded-2xl border border-dashed border-slate-200 py-5 text-center text-xs font-semibold text-slate-300">Nothing here yet.</p>}</div></section>;
};

const TimerView = ({ task, nextTask, status, setStatus, remaining, setRemaining, plannedSeconds, setPlannedSeconds, elapsed, onFinishEarly, onStop, onNext, onSelectTask, brainDump, setBrainDump, saveThought, thoughts }) => {
  const setActiveTaskId = onSelectTask;
  const radius = 126; const circumference = 2 * Math.PI * radius; const progress = elapsed / Math.max(plannedSeconds, 1); const preparing = status === 'running' && nextTask && remaining <= 300;
  if (status === 'complete') return <section className="mx-auto max-w-xl py-16 text-center"><div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><Check className="h-10 w-10 stroke-[3]" /></div><p className="mt-6 text-xs font-black uppercase tracking-[.18em] text-emerald-600">Block complete</p><h2 className="mt-3 font-serif text-4xl font-semibold">Your effort counts.</h2><p className="mt-3 text-sm font-semibold text-slate-400">Actual {Math.max(1, Math.round(elapsed/60))}m · Planned {Math.round(plannedSeconds/60)}m</p><button onClick={onNext} className="mt-8 inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white">{nextTask ? 'Next task' : 'Back to my day'}<ChevronRight className="h-4 w-4" /></button></section>;
  return <section className="mx-auto max-w-2xl"><div className="rounded-[34px] bg-[#090909] px-5 py-7 text-center text-white shadow-[0_24px_70px_rgba(0,0,0,.25)] sm:px-9"><div className="flex items-center justify-between"><span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white/70">♫ Lo-fi beats</span><span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white/70">Alarm off</span></div><h2 className="mt-8 font-serif text-4xl">{task.title}</h2><p className="mt-1 text-xs font-semibold text-white/45">{status === 'idle' ? `Planned ${task.minutes} minutes` : status === 'paused' ? 'Paused · take your time' : 'One thing at a time'}</p>{preparing && <div className="mx-auto mt-5 max-w-sm rounded-2xl bg-amber-300/10 px-4 py-3 text-xs font-bold text-amber-200">Start preparing for {nextTask.title}</div>}<div className="relative mx-auto mt-6 h-[290px] w-[290px]"><svg viewBox="0 0 300 300" className="h-full w-full -rotate-90"><circle cx="150" cy="150" r={radius} fill="#fff8ea" stroke="#302d39" strokeWidth="22"/><circle cx="150" cy="150" r={radius} fill="none" stroke="#967cff" strokeWidth="22" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * Math.min(1, progress)} className="transition-[stroke-dashoffset] duration-1000 linear"/></svg><span className="absolute inset-0 flex items-center justify-center text-8xl">{task.emoji}</span></div><div className="mt-2 font-serif text-6xl tabular-nums">{formatTime(remaining)}</div>{status === 'idle' ? <button onClick={() => setStatus('running')} className="mt-6 inline-flex items-center gap-3 rounded-full bg-[#2c2425] px-7 py-3.5 text-sm font-black"><span>Start now</span><Play className="h-4 w-4 fill-current" /></button> : <div className="mt-6 flex flex-wrap justify-center gap-2"><button onClick={() => setStatus(status === 'paused' ? 'running' : 'paused')} className="inline-flex min-w-28 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-black text-slate-950">{status === 'paused' ? <Play className="h-4 w-4 fill-current"/> : <Pause className="h-4 w-4 fill-current"/>}{status === 'paused' ? 'Resume' : 'Pause'}</button><button onClick={() => { setRemaining((value) => value + 300); setPlannedSeconds((value) => value + 300); }} className="rounded-full bg-white/10 px-5 py-3 text-xs font-black">+5 min</button><button onClick={onFinishEarly} className="rounded-full bg-white/10 px-5 py-3 text-xs font-black">Finish early</button><button onClick={onStop} className="inline-flex items-center gap-2 rounded-full bg-red-500/15 px-5 py-3 text-xs font-black text-red-300"><Square className="h-3 w-3 fill-current"/>Stop</button></div>}<div className="mx-auto mt-6 grid max-w-xs grid-cols-2 gap-2 text-left"><Metric label="Actual" value={formatTime(elapsed)}/><Metric label="Planned" value={`${Math.round(plannedSeconds/60)}m`}/></div></div><div className="mt-4 rounded-[28px] border border-[#e8e5df] bg-white p-4"><form onSubmit={saveThought} className="flex items-center gap-2"><Brain className="h-4 w-4 text-violet-500"/><input value={brainDump} onChange={(event) => setBrainDump(event.target.value)} placeholder="Brain dump — save it for later" className="min-w-0 flex-1 bg-transparent py-2 text-sm font-semibold outline-none"/><button className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-black text-white">Save</button></form>{thoughts.length > 0 && <p className="mt-2 truncate text-xs text-slate-400">Saved: {thoughts[0].text}</p>}</div>{nextTask && <button onClick={() => setActiveTaskId?.(nextTask.id)} className="mt-4 flex w-full items-center gap-3 rounded-2xl bg-white p-4 text-left"><span className="text-2xl">{nextTask.emoji}</span><span><span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Next</span><span className="text-sm font-black">{nextTask.title}</span></span></button>}</section>;
};

const Metric = ({ label, value }) => <div className="rounded-2xl bg-white/5 px-4 py-3"><p className="text-[9px] font-black uppercase tracking-wider text-white/35">{label}</p><p className="mt-1 font-mono text-base font-black text-white">{value}</p></div>;
const EmptyState = ({ onAdd, label }) => <button onClick={onAdd} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 py-8 text-sm font-bold text-slate-400 hover:border-violet-300 hover:text-violet-600"><Plus className="h-4 w-4"/>{label}</button>;
const AddTaskModal = ({ draft, setDraft, onSubmit, onClose }) => <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/25 p-4 backdrop-blur-sm" onMouseDown={onClose}><form onSubmit={onSubmit} onMouseDown={(event) => event.stopPropagation()} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,.16)]"><div className="flex items-center justify-between"><h2 className="font-serif text-2xl font-semibold">New visual task</h2><button type="button" onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5"/></button></div><div className="mt-5 grid grid-cols-[70px_1fr] gap-3"><input value={draft.emoji} onChange={(event) => setDraft({...draft,emoji:event.target.value})} maxLength="2" className="rounded-2xl border border-slate-200 px-3 text-center text-2xl outline-none focus:border-violet-400"/><input autoFocus value={draft.title} onChange={(event) => setDraft({...draft,title:event.target.value})} placeholder="Task name" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-violet-400"/></div><label className="mt-4 block text-xs font-black text-slate-500">Estimated minutes<input type="number" min="5" step="5" value={draft.minutes} onChange={(event) => setDraft({...draft,minutes:event.target.value})} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-violet-400"/></label><label className="mt-4 block text-xs font-black text-slate-500">Small steps<textarea value={draft.subtasks} onChange={(event) => setDraft({...draft,subtasks:event.target.value})} placeholder="Open the document, write one paragraph, review" rows="3" className="mt-2 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-violet-400"/><span className="mt-1.5 block text-[10px] font-medium text-slate-400">Separate each step with a comma.</span></label><button className="mt-5 w-full rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-black text-white transition-transform duration-200 active:scale-[.98]">Add task</button></form></div>;

export default TiimoExperiment;
