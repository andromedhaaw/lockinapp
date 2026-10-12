import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export const TabNavigation = ({ tabs, activeTab, onTabChange, collapsed = false, hidden = false, onToggleCollapse, onHide, onShow, pinLast = true }) => {
  if (hidden) return <button onClick={onShow} className="fixed bottom-4 left-4 z-[60] hidden h-10 w-10 items-center justify-center rounded-xl border border-[#deddd7] bg-[#fffefa] text-slate-600 shadow-[0_2px_8px_rgba(34,51,39,.08)] transition-[background-color,color,transform] duration-200 hover:bg-white hover:text-slate-950 active:scale-95 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 lg:flex" title="Show navigation"><ChevronRight className="h-5 w-5" /></button>;

  return <aside className={`sticky top-0 z-50 border-b border-[#e6e4de] bg-[#f7f6f2] transition-[width,transform] duration-200 dark:border-slate-800 dark:bg-slate-900 lg:fixed lg:inset-y-0 lg:left-0 lg:border-b-0 lg:border-r ${collapsed ? 'lg:w-20' : 'lg:w-64'}`}>
    <div className="flex w-full justify-center overflow-x-auto lg:h-full lg:flex-col lg:items-stretch lg:justify-start lg:overflow-y-auto lg:px-3 lg:py-4">
      <div className={`hidden items-center gap-2 pb-5 text-[15px] font-extrabold tracking-[-.02em] text-slate-900 dark:text-white lg:flex ${collapsed ? 'justify-center' : 'px-3'}`}>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4dcd7d] text-sm text-slate-950">L</span>
        {!collapsed && 'Lock In Work'}
      </div>
      {tabs.map((tab, index) => {
        const active = activeTab === tab.id;
        return <button key={tab.id} onClick={() => onTabChange(tab.id)} title={collapsed ? tab.label : undefined} className={`relative whitespace-nowrap px-5 py-3 text-center text-sm font-semibold transition-[background-color,color] duration-200 lg:flex lg:items-center lg:gap-3 lg:rounded-lg lg:px-3 lg:py-2.5 lg:text-left ${collapsed ? 'lg:justify-center' : ''} ${pinLast && index === tabs.length - 1 ? 'lg:mt-auto' : ''} ${active ? 'border-b-2 border-slate-900 bg-white/75 text-slate-950 before:absolute before:left-0 before:top-1/2 before:hidden before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-slate-900 lg:border-b-0 lg:before:block dark:bg-slate-800/70 dark:text-white dark:before:bg-white' : 'border-b-2 border-transparent text-slate-500 hover:bg-white/55 hover:text-slate-900 lg:border-b-0 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white'}`}>
          {tab.icon && <tab.icon className="mx-auto mb-1 h-[18px] w-[18px] lg:mx-0 lg:mb-0" strokeWidth={active ? 2.4 : 1.8} />}
          {!collapsed && tab.label}
        </button>;
      })}
      {onToggleCollapse && <div className="mt-4 hidden items-center gap-2 border-t border-[#e6e4de] pt-3 lg:flex dark:border-slate-800">
        <button onClick={onToggleCollapse} className="flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-slate-500 transition-colors duration-200 hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white" title={collapsed ? 'Expand navigation' : 'Collapse navigation'}>{collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /> Collapse</>}</button>
        {collapsed && <button onClick={onHide} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors duration-200 hover:bg-white hover:text-slate-900 dark:hover:bg-slate-800" title="Hide navigation"><X className="h-4 w-4" /></button>}
      </div>}
    </div>
  </aside>;
};

TabNavigation.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string.isRequired, label: PropTypes.string.isRequired, icon: PropTypes.elementType })).isRequired,
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
  collapsed: PropTypes.bool,
  hidden: PropTypes.bool,
  onToggleCollapse: PropTypes.func,
  onHide: PropTypes.func,
  onShow: PropTypes.func,
  pinLast: PropTypes.bool,
};
