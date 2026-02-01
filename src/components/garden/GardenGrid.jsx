
import React, { useState } from 'react';
import { useGarden } from '../../context/GardenContext';
import { MousePointer2, Trash2, Trees } from 'lucide-react';

const GardenGrid = () => {
  const { grid, removePlant, buyPlant } = useGarden();
  const [hoveredSlot, setHoveredSlot] = useState(null);

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (grid[index] === null) {
      setHoveredSlot(index);
    }
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    setHoveredSlot(null);
    const plantId = e.dataTransfer.getData('plantId');
    if (plantId && grid[index] === null) {
      buyPlant(plantId, index);
    }
  };

  return (
    <div className="relative">
      {/* Flattened Grid Container */}
      <div 
        className="aspect-square w-full max-w-[1100px] mx-auto grid grid-cols-8 gap-2 sm:gap-3 bg-white dark:bg-slate-900/40 p-8 rounded-[40px] border border-gray-100 dark:border-white/5 relative overflow-hidden"
      >
        {/* Background Grid Texture */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#065f46 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

        {grid.map((plant, index) => (
          <div
            key={index}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={() => setHoveredSlot(null)}
            onDrop={(e) => handleDrop(e, index)}
            className={`
              aspect-square rounded-xl transition-all duration-300 relative group
              ${plant 
                ? 'bg-white dark:bg-slate-800 ring-1 ring-gray-100/50 dark:ring-slate-700 active:scale-95' 
                : 'bg-white/40 dark:bg-slate-900/40 border border-dashed border-gray-200/50 dark:border-slate-800 hover:bg-white/60 dark:hover:bg-slate-800/60'}
              ${hoveredSlot === index ? 'ring-4 ring-green-400 bg-white -translate-y-4 scale-110 !z-50' : 'translate-z-0'}
            `}
            style={{ 
              transformStyle: 'preserve-3d',
              boxShadow: plant ? '0 10px 20px -5px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            {plant ? (
              <div className="w-full h-full flex items-center justify-center p-1.5 translate-z-10 animate-in zoom-in duration-500 rounded-xl relative">
                <img 
                  src={plant.image} 
                  alt={plant.name}
                  className="w-full h-full object-contain transform scale-110 group-hover:scale-125 transition-all duration-500 ease-out"
                />
                
                {/* Modern Remove Button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    removePlant(index);
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-white dark:bg-slate-900 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center shadow-md hover:scale-110 active:scale-90 z-30 border border-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-2 h-2 bg-green-300 dark:bg-green-700 rounded-full animate-pulse shadow-[0_0_10px_#4ade80]"></div>
              </div>
            )}
            
            {/* Minimal Grid Label */}
            <span className="absolute bottom-1 right-1 text-[7px] font-bold text-gray-300 dark:text-gray-700 opacity-30 select-none">
              {(index + 1).toString().padStart(2, '0')}
            </span>
          </div>
        ))}

        {/* Floating Empty State Hint */}
        {grid.every(p => p === null) && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white p-10 rounded-[40px] border border-gray-100 flex flex-col items-center gap-6 text-center animate-float">
              <div className="w-20 h-20 bg-gray-50 dark:bg-slate-900 rounded-[24px] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-green-500/5 animate-slow-spin"></div>
                <Trees className="text-green-600 dark:text-green-400 w-10 h-10 relative z-10" />
              </div>
              <div className="max-w-[240px]">
                <h4 className="font-black text-2xl text-gray-900 dark:text-white tracking-tight">Fertile Soil</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">Your garden is ready. Drag a botanical seed from the dock below to begin your legacy.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modern Legend */}
      <div className="mt-16 flex flex-wrap justify-center gap-8 px-4">
        <div className="flex items-center gap-3 text-[11px] text-gray-400 font-bold uppercase tracking-widest">
          <div className="w-5 h-5 rounded-lg bg-white/40 border border-dashed border-gray-200"></div>
          <span>Open Earth</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-gray-400 font-bold uppercase tracking-widest">
          <div className="w-5 h-5 rounded-lg bg-white dark:bg-slate-800 ring-1 ring-gray-100"></div>
          <span>Planted Bed</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-green-500">
          <div className="w-5 h-5 rounded-lg ring-2 ring-green-400 bg-white"></div>
          <span>Active Drop</span>
        </div>
      </div>
    </div>
  );
};

export default GardenGrid;
