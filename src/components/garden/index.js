// Barrel exports for garden components
// Mobile-optimized (paginated 5x5, tap-to-plant, compact)
export { MobileGardenTab, MobileGardenGrid, MobilePlantTray } from './mobile';

// Web/Desktop-optimized (full 8-col grid, drag-drop, side-by-side shop)
export { WebGardenTab, WebGardenGrid, WebPlantTray } from './web';

// Default exports for backward compatibility
export { MobileGardenTab as GardenTab } from './mobile';
export { MobileGardenGrid as GardenGrid } from './mobile';
export { MobilePlantTray as PlantTray } from './mobile';
