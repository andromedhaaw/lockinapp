import { useState, useEffect } from 'react';
import { formatFullDate, formatCurrentTime } from '../utils/timeUtils';
import { CLOCK_UPDATE_INTERVAL } from '../constants';

/**
 * Custom hook for real-time clock
 * @returns {Object} Current time data and formatted strings
 */
export const useCurrentTime = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, CLOCK_UPDATE_INTERVAL);

    return () => clearInterval(timer);
  }, []);

  return {
    currentTime,
    currentDate: formatFullDate(currentTime),
    currentTimeString: formatCurrentTime(currentTime),
  };
};
