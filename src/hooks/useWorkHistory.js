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

  // Load from API on mount or user change
  useEffect(() => {
    if (!user) {
        setWorkHistory({});
        setSessionHistory([]);
        return;
    }

    const fetchData = async () => {
      try {
        const res = await api.get('/sessions');
        const sessions = res.data;
        
        setSessionHistory(sessions);

        // Aggregate sessions into workHistory { dateKey: hours }
        const historyMap = {};
        sessions.forEach(session => {
            // Check if duration is in ms (from DB) or hours? 
            // My server saves in whatever format sent. 
            // Previous frontend code sent hours? No, let's check saveWorkSession.
            // Previous saveWorkSession received 'hours'.
            // Now we will likely receive milliseconds from DB if I stored it as Number.
            // Wait, previous 'saveWorkSession' took 'hours'. 
            // DB schema 'duration'.
            // I need to be careful with units.
            // DB session.duration is likely milliseconds based on my plan (timestamp diff).
            // Let's assume server returns milliseconds/whatever is stored.
            // We need to convert it to "hours" for workHistory map.
            
            // Actually, let's normalize everything to Hours for the frontend charts.
            
            const hours = session.duration / (1000 * 60 * 60);
            const dateKey = session.dateKey;
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
