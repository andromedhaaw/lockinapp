import PropTypes from 'prop-types';
import { STATUS } from '../../constants';

const statusConfig = {
  [STATUS.WORKING]: {
    dotClass: 'bg-green-500 animate-pulse',
    textClass: 'text-green-600',
  },
  [STATUS.ON_BREAK]: {
    dotClass: 'bg-yellow-500 animate-pulse',
    textClass: 'text-yellow-600',
  },
  [STATUS.NOT_STARTED]: {
    dotClass: 'bg-gray-300',
    textClass: 'text-gray-500',
  },
};

/**
 * Status indicator with animated dot
 */
export const StatusIndicator = ({ status = STATUS.NOT_STARTED }) => {
  const config = statusConfig[status] || statusConfig[STATUS.NOT_STARTED];

  return (
    <div className="flex items-center justify-center gap-2">
      <div className={`w-3 h-3 rounded-full ${config.dotClass}`} />
      <span className={`text-sm font-medium ${config.textClass}`}>{status}</span>
    </div>
  );
};

StatusIndicator.propTypes = {
  status: PropTypes.oneOf(Object.values(STATUS)),
};
