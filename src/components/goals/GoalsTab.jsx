import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { ArrowRight, CalendarDays, CheckCircle2, ChevronRight, Flag, Plus, RotateCcw, Target, Trash2, TrendingUp, X } from 'lucide-react';

const DEFAULT_GOALS = [
  { id: 1, title: 'Launch Lock In publicly', outcome: 'Ship a calm product people return to every day.', targetDate: 'Oct 30', type: 'quarterly' },
  { id: 2, title: 'Plan the next expedition', outcome: 'Turn research into a clear and executable journey.', targetDate: 'Nov 14', type: 'quarterly' },
];

const readGoals = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('lockin_goals') || 'null');
    if (!saved?.length) return DEFAULT_GOALS;
    return saved.map((goal, index) => ({
      ...goal,
      title: goal.title || DEFAULT_GOALS[index % DEFAULT_GOALS.length].title,
      outcome: goal.outcome || (goal.unit ? `Create a meaningful ${goal.type || 'long-term'} outcome, not another task list.` : 'Define the result that will matter when this is complete.'),
      targetDate: goal.targetDate || goal.deadline || (index === 0 ? 'Oct 30' : 'Nov 14'),
    }));
  } catch { return DEFAULT_GOALS; }
};

const readProjects = () => {
  try { return JSON.parse(localStorage.getItem('lockin_projects') || '[]'); } catch { return []; }
};

const projectTasks = (project) => (project.milestones || []).flatMap((milestone) => milestone.tasks || []);
const weekKey = () => {
  const date = new Date();
  const start = new Date(date.getFullYear(), 0, 1);
  return `${date.getFullYear()}-${Math.ceil((((date - start) / 86400000) + start.getDay() + 1) / 7)}`;
};
const progressForGoal = (goal, projects) => {
  const tasks = projects.filter((project) => String(project.goalId) === String(goal.id)).flatMap(projectTasks);
  return tasks.length ? Math.round(tasks.filter((task) => task.done).length / tasks.length * 100) : Number(goal.progress || 0);
};

