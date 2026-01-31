import PropTypes from 'prop-types';
import { formatDurationHours } from '../../utils/timeUtils';

/**
 * Displays today's total work hours
 */
export const TodayTotal = ({ hours }) => {
  return (
    <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 mb-6 border border-green-200 dark:border-green-800">
      <div className="text-center text-green-700 dark:text-green-300">
        <div className="text-sm font-medium mb-1">Today's Total</div>
        <div className="text-2xl font-mono font-bold">
          {formatDurationHours(hours)}
        </div>
      </div>
    </div>
  );
};

TodayTotal.propTypes = {
  hours: PropTypes.number.isRequired,
};
