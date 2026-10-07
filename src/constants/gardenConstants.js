
export const PLANT_TYPES = {
  APPLE: {
    id: 'apple',
    name: 'Apple',
    cost: 500,
    icon: '🍎',
    description: 'A sweet red apple tree.',
    image: '/assets/plants/apple.png'
  },
  BONSAI: {
    id: 'bonsai',
    name: 'Bonsai',
    cost: 1500,
    icon: '🪴',
    description: 'A carefully pruned miniature tree.',
    image: '/assets/plants/bonsai.png'
  },
  CACTUS: {
    id: 'cactus',
    name: 'Cactus',
    cost: 300,
    icon: '🌵',
    description: 'A resilient desert survivor.',
    image: '/assets/plants/cactus.png'
  },
  CHERRY: {
    id: 'cherry',
    name: 'Cherry',
    cost: 700,
    icon: '🍒',
    description: 'Blossoming cherry tree with sweet fruit.',
    image: '/assets/plants/cherry.png'
  },
  CLOVER: {
    id: 'clover',
    name: 'Clover',
    cost: 100,
    icon: '🍀',
    description: 'A patch of lucky four-leaf clovers.',
    image: '/assets/plants/clover.png'
  },
  CRYSTAL_SAKURA: {
    id: 'crystal_sakura',
    name: 'Crystal Sakura',
    cost: 5000,
    icon: '🌸',
    description: 'A magical cherry blossom with glowing crystal petals.',
    image: '/assets/plants/crystal_sakura.png'
  },
  GRAPE: {
    id: 'grape',
    name: 'Grape',
    cost: 600,
    icon: '🍇',
    description: 'Juicy purple grapes on a vine.',
    image: '/assets/plants/grape.png'
  },
  HIBISCUS: {
    id: 'hibiscus',
    name: 'Hibiscus',
    cost: 400,
    icon: '🌺',
    description: 'A vibrant tropical flower.',
    image: '/assets/plants/hibiscus.png'
  },
  LAVENDER: {
    id: 'lavender',
    name: 'Lavender',
    cost: 350,
    icon: '🪻',
    description: 'Fragrant purple lavender bushes.',
    image: '/assets/plants/lavender.png'
  },
  MELON: {
    id: 'melon',
    name: 'Melon',
    cost: 800,
    icon: '🍈',
    description: 'Fresh and sweet honeydew melon.',
    image: '/assets/plants/melon.png'
  },
  MUSHROOM: {
    id: 'mushroom',
    name: 'Mushroom',
    cost: 450,
    icon: '🍄',
    description: 'A cute forest mushroom.',
    image: '/assets/plants/mushroom.png'
  },
  PALM: {
    id: 'palm',
    name: 'Palm Tree',
    cost: 1000,
    icon: '🌴',
    description: 'A breezy tropical palm tree.',
    image: '/assets/plants/palm.png'
  },
  PALMOIL: {
    id: 'palmoil',
    name: 'Oil Palm',
    cost: 1200,
    icon: '🌴',
    description: 'A productive tropical oil palm.',
    image: '/assets/plants/palmoil.png'
  },
  PINE: {
    id: 'pine',
    name: 'Pine Tree',
    cost: 1100,
    icon: '🌲',
    description: 'A sturdy evergreen pine tree.',
    image: '/assets/plants/pine.png'
  },
  ROSE: {
    id: 'rose',
    name: 'Rose',
    cost: 400,
    icon: '🌹',
    description: 'A beautiful romantic red rose.',
    image: '/assets/plants/rose.png'
  },
  STRAWBERRY: {
    id: 'strawberry',
    name: 'Strawberry',
    cost: 300,
    icon: '🍓',
    description: 'Rows of sweet red strawberries.',
    image: '/assets/plants/strawberry.png'
  },
  SUNFLOWER: {
    id: 'sunflower',
    name: 'Sunflower',
    cost: 500,
    icon: '🌻',
    description: 'A tall flower that follows the sun.',
    image: '/assets/plants/sunflower.png'
  },
  TULIP: {
    id: 'tulip',
    name: 'Tulip',
    cost: 350,
    icon: '🌷',
    description: 'A classic and colorful spring flower.',
    image: '/assets/plants/tulip.png'
  },
  WATERMELON: {
    id: 'watermelon',
    name: 'Watermelon',
    cost: 900,
    icon: '🍉',
    description: 'A large, juicy summer watermelon.',
    image: '/assets/plants/watermelon.png'
  }
};

export const GARDEN_STORAGE_KEY = 'lockin_garden_data_v2';
export const COINS_STORAGE_KEY = 'lockin_coins_balance';
export const GRID_SIZE = 75; // 3 pages × 5×5
export const PAGE_SIZE = 25; // 5×5 per page
export const TOTAL_PAGES = 3;

// Helper to create a plant entry
const createPlant = (type, daysAgo = 0) => ({
  ...type,
  plantedAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString()
});

// Initial grid with some dummy data spread across 3 pages
export const INITIAL_DUMMY_GARDEN = Array(GRID_SIZE).fill(null).map((_, index) => {
  // Page 1 (slots 0-24)
  if (index === 0) return createPlant(PLANT_TYPES.PINE, 20);
  if (index === 4) return createPlant(PLANT_TYPES.CHERRY, 15);
  if (index === 12) return createPlant(PLANT_TYPES.APPLE, 5);
  if (index === 13) return createPlant(PLANT_TYPES.BONSAI, 10);
  if (index === 20) return createPlant(PLANT_TYPES.CACTUS, 8);

  // Page 2 (slots 25-49)
  if (index === 31) return createPlant(PLANT_TYPES.ROSE, 2);
  if (index === 37) return createPlant(PLANT_TYPES.TULIP, 1);
  if (index === 43) return createPlant(PLANT_TYPES.SUNFLOWER, 3);

  // Page 3 (slots 50-74)
  if (index === 56) return createPlant(PLANT_TYPES.PALM, 12);
  if (index === 62) return createPlant(PLANT_TYPES.MUSHROOM, 7);
  if (index === 68) return createPlant(PLANT_TYPES.PALMOIL, 6);

  return null;
});