const GoalsTab = ({ onOpenProject }) => {
  const [goals, setGoals] = useState(readGoals);
  const [projects, setProjects] = useState(readProjects);
  const [period, setPeriod] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [undoGoal, setUndoGoal] = useState(null);
  const [draft, setDraft] = useState({ title: '', outcome: '', targetDate: '', type: 'quarterly' });
  const [weeklyBaseline, setWeeklyBaseline] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('lockin_goal_weekly_baseline') || 'null');
      if (saved?.week === weekKey()) return saved.values || {};
    } catch {}
    const values = Object.fromEntries(goals.map((goal) => [goal.id, progressForGoal(goal, projects)]));
    localStorage.setItem('lockin_goal_weekly_baseline', JSON.stringify({ week: weekKey(), values }));
    return values;
  });

  useEffect(() => {
    localStorage.setItem('lockin_goals', JSON.stringify(goals));
    localStorage.setItem('lockin_goals_unlocked', 'true');
  }, [goals]);

  useEffect(() => {
    const sync = () => setProjects(readProjects());
    window.addEventListener('local-data-updated', sync);
    return () => window.removeEventListener('local-data-updated', sync);
  }, []);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('lockin_goal_weekly_baseline') || 'null');
      if (saved?.week === weekKey()) return;
      const values = Object.fromEntries(goals.map((goal) => [goal.id, progressForGoal(goal, projects)]));
      localStorage.setItem('lockin_goal_weekly_baseline', JSON.stringify({ week: weekKey(), values }));
      setWeeklyBaseline(values);
    } catch {}
  }, [goals, projects]);

  useEffect(() => {
    if (!undoGoal) return undefined;
    const timer = window.setTimeout(() => setUndoGoal(null), 5000);
    return () => window.clearTimeout(timer);
  }, [undoGoal]);

  const visibleGoals = useMemo(() => goals.filter((goal) => period === 'all' || goal.type === period), [goals, period]);

  const createGoal = (event) => {
    event.preventDefault();
    if (!draft.title.trim() || !draft.outcome.trim()) return;
    setGoals((current) => [{ id: Date.now(), title: draft.title.trim(), outcome: draft.outcome.trim(), targetDate: draft.targetDate || 'Set target', type: draft.type }, ...current]);
    setDraft({ title: '', outcome: '', targetDate: '', type: 'quarterly' });
    setShowAdd(false);
  };

  const openProject = (project) => {
    if (project) localStorage.setItem('lockin_open_project_id', String(project.id));
    onOpenProject?.(project);
  };

  const deleteGoal = (goal) => {
    setUndoGoal({ goal, index: goals.findIndex((item) => item.id === goal.id) });
    setGoals((current) => current.filter((item) => item.id !== goal.id));
  };

  return <div className="mx-auto max-w-5xl space-y-6 px-4 py-5 sm:px-6">
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[#e9e7e1] pb-5">
      <div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#249653]">Outcomes</p><h1 className="mt-1 text-3xl font-extrabold tracking-[-.035em] text-[#17211b] dark:text-white">Goals</h1><p className="mt-1 text-sm text-[#748078]">Goals explain why. Projects organize how. Focus decides what happens now.</p></div>
      <button type="button" onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 rounded-xl bg-[#17211b] px-4 py-2.5 text-xs font-bold text-white transition-transform duration-200 active:scale-95"><Plus className="h-4 w-4" />New outcome</button>
    </header>

    <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex rounded-xl bg-[#f0efeb] p-1">{[['all','All'],['daily','Daily'],['weekly','Weekly'],['monthly','Monthly'],['quarterly','Quarterly']].map(([value,label]) => <button key={value} type="button" onClick={() => setPeriod(value)} className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition-colors duration-200 ${period === value ? 'bg-white text-[#17211b] shadow-[0_1px_2px_rgba(34,51,39,.06)]' : 'text-[#748078] hover:text-[#17211b]'}`}>{label}</button>)}</div><div className="hidden items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.12em] text-[#748078] sm:flex"><span>Goal</span><ChevronRight className="h-3 w-3" /><span>Project</span><ChevronRight className="h-3 w-3" /><span>Milestone</span><ChevronRight className="h-3 w-3" /><span>Task</span></div></div>

    <section className="grid gap-4 lg:grid-cols-2">{visibleGoals.map((goal) => {
      const linked = projects.filter((project) => String(project.goalId) === String(goal.id));
      const tasks = linked.flatMap(projectTasks);
      const complete = tasks.filter((task) => task.done).length;
      const progress = tasks.length ? Math.round(complete / tasks.length * 100) : Number(goal.progress || 0);
      const nextProject = linked.find((project) => projectTasks(project).some((task) => !task.done)) || linked[0];
      const nextMilestone = nextProject?.milestones?.find((milestone) => (milestone.tasks || []).some((task) => !task.done)) || nextProject?.milestones?.[0];
      const nextAction = nextMilestone?.tasks?.find((task) => !task.done);
      const completedTasks = tasks.filter((task) => task.done);
      const movement = Math.max(0, progress - Number(weeklyBaseline[goal.id] ?? progress));
      return <article key={goal.id} className="group rounded-2xl border border-[#e9e7e1] bg-white p-5 shadow-[0_1px_2px_rgba(34,51,39,.035)] transition-[border-color,box-shadow] duration-200 hover:border-[#cfe9d7] hover:shadow-[0_5px_16px_rgba(34,51,39,.06)] dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4"><div className="min-w-0"><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.14em] text-[#249653]"><Target className="h-3.5 w-3.5" />Outcome</div><h2 className="mt-2 text-xl font-extrabold tracking-tight text-[#17211b] dark:text-white">{goal.title}</h2><p className="mt-1.5 text-sm leading-relaxed text-[#748078]">{goal.outcome}</p></div><button type="button" onClick={() => deleteGoal(goal)} className="rounded-lg p-2 text-slate-300 opacity-0 transition duration-200 hover:bg-[#fff1f0] hover:text-[#ef5350] group-hover:opacity-100" aria-label="Delete goal"><Trash2 className="h-4 w-4" /></button></div>
        <div className="mt-5 flex items-end justify-between"><div><p className="text-3xl font-extrabold tracking-[-.04em] text-[#17211b] dark:text-white">{progress}%</p><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#748078]">complete</p></div><div className="text-right"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#748078]">Target</p><p className="mt-1 flex items-center gap-1 text-xs font-bold text-[#17211b] dark:text-white"><CalendarDays className="h-3.5 w-3.5" />{goal.targetDate}</p></div></div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#f0efeb]"><div className="h-full rounded-full bg-[#4dcd7d] transition-[width] duration-200" style={{ width: `${progress}%` }} /></div>
        <div className="mt-4 flex items-center gap-4 rounded-xl bg-[#fafaf8] px-3 py-2.5 text-[10px] font-bold text-[#748078]"><span className="inline-flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5 text-[#249653]" />{movement ? `+${movement}% this week` : 'Ready for first progress'}</span><span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" />{complete} task{complete === 1 ? '' : 's'} finished</span></div>
        {completedTasks.length > 0 && <div className="mt-3 border-l-2 border-[#cfe9d7] pl-3"><p className="text-[9px] font-bold uppercase tracking-[.1em] text-[#748078]">Latest movement</p><p className="mt-1 truncate text-xs font-semibold text-[#17211b] dark:text-white">Completed “{completedTasks[completedTasks.length - 1].title}”</p></div>}
        <div className="mt-5 border-t border-[#efede8] pt-4"><div className="flex items-center gap-2"><Flag className="h-4 w-4 text-[#748078]" /><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[.1em] text-[#748078]">Next milestone</p><p className="truncate text-sm font-bold text-[#17211b] dark:text-white">{nextMilestone?.title || 'Connect a project to create the path'}</p>{nextAction && <p className="mt-1 truncate text-[11px] font-medium text-[#748078]">Next: {nextAction.title}</p>}</div></div><button type="button" onClick={() => openProject(nextProject)} className="mt-4 inline-flex max-w-full items-center gap-2 rounded-xl bg-[#17211b] px-3.5 py-2.5 text-xs font-bold text-white transition-transform duration-200 active:scale-95"><span className="truncate">{nextAction ? `Continue: ${nextAction.title}` : nextProject ? 'Open project' : 'Create project'}</span><ArrowRight className="h-3.5 w-3.5 shrink-0" /></button></div>
      </article>;
    })}</section>

    {visibleGoals.length === 0 && <div className="rounded-2xl border border-dashed border-[#d9d6ce] py-14 text-center"><Target className="mx-auto h-6 w-6 text-[#748078]" /><p className="mt-3 text-sm font-bold text-[#17211b]">No outcomes in this horizon yet.</p><button type="button" onClick={() => setShowAdd(true)} className="mt-2 text-xs font-bold text-[#249653]">Create one meaningful goal</button></div>}

    {showAdd && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/25 p-4 backdrop-blur-sm" onMouseDown={() => setShowAdd(false)}><form onSubmit={createGoal} onMouseDown={(event) => event.stopPropagation()} className="w-full max-w-md rounded-2xl border border-[#e9e7e1] bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,.18)]"><div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.14em] text-[#249653]">New outcome</p><h2 className="mt-1 text-xl font-extrabold text-[#17211b]">What will be different?</h2></div><button type="button" onClick={() => setShowAdd(false)} className="rounded-lg p-2 text-[#748078] hover:bg-[#faf9f6]"><X className="h-4 w-4" /></button></div><div className="mt-5 space-y-3"><input autoFocus value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Launch Lock In publicly" className="w-full rounded-xl border border-[#e9e7e1] px-4 py-3 text-sm font-bold outline-none focus:border-[#4dcd7d]" /><textarea value={draft.outcome} onChange={(event) => setDraft({ ...draft, outcome: event.target.value })} placeholder="Describe the result, not the task list." rows="3" className="w-full resize-none rounded-xl border border-[#e9e7e1] px-4 py-3 text-sm outline-none focus:border-[#4dcd7d]" /><div className="grid grid-cols-2 gap-3"><input value={draft.targetDate} onChange={(event) => setDraft({ ...draft, targetDate: event.target.value })} placeholder="Target date" className="rounded-xl border border-[#e9e7e1] px-3 py-2.5 text-sm outline-none focus:border-[#4dcd7d]" /><select value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value })} className="rounded-xl border border-[#e9e7e1] px-3 py-2.5 text-sm outline-none"><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option></select></div></div><button className="mt-5 w-full rounded-xl bg-[#17211b] py-3 text-sm font-bold text-white transition-transform duration-200 active:scale-[.98]">Create outcome</button></form></div>}
    {undoGoal && <div className="fixed bottom-6 left-1/2 z-[110] flex -translate-x-1/2 items-center gap-4 rounded-xl bg-[#17211b] px-4 py-3 text-xs font-bold text-white shadow-xl"><span>Goal removed</span><button type="button" onClick={() => { setGoals((current) => { const next = [...current]; next.splice(Math.max(0, undoGoal.index), 0, undoGoal.goal); return next; }); setUndoGoal(null); }} className="inline-flex items-center gap-1.5 text-[#7ee2a0]"><RotateCcw className="h-3.5 w-3.5" />Undo</button></div>}
  </div>;
};

GoalsTab.propTypes = { onOpenProject: PropTypes.func };

export default GoalsTab;
