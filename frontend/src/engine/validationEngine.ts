// ============================================================
// ArchPlanner — Validation Engine
// ============================================================
// Validates a generated floor plan against plot constraints,
// room requirements, spatial relationships, and building codes.

import { ROOM_DEFAULTS } from '../types';
import type {
  Plot, PlacedRoom, RelationshipSpec, ValidationResult,
  Severity, RoomType
} from '../types';
import { getBuildableArea, areAdjacent } from './spatialEngine';

interface ValidationContext {
  plot: Plot;
  rooms: PlacedRoom[];
  relationships: RelationshipSpec[];
  totalFloors: number;
}

function addResult(
  results: ValidationResult[],
  severity: Severity,
  category: string,
  message: string,
  affectedRooms: string[] = [],
  suggestedFix: string = ''
) {
  results.push({ severity, category, message, affectedRooms, suggestedFix });
}

/** Validate plot dimensions */
function validatePlot(ctx: ValidationContext, results: ValidationResult[]) {
  const { plot } = ctx;
  if (plot.width <= 0 || plot.depth <= 0) {
    addResult(results, 'ERROR', 'Plot', 'Plot dimensions must be positive', [], 'Correct plot width and depth');
    return;
  }
  const area = plot.width * plot.depth;
  addResult(results, 'SUCCESS', 'Plot', `Plot area: ${area} sq.${plot.unit.toLowerCase()}`);

  const buildable = getBuildableArea(plot);
  if (buildable.width <= 0 || buildable.height <= 0) {
    addResult(results, 'ERROR', 'Plot', 'Setbacks consume entire plot — no buildable area', [],
      'Reduce setback values');
    return;
  }
  addResult(results, 'SUCCESS', 'Plot', `Buildable area: ${buildable.area.toFixed(0)} sq.${plot.unit.toLowerCase()}`);
}

/** Validate setback compliance */
function validateSetbacks(ctx: ValidationContext, results: ValidationResult[]) {
  const { plot, rooms } = ctx;
  const buildable = getBuildableArea(plot);

  for (const room of rooms) {
    if (room.floor > 0) continue; // Setbacks mainly apply to ground floor

    if (room.x < buildable.x - 0.1) {
      addResult(results, 'ERROR', 'Setback', `${room.name} violates left setback`, [room.id],
        `Move ${room.name} right by ${(buildable.x - room.x).toFixed(1)} ${plot.unit.toLowerCase()}`);
    }
    if (room.x + room.width > buildable.x + buildable.width + 0.1) {
      addResult(results, 'ERROR', 'Setback', `${room.name} violates right setback`, [room.id],
        `Reduce width of ${room.name} or move it left`);
    }
    if (room.y < buildable.y - 0.1) {
      addResult(results, 'ERROR', 'Setback', `${room.name} violates front setback`, [room.id],
        `Move ${room.name} back from the front`);
    }
    if (room.y + room.height > buildable.y + buildable.height + 0.1) {
      addResult(results, 'ERROR', 'Setback', `${room.name} violates rear setback`, [room.id],
        `Reduce depth of ${room.name} or move it forward`);
    }
  }

  const violations = results.filter(r => r.category === 'Setback' && r.severity === 'ERROR');
  if (violations.length === 0) {
    addResult(results, 'SUCCESS', 'Setback', 'All setback requirements satisfied');
  }
}

/** Validate no room overlaps */
function validateOverlaps(ctx: ValidationContext, results: ValidationResult[]) {
  const { rooms } = ctx;
  let hasOverlap = false;

  for (let i = 0; i < rooms.length; i++) {
    for (let j = i + 1; j < rooms.length; j++) {
      if (rooms[i].floor !== rooms[j].floor) continue;

      const a = rooms[i], b = rooms[j];
      const overlapX = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
      const overlapY = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));

      if (overlapX > 0.1 && overlapY > 0.1) {
        hasOverlap = true;
        addResult(results, 'ERROR', 'Overlap',
          `${a.name} overlaps with ${b.name} (${(overlapX * overlapY).toFixed(1)} sq.ft)`,
          [a.id, b.id],
          `Adjust position or size of ${a.name} or ${b.name}`);
      }
    }
  }

  if (!hasOverlap) {
    addResult(results, 'SUCCESS', 'Overlap', 'No room overlaps detected');
  }
}

/** Validate room minimum areas */
function validateRoomAreas(ctx: ValidationContext, results: ValidationResult[]) {
  const { rooms } = ctx;
  let allOk = true;

  for (const room of rooms) {
    const defaults = ROOM_DEFAULTS[room.type];
    if (!defaults) continue;

    const minArea = defaults.minArea;
    if (room.area < minArea * 0.85) { // 15% tolerance
      allOk = false;
      addResult(results, 'WARNING', 'Room Size',
        `${room.name} area (${room.area.toFixed(0)} sq.ft) is below recommended minimum (${minArea} sq.ft)`,
        [room.id],
        `Increase ${room.name} area to at least ${minArea} sq.ft`);
    }

    // Check minimum width
    const minDim = Math.min(room.width, room.height);
    if (minDim < 5.5) {
      allOk = false;
      addResult(results, 'WARNING', 'Room Size',
        `${room.name} has a narrow dimension of ${minDim.toFixed(1)} ft (minimum recommended: 6 ft)`,
        [room.id],
        `Widen ${room.name} to at least 6 ft`);
    }
  }

  if (allOk) {
    addResult(results, 'SUCCESS', 'Room Size', 'All rooms meet minimum size requirements');
  }
}

