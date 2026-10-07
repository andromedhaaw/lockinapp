import React, { useState } from 'react';
import { useGarden } from '../../../context/GardenContext';
import { Trash2, Trees, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { PAGE_SIZE, TOTAL_PAGES } from '../../../constants/gardenConstants';

const LEGACY_MAPPING = {
  'Palm Oil': 'palmoil', 'Cherry Blossom': 'cherry', 'Sunset Maple': 'bonsai',
  'Royal Palm': 'palm', 'Firefly Pine': 'pine', 'Fairy Mushroom': 'mushroom',
  'Golden Sun': 'sunflower', 'Midnight Tulip': 'tulip', 'Crystal Rose': 'rose', 'Neon Melon': 'melon',
};

const WebGardenGrid = () => {
  const { grid, removePlant, buyPlant, plantFromInventory, plantTypes } = useGarden();
  const [hoveredSlot, setHoveredSlot] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  const resolvePlant = (plantData) => {
    if (!plantData) return null;
    const findById = (id) => Object.values(plantTypes).find(p => p.id === id);
    let match = findById(plantData.id);
    if (match) return match;
    const mapped = LEGACY_MAPPING[plantData.id || plantData.name];
    if (mapped) { match = findById(mapped); if (match) return match; }
    match = Object.values(plantTypes).find(p => p.name === plantData.name);
    return match || plantData;
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (grid[index] === null) setHoveredSlot(index);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    setHoveredSlot(null);
    const plantId = e.dataTransfer.getData('plantId');
    const fromInventory = e.dataTransfer.getData('fromInventory') === 'true';
    if (plantId && grid[index] === null) {
      if (fromInventory) {
        plantFromInventory(plantId, index);
      } else {
        buyPlant(plantId, index);
      }
    }
  };

  const startIndex = currentPage * PAGE_SIZE;
  const pageSlots = grid.slice(startIndex, startIndex + PAGE_SIZE);
  const plantsOnPage = pageSlots.filter(p => p !== null).length;
  const pageNames = ['Garden A', 'Garden B', 'Garden C'];

  return (
    <div className="relative">
      {/* Page Navigation Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentPage(p => p - 1)}
          disabled={currentPage === 0}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            currentPage === 0
              ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <div className="text-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-sm font-black text-gray-900 dark:text-white">{pageNames[currentPage]}</span>
          </div>
          <div className="text-[10px] text-gray-400 font-medium mt-0.5">{plantsOnPage} / 25 slots planted</div>
        </div>

        <button
          onClick={() => setCurrentPage(p => p + 1)}
          disabled={currentPage === TOTAL_PAGES - 1}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            currentPage === TOTAL_PAGES - 1
              ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
          }`}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Page Dots */}
      <div className="flex justify-center gap-2 mb-4">
        {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === currentPage ? 'bg-emerald-500 w-8' : 'bg-gray-200 dark:bg-gray-700 w-2 hover:bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* 5×5 Grid */}
      <div className="w-full max-w-[560px] mx-auto grid grid-cols-5 gap-3 relative">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none rounded-3xl" 
             style={{ backgroundImage: 'radial-gradient(#065f46 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>

        {pageSlots.map((plant, localIndex) => {
          const globalIndex = startIndex + localIndex;
          const currentPlant = resolvePlant(plant);
          
          return (
            <div
              key={globalIndex}
              onDragOver={(e) => handleDragOver(e, globalIndex)}
              onDragLeave={() => setHoveredSlot(null)}
              onDrop={(e) => handleDrop(e, globalIndex)}
              className={`
                aspect-square rounded-2xl transition-all duration-300 relative group cursor-default
                ${plant 
                  ? 'bg-gradient-to-b from-white to-gray-50/80 dark:from-slate-800 dark:to-slate-800/80 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.06)] ring-1 ring-gray-100 dark:ring-slate-700/50' 
                  : 'bg-gray-50/60 dark:bg-slate-800/30 border border-dashed border-gray-200/60 dark:border-slate-700/30 hover:bg-emerald-50/40 hover:border-emerald-200/60'}
                ${hoveredSlot === globalIndex ? 'ring-[3px] ring-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 -translate-y-2 scale-105 !z-50 shadow-[0_16px_32px_-4px_rgba(16,185,129,0.2)]' : ''}
              `}
            >
              {currentPlant ? (
                <div className="w-full h-full flex items-center justify-center p-2.5 relative">
                  <img 
                    src={currentPlant.image} 
                    alt={currentPlant.name}
                    className="w-full h-full object-contain transform group-hover:scale-110 transition-all duration-500 ease-out drop-shadow-sm"
                  />
                  {/* Hover name */}
                  <div className="absolute inset-0 flex flex-col items-center justify-end pb-1.5 opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
                    <span className="text-[8px] font-black text-emerald-700 dark:text-emerald-400 bg-white/90 dark:bg-slate-900/90 px-2 py-0.5 rounded-full shadow-sm">
                      {currentPlant.name}
                    </span>
                  </div>
                  {/* Delete */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); removePlant(globalIndex); }}
                    className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-white dark:bg-slate-900 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center shadow-md hover:scale-110 hover:bg-red-50 z-30 border border-red-100"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-emerald-300/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty Page State */}
      {pageSlots.every(p => p === null) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-8 rounded-[28px] border border-gray-100 flex flex-col items-center gap-3 text-center shadow-xl">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-green-50 rounded-2xl flex items-center justify-center">
              <Trees className="text-emerald-600 w-7 h-7" />
            </div>
            <h4 className="font-black text-lg text-gray-900 dark:text-white">{pageNames[currentPage]} is empty</h4>
            <p className="text-xs text-gray-500">Drag seeds from the shop above to start planting!</p>
          </div>
        </div>
      )}

      {/* Legend — at the bottom */}
      <div className="mt-5 pt-4 border-t border-gray-100/80 dark:border-slate-800/50 flex justify-center gap-8">
        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          <div className="w-4 h-4 rounded-lg bg-gray-50/60 border border-dashed border-gray-200/60"></div>
          <span>Empty</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          <div className="w-4 h-4 rounded-lg bg-white ring-1 ring-gray-100 shadow-sm"></div>
          <span>Planted</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-emerald-500 font-bold uppercase tracking-widest">
          <div className="w-4 h-4 rounded-lg ring-2 ring-emerald-400 bg-emerald-50"></div>
          <span>Drop Zone</span>
        </div>
      </div>
    </div>
  );
};

export default WebGardenGrid;
