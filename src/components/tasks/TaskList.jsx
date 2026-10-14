import { useState, useEffect } from 'react';
import { Plus, CheckSquare, Timer, X, Lightbulb, Leaf, ChevronDown, Dices } from 'lucide-react';
import TaskItem from './TaskItem';
import TaskSpinnerModal from './TaskSpinnerModal';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DEMO_TASK_NAMES = [
  'Review the launch brief',
  'Reply to customer follow-ups',
  'Prepare tomorrow\'s focus plan',
  'Clean up the project board',
  'Write the first draft',
];

const normalizeTasks = (items) => {
  const list = Array.isArray(items) ? items : [];
  const usedIds = new Set();
  const allHaveSameName = list.length > 1 && list.every((task) => task.name && task.name === list[0].name);
  return list.map((task, index) => {
    let id = task.id || task._id;
    if (!id || usedIds.has(String(id))) id = `local-task-${index}-${Date.now()}`;
    usedIds.add(String(id));
    return {
      ...task,
      id,
      name: allHaveSameName ? DEMO_TASK_NAMES[index % DEMO_TASK_NAMES.length] : (task.name || 'Untitled task'),
      completed: allHaveSameName ? (index === list.length - 1 ? true : !!task.completed) : !!task.completed,
      microtasks: Array.isArray(task.microtasks) ? task.microtasks : [],
    };
  });
};

