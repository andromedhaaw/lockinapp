import { useState, useEffect, useCallback } from 'react';
import { formatTimeToHours } from '../utils/timeUtils';
import { TIMER_UPDATE_INTERVAL } from '../constants';

/**
 * Custom hook for work timer functionality
 * @param {Function} onSessionComplete - Callback when session ends, receives work hours
 * @returns {Object} Timer state and control functions
 */
export const useWorkTimer = (onSessionComplete) => {
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [totalWorkTime, setTotalWorkTime] = useState(0);
  const [pausedTime, setPausedTime] = useState(0);
  const [pauseStart, setPauseStart] = useState(null);
  const [sessionStart, setSessionStart] = useState(null);

  // Calculate active work time
  const getActiveWorkTime = useCallback(() => {
    if (!startTime) return 0;

    const now = new Date();
    const totalElapsed = now - startTime;
    const currentPauseTime = pauseStart ? now - pauseStart : 0;

    return Math.max(0, totalElapsed - pausedTime - currentPauseTime);
  }, [startTime, pausedTime, pauseStart]);

  // Update work time display
  useEffect(() => {
    let interval;
    if (isTracking && !isPaused) {
      interval = setInterval(() => {
        setTotalWorkTime(getActiveWorkTime());
      }, TIMER_UPDATE_INTERVAL);
    }
    return () => clearInterval(interval);
  }, [isTracking, isPaused, getActiveWorkTime]);

  const handleStart = useCallback(() => {
    const now = new Date();
    setStartTime(now);
    setSessionStart(now);
    setIsTracking(true);
    setIsPaused(false);
    setTotalWorkTime(0);
    setPausedTime(0);
    setPauseStart(null);
  }, []);

  const handlePause = useCallback(() => {
    if (isPaused) {
      // Resume from pause
      if (pauseStart) {
        setPausedTime((prev) => prev + (new Date() - pauseStart));
        setPauseStart(null);
      }
      setIsPaused(false);
    } else {
      // Start pause
      setPauseStart(new Date());
      setIsPaused(true);
    }
  }, [isPaused, pauseStart]);

  const handleFinish = useCallback(() => {
    if (pauseStart) {
      setPausedTime((prev) => prev + (new Date() - pauseStart));
    }
    const finalWorkTime = getActiveWorkTime();
    setTotalWorkTime(finalWorkTime);

    // Call callback with work hours and session details
    if (onSessionComplete) {
      const hours = parseFloat(formatTimeToHours(finalWorkTime));
      onSessionComplete(hours, {
        startTime: sessionStart,
        endTime: new Date(),
        duration: finalWorkTime
      });
    }

    setIsTracking(false);
    setIsPaused(false);
    setPauseStart(null);
  }, [pauseStart, getActiveWorkTime, onSessionComplete]);

  return {
    isTracking,
    isPaused,
    totalWorkTime,
    sessionStart,
    handleStart,
    handlePause,
    handleFinish,
  };
};
