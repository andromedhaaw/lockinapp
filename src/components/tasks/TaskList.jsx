import { useState, useEffect } from 'react';
import { Plus, CheckSquare } from 'lucide-react';
import confetti from 'canvas-confetti';
import TaskItem from './TaskItem';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const TaskList = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTime, setNewTime] = useState('');

  // Load tasks from API
  useEffect(() => {
    if (!user) return;
    const fetchTasks = async () => {
      try {
        const res = await api.get('/tasks');
        setTasks(res.data);
      } catch (error) {
        console.error("Failed to load tasks", error);
      }
    };
    fetchTasks();
  }, [user]);

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;

    try {
      const res = await api.post('/tasks', {
        name: newTaskName.trim(),
        estimatedTime: newTime.trim()
      });
      setTasks([res.data, ...tasks]);
      setNewTaskName('');
      setNewTime('');
    } catch (error) {
      console.error("Failed to add task", error);
    }
  };

  const toggleTask = async (id) => {
    // Find task to get current status
    const task = tasks.find(t => t.id === id || t._id === id); 
    // Mongo uses _id, but let's handle both for safety if mixed
    const taskId = task._id || task.id;
    
    // Optimistic update
    const isCompleting = !task.completed;
    
    setTasks(tasks.map(t => {
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
        await api.patch(`/tasks/${taskId}`, { completed: isCompleting });
    } catch (error) {
        console.error("Failed to update task", error);
        // Revert optimization if needed, but for now log error
    }
  };

  const deleteTask = async (id) => {
    const task = tasks.find(t => t.id === id || t._id === id);
    const taskId = task._id || task.id;

    // Optimistic
    setTasks(tasks.filter(t => t._id !== taskId && t.id !== taskId));

    try {
      await api.delete(`/tasks/${taskId}`);
    } catch (error) {
      console.error("Failed to delete task", error);
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
      </div>

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
          <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
            No tasks yet. Add one above!
          </div>
        )}
      </div>

      <form onSubmit={addTask} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 space-y-3">
        <div>
          <input
            type="text"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border-transparent focus:bg-white dark:focus:bg-gray-600 focus:border-green-500 focus:ring-0 transition-colors text-sm dark:text-white dark:placeholder-gray-400"
          />
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            placeholder="Est. time (e.g. 30m)"
            className="flex-1 px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border-transparent focus:bg-white dark:focus:bg-gray-600 focus:border-green-500 focus:ring-0 transition-colors text-sm dark:text-white dark:placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={!newTaskName.trim()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:hover:bg-green-600 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskList;
