// ============================================================
// ArchPlanner — Deterministic Spatial Planning Engine
// ============================================================
// This engine takes plot specs + room requirements and produces
// a complete, validated layout with room coordinates, doors, and windows.
// NO AI is involved here — everything is algorithmic and reproducible.

import { ROOM_DEFAULTS } from '../types';
import type {
  Plot, RoomSpec, RelationshipSpec, PlacedRoom, Door, Window,
  RoomType, Priority
} from '../types';

// Ground-floor public room types
const GROUND_FLOOR_TYPES: RoomType[] = [
  'PARKING', 'LIVING', 'DINING', 'KITCHEN', 'UTILITY', 'POOJA', 'STORE', 'STAIRCASE', 'CORRIDOR',
];

// Upper-floor private room types
const UPPER_FLOOR_TYPES: RoomType[] = [
  'MASTER_BEDROOM', 'BEDROOM', 'BATHROOM', 'STUDY', 'GUEST_ROOM',
  'FAMILY_LOUNGE', 'BALCONY', 'STAIRCASE',
];

interface BuildableArea {
  x: number;
  y: number;
  width: number;
  height: number;
  area: number;
}

function getBuildableArea(plot: Plot): BuildableArea {
  const x = plot.leftSetback;
  const y = plot.frontSetback;
  const width = plot.width - plot.leftSetback - plot.rightSetback;
  const height = plot.depth - plot.frontSetback - plot.rearSetback;
  return { x, y, width, height, area: width * height };
}

/** Expand each RoomSpec by quantity into individual room requests */
function expandRoomSpecs(specs: RoomSpec[]): { type: RoomType; name: string; minArea: number; priority: Priority; index: number }[] {
  const expanded: { type: RoomType; name: string; minArea: number; priority: Priority; index: number }[] = [];
  for (const spec of specs) {
    if (!spec.required) continue;
    for (let i = 0; i < spec.quantity; i++) {
      const name = spec.quantity > 1 ? `${spec.name} ${i + 1}` : spec.name;
      expanded.push({
        type: spec.type,
        name,
        minArea: spec.minArea || ROOM_DEFAULTS[spec.type]?.minArea || 100,
        priority: spec.priority,
        index: i,
      });
    }
  }
  return expanded;
}

/** Sort rooms: HIGH first, then MEDIUM, then LOW, with larger rooms first within same priority */
function sortByPriority(rooms: { priority: Priority; minArea: number }[]): typeof rooms {
  const priorityOrder: Record<Priority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  return [...rooms].sort((a, b) => {
    const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (pDiff !== 0) return pDiff;
    return b.minArea - a.minArea; // larger rooms first
  });
}

/** Calculate good dimensions for a given area that fit within max bounds */
function calculateDimensions(
  area: number,
  maxWidth: number,
  maxHeight: number,
  type: RoomType,
  preferredWidth?: number,
  preferredHeight?: number
): { width: number; height: number } {
  if (preferredWidth && preferredHeight && preferredWidth <= maxWidth && preferredHeight <= maxHeight) {
    return { width: preferredWidth, height: preferredHeight };
  }
  const defaults = ROOM_DEFAULTS[type];
  let w = defaults?.defaultWidth || Math.sqrt(area * 1.2);
  let h = area / w;

  // Clamp to max bounds
  if (w > maxWidth) {
    w = maxWidth;
    h = area / w;
  }
  if (h > maxHeight) {
    h = maxHeight;
    w = area / h;
  }

  // Ensure minimum dimension of 6ft
  if (w < 6) { w = 6; h = area / w; }
  if (h < 6) { h = 6; w = area / h; }

  // Final clamp
  w = Math.min(w, maxWidth);
  h = Math.min(h, maxHeight);

  return { width: Math.round(w * 10) / 10, height: Math.round(h * 10) / 10 };
}

/** Check if two rectangles overlap */
function rectsOverlap(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

/** Check if two rooms share a wall (are adjacent) */
function areAdjacent(a: PlacedRoom, b: PlacedRoom): boolean {
  const tolerance = 0.5;
  // Horizontally adjacent
  if (Math.abs((a.x + a.width) - b.x) < tolerance || Math.abs((b.x + b.width) - a.x) < tolerance) {
    const overlapStart = Math.max(a.y, b.y);
    const overlapEnd = Math.min(a.y + a.height, b.y + b.height);
    if (overlapEnd - overlapStart > 2) return true;
  }
  // Vertically adjacent
  if (Math.abs((a.y + a.height) - b.y) < tolerance || Math.abs((b.y + b.height) - a.y) < tolerance) {
    const overlapStart = Math.max(a.x, b.x);
    const overlapEnd = Math.min(a.x + a.width, b.x + b.width);
    if (overlapEnd - overlapStart > 2) return true;
  }
  return false;
}

/** Determine which side a door should be on between two adjacent rooms */
function getDoorSide(room: PlacedRoom, neighbor: PlacedRoom): 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT' {
  const tolerance = 0.5;
  if (Math.abs((room.x + room.width) - neighbor.x) < tolerance) return 'RIGHT';
  if (Math.abs((neighbor.x + neighbor.width) - room.x) < tolerance) return 'LEFT';
  if (Math.abs((room.y + room.height) - neighbor.y) < tolerance) return 'BOTTOM';
  return 'TOP';
}

