import { useState } from 'react';
import { Plus, Trash2, Edit2, GripVertical, CheckSquare, Target, Lightbulb, MessageSquare } from 'lucide-react';
import { Card, Button } from '../ui';

export const ContentManagement = () => {
  const [activeTab, setActiveTab] = useState('tasks');

  const tabs = [
    { id: 'tasks', label: 'Onboarding Templates', icon: CheckSquare },
    { id: 'goals', label: 'Challenges', icon: Target },
    { id: 'tips', label: 'Daily Tips', icon: Lightbulb },
    { id: 'pods', label: 'Pod Templates', icon: MessageSquare },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-green-600 text-white shadow-lg shadow-green-600/20'
                : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
           <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize">
             {activeTab === 'tasks' ? 'Onboarding Task Templates' : `Manage ${activeTab}`}
           </h3>
           <Button className="py-2 px-4 text-sm">
             <Plus className="w-4 h-4" /> Add New
           </Button>
        </div>

        {activeTab === 'tasks' && <TasksManager />}
        {activeTab === 'goals' && <GoalsManager />}
        {activeTab === 'tips' && <TipsManager />}
        {activeTab === 'pods' && <PodsManager />}
      </Card>
    </div>
  );
};

// Sub-components for specific content types
const TasksManager = () => {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Morning Deep Work (90m)" },
    { id: 2, text: "Review Yesterday's Progress" },
    { id: 3, text: "Plan Tomorrow's Priorities" }
  ]);

  const handleDelete = (id) => {
    if (confirm('Delete this template?')) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const handleEdit = (id) => {
    const task = tasks.find(t => t.id === id);
    const newText = prompt('Edit task template:', task.text);
    if (newText) {
      setTasks(tasks.map(t => t.id === id ? { ...t, text: newText } : t));
    }
  };

  return (
    <div className="space-y-3">
      <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-3 rounded-lg text-sm mb-4 flex gap-2">
        <div className="mt-0.5">ℹ️</div>
        <div>
          <strong>Global System Templates:</strong> These tasks are the default suggestions shown to 
          <em> new users</em> when they first join. They help users get started with the "Lock In Method". 
          They do not affect existing users' personal task lists.
        </div>
      </div>

      {tasks.map((task) => (
        <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700/50 group">
          <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
          <div className="flex-1 font-medium text-gray-700 dark:text-gray-300">{task.text}</div>
          <div className="flex gap-2 min-w-[60px] justify-end opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => handleEdit(task.id)}
              className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleDelete(task.id)}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
      
      {tasks.length === 0 && (
        <div className="text-center py-4 text-gray-400 text-sm">No templates found</div>
      )}
    </div>
  );
};

const GoalsManager = () => {
  const [goals, setGoals] = useState([
    { id: 1, title: "50 Hour Week", type: "Weekly", xp: 500 },
    { id: 2, title: "Early Bird", type: "Daily", xp: 100 },
    { id: 3, title: "Weekend Warrior", type: "Special", xp: 300 },
  ]);

  const handleEdit = (id) => {
    alert(`Edit goal ${id} functionality coming soon`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {goals.map((goal) => (
        <div key={goal.id} className="p-4 rounded-xl border border-gray-200 dark:border-slate-700 relative">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-1 rounded">{goal.type}</span>
            <div className="flex gap-1">
              <button 
                onClick={() => handleEdit(goal.id)}
                className="text-gray-400 hover:text-blue-500 p-1"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
          </div>
          <h4 className="font-bold text-gray-900 dark:text-white mb-1">{goal.title}</h4>
          <p className="text-sm text-gray-500">{goal.xp} XP Reward</p>
        </div>
      ))}
    </div>
  );
};

const TipsManager = () => (
  <div className="space-y-4">
    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 rounded-xl">
      <h4 className="font-bold text-yellow-800 dark:text-yellow-500 mb-2">Editor's Pick</h4>
      <textarea className="w-full bg-white dark:bg-slate-900 border border-yellow-200 dark:border-yellow-900/50 rounded-lg p-3 text-sm" rows="3" defaultValue="Deep work is the ability to focus without distraction on a cognitively demanding task." />
      <div className="flex justify-end mt-2">
        <Button variant="primary" className="py-1 px-3 text-xs">Save Update</Button>
      </div>
    </div>
  </div>
);

const PodsManager = () => (
  <div className="text-center py-8 text-gray-500">
    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
    <p>Manage default accountability pod templates here.</p>
  </div>
);
