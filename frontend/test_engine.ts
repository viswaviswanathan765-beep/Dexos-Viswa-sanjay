import { DEMO_CONFIG } from './src/types/index.js';
import { generateFloorPlan } from './src/engine/spatialEngine.js';

const rooms = generateFloorPlan(
  DEMO_CONFIG.plot, 
  DEMO_CONFIG.rooms, 
  DEMO_CONFIG.relationships, 
  DEMO_CONFIG.floors
);

console.log('Rooms generated:', rooms.length);
console.dir(rooms.slice(0, 2), { depth: null });
