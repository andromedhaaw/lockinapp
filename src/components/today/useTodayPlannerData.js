import { useEffect, useState } from 'react';

const readStored = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

const persist = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (error) { console.error(error); }
};

const useTodayPlannerData = ({ initialBrainDump, initialDays, initialTimebox }) => {
  const [brainDump, setBrainDump] = useState(() => readStored('lockin_today_braindump', initialBrainDump));
  const [days, setDays] = useState(() => readStored('lockin_today_days', initialDays));
  const [timeboxEvents, setTimeboxEvents] = useState(() => readStored('lockin_today_timebox', initialTimebox));
  const [celebratedTaskTitle, setCelebratedTaskTitle] = useState(null);

  useEffect(() => {
    const syncExternalChanges = () => {
      setBrainDump(readStored('lockin_today_braindump', initialBrainDump));
      setDays(readStored('lockin_today_days', initialDays));
      setTimeboxEvents(readStored('lockin_today_timebox', initialTimebox));
    };
    const celebrate = (event) => {
      const title = event.detail?.title;
      if (!title) return;
      setCelebratedTaskTitle(title);
      window.setTimeout(() => setCelebratedTaskTitle(null), 900);
    };
    window.addEventListener('local-data-updated', syncExternalChanges);
    window.addEventListener('focus-task-completed', celebrate);
    return () => {
      window.removeEventListener('local-data-updated', syncExternalChanges);
      window.removeEventListener('focus-task-completed', celebrate);
    };
  }, [initialBrainDump, initialDays, initialTimebox]);

  useEffect(() => persist('lockin_today_braindump', brainDump), [brainDump]);
  useEffect(() => persist('lockin_today_days', days), [days]);
  useEffect(() => persist('lockin_today_timebox', timeboxEvents), [timeboxEvents]);

  return { brainDump, setBrainDump, days, setDays, timeboxEvents, setTimeboxEvents, celebratedTaskTitle };
};

export default useTodayPlannerData;
