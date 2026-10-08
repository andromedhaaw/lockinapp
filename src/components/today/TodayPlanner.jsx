import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Calendar as CalendarIcon,
  Users,
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  PanelLeft,
  PanelRight,
  Flag,
  Repeat,
  Link2,
  Clock,
  ArrowUpDown,
  ListTodo,
  Target,
  Folder,
  Trash2,
  Play,
  X,
  ExternalLink,
  Sparkles,
  CheckSquare
} from 'lucide-react';

// Format minutes to H:MM string (e.g. 190 -> "3:10", 30 -> "0:30")
const formatMinutes = (totalMinutes) => {
  if (isNaN(totalMinutes) || totalMinutes <= 0) return '0:00';
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${hours}:${mins < 10 ? '0' : ''}${mins}`;
};

// Initial state data accurately modeled after the user's reference screenshot
const INITIAL_BRAIN_DUMP = [
  {
    id: 'bd-1',
    title: 'Reading list for the flight',
    tag: 'Personal',
    tagColor: 'green',
    duration: '0:15',
    minutes: 15,
    completed: false,
    icons: ['flag', 'repeat', 'link'],
    isActive: true, // Selected card highlight from screenshot
  },
  {
    id: 'bd-2',
    title: 'Book a physio appointment',
    tag: 'Personal',
    tagColor: 'green',
    duration: '0:10',
    minutes: 10,
    completed: false,
    icons: [],
  },
  {
    id: 'bd-3',
    title: 'Look at the new office space',
    tag: 'Admin',
    tagColor: 'orange',
    duration: '0:30',
    minutes: 30,
    completed: false,
    icons: [],
  },
  {
    id: 'bd-4',
    title: 'Try a referral program',
    tag: 'Deep Work',
    tagColor: 'blue',
    duration: '0:30',
    minutes: 30,
    completed: false,
    icons: [],
  },
  {
    id: 'bd-5',
    title: 'Experiment with annual pricing',
    tag: 'Deep Work',
    tagColor: 'blue',
    duration: '1:00',
    minutes: 60,
    completed: false,
    icons: [],
  },
  {
    id: 'bd-6',
    title: 'Restart the changelog newsletter',
    tag: 'Deep Work',
    tagColor: 'blue',
    duration: '0:45',
    minutes: 45,
    completed: false,
    icons: [],
  },
];

const INITIAL_DAYS = [
  {
    id: 'day-1',
    dayName: 'Thu',
    dateLabel: 'Oct 1',
    isToday: true,
    tasks: [
      {
        id: 'd1-1',
        title: 'Write the launch announcement',
        tag: 'Deep Work',
        tagColor: 'blue',
        time: '10:00am',
        duration: '1:30',
        minutes: 90,
        completed: false,
      },
      {
        id: 'd1-2',
        title: 'Send customer follow-ups',
        tag: 'Admin',
        tagColor: 'orange',
        time: '1:30pm',
        duration: '0:30',
        minutes: 30,
        completed: false,
      },
      {
        id: 'd1-3',
        title: 'Prepare investor update',
        tag: 'Deep Work',
        tagColor: 'blue',
        time: '2:00pm',
        duration: '0:45',
        minutes: 45,
        completed: false,
      },
      {
        id: 'd1-4',
        title: 'Clear the support queue',
        tag: 'Admin',
        tagColor: 'orange',
        duration: '0:30',
        minutes: 30,
        completed: false,
      },
      {
        id: 'd1-5',
        title: 'Evening run',
        tag: 'Personal',
        tagColor: 'green',
        time: '6:00pm',
        duration: '0:45',
        minutes: 45,
        completed: false,
      },
    ],
  },
  {
    id: 'day-2',
    dayName: 'Fri',
    dateLabel: 'Oct 2',
    isToday: false,
    tasks: [
      {
        id: 'd2-1',
        title: 'Review the launch metrics',
        tag: 'Deep Work',
        tagColor: 'blue',
        time: '9:30am',
        duration: '1:00',
        minutes: 60,
        completed: false,
      },
      {
        id: 'd2-2',
        title: 'Reply to the enterprise pilot',
        tag: 'Admin',
        tagColor: 'orange',
        duration: '0:30',
        minutes: 30,
        completed: false,
      },
      {
        id: 'd2-3',
        title: 'Order groceries',
        tag: 'Personal',
        tagColor: 'green',
        time: '5:30pm',
        duration: '0:20',
        minutes: 20,
        completed: false,
      },
    ],
  },
  {
    id: 'day-3',
    dayName: 'Sat',
    dateLabel: 'Oct 3',
    isToday: false,
    tasks: [
      {
        id: 'd3-1',
        title: 'Call Mom',
        tag: 'Personal',
        tagColor: 'green',
        time: '11:30am',
        duration: '0:30',
        minutes: 30,
        completed: false,
      },
    ],
  },
];

const INITIAL_TIMEBOX_EVENTS = [
  {
    id: 'tb-1',
    title: '',
    timeRange: '9:00 - 9:30',
    startHour: 9.0,
    durationHours: 0.5,
    colorStyle: 'lavender',
    type: 'routine',
  },
  {
    id: 'tb-2',
    title: 'Write the launch announcement',
    timeRange: '10:00 - 11:30',
    startHour: 10.0,
    durationHours: 1.5,
    colorStyle: 'indigo',
    completed: false,
    hasCheckbox: true,
  },
  {
    id: 'tb-3',
    title: 'Lunch with Priya',
    timeRange: '12:30 - 1:30',
    startHour: 12.5,
    durationHours: 1.0,
    colorStyle: 'sky',
    isMeeting: true,
    source: 'outlook',
  },
  {
    id: 'tb-4',
    title: 'Send customer follow-ups',
    timeRange: '1:30 - 2:00',
    startHour: 13.5,
    durationHours: 0.5,
    colorStyle: 'orange',
    completed: false,
    hasCheckbox: true,
  },
  {
    id: 'tb-5',
    title: 'Prepare investor update',
    timeRange: '2:00 - 2:45',
    startHour: 14.0,
    durationHours: 0.75,
    colorStyle: 'indigo',
    completed: false,
    hasCheckbox: true,
  },
];

const TAG_CONFIG = {
  'Personal': { dotColor: 'bg-emerald-500', label: 'Personal', colorKey: 'green' },
  'Deep Work': { dotColor: 'bg-indigo-600', label: 'Deep Work', colorKey: 'blue' },
  'Admin': { dotColor: 'bg-amber-500', label: 'Admin', colorKey: 'orange' },
};

export const TodayPlanner = ({ onStartFocus }) => {
  // Persistence state
  const [brainDump, setBrainDump] = useState(() => {
    try {
      const saved = localStorage.getItem('lockin_today_braindump');
      return saved ? JSON.parse(saved) : INITIAL_BRAIN_DUMP;
    } catch {
      return INITIAL_BRAIN_DUMP;
    }
  });

  const [days, setDays] = useState(() => {
    try {
      const saved = localStorage.getItem('lockin_today_days');
      return saved ? JSON.parse(saved) : INITIAL_DAYS;
    } catch {
      return INITIAL_DAYS;
    }
  });

  const [timeboxEvents, setTimeboxEvents] = useState(() => {
    try {
      const saved = localStorage.getItem('lockin_today_timebox');
      return saved ? JSON.parse(saved) : INITIAL_TIMEBOX_EVENTS;
    } catch {
      return INITIAL_TIMEBOX_EVENTS;
    }
  });

  // UI state
  const [showBrainDump, setShowBrainDump] = useState(true);
  const [showTimebox, setShowTimebox] = useState(true);
  const [activeTabMode, setActiveTabMode] = useState('tasks'); // 'calendar' | 'tasks'
  const [filterTag, setFilterTag] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeCardId, setActiveCardId] = useState('bd-1');
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [draggedDayTask, setDraggedDayTask] = useState(null);

  // Modal / Inline Add Task State
  const [addingTarget, setAddingTarget] = useState(null); // 'brain-dump' or day id or 'timebox'
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTag, setNewTaskTag] = useState('Deep Work');
  const [newTaskMinutes, setNewTaskMinutes] = useState(30);
  const [newTaskTime, setNewTaskTime] = useState('');

  const reorderBrainDump = (targetId) => {
    if (!draggedTaskId || draggedTaskId === targetId) return;
    setBrainDump((current) => {
      const fromIndex = current.findIndex((task) => task.id === draggedTaskId);
      const toIndex = current.findIndex((task) => task.id === targetId);
      if (fromIndex < 0 || toIndex < 0) return current;
      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
    setDraggedTaskId(null);
  };

  const moveDayTask = (targetDayId, targetTaskId = null) => {
    if (!draggedDayTask) return;
    setDays((current) => {
      const sourceDay = current.find((day) => day.id === draggedDayTask.dayId);
      if (!sourceDay) return current;
      const movedTask = sourceDay.tasks.find((task) => task.id === draggedDayTask.taskId);
      if (!movedTask) return current;
      const withoutTask = current.map((day) => day.id === draggedDayTask.dayId
        ? { ...day, tasks: day.tasks.filter((task) => task.id !== draggedDayTask.taskId) }
        : day);
      return withoutTask.map((day) => {
        if (day.id !== targetDayId) return day;
        const nextTasks = [...day.tasks];
        const targetIndex = targetTaskId ? nextTasks.findIndex((task) => task.id === targetTaskId) : nextTasks.length;
        nextTasks.splice(targetIndex < 0 ? nextTasks.length : targetIndex, 0, movedTask);
        return { ...day, tasks: nextTasks };
      });
    });
    setDraggedDayTask(null);
  };

  // Persist whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem('lockin_today_braindump', JSON.stringify(brainDump));
    } catch (e) {
      console.error(e);
    }
  }, [brainDump]);

  useEffect(() => {
    try {
      localStorage.setItem('lockin_today_days', JSON.stringify(days));
    } catch (e) {
      console.error(e);
    }
  }, [days]);

  useEffect(() => {
    try {
      localStorage.setItem('lockin_today_timebox', JSON.stringify(timeboxEvents));
    } catch (e) {
      console.error(e);
    }
  }, [timeboxEvents]);

  // Calculate Column Totals
  const brainDumpTotal = useMemo(() => {
    const total = brainDump
      .filter((t) => !t.completed)
      .reduce((sum, t) => sum + (t.minutes || 0), 0);
    return formatMinutes(total);
  }, [brainDump]);

  const getDayTotal = (dayTasks) => {
    const total = dayTasks
      .filter((t) => !t.completed)
      .reduce((sum, t) => sum + (t.minutes || 0), 0);
    return formatMinutes(total);
  };

  // Toggle completion
  const toggleBrainDumpTask = (taskId) => {
    setBrainDump((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const toggleDayTask = (dayId, taskId) => {
    setDays((prev) =>
      prev.map((day) => {
        if (day.id !== dayId) return day;
        return {
          ...day,
          tasks: day.tasks.map((t) =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
          ),
        };
      })
    );
  };

  const toggleTimeboxEvent = (eventId) => {
    setTimeboxEvents((prev) =>
      prev.map((ev) =>
        ev.id === eventId ? { ...ev, completed: !ev.completed } : ev
      )
    );
  };

  // Add task handler
  const handleCreateTask = (e) => {
    if (e) e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const durationStr = formatMinutes(Number(newTaskMinutes));
    const newTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      tag: newTaskTag,
      tagColor: TAG_CONFIG[newTaskTag]?.colorKey || 'blue',
      duration: durationStr,
      minutes: Number(newTaskMinutes),
      time: newTaskTime.trim() || undefined,
      completed: false,
      icons: [],
    };

    if (addingTarget === 'brain-dump') {
      setBrainDump((prev) => [newTask, ...prev]);
    } else if (addingTarget?.startsWith('day-')) {
      setDays((prev) =>
        prev.map((day) => {
          if (day.id === addingTarget) {
            return { ...day, tasks: [newTask, ...day.tasks] };
          }
          return day;
        })
      );
    }

    setNewTaskTitle('');
    setNewTaskTime('');
    setAddingTarget(null);
  };

  // Move a task to Thu Today / Timebox
  const scheduleTaskToToday = (task) => {
    setDays((prev) =>
      prev.map((day) => {
        if (day.isToday) {
          const exists = day.tasks.some((t) => t.title === task.title);
          if (!exists) {
            return { ...day, tasks: [...day.tasks, { ...task, id: `d1-${Date.now()}` }] };
          }
        }
        return day;
      })
    );
  };

  // Filter & Search helper
  const matchesFilter = (task) => {
    if (filterTag !== 'All' && task.tag !== filterTag) return false;
    if (searchQuery.trim()) {
      return task.title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  };

  return (
    <div
      className="w-full dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200"
      style={{ background: 'linear-gradient(160deg, #f8f9ff 0%, #f3f4f6 100%)' }}
    >
      {/* ============================================================== */}
      {/* TOP HEADER: Pixel-perfect replica of Ellie top bar            */}
      {/* ============================================================== */}
      <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        {/* Left Section: Sidebar Toggle Icons */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 bg-slate-50 dark:bg-slate-800/60">
            <button
              title="Tasks View"
              className="p-1 rounded-md text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-xs transition-all"
            >
              <ListTodo className="w-4 h-4" />
            </button>
            <button
              title="Goals View"
              className="p-1 rounded-md text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-all"
            >
              <Target className="w-4 h-4" />
            </button>
            <button
              title="Projects"
              className="p-1 rounded-md text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-all"
            >
              <Folder className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center / Navigation Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Toggle Left Brain Dump */}
          <button
            onClick={() => setShowBrainDump(!showBrainDump)}
            title="Toggle Brain Dump"
            className={`p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors ${
              showBrainDump
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <PanelLeft className="w-4 h-4" />
          </button>

          {/* Today Button */}
          <button className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs">
            Today
          </button>

          {/* Prev / Next Arrows */}
          <div className="flex items-center gap-0.5">
            <button
              title="Previous"
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              title="Next"
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Search Trigger */}
          <div className="relative">
            {showSearchInput ? (
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1">
                <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="bg-transparent text-xs outline-hidden w-28 sm:w-36 text-slate-800 dark:text-slate-200 placeholder-slate-400"
                />
                <button
                  onClick={() => {
                    setShowSearchInput(false);
                    setSearchQuery('');
                  }}
                  className="text-slate-400 hover:text-slate-600 ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSearchInput(true)}
                title="Search"
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>{filterTag === 'All' ? 'Filter' : filterTag}</span>
            </button>

            {showFilterDropdown && (
              <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                {['All', 'Deep Work', 'Personal', 'Admin'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setFilterTag(tag);
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                      filterTag === tag
                        ? 'font-bold text-indigo-600 dark:text-indigo-400'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {tag !== 'All' && (
                        <span
                          className={`w-2 h-2 rounded-full ${
                            TAG_CONFIG[tag]?.dotColor || 'bg-slate-400'
                          }`}
                        />
                      )}
                      {tag}
                    </span>
                    {filterTag === tag && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Segmented View Toggle: Calendar | Tasks */}
          <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTabMode('calendar')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                activeTabMode === 'calendar'
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>Calendar</span>
            </button>
            <button
              onClick={() => setActiveTabMode('tasks')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                activeTabMode === 'tasks'
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>Tasks</span>
            </button>
          </div>


          {/* Toggle Right Timebox */}
          <button
            onClick={() => setShowTimebox(!showTimebox)}
            title="Toggle Timebox"
            className={`p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors ${
              showTimebox
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <PanelRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ============================================================== */}
      {/* MAIN 3-COLUMN CONTENT CANVAS                                   */}
      {/* ============================================================== */}
      <div className="flex-1 flex overflow-hidden">
        {/* ========================================================== */}
        {/* COLUMN 1: BRAIN DUMP (Left Column)                         */}
        {/* ========================================================== */}
        {showBrainDump && (
          <aside className="w-72 lg:w-80 shrink-0 border-r border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/50 p-4 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto">
            {/* Header: 🧠 Brain Dump ↕ */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-100 font-semibold text-base">
                <span>🧠</span>
                <span>Brain Dump</span>
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 ml-0.5 cursor-pointer hover:text-slate-600" />
              </div>
            </div>

            {/* "+ Add a task" Trigger / Input Card */}
            <div className="mb-3">
              {addingTarget === 'brain-dump' ? (
                <form
                  onSubmit={handleCreateTask}
                  className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-indigo-200 dark:border-indigo-900 shadow-sm space-y-2 animate-in fade-in"
                >
                  <input
                    type="text"
                    placeholder="Task name..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    autoFocus
                    className="w-full text-xs font-medium text-slate-800 dark:text-slate-100 outline-hidden bg-transparent placeholder-slate-400"
                  />
                  <div className="flex items-center justify-between pt-1">
                    <select
                      value={newTaskTag}
                      onChange={(e) => setNewTaskTag(e.target.value)}
                      className="text-[11px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded px-2 py-1 outline-hidden"
                    >
                      <option value="Deep Work">Deep Work</option>
                      <option value="Personal">Personal</option>
                      <option value="Admin">Admin</option>
                    </select>

                    <select
                      value={newTaskMinutes}
                      onChange={(e) => setNewTaskMinutes(e.target.value)}
                      className="text-[11px] font-mono bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded px-2 py-1 outline-hidden"
                    >
                      <option value="15">0:15</option>
                      <option value="30">0:30</option>
                      <option value="45">0:45</option>
                      <option value="60">1:00</option>
                      <option value="90">1:30</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setAddingTarget(null)}
                      className="px-2 py-1 text-[11px] font-medium text-slate-400 hover:text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-xs"
                    >
                      Add
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setAddingTarget('brain-dump')}
                  className="w-full bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-xl px-3 py-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 transition-all shadow-xs group"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-400 group-hover:border-indigo-500 group-hover:text-indigo-500">
                      +
                    </span>
                    <span className="font-medium group-hover:text-slate-700 dark:group-hover:text-slate-200">
                      Add a task
                    </span>
                  </div>
                  <span className="font-mono text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400">
                    {brainDumpTotal}
                  </span>
                </button>
              )}
            </div>

            {/* Task Cards List */}
            <div className="space-y-2 flex-1 overflow-y-auto pr-0.5">
              {brainDump.filter(matchesFilter).map((task) => {
                const tagInfo = TAG_CONFIG[task.tag] || {
                  dotColor: 'bg-indigo-500',
                  label: task.tag,
                };
                const isSelected = activeCardId === task.id;

                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(event) => {
                      setDraggedTaskId(task.id);
                      event.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      reorderBrainDump(task.id);
                    }}
                    onDragEnd={() => setDraggedTaskId(null)}
                    onClick={() => setActiveCardId(task.id)}
                    className={`bg-white dark:bg-slate-800 rounded-xl p-3 border transition-all relative group cursor-grab active:cursor-grabbing ${draggedTaskId === task.id ? 'opacity-50' : ''} ${
                      task.completed
                        ? 'opacity-50 border-slate-200 dark:border-slate-700'
                        : isSelected
                        ? 'border-blue-400 dark:border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900/30 shadow-xs'
                        : 'border-slate-200/80 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      {/* Checkbox & Task Title */}
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBrainDumpTask(task.id);
                          }}
                          className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                            task.completed
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 bg-white dark:bg-slate-800'
                          }`}
                        >
                          {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-xs font-medium text-slate-800 dark:text-slate-100 leading-snug break-words ${
                              task.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
                            }`}
                          >
                            {task.title}
                          </p>
                        </div>
                      </div>

                      {/* Duration Badge */}
                      <div className="shrink-0">
                        <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-700/50 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-700">
                          {task.duration}
                        </span>
                      </div>
                    </div>

                    {/* Metadata footer: Tag + Icons */}
                    <div className="flex items-center justify-between mt-2 pt-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${tagInfo.dotColor} shrink-0`}
                        />
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          {tagInfo.label}
                        </span>

                        {/* Badges / Icons */}
                        {task.icons?.includes('flag') && (
                          <Flag className="w-2.5 h-2.5 text-slate-400 ml-1" />
                        )}
                        {task.icons?.includes('repeat') && (
                          <Repeat className="w-2.5 h-2.5 text-slate-400" />
                        )}
                        {task.icons?.includes('link') && (
                          <Link2 className="w-2.5 h-2.5 text-slate-400" />
                        )}
                      </div>

                      {/* Quick Schedule Button (Hover) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          scheduleTaskToToday(task);
                        }}
                        title="Schedule into Today"
                        className="opacity-0 group-hover:opacity-100 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline transition-opacity"
                      >
                        + Today
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        )}

        {/* ========================================================== */}
        {/* COLUMN 2: MULTI-DAY PLANNER / KANBAN (Middle Column)       */}
        {/* ========================================================== */}
        {activeTabMode === 'calendar' && (
          <section className="flex-1 overflow-auto p-4 sm:p-5 h-[calc(100vh-3.5rem)] bg-slate-50/60 dark:bg-slate-950/30">
            <div className="min-w-[760px] rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="grid grid-cols-[72px_repeat(5,minmax(150px,1fr))] border-b border-slate-100 dark:border-slate-800">
                <div className="p-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Time</div>
                {days.slice(0, 5).map((day) => (
                  <div key={day.id} className={`border-l border-slate-100 p-3 dark:border-slate-800 ${day.isToday ? 'bg-indigo-50/60 dark:bg-indigo-950/20' : ''}`}>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100">{day.dayName}</div>
                    <div className="text-[10px] text-slate-400">{day.dateLabel}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-[72px_repeat(5,minmax(150px,1fr))]">
                <div className="text-[10px] text-slate-400">
                  {['08:00','10:00','12:00','14:00','16:00','18:00'].map((time) => <div key={time} className="h-20 border-b border-slate-100 px-2 pt-2 dark:border-slate-800">{time}</div>)}
                </div>
                {days.slice(0, 5).map((day) => (
                  <div key={day.id} className="border-l border-slate-100 dark:border-slate-800">
                    {['08:00','10:00','12:00','14:00','16:00','18:00'].map((time) => <div key={time} className="h-20 border-b border-slate-100 dark:border-slate-800" />)}
                    <div className="-mt-[480px] space-y-2 p-2">
                      {day.tasks.filter(matchesFilter).map((task) => (
                        <button key={task.id} onClick={() => setActiveCardId(task.id)} className="block w-full rounded-lg border-l-4 border-indigo-400 bg-indigo-50 p-2 text-left shadow-xs transition hover:-translate-y-0.5 hover:shadow-md dark:bg-indigo-950/40">
                          <div className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300">{task.time || 'Flexible'}</div>
                          <div className="text-xs font-semibold text-slate-800 dark:text-slate-100">{task.title}</div>
                          <div className="text-[10px] text-slate-500">{task.duration}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <main className={`${activeTabMode === 'calendar' ? 'hidden' : 'flex'} flex-1 overflow-x-auto p-4 sm:p-5 gap-4 lg:gap-5 h-[calc(100vh-3.5rem)]`}>
          {days.map((day) => {
            const dayTotal = getDayTotal(day.tasks);
            const isAdding = addingTarget === day.id;
            const completedCount = day.tasks.filter(t => t.completed).length;
            const totalCount = day.tasks.length;
            const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

            return (
              <div
                key={day.id}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  moveDayTask(day.id);
                }}
                className="w-72 sm:w-80 shrink-0 flex flex-col h-full bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden"
              >
                {/* Column Header */}
                <div className="px-4 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-slate-800 dark:text-slate-100 leading-tight">{day.dayName}</span>
                        {day.isToday && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 uppercase tracking-wide">Today</span>
                        )}
                      </div>
                      <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{day.dateLabel}</span>
                    </div>
                    <span className="font-mono text-xs font-semibold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">{dayTotal}</span>
                  </div>
                  {totalCount > 0 && (
                    <div>
                      <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-400 transition-all duration-500" style={{ width: `${progressPct}%` }} />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-slate-400">{completedCount}/{totalCount} done</span>
                        <span className="text-[10px] text-slate-400">{progressPct}%</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* "Add task" trigger */}
                <div className="px-3 pt-3 pb-1">
                  {isAdding ? (
                    <form
                      onSubmit={handleCreateTask}
                      className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-indigo-200 dark:border-indigo-900 shadow-sm space-y-2 animate-in fade-in"
                    >
                      <input
                        type="text"
                        placeholder="Task name..."
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        autoFocus
                        className="w-full text-xs font-medium text-slate-800 dark:text-slate-100 outline-hidden bg-transparent placeholder-slate-400"
                      />
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        <select
                          value={newTaskTag}
                          onChange={(e) => setNewTaskTag(e.target.value)}
                          className="text-[11px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded px-2 py-1 outline-hidden"
                        >
                          <option value="Deep Work">Deep Work</option>
                          <option value="Personal">Personal</option>
                          <option value="Admin">Admin</option>
                        </select>
                        <select
                          value={newTaskMinutes}
                          onChange={(e) => setNewTaskMinutes(e.target.value)}
                          className="text-[11px] font-mono bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded px-2 py-1 outline-hidden"
                        >
                          <option value="15">0:15</option>
                          <option value="30">0:30</option>
                          <option value="45">0:45</option>
                          <option value="60">1:00</option>
                          <option value="90">1:30</option>
                        </select>
                      </div>
                      <input
                        type="text"
                        placeholder="Scheduled time (e.g. 10:00am)"
                        value={newTaskTime}
                        onChange={(e) => setNewTaskTime(e.target.value)}
                        className="w-full text-[11px] bg-slate-100 dark:bg-slate-700/60 rounded px-2 py-1 outline-hidden text-slate-700 dark:text-slate-200"
                      />
                      <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-700">
                        <button type="button" onClick={() => setAddingTarget(null)} className="px-2 py-1 text-[11px] font-medium text-slate-400 hover:text-slate-600">Cancel</button>
                        <button type="submit" className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-xs">Add</button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => setAddingTarget(day.id)}
                      className="w-full flex items-center gap-2 text-xs text-slate-400 hover:text-indigo-600 transition-colors py-1.5 px-1 group"
                    >
                      <span className="w-5 h-5 rounded-md border border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center group-hover:border-indigo-500 group-hover:text-indigo-500 transition-colors">
                        <Plus className="w-3 h-3" />
                      </span>
                      <span className="font-medium">Add task</span>
                    </button>
                  )}
                </div>

                {/* Rich Task Cards */}
                <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
                  {day.tasks.filter(matchesFilter).map((task) => {
                    const tagInfo = TAG_CONFIG[task.tag] || { dotColor: 'bg-indigo-500', label: task.tag };
                    const accentLBar    = task.tag === 'Deep Work' ? '#6366f1' : task.tag === 'Admin' ? '#f59e0b' : '#10b981';
                    const accentTimeBg  = task.tag === 'Deep Work' ? '#eef2ff' : task.tag === 'Admin' ? '#fffbeb' : '#f0fdf4';
                    const accentTimeText = task.tag === 'Deep Work' ? '#4338ca' : task.tag === 'Admin' ? '#92400e' : '#065f46';
                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(event) => {
                          setDraggedDayTask({ dayId: day.id, taskId: task.id });
                          event.dataTransfer.effectAllowed = 'move';
                        }}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          moveDayTask(day.id, task.id);
                        }}
                        onDragEnd={() => setDraggedDayTask(null)}
                        style={{ opacity: task.completed ? 0.55 : 1 }}
                        className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 overflow-hidden group cursor-grab active:cursor-grabbing ${draggedDayTask?.taskId === task.id ? 'opacity-40' : ''}`}
                      >
                        <div className="flex">
                          <div style={{ width: 3, background: task.completed ? '#cbd5e1' : accentLBar, flexShrink: 0 }} />
                          <div className="flex-1 p-3">
                            <div className="flex items-center justify-between mb-2">
                              {task.time ? (
                                <span style={{ background: accentTimeBg, color: accentTimeText }} className="text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  {task.time}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-300">—</span>
                              )}
                              <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">{task.duration}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <button
                                onClick={() => toggleDayTask(day.id, task.id)}
                                style={{
                                  marginTop: 1, width: 15, height: 15, borderRadius: 4,
                                  border: task.completed ? `2px solid ${accentLBar}` : '1.5px solid #cbd5e1',
                                  background: task.completed ? accentLBar : 'transparent',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  cursor: 'pointer', flexShrink: 0, transition: 'all .15s',
                                }}
                              >
                                {task.completed && <Check className="w-2.5 h-2.5 stroke-[3] text-white" />}
                              </button>
                              <p className={`text-xs font-semibold text-slate-800 dark:text-slate-100 leading-snug flex-1 ${task.completed ? 'line-through text-slate-400' : ''}`}>
                                {task.title}
                              </p>
                            </div>
                            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-50 dark:border-slate-700/50">
                              <span style={{ background: accentTimeBg, color: accentTimeText }} className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                <span style={{ background: accentLBar }} className="w-1.5 h-1.5 rounded-full" />
                                {tagInfo.label}
                              </span>
                              {day.isToday && (
                                <button
                                  onClick={() => onStartFocus && onStartFocus()}
                                  className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-indigo-500 hover:text-indigo-700 flex items-center gap-1 transition-all"
                                >
                                  <Play className="w-2.5 h-2.5" /> Focus
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </main>

        {/* ========================================================== */}
        {/* COLUMN 3: CALENDAR TIMELINE (Right Column)                 */}
        {/* ========================================================== */}
        {showTimebox && activeTabMode !== 'calendar' && (
          <aside className="w-60 lg:w-68 shrink-0 border-l border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">
            {/* Header */}
            <div className="h-14 border-b border-slate-100 dark:border-slate-800 px-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Calendars</span>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1 text-slate-400 hover:text-slate-700 rounded"><ChevronLeft className="w-3.5 h-3.5" /></button>
                <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[11px] font-bold">{new Date().getDate()}</span>
                <button className="p-1 text-slate-400 hover:text-slate-700 rounded"><ChevronRight className="w-3.5 h-3.5" /></button>
              </div>
            </div>

            {/* Day-of-week strip */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 px-1 py-2">
              {['M','T','W','T','F','S','S'].map((d, i) => {
                const todayDow = (new Date().getDay() + 6) % 7;
                const isToday = i === todayDow;
                const dayNum = new Date(Date.now() - (todayDow - i) * 86400000).getDate();
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                    <span className={`text-[9px] font-bold ${isToday ? 'text-indigo-400' : 'text-slate-400'}`}>{d}</span>
                    <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}>{dayNum}</span>
                  </div>
                );
              })}
            </div>

            {/* Time Grid */}
            <div className="flex-1 overflow-y-auto">
              <div className="relative">
                {['6 AM','7 AM','8 AM','9 AM','10 AM','11 AM','12 PM','1 PM','2 PM','3 PM','4 PM','5 PM'].map((label) => (
                  <div key={label} className="flex h-16 border-b border-slate-50 dark:border-slate-800/40">
                    <span className="w-12 shrink-0 text-right font-mono text-[10px] text-slate-300 dark:text-slate-600 pt-1 pr-2 select-none">{label}</span>
                    <div className="flex-1" />
                  </div>
                ))}

                {/* Events overlay */}
                <div className="absolute top-0 left-12 right-1 bottom-0">
                  {timeboxEvents.map((ev) => {
                    const topPx    = (ev.startHour - 6) * 64;
                    const heightPx = Math.max(ev.durationHours * 64 - 4, 28);
                    const colorMap = {
                      lavender: { bg: '#e0e7ff', text: '#3730a3', border: '#a5b4fc' },
                      indigo:   { bg: '#6366f1', text: '#fff',    border: '#4f46e5' },
                      sky:      { bg: '#7dd3fc', text: '#0c4a6e', border: '#38bdf8' },
                      orange:   { bg: '#fb923c', text: '#fff',    border: '#f97316' },
                      green:    { bg: '#86efac', text: '#14532d', border: '#4ade80' },
                      purple:   { bg: '#c084fc', text: '#fff',    border: '#a855f7' },
                    };
                    const col = colorMap[ev.colorStyle] || colorMap.indigo;
                    return (
                      <div
                        key={ev.id}
                        style={{
                          position: 'absolute', top: `${topPx}px`, height: `${heightPx}px`,
                          left: 2, right: 6, background: col.bg,
                          borderLeft: `3px solid ${col.border}`, borderRadius: 8,
                          padding: '5px 8px', display: 'flex', flexDirection: 'column',
                          justifyContent: 'space-between', overflow: 'hidden', cursor: 'pointer',
                          transition: 'filter .15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.filter='brightness(0.93)'}
                        onMouseLeave={e => e.currentTarget.style.filter='none'}
                      >
                        {ev.hasCheckbox ? (
                          <div style={{ display:'flex', alignItems:'flex-start', gap:5 }}>
                            <button
                              onClick={() => toggleTimeboxEvent(ev.id)}
                              style={{ width:13, height:13, borderRadius:4, border:`1.5px solid ${col.border}`, background: ev.completed ? col.border : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, marginTop:1 }}
                            >
                              {ev.completed && <Check style={{ width:8, height:8, strokeWidth:3, color:col.bg }} />}
                            </button>
                            <p style={{ margin:0, fontSize:11, fontWeight:700, color:col.text, lineHeight:1.3, textDecoration: ev.completed ? 'line-through':'none', opacity: ev.completed ? 0.6:1 }}>{ev.title}</p>
                          </div>
                        ) : ev.title ? (
                          <p style={{ margin:0, fontSize:11, fontWeight:700, color:col.text, lineHeight:1.3 }}>{ev.title}</p>
                        ) : null}
                        <span style={{ fontSize:9, fontFamily:'monospace', color:col.text, opacity:0.75 }}>{ev.timeRange}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default TodayPlanner;
