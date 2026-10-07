import React, { createContext, useContext, useState, useEffect } from 'react';
import { PLANT_TYPES, GARDEN_STORAGE_KEY, COINS_STORAGE_KEY, INITIAL_DUMMY_GARDEN, GRID_SIZE } from '../constants/gardenConstants';

const INVENTORY_STORAGE_KEY = 'lockin_plant_inventory';

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
    return saved ? parseInt(saved) : 100000;
  });

  const [grid, setGrid] = useState(() => {
    const saved = localStorage.getItem(GARDEN_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.length < GRID_SIZE) {
        return [...parsed, ...Array(GRID_SIZE - parsed.length).fill(null)];
      }
      return parsed;
    }
    return INITIAL_DUMMY_GARDEN;
  });

  // Inventory: { plantId: count }
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem(INVENTORY_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  // Persist state
  useEffect(() => {
    localStorage.setItem(COINS_STORAGE_KEY, coins.toString());
  }, [coins]);

  useEffect(() => {
    localStorage.setItem(GARDEN_STORAGE_KEY, JSON.stringify(grid));
  }, [grid]);

  useEffect(() => {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(inventory));
  }, [inventory]);

  // Listen for custom storage events
  useEffect(() => {
    const handleRefresh = () => {
      const savedGrid = localStorage.getItem(GARDEN_STORAGE_KEY);
      const savedCoins = localStorage.getItem(COINS_STORAGE_KEY);
      const savedInv = localStorage.getItem(INVENTORY_STORAGE_KEY);
      if (savedGrid) setGrid(JSON.parse(savedGrid));
      if (savedCoins) setCoins(parseInt(savedCoins));
      if (savedInv) setInventory(JSON.parse(savedInv));
    };

    window.addEventListener('local-data-updated', handleRefresh);
    return () => window.removeEventListener('local-data-updated', handleRefresh);
  }, []);

  // Earn coins
  const addCoinsFromWork = (hours) => {
    const earned = Math.floor(hours * 10);
    if (earned > 0) {
      setCoins(prev => prev + earned);
      return earned;
    }
    return 0;
  };

  // Buy and immediately plant (used by mobile + drag-drop on web grid)
  const buyPlant = (plantId, slotIndex) => {
    const plant = Object.values(PLANT_TYPES).find(p => p.id === plantId);
    if (!plant) return { success: false, message: 'Plant not found' };
    if (coins < plant.cost) return { success: false, message: 'Not enough coins' };
    if (grid[slotIndex] !== null) return { success: false, message: 'Slot already occupied' };

    setCoins(prev => prev - plant.cost);
    setGrid(prev => {
      const newGrid = [...prev];
      newGrid[slotIndex] = { ...plant, plantedAt: new Date().toISOString() };
      return newGrid;
    });

    return { success: true };
  };

  // Buy seed into inventory (web shop → My Plants)
  const buyToInventory = (plantId) => {
    const plant = Object.values(PLANT_TYPES).find(p => p.id === plantId);
    if (!plant) return { success: false, message: 'Plant not found' };
    if (coins < plant.cost) return { success: false, message: 'Not enough coins' };

    setCoins(prev => prev - plant.cost);
    setInventory(prev => ({
      ...prev,
      [plantId]: (prev[plantId] || 0) + 1
    }));

    return { success: true };
  };

  // Plant from inventory into grid (drag from My Plants → grid)
  const plantFromInventory = (plantId, slotIndex) => {
    const plant = Object.values(PLANT_TYPES).find(p => p.id === plantId);
    if (!plant) return { success: false, message: 'Plant not found' };
    if (!inventory[plantId] || inventory[plantId] <= 0) return { success: false, message: 'No seeds in inventory' };
    if (grid[slotIndex] !== null) return { success: false, message: 'Slot already occupied' };

    setInventory(prev => {
      const updated = { ...prev };
      updated[plantId] = (updated[plantId] || 0) - 1;
      if (updated[plantId] <= 0) delete updated[plantId];
      return updated;
    });

    setGrid(prev => {
      const newGrid = [...prev];
      newGrid[slotIndex] = { ...plant, plantedAt: new Date().toISOString() };
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
      inventory,
      addCoinsFromWork,
      buyPlant,
      buyToInventory,
      plantFromInventory,
      removePlant,
      plantTypes: PLANT_TYPES
    }}>
      {children}
    </GardenContext.Provider>
  );
};
