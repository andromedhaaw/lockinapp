
import React, { useState } from 'react';
import { useGarden } from '../../context/GardenContext';
import { Trash2, Trees, ChevronLeft, ChevronRight } from 'lucide-react';
import { PAGE_SIZE, TOTAL_PAGES } from '../../constants/gardenConstants';

const GardenGrid = () => {
  const { grid, removePlant, buyPlant, plantTypes } = useGarden();
  const [hoveredSlot, setHoveredSlot] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  // Mapping for legacy/renamed plant IDs
  const LEGACY_MAPPING = {
    'Palm Oil': 'palmoil',
    'Cherry Blossom': 'cherry',
    'Sunset Maple': 'bonsai',
    'Royal Palm': 'palm',
    'Firefly Pine': 'pine',
    'Fairy Mushroom': 'mushroom',
    'Golden Sun': 'sunflower',
    'Midnight Tulip': 'tulip',
    'Crystal Rose': 'rose',
    'Neon Melon': 'melon',
  };

  const resolvePlant = (plantData) => {
    if (!plantData) return null;
    const findPlantById = (id) => Object.values(plantTypes).find(p => p.id === id);
    let match = findPlantById(plantData.id);
    if (match) return match;
    const legacyKey = plantData.id || plantData.name;
    const mappedId = LEGACY_MAPPING[legacyKey];
    if (mappedId) {
      match = findPlantById(mappedId);
      if (match) return match;
    }
    match = Object.values(plantTypes).find(p => p.name === plantData.name);
    if (match) return match;
    return plantData;
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (grid[index] === null) setHoveredSlot(index);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    setHoveredSlot(null);
    const plantId = e.dataTransfer.getData('plantId');
    if (plantId && grid[index] === null) buyPlant(plantId, index);
  };

  const handleSlotTap = (index) => {
    if (grid[index] !== null) {
      setSelectedSlot(selectedSlot === index ? null : index);
    }
  };

  // Get slots for current page
  const startIndex = currentPage * PAGE_SIZE;
  const pageSlots = grid.slice(startIndex, startIndex + PAGE_SIZE);
  const plantsOnPage = pageSlots.filter(p => p !== null).length;

  // Page names
  const pageNames = ['Garden A', 'Garden B', 'Garden C'];

  return (
    <div className="relative">
      {/* Page Header with Navigation */}
      <div className="flex items-center justify-between mb-3 px-1">
        <button
          onClick={() => { setCurrentPage(p => p - 1); setSelectedSlot(null); }}
          disabled={currentPage === 0}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            currentPage === 0
              ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              : 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 active:scale-90'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Prev
        </button>

        <div className="text-center">
          <div className="text-sm font-black text-gray-900 dark:text-white">
            {pageNames[currentPage]}
          </div>
          <div className="text-[10px] text-gray-400 font-medium">
            {plantsOnPage}/25 planted
          </div>
        </div>

        <button
          onClick={() => { setCurrentPage(p => p + 1); setSelectedSlot(null); }}
          disabled={currentPage === TOTAL_PAGES - 1}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            currentPage === TOTAL_PAGES - 1
              ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              : 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 active:scale-90'
          }`}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Page Dots */}
      <div className="flex justify-center gap-2 mb-3">
        {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrentPage(i); setSelectedSlot(null); }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === currentPage
                ? 'bg-green-500 w-6'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* 5×5 Grid */}
      <div className="w-full grid grid-cols-5 gap-1.5 sm:gap-2 p-1">
        {pageSlots.map((plant, localIndex) => {
          const globalIndex = startIndex + localIndex;
          const currentPlant = resolvePlant(plant);
          const isSelected = selectedSlot === globalIndex;
          
          return (
            <div
              key={globalIndex}
              onDragOver={(e) => handleDragOver(e, globalIndex)}
              onDragLeave={() => setHoveredSlot(null)}
              onDrop={(e) => handleDrop(e, globalIndex)}
              onClick={() => handleSlotTap(globalIndex)}
              className={`
                aspect-square rounded-xl transition-all duration-200 relative
                ${plant 
                  ? 'bg-white dark:bg-slate-800 shadow-sm ring-1 ring-gray-100/50 dark:ring-slate-700/50 active:scale-90' 
                  : 'bg-gray-50/80 dark:bg-slate-900/60 border border-dashed border-gray-200/50 dark:border-slate-700/40'}
                ${hoveredSlot === globalIndex ? 'ring-2 ring-green-400 bg-green-50 scale-105 z-10' : ''}
                ${isSelected ? 'ring-2 ring-red-400 z-10' : ''}
              `}
            >
              {currentPlant ? (
                <div className="w-full h-full flex items-center justify-center p-1.5 relative">
                  <img 
                    src={currentPlant.image} 
                    alt={currentPlant.name}
                    className="w-full h-full object-contain drop-shadow-sm"
                  />
                  
                  {/* Plant name tooltip on select */}
                  {isSelected && (
                    <>
                      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[8px] font-bold py-0.5 px-2 rounded-md whitespace-nowrap z-40 shadow-lg">
                        {currentPlant.name}
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          removePlant(globalIndex);
                          setSelectedSlot(null);
                        }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md z-30 animate-in zoom-in duration-200"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Empty Page State */}
      {pageSlots.every(p => p === null) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 flex flex-col items-center gap-2 text-center shadow-lg">
            <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
              <Trees className="text-green-600 dark:text-green-400 w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-sm text-gray-900 dark:text-white">{pageNames[currentPage]} is empty</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">Open Seeds Shop to plant here!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GardenGrid;
