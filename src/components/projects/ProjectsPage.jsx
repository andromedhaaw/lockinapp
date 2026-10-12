import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, Check, ChevronRight, Circle, Flag, GripVertical, Play, Plus, RotateCcw, Target } from 'lucide-react';

const starter = [
  { id: 'launch', name: 'Product launch', goalId: 1, goalTitle: 'Build a repeatable launch engine', outcome: 'Ship a calm, focused launch', deadline: 'Oct 30', status: 'In progress', priority: 'High', milestones: [{ id: 'launch-prep', title: 'Launch preparation', deadline: 'Oct 24', tasks: [{ id: 1, title: 'Write launch announcement', done: false, minutes: 45, subtasks: [{ id: '1a', title: 'Draft the opening', done: false }, { id: '1b', title: 'Add the launch CTA', done: false }] }, { id: 2, title: 'Review launch metrics', done: true, minutes: 30, subtasks: [] }] }] },
  { id: 'antartica', name: 'Antartica', goalId: 2, goalTitle: 'Turn research into a clear expedition', outcome: 'Plan the next expedition clearly', deadline: 'Nov 14', status: 'Planned', priority: 'Medium', milestones: [{ id: 'route', title: 'Research and route', deadline: 'Nov 07', tasks: [{ id: 3, title: 'Collect route references', done: false, minutes: 30, subtasks: [] }, { id: 4, title: 'Draft the first plan', done: false, minutes: 45, subtasks: [] }] }] },
  { id: 'hail-mary', name: 'Hail Mary', goalId: 1, goalTitle: 'Validate one ambitious bet', outcome: 'Turn the ambitious idea into a first step', deadline: 'Dec 01', status: 'Inbox', priority: 'High', milestones: [{ id: 'brief', title: 'Define the outcome', deadline: 'Nov 20', tasks: [{ id: 5, title: 'Write the project brief', done: false, minutes: 25, subtasks: [{ id: '5a', title: 'Write the problem in one sentence', done: false }] }] }] },
];

const normalizeProject = (project, index) => ({
  ...project,
  goalId: project.goalId || (index % 2) + 1,
  goalTitle: project.goalTitle || project.goal || 'Define the outcome',
  outcome: project.outcome || project.goal || 'Define the outcome for this project',
  milestones: project.milestones || [{ id: `${project.id}-milestone`, title: project.milestone || 'First milestone', deadline: project.deadline, tasks: (project.tasks || []).map((task) => ({ ...task, subtasks: task.subtasks || [] })) }],
});

const allTasks = (project) => (project?.milestones || []).flatMap((milestone) => milestone.tasks || []);

