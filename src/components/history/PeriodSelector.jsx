import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Period selector tabs for history view
 */
export const PeriodSelector = ({ periods, activePeriod, onPeriodChange }) => {
  return (
    <div className="flex bg-green-100 dark:bg-gray-700 rounded-xl p-1 mb-6">
      {periods.map((period) => (
        <button
          key={period.id}
          onClick={() => onPeriodChange(period.id)}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            activePeriod === period.id
              ? 'bg-white text-green-700 shadow-sm dark:bg-gray-800 dark:text-green-400'
              : 'text-green-600 hover:text-green-800 dark:text-gray-400 dark:hover:text-green-300'
          }`}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
};

PeriodSelector.propTypes = {
  periods: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  activePeriod: PropTypes.string.isRequired,
  onPeriodChange: PropTypes.func.isRequired,
};

/**
 * Navigation header with left/right arrows and title
 */
export const PeriodNavigator = ({ title, onPrevious, onNext, canGoNext = true }) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <button
        onClick={onPrevious}
        className="p-2 rounded-full bg-green-100 hover:bg-green-200 text-green-700 dark:bg-slate-800 dark:text-green-400 dark:hover:bg-slate-700 transition-colors"
        aria-label="Previous period"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <h3 className="text-lg font-semibold text-green-800 dark:text-white">{title}</h3>
      <button
        onClick={onNext}
        disabled={!canGoNext}
        className={`p-2 rounded-full transition-colors ${
          canGoNext
            ? 'bg-green-100 hover:bg-green-200 text-green-700 dark:bg-slate-800 dark:text-green-400 dark:hover:bg-slate-700'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-slate-900 dark:text-slate-600'
        }`}
        aria-label="Next period"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

PeriodNavigator.propTypes = {
  title: PropTypes.string.isRequired,
  onPrevious: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  canGoNext: PropTypes.bool,
};
