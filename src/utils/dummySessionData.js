/**
 * Dummy Session Data Generator
 * Creates realistic work session distributions for testing
 */

import { getDateKey } from './timeUtils';
import { STORAGE_KEYS } from '../constants';
import { PLANT_TYPES, GARDEN_STORAGE_KEY } from '../constants/gardenConstants';

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
 * Generate a full year of dummy sessions
 */
export const generateYearOfSessions = (endDate = new Date()) => {
  const allSessions = [];
  const patterns = ['balanced', 'morning', 'intense', 'afternoon', 'balanced', 'light', 'nightowl'];
  
  for (let i = 0; i < 365; i++) {
    const date = new Date(endDate);
    date.setDate(endDate.getDate() - i);
    
    // Add data for ~80% of days
    if (Math.random() > 0.2) {
      const pattern = patterns[Math.floor(Math.random() * patterns.length)];
      const daySessions = generateDummySessions(date, pattern);
      allSessions.push(...daySessions);
    }
  }
  
  return allSessions;
};

/**
 * Inject a full year of dummy data
 */
export const injectYearOfDummyData = () => {
  const sessions = generateYearOfSessions();
  
  // Set sessions
  localStorage.setItem(STORAGE_KEYS.WORK_SESSIONS, JSON.stringify(sessions));
  
  // Update workHistory
  const workHistory = {};
  sessions.forEach(session => {
    const hours = session.duration / (1000 * 60 * 60);
    workHistory[session.dateKey] = (workHistory[session.dateKey] || 0) + hours;
  });
  
  localStorage.setItem(STORAGE_KEYS.WORK_HISTORY, JSON.stringify(workHistory));
  
  window.dispatchEvent(new Event('local-data-updated'));
  
  console.log(`✅ Injected ${sessions.length} sessions across 365 days`);
  return { sessions, workHistory };
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
  
  // Dispatch event for same-tab updates
  window.dispatchEvent(new Event('local-data-updated'));
  
  console.log(`✅ Injected ${sessions.length} dummy sessions for ${dateKey} with pattern: ${pattern}`);
  console.log('Sessions:', sessions);
  
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
  
  // Dispatch event for same-tab updates
  window.dispatchEvent(new Event('local-data-updated'));
  
  console.log(`✅ Injected ${sessions.length} sessions across 7 days`);
  console.log('Work History:', workHistory);
  
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

/**
 * Inject dummy garden data (fill ~half the grid)
 */
export const injectGardenData = () => {
  const plants = Object.values(PLANT_TYPES);
  const newGrid = Array(64).fill(null);
  
  // Fill roughly 32 slots randomly
  for (let i = 0; i < 32; i++) {
    const randomSlot = Math.floor(Math.random() * 64);
    if (!newGrid[randomSlot]) {
      const randomPlant = plants[Math.floor(Math.random() * plants.length)];
      newGrid[randomSlot] = {
        ...randomPlant,
        plantedAt: new Date().toISOString()
      };
    }
  }
  
  localStorage.setItem(GARDEN_STORAGE_KEY, JSON.stringify(newGrid));
  window.dispatchEvent(new Event('local-data-updated'));
  
  console.log('🌳 Injected dummy garden data (half full)');
  return newGrid;
};

/**
 * Set coins to a specific amount
 */
export const setCoinsBalance = (amount = 2000) => {
  localStorage.setItem(COINS_STORAGE_KEY, amount.toString());
  window.dispatchEvent(new Event('local-data-updated'));
  console.log(`💰 Set Focus Coins to: ${amount}`);
};

// Export patterns for reference
export const WORK_PATTERNS = ['morning', 'afternoon', 'balanced', 'intense', 'light', 'nightowl'];

// Make functions available globally for browser console testing
if (typeof window !== 'undefined') {
  window.dummyData = {
    inject: injectDummyData,
    injectWeek: injectWeekOfDummyData,
    injectYear: injectYearOfDummyData,
    injectGarden: injectGardenData,
    setCoins: setCoinsBalance,
    clear: clearAllSessionData,
    patterns: WORK_PATTERNS,
    generate: generateDummySessions,
  };
  
  console.log('🎯 Dummy data utilities loaded! Use in console:');
  console.log('  window.dummyData.inject("balanced") - Inject today\'s data');
  console.log('  window.dummyData.injectWeek() - Inject a full week');
  console.log('  window.dummyData.injectGarden() - Fill half the garden grid');
  console.log('  window.dummyData.setCoins(2000) - Set your coins balance');
  console.log('  window.dummyData.clear() - Clear all data');
  console.log('  Available patterns:', WORK_PATTERNS.join(', '));
}
