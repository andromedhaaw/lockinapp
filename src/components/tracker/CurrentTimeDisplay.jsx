import PropTypes from 'prop-types';
import { Clock } from 'lucide-react';
import { Card } from '../ui';

/**
 * Displays current time in a card
 */
export const CurrentTimeDisplay = ({ timeString }) => {
  return (
    <Card className="mb-5">
      <div className="text-center p-1.5">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <Clock className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
          <span className="text-[10px] text-green-600 dark:text-green-400 font-bold uppercase tracking-wide">Current Time</span>
        </div>
        <div className="text-xl font-mono font-bold text-green-800 dark:text-white">
          {timeString}
        </div>
      </div>
    </Card>
  );
};

CurrentTimeDisplay.propTypes = {
  timeString: PropTypes.string.isRequired,
};