/** Get exterior wall sides for a room within the buildable area */
function getExteriorSides(room: PlacedRoom, buildable: BuildableArea): ('TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT')[] {
  const sides: ('TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT')[] = [];
  const tol = 0.5;
  if (Math.abs(room.x - buildable.x) < tol) sides.push('LEFT');
  if (Math.abs(room.x + room.width - (buildable.x + buildable.width)) < tol) sides.push('RIGHT');
  if (Math.abs(room.y - buildable.y) < tol) sides.push('TOP');
  if (Math.abs(room.y + room.height - (buildable.y + buildable.height)) < tol) sides.push('BOTTOM');
  return sides;
}

/** Generate doors for a room based on adjacent rooms */
function generateDoors(room: PlacedRoom, allRooms: PlacedRoom[], buildable: BuildableArea): Door[] {
  const doors: Door[] = [];
  const sameFloor = allRooms.filter(r => r.floor === room.floor && r.id !== room.id);

  for (const neighbor of sameFloor) {
    if (areAdjacent(room, neighbor)) {
      const side = getDoorSide(room, neighbor);
      let dx = 0, dy = 0;
      const doorWidth = 3;
      switch (side) {
        case 'RIGHT':
          dx = room.width - 0.5;
          dy = Math.max(0, Math.min(room.height - doorWidth, (Math.max(room.y, neighbor.y) - room.y + 1)));
          break;
        case 'LEFT':
          dx = -0.5;
          dy = Math.max(0, Math.min(room.height - doorWidth, (Math.max(room.y, neighbor.y) - room.y + 1)));
          break;
        case 'BOTTOM':
          dx = Math.max(0, Math.min(room.width - doorWidth, (Math.max(room.x, neighbor.x) - room.x + 1)));
          dy = room.height - 0.5;
          break;
        case 'TOP':
          dx = Math.max(0, Math.min(room.width - doorWidth, (Math.max(room.x, neighbor.x) - room.x + 1)));
          dy = -0.5;
          break;
      }
      // Avoid duplicate doors (only add if this room has smaller id)
      if (room.id < neighbor.id) {
        doors.push({ x: dx, y: dy, width: doorWidth, side });
      }
    }
  }

  // Add entrance door for rooms on the road side / exterior
  if (room.type === 'LIVING' || room.type === 'PARKING' || room.type === 'CORRIDOR') {
    const extSides = getExteriorSides(room, buildable);
    if (extSides.length > 0 && doors.length === 0) {
      const side = extSides[0];
      const doorWidth = 3.5;
      let dx = 0, dy = 0;
      switch (side) {
        case 'LEFT':   dx = -0.5; dy = room.height / 2 - doorWidth / 2; break;
        case 'RIGHT':  dx = room.width - 0.5; dy = room.height / 2 - doorWidth / 2; break;
        case 'TOP':    dx = room.width / 2 - doorWidth / 2; dy = -0.5; break;
        case 'BOTTOM': dx = room.width / 2 - doorWidth / 2; dy = room.height - 0.5; break;
      }
      doors.push({ x: dx, y: dy, width: doorWidth, side });
    }
  }

  return doors;
}

/** Generate windows for a room based on exterior walls */
function generateWindows(room: PlacedRoom, buildable: BuildableArea): Window[] {
  const windows: Window[] = [];
  // Skip parking and corridors for windows
  if (room.type === 'PARKING' || room.type === 'CORRIDOR' || room.type === 'STAIRCASE') return windows;

  const extSides = getExteriorSides(room, buildable);
  const windowWidth = 3;

  for (const side of extSides) {
    let wx = 0, wy = 0;
    switch (side) {
      case 'LEFT':   wx = -0.3; wy = room.height / 2 - windowWidth / 2; break;
      case 'RIGHT':  wx = room.width - 0.3; wy = room.height / 2 - windowWidth / 2; break;
      case 'TOP':    wx = room.width / 2 - windowWidth / 2; wy = -0.3; break;
      case 'BOTTOM': wx = room.width / 2 - windowWidth / 2; wy = room.height - 0.3; break;
    }
    windows.push({ x: wx, y: wy, width: windowWidth, side });
  }

  return windows;
}

