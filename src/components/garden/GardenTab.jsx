
import React, { useState } from 'react';
import { Sprout, Coins, PlusCircle } from 'lucide-react';
import GardenGrid from './GardenGrid';
import PlantTray from './PlantTray';
import { useGarden } from '../../context/GardenContext';

const GardenTab = () => {
  const { coins, addCoinsFromWork, grid } = useGarden();
  const plantedCount = grid.filter(p => p !== null).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-1000">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center p-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[32px] border border-white/40 dark:border-slate-800 transition-all overflow-hidden relative">
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
              Botanical Sanctuary
            </h2>
            <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-black uppercase tracking-widest rounded-full">
              Level 4
            </div>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-medium">Curate your oasis. Growth is measured in focus.</p>
        </div>
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Growth Index</span>
            <span className="text-xl font-black text-green-600 dark:text-green-400">{Math.round((plantedCount / 64) * 100)}%</span>
          </div>

          <button 
            onClick={() => addCoinsFromWork(1000)} // Elite Boost
            className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl shadow-[0_10px_20px_-5px_rgba(245,158,11,0.4)] hover:shadow-[0_20px_40px_-10px_rgba(245,158,11,0.5)] hover:-translate-y-1 transition-all duration-300"
          >
            <Coins className="w-5 h-5 text-white fill-amber-200 group-hover:rotate-12 transition-transform" />
            <span className="font-black text-white text-lg">{coins.toLocaleString()}</span>
            <PlusCircle className="w-4 h-4 text-white/50" />
          </button>
        </div>

        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-10 -mt-10 blur-3xl"></div>
      </div>

      {/* Main Content - Grid & Shop Area */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 bg-white dark:bg-slate-900/40 p-4 sm:p-6 rounded-[40px] border border-gray-100 dark:border-slate-800 transition-all">
          <GardenGrid />
        </div>

        {/* Right Side Sidebar Shop */}
        <div className="w-full lg:w-72 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900/40 p-6 rounded-[32px] border border-gray-100 dark:border-slate-800 h-full">
            <div className="mb-6 flex flex-col gap-1">
              <h3 className="text-sm font-black text-green-600 dark:text-green-400 uppercase tracking-widest">Botanical Seeds</h3>
              <p className="text-[10px] text-gray-400 font-medium italic">Drag seeds to your sanctuary</p>
            </div>
            
            <div className="flex-1 lg:max-h-[700px] lg:overflow-y-auto scrollbar-hide">
              <PlantTray />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GardenTab;
