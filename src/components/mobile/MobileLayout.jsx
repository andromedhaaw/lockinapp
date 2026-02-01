import React from 'react';

const MobileLayout = ({ children }) => {
  return (
    <div className="h-[100dvh] bg-white dark:bg-black w-full flex justify-center overflow-hidden">
      <div className="w-full max-w-[480px] bg-gray-50 dark:bg-slate-950 h-full shadow-2xl relative flex flex-col overflow-hidden border-x border-gray-100 dark:border-slate-800">
        <div className="flex-1 overflow-y-auto pb-6 scroll-smooth">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MobileLayout;
