import PropTypes from 'prop-types';
import { Clock } from 'lucide-react';
import { Card } from '../ui';

/**
 * Displays current time in a card
 */
export const CurrentTimeDisplay = ({ timeString }) => {
  return (
    <Card className="mb-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
          <span className="text-green-600 dark:text-green-400 font-medium">Current Time</span>
        </div>
        <div className="text-4xl font-mono font-bold text-green-800 dark:text-white">
          {timeString}
        </div>
      </div>
    </Card>
  );
};

CurrentTimeDisplay.propTypes = {
  timeString: PropTypes.string.isRequired,
};
