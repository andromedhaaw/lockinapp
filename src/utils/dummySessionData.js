/**
 * Dummy Session Data Generator
 * Creates realistic work session distributions for testing
 */

import { getDateKey } from './timeUtils';
import { STORAGE_KEYS } from '../constants';

/**
 * Generate dummy sessions for a specific date
 * @param {Date} date - The date to generate sessions for
 * @param {string} pattern - Work pattern: 'morning', 'afternoon', 'balanced', 'intense', 'light'
 * @returns {Array} Array of session objects
 */
export const generateDummySessions = (date, pattern = 'balanced') => {
  const dateKey = getDateKey(date);
  const sessions = [];
  
  // Define work patterns
  const patterns = {
    // Morning focused worker: 6 AM - 12 PM heavy, light afternoon
    morning: [
      { start: 6.5, duration: 1.5 },   // 6:30 AM - 8:00 AM
      { start: 8.25, duration: 2 },    // 8:15 AM - 10:15 AM
      { start: 10.5, duration: 1.25 }, // 10:30 AM - 11:45 AM
      { start: 14, duration: 0.75 },   // 2:00 PM - 2:45 PM
    ],
    // Afternoon/Evening worker
    afternoon: [
      { start: 10, duration: 0.5 },    // 10:00 AM - 10:30 AM
      { start: 13, duration: 2 },      // 1:00 PM - 3:00 PM
      { start: 15.5, duration: 1.5 },  // 3:30 PM - 5:00 PM
      { start: 19, duration: 2.25 },   // 7:00 PM - 9:15 PM
      { start: 21, duration: 1 },      // 9:00 PM - 10:00 PM
    ],
    // Balanced throughout the day
    balanced: [
      { start: 8, duration: 1.5 },     // 8:00 AM - 9:30 AM
      { start: 10, duration: 1.25 },   // 10:00 AM - 11:15 AM
      { start: 14, duration: 1.5 },    // 2:00 PM - 3:30 PM
      { start: 16, duration: 1 },      // 4:00 PM - 5:00 PM
      { start: 20, duration: 1 },      // 8:00 PM - 9:00 PM
    ],
    // Intense work day (many focused sessions)
    intense: [
      { start: 7, duration: 2 },       // 7:00 AM - 9:00 AM
      { start: 9.5, duration: 2.5 },   // 9:30 AM - 12:00 PM
      { start: 13, duration: 2 },      // 1:00 PM - 3:00 PM
      { start: 15.5, duration: 1.5 },  // 3:30 PM - 5:00 PM
      { start: 18, duration: 1 },      // 6:00 PM - 7:00 PM
      { start: 20, duration: 1.5 },    // 8:00 PM - 9:30 PM
    ],
    // Light work day
    light: [
      { start: 9, duration: 1 },       // 9:00 AM - 10:00 AM
      { start: 14, duration: 0.75 },   // 2:00 PM - 2:45 PM
    ],
    // Night owl pattern
    nightowl: [
      { start: 11, duration: 1 },      // 11:00 AM - 12:00 PM
      { start: 16, duration: 1.5 },    // 4:00 PM - 5:30 PM
      { start: 21, duration: 2 },      // 9:00 PM - 11:00 PM
      { start: 23.5, duration: 0.5 },  // 11:30 PM - 12:00 AM
    ],
  };

  const selectedPattern = patterns[pattern] || patterns.balanced;
  
  selectedPattern.forEach((block, index) => {
    const startHour = Math.floor(block.start);
    const startMinute = (block.start % 1) * 60;
    
    const startTime = new Date(date);
    startTime.setHours(startHour, startMinute, 0, 0);
    
    const durationMs = block.duration * 60 * 60 * 1000; // hours to ms
    const endTime = new Date(startTime.getTime() + durationMs);
    
    sessions.push({
      id: Date.now() + index,
      dateKey,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: durationMs,
    });
  });
  
  return sessions;
};

