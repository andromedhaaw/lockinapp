import { useState, useEffect } from 'react';
import { Plus, CheckSquare, Timer } from 'lucide-react';
import confetti from 'canvas-confetti';
import TaskItem from './TaskItem';
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

      <div className="space-y-4">
        {activeTasks.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-green-800 dark:text-green-400 uppercase tracking-wider pl-1">To Do</h3>
            <div className="space-y-2">
              {activeTasks.map(task => (
                <TaskItem 
                  key={task._id || task.id} 
                  task={task} 
                  onToggle={toggleTask} 
                  onDelete={deleteTask}
                  onFocus={onFocus}
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

    </div>
  );
};

export default TaskList;
