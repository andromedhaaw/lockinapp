import { useMemo } from 'react';
import { useWorkHistory } from '../../hooks';
import { getDateKey } from '../../utils/timeUtils';

const ContributionGraph = () => {
  const { getYearData } = useWorkHistory();
  
  // Generate the last 365 days of data
  const { weeks, totalHours } = useMemo(() => {
    // We want to show a full year grid ending today
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364); // roughly 1 year back
    
    // Adjust start date to align with Sunday (day 0) for the grid
    while (startDate.getDay() !== 0) {
      startDate.setDate(startDate.getDate() - 1);
    }

    const weeksData = [];
    const workHistory = JSON.parse(localStorage.getItem('timeTracker_workHistory') || '{}');
    let total = 0;

    // Create 52-53 weeks of data
    let currentWeek = [];
    let currentDate = new Date(startDate);
    
    // Generate dates up to today (or end of current week)
    const endLoopDate = new Date(today);
    while (endLoopDate.getDay() !== 6) {
      endLoopDate.setDate(endLoopDate.getDate() + 1);
    }

    while (currentDate <= endLoopDate) {
      const dateKey = getDateKey(currentDate);
      const hours = workHistory[dateKey] || 0;
      total += hours;

      // Determine color intensity
      let intensity = 'bg-gray-100 dark:bg-slate-800';
      if (hours > 0) intensity = 'bg-green-200';
      if (hours > 2) intensity = 'bg-green-300';
      if (hours > 4) intensity = 'bg-green-500';
      if (hours > 6) intensity = 'bg-green-700';

      currentWeek.push({
        date: new Date(currentDate),
        hours,
        intensity,
        dateKey
      });

      if (currentWeek.length === 7) {
        weeksData.push(currentWeek);
        currentWeek = [];
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return { weeks: weeksData, totalHours: total };
  }, []);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
      <div className="flex justify-between items-end mb-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          {totalHours.toFixed(1)} hours work in the last year
        </h3>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="inline-flex flex-col gap-1 min-w-max">
          {/* Months Header - slightly simplified approx */}
          <div className="flex text-xs text-gray-400 mb-1 ml-8">
            {months.map((m, i) => (
              <div key={i} className="w-12">{m}</div> // Simplified spacing for demo
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
                      className={`w-3 h-3 rounded-sm ${day.intensity} transition-colors hover:ring-1 hover:ring-green-400 cursor-default`}
                      title={`${day.hours} hours on ${day.date.toDateString()}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-400 mt-4 justify-end">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-slate-800"></div>
        <div className="w-3 h-3 rounded-sm bg-green-200"></div>
        <div className="w-3 h-3 rounded-sm bg-green-300"></div>
        <div className="w-3 h-3 rounded-sm bg-green-500"></div>
        <div className="w-3 h-3 rounded-sm bg-green-700"></div>
        <span>More</span>
      </div>
    </div>
  );
};

export default ContributionGraph;