/**
 * Generate a week of dummy sessions with varying patterns
 * @param {Date} startDate - First day of the week
 * @returns {Array} Array of all sessions for the week
 */
export const generateWeekOfSessions = (startDate = new Date()) => {
  const patterns = ['balanced', 'morning', 'intense', 'afternoon', 'balanced', 'light', 'nightowl'];
  const allSessions = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() - i);
    
    const daySessions = generateDummySessions(date, patterns[i]);
    allSessions.push(...daySessions);
  }
  
  return allSessions;
};

/**
 * Inject dummy data into localStorage for testing
 * @param {string} pattern - Pattern to use for today's data
 */
export const injectDummyData = (pattern = 'balanced') => {
  const today = new Date();
  const sessions = generateDummySessions(today, pattern);
  
  // Get existing sessions
  const existingSessions = JSON.parse(localStorage.getItem(STORAGE_KEYS.WORK_SESSIONS) || '[]');
  
  // Add new dummy sessions
  const dateKey = getDateKey(today);
  const filteredExisting = existingSessions.filter(s => s.dateKey !== dateKey);
  const newSessions = [...filteredExisting, ...sessions];
  
  // Save to localStorage
  localStorage.setItem(STORAGE_KEYS.WORK_SESSIONS, JSON.stringify(newSessions));
  
  // Also update work history
  const existingHistory = JSON.parse(localStorage.getItem(STORAGE_KEYS.WORK_HISTORY) || '{}');
  const totalHours = sessions.reduce((sum, s) => sum + s.duration / (1000 * 60 * 60), 0);
  existingHistory[dateKey] = totalHours;
  localStorage.setItem(STORAGE_KEYS.WORK_HISTORY, JSON.stringify(existingHistory));
  
  console.log(`✅ Injected ${sessions.length} dummy sessions for ${dateKey} with pattern: ${pattern}`);
  console.log('Sessions:', sessions);
  console.log('📦 Refresh the page to see the changes in the DailyBreakdown view!');
  
  return sessions;
};

/**
 * Inject a full week of dummy data
 */
export const injectWeekOfDummyData = () => {
  const sessions = generateWeekOfSessions();
  
  // Set sessions
  localStorage.setItem(STORAGE_KEYS.WORK_SESSIONS, JSON.stringify(sessions));
  
  // Also update the workHistory with aggregate hours
  const workHistory = {};
  sessions.forEach(session => {
    const hours = session.duration / (1000 * 60 * 60);
    workHistory[session.dateKey] = (workHistory[session.dateKey] || 0) + hours;
  });
  
  localStorage.setItem(STORAGE_KEYS.WORK_HISTORY, JSON.stringify(workHistory));
  
  console.log(`✅ Injected ${sessions.length} sessions across 7 days`);
  console.log('Work History:', workHistory);
  console.log('📦 Refresh the page to see the changes!');
  
  return { sessions, workHistory };
};

/**
 * Clear all dummy/session data
 */
export const clearAllSessionData = () => {
  localStorage.removeItem(STORAGE_KEYS.WORK_SESSIONS);
  localStorage.removeItem(STORAGE_KEYS.WORK_HISTORY);
  console.log('🗑️ Cleared all session data');
};

// Export patterns for reference
export const WORK_PATTERNS = ['morning', 'afternoon', 'balanced', 'intense', 'light', 'nightowl'];

// Make functions available globally for browser console testing
if (typeof window !== 'undefined') {
  window.dummyData = {
    inject: injectDummyData,
    injectWeek: injectWeekOfDummyData,
    clear: clearAllSessionData,
    patterns: WORK_PATTERNS,
    generate: generateDummySessions,
  };
  
  console.log('🎯 Dummy data utilities loaded! Use in console:');
  console.log('  window.dummyData.inject("balanced") - Inject today\'s data');
  console.log('  window.dummyData.injectWeek() - Inject a full week');
  console.log('  window.dummyData.clear() - Clear all data');
  console.log('  Available patterns:', WORK_PATTERNS.join(', '));
}
