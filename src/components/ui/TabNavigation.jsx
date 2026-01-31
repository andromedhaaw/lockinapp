import PropTypes from 'prop-types';

/**
 * Tab navigation component
 */
export const TabNavigation = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="bg-green-50 dark:bg-slate-900 shadow-sm border-b border-green-100 dark:border-slate-800 transition-colors duration-300 sticky top-0 z-10">
      <div className="w-full flex justify-center overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-6 py-4 text-center font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-500 hover:text-green-600'
            }`}
          >
            {tab.icon && <tab.icon className="w-5 h-5 mx-auto mb-1" />}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

TabNavigation.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.elementType,
    })
  ).isRequired,
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
};