const ProjectsPage = ({ onStartFocus }) => {
  const [projects, setProjects] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('lockin_projects') || 'null');
      const source = saved?.length ? saved : starter;
      const normalized = source.map(normalizeProject);
      const missing = starter.filter((seed) => !normalized.some((project) => project.id === seed.id));
      return [...normalized, ...missing];
    } catch { return starter; }
  });
  const [activeId, setActiveId] = useState(projects[0]?.id);
  const [newProject, setNewProject] = useState('');
  const [newTask, setNewTask] = useState('');
  const [draggedTask, setDraggedTask] = useState(null);
  const [undoState, setUndoState] = useState(null);
  const active = projects.find((project) => project.id === activeId) || projects[0];

  useEffect(() => {
    localStorage.setItem('lockin_projects', JSON.stringify(projects));
    window.dispatchEvent(new Event('local-data-updated'));
  }, [projects]);
  useEffect(() => {
    if (!undoState) return undefined;
    const timeout = window.setTimeout(() => setUndoState(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [undoState]);

  const activeTasks = useMemo(() => allTasks(active), [active]);
  const completed = activeTasks.filter((task) => task.done).length;
  const progress = activeTasks.length ? Math.round((completed / activeTasks.length) * 100) : 0;
  const nextMilestone = active?.milestones.find((milestone) => milestone.tasks.some((task) => !task.done)) || active?.milestones[0];
  const nextAction = nextMilestone?.tasks.find((task) => !task.done);

  const commit = (label, updater) => {
    setProjects((current) => {
      setUndoState({ label, projects: current });
      return updater(current);
    });
  };
  const updateActive = (updater, label = 'Project updated') => commit(label, (current) => current.map((project) => project.id === active?.id ? updater(project) : project));
  const addProject = (event) => {
    event.preventDefault();
    if (!newProject.trim()) return;
    const project = normalizeProject({ id: Date.now().toString(), name: newProject.trim(), goalTitle: 'Define the outcome', outcome: 'Define the outcome for this project', deadline: 'Set deadline', status: 'Inbox', priority: 'Medium', milestones: [{ id: `milestone-${Date.now()}`, title: 'First milestone', deadline: 'Set deadline', tasks: [] }] }, projects.length);
    commit('Project created', (current) => [project, ...current]);
    setActiveId(project.id);
    setNewProject('');
  };
  const addTask = (event) => {
    event.preventDefault();
    if (!newTask.trim() || !active || !nextMilestone) return;
    updateActive((project) => ({ ...project, milestones: project.milestones.map((milestone) => milestone.id === nextMilestone.id ? { ...milestone, tasks: [...milestone.tasks, { id: Date.now(), title: newTask.trim(), done: false, minutes: 25, subtasks: [] }] } : milestone) }), 'Task added');
    setNewTask('');
  };
  const toggleTask = (milestoneId, taskId) => updateActive((project) => ({ ...project, milestones: project.milestones.map((milestone) => milestone.id === milestoneId ? { ...milestone, tasks: milestone.tasks.map((task) => task.id === taskId ? { ...task, done: !task.done } : task) } : milestone) }), 'Task completion changed');
  const toggleSubtask = (milestoneId, taskId, subtaskId) => updateActive((project) => ({ ...project, milestones: project.milestones.map((milestone) => milestone.id === milestoneId ? { ...milestone, tasks: milestone.tasks.map((task) => task.id === taskId ? { ...task, subtasks: task.subtasks.map((subtask) => subtask.id === subtaskId ? { ...subtask, done: !subtask.done } : subtask) } : task) } : milestone) }), 'Subtask completion changed');
  const editDuration = (milestoneId, task) => {
    const value = window.prompt('Estimated minutes', String(task.minutes || 25));
    if (value === null) return;
    const minutes = Math.max(5, Number(value) || 25);
    updateActive((project) => ({ ...project, milestones: project.milestones.map((milestone) => milestone.id === milestoneId ? { ...milestone, tasks: milestone.tasks.map((item) => item.id === task.id ? { ...item, minutes } : item) } : milestone) }), 'Estimate updated');
  };
  const reorderTask = (milestoneId, targetId) => {
    if (!draggedTask || draggedTask.milestoneId !== milestoneId || draggedTask.taskId === targetId) return;
    updateActive((project) => ({ ...project, milestones: project.milestones.map((milestone) => {
      if (milestone.id !== milestoneId) return milestone;
      const tasks = [...milestone.tasks];
      const from = tasks.findIndex((task) => task.id === draggedTask.taskId);
      const to = tasks.findIndex((task) => task.id === targetId);
      const [moved] = tasks.splice(from, 1);
      tasks.splice(to, 0, moved);
      return { ...milestone, tasks };
    }) }), 'Task moved');
    setDraggedTask(null);
  };
  const startFocus = (task) => onStartFocus?.({ ...task, name: task.title, estimatedTime: `${task.minutes || 25}m`, tag: active?.name, smallestStep: task.subtasks?.find((subtask) => !subtask.done)?.title });

  return <div className="mx-auto max-w-7xl space-y-7 bg-[#fbfcfb] p-4 sm:p-8">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#249653]">Execution workspace</p><h1 className="li-heading mt-2 text-3xl">Projects</h1><p className="mt-1 text-sm text-slate-500">Goals define the outcome. Projects turn it into the next action.</p></div><form onSubmit={addProject} className="flex gap-2"><input value={newProject} onChange={(event) => setNewProject(event.target.value)} placeholder="New project" className="w-44 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#4dcd7d] dark:border-slate-700 dark:bg-slate-900 dark:text-white" /><button className="li-motion rounded-xl bg-[#4dcd7d] px-4 py-2.5 text-xs font-black text-slate-950 hover:-translate-y-0.5 active:scale-95"><Plus className="mr-1 inline h-4 w-4" />Create</button></form></header>

    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{projects.map((project) => {
      const tasks = allTasks(project);
      const done = tasks.filter((task) => task.done).length;
      const percentage = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
      const milestone = project.milestones.find((item) => item.tasks.some((task) => !task.done)) || project.milestones[0];
      const action = milestone?.tasks.find((task) => !task.done);
      return <button key={project.id} type="button" onClick={() => setActiveId(project.id)} className={`li-card li-motion group border p-5 text-left ${project.id === active?.id ? 'border-[#4dcd7d] bg-[#f4fbf6]' : 'border-slate-200 bg-white hover:-translate-y-1 hover:border-[#bcebc9] dark:border-slate-800 dark:bg-slate-900'}`}><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[.14em] text-[#249653]"><Target className="h-3 w-3" />{project.goalTitle}</div><h2 className="mt-2 text-lg font-black text-slate-900 dark:text-white">{project.name}</h2></div><ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#249653]" /></div><p className="mt-2 min-h-10 text-sm leading-relaxed text-slate-500">{project.outcome}</p><div className="mt-4 flex items-center justify-between text-[11px] font-bold"><span className="text-slate-400">{percentage}% complete</span><span className="text-slate-500">{project.deadline}</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-[#4dcd7d] transition-[width] duration-200" style={{ width: `${percentage}%` }} /></div><div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800"><p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Next milestone</p><p className="mt-1 text-xs font-bold text-slate-700 dark:text-slate-200">{milestone?.title || 'Add a milestone'}</p><p className="mt-2 truncate text-xs text-[#249653]">Next: {action?.title || 'Project complete'}</p></div></button>;
    })}</section>

    {active && <section className="li-card border border-slate-200 bg-white p-5 sm:p-7 dark:border-slate-800 dark:bg-slate-900"><div className="flex flex-wrap items-start justify-between gap-5"><div><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.16em] text-slate-400"><span>Goal</span><ChevronRight className="h-3 w-3" /><span>Project</span><ChevronRight className="h-3 w-3" /><span>Milestone</span></div><h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 dark:text-white">{active.name}</h2><p className="mt-1 text-sm text-slate-500">{active.outcome}</p></div><div className="flex items-center gap-4"><div className="text-right"><div className="text-3xl font-black text-[#249653]">{progress}%</div><div className="text-[9px] font-black uppercase tracking-wider text-slate-400">complete</div></div>{nextAction && <button type="button" onClick={() => startFocus(nextAction)} className="li-motion inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-black text-white hover:-translate-y-0.5 active:scale-95"><Play className="h-4 w-4 fill-current" />Start next action</button>}</div></div><div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800"><p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Outcome</p><p className="mt-1 text-sm font-bold text-slate-700 dark:text-slate-200">{active.goalTitle}</p></div><div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800"><p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Next milestone</p><p className="mt-1 text-sm font-bold text-slate-700 dark:text-slate-200">{nextMilestone?.title}</p></div><div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800"><p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Deadline</p><p className="mt-1 flex items-center gap-1 text-sm font-bold text-slate-700 dark:text-slate-200"><CalendarDays className="h-4 w-4" />{active.deadline}</p></div></div>

      <div className="mt-7 space-y-5">{active.milestones.map((milestone) => <section key={milestone.id}><div className="flex items-center gap-2"><Flag className="h-4 w-4 text-[#249653]" /><h3 className="text-sm font-black text-slate-800 dark:text-white">{milestone.title}</h3><span className="ml-auto text-[10px] font-bold text-slate-400">{milestone.deadline}</span></div><div className="mt-3 space-y-2">{milestone.tasks.map((task) => <article key={task.id} draggable onDragStart={() => setDraggedTask({ milestoneId: milestone.id, taskId: task.id })} onDragOver={(event) => event.preventDefault()} onDrop={() => reorderTask(milestone.id, task.id)} className="group rounded-2xl border border-transparent bg-slate-50 p-3 transition duration-200 hover:border-slate-200 hover:bg-white hover:shadow-sm dark:bg-slate-800/60 dark:hover:border-slate-700 dark:hover:bg-slate-800"><div className="flex items-center gap-3"><GripVertical className="h-4 w-4 cursor-grab text-slate-300" /><button type="button" onClick={() => toggleTask(milestone.id, task.id)} className={`flex h-5 w-5 items-center justify-center rounded-full transition duration-200 ${task.done ? 'bg-[#4dcd7d] text-white' : 'border border-slate-300 text-transparent hover:border-[#4dcd7d]'}`}>{task.done ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <Circle className="h-3.5 w-3.5" />}</button><button type="button" className={`min-w-0 flex-1 text-left text-sm font-semibold ${task.done ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>{task.title}</button><button type="button" onClick={() => editDuration(milestone.id, task)} className="rounded-lg bg-white px-2 py-1 text-xs font-bold text-slate-400 transition hover:text-[#249653] dark:bg-slate-900">{task.minutes}m</button><button type="button" onClick={() => startFocus(task)} className="rounded-lg p-2 text-slate-300 opacity-0 transition duration-200 hover:bg-[#eaf8ee] hover:text-[#249653] group-hover:opacity-100" title="Start focus"><Play className="h-4 w-4 fill-current" /></button></div>{task.subtasks?.length > 0 && <div className="ml-12 mt-2 space-y-1 border-l border-slate-200 pl-3 dark:border-slate-700">{task.subtasks.map((subtask) => <button key={subtask.id} type="button" onClick={() => toggleSubtask(milestone.id, task.id, subtask.id)} className={`flex w-full items-center gap-2 py-1 text-left text-xs ${subtask.done ? 'text-slate-400 line-through' : 'text-slate-500'}`}><span className={`h-3 w-3 rounded-full border ${subtask.done ? 'border-[#4dcd7d] bg-[#4dcd7d]' : 'border-slate-300'}`} />{subtask.title}</button>)}</div>}</article>)}</div></section>)}</div>
      <form onSubmit={addTask} className="mt-5 flex gap-2"><input value={newTask} onChange={(event) => setNewTask(event.target.value)} placeholder="Add task to next milestone" className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#4dcd7d] dark:border-slate-700 dark:bg-slate-800 dark:text-white" /><button className="rounded-xl border border-[#bcebc9] px-4 py-2 text-xs font-black text-[#249653]"><Plus className="mr-1 inline h-3.5 w-3.5" />Add</button></form>
    </section>}

    {undoState && <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-2xl bg-slate-950 px-4 py-3 text-xs font-bold text-white shadow-2xl"><span>{undoState.label}</span><button type="button" onClick={() => { setProjects(undoState.projects); setUndoState(null); }} className="inline-flex items-center gap-1 text-[#7ee2a0]"><RotateCcw className="h-3.5 w-3.5" />Undo</button></div>}
  </div>;
};

export default ProjectsPage;
