import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getDateKey,
  getWeekRange,
  getMonthRange,
  getDaysInWeek,
  getDaysInMonth,
  getLast12Months,
  isDateInRange,
} from '../utils/timeUtils';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook for work history management with remote API persistence
 * @returns {Object} Work history state and methods
 */
export const useWorkHistory = () => {
  const { user } = useAuth();
  const [workHistory, setWorkHistory] = useState({});
  const [sessionHistory, setSessionHistory] = useState([]);
  const hasLoaded = useRef(false);

  // Load initial data from localStorage for immediate results
  useEffect(() => {
    const localHistory = JSON.parse(localStorage.getItem('timeTracker_workHistory') || '{}');
    const localSessions = JSON.parse(localStorage.getItem('timeTracker_workSessions') || '[]');
    setWorkHistory(localHistory);
    setSessionHistory(localSessions);
  }, []);

  // Load from API on mount or user change
  useEffect(() => {
    if (!user) {
        return;
    }

    const fetchData = async () => {
      try {
        const res = await api.get('/sessions');
        const sessions = res.data;
        
        setSessionHistory(sessions);

        // Aggregate sessions into workHistory { dateKey: hours }
        const historyMap = { ...workHistory }; // Start with current (possibly local) data
        sessions.forEach(session => {
            const hours = session.duration / (1000 * 60 * 60);
            const dateKey = session.dateKey;
            // Overwrite or append? For now, let's prioritize API data for specific dates
            historyMap[dateKey] = (historyMap[dateKey] || 0) + hours;
        });
        setWorkHistory(historyMap);
        hasLoaded.current = true;
      } catch (error) {
        console.error('Failed to load work history:', error);
      }
    };

    fetchData();
  }, [user]);

  // Listen for storage events (for dummy data injection from console)
  useEffect(() => {
    const handleStorageChange = (e) => {
      // If it's a window event (custom) or a storage event with relevant keys
      const shouldRefresh = !e || !e.key || 
                           e.key === 'timeTracker_workHistory' || 
                           e.key === 'timeTracker_workSessions';
      
      if (shouldRefresh) {
        const localHistory = JSON.parse(localStorage.getItem('timeTracker_workHistory') || '{}');
        const localSessions = JSON.parse(localStorage.getItem('timeTracker_workSessions') || '[]');
        setWorkHistory(localHistory);
        setSessionHistory(localSessions);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Custom event for same-tab updates
    window.addEventListener('local-data-updated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-data-updated', handleStorageChange);
    };
  }, []);

  const saveWorkSession = useCallback(async (hours, sessionDetails) => {
    if (!user) return; // Prevent saving if not logged in

    const today = getDateKey(new Date());
    
    // Convert hours back to milliseconds for DB consistency if needed, 
    // OR just send what we have.
    // sessionDetails has startTime/endTime. 
    // Let's use sessionDetails duration if available, else derive from hours.
    
    // Ideally we calculate duration from start/end in milliseconds.
    let duration = hours * 60 * 60 * 1000;
    if (sessionDetails.startTime && sessionDetails.endTime) {
        duration = new Date(sessionDetails.endTime) - new Date(sessionDetails.startTime);
    }
    
    try {
        const payload = {
            ...sessionDetails,
            dateKey: today,
            duration,
            // Ensure focusMode/deepWorkScore are included if passed in sessionDetails
            userId: user._id
        };
        
        const res = await api.post('/sessions', payload);
        const newSession = res.data;

        // Optimistically update state
        // Update aggregate hours
        setWorkHistory((prev) => ({
            ...prev,
            [today]: (prev[today] || 0) + hours,
        }));

        // Update detailed session log
        setSessionHistory(prev => [newSession, ...prev]);

    } catch (error) {
        console.error("Failed to save session", error);
    }
  }, [user]);

  const getHoursForDate = useCallback(
    (date) => {
      const dateKey = getDateKey(date);
      return workHistory[dateKey] || 0;
    },
    [workHistory]
  );
  
  const getSessionsForDate = useCallback((date) => {
    const dateKey = getDateKey(date);
    return sessionHistory.filter(session => session.dateKey === dateKey);
  }, [sessionHistory]);

  const getTodayKey = useCallback(() => {
    return getDateKey(new Date());
  }, []);

  // Get data for a specific week (by offset)
  const getWeekDataByOffset = useCallback(
    (weekOffset = 0) => {
      const weekRange = getWeekRange(weekOffset);
      const days = getDaysInWeek(weekRange.startDate);
      const todayKey = getDateKey(new Date());

      const data = days.map((date) => ({
        date,
        dateKey: getDateKey(date),
        hours: getHoursForDate(date),
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        sublabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        isToday: getDateKey(date) === todayKey,
      }));

      const totalHours = data.reduce((sum, d) => sum + d.hours, 0);

      return {
        ...weekRange,
        data,
        totalHours,
        averageHours: totalHours / 7,
      };
    },
    [getHoursForDate]
  );

  // Get data for a specific month (by offset)
  const getMonthDataByOffset = useCallback(
    (monthOffset = 0) => {
      const monthRange = getMonthRange(monthOffset);
      const days = getDaysInMonth(monthRange.year, monthRange.month);
      const todayKey = getDateKey(new Date());

      const data = days.map((date) => ({
        date,
        dateKey: getDateKey(date),
        hours: getHoursForDate(date),
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        sublabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        isToday: getDateKey(date) === todayKey,
      }));

      const totalHours = data.reduce((sum, d) => sum + d.hours, 0);

      return {
        ...monthRange,
        data,
        totalHours,
        averageHours: totalHours / days.length,
        daysInMonth: days.length,
      };
    },
    [getHoursForDate]
  );

  // Get hours for a specific month range
  const getHoursForMonthRange = useCallback(
    (monthData) => {
      let total = 0;
      Object.entries(workHistory).forEach(([dateKey, hours]) => {
        const date = new Date(dateKey);
        if (isDateInRange(date, monthData.startDate, monthData.endDate)) {
          total += hours;
        }
      });
      return total;
    },
    [workHistory]
  );

  // Get total hours for the year
  const getTotalYearHours = useCallback(() => {
    const months = getLast12Months();
    return months.reduce((total, month) => {
      return total + getHoursForMonthRange(month);
    }, 0);
  }, [getHoursForMonthRange]);

  // Get data for year view (last 12 months)
  const getYearData = useCallback(() => {
    const months = getLast12Months();
    return months.map((monthData) => ({
      ...monthData,
      hours: getHoursForMonthRange(monthData),
    }));
  }, [getHoursForMonthRange]);

  return {
    workHistory,
    sessionHistory,
    saveWorkSession,
    getHoursForDate,
    getSessionsForDate,
    getTodayKey,
    getWeekDataByOffset,
    getMonthDataByOffset,
    getTotalYearHours,
    getYearData,
  };
};
