import React from 'react';
import { useGarden } from '../../../context/GardenContext';
import { Leaf } from 'lucide-react';

const MyPlants = () => {
  const { inventory, plantTypes } = useGarden();

  // Build list from inventory
  const inventoryItems = Object.entries(inventory)
    .filter(([, count]) => count > 0)
    .map(([plantId, count]) => {
      const plant = Object.values(plantTypes).find(p => p.id === plantId);
      if (!plant) return null;
      return { ...plant, count };
    })
    .filter(Boolean);

  const handleDragStart = (e, plant) => {
    e.dataTransfer.setData('plantId', plant.id);
    e.dataTransfer.setData('fromInventory', 'true');
  };

  if (inventoryItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-12 h-12 bg-gray-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-3">
          <Leaf className="w-6 h-6 text-gray-300 dark:text-gray-600" />
        </div>
        <p className="text-xs text-gray-400 font-medium">No seeds yet</p>
        <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-1">Buy seeds from the shop above</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {inventoryItems.map(plant => (
          <div
            key={plant.id}
            draggable
            onDragStart={(e) => handleDragStart(e, plant)}
            className="relative flex flex-col items-center gap-1 p-2 rounded-xl bg-gray-50/80 dark:bg-slate-800/50 border border-gray-100/60 dark:border-slate-700/30 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:-translate-y-0.5 cursor-grab active:cursor-grabbing active:scale-90 transition-all duration-200 group"
          >
            {/* Count badge */}
            <div className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-emerald-500 text-white text-[8px] font-black rounded-full flex items-center justify-center px-1 shadow-sm z-10">
              {plant.count}
            </div>

            <div className="w-12 h-12 flex items-center justify-center p-1">
              <img src={plant.image} alt={plant.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" />
            </div>

            <span className="text-[8px] font-bold text-gray-600 dark:text-gray-400 truncate w-full text-center leading-tight">
              {plant.name}
            </span>
          </div>
        ))}
      </div>

      <div className="pt-3 mt-3 border-t border-gray-100/60 dark:border-slate-800/40 text-center">
        <div className="text-[10px] text-gray-400 font-bold">
          {inventoryItems.reduce((sum, p) => sum + p.count, 0)} seeds · {inventoryItems.length} types
        </div>
      </div>
    </div>
  );
};

export default MyPlants;
