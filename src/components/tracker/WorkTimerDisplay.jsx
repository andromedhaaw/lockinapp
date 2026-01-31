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
    <Card className="mb-6">
      <div className="text-center">
        <div className="mb-4">
          <span className="text-green-600 dark:text-green-400 font-medium">Current Session</span>
        </div>
        <div className="text-5xl font-mono font-bold text-green-800 dark:text-white mb-2">
          {formatTime(totalWorkTime)}
        </div>
        <div className="text-lg text-green-600 dark:text-green-400">
          {formatDuration(totalWorkTime)}
        </div>
        <div className="mt-4">
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
