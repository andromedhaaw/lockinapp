
import { useState, useEffect } from 'react';
import { Clock, History, Calendar, CalendarDays, Timer, CheckSquare, User, Trophy, Lock, Brain, Leaf, ChevronDown } from 'lucide-react';
import { TabNavigation } from '../components/ui';
import { WebGardenTab as GardenTab } from '../components/garden/web';
import { TodayPlanner } from '../components/today';
import {
  CurrentTimeDisplay,
  WorkTimerDisplay,
  TodayTotal,
  SessionInfo,
  ControlButtons,
} from '../components/tracker';
import {
  PeriodSummary,
  PeriodSelector,
  PeriodNavigator,
  DaysList,
  MonthsList,
} from '../components/history';
import { useCurrentTime, useWorkTimer, useWorkHistory } from '../hooks';
import { useGarden } from '../context/GardenContext';
import { FocusTimer } from '../components/focus';
import { TaskList } from '../components/tasks';
import { TodoPage } from '../components/todo';
import { DeadlinePage } from '../components/deadline';
import { Profile } from '../components/profile';
import { Leaderboard, SocialNotification, CommunityBanner, EncouragementModal, RivalActivityFeed } from '../components/social';
import { GoalsTab } from '../components/goals';
import { AnalyticsTab } from '../components/analytics';

import { DeepWorkScore } from '../components/insights';
import { WeeklyDigest } from '../components/digest';
import { AccountabilityPods } from '../components/pods';
import { WorkCertificate } from '../components/certificate';
import { formatTimeToHours, getDateKey } from '../utils/timeUtils';
import { TABS, HISTORY_PERIODS } from '../constants';

const tabs = [
  { id: TABS.TODAY, label: 'Today', icon: CalendarDays },
  { id: TABS.TRACKER, label: 'Tracker', icon: Clock },
  { id: TABS.FOCUS, label: 'Focus', icon: Timer },
  { id: TABS.TASKS, label: 'Tasks', icon: CheckSquare },
  { id: TABS.TODO, label: 'To Do', icon: CheckSquare },
  { id: TABS.DEADLINE, label: 'Deadline', icon: CalendarDays },
  { id: TABS.GOALS, label: 'Goals', icon: Lock },
  { id: TABS.GARDEN, label: 'Garden', icon: Leaf },
  { id: TABS.LEADERBOARD, label: 'Social', icon: Trophy },
  { id: TABS.PROFILE, label: 'Profile', icon: User },
];

const historyPeriods = [
  { id: HISTORY_PERIODS.WEEK, label: 'Week' },
  { id: HISTORY_PERIODS.MONTH, label: 'Month' },
  { id: HISTORY_PERIODS.YEAR, label: 'Year' },
];

/**
 * Main TimeTracker page component
 */
