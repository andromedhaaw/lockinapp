/**
 * Time formatting utility functions
 */

/**
 * Format milliseconds to HH:MM:SS string
 * @param {number} milliseconds - Time in milliseconds
 * @returns {string} Formatted time string
 */
export const formatTime = (milliseconds) => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  return `${hours.toString().padStart(2, '0')}:${(minutes % 60)
    .toString()
    .padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
};

/**
 * Format milliseconds to decimal hours
 * @param {number} milliseconds - Time in milliseconds
 * @returns {string} Hours with 2 decimal places
 */
export const formatTimeToHours = (milliseconds) => {
  const hours = milliseconds / (1000 * 60 * 60);
  return hours.toFixed(2);
};

/**
 * Format milliseconds to readable duration string
 * @param {number} milliseconds - Time in milliseconds
 * @returns {string} Duration string (e.g., "1 hour 30 minutes")
 */
export const formatDuration = (milliseconds) => {
  const totalMinutes = Math.floor(milliseconds / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  const hText = hours === 1 ? 'hour' : 'hours';
  const mText = minutes === 1 ? 'minute' : 'minutes';
  
  return `${hours} ${hText} ${minutes} ${mText}`;
};

/**
 * Format decimal hours to readable duration string
 * @param {number} hoursNum - Time in hours
 * @returns {string} Duration string (e.g., "1 hour 30 minutes")
 */
export const formatDurationHours = (hoursNum) => {
  const totalMinutes = Math.round(hoursNum * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  const hText = hours === 1 ? 'hour' : 'hours';
  const mText = minutes === 1 ? 'minute' : 'minutes';
  
  return `${hours} ${hText} ${minutes} ${mText}`;
};

/**
 * Get ISO date string for use as storage key
 * @param {Date} date - Date object
 * @returns {string} ISO date string (YYYY-MM-DD)
 */
export const getDateKey = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get array of last 7 days including today
 * @returns {Date[]} Array of Date objects
 */
export const getLast7Days = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date);
  }
  return days;
};

/**
 * Get short weekday name
 * @param {Date} date - Date object
 * @returns {string} Short weekday name (e.g., "Mon")
 */
export const getDayName = (date) => {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

/**
 * Get formatted date string
 * @param {Date} date - Date object
 * @returns {string} Formatted date (e.g., "Jan 15")
 */
export const getFormattedDate = (date) => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format date for display
 * @param {Date} date - Date object
 * @returns {string} Full formatted date
 */
export const formatFullDate = (date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format time for display (24-hour format)
 * @param {Date} date - Date object
 * @returns {string} Time string (HH:MM:SS)
 */
export const formatCurrentTime = (date) => {
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

/**
 * Format time for session start display
 * @param {Date} date - Date object
 * @returns {string} Time string (HH:MM)
 */
export const formatSessionTime = (date) => {
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get array of last N days including today
 * @param {number} days - Number of days
 * @returns {Date[]} Array of Date objects
 */
export const getLastNDays = (days) => {
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    result.push(date);
  }
  return result;
};

/**
 * Get array of last 12 months including current month
 * @returns {Object[]} Array of {year, month, label} objects
 */
export const getLast12Months = () => {
  const months = [];
  const now = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      year: date.getFullYear(),
      month: date.getMonth(),
      label: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      startDate: new Date(date.getFullYear(), date.getMonth(), 1),
      endDate: new Date(date.getFullYear(), date.getMonth() + 1, 0),
    });
  }
  return months;
};

/**
 * Get start and end dates for a given week offset (negative = past, positive = future)
 * @param {number} weekOffset - Number of weeks from current (negative = past, positive = future)
 * @returns {Object} { startDate, endDate, label }
 */
export const getWeekRange = (weekOffset = 0) => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  
  // Start of current week (Sunday)
  const startOfCurrentWeek = new Date(now);
  startOfCurrentWeek.setDate(now.getDate() - dayOfWeek);
  startOfCurrentWeek.setHours(0, 0, 0, 0);
  
  // Apply offset
  const startOfWeek = new Date(startOfCurrentWeek);
  startOfWeek.setDate(startOfCurrentWeek.getDate() + (weekOffset * 7));
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  // Format label
  const startLabel = startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endLabel = endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const label = `${startLabel} - ${endLabel}`;
  
  return { startDate: startOfWeek, endDate: endOfWeek, label };
};

/**
 * Get month range for a given offset (negative = past, positive = future)
 * @param {number} monthOffset - Number of months from current
 * @returns {Object} { year, month, startDate, endDate, label }
 */
export const getMonthRange = (monthOffset = 0) => {
  const now = new Date();
  const targetDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  
  const startDate = new Date(year, month, 1);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(year, month + 1, 0);
  endDate.setHours(23, 59, 59, 999);
  
  const label = targetDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  return { year, month, startDate, endDate, label };
};

/**
 * Get array of days in a specific week
 * @param {Date} startDate - Start of the week
 * @returns {Date[]} Array of Date objects
 */
export const getDaysInWeek = (startDate) => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    days.push(date);
  }
  return days;
};

/**
 * Get array of days in a specific month
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @returns {Date[]} Array of Date objects
 */
export const getDaysInMonth = (year, month) => {
  const days = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }
  return days;
};

/**
 * Check if a date falls within a range
 * @param {Date} date - Date to check
 * @param {Date} startDate - Range start
 * @param {Date} endDate - Range end
 * @returns {boolean}
 */
export const isDateInRange = (date, startDate, endDate) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  return d >= start && d <= end;
};

/**
 * Check if a week offset is in the future
 * @param {number} weekOffset - Week offset
 * @returns {boolean}
 */
export const isWeekInFuture = (weekOffset) => {
  return weekOffset > 0;
};

/**
 * Check if a month offset is in the future
 * @param {number} monthOffset - Month offset
 * @returns {boolean}
 */
export const isMonthInFuture = (monthOffset) => {
  return monthOffset > 0;
};

/**
 * Get month name
 * @param {number} monthIndex - Month index (0-11)
 * @returns {string} Month name
 */
export const getMonthName = (monthIndex) => {
  const date = new Date(2000, monthIndex, 1);
  return date.toLocaleDateString('en-US', { month: 'long' });
};
