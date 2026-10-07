import React from 'react';
import { Coins, PlusCircle, Sprout, TrendingUp, Star } from 'lucide-react';
import GardenGrid from './GardenGrid';
import PlantTray from './PlantTray';
import MyPlants from './MyPlants';
import { useGarden } from '../../../context/GardenContext';
import { GRID_SIZE } from '../../../constants/gardenConstants';

const WebGardenTab = () => {
  const { coins, addCoinsFromWork, grid } = useGarden();
  const plantedCount = grid.filter(p => p !== null).length;
  const growthPercent = Math.round((plantedCount / GRID_SIZE) * 100);

  return (
    <div className="space-y-5 animate-in fade-in duration-700">
      {/* Hero Header with Stats + Coins */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/40 dark:via-green-950/30 dark:to-teal-950/40 border border-emerald-100/60 dark:border-emerald-900/30 p-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-emerald-200/20 to-transparent rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-gradient-to-tr from-teal-200/20 to-transparent rounded-full -ml-16 -mb-16 blur-3xl"></div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Botanical Sanctuary</h2>
              <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 font-medium">Your focus cultivates this garden</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center px-5 py-2.5 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm rounded-xl border border-white/50 dark:border-slate-700/30">
              <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Plants</div>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{plantedCount}</div>
            </div>
            <div className="text-center px-5 py-2.5 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm rounded-xl border border-white/50 dark:border-slate-700/30">
              <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Growth</div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{growthPercent}%</span>
              </div>
            </div>
            <button 
              onClick={() => addCoinsFromWork(1000)}
              className="group flex items-center gap-2.5 px-5 py-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 rounded-xl shadow-[0_8px_32px_-4px_rgba(245,158,11,0.4)] hover:shadow-[0_12px_40px_-4px_rgba(245,158,11,0.5)] hover:-translate-y-0.5 transition-all duration-300"
            >
              <Coins className="w-5 h-5 text-white fill-amber-200 group-hover:rotate-12 transition-transform" />
              <span className="font-black text-white text-lg">{coins.toLocaleString()}</span>
              <PlusCircle className="w-3.5 h-3.5 text-white/40" />
            </button>
          </div>
        </div>
      </div>

      {/* Seed Shop Strip — Horizontal, always visible */}
      <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-gray-100/80 dark:border-slate-800/60 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
              <Sprout className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Seed Shop</h3>
          </div>
          <span className="text-[10px] text-gray-400 font-medium">Drag seeds into the garden below</span>
        </div>
        <PlantTray />
      </div>

      {/* Main Content: Grid + My Plants sidebar */}
      <div className="grid grid-cols-[1fr_260px] gap-5">
        {/* Left: Garden Grid */}
        <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl rounded-[28px] border border-gray-100/80 dark:border-slate-800/60 p-5 shadow-sm">
          <GardenGrid />
        </div>

        {/* Right: My Plants inventory */}
        <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl rounded-[28px] border border-gray-100/80 dark:border-slate-800/60 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 pb-3 border-b border-gray-100/80 dark:border-slate-800/50 bg-gradient-to-b from-emerald-50/50 to-transparent dark:from-emerald-950/20">
            <h3 className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">🌿 My Plants</h3>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5">{plantedCount} plants in your garden</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 scrollbar-hide">
            <MyPlants />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebGardenTab;
