// ============================================================
// ArchPlanner — Cost Estimation Engine
// ============================================================

import type { CostEstimate, FinishQuality, PlacedRoom, Plot } from '../types';
import { getBuildableArea } from './spatialEngine';

const BASE_RATE_PER_SQFT = 2100; // INR

const FINISH_MULTIPLIERS: Record<FinishQuality, number> = {
  ECONOMY: 0.7,
  STANDARD: 1.0,
  PREMIUM: 1.5,
  LUXURY: 2.0,
};

const FLOOR_MULTIPLIERS: Record<number, number> = {
  0: 1.0,
  1: 1.05,
  2: 1.10,
  3: 1.15,
};

// Breakdown percentages
const BREAKDOWN = {
  structure: 0.40,
  flooring: 0.15,
  electrical: 0.10,
  plumbing: 0.10,
  finishes: 0.25,
};

export function calculateCost(
  rooms: PlacedRoom[],
  totalFloors: number,
  finishQuality: FinishQuality = 'STANDARD'
): CostEstimate {
  const finishMultiplier = FINISH_MULTIPLIERS[finishQuality];

  let totalBuiltUpArea = 0;
  let totalCost = 0;

  for (let floor = 0; floor < totalFloors; floor++) {
    const floorRooms = rooms.filter(r => r.floor === floor);
    const floorArea = floorRooms.reduce((sum, r) => sum + r.area, 0);
    const floorMultiplier = FLOOR_MULTIPLIERS[floor] || 1.15;

    totalBuiltUpArea += floorArea;
    totalCost += floorArea * BASE_RATE_PER_SQFT * finishMultiplier * floorMultiplier;
  }

  totalCost = Math.round(totalCost);

  return {
    builtUpArea: Math.round(totalBuiltUpArea),
    ratePerSqFt: Math.round(BASE_RATE_PER_SQFT * finishMultiplier),
    totalCost,
    structureCost: Math.round(totalCost * BREAKDOWN.structure),
    flooringCost: Math.round(totalCost * BREAKDOWN.flooring),
    electricalCost: Math.round(totalCost * BREAKDOWN.electrical),
    plumbingCost: Math.round(totalCost * BREAKDOWN.plumbing),
    finishesCost: Math.round(totalCost * BREAKDOWN.finishes),
    finishQuality,
  };
}

export function calculateSpaceAnalysis(
  plot: Plot,
  rooms: PlacedRoom[],
  cost: CostEstimate,
  validationScore: number
) {
  const plotArea = plot.width * plot.depth;
  const buildable = getBuildableArea(plot);
  const groundFloorRooms = rooms.filter(r => r.floor === 0);
  const groundBuiltUp = groundFloorRooms.reduce((s, r) => s + r.area, 0);
  const totalBuiltUp = rooms.reduce((s, r) => s + r.area, 0);
  const parkingArea = rooms.filter(r => r.type === 'PARKING').reduce((s, r) => s + r.area, 0);
  const circulationArea = rooms.filter(r => r.type === 'CORRIDOR' || r.type === 'STAIRCASE').reduce((s, r) => s + r.area, 0);

  return {
    plotArea: Math.round(plotArea),
    buildableArea: Math.round(buildable.area),
    builtUpArea: Math.round(totalBuiltUp),
    openArea: Math.round(plotArea - groundBuiltUp),
    spaceUtilization: Math.round((groundBuiltUp / buildable.area) * 1000) / 10,
    roomCount: rooms.length,
    circulationArea: Math.round(circulationArea),
    parkingArea: Math.round(parkingArea),
    validationScore,
    estimatedCost: cost.totalCost,
  };
}

/** Format INR amount in Indian numbering system */
export function formatINR(amount: number): string {
  const str = amount.toString();
  let lastThree = str.substring(str.length - 3);
  const otherNumbers = str.substring(0, str.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  return '₹' + otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
}
