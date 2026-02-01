import PropTypes from 'prop-types';
import { formatSessionTime } from '../../utils/timeUtils';

/**
 * Displays session start time
 */
export const SessionInfo = ({ sessionStart }) => {
  if (!sessionStart) return null;

  return (
    <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-2 mb-5 border border-green-200 dark:border-green-800 shadow-sm">
      <div className="text-center text-green-700 dark:text-green-300">
        <div className="text-[9px] font-bold uppercase mb-0.5 tracking-tight">Session Started</div>
        <div className="text-sm font-mono">{formatSessionTime(sessionStart)}</div>
      </div>
    </div>
  );
};

SessionInfo.propTypes = {
  sessionStart: PropTypes.instanceOf(Date),
};
