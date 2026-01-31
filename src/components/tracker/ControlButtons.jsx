import PropTypes from 'prop-types';
import { Play, Coffee, Square } from 'lucide-react';
import { Button } from '../ui';

/**
 * Timer control buttons
 */
export const ControlButtons = ({
  isTracking,
  isPaused,
  onStart,
  onPause,
  onFinish,
}) => {
  if (!isTracking) {
    return (
      <Button onClick={onStart} fullWidth className="text-lg gap-3">
        <Play className="w-6 h-6" />
        Start Working
      </Button>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <Button
        variant={isPaused ? 'primary' : 'warning'}
        onClick={onPause}
      >
        {isPaused ? (
          <>
            <Play className="w-5 h-5" />
            Resume
          </>
        ) : (
          <>
            <Coffee className="w-5 h-5" />
            Break
          </>
        )}
      </Button>
      <Button variant="danger" onClick={onFinish}>
        <Square className="w-5 h-5" />
        Finish
      </Button>
    </div>
  );
};

ControlButtons.propTypes = {
  isTracking: PropTypes.bool.isRequired,
  isPaused: PropTypes.bool.isRequired,
  onStart: PropTypes.func.isRequired,
  onPause: PropTypes.func.isRequired,
  onFinish: PropTypes.func.isRequired,
};