const TaskList = ({ onFocus }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState(() => {
    // Initial load from localStorage for instant result
    const stored = localStorage.getItem('lockin_tasks_offline');
    return stored ? normalizeTasks(JSON.parse(stored)) : [];
  });
  const [newTaskName, setNewTaskName] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newUrgency, setNewUrgency] = useState('Medium');
  const [newDeadline, setNewDeadline] = useState('');
  const [newMicrotask, setNewMicrotask] = useState('');
  const [newMicrotasks, setNewMicrotasks] = useState([]);
  const [showSpinnerModal, setShowSpinnerModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [sortBy, setSortBy] = useState('deadline');
  const [editingTask, setEditingTask] = useState(false);
  const [editDraft, setEditDraft] = useState(null);

  // Sync to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('lockin_tasks_offline', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    const syncCompletedFocus = () => {
      try { setTasks(normalizeTasks(JSON.parse(localStorage.getItem('lockin_tasks_offline') || '[]'))); } catch {}
    };
    window.addEventListener('local-data-updated', syncCompletedFocus);
    return () => window.removeEventListener('local-data-updated', syncCompletedFocus);
  }, []);

  // Load tasks from API but don't overwrite if failed
  useEffect(() => {
    if (!user) return;
    const fetchTasks = async () => {
      try {
        const res = await api.get('/tasks');
        if (res.data && Array.isArray(res.data)) {
          setTasks(normalizeTasks(res.data));
        }
      } catch (error) {
        console.warn("Backend unavailable, using local storage", error);
      }
    };
    fetchTasks();
  }, [user]);

  const addTask = async (e) => {
    if (e) e.preventDefault();
    
    if (!newTaskName.trim()) return;

    const taskId = Date.now().toString();
    const newTask = {
      id: taskId, // Temporary ID for frontend
      name: newTaskName.trim(),
      estimatedTime: newTime.trim(),
      urgency: newUrgency,
      deadline: newDeadline ? new Date(newDeadline).toISOString() : null,
      microtasks: newMicrotasks,
      completed: false,
      createdAt: new Date().toISOString()
    };

    // Update UI immediately (Local First)
    setTasks(prev => [newTask, ...prev]);
    setNewTaskName('');
    setNewTime('');
    setNewUrgency('Medium');
    setNewDeadline('');
    setNewMicrotask('');
    setNewMicrotasks([]);

    // Try to sync with BE in background
    try {
      const res = await api.post('/tasks', newTask);
      // Update with server ID if successful
      setTasks(prev => prev.map(t => t.id === newTask.id ? { ...newTask, ...res.data } : t));
    } catch (error) {
      console.warn("Failed to sync new task to backend", error);
    }
  };

  const toggleTask = async (id) => {
    const task = tasks.find(t => t.id === id || t._id === id); 
    if (!task) return;
    
    const isCompleting = !task.completed;
    
    // Optimistic Update
    setTasks(prev => prev.map(t => {
       if ((t._id === id) || (t.id === id)) {
         return { 
           ...t, 
           completed: isCompleting,
           completedAt: isCompleting ? new Date().toISOString() : null
         };
       }
       return t;
    }));

    try {
        const taskId = task._id || task.id;
        await api.patch(`/tasks/${taskId}`, { completed: isCompleting });
    } catch (error) {
        console.warn("Failed to sync toggle to backend", error);
    }
  };

  const deleteTask = async (id) => {
    // Optimistic Update
    setTasks(prev => prev.filter(t => t._id !== id && t.id !== id));
    try {
      const storedDeadlines = JSON.parse(localStorage.getItem('lockin_deadlines') || '[]');
      localStorage.setItem('lockin_deadlines', JSON.stringify(storedDeadlines.filter(item => item.sourceTaskId !== id && item.id !== `task-${id}`)));
      window.dispatchEvent(new CustomEvent('lockin:deadlines-updated'));
    } catch (error) {
      console.warn('Failed to remove linked deadline locally', error);
    }

    try {
      await api.delete(`/tasks/${id}`);
    } catch (error) {
      console.warn("Failed to sync delete to backend", error);
    }
  };

  const addDraftMicrotask = () => {
    const title = newMicrotask.trim();
    if (!title) return;
    setNewMicrotasks(prev => [...prev, { title, completed: false }]);
    setNewMicrotask('');
  };

  const beginEdit = async (task, updatedTask) => {
    if (updatedTask) {
      setTasks(prev => prev.map(item => (item.id === updatedTask.id || item._id === updatedTask._id) ? updatedTask : item));
      try { await api.patch(`/tasks/${updatedTask._id || updatedTask.id}`, updatedTask); } catch (error) { console.warn('Failed to sync task edits', error); }
      return;
    }
    setSelectedTask(task);
    setEditingTask(true);
    setShowBreakdown(false);
    setEditDraft({
      ...task,
      deadline: task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '',
      microtasks: (task.microtasks || []).map(item => ({ ...item })),
    });
  };

  const saveEdit = async () => {
    if (!editDraft?.name.trim()) return;
    const updated = { ...editDraft, name: editDraft.name.trim(), deadline: editDraft.deadline ? new Date(editDraft.deadline).toISOString() : null };
    setTasks(prev => prev.map(task => (task.id === updated.id || task._id === updated._id) ? updated : task));
    setSelectedTask(updated);
    setEditingTask(false);
    try { await api.patch(`/tasks/${updated._id || updated.id}`, updated); } catch (error) { console.warn('Failed to sync task edits', error); }
  };

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  const totalTasks = tasks.length;
  const completedProgress = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;
  const sortedActiveTasks = [...activeTasks].sort((a, b) => {
    if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
    if (sortBy === 'urgency') {
      const rank = { High: 0, Medium: 1, Low: 2 };
      return (rank[a.urgency] ?? 1) - (rank[b.urgency] ?? 1);
    }
    const aTime = a.deadline ? new Date(a.deadline).getTime() : Number.POSITIVE_INFINITY;
    const bTime = b.deadline ? new Date(b.deadline).getTime() : Number.POSITIVE_INFINITY;
    return aTime - bTime;
  });
  const setEnergy = (energy) => { setTasks(prev => prev.map(t => (t.id === selectedTask?.id || t._id === selectedTask?._id) ? { ...t, energy } : t)); setSelectedTask(prev => prev ? { ...prev, energy } : prev); };
  const smallestStep = selectedTask ? `Open a blank document and start ${selectedTask.name.toLowerCase()}.` : '';
  const breakdown = selectedTask ? [`Open what you need for “${selectedTask.name}”`, 'Write three rough ideas', 'Choose the strongest idea', `Finish the first small part of ${selectedTask.name.toLowerCase()}`] : [];

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="relative w-full border-b border-[#e9e7e1] pb-5 text-left">
        <button
          type="button"
          onClick={() => setZenMode((current) => !current)}
          aria-pressed={zenMode}
          className={`absolute right-0 top-0 inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-all active:scale-95 ${zenMode ? 'border-[#34C759] bg-[#eaf8ee] text-[#249653] shadow-sm dark:bg-[#34C759]/10' : 'border-slate-200 bg-white text-slate-500 hover:border-[#bcebc9] hover:text-[#249653] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'}`}
          title={zenMode ? 'Show deadlines' : 'Hide deadlines'}
        >
          <Leaf className="h-4 w-4" />
          Zen
        </button>
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#249653]">Execution</p>
        <h2 className="mt-1 text-3xl font-extrabold tracking-[-0.035em] text-[#17211b] dark:text-white">Tasks</h2>
        <p className="mt-1 text-sm text-[#748078]">Choose what matters, then make the first step visible.</p>
      </div>

      <form
        onSubmit={addTask}
        className="z-10 w-full space-y-2.5 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/50"
        style={{ position: 'relative', left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '48rem', margin: 0, boxSizing: 'border-box' }}
      >
        <div className="relative">
          <input
            type="text"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            placeholder="Type task name here..."
            className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-gray-50/50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-700/50 focus:border-green-500/50 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all text-sm dark:text-white dark:placeholder-gray-500 font-medium"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 pointer-events-none">
             <CheckSquare className="w-4 h-4" />
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <input
              type="text"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              placeholder="Time (e.g. 5m)"
              className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-gray-50/50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-700/50 focus:border-green-500/50 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all text-sm dark:text-white dark:placeholder-gray-500 font-medium"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 pointer-events-none">
               <Timer className="w-4 h-4" />
            </div>
          </div>
          <select value={newUrgency} onChange={(e) => setNewUrgency(e.target.value)} aria-label="Urgency" className="rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-2.5 text-sm font-normal text-slate-400 outline-none focus:border-green-500/50 dark:border-slate-700/50 dark:bg-slate-800/40 dark:text-slate-400">
            <option value="High">High urgency</option>
            <option value="Medium">Medium urgency</option>
            <option value="Low">Low urgency</option>
          </select>
          <input type="datetime-local" value={newDeadline} onChange={(e) => setNewDeadline(e.target.value)} aria-label="Deadline" className="min-w-0 rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-2.5 text-sm font-normal text-slate-400 outline-none focus:border-green-500/50 dark:border-slate-700/50 dark:bg-slate-800/40 dark:text-slate-400" />
          <button
            type="submit"
            className="shrink-0 justify-center px-5 py-2.5 bg-green-600 dark:bg-green-500 text-white rounded-xl hover:bg-green-700 dark:hover:bg-green-600 active:scale-95 transition-all flex items-center gap-1.5 text-sm font-bold shadow-md shadow-green-500/10"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
        <div className="flex min-w-0 gap-2 border-t border-gray-100 pt-2 dark:border-slate-800">
          <input value={newMicrotask} onChange={(e) => setNewMicrotask(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addDraftMicrotask(); } }} placeholder="Add a microtask (optional)" className="min-w-0 flex-1 rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-2.5 text-sm font-normal text-slate-400 outline-none focus:border-green-500/50 dark:border-slate-700/50 dark:bg-slate-800/40 dark:text-slate-400" />
          <button type="button" onClick={addDraftMicrotask} className="rounded-xl border border-green-100 bg-green-50 px-3 text-xs font-bold text-green-700 hover:bg-green-100 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-300">Add step</button>
        </div>
        {newMicrotasks.length > 0 && <ul className="space-y-1 px-2 text-xs text-slate-500 dark:text-slate-400">{newMicrotasks.map((step, index) => <li key={`${step.title}-${index}`} className="flex items-center gap-2 before:text-green-400 before:content-['•']">{step.title}</li>)}</ul>}
      </form>

      {/* ADHD Anti-Overwhelm: Spinner Wheel Trigger */}
      {activeTasks.length > 0 && (
        <div className="mt-6 flex items-center justify-between rounded-xl border border-[#e9e7e1] bg-[#fbfbf9] p-3.5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#dbe8dc] bg-[#f0fbf3] text-[#249653] dark:border-slate-700 dark:bg-slate-800">
              <Dices className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#17211b] dark:text-gray-200">Need help choosing?</div>
              <div className="text-[11px] text-[#748078] dark:text-gray-400">Let the wheel pick one task.</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowSpinnerModal(true)}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#dfe3de] bg-white px-3 py-2 text-xs font-bold text-[#17211b] transition-colors hover:border-[#aeb7b0] hover:bg-[#f6f7f4] active:bg-[#eef0ec] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <Dices className="w-3.5 h-3.5" />
            <span>Pick for me · {activeTasks.length}</span>
          </button>
        </div>
      )}

      <div className="space-y-4">
        {activeTasks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between pl-1">
              <div className="flex w-full items-center justify-between gap-3"><h3 className="text-xs font-semibold uppercase tracking-wider text-green-800 dark:text-green-400">To Do</h3><label className="flex items-center gap-1 text-[10px] font-semibold text-slate-400"><span>Sort by</span><span className="relative block"><select value={sortBy} onChange={(event) => setSortBy(event.target.value)} style={{ width: 76 }} className="appearance-none rounded-lg border border-slate-200 bg-white px-1.5 py-1.5 pr-5 text-[10px] font-semibold text-slate-500 outline-none transition focus:border-green-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"><option value="deadline">Deadline</option><option value="urgency">Urgency</option><option value="name">Name</option></select><ChevronDown className="pointer-events-none absolute right-1 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" /></span></label></div>
            </div>
            <div className="mb-2 rounded-xl border border-slate-100 bg-white px-3.5 py-3.5 dark:border-slate-800 dark:bg-white"><div className="mb-2 flex items-center justify-between text-[10px] font-semibold text-slate-400"><span>Today’s progress</span><span className="text-green-600">{completedProgress}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#4dcd7d] transition-all duration-300" style={{ width: `${completedProgress}%` }} /></div></div>
            <div className="space-y-2">
              {sortedActiveTasks.map(task => (
                <TaskItem 
                  key={task._id || task.id} 
                  task={task} 
                  onToggle={toggleTask} 
                  onDelete={deleteTask}
                  onFocus={onFocus}
                  onOpen={setSelectedTask}
                  onEdit={beginEdit}
                  zen={zenMode}
                />
              ))}
            </div>
          </div>
        )}

        {completedTasks.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-green-800 dark:text-green-400 uppercase tracking-wider pl-1">Completed</h3>
            <div className="space-y-2 opacity-75">
              {completedTasks.map(task => (
                <TaskItem 
                  key={task._id || task.id} 
                  task={task} 
                  onToggle={toggleTask} 
                  onDelete={deleteTask}
                  onOpen={setSelectedTask}
                  onEdit={beginEdit}
                  zen={zenMode}
                />
              ))}
            </div>
          </div>
        )}

        {tasks.length === 0 && (
          <div className="text-center py-12 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800">
            <div className="text-gray-300 dark:text-gray-700 mb-2 flex justify-center">
              <Plus className="w-12 h-12" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">No tasks found</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Try typing a task name above and clicking 'Add'</p>
          </div>
        )}
      </div>

      {selectedTask && (
        <div className="fixed inset-0 z-[80] flex justify-end bg-slate-950/20 backdrop-blur-[2px]" onClick={() => setSelectedTask(null)}>
          <aside className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl dark:bg-slate-900" onClick={(event) => event.stopPropagation()}>
            {editingTask && editDraft && <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60"><div className="mb-3 text-sm font-black text-slate-800 dark:text-white">Edit task</div><div className="grid gap-3"><input value={editDraft.name} onChange={(e) => setEditDraft(prev => ({ ...prev, name: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white" /><div className="grid grid-cols-2 gap-2"><select value={editDraft.urgency || 'Medium'} onChange={(e) => setEditDraft(prev => ({ ...prev, urgency: e.target.value }))} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"><option>High</option><option>Medium</option><option>Low</option></select><input type="datetime-local" value={editDraft.deadline || ''} onChange={(e) => setEditDraft(prev => ({ ...prev, deadline: e.target.value }))} className="min-w-0 rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white" /></div>{(editDraft.microtasks || []).map((step, index) => <div key={`${step.title}-${index}`} className="flex items-center gap-2"><input type="checkbox" checked={!!(step.completed || step.done)} onChange={() => setEditDraft(prev => ({ ...prev, microtasks: prev.microtasks.map((item, itemIndex) => itemIndex === index ? { ...item, completed: !(item.completed || item.done) } : item) }))} className="accent-green-500" /><input value={step.title} onChange={(e) => setEditDraft(prev => ({ ...prev, microtasks: prev.microtasks.map((item, itemIndex) => itemIndex === index ? { ...item, title: e.target.value } : item) }))} className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white" /></div>)}<button type="button" onClick={() => setEditDraft(prev => ({ ...prev, microtasks: [...(prev.microtasks || []), { title: 'New microtask', completed: false }] }))} className="text-left text-xs font-bold text-[#249653]">+ Add microtask</button><div className="flex justify-end gap-2"><button type="button" onClick={() => setEditingTask(false)} className="rounded-xl px-3 py-2 text-xs font-bold text-slate-500">Cancel</button><button type="button" onClick={saveEdit} className="rounded-xl bg-[#4dcd7d] px-3 py-2 text-xs font-black text-slate-950">Save changes</button></div></div></div>}
            <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#249653]">Task detail</p><h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">{selectedTask.name}</h2><p className="mt-1 text-xs font-bold text-slate-400">Deep Work · {selectedTask.estimatedTime || '30 minutes'}</p></div><button onClick={() => setSelectedTask(null)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-5 w-5" /></button></div>
            <div className="mt-8"><p className="text-sm font-black text-slate-800 dark:text-white">What’s the smallest step?</p><div className="mt-2 rounded-2xl bg-[#f0fbf3] p-4 text-sm font-semibold text-[#249653] dark:bg-[#4dcd7d]/10">{smallestStep}</div></div>
            <div className="mt-6"><p className="text-sm font-black text-slate-800 dark:text-white">Energy</p><div className="mt-2 flex gap-2">{['Low', 'Medium', 'High'].map((energy) => <button key={energy} onClick={() => setEnergy(energy)} className={`rounded-xl px-4 py-2 text-xs font-black transition ${selectedTask.energy === energy ? 'bg-[#4dcd7d] text-slate-950' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'}`}>{energy}</button>)}</div></div>
            <button onClick={() => { onFocus?.({ ...selectedTask, name: smallestStep }); setSelectedTask(null); }} className="mt-8 w-full rounded-xl bg-[#4dcd7d] px-4 py-3 text-sm font-black text-slate-950 shadow-sm transition hover:-translate-y-0.5 active:scale-95">Start smallest step</button>
            <button onClick={() => setShowBreakdown(true)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:border-[#4dcd7d] dark:border-slate-700 dark:text-slate-300"><Lightbulb className="h-4 w-4" /> I don’t know where to start</button>
            {showBreakdown && <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 p-4 dark:border-amber-900/30 dark:bg-amber-950/20"><p className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">Let’s make it smaller</p><ol className="mt-3 space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200">{breakdown.map((step, index) => <li key={step} className="flex gap-2"><span className="text-amber-600">{index + 1}.</span>{step}</li>)}</ol></div>}
          </aside>
        </div>
      )}

      {/* Task Spinner Wheel Modal */}
      <TaskSpinnerModal
        isOpen={showSpinnerModal}
        onClose={() => setShowSpinnerModal(false)}
        tasks={tasks}
        onStartTask={(task, minutes) => {
          if (onFocus) {
            onFocus(task, minutes);
          }
        }}
      />
    </div>
  );
};

export default TaskList;
