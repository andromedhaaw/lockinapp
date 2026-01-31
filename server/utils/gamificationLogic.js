
// Basic Levels
const LEVELS = [
  { minHours: 0, title: 'Novice' },
  { minHours: 10, title: 'Initiate' },
  { minHours: 50, title: 'Deep Worker' },
  { minHours: 100, title: 'Flow Master' },
  { minHours: 500, title: 'Monk' },
];

/**
 * Calculate user level based on total hours
 * @param {Number} totalHours 
 * @returns {Object} { level, nextLevel, progress }
 */
exports.calculateLevel = (totalHours) => {
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

/**
 * Calculate streak (Placeholder for robust logic)
 * In a real app we'd analyze recent sessions.
 * For now we rely on the controller to update streak incrementally.
 */
exports.calculateStreak = (lastActiveDate, currentStreak) => {
    // Logic moved to controller or simplified here
    return currentStreak;
};