/** Assign rooms to floors based on type and floor count */
function assignToFloors(
  expandedRooms: { type: RoomType; name: string; minArea: number; priority: Priority; index: number }[],
  totalFloors: number
): Map<number, typeof expandedRooms> {
  const floorMap = new Map<number, typeof expandedRooms>();
  for (let i = 0; i < totalFloors; i++) {
    floorMap.set(i, []);
  }

  // Separate ground and upper floor rooms
  const groundRooms = expandedRooms.filter(r => GROUND_FLOOR_TYPES.includes(r.type));
  const upperRooms = expandedRooms.filter(r => UPPER_FLOOR_TYPES.includes(r.type) && !GROUND_FLOOR_TYPES.includes(r.type));
  const eitherRooms = expandedRooms.filter(r => !GROUND_FLOOR_TYPES.includes(r.type) && !UPPER_FLOOR_TYPES.includes(r.type));

  // Ground floor always gets ground-type rooms
  floorMap.get(0)!.push(...groundRooms);

  // If single floor, everything goes to ground
  if (totalFloors === 1) {
    floorMap.get(0)!.push(...upperRooms, ...eitherRooms);
  } else {
    // Distribute upper rooms across upper floors
    let floorIdx = 1;
    for (const room of upperRooms) {
      floorMap.get(floorIdx)!.push(room);
      if (floorIdx < totalFloors - 1) floorIdx++;
    }
    // Distribute remaining rooms
    floorIdx = 1;
    for (const room of eitherRooms) {
      floorMap.get(floorIdx)!.push(room);
      if (floorIdx < totalFloors - 1) floorIdx++;
    }

    // Add bathroom to ground floor if none
    const hasGroundBathroom = floorMap.get(0)!.some(r => r.type === 'BATHROOM');
    if (!hasGroundBathroom) {
      // Move one bathroom to ground floor
      for (let f = 1; f < totalFloors; f++) {
        const floorRooms = floorMap.get(f)!;
        const bathIdx = floorRooms.findIndex(r => r.type === 'BATHROOM');
        if (bathIdx >= 0) {
          const [bath] = floorRooms.splice(bathIdx, 1);
          floorMap.get(0)!.push(bath);
          break;
        }
      }
    }

    // Add staircase to upper floors
    for (let f = 1; f < totalFloors; f++) {
      const hasStair = floorMap.get(f)!.some(r => r.type === 'STAIRCASE');
      if (!hasStair) {
        floorMap.get(f)!.push({
          type: 'STAIRCASE',
          name: 'Staircase',
          minArea: 56,
          priority: 'HIGH',
          index: 0,
        });
      }
    }
  }

  return floorMap;
}

