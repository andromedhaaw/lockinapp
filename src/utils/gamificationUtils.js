import { getDateKey } from './timeUtils';

export const LEVELS = [
  { minHours: 0, title: 'Novice', color: 'text-gray-600', bg: 'bg-gray-100' },
  { minHours: 10, title: 'Initiate', color: 'text-blue-600', bg: 'bg-blue-100' },
  { minHours: 50, title: 'Deep Worker', color: 'text-green-600', bg: 'bg-green-100' },
  { minHours: 100, title: 'Flow Master', color: 'text-purple-600', bg: 'bg-purple-100' },
  { minHours: 500, title: 'Monk', color: 'text-amber-600', bg: 'bg-amber-100' },
];

export const calculateStreak = (history = {}) => {
  let streak = 0;
  const today = new Date();
  
  // Check today first
  const todayKey = getDateKey(today);
  if (history[todayKey] > 0) {
    streak++;
  }

  // Check past days
  let currentDate = new Date(today);
  // If we haven't worked today yet, satisfy streak logic by checking yesterday
  if (streak === 0) {
     currentDate.setDate(currentDate.getDate() - 1);
     const yesterdayKey = getDateKey(currentDate);
     if (!history[yesterdayKey]) return 0; // Streak broken
  } else {
     // If we did work today, start checking from yesterday
     currentDate.setDate(currentDate.getDate() - 1);
  }

  while (true) {
    const key = getDateKey(currentDate);
    if (history[key] > 0) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
};

export const calculateLevel = (totalHours) => {
  let currentLevel = LEVELS[0];
  let nextLevel = LEVELS[1];

  for (let i = 0; i < LEVELS.length; i++) {
    if (totalHours >= LEVELS[i].minHours) {
      currentLevel = LEVELS[i];
      nextLevel = LEVELS[i + 1] || null;
    } else {
      break;
    }
  }

  const progress = nextLevel 
    ? ((totalHours - currentLevel.minHours) / (nextLevel.minHours - currentLevel.minHours)) * 100
    : 100;

  return {
    level: currentLevel,
    nextLevel,
    progress: Math.min(100, Math.max(0, progress))
  };
};
