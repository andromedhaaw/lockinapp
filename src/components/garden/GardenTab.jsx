import React, { useState } from 'react';
import { Coins, PlusCircle } from 'lucide-react';
import GardenGrid from './GardenGrid';
import PlantTray from './PlantTray';
import { useGarden } from '../../context/GardenContext';
import { GRID_SIZE } from '../../constants/gardenConstants';

const GardenTab = () => {
  const { coins, addCoinsFromWork, grid } = useGarden();
  const plantedCount = grid.filter(p => p !== null).length;

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-700">
      {/* Compact Header */}
      <div className="flex items-center justify-between p-3 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/40 dark:border-slate-800 relative overflow-hidden mb-2">
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
              🌿 My Garden
            </h2>
            <div className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[9px] font-black uppercase tracking-widest rounded-full">
              {plantedCount}/{GRID_SIZE}
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => addCoinsFromWork(1000)}
          className="group flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl shadow-lg active:scale-95 transition-all duration-200"
        >
          <Coins className="w-4 h-4 text-white fill-amber-200" />
          <span className="font-black text-white text-sm">{coins.toLocaleString()}</span>
          <PlusCircle className="w-3 h-3 text-white/50" />
        </button>
      </div>

      {/* Garden Grid */}
      <div className="flex-1 bg-white/50 dark:bg-slate-900/40 p-2 rounded-2xl border border-gray-100 dark:border-slate-800 mb-2">
        <GardenGrid />
      </div>

      {/* Fixed Seed Tray at Bottom — always visible */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-3 pb-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest">
            🌱 My Seeds
          </h3>
          <span className="text-[9px] text-gray-400 font-medium">Tap or drag to plant</span>
        </div>
        <PlantTray />
      </div>
    </div>
  );
};

export default GardenTab;
