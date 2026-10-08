import { useState, useEffect } from 'react';
import { Plus, CheckSquare, Timer, Dices, Sparkles, X, Lightbulb } from 'lucide-react';
import confetti from 'canvas-confetti';
import TaskItem from './TaskItem';
import TaskSpinnerModal from './TaskSpinnerModal';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const TaskList = ({ onFocus }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState(() => {
    // Initial load from localStorage for instant result
    const stored = localStorage.getItem('lockin_tasks_offline');
    return stored ? JSON.parse(stored) : [];
  });
  const [newTaskName, setNewTaskName] = useState('');
  const [newTime, setNewTime] = useState('');
  const [showSpinnerModal, setShowSpinnerModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Sync to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('lockin_tasks_offline', JSON.stringify(tasks));
  }, [tasks]);

  // Load tasks from API but don't overwrite if failed
  useEffect(() => {
    if (!user) return;
    const fetchTasks = async () => {
      try {
        const res = await api.get('/tasks');
        if (res.data && Array.isArray(res.data)) {
          setTasks(res.data);
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

    const newTask = {
      id: Date.now().toString(), // Temporary ID for frontend
      name: newTaskName.trim(),
      estimatedTime: newTime.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };

    // Update UI immediately (Local First)
    setTasks(prev => [newTask, ...prev]);
    setNewTaskName('');
    setNewTime('');

    // Try to sync with BE in background
    try {
      const res = await api.post('/tasks', newTask);
      // Update with server ID if successful
      setTasks(prev => prev.map(t => t.id === newTask.id ? res.data : t));
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
         if (isCompleting) {
           confetti({
             particleCount: 100,
             spread: 70,
             origin: { y: 0.6 }
           });
         }
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
      await api.delete(`/tasks/${id}`);
    } catch (error) {
      console.warn("Failed to sync delete to backend", error);
    }
  };

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  const setEnergy = (energy) => { setTasks(prev => prev.map(t => (t.id === selectedTask?.id || t._id === selectedTask?._id) ? { ...t, energy } : t)); setSelectedTask(prev => prev ? { ...prev, energy } : prev); };
  const smallestStep = selectedTask ? `Open a blank document and start ${selectedTask.name.toLowerCase()}.` : '';
  const breakdown = selectedTask ? [`Open what you need for “${selectedTask.name}”`, 'Write three rough ideas', 'Choose the strongest idea', `Finish the first small part of ${selectedTask.name.toLowerCase()}`] : [];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
          <CheckSquare className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-green-800 dark:text-green-400">Tasks</h2>
        <p className="text-green-600 dark:text-green-400 text-sm">Manage your daily goals</p>
        <div className="text-[10px] text-gray-400 mt-1">
          User: {user ? user.email : 'Not logged in'} | Tasks: {tasks.length}
        </div>
      </div>

      <form onSubmit={addTask} className="bg-white dark:bg-slate-900/50 p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 space-y-2.5 mb-8 relative z-10">
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
        <div className="flex gap-2">
          <div className="relative flex-1">
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
          <button
            type="submit"
            className="px-5 py-2.5 bg-green-600 dark:bg-green-500 text-white rounded-xl hover:bg-green-700 dark:hover:bg-green-600 active:scale-95 transition-all flex items-center gap-1.5 text-sm font-bold shadow-md shadow-green-500/10"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </form>

      {/* ADHD Anti-Overwhelm: Spinner Wheel Trigger */}
      {activeTasks.length > 0 && (
        <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-emerald-500/10 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-emerald-950/20 rounded-2xl border border-amber-200/60 dark:border-amber-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-500 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-800 dark:text-gray-200">
                Bingung mulai tugas yang mana?
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400">
                Pilih task dengan cara fun lewat Spinner Wheel! 🎡
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowSpinnerModal(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-bold shadow-md shadow-pink-500/20 active:scale-95 transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Spinner Wheel ({activeTasks.length})</span>
          </button>
        </div>
      )}

      <div className="space-y-4">
        {activeTasks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between pl-1">
              <h3 className="text-xs font-semibold text-green-800 dark:text-green-400 uppercase tracking-wider">To Do</h3>
            </div>
            <div className="space-y-2">
              {activeTasks.map(task => (
                <TaskItem 
                  key={task._id || task.id} 
                  task={task} 
                  onToggle={toggleTask} 
                  onDelete={deleteTask}
                  onFocus={onFocus}
                  onOpen={setSelectedTask}
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
