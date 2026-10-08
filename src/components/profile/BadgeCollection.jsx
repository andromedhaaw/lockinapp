import { useState } from 'react';
import { Lock, Sparkles, X } from 'lucide-react';

const BADGES = [
  { id: 'first-session', emoji: '🌱', title: 'First Lock In', description: 'Complete your first focus session', test: ({ sessions }) => sessions >= 1 },
  { id: 'twenty-hours', emoji: '⏱️', title: 'Getting Momentum', description: 'Reach 20 total focus hours', test: ({ hours }) => hours >= 20 },
  { id: 'hundred-hours', emoji: '💯', title: 'Century Club', description: 'Reach 100 total focus hours', test: ({ hours }) => hours >= 100 },
  { id: 'thousand-hours', emoji: '🏆', title: 'Deep Work Legend', description: 'Reach 1,000 total focus hours', test: ({ hours }) => hours >= 1000 },
  { id: 'week-thirty', emoji: '🔥', title: 'Heavy Week', description: 'Log 30 hours in one week', test: ({ weekHours }) => weekHours >= 30 },
  { id: 'week-forty', emoji: '🚀', title: 'Full Send', description: 'Log 40 hours in one week', test: ({ weekHours }) => weekHours >= 40 },
  { id: 'seven-streak', emoji: '📅', title: 'Hot Streak', description: 'Maintain a 7-day streak', test: ({ streak }) => streak >= 7 },
  { id: 'thirty-streak', emoji: '🌟', title: 'Unstoppable', description: 'Maintain a 30-day streak', test: ({ streak }) => streak >= 30 },
  { id: 'hundred-pomodoros', emoji: '🍅', title: 'Pomodoro Pro', description: 'Complete 100 focus sessions', test: ({ sessions }) => sessions >= 100 },
  { id: 'five-hundred-sessions', emoji: '💎', title: 'Flow Master', description: 'Complete 500 focus sessions', test: ({ sessions }) => sessions >= 500 },
  { id: 'first-hundred-tasks', emoji: '✅', title: 'Task Finisher', description: 'Complete 100 tasks', test: ({ tasks }) => tasks >= 100 },
  { id: 'five-hundred-tasks', emoji: '🧹', title: 'Inbox Zero Hero', description: 'Complete 500 tasks', test: ({ tasks }) => tasks >= 500 },
  { id: 'ten-trees', emoji: '🌲', title: 'Little Forest', description: 'Plant 10 trees in your garden', test: ({ trees }) => trees >= 10 },
  { id: 'fifty-trees', emoji: '🌳', title: 'Garden Keeper', description: 'Plant 50 trees in your garden', test: ({ trees }) => trees >= 50 },
  { id: 'weekly-top-three', emoji: '🥇', title: 'Weekly Podium', description: 'Finish in the weekly top 3', test: ({ weeklyRank }) => weeklyRank > 0 && weeklyRank <= 3 },
  { id: 'monthly-top-three', emoji: '🏅', title: 'Monthly Podium', description: 'Finish in the monthly top 3', test: ({ monthlyRank }) => monthlyRank > 0 && monthlyRank <= 3 },
  { id: 'five-day-week', emoji: '📈', title: 'Consistent Week', description: 'Work on 5 days in one week', test: ({ activeDays }) => activeDays >= 5 },
  { id: 'early-start', emoji: '🌅', title: 'Early Lock In', description: 'Complete a session before 9 AM', test: ({ earlySession }) => earlySession },
  { id: 'long-session', emoji: '🧠', title: 'Deep Dive', description: 'Complete a 90-minute session', test: ({ longSession }) => longSession },
];

const EXTRA_BADGES = Array.from({ length: 30 }, (_, index) => {
  const number = index + 1;
  const isHours = index % 3 === 0;
  const threshold = isHours ? number * 50 + 50 : number * 25 + 25;
  const milestoneEmojis = ['🪴', '🧩', '🛠️', '📚', '🎧', '🕯️', '🗂️', '🖊️', '🧱', '🛰️', '🔭', '🧭', '🪨', '🫶', '🎒', '🧸', '🪄', '🧵', '🫡', '🦉', '🐝', '🦋', '🐢', '🦊', '🐙', '🌻', '🍀', '🌵', '🍄', '🌴'];
  return {
    id: `milestone-${number}`,
    emoji: milestoneEmojis[index],
    title: isHours ? `${threshold}h Builder` : `${threshold} Sessions`,
    description: isHours ? `Reach ${threshold} total focus hours` : `Complete ${threshold} focus sessions`,
    test: isHours ? ({ hours }) => hours >= threshold : ({ sessions }) => sessions >= threshold,
  };
});

const ALL_BADGES = [...BADGES, ...EXTRA_BADGES];

const BadgeCollection = ({ totalHours, weekHours, streak, sessions, tasks = 0, trees = 0, weeklyRank = 0, monthlyRank = 0, activeDays = 0, earlySession = false, longSession = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const stats = { hours: totalHours, totalHours, weekHours, streak, sessions, tasks, trees, weeklyRank, monthlyRank, activeDays, earlySession, longSession };
  const unlocked = ALL_BADGES.filter((badge) => badge.test(stats)).length;

  const BadgeGrid = ({ badges }) => (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      {badges.map((badge) => {
        const isUnlocked = badge.test(stats);
        return (
          <div key={badge.id} title={badge.description} className={`relative flex min-h-[116px] flex-col items-center justify-center rounded-xl border p-3 text-center transition ${isUnlocked ? 'border-[#4dcd7d] bg-[#f8fbf9] dark:bg-[#4dcd7d]/10' : 'border-slate-200 bg-slate-50 opacity-50 dark:border-slate-700 dark:bg-slate-800'}`}>
            {!isUnlocked && <Lock className="absolute right-2 top-2 h-3 w-3 text-slate-400" />}
            <div className={`text-3xl ${isUnlocked ? '' : 'grayscale'}`}>{badge.emoji}</div>
            <div className="mt-2 text-[11px] font-extrabold text-slate-800 dark:text-slate-100">{badge.title}</div>
            <div className="mt-1 text-[9px] leading-tight text-slate-400">{badge.description}</div>
          </div>
        );
      })}
    </div>
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
      <div className="mb-4 flex items-end justify-between">
        <div><div className="flex items-center gap-2 text-lg font-extrabold text-slate-900 dark:text-white"><Sparkles className="h-4 w-4 text-[#4dcd7d]" /> Badge Collection</div><p className="mt-1 text-xs text-slate-400">Milestone kerja yang sudah kamu capai</p></div>
        <button onClick={() => setIsOpen(true)} className="text-xs font-bold text-[#249653] hover:underline">{unlocked} / {ALL_BADGES.length} unlocked · View all</button>
      </div>
      <BadgeGrid badges={ALL_BADGES.slice(0, 10)} />
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="mx-auto min-h-full max-w-5xl rounded-3xl bg-white p-5 shadow-2xl dark:bg-slate-900 sm:p-8">
            <div className="mb-6 flex items-start justify-between"><div><h2 className="text-2xl font-black text-slate-900 dark:text-white">Badge Collection</h2><p className="mt-1 text-sm text-slate-400">{unlocked} / {ALL_BADGES.length} unlocked</p></div><button onClick={() => setIsOpen(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></div>
            <BadgeGrid badges={ALL_BADGES} />
          </div>
        </div>
      )}
    </section>
  );
};

export default BadgeCollection;
