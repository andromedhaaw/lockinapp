import PropTypes from 'prop-types';
import { Card } from '../ui';

/**
 * Displays period summary with total and average
 */
export const PeriodSummary = ({ title, totalHours, averageLabel, averageHours }) => {
  return (
    <Card className="mb-6">
      <div className="text-center">
        <div className="text-green-600 dark:text-green-400 font-medium mb-2">{title}</div>
        <div className="text-3xl font-mono font-bold text-green-800 dark:text-white">
          {totalHours.toFixed(2)} hours
        </div>
        {averageLabel && (
          <div className="text-sm text-green-600 dark:text-green-400 mt-2">
            Average: {averageHours.toFixed(2)} {averageLabel}
          </div>
        )}
      </div>
    </Card>
  );
};

PeriodSummary.propTypes = {
  title: PropTypes.string.isRequired,
  totalHours: PropTypes.number.isRequired,
  averageLabel: PropTypes.string,
  averageHours: PropTypes.number,
};

// Keep backward compatibility
export const WeekSummary = ({ totalHours }) => (
  <PeriodSummary
    title="This Week Total"
    totalHours={totalHours}
    averageLabel="hours/day"
    averageHours={totalHours / 7}
  />
);

WeekSummary.propTypes = {
  totalHours: PropTypes.number.isRequired,
};
