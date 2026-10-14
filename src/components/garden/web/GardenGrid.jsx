import React, { useState } from 'react';
import { useGarden } from '../../../context/GardenContext';
import { Trash2, Trees, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { PAGE_SIZE, TOTAL_PAGES } from '../../../constants/gardenConstants';
import '../garden.css';

const LEGACY_MAPPING = {
  'Palm Oil': 'palmoil', 'Cherry Blossom': 'cherry', 'Sunset Maple': 'bonsai',
  'Royal Palm': 'palm', 'Firefly Pine': 'pine', 'Fairy Mushroom': 'mushroom',
  'Golden Sun': 'sunflower', 'Midnight Tulip': 'tulip', 'Crystal Rose': 'rose', 'Neon Melon': 'melon',
};

const GARDEN_THEMES = [
  {
    name: 'Garden A',
    subtitle: 'UI/UX Experiment · Clean Baseline',
    icon: '📐',
    themeClass: 'garden-theme-a',
    isExperiment: true,
  },
  {
    name: 'Garden B',
    subtitle: 'Botanical Greenhouse · Sunlit Terrace',
    icon: '🏛️',
    themeClass: 'garden-theme-b',
    isExperiment: false,
  },
  {
    name: 'Garden C',
    subtitle: 'Zen Tea Garden · Bamboo Sanctuary',
    icon: '🎋',
    themeClass: 'garden-theme-c',
    isExperiment: false,
  },
  {
    name: 'Garden D',
    subtitle: 'Enchanted Twilight Grove · Fairy Meadow',
    icon: '🌌',
    themeClass: 'garden-theme-d',
    isExperiment: false,
  },
];

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

  const currentTheme = GARDEN_THEMES[currentPage] || GARDEN_THEMES[0];
  const startIndex = currentPage * PAGE_SIZE;
  const pageSlots = grid.slice(startIndex, startIndex + PAGE_SIZE);
  const plantsOnPage = pageSlots.filter(p => p !== null).length;

  return (
    <div className="relative">
      {/* Page Navigation Header & Quick Garden Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          {GARDEN_THEMES.map((theme, idx) => (
            <button
              key={theme.name}
              onClick={() => setCurrentPage(idx)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentPage === idx
                  ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/30'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{theme.icon}</span>
              <span>{theme.name}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(p => p - 1)}
            disabled={currentPage === 0}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              currentPage === 0
                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>

          <button
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={currentPage === TOTAL_PAGES - 1}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              currentPage === TOTAL_PAGES - 1
                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100'
            }`}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Theme Title Badge & Counter */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-base">{currentTheme.icon}</span>
          <div>
            <h3 className="text-sm font-black text-gray-900 dark:text-white leading-tight">{currentTheme.name}</h3>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{currentTheme.subtitle}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{plantsOnPage} / 25</span>
          <span className="block text-[9px] text-gray-400 uppercase tracking-wider font-bold">Planted</span>
        </div>
      </div>

      {/* Thematic Environment Card (Clean White for Garden A, Rich Scenic for B, C, D) */}
      <div className={`garden-environment-card ${currentTheme.themeClass} p-5 relative min-h-[460px] flex items-center justify-center`}>
        {/* Garden A: Clean Minimal Baseline Overlay */}
        {currentPage === 0 && (
          <div className="garden-grid-bg absolute inset-0 pointer-events-none rounded-3xl" />
        )}

        {/* Garden B: Botanical Greenhouse Scenery */}
        {currentPage === 1 && (
          <>
            <div className="greenhouse-arches">
              <div className="greenhouse-roof-arch" />
              <div className="greenhouse-beam beam-1" />
              <div className="greenhouse-beam beam-2" />
              <div className="greenhouse-beam beam-3" />
            </div>
            <div className="greenhouse-foliage">
              <div className="hanging-basket">
                <span className="basket-chain" />
                <span className="basket-pot" />
                <span className="basket-fern" />
              </div>
              <div className="hanging-basket">
                <span className="basket-chain" />
                <span className="basket-pot" />
                <span className="basket-fern" />
              </div>
            </div>
            <div className="greenhouse-sunbeam" />
          </>
        )}

        {/* Garden C: Zen Tea Garden & Bamboo Sanctuary Scenery */}
        {currentPage === 2 && (
          <>
            <div className="zen-bamboo-grove">
              <div className="bamboo-stalk stalk-1" />
              <div className="bamboo-stalk stalk-2" />
              <div className="bamboo-stalk stalk-3" />
              <div className="bamboo-stalk stalk-4" />
            </div>
            <div className="zen-stone-lantern">
              <div className="lantern-roof" />
              <div className="lantern-firebox" />
              <div className="lantern-base" />
            </div>
            <div className="zen-petals">
              <span className="zen-petal petal-1" />
              <span className="zen-petal petal-2" />
              <span className="zen-petal petal-3" />
            </div>
          </>
        )}

        {/* Garden D: Enchanted Twilight Grove Scenery */}
        {currentPage === 3 && (
          <>
            <div className="twilight-sky">
              <div className="twilight-moon" />
              <span className="twilight-star star-1" />
              <span className="twilight-star star-2" />
              <span className="twilight-star star-3" />
            </div>
            <div className="twilight-fireflies">
              <span className="firefly ff-1" />
              <span className="firefly ff-2" />
              <span className="firefly ff-3" />
            </div>
            <div className="fairy-mushroom-corner">
              <div className="f-shroom shroom-1" />
              <div className="f-shroom shroom-2" />
            </div>
          </>
        )}

        {/* 5×5 Planting Table Grid (Functional Drag-and-Drop & Interactions Preserved) */}
        <div className="w-full max-w-[500px] mx-auto grid grid-cols-5 gap-3 relative z-10">
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
                  aspect-square rounded-2xl transition-all duration-300 relative group cursor-default garden-slot-cell
                  ${plant 
                    ? 'shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)] ring-1 ring-black/5 dark:ring-white/10' 
                    : 'border border-dashed border-gray-300/70 dark:border-slate-600/50 hover:border-emerald-400/80'}
                  ${hoveredSlot === globalIndex ? 'ring-[3px] ring-emerald-400 -translate-y-1.5 scale-105 !z-50 shadow-[0_16px_32px_-4px_rgba(16,185,129,0.3)]' : ''}
                `}
              >
                {currentPlant ? (
                  <div className="w-full h-full flex items-center justify-center p-2.5 relative">
                    <img 
                      src={currentPlant.image} 
                      alt={currentPlant.name}
                      className="w-full h-full object-contain transform group-hover:scale-110 transition-all duration-500 ease-out drop-shadow-md"
                    />
                    {/* Hover name badge */}
                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-1.5 opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
                      <span className="text-[8px] font-black text-emerald-800 dark:text-emerald-300 bg-white/95 dark:bg-slate-900/95 px-2 py-0.5 rounded-full shadow-md backdrop-blur-sm">
                        {currentPlant.name}
                      </span>
                    </div>
                    {/* Delete button */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); removePlant(globalIndex); }}
                      className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-white dark:bg-slate-900 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center shadow-md hover:scale-110 hover:bg-red-50 z-30 border border-red-100"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-emerald-400/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty Page State Overlay */}
        {pageSlots.every(p => p === null) && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-6 rounded-[24px] border border-gray-100 flex flex-col items-center gap-2 text-center shadow-xl">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-50 rounded-2xl flex items-center justify-center">
                <Trees className="text-emerald-600 w-6 h-6" />
              </div>
              <h4 className="font-black text-base text-gray-900 dark:text-white">{currentTheme.name} is waiting</h4>
              <p className="text-xs text-gray-500">Drag seeds from the shop to plant in this habitat!</p>
            </div>
          </div>
        )}
      </div>

      {/* Legend & Navigation Dots */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 dark:border-slate-800 pt-3">
        <div className="flex gap-2">
          {GARDEN_THEMES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentPage ? 'bg-emerald-500 w-8' : 'bg-gray-200 dark:bg-gray-700 w-2 hover:bg-gray-300'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            <div className="w-3.5 h-3.5 rounded-md border border-dashed border-gray-300 bg-gray-50"></div>
            <span>Plot</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            <div className="w-3.5 h-3.5 rounded-md bg-white ring-1 ring-gray-200 shadow-sm"></div>
            <span>Planted</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
            <div className="w-3.5 h-3.5 rounded-md ring-2 ring-emerald-400 bg-emerald-50"></div>
            <span>Drop</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebGardenGrid;

