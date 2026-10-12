import { Brain, Check, ChevronRight, Pause, Play, Plus, RotateCcw, Square } from 'lucide-react';

const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

const TiimoTimerView = ({ task, nextTask, status, setStatus, remaining, setRemaining, plannedSeconds, setPlannedSeconds, elapsed, onFinishEarly, onStop, onNext, onSelectTask, onToggleSubtask, brainDump, setBrainDump, saveThought, thoughts }) => {
  const radius = 126;
  const progress = Math.min(1, elapsed / Math.max(plannedSeconds, 1));
  const preparing = status === 'running' && nextTask && remaining <= 300;
  const nextSubtaskId = task.subtasks?.find((subtask) => !subtask.done)?.id;

  if (status === 'complete') return <section className="mx-auto max-w-xl py-16 text-center">
    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#eeeaff] text-[#8068ed]"><Check className="h-10 w-10 stroke-[3]" /></div>
    <p className="mt-6 text-xs font-black uppercase tracking-[.18em] text-[#8068ed]">Block complete</p>
    <h2 className="mt-3 font-serif text-4xl font-semibold">Your effort counts.</h2>
    <p className="mt-3 text-sm font-semibold text-slate-400">Actual {Math.max(1, Math.round(elapsed / 60))}m · Planned {Math.round(plannedSeconds / 60)}m</p>
    <button onClick={onNext} className="mt-8 inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white">{nextTask ? 'Next task' : 'Back to my day'}<ChevronRight className="h-4 w-4" /></button>
  </section>;

  return <section className="mx-auto max-w-2xl">
    <div className="relative overflow-hidden rounded-[34px] border border-[#ebe8e1] bg-white px-5 py-7 text-center shadow-[0_24px_70px_rgba(58,48,94,.10)] sm:px-9">
      <div className="pointer-events-none absolute left-1/2 top-32 h-80 w-80 -translate-x-1/2 rounded-full bg-violet-100/35 blur-3xl" />
      <div className="relative flex items-center justify-between">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#faf9f7] px-3 py-2 text-xs font-bold text-slate-600 shadow-sm">♫ Lo-fi beats <span className="text-[#8068ed]">▥</span></span>
        <button type="button" onClick={() => { setStatus('idle'); setRemaining(plannedSeconds); }} aria-label="Reset timer" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#faf9f7] text-slate-500 shadow-sm transition hover:rotate-[-20deg]"><RotateCcw className="h-4 w-4" /></button>
      </div>

      <div className="relative">
        <h2 className="mt-8 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">{task.title}</h2>
        <p className="mt-1 text-xs font-semibold text-slate-400">{status === 'idle' ? `Planned ${task.minutes} minutes` : status === 'paused' ? 'Paused · take your time' : 'One thing at a time'}</p>
        {preparing && <div className="mx-auto mt-5 max-w-sm rounded-2xl bg-amber-50 px-4 py-3 text-xs font-bold text-amber-700">Start preparing for {nextTask.title}</div>}

        <div className="relative mx-auto mt-7 h-[290px] w-[290px]">
          <svg viewBox="0 0 300 300" className="h-full w-full -rotate-90">
            <circle cx="150" cy="150" r={radius} fill="#fff7e8" stroke="#f0edff" strokeWidth="22" />
            <circle cx="150" cy="150" r={radius} fill="none" stroke="#9274f5" strokeWidth="22" strokeLinecap="round" pathLength="100" strokeDasharray="100" strokeDashoffset={100 - progress * 100} style={{ transition: 'stroke-dashoffset 1s linear', filter: 'drop-shadow(0 2px 4px rgba(126, 94, 235, .24))' }} />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-8xl drop-shadow-sm">{task.emoji}</span>
        </div>

        <div className="mt-3 font-serif text-6xl tabular-nums tracking-tight text-slate-950">{formatTime(remaining)}</div>

        {status === 'idle' ? <button onClick={() => setStatus('running')} className="mt-6 inline-flex items-center gap-3 rounded-full bg-[#2c2627] px-8 py-3.5 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 active:scale-95">Start now<Play className="h-4 w-4 fill-current" /></button> : <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button onClick={() => { setRemaining((value) => value + 300); setPlannedSeconds((value) => value + 300); }} className="inline-flex items-center gap-1 rounded-full px-4 py-3 text-xs font-black text-slate-600 transition hover:bg-violet-50 hover:text-violet-700"><Plus className="h-3.5 w-3.5" />5 min</button>
          <button onClick={() => setStatus(status === 'paused' ? 'running' : 'paused')} className="inline-flex min-w-24 items-center justify-center gap-2 rounded-full bg-[#2c2627] px-5 py-3 text-xs font-black text-white shadow-md">{status === 'paused' ? <Play className="h-4 w-4 fill-current" /> : <Pause className="h-4 w-4 fill-current" />}{status === 'paused' ? 'Resume' : 'Pause'}</button>
          <button onClick={onFinishEarly} className="rounded-full px-4 py-3 text-xs font-black text-slate-500 transition hover:bg-slate-100">Finish early</button>
          <button onClick={onStop} aria-label="Stop timer" className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500 transition hover:bg-red-100"><Square className="h-3.5 w-3.5 fill-current" /></button>
        </div>}

        {status !== 'idle' && <div className="mx-auto mt-6 grid max-w-xs grid-cols-2 gap-2 text-left"><Metric label="Actual" value={formatTime(elapsed)} /><Metric label="Planned" value={`${Math.round(plannedSeconds / 60)}m`} /></div>}
      </div>
    </div>

    {task.subtasks?.length > 0 && <div className="mt-4 space-y-2"><div className="mb-3 flex items-center justify-between px-1"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#8068ed]">Small steps</p><h3 className="mt-1 text-sm font-black text-slate-800">Keep moving without deciding again.</h3></div><span className="text-xs font-bold text-slate-400">{task.subtasks.filter((subtask) => subtask.done).length}/{task.subtasks.length}</span></div>{task.subtasks.map((subtask, index) => { const isNext = subtask.id === nextSubtaskId; return <button key={subtask.id} type="button" onClick={() => onToggleSubtask(task.id, subtask.id)} className={`group flex w-full items-center gap-3 rounded-2xl border bg-white px-4 py-3 text-left shadow-[0_3px_14px_rgba(15,23,42,.05)] transition active:scale-[.99] ${isNext ? 'border-violet-200 ring-2 ring-violet-100' : 'border-[#ebe8e1]'} ${subtask.done ? 'opacity-45' : 'hover:-translate-y-0.5 hover:shadow-md'}`}><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg" style={{ backgroundColor: `${['#9381ff','#f3b75b','#62c88a','#ef8790'][index % 4]}18` }}>{subtask.emoji || '✨'}</span><span className="min-w-0 flex-1"><span className={`block truncate text-sm font-black text-slate-800 ${subtask.done ? 'line-through' : ''}`}>{subtask.title}</span>{isNext && <span className="mt-0.5 block text-[9px] font-black uppercase tracking-wider text-violet-500">Next step</span>}</span><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition ${subtask.done ? 'border-slate-800 bg-slate-800 text-white' : 'border-slate-700 text-transparent group-hover:border-[#9274f5]'}`}><Check className="h-4 w-4 stroke-[3]" /></span></button>; })}</div>}

    {status !== 'idle' && <div className="mt-4 rounded-[26px] border border-[#ebe8e1] bg-white p-4 shadow-sm"><form onSubmit={saveThought} className="flex items-center gap-2"><Brain className="h-4 w-4 text-[#8068ed]" /><input value={brainDump} onChange={(event) => setBrainDump(event.target.value)} placeholder="Brain dump — save it for later" className="min-w-0 flex-1 bg-transparent py-2 text-sm font-semibold outline-none" /><button className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-black text-white">Save</button></form>{thoughts.length > 0 && <p className="mt-2 truncate text-xs text-slate-400">Saved: {thoughts[0].text}</p>}</div>}

    {nextTask && <button onClick={() => onSelectTask(nextTask.id)} className="mt-4 flex w-full items-center gap-3 rounded-[22px] border border-[#ebe8e1] bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-50 text-2xl">{nextTask.emoji}</span><span className="min-w-0 flex-1"><span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Next</span><span className="block truncate text-sm font-black">{nextTask.title}</span></span><ChevronRight className="h-4 w-4 text-slate-300" /></button>}
  </section>;
};

const Metric = ({ label, value }) => <div className="rounded-2xl bg-[#faf9f7] px-4 py-3"><p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 font-mono text-base font-black text-slate-800">{value}</p></div>;

export default TiimoTimerView;
