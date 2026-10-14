import PropTypes from 'prop-types';
import { formatDurationHours, formatTime } from '../../utils/timeUtils';

/**
 * Displays today's total work hours
 */
export const TodayTotal = ({ hours, currentSessionTime = 0, isTracking = false }) => {
  return (
    <div className="rounded-2xl border border-[#e9e7e1] bg-white p-3 mb-5 shadow-[0_2px_8px_rgba(34,51,39,.05)] dark:border-slate-800 dark:bg-slate-900">
      <div className="text-center text-[#17211b] dark:text-slate-100">
        <div className="text-[9px] font-bold uppercase mb-0.5 tracking-tight text-[#748078]">Today's Total</div>
        <div className="text-lg font-mono font-bold">
          {formatDurationHours(hours)}
        </div>
        {isTracking && (
            <div className="mt-0.5 text-[9px] font-semibold text-[#249653] dark:text-[#4dcd7d]">
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