/** Strip-packing layout algorithm for a single floor */
function layoutFloor(
  rooms: { type: RoomType; name: string; minArea: number; priority: Priority; index: number }[],
  buildable: BuildableArea,
  floor: number,
  relationships: RelationshipSpec[],
  existingStaircasePos?: { x: number; y: number; width: number; height: number }
): PlacedRoom[] {
  const placed: PlacedRoom[] = [];
  const sorted = sortByPriority(rooms);

  // Track used space per row
  let cursorX = buildable.x;
  let cursorY = buildable.y;
  let rowHeight = 0;
  let roomCounter = 0;

  // If staircase position is fixed from ground floor, place it first
  if (floor > 0 && existingStaircasePos) {
    const stairIdx = sorted.findIndex(r => r.type === 'STAIRCASE');
    if (stairIdx >= 0) {
      const stair = sorted.splice(stairIdx, 1)[0];
      placed.push({
        id: `room-${floor}-${roomCounter++}`,
        type: stair.type,
        name: stair.name,
        floor,
        x: existingStaircasePos.x,
        y: existingStaircasePos.y,
        width: existingStaircasePos.width,
        height: existingStaircasePos.height,
        area: existingStaircasePos.width * existingStaircasePos.height,
        doors: [],
        windows: [],
      });
    }
  }

  // Relationship adjacency map for optimization
  const adjacencyPairs = relationships
    .filter(r => r.relationshipType === 'ADJACENT' && r.priority === 'HIGH')
    .map(r => [r.fromRoomType, r.toRoomType]);

  // Reorder sorted rooms to put adjacent pairs together
  const reordered = reorderForAdjacency(sorted, adjacencyPairs);

  for (const room of reordered) {
    const dims = calculateDimensions(
      room.minArea,
      buildable.width - (cursorX - buildable.x),
      buildable.height - (cursorY - buildable.y),
      room.type
    );

    let w = dims.width;
    let h = dims.height;

    // Check if room fits in current row
    if (cursorX + w > buildable.x + buildable.width) {
      // Move to next row
      cursorX = buildable.x;
      cursorY += rowHeight;
      rowHeight = 0;

      // Recalculate dimensions for new row
      const newDims = calculateDimensions(
        room.minArea,
        buildable.width,
        buildable.height - (cursorY - buildable.y),
        room.type
      );
      w = newDims.width;
      h = newDims.height;
    }

    // Check if room fits vertically
    if (cursorY + h > buildable.y + buildable.height) {
      // Try to shrink the room
      const remaining = buildable.y + buildable.height - cursorY;
      if (remaining >= 6) {
        h = remaining;
        w = room.minArea / h;
        if (cursorX + w > buildable.x + buildable.width) {
          w = buildable.x + buildable.width - cursorX;
        }
      } else {
        // Can't fit — skip this room (validation will catch it)
        continue;
      }
    }

    // Check overlap with already placed rooms
    let finalX = cursorX;
    let finalY = cursorY;
    let overlaps = true;
    let attempts = 0;
    while (overlaps && attempts < 20) {
      overlaps = false;
      for (const p of placed) {
        if (p.floor === floor && rectsOverlap(finalX, finalY, w, h, p.x, p.y, p.width, p.height)) {
          overlaps = true;
          // Try moving right
          finalX = p.x + p.width;
          if (finalX + w > buildable.x + buildable.width) {
            finalX = buildable.x;
            finalY = p.y + p.height;
          }
          break;
        }
      }
      attempts++;
    }

    if (finalY + h > buildable.y + buildable.height) continue;

    w = Math.round(w * 10) / 10;
    h = Math.round(h * 10) / 10;

    placed.push({
      id: `room-${floor}-${roomCounter++}`,
      type: room.type,
      name: room.name,
      floor,
      x: Math.round(finalX * 10) / 10,
      y: Math.round(finalY * 10) / 10,
      width: w,
      height: h,
      area: Math.round(w * h * 10) / 10,
      doors: [],
      windows: [],
    });

    cursorX = finalX + w;
    rowHeight = Math.max(rowHeight, h);
  }

  return placed;
}

/** Reorder rooms so adjacency-pair rooms are next to each other in the list */
function reorderForAdjacency(
  rooms: { type: RoomType; name: string; minArea: number; priority: Priority; index: number }[],
  adjacencyPairs: (string | RoomType)[][]
): typeof rooms {
  const result: typeof rooms = [];
  const used = new Set<number>();

  for (let i = 0; i < rooms.length; i++) {
    if (used.has(i)) continue;
    result.push(rooms[i]);
    used.add(i);

    // Find adjacent partners
    for (const pair of adjacencyPairs) {
      if (pair[0] === rooms[i].type || pair[1] === rooms[i].type) {
        const partnerType = pair[0] === rooms[i].type ? pair[1] : pair[0];
        for (let j = i + 1; j < rooms.length; j++) {
          if (!used.has(j) && rooms[j].type === partnerType) {
            result.push(rooms[j]);
            used.add(j);
            break;
          }
        }
      }
    }
  }

  return result;
}

// ============================================================
// MAIN ENTRY POINT
// ============================================================
export function generateFloorPlan(
  plot: Plot,
  roomSpecs: RoomSpec[],
  relationships: RelationshipSpec[],
  totalFloors: number
): PlacedRoom[] {
  const buildable = getBuildableArea(plot);
  const expanded = expandRoomSpecs(roomSpecs);
  const floorMap = assignToFloors(expanded, totalFloors);

  let allRooms: PlacedRoom[] = [];
  let staircasePos: { x: number; y: number; width: number; height: number } | undefined;

  for (let floor = 0; floor < totalFloors; floor++) {
    const floorRooms = floorMap.get(floor) || [];
    const placed = layoutFloor(floorRooms, buildable, floor, relationships, floor > 0 ? staircasePos : undefined);

    // Find staircase position on ground floor for consistency
    if (floor === 0) {
      const stair = placed.find(r => r.type === 'STAIRCASE');
      if (stair) {
        staircasePos = { x: stair.x, y: stair.y, width: stair.width, height: stair.height };
      }
    }

    allRooms.push(...placed);
  }

  // Generate doors and windows
  allRooms = allRooms.map(room => ({
    ...room,
    doors: generateDoors(room, allRooms, buildable),
    windows: generateWindows(room, buildable),
  }));

  return allRooms;
}

export { getBuildableArea, areAdjacent };
