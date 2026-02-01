import PropTypes from 'prop-types';
import { Card, StatusIndicator } from '../ui';
import { formatTime, formatDuration } from '../../utils/timeUtils';
import { STATUS } from '../../constants';

/**
 * Displays work timer with status
 */
export const WorkTimerDisplay = ({ totalWorkTime, isTracking, isPaused }) => {
  const getStatus = () => {
    if (!isTracking) return STATUS.NOT_STARTED;
    if (isPaused) return STATUS.ON_BREAK;
    return STATUS.WORKING;
  };

  return (
    <Card className="mb-5">
      <div className="text-center p-1.5">
        <div className="mb-0.5">
          <span className="text-[10px] text-green-600 dark:text-green-400 font-bold uppercase tracking-wide">Current Session</span>
        </div>
        <div className="text-2xl font-mono font-bold text-green-800 dark:text-white mb-0.5">
          {formatTime(totalWorkTime)}
        </div>
        <div className="text-xs text-green-600 dark:text-green-400">
          {formatDuration(totalWorkTime)}
        </div>
        <div className="mt-1 text-center flex justify-center">
          <StatusIndicator status={getStatus()} />
        </div>
      </div>
    </Card>
  );
};

WorkTimerDisplay.propTypes = {
  totalWorkTime: PropTypes.number.isRequired,
  isTracking: PropTypes.bool.isRequired,
  isPaused: PropTypes.bool.isRequired,
};
