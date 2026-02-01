
import { useState, useEffect } from 'react';
import { Clock, History, Calendar, Timer, CheckSquare, User, Trophy, Lock, Brain } from 'lucide-react';
import MobileLayout from '../components/mobile/MobileLayout';
import MobileBottomNav from '../components/mobile/MobileBottomNav';
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
import { FocusTimer } from '../components/focus';
import { TaskList } from '../components/tasks';
import { Profile } from '../components/profile';
import { Leaderboard, SocialNotification, CommunityBanner, EncouragementModal, RivalActivityFeed } from '../components/social';
import { GoalsTab } from '../components/goals';
import { AnalyticsTab } from '../components/analytics';
import { AICoach } from '../components/support';
import { DeepWorkScore } from '../components/insights';
import { WeeklyDigest } from '../components/digest';
import { AccountabilityPods } from '../components/pods';
import { WorkCertificate } from '../components/certificate';
import { formatTimeToHours, getDateKey } from '../utils/timeUtils';
import { TABS, HISTORY_PERIODS } from '../constants';

const tabs = [
  { id: TABS.TRACKER, label: 'Tracker', icon: Clock },
  { id: TABS.TASKS, label: 'Tasks', icon: CheckSquare },
  { id: TABS.GOALS, label: 'Goals', icon: Lock },
  { id: TABS.INSIGHTS, label: 'Insights', icon: Brain },
  { id: TABS.LEADERBOARD, label: 'Social', icon: Trophy },
  { id: TABS.HISTORY, label: 'History', icon: History },
  { id: TABS.PROFILE, label: 'Profile', icon: User },
];

const historyPeriods = [
  { id: HISTORY_PERIODS.WEEK, label: 'Week' },
  { id: HISTORY_PERIODS.MONTH, label: 'Month' },
  { id: HISTORY_PERIODS.YEAR, label: 'Year' },
];

/**
 * Mobile TimeTracker page component
 */