const TimeTracker = ({ initialTab }) => {
  const [activeTab, setActiveTab] = useState(() => initialTab || TABS.TODAY);
  const [grindMode, setGrindMode] = useState(() => {
    return localStorage.getItem('lockin_grindMode') === 'true';
  });

  // ADHD Mode: Simplified UI, reduced tabs, anti-overwhelm
  const [adhdMode, setAdhdMode] = useState(() => {
    const saved = localStorage.getItem('lockin_adhdMode');
    return saved !== null ? saved === 'true' : true; // Default ON to prevent overwhelm
  });

  const handleAdhdModeChange = (val) => {
    try {
      setAdhdMode(val);
      localStorage.setItem('lockin_adhdMode', val);
    } catch (e) {
      console.error("Storage error");
    }
  };

  // Persist grindMode
  const handleGrindModeChange = (val) => {
    try {
      setGrindMode(val);
      localStorage.setItem('lockin_grindMode', val);
    } catch (e) {
      console.error("Storage error");
    }
  };

  // Dark Mode
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('lockin_theme') === 'dark';
  });

  // Apply Dark Mode
  const handleThemeChange = (val) => {
    setDarkMode(val);
    localStorage.setItem('lockin_theme', val ? 'dark' : 'light');
    if (val) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Ensure class is applied on mount
  useEffect(() => {
    if (localStorage.getItem('lockin_theme') === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const [historyPeriod, setHistoryPeriod] = useState(HISTORY_PERIODS.WEEK);
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  
  // Accountability: Session Goal (default 60m)
  const [sessionGoal, setSessionGoal] = useState(60);

  // History & Insights Tab specific state
  const [historyView, setHistoryView] = useState('log'); // 'log' or 'analytics'
  const [showTrackerHistory, setShowTrackerHistory] = useState(false);
  const [showTrackerInsights, setShowTrackerInsights] = useState(false);

  // Insights Tab specific state
  const [insightsView, setInsightsView] = useState('score'); // 'score', 'digest', 'certificate'

  // Social Tab specific state
  const [socialView, setSocialView] = useState('leaderboard'); // 'leaderboard', 'activity' or 'pods'

  // Encouragement Modal state
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [lastSessionMinutes, setLastSessionMinutes] = useState(0);

  // Custom hooks
  const { addCoinsFromWork } = useGarden(); 
  const { currentDate, currentTimeString } = useCurrentTime();
  const {
    workHistory: workHistoryData,
    sessionHistory,
    saveWorkSession,
    getHoursForDate,
    getWeekDataByOffset,
    getMonthDataByOffset,
    getTotalYearHours,
    getYearData,
    getSessionsForDate,
  } = useWorkHistory();
  const {
    isTracking,
    isPaused,
    totalWorkTime,
    sessionStart,
    handleStart,
    handlePause,
    handleFinish,
    elapsedTime, // Added elapsedTime for AICoach
  } = useWorkTimer(saveWorkSession);

  // Focus Timer Visibility in Tasks Tab
  const [showFocusTimer, setShowFocusTimer] = useState(false);
  const [focusedTask, setFocusedTask] = useState(null);
  const [countdown, setCountdown] = useState(0);

  // Countdown Effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Calculate today's total including current session
  const todayStoredHours = getHoursForDate(new Date());
  const currentSessionHours = isTracking
    ? parseFloat(formatTimeToHours(totalWorkTime))
    : 0;
  const todayTotalHours = todayStoredHours + currentSessionHours;

  // ADHD Calm tabs (essential 6 tabs: Today, Focus, Tasks, Tracker, Garden, Settings)
  const adhdTabs = [
    { id: TABS.TODAY, label: 'Today', icon: CalendarDays },
    { id: TABS.FOCUS, label: 'Focus', icon: Timer },
    { id: TABS.TODO, label: 'To Do', icon: CheckSquare },
    { id: TABS.DEADLINE, label: 'Deadline', icon: CalendarDays },
    { id: TABS.TASKS, label: 'Tasks', icon: CheckSquare },
    { id: TABS.TRACKER, label: 'Tracker', icon: Clock },
    { id: TABS.GARDEN, label: 'Garden', icon: Leaf },
    { id: TABS.PROFILE, label: 'Settings', icon: User },
  ];

  const visibleTabs = adhdMode ? adhdTabs : tabs;

  // Auto-redirect if active tab is hidden in current mode
  useEffect(() => {
    if (adhdMode) {
      const isCurrentVisible = adhdTabs.some(t => t.id === activeTab);
      if (!isCurrentVisible) {
        setActiveTab(TABS.FOCUS);
      }
    }
  }, [adhdMode, activeTab]);

  // Wrapper to show encouragement modal when finishing session
  const handleFinishWithEncouragement = () => {
    // Calculate session minutes from totalWorkTime (in seconds)
    const sessionMinutes = Math.floor(totalWorkTime / 60);
    setLastSessionMinutes(sessionMinutes);
    
    // Show encouragement if they worked at least 1 minute
    if (sessionMinutes >= 1) {
      setShowEncouragement(true);
    }
    
    // Earn coins (10 coins per hour)
    addCoinsFromWork(sessionMinutes / 60);
    
    // Call the original finish handler
    handleFinish();
  };

  // Reset offset when changing period type
  const handlePeriodChange = (period) => {
    setHistoryPeriod(period);
    setWeekOffset(0);
    setMonthOffset(0);
  };

  // Get history content based on selected period
  const getHistoryContent = () => {
    const todayKey = getDateKey(new Date());

    switch (historyPeriod) {
      case HISTORY_PERIODS.WEEK: {
        const weekData = getWeekDataByOffset(weekOffset);
        
        // Add current session to today if viewing current week
        const adjustedData = weekData.data.map((day) => ({
          ...day,
          hours: day.isToday ? day.hours + currentSessionHours : day.hours,
        }));
        const adjustedTotal = weekData.totalHours + (weekOffset === 0 ? currentSessionHours : 0);

        return (
          <>
            <PeriodNavigator
              title={weekData.label}
              onPrevious={() => setWeekOffset((prev) => prev - 1)}
              onNext={() => setWeekOffset((prev) => prev + 1)}
              canGoNext={weekOffset < 0}
            />
            <PeriodSummary
              title="Week Total"
              totalHours={adjustedTotal}
              averageLabel="hours/day"
              averageHours={adjustedTotal / 7}
            />
            <h3 className="text-lg font-semibold text-green-800 mb-4 text-center">
              Daily Breakdown
            </h3>
            <DaysList 
              data={adjustedData} 
              todayTotalHours={todayTotalHours} 
              getSessionsForDate={getSessionsForDate}
            />
          </>
        );
      }
      case HISTORY_PERIODS.MONTH: {
        const monthData = getMonthDataByOffset(monthOffset);
        
        // Add current session to today if viewing current month
        const adjustedData = monthData.data.map((day) => ({
          ...day,
          hours: day.isToday ? day.hours + currentSessionHours : day.hours,
        }));
        const adjustedTotal = monthData.totalHours + (monthOffset === 0 ? currentSessionHours : 0);

        return (
          <>
            <PeriodNavigator
              title={monthData.label}
              onPrevious={() => setMonthOffset((prev) => prev - 1)}
              onNext={() => setMonthOffset((prev) => prev + 1)}
              canGoNext={monthOffset < 0}
            />
            <PeriodSummary
              title="Month Total"
              totalHours={adjustedTotal}
              averageLabel="hours/day"
              averageHours={adjustedTotal / monthData.daysInMonth}
            />
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-400 mb-4 text-center">
              Daily Breakdown
            </h3>
            <DaysList 
              data={adjustedData} 
              todayTotalHours={todayTotalHours} 
              getSessionsForDate={getSessionsForDate}
            />
          </>
        );
      }
      case HISTORY_PERIODS.YEAR: {
        const yearData = getYearData();
        const totalHours = getTotalYearHours();

        return (
          <>
            <PeriodSummary
              title="Last 12 Months"
              totalHours={totalHours + currentSessionHours}
              averageLabel="hours/month"
              averageHours={(totalHours + currentSessionHours) / 12}
            />
            <h3 className="text-lg font-semibold text-green-800 mb-4 text-center">
              Monthly Breakdown
            </h3>
            <MonthsList data={yearData} />
          </>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen dark:bg-slate-950 transition-colors duration-300" style={{ background: 'linear-gradient(160deg, #f8f9ff 0%, #f3f4f6 100%)' }}>
      {/* Tab Navigation */}
      <TabNavigation
        tabs={visibleTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === TABS.TODAY ? (
        <TodayPlanner onStartFocus={() => setActiveTab(TABS.FOCUS)} />
      ) : (
        <div className="p-4 sm:p-6 pb-32">
          <div className={`${activeTab === TABS.GARDEN ? 'max-w-7xl' : 'max-w-3xl'} mx-auto transition-all duration-500`}>
          {/* Tracker Tab Content */}
          <div className={activeTab === TABS.TRACKER ? 'block' : 'hidden'}>
              {/* Header */}
              <div className="text-center mb-4 pt-2">
                <h1 className="text-2xl font-bold text-green-800 mb-2">
                  Work Hours Tracker
                </h1>
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{currentDate}</span>
                </div>
              </div>

              {/* Tracker Displays */}
              <div className="mb-4">
                {/* Current Time Display */}
                <CurrentTimeDisplay timeString={currentTimeString} />

                {/* Work Timer Display */}
                <WorkTimerDisplay
                  totalWorkTime={totalWorkTime}
                  isTracking={isTracking}
                  isPaused={isPaused}
                />

                {/* Today's Total */}
                <TodayTotal hours={todayTotalHours} />

                {/* Session Info */}
                <SessionInfo sessionStart={sessionStart} />
              </div>

              {/* Session Goal Input (Accountability) */}
              {!isTracking && (
                 <div className="bg-white/50 p-2 rounded-xl border border-green-50 mb-4">
                   <div className="flex flex-col sm:flex-row items-center gap-4">
                     <label className="text-[10px] font-bold text-green-700 uppercase whitespace-nowrap">Session Commitment:</label>
                     <div className="flex gap-1.5 w-full">
                       {[30, 60, 90, 120].map(mins => (
                         <button
                           key={mins}
                           onClick={() => setSessionGoal(mins)}
                           className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${
                             sessionGoal === mins 
                               ? 'bg-green-600 text-white shadow-sm' 
                               : 'bg-white text-gray-400 hover:bg-green-50'
                           }`}
                         >
                           {mins}m
                         </button>
                       ))}
                     </div>
                   </div>
                 </div>
              )}

              {/* Control Buttons */}
              <div className="mt-2">
                <ControlButtons
                  isTracking={isTracking}
                  isPaused={isPaused}
                  onStart={handleStart}
                  onPause={handlePause}
                  onFinish={handleFinishWithEncouragement}
                />
              </div>

              {/* Action Buttons: Work History & Insights in Tracker Page */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setShowTrackerHistory(!showTrackerHistory);
                    if (!showTrackerHistory) setShowTrackerInsights(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-xs ${
                    showTrackerHistory
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-white dark:bg-slate-800 border border-green-200 dark:border-slate-700 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span>{showTrackerHistory ? 'Tutup History' : 'Work History'}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showTrackerHistory ? 'rotate-180' : ''}`} />
                </button>

                <button
                  onClick={() => {
                    setShowTrackerInsights(!showTrackerInsights);
                    if (!showTrackerInsights) setShowTrackerHistory(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-xs ${
                    showTrackerInsights
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <Brain className="w-4 h-4" />
                  <span>{showTrackerInsights ? 'Tutup Insights' : 'Deep Work Insights'}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showTrackerInsights ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Collapsible Work History Content Inside Tracker Page */}
              {showTrackerHistory && (
                <div className="mt-8 pt-6 border-t border-green-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-4 duration-300">
                  <h2 className="text-xl font-bold text-green-800 dark:text-green-300 mb-6 text-center">
                    Work History
                  </h2>

                  {/* Sub-navigation for History */}
                  <div className="flex justify-center mb-6 bg-white dark:bg-slate-800 p-1 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm mx-auto max-w-[320px]">
                    <button
                      onClick={() => setHistoryView('log')}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-sm font-medium transition-all ${
                        historyView === 'log'
                          ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 shadow-sm'
                          : 'text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-300'
                      }`}
                    >
                      Log
                    </button>
                    <button
                      onClick={() => setHistoryView('analytics')}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-sm font-medium transition-all ${
                        historyView === 'analytics'
                          ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 shadow-sm'
                          : 'text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-300'
                      }`}
                    >
                      Analytics
                    </button>
                  </div>

                  {historyView === 'log' ? (
                    <>
                      {/* Period Selector */}
                      <PeriodSelector
                        periods={historyPeriods}
                        activePeriod={historyPeriod}
                        onPeriodChange={handlePeriodChange}
                      />

                      {/* Dynamic History Content */}
                      {getHistoryContent()}
                    </>
                  ) : (
                    <AnalyticsTab />
                  )}
                </div>
              )}

              {/* Collapsible Insights Content Inside Tracker Page */}
              {showTrackerInsights && (
                <div className="mt-8 pt-6 border-t border-indigo-100 dark:border-slate-800 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-4">
                    🧠 Deep Work Insights
                  </h2>

                  {/* Community Banner */}
                  <CommunityBanner />

                  {/* Sub-navigation for Insights */}
                  <div className="flex justify-center bg-white dark:bg-slate-800 p-1 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm mx-auto max-w-md">
                    <button
                      onClick={() => setInsightsView('score')}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                        insightsView === 'score'
                          ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 shadow-sm'
                          : 'text-gray-500 hover:text-green-600'
                      }`}
                    >
                      Score
                    </button>
                    <button
                      onClick={() => setInsightsView('digest')}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                        insightsView === 'digest'
                          ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 shadow-sm'
                          : 'text-gray-500 hover:text-green-600'
                      }`}
                    >
                      Weekly Report
                    </button>
                    <button
                      onClick={() => setInsightsView('certificate')}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                        insightsView === 'certificate'
                          ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 shadow-sm'
                          : 'text-gray-500 hover:text-green-600'
                      }`}
                    >
                      Certificate
                    </button>
                  </div>

                  {/* Insights Content */}
                  {insightsView === 'score' && (
                    <div className="space-y-4">
                      <DeepWorkScore sessionHistory={sessionHistory} period="today" />
                      <DeepWorkScore sessionHistory={sessionHistory} period="week" />
                    </div>
                  )}

                  {insightsView === 'digest' && (
                    <WeeklyDigest sessionHistory={sessionHistory} workHistory={workHistoryData} />
                  )}

                  {insightsView === 'certificate' && (
                    <WorkCertificate 
                      userName="Professional User"
                      totalHours={Object.values(workHistoryData).reduce((sum, h) => sum + h, 0)}
                      projectName="Deep Work"
                    />
                  )}
                </div>
              )}
          </div>

          {/* Focus Timer Content */}
          <div className={activeTab === TABS.FOCUS ? 'block' : 'hidden'}>
            <div className="pt-4">
              {countdown > 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] animate-in fade-in duration-300">
                  <div className="text-sm font-bold uppercase tracking-widest mb-4 text-green-600 dark:text-green-400 opacity-80">Get Ready</div>
                  <div className="text-9xl font-black text-green-600 dark:text-green-400 animate-pulse">
                    {countdown}
                  </div>
                  <div className="mt-12 text-center px-6">
                     <div className="text-xl font-bold mb-1 text-gray-900 dark:text-white">{focusedTask?.name}</div>
                     <div className="text-sm text-gray-500 dark:text-gray-400">Starting in a few seconds...</div>
                  </div>
                  <button 
                     onClick={() => {
                       setCountdown(0);
                       setFocusedTask(null);
                     }}
                     className="mt-20 px-6 py-2 rounded-full border border-gray-200 dark:border-slate-800 text-xs font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-colors"
                   >
                     Cancel
                   </button>
                </div>
              ) : (
                <div className="animate-in fade-in duration-700">
                  <FocusTimer 
                    key={focusedTask ? focusedTask.id : 'default'}
                    initialMinutes={focusedTask ? (() => {
                      const timeStr = focusedTask.estimatedTime || '25m';
                      const match = timeStr.match(/(\d+)\s*(m|h|min|hour)?/i);
                      if (!match) return 25;
                      const val = parseInt(match[1]);
                      const unit = match[2]?.toLowerCase();
                      if (unit === 'h' || unit === 'hour') return val * 60;
                      return val;
                    })() : 25} 
                    autoStart={!!focusedTask}
                  />
                  
                  {focusedTask && (
                    <div className="mt-8 bg-green-50 dark:bg-green-900/10 rounded-2xl p-6 border border-green-100 dark:border-green-800/30 text-center space-y-3">
                       <h3 className="text-sm font-bold text-green-600 dark:text-green-400 uppercase tracking-wide">Current Task</h3>
                       <div className="text-xl font-bold text-gray-900 dark:text-white">
                         {focusedTask.name}
                       </div>
                       <button 
                         onClick={() => setFocusedTask(null)}
                         className="text-xs text-gray-500 hover:text-red-500 transition-colors underline"
                       >
                         Clear Task
                       </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tasks Tab Content */}
          <div className={activeTab === TABS.TASKS ? 'block' : 'hidden'}>
            <div className="pt-4">
              <TaskList onFocus={(task, customMinutes) => {
                if (customMinutes) {
                  setFocusedTask({ ...task, estimatedTime: `${customMinutes}m` });
                } else {
                  setFocusedTask(task);
                }
                setCountdown(3);
                setActiveTab(TABS.FOCUS);
              }} />
            </div>
          </div>

          {/* To Do Tab Content */}
          <div className={activeTab === TABS.TODO ? 'block' : 'hidden'}>
            <div className="-mx-4 sm:-mx-6">
              <TodoPage />
            </div>
          </div>

          {/* Profile Tab Content */}
          <div className={activeTab === TABS.PROFILE ? 'block' : 'hidden'}>
            <div className="pt-4">
              <Profile 
                grindMode={grindMode} 
                setGrindMode={handleGrindModeChange}
                darkMode={darkMode}
                setDarkMode={handleThemeChange}
                adhdMode={adhdMode}
                setAdhdMode={handleAdhdModeChange}
              />
            </div>
          </div>

          {/* Social Tab Content - Leaderboard & Pods */}
          <div className={activeTab === TABS.LEADERBOARD ? 'block' : 'hidden'}>
            <div className="pt-4 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
                🏆 Social & Community
              </h2>
              
              {/* Sub-navigation for Social */}
              <div className="flex justify-center bg-white dark:bg-slate-800 p-1 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm mx-auto max-w-md">
                <button
                  onClick={() => setSocialView('leaderboard')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    socialView === 'leaderboard'
                      ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 shadow-sm'
                      : 'text-gray-500 hover:text-yellow-600'
                  }`}
                >
                  Leaderboard
                </button>
                <button
                  onClick={() => setSocialView('activity')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    socialView === 'activity'
                      ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 shadow-sm'
                      : 'text-gray-500 hover:text-green-600'
                  }`}
                >
                  Live Feed
                </button>
                <button
                  onClick={() => setSocialView('pods')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    socialView === 'pods'
                      ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 shadow-sm'
                      : 'text-gray-500 hover:text-purple-600'
                  }`}
                >
                  My Pod
                </button>
              </div>

              {/* Social Content */}
              {socialView === 'leaderboard' && (
                <Leaderboard />
              )}

              {socialView === 'activity' && (
                <RivalActivityFeed />
              )}

              {socialView === 'pods' && (
                <AccountabilityPods 
                  workHistory={workHistoryData} 
                  todayHours={todayTotalHours}
                />
              )}
            </div>
          </div>

          {/* Garden Tab Content */}
          <div className={activeTab === TABS.GARDEN ? 'block' : 'hidden'}>
            <div className="pt-4">
              <GardenTab />
            </div>
          </div>

          {/* Goals Tab Content */}
          <div className={activeTab === TABS.GOALS ? 'block' : 'hidden'}>
            <div className="pt-4">
              <GoalsTab />
            </div>
          </div>

          {/* Deadline Tab Content */}
          <div className={activeTab === TABS.DEADLINE ? 'block' : 'hidden'}>
            <DeadlinePage tasks={[]} />
          </div>



          {/* Encouragement Modal - shows when session ends */}
          <EncouragementModal
            isOpen={showEncouragement}
            onClose={() => setShowEncouragement(false)}
            completedMinutes={lastSessionMinutes}
            goalMinutes={sessionGoal}
          />

          {/* Social Notification System */}
          {!grindMode && <SocialNotification />}



          {/* Footer */}
          <div className="text-center mt-8 text-green-600 text-sm">
            Track your productivity with ease
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default TimeTracker;
