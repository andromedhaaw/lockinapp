import { Check, Trash2, Clock, ChevronRight } from 'lucide-react';

const TaskItem = ({ task, onToggle, onDelete, onFocus }) => {
  return (
    <div className={`group flex items-center justify-between p-3 rounded-lg border transition-all ${
      task.completed 
        ? 'bg-green-50 border-green-100 dark:bg-green-900/20 dark:border-green-800' 
        : 'bg-white border-gray-100 dark:bg-slate-900 dark:border-slate-800 hover:border-green-200 dark:hover:border-green-600 hover:shadow-sm'
    }`}>
      <div className="flex items-center gap-3 flex-1">
        <button
          onClick={() => onToggle(task.id)}
          className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
            task.completed
              ? 'bg-green-600 border-green-600 text-white'
              : 'border-gray-300 dark:border-slate-600 hover:border-green-500 text-transparent'
          }`}
        >
          <Check className="w-3.5 h-3.5" strokeWidth={3} />
        </button>
        
        <div className="flex flex-col">
          <span className={`text-sm font-medium transition-colors ${
            task.completed ? 'text-green-800 dark:text-green-400 line-through decoration-green-800/40 dark:decoration-green-400/40' : 'text-gray-700 dark:text-gray-200'
          }`}>
            {task.name}
          </span>
          {task.estimatedTime && (
            <div className={`flex items-center gap-1 text-xs ${
              task.completed ? 'text-green-600/70 dark:text-green-500/70' : 'text-gray-400 dark:text-gray-500'
            }`}>
              <Clock className="w-3 h-3" />
              <span>{task.estimatedTime}</span>
            </div>
          )}
        </div>
      </div>

  <div className="flex items-center">
        <button
          onClick={() => onFocus && onFocus(task)}
          className="flex items-center gap-1 px-2.5 py-1.5 mr-2 rounded-full bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50 transition-colors shadow-sm text-xs font-bold uppercase tracking-wide"
          title="Start task session"
        >
          <span>Start</span>
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => onDelete(task.id)}
          className="text-gray-400 hover:text-red-500 transition-all p-1"
          title="Delete task"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
