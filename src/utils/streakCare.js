const CARE_KEY = 'lockin_streak_care';

export const localDateKey = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const startOfDay = (value) => { const date = new Date(value); date.setHours(0, 0, 0, 0); return date; };
const daysBetween = (from, to) => Math.round((startOfDay(to) - startOfDay(from)) / 86400000);
const weekKey = (date = new Date()) => { const d = startOfDay(date); const day = d.getDay() || 7; d.setDate(d.getDate() + 4 - day); const yearStart = new Date(d.getFullYear(), 0, 1); return `${d.getFullYear()}-${Math.ceil((((d - yearStart) / 86400000) + 1) / 7)}`; };

const readCare = () => {
  if (typeof window === 'undefined') return { usedDates: [], freezeWeek: null };
  try { return JSON.parse(localStorage.getItem(CARE_KEY) || '{}'); } catch { return {}; }
};

const saveCare = (care) => {
  if (typeof window !== 'undefined') localStorage.setItem(CARE_KEY, JSON.stringify(care));
};

export const readFocusActivityDates = () => {
  if (typeof window === 'undefined') return new Set();
  try {
    const sessions = JSON.parse(localStorage.getItem('lockin_focus_sessions') || '[]');
    return new Set(sessions.filter((session) => session.completedAt).map((session) => localDateKey(session.completedAt)));
  } catch { return new Set(); }
};

const longestRun = (keys) => {
  const sorted = [...keys].sort();
  let best = 0;
  let run = 0;
  let previous = null;
  sorted.forEach((key) => {
    const date = startOfDay(`${key}T00:00:00`);
    run = previous && daysBetween(previous, date) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    previous = date;
  });
  return best;
};

export const getGentleStreakStatus = (activityDates = readFocusActivityDates()) => {
  const today = startOfDay(new Date());
  const todayKey = localDateKey(today);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const dayBefore = new Date(today); dayBefore.setDate(today.getDate() - 2);
  const yesterdayKey = localDateKey(yesterday);
  const dayBeforeKey = localDateKey(dayBefore);
  const care = readCare();
  const thisWeek = weekKey(today);
  const usedDates = new Set(care.usedDates || []);
  let freezeApplied = false;

  if (!activityDates.has(yesterdayKey) && activityDates.has(dayBeforeKey) && care.freezeWeek !== thisWeek && !usedDates.has(yesterdayKey)) {
    usedDates.add(yesterdayKey);
    freezeApplied = true;
    saveCare({ ...care, usedDates: [...usedDates], freezeWeek: thisWeek, lastFreezeAt: new Date().toISOString() });
  }

  const protectedDates = new Set([...activityDates, ...usedDates]);
  let cursor = new Date(today);
  if (!protectedDates.has(todayKey)) cursor = yesterday;
  let currentStreak = 0;
  while (protectedDates.has(localDateKey(cursor))) {
    currentStreak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const sortedActivity = [...activityDates].sort();
  const lastActiveKey = sortedActivity.at(-1) || null;
  const daysAway = lastActiveKey ? Math.max(0, daysBetween(new Date(`${lastActiveKey}T00:00:00`), today)) : 0;

  return {
    currentStreak,
    bestStreak: longestRun(protectedDates),
    activeDays: activityDates.size,
    daysAway,
    returning: Boolean(lastActiveKey && daysAway >= 2),
    freezeApplied: freezeApplied || usedDates.has(yesterdayKey),
    freezesAvailable: care.freezeWeek === thisWeek ? 0 : 1,
    protectedDates,
  };
};

