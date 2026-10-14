import React, { useState } from 'react';
import { useGarden } from '../../context/GardenContext';
import { Trash2, Trees, ChevronLeft, ChevronRight } from 'lucide-react';
import { PAGE_SIZE, TOTAL_PAGES } from '../../constants/gardenConstants';
import './garden.css';

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

const GardenGrid = () => {
  const { grid, removePlant, buyPlant, plantTypes } = useGarden();
  const [hoveredSlot, setHoveredSlot] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

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

  const currentTheme = GARDEN_THEMES[currentPage] || GARDEN_THEMES[0];
  const startIndex = currentPage * PAGE_SIZE;
  const pageSlots = grid.slice(startIndex, startIndex + PAGE_SIZE);
  const plantsOnPage = pageSlots.filter(p => p !== null).length;

  return (
    <div className="relative">
      {/* Page Header with Navigation and Quick Garden Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-3 px-1">
        <div className="flex items-center gap-1.5">
          {GARDEN_THEMES.map((theme, idx) => (
            <button
              key={theme.name}
              onClick={() => { setCurrentPage(idx); setSelectedSlot(null); }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                currentPage === idx
                  ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/30'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              <span>{theme.icon}</span>
              <span>{theme.name}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
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
      <div className={`garden-environment-card ${currentTheme.themeClass} p-4 relative min-h-[440px] flex items-center justify-center`}>
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

        {/* Garden C: Zen Tea Garden Scenery */}
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

        {/* 5×5 Planting Table Grid */}
        <div className="w-full max-w-[480px] mx-auto grid grid-cols-5 gap-2 sm:gap-2.5 relative z-10">
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
                  aspect-square rounded-xl transition-all duration-200 relative garden-slot-cell
                  ${plant 
                    ? 'shadow-sm ring-1 ring-black/5 dark:ring-white/10 active:scale-95' 
                    : 'border border-dashed border-gray-300/70 dark:border-slate-600/50 hover:border-emerald-400'}
                  ${hoveredSlot === globalIndex ? 'ring-2 ring-green-400 scale-105 z-10' : ''}
                  ${isSelected ? 'ring-2 ring-red-400 z-10' : ''}
                `}
              >
                {currentPlant ? (
                  <div className="w-full h-full flex items-center justify-center p-1.5 relative">
                    <img 
                      src={currentPlant.image} 
                      alt={currentPlant.name}
                      className="w-full h-full object-contain transform hover:scale-105 transition-transform drop-shadow-md"
                    />
                    {isSelected && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          removePlant(globalIndex);
                          setSelectedSlot(null);
                        }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg active:scale-75 transition-transform z-20"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-1 h-1 bg-gray-300/50 rounded-full" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State Overlay */}
        {pageSlots.every(p => p === null) && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-5 rounded-2xl border border-gray-100 flex flex-col items-center gap-2 text-center shadow-lg">
              <Trees className="text-emerald-600 w-6 h-6" />
              <h4 className="font-black text-sm text-gray-900 dark:text-white">{currentTheme.name} is empty</h4>
              <p className="text-[11px] text-gray-500">Tap seeds below to start planting!</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center gap-2 mt-3">
        {GARDEN_THEMES.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrentPage(i); setSelectedSlot(null); }}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === currentPage
                ? 'bg-green-500 w-6'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 w-2'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default GardenGrid;
