import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Tab navigation component
 */
export const TabNavigation = ({ tabs, activeTab, onTabChange, collapsed = false, hidden = false, onToggleCollapse, onHide, onShow }) => {
  if (hidden) return <button onClick={onShow} className="fixed bottom-4 left-4 z-[60] hidden h-10 w-10 items-center justify-center rounded-xl border border-green-200 bg-green-50 text-green-700 shadow-md hover:bg-green-100 dark:border-slate-700 dark:bg-slate-900 dark:text-green-300 lg:flex" title="Show navigation"><ChevronRight className="h-5 w-5" /></button>;
  return (
    <aside className={`bg-green-50 dark:bg-slate-900 shadow-sm border-b border-green-100 dark:border-slate-800 transition-all duration-300 sticky top-0 z-50 lg:fixed lg:inset-y-0 lg:left-0 lg:border-b-0 lg:border-r ${collapsed ? 'lg:w-20' : 'lg:w-64'}`}>
      <div className="flex w-full justify-center overflow-x-auto lg:h-full lg:flex-col lg:items-stretch lg:justify-start lg:overflow-y-auto lg:px-3 lg:py-5">
        <div className={`hidden items-center gap-2 pb-6 text-lg font-black text-slate-900 dark:text-white lg:flex ${collapsed ? 'justify-center' : 'px-4'}`}>
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#4dcd7d] text-sm text-slate-950">L</span>
          {!collapsed && 'Lock In Work'}
        </div>
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            title={collapsed ? tab.label : undefined}
            className={`px-6 py-4 text-center font-medium transition-colors whitespace-nowrap lg:flex lg:items-center lg:gap-3 lg:rounded-xl lg:px-4 lg:py-3 lg:text-left ${collapsed ? 'lg:justify-center' : ''} ${index === tabs.length - 1 ? 'lg:mt-auto' : ''} ${
              activeTab === tab.id
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-500 hover:text-green-600'
              }`}
          >
            {tab.icon && <tab.icon className="mx-auto mb-1 h-5 w-5 lg:mx-0 lg:mb-0" />}
            {!collapsed && tab.label}
          </button>
        ))}
        {onToggleCollapse && <div className="mt-4 hidden items-center gap-2 lg:flex"><button onClick={onToggleCollapse} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-green-200 px-3 py-2 text-xs font-bold text-green-700 hover:bg-green-100 dark:border-slate-700 dark:text-green-300 dark:hover:bg-slate-800" title={collapsed ? 'Expand navigation' : 'Collapse navigation'}>{collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /> Collapse</>}</button>{collapsed && <button onClick={onHide} className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800" title="Hide navigation">×</button>}</div>}
      </div>
    </aside>
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
  collapsed: PropTypes.bool,
  hidden: PropTypes.bool,
  onToggleCollapse: PropTypes.func,
  onHide: PropTypes.func,
  onShow: PropTypes.func,
};
