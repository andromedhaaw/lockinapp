import PropTypes from 'prop-types';
import { formatDurationHours, formatTime } from '../../utils/timeUtils';

/**
 * Displays today's total work hours
 */
export const TodayTotal = ({ hours, currentSessionTime = 0, isTracking = false }) => {
  return (
    <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-2 mb-5 border border-green-200 dark:border-green-800 shadow-sm">
      <div className="text-center text-green-700 dark:text-green-300">
        <div className="text-[9px] font-bold uppercase mb-0.5 tracking-tight">Today's Total</div>
        <div className="text-lg font-mono font-bold">
          {formatDurationHours(hours)}
        </div>
        {isTracking && (
          <div className="mt-0.5 text-[9px] font-semibold text-green-600 dark:text-green-400">
            + Current Session {formatTime(currentSessionTime)}
          </div>
        )}
      </div>
    </div>
  );
};

TodayTotal.propTypes = {
  hours: PropTypes.number.isRequired,
  currentSessionTime: PropTypes.number,
  isTracking: PropTypes.bool,
};
