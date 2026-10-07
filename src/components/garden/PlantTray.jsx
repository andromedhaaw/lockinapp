import React from 'react';
import { useGarden } from '../../context/GardenContext';
import { Coins, AlertCircle, Check } from 'lucide-react';
import { useState } from 'react';

const PlantTray = () => {
  const { coins, plantTypes, buyPlant, grid } = useGarden();
  const [plantedMessage, setPlantedMessage] = useState('');

  const handleDragStart = (e, plant) => {
    if (coins < plant.cost) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('plantId', plant.id);
    e.dataTransfer.setData('plantName', plant.name);
  };

  // Tap-to-plant: auto-place in first empty slot
  const handleTapPlant = (plant) => {
    if (coins < plant.cost) return;
    const emptySlot = grid.findIndex(slot => slot === null);
    if (emptySlot === -1) {
      setPlantedMessage('Garden is full!');
      setTimeout(() => setPlantedMessage(''), 2000);
      return;
    }
    const result = buyPlant(plant.id, emptySlot);
    if (result?.success !== false) {
      setPlantedMessage(`Planted ${plant.name}!`);
      setTimeout(() => setPlantedMessage(''), 1500);
    }
  };

  return (
    <div className="relative">
      {/* Success Toast */}
      {plantedMessage && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 px-3 py-1 bg-green-500 text-white text-[10px] font-bold rounded-full shadow-lg animate-in fade-in zoom-in duration-200">
          <Check className="w-3 h-3" />
          {plantedMessage}
        </div>
      )}

      {/* Horizontal scrollable seed tray */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
        {Object.values(plantTypes).map(plant => {
          const canAfford = coins >= plant.cost;
          
          return (
            <button
              key={plant.id}
              draggable={canAfford}
              onDragStart={(e) => handleDragStart(e, plant)}
              onClick={() => handleTapPlant(plant)}
              disabled={!canAfford}
              className={`
                flex-shrink-0 flex flex-col items-center gap-0.5 p-1.5 rounded-xl w-[60px] transition-all duration-200
                ${canAfford 
                  ? 'bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 active:scale-90 active:bg-green-50 dark:active:bg-green-900/20 cursor-pointer' 
                  : 'bg-gray-50/50 dark:bg-slate-800/50 border border-gray-50 dark:border-slate-800 opacity-35 cursor-not-allowed'}
              `}
            >
              {/* Plant Image */}
              <div className="w-9 h-9 flex items-center justify-center relative">
                <img 
                  src={plant.image} 
                  alt={plant.name} 
                  className="w-full h-full object-contain" 
                />
                {!canAfford && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <AlertCircle className="w-3 h-3 text-red-400" />
                  </div>
                )}
              </div>

              {/* Name */}
              <span className="text-[8px] font-bold text-gray-600 dark:text-gray-400 truncate w-full text-center leading-tight">
                {plant.name}
              </span>

              {/* Cost */}
              <div className={`
                flex items-center gap-0.5 text-[8px] font-black
                ${canAfford ? 'text-amber-600 dark:text-amber-400' : 'text-red-400'}
              `}>
                <Coins className="w-2 h-2 fill-current" />
                {plant.cost >= 1000 ? `${(plant.cost/1000).toFixed(plant.cost % 1000 === 0 ? 0 : 1)}k` : plant.cost}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PlantTray;