const MobileTimeTracker = () => {
  const [activeTab, setActiveTab] = useState(TABS.TRACKER);
  const [grindMode, setGrindMode] = useState(() => {
    return localStorage.getItem('lockin_grindMode_mobile') === 'true';
  });

  // Persist grindMode
  const handleGrindModeChange = (val) => {
    try {
      setGrindMode(val);
      localStorage.setItem('lockin_grindMode_mobile', val);
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

  // History Tab specific state
  const [historyView, setHistoryView] = useState('log'); // 'log' or 'analytics'

  // Insights Tab specific state
  const [insightsView, setInsightsView] = useState('score'); // 'score', 'digest', 'certificate'

  // Social Tab specific state
  const [socialView, setSocialView] = useState('leaderboard'); // 'leaderboard', 'activity' or 'pods'

  // Encouragement Modal state
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [lastSessionMinutes, setLastSessionMinutes] = useState(0);

  // Focus Timer Visibility in Tasks Tab
  const [showFocusTimer, setShowFocusTimer] = useState(false);
  const [focusedTask, setFocusedTask] = useState(null);
  const [countdown, setCountdown] = useState(0);

  // Custom hooks
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

  // Filter tabs for Deep Work Mode (hides Goals, Insights, Social)
  const visibleTabs = grindMode
    ? tabs.filter(t => ![TABS.GOALS, TABS.INSIGHTS, TABS.LEADERBOARD].includes(t.id))
    : tabs;

  // Wrapper to show encouragement modal when finishing session
  const handleFinishWithEncouragement = () => {
    // Calculate session minutes from totalWorkTime (in seconds)
    const sessionMinutes = Math.floor(totalWorkTime / 60);
    setLastSessionMinutes(sessionMinutes);
    
    // Show encouragement if they worked at least 1 minute
    if (sessionMinutes >= 1) {
      setShowEncouragement(true);
    }
    
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
    <MobileLayout>
      <div className="p-4 flex-1 pb-0">
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

              {/* Session Goal Input (Accountability) */}
              {!isTracking && (
                 <div className="bg-white/50 p-3 rounded-xl border border-green-50 mb-4">
                   <label className="text-xs font-bold text-green-700 uppercase mb-3 block">Session Commitment</label>
                   <div className="flex gap-2">
                     {[30, 60, 90, 120].map(mins => (
                       <button
                         key={mins}
                         onClick={() => setSessionGoal(mins)}
                         className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                           sessionGoal === mins 
                             ? 'bg-green-600 text-white shadow-md' 
                             : 'bg-white text-gray-500 hover:bg-green-50'
                         }`}
                       >
                         {mins}m
                       </button>
                     ))}
                   </div>
                 </div>
              )}

              {/* Control Buttons */}
              <div className="space-y-4 mb-0">
                <ControlButtons
                  isTracking={isTracking}
                  isPaused={isPaused}
                  onStart={handleStart}
                  onPause={handlePause}
                  onFinish={handleFinishWithEncouragement}
                />
              </div>
          </div>

          {/* History Tab Content */}
          <div className={activeTab === TABS.HISTORY ? 'block' : 'hidden'}>
              <div className="pt-4 pb-20">
                <h2 className="text-2xl font-bold text-green-800 mb-6 text-center">
                  Work History
                </h2>

                {/* Sub-navigation for History */}
                <div className="flex justify-center mb-6 bg-white dark:bg-slate-800 p-1 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm mx-auto max-w-[200px]">
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
          </div>



          {/* Tasks Tab Content */}
          <div className={activeTab === TABS.TASKS ? 'block' : 'hidden'}>
            <div className="pt-4 pb-20">
              <div className="flex justify-end px-4 mb-2">
                 {/* Top toggle removed in favor of task-specific focus */}
              </div>
              
              <TaskList onFocus={(task) => {
                setFocusedTask(task);
                setCountdown(5);
                setShowFocusTimer(true);
              }} />
              
              {showFocusTimer && (
                <div className="fixed top-0 bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-[100] bg-white dark:bg-slate-950 animate-in fade-in duration-300 flex flex-col shadow-2xl">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-800">
                    <h2 className="text-lg font-bold text-green-800 dark:text-green-400">Focus Mode</h2>
                    <button 
                      onClick={() => {
                        setShowFocusTimer(false);
                        setFocusedTask(null);
                      }}
                      className="p-2 text-gray-500 hover:text-green-600 transition-colors"
                    >
                      Close
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto p-4 pb-24 relative">
                     {countdown > 0 ? (
                       <div className="absolute inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col items-center justify-center animate-in fade-in duration-300">
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
                              setShowFocusTimer(false);
                            }}
                            className="mt-20 px-6 py-2 rounded-full border border-gray-200 dark:border-slate-800 text-xs font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                       </div>
                     ) : (
                       <div className="animate-in fade-in duration-700">
                         {/* Timer Section */}
                         <div className="mb-8">
                            <FocusTimer 
                              initialMinutes={focusedTask ? (() => {
                                const timeStr = focusedTask.estimatedTime || '25m';
                                const match = timeStr.match(/(\d+)\s*(m|h|min|hour)?/i);
                                if (!match) return 25;
                                const val = parseInt(match[1]);
                                const unit = match[2]?.toLowerCase();
                                if (unit === 'h' || unit === 'hour') return val * 60;
                                return val;
                              })() : 25} 
                              autoStart={true}
                            />
                         </div>

                         {/* Active Task Display */}
                         {focusedTask && (
                           <div className="bg-green-50 dark:bg-green-900/10 rounded-2xl p-6 border border-green-100 dark:border-green-800/30 text-center space-y-3">
                              <h3 className="text-sm font-bold text-green-600 dark:text-green-400 uppercase tracking-wide">Current Task</h3>
                              <div className="text-xl font-bold text-gray-900 dark:text-white">
                                {focusedTask.name}
                              </div>
                              {focusedTask.estimatedTime && (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 text-sm font-medium text-gray-600 dark:text-gray-300 shadow-sm">
                                   <Timer className="w-3.5 h-3.5" />
                                   <span>{focusedTask.estimatedTime}</span>
                                </div>
                              )}
                           </div>
                         )}
                         
                         {!focusedTask && (
                            <div className="text-center text-gray-500 italic p-4">
                              No specific task selected.
                            </div>
                         )}
                       </div>
                     )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Profile Tab Content */}
          <div className={activeTab === TABS.PROFILE ? 'block' : 'hidden'}>
            <div className="pt-4 pb-20">
              <Profile 
                grindMode={grindMode} 
                setGrindMode={handleGrindModeChange}
                darkMode={darkMode}
                setDarkMode={handleThemeChange}
              />
            </div>
          </div>

          {/* Social Tab Content - Leaderboard & Pods */}
          <div className={activeTab === TABS.LEADERBOARD ? 'block' : 'hidden'}>
            <div className="pt-4 space-y-6 pb-20">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
                🏆 Social & Community
              </h2>
              
              {/* Sub-navigation for Social */}
              <div className="flex justify-center bg-white dark:bg-slate-800 p-1 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm mx-auto max-w-[320px]">
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

          {/* Goals Tab Content */}
          <div className={activeTab === TABS.GOALS ? 'block' : 'hidden'}>
            <div className="pt-4 pb-20">
              <GoalsTab />
            </div>
          </div>

          {/* Insights Tab Content - Deep Work Score, Weekly Digest, Certificate */}
          <div className={activeTab === TABS.INSIGHTS ? 'block' : 'hidden'}>
            <div className="pt-4 space-y-6 pb-20">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">
                🧠 Deep Work Insights
              </h2>
              
              {/* Community Banner */}
              <CommunityBanner />
              
              {/* Sub-navigation for Insights */}
              <div className="flex justify-center bg-white dark:bg-slate-800 p-1 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm mx-auto">
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
      </div>

      <MobileBottomNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        tabs={visibleTabs} 
      />
    </MobileLayout>
  );
};

export default MobileTimeTracker;