/** Validate spatial relationships */
function validateRelationships(ctx: ValidationContext, results: ValidationResult[]) {
  const { rooms, relationships } = ctx;
  let satisfiedCount = 0;
  let totalChecked = 0;

  for (const rel of relationships) {
    const fromRooms = rooms.filter(r => r.type === rel.fromRoomType);
    const toRooms = rooms.filter(r => r.type === rel.toRoomType);

    if (fromRooms.length === 0 || toRooms.length === 0) continue;

    totalChecked++;
    let satisfied = false;

    for (const from of fromRooms) {
      for (const to of toRooms) {
        if (from.floor !== to.floor) continue;
        if (rel.relationshipType === 'ADJACENT' || rel.relationshipType === 'CONNECTED') {
          if (areAdjacent(from, to)) {
            satisfied = true;
            break;
          }
        } else if (rel.relationshipType === 'NEAR') {
          // Near: within 10ft
          const cx1 = from.x + from.width / 2;
          const cy1 = from.y + from.height / 2;
          const cx2 = to.x + to.width / 2;
          const cy2 = to.y + to.height / 2;
          const dist = Math.sqrt((cx1 - cx2) ** 2 + (cy1 - cy2) ** 2);
          if (dist < Math.max(from.width, from.height, to.width, to.height) + 10) {
            satisfied = true;
            break;
          }
        } else {
          // ACCESSIBLE_FROM — just needs to be on same floor (simplified)
          satisfied = true;
          break;
        }
      }
      if (satisfied) break;
    }

    if (satisfied) {
      satisfiedCount++;
      addResult(results, 'SUCCESS', 'Relationship',
        `${rel.fromRoomType} ↔ ${rel.toRoomType}: ${rel.relationshipType.toLowerCase()} ✓`);
    } else {
      const sev: Severity = rel.priority === 'HIGH' ? 'WARNING' : 'INFO';
      addResult(results, sev, 'Relationship',
        `${rel.fromRoomType} ↔ ${rel.toRoomType}: ${rel.relationshipType.toLowerCase()} not satisfied`,
        [],
        `Try rearranging ${rel.fromRoomType} closer to ${rel.toRoomType}`);
    }
  }

  return { satisfiedCount, totalChecked };
}

/** Validate multi-floor requirements */
function validateFloors(ctx: ValidationContext, results: ValidationResult[]) {
  const { rooms, totalFloors } = ctx;

  if (totalFloors > 1) {
    const hasStaircase = rooms.some(r => r.type === 'STAIRCASE');
    if (!hasStaircase) {
      addResult(results, 'ERROR', 'Floor', 'Multi-floor building requires a staircase', [],
        'Add a staircase to the plan');
    } else {
      // Check staircase on each floor
      for (let f = 0; f < totalFloors; f++) {
        const floorStair = rooms.find(r => r.type === 'STAIRCASE' && r.floor === f);
        if (!floorStair) {
          addResult(results, 'WARNING', 'Floor',
            `No staircase found on floor ${f}`, [],
            `Add staircase to floor ${f}`);
        }
      }
      addResult(results, 'SUCCESS', 'Floor', 'Staircase connects all floors');
    }
  }

  // Check floor distribution
  for (let f = 0; f < totalFloors; f++) {
    const floorRooms = rooms.filter(r => r.floor === f);
    if (floorRooms.length === 0) {
      addResult(results, 'WARNING', 'Floor', `Floor ${f} has no rooms assigned`);
    }
  }
}

/** Validate parking */
function validateParking(ctx: ValidationContext, results: ValidationResult[]) {
  const { rooms } = ctx;
  const parking = rooms.filter(r => r.type === 'PARKING');

  if (parking.length > 0) {
    for (const p of parking) {
      if (p.area < 150) {
        addResult(results, 'WARNING', 'Parking',
          `Parking space (${p.area.toFixed(0)} sq.ft) may be tight for a car`,
          [p.id],
          'Consider increasing parking area to at least 170 sq.ft');
      } else {
        addResult(results, 'SUCCESS', 'Parking', `Parking space adequate (${p.area.toFixed(0)} sq.ft)`);
      }
    }
  }
}

// ============================================================
// MAIN VALIDATION ENTRY POINT
// ============================================================
export function validateFloorPlan(
  plot: Plot,
  rooms: PlacedRoom[],
  relationships: RelationshipSpec[],
  totalFloors: number
): { validations: ValidationResult[]; score: number } {
  const results: ValidationResult[] = [];
  const ctx: ValidationContext = { plot, rooms, relationships, totalFloors };

  validatePlot(ctx, results);
  validateSetbacks(ctx, results);
  validateOverlaps(ctx, results);
  validateRoomAreas(ctx, results);
  const relResult = validateRelationships(ctx, results);
  validateFloors(ctx, results);
  validateParking(ctx, results);

  // Calculate overall score
  const errors = results.filter(r => r.severity === 'ERROR').length;
  const warnings = results.filter(r => r.severity === 'WARNING').length;
  const successes = results.filter(r => r.severity === 'SUCCESS').length;
  const total = results.length;

  let score = 100;
  score -= errors * 15;
  score -= warnings * 5;
  score = Math.max(0, Math.min(100, score));

  // Bonus for relationship satisfaction
  if (relResult.totalChecked > 0) {
    const relScore = (relResult.satisfiedCount / relResult.totalChecked) * 20;
    score = Math.min(100, score + relScore - 10); // net 0-10 bonus
  }

  score = Math.round(score);

  return { validations: results, score };
}
