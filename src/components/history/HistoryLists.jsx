import { useState } from 'react';
import PropTypes from 'prop-types';
import { Card } from '../ui';
import { DailyBreakdown } from './DailyBreakdown';

/**
 * Displays list of days with their work hours
 */
export const DaysList = ({ data, todayTotalHours, getSessionsForDate }) => {
  const [selectedDay, setSelectedDay] = useState(null);

  const handleDayClick = (item) => {
    // If we have the helper, get sessions. Otherwise just pass empty array (legacy)
    const sessions = getSessionsForDate ? getSessionsForDate(item.date) : [];
    setSelectedDay({
      date: item.date,
      sessions: sessions
    });
  };

  return (
    <>
      <Card>
        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
          {data.map((item) => {
            const isToday = item.isToday;
            const hours = item.hours;

            return (
              <div
                key={item.dateKey}
                onClick={() => handleDayClick(item)}
                className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                  isToday 
                    ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                    : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      hours > 0 ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                  <div>
                    <div
                      className={`font-medium ${
                        isToday ? 'text-green-800 dark:text-green-300' : 'text-gray-800 dark:text-white'
                      }`}
                    >
                      {item.label}
                      {isToday && (
                        <span className="text-xs bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200 px-2 py-1 rounded-full ml-2">
                          Today
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{item.sublabel}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`font-mono font-bold ${
                      hours > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-600'
                    }`}
                  >
                    {hours.toFixed(2)}h
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Daily Breakdown Modal */}
      {selectedDay && (
        <DailyBreakdown 
          date={selectedDay.date}
          sessions={selectedDay.sessions}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </>
  );
};

DaysList.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      dateKey: PropTypes.string.isRequired,
      hours: PropTypes.number.isRequired,
      label: PropTypes.string.isRequired,
      sublabel: PropTypes.string.isRequired,
      isToday: PropTypes.bool,
      date: PropTypes.instanceOf(Date).isRequired
    })
  ).isRequired,
  todayTotalHours: PropTypes.number,
  getSessionsForDate: PropTypes.func
};

/**
 * Displays list of months with their work hours
 */
export const MonthsList = ({ data }) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return (
    <Card>
      <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
        {data.map((item) => {
          const isCurrentMonth =
            item.month === currentMonth && item.year === currentYear;

          return (
            <div
              key={`${item.year}-${item.month}`}
              className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                isCurrentMonth
                  ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800'
                  : 'bg-gray-50 dark:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    item.hours > 0 ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
                <div>
                  <div
                    className={`font-medium ${
                      isCurrentMonth ? 'text-green-800 dark:text-green-300' : 'text-gray-800 dark:text-white'
                    }`}
                  >
                    {item.label}
                    {isCurrentMonth && (
                      <span className="text-xs bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200 px-2 py-1 rounded-full ml-2">
                        Current
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`font-mono font-bold ${
                    item.hours > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-600'
                  }`}
                >
                  {item.hours.toFixed(2)}h
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

MonthsList.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      year: PropTypes.number.isRequired,
      month: PropTypes.number.isRequired,
      label: PropTypes.string.isRequired,
      hours: PropTypes.number.isRequired,
    })
  ).isRequired,
};
