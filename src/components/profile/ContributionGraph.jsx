import { useMemo, useState, useEffect, useRef } from 'react';
import { Sparkles, Check } from 'lucide-react';
import { useWorkHistory } from '../../hooks';
import { getDateKey } from '../../utils/timeUtils';

const ContributionGraph = () => {
  const { workHistory, sessionHistory } = useWorkHistory();
  const [seeded, setSeeded] = useState(false);
  const scrollRef = useRef(null);
  const currentYear = new Date().getFullYear();
  
  // Generate the full calendar year of data (Jan 1 to Dec 31)
  const { weeks, totalContributions, totalSessions } = useMemo(() => {
    const startDate = new Date(currentYear, 0, 1);
    
    // Adjust start date to align with Sunday (day 0) for the grid
    while (startDate.getDay() !== 0) {
      startDate.setDate(startDate.getDate() - 1);
    }

    const weeksData = [];
    let contributionCount = 0;

    // Create enough weeks to cover the full year
    let currentDate = new Date(startDate);
    const endLoopDate = new Date(currentYear, 11, 31);
    
    // Ensure we complete the last week
    while (endLoopDate.getDay() !== 6) {
      endLoopDate.setDate(endLoopDate.getDate() + 1);
    }

    let currentWeek = [];
    while (currentDate <= endLoopDate) {
      const dateKey = getDateKey(currentDate);
      const hours = workHistory[dateKey] || 0;
      
      // A contribution is a day with work
      if (hours > 0) contributionCount++;

      // Determine color intensity based on hours (GitHub style)
      let intensity = 'bg-gray-100 dark:bg-slate-800/50';
      if (hours > 0) intensity = 'bg-green-100 dark:bg-green-900/20';
      if (hours > 2) intensity = 'bg-green-300 dark:bg-green-700/40';
      if (hours > 4) intensity = 'bg-green-500 dark:bg-green-500/80';
      if (hours > 6) intensity = 'bg-green-700 dark:bg-green-400';

      currentWeek.push({
        date: new Date(currentDate),
        hours,
        intensity,
        dateKey,
        isCurrentMonth: currentDate.getFullYear() === currentYear
      });

      if (currentWeek.length === 7) {
        weeksData.push(currentWeek);
        currentWeek = [];
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    const sessionsInYear = sessionHistory.filter(s => s.dateKey && s.dateKey.startsWith(currentYear.toString())).length;

    return { 
      weeks: weeksData, 
      totalContributions: contributionCount,
      totalSessions: sessionsInYear
    };
  }, [workHistory, sessionHistory, currentYear]);

  const monthLabels = useMemo(() => {
    const labels = [];
    weeks.forEach((week, index) => {
      const firstDay = week[0].date;
      if (firstDay.getDate() <= 7) {
        const monthName = firstDay.toLocaleDateString('en-US', { month: 'short' });
        if (labels.length === 0 || labels[labels.length - 1].name !== monthName) {
          labels.push({ index, name: monthName });
        }
      }
    });
    return labels;
  }, [weeks]);
  
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
      <div className="flex justify-between items-end mb-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">
          <span className="font-bold">{totalSessions || totalContributions} Deep Work Sessions</span> in {currentYear}
        </h3>
        {totalContributions === 0 && !seeded && (
          <button 
            onClick={() => {
              if (window.dummyData) {
                window.dummyData.injectYear();
                setSeeded(true);
                setTimeout(() => setSeeded(false), 3000);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold rounded-lg transition-all shadow-sm shadow-green-900/10 animate-pulse hover:animate-none"
          >
            <Sparkles className="w-3 h-3" />
            Seed Demo Data
          </button>
        )}
        {seeded && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-lg animate-in zoom-in duration-300">
            <Check className="w-3 h-3" />
            Data Seeded!
          </div>
        )}
      </div>

      <div className="overflow-x-auto pb-2 scroll-smooth" ref={scrollRef}>
        <div className="inline-flex flex-col gap-1 min-w-max">
          {/* Months Header */}
          <div className="relative flex text-[10px] text-gray-400 mb-2 ml-8 h-4">
            {monthLabels.map((m, i) => (
              <div 
                key={i} 
                className="absolute whitespace-nowrap" 
                style={{ left: `${m.index * 16}px` }}
              >
                {m.name}
              </div>
            ))}
          </div>

          <div className="flex gap-1">
            {/* Days of week labels */}
            <div className="flex flex-col gap-1 text-[10px] text-gray-400 mr-2 pt-2">
              <div className="h-2">Mon</div>
              <div className="h-2 mt-3">Wed</div>
              <div className="h-2 mt-3">Fri</div>
            </div>

            {/* The Grid */}
            <div className="flex gap-1">
              {weeks.map((week, wIndex) => (
                <div key={wIndex} className="flex flex-col gap-1">
                  {week.map((day, dIndex) => (
                    <div
                      key={day.dateKey}
                      className={`w-[11px] h-[11px] rounded-[2px] ${day.intensity} transition-colors hover:ring-1 hover:ring-green-400 cursor-default ${!day.isCurrentMonth ? 'opacity-0 pointer-events-none' : ''}`}
                      title={`${day.hours.toFixed(1)} hours on ${day.date.toLocaleDateString()}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
        <div className="text-[10px] text-gray-400 hover:underline cursor-pointer">
          Learn how we count contributions
        </div>
        <div className="flex items-center gap-2 text-[10px] text-gray-400">
          <span>Less</span>
          <div className="w-[11px] h-[11px] rounded-[2px] bg-gray-100 dark:bg-slate-800/50"></div>
          <div className="w-[11px] h-[11px] rounded-[2px] bg-green-100 dark:bg-green-900/20"></div>
          <div className="w-[11px] h-[11px] rounded-[2px] bg-green-300 dark:bg-green-700/40"></div>
          <div className="w-[11px] h-[11px] rounded-[2px] bg-green-500 dark:bg-green-500/80"></div>
          <div className="w-[11px] h-[11px] rounded-[2px] bg-green-700 dark:bg-green-400"></div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

export default ContributionGraph;
