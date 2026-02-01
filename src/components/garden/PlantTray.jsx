
import React from 'react';
import { useGarden } from '../../context/GardenContext';
import { Coins, AlertCircle } from 'lucide-react';

const PlantTray = () => {
  const { coins, plantTypes } = useGarden();

  const handleDragStart = (e, plant) => {
    if (coins < plant.cost) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('plantId', plant.id);
    e.dataTransfer.setData('plantName', plant.name);
  };

  return (
    <div className="grid grid-cols-2 gap-3 pb-6 pt-2">
      {Object.values(plantTypes).map(plant => {
        const canAfford = coins >= plant.cost;
        
        return (
          <div
            key={plant.id}
            draggable={canAfford}
            onDragStart={(e) => handleDragStart(e, plant)}
            className={`
              aspect-[3/4] group relative transition-all duration-500
              ${canAfford ? 'cursor-grab active:cursor-grabbing' : 'opacity-40 cursor-not-allowed'}
            `}
          >
            {/* Plant Card - Compact Square Style */}
            <div className={`
              h-full flex flex-col items-center justify-between rounded-2xl bg-white dark:bg-slate-800 p-2 transition-all duration-500
              ${canAfford ? 'border border-gray-100 dark:border-slate-700 hover:-translate-y-1' : 'border border-gray-50 dark:border-slate-800'}
            `}>
              <div className="w-full aspect-square relative flex items-center justify-center bg-gray-50 dark:bg-slate-900 rounded-xl p-1 flex-shrink-0">
                <img 
                  src={plant.image} 
                  alt={plant.name} 
                  className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-110 transition-all duration-500" 
                />
                
                {!canAfford && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-[1px] rounded-xl">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  </div>
                )}
              </div>

              {/* Label Area */}
              <div className="w-full text-center mt-1.5 pb-0.5">
                <div className="text-[9px] font-black text-gray-900 dark:text-white uppercase tracking-tighter truncate leading-tight">
                  {plant.name}
                </div>
                <div className={`
                  flex items-center justify-center gap-1 text-[9px] font-black mt-0.5
                  ${canAfford ? 'text-amber-600 dark:text-amber-400' : 'text-red-500'}
                `}>
                  <Coins className="w-2.5 h-2.5 fill-current" />
                  {plant.cost.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Side Tooltip */}
            <div className="absolute top-1/2 -left-32 -translate-y-1/2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[8px] font-bold py-1.5 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-xl pointer-events-none whitespace-nowrap z-50">
              {canAfford ? `Drag & Plant` : `Need Coins`}
              <div className="absolute right-[-3px] top-1/2 -translate-y-1/2 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[3px] border-l-gray-900 dark:border-l-white"></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PlantTray;
