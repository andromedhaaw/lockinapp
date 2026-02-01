import React from 'react';

const MobileBottomNav = ({ activeTab, onTabChange, tabs }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none flex justify-center">
      <div className="w-full max-w-[480px] bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 px-2 py-2 flex justify-between items-center shadow-lg pointer-events-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 w-16 ${
                isActive 
                  ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 translate-y-[-4px]' 
                  : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="text-[10px] font-medium truncate w-full text-center">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
