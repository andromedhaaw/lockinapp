import React, { useState } from 'react';
import { useGarden } from '../../../context/GardenContext';
import { Coins, Check, ShoppingBag } from 'lucide-react';

const WebPlantTray = () => {
  const { coins, plantTypes, buyToInventory } = useGarden();
  const [message, setMessage] = useState('');

  const handleBuy = (plant) => {
    if (coins < plant.cost) return;
    const result = buyToInventory(plant.id);
    if (result?.success !== false) {
      setMessage(`${plant.name} added to My Plants!`);
      setTimeout(() => setMessage(''), 1500);
    }
  };

  return (
    <div className="relative">
      {message && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 px-3 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-full shadow-lg animate-in fade-in zoom-in duration-200">
          <Check className="w-3 h-3" />{message}
        </div>
      )}

      <div className="grid grid-cols-4 gap-2.5 pb-1 sm:grid-cols-6 md:grid-cols-8">
        {Object.values(plantTypes).map(plant => {
          const canAfford = coins >= plant.cost;
          
          return (
            <button
              key={plant.id}
              onClick={() => handleBuy(plant)}
              disabled={!canAfford}
              className={`
                flex min-w-0 flex-col items-center gap-1 rounded-xl p-2.5 transition-all duration-300
                ${canAfford 
                  ? 'bg-gray-50/80 dark:bg-slate-800/60 border border-gray-100/80 dark:border-slate-700/40 hover:bg-white hover:shadow-md hover:-translate-y-1 cursor-pointer active:scale-95' 
                  : 'bg-gray-50/30 border border-gray-50 dark:border-slate-800/30 opacity-35 cursor-not-allowed'}
              `}
            >
              <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center p-1 ring-1 ring-gray-100/60 dark:ring-slate-700/30">
                <img src={plant.image} alt={plant.name} className="w-full h-full object-contain" />
              </div>
              <span className="text-[9px] font-bold text-gray-700 dark:text-gray-300 truncate w-full text-center leading-tight">{plant.name}</span>
              <div className={`flex items-center gap-1 text-[9px] font-black ${canAfford ? 'text-amber-600 dark:text-amber-400' : 'text-red-400'}`}>
                <ShoppingBag className="w-2.5 h-2.5" />
                <Coins className="w-2.5 h-2.5 fill-current" />
                {plant.cost >= 1000 ? `${(plant.cost/1000).toFixed(plant.cost % 1000 === 0 ? 0 : 1)}k` : plant.cost}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WebPlantTray;
