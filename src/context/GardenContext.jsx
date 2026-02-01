
import React, { createContext, useContext, useState, useEffect } from 'react';
import { PLANT_TYPES, GARDEN_STORAGE_KEY, COINS_STORAGE_KEY } from '../constants/gardenConstants';

const GardenContext = createContext();

export const useGarden = () => {
  const context = useContext(GardenContext);
  if (!context) {
    throw new Error('useGarden must be used within a GardenProvider');
  }
  return context;
};

export const GardenProvider = ({ children }) => {
  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem(COINS_STORAGE_KEY);
    return saved ? parseInt(saved) : 100000; // Starting coins (100k for Senior testing)
  });

  const [grid, setGrid] = useState(() => {
    const saved = localStorage.getItem(GARDEN_STORAGE_KEY);
    return saved ? JSON.parse(saved) : Array(64).fill(null); // 8x8 grid
  });

  // Persist state
  useEffect(() => {
    localStorage.setItem(COINS_STORAGE_KEY, coins.toString());
  }, [coins]);

  useEffect(() => {
    localStorage.setItem(GARDEN_STORAGE_KEY, JSON.stringify(grid));
  }, [grid]);

  // Listen for custom storage events (dummy data)
  useEffect(() => {
    const handleRefresh = () => {
      const savedGrid = localStorage.getItem(GARDEN_STORAGE_KEY);
      const savedCoins = localStorage.getItem(COINS_STORAGE_KEY);
      if (savedGrid) setGrid(JSON.parse(savedGrid));
      if (savedCoins) setCoins(parseInt(savedCoins));
    };

    window.addEventListener('local-data-updated', handleRefresh);
    return () => window.removeEventListener('local-data-updated', handleRefresh);
  }, []);

  // Earn coins based on work (10 coins per hour)
  const addCoinsFromWork = (hours) => {
    const earned = Math.floor(hours * 10);
    if (earned > 0) {
      setCoins(prev => prev + earned);
      return earned;
    }
    return 0;
  };

  const buyPlant = (plantId, slotIndex) => {
    const plant = Object.values(PLANT_TYPES).find(p => p.id === plantId);
    if (!plant) return { success: false, message: 'Plant not found' };
    if (coins < plant.cost) return { success: false, message: 'Not enough coins' };
    if (grid[slotIndex] !== null) return { success: false, message: 'Slot already occupied' };

    setCoins(prev => prev - plant.cost);
    setGrid(prev => {
      const newGrid = [...prev];
      newGrid[slotIndex] = {
        ...plant,
        plantedAt: new Date().toISOString()
      };
      return newGrid;
    });

    return { success: true };
  };

  const removePlant = (slotIndex) => {
    setGrid(prev => {
      const newGrid = [...prev];
      newGrid[slotIndex] = null;
      return newGrid;
    });
  };

  return (
    <GardenContext.Provider value={{
      coins,
      grid,
      addCoinsFromWork,
      buyPlant,
      removePlant,
      plantTypes: PLANT_TYPES
    }}>
      {children}
    </GardenContext.Provider>
  );
};
