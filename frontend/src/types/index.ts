// ============================================================
// ArchPlanner — Core Type Definitions
// ============================================================

// ---- Enums ----
export type Unit = 'FT' | 'M';
export type Orientation = 'NORTH' | 'SOUTH' | 'EAST' | 'WEST';
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
export type Severity = 'ERROR' | 'WARNING' | 'INFO' | 'SUCCESS';
export type RelationshipType = 'ADJACENT' | 'NEAR' | 'CONNECTED' | 'ACCESSIBLE_FROM' | 'SHOULD_NOT_BE_ADJACENT';
export type FinishQuality = 'ECONOMY' | 'STANDARD' | 'PREMIUM' | 'LUXURY';
export type ViewMode = '2D' | '3D' | 'SPLIT';
export type ThreeDViewMode = 'EXTERIOR' | 'FLOOR_BY_FLOOR' | 'WIREFRAME' | 'EXPLODED';

export type RoomType =
  | 'LIVING' | 'DINING' | 'KITCHEN' | 'MASTER_BEDROOM' | 'BEDROOM'
  | 'BATHROOM' | 'UTILITY' | 'STUDY' | 'POOJA' | 'STORE'
  | 'GUEST_ROOM' | 'FAMILY_LOUNGE' | 'PARKING' | 'BALCONY'
  | 'STAIRCASE' | 'CORRIDOR';

// ---- Room Colors ----
export const ROOM_COLORS: Record<RoomType, { fill: string; stroke: string; label: string }> = {
  LIVING:         { fill: '#E8F5E9', stroke: '#4CAF50', label: 'Living Room' },
  DINING:         { fill: '#FFF3E0', stroke: '#FF9800', label: 'Dining Room' },
  KITCHEN:        { fill: '#FFEBEE', stroke: '#F44336', label: 'Kitchen' },
  MASTER_BEDROOM: { fill: '#E3F2FD', stroke: '#2196F3', label: 'Master Bedroom' },
  BEDROOM:        { fill: '#E8EAF6', stroke: '#3F51B5', label: 'Bedroom' },
  BATHROOM:       { fill: '#E0F7FA', stroke: '#00BCD4', label: 'Bathroom' },
  UTILITY:        { fill: '#F3E5F5', stroke: '#9C27B0', label: 'Utility' },
  STUDY:          { fill: '#FFF8E1', stroke: '#FFC107', label: 'Study' },
  POOJA:          { fill: '#FCE4EC', stroke: '#E91E63', label: 'Pooja Room' },
  STORE:          { fill: '#EFEBE9', stroke: '#795548', label: 'Store' },
  GUEST_ROOM:     { fill: '#E8EAF6', stroke: '#5C6BC0', label: 'Guest Room' },
  FAMILY_LOUNGE:  { fill: '#F1F8E9', stroke: '#8BC34A', label: 'Family Lounge' },
  PARKING:        { fill: '#ECEFF1', stroke: '#607D8B', label: 'Parking' },
  BALCONY:        { fill: '#F9FBE7', stroke: '#CDDC39', label: 'Balcony' },
  STAIRCASE:      { fill: '#FBE9E7', stroke: '#FF5722', label: 'Staircase' },
  CORRIDOR:       { fill: '#F5F5F5', stroke: '#9E9E9E', label: 'Corridor' },
};

// ---- Room Defaults ----
export const ROOM_DEFAULTS: Record<RoomType, { minArea: number; defaultWidth: number; defaultHeight: number }> = {
  LIVING:         { minArea: 200, defaultWidth: 16, defaultHeight: 14 },
  DINING:         { minArea: 150, defaultWidth: 14, defaultHeight: 12 },
  KITCHEN:        { minArea: 100, defaultWidth: 12, defaultHeight: 10 },
  MASTER_BEDROOM: { minArea: 200, defaultWidth: 16, defaultHeight: 14 },
  BEDROOM:        { minArea: 140, defaultWidth: 14, defaultHeight: 12 },
  BATHROOM:       { minArea: 40,  defaultWidth: 8,  defaultHeight: 6 },
  UTILITY:        { minArea: 50,  defaultWidth: 8,  defaultHeight: 7 },
  STUDY:          { minArea: 100, defaultWidth: 12, defaultHeight: 10 },
  POOJA:          { minArea: 30,  defaultWidth: 6,  defaultHeight: 6 },
  STORE:          { minArea: 35,  defaultWidth: 7,  defaultHeight: 6 },
  GUEST_ROOM:     { minArea: 140, defaultWidth: 14, defaultHeight: 12 },
  FAMILY_LOUNGE:  { minArea: 160, defaultWidth: 14, defaultHeight: 12 },
  PARKING:        { minArea: 170, defaultWidth: 18, defaultHeight: 10 },
  BALCONY:        { minArea: 40,  defaultWidth: 10, defaultHeight: 5 },
  STAIRCASE:      { minArea: 56,  defaultWidth: 8,  defaultHeight: 8 },
  CORRIDOR:       { minArea: 30,  defaultWidth: 4,  defaultHeight: 8 },
};

// ---- Default Relationships ----
export const DEFAULT_RELATIONSHIPS: { from: RoomType; to: RoomType; type: RelationshipType; priority: Priority }[] = [
  { from: 'KITCHEN', to: 'DINING', type: 'ADJACENT', priority: 'HIGH' },
  { from: 'DINING', to: 'LIVING', type: 'ADJACENT', priority: 'HIGH' },
  { from: 'LIVING', to: 'CORRIDOR', type: 'ACCESSIBLE_FROM', priority: 'HIGH' },
  { from: 'MASTER_BEDROOM', to: 'BATHROOM', type: 'ADJACENT', priority: 'HIGH' },
  { from: 'BEDROOM', to: 'BATHROOM', type: 'NEAR', priority: 'MEDIUM' },
  { from: 'MASTER_BEDROOM', to: 'BALCONY', type: 'ADJACENT', priority: 'MEDIUM' },
  { from: 'PARKING', to: 'CORRIDOR', type: 'ACCESSIBLE_FROM', priority: 'HIGH' },
  { from: 'KITCHEN', to: 'UTILITY', type: 'NEAR', priority: 'LOW' },
  { from: 'POOJA', to: 'LIVING', type: 'NEAR', priority: 'LOW' },
];

// ---- Data Models ----
export interface Plot {
  width: number;
  depth: number;
  unit: Unit;
  orientation: Orientation;
  roadSide: string;
  frontSetback: number;
  rearSetback: number;
  leftSetback: number;
  rightSetback: number;
}

export interface RoomSpec {
  type: RoomType;
  name: string;
  minArea: number;
  priority: Priority;
  required: boolean;
  quantity: number;
  preferredWidth?: number;
  preferredHeight?: number;
}

export interface RelationshipSpec {
  fromRoomType: RoomType;
  toRoomType: RoomType;
  relationshipType: RelationshipType;
  priority: Priority;
}

export interface Door {
  x: number;
  y: number;
  width: number;
  side: 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT';
}

export interface Window {
  x: number;
  y: number;
  width: number;
  side: 'TOP' | 'BOTTOM' | 'LEFT' | 'RIGHT';
}

export interface PlacedRoom {
  id: string;
  type: RoomType;
  name: string;
  floor: number;
  x: number;
  y: number;
  width: number;
  height: number;
  area: number;
  doors: Door[];
  windows: Window[];
}

export interface ValidationResult {
  severity: Severity;
  category: string;
  message: string;
  affectedRooms: string[];
  suggestedFix: string;
}

export interface CostEstimate {
  builtUpArea: number;
  ratePerSqFt: number;
  totalCost: number;
  structureCost: number;
  flooringCost: number;
  electricalCost: number;
  plumbingCost: number;
  finishesCost: number;
  finishQuality: FinishQuality;
}

export interface SpaceAnalysis {
  plotArea: number;
  buildableArea: number;
  builtUpArea: number;
  openArea: number;
  spaceUtilization: number;
  roomCount: number;
  circulationArea: number;
  parkingArea: number;
  validationScore: number;
  estimatedCost: number;
}

export interface FloorPlan {
  id: string;
  projectId: string;
  totalFloors: number;
  rooms: PlacedRoom[];
  validations: ValidationResult[];
  cost: CostEstimate;
  analysis: SpaceAnalysis;
  generatedAt: string;
}

export interface ProjectConfig {
  id?: string;
  name: string;
  plot: Plot;
  rooms: RoomSpec[];
  relationships: RelationshipSpec[];
  floors: number;
  floorHeight: number;
  finishQuality: FinishQuality;
  naturalLanguageInput?: string;
}

// AI response types
export interface InterpretResponse {
  plot: Plot;
  floors: number;
  rooms: RoomSpec[];
  relationships: RelationshipSpec[];
  preferences: string[];
  warnings: string[];
  fallbackMode: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

// ---- Demo Config ----
export const DEMO_CONFIG: ProjectConfig = {
  name: 'Dream Villa — Demo Project',
  plot: {
    width: 40,
    depth: 60,
    unit: 'FT',
    orientation: 'EAST',
    roadSide: 'EAST',
    frontSetback: 5,
    rearSetback: 4,
    leftSetback: 3,
    rightSetback: 3,
  },
  rooms: [
    { type: 'LIVING', name: 'Living Room', minArea: 220, priority: 'HIGH', required: true, quantity: 1 },
    { type: 'DINING', name: 'Dining Room', minArea: 140, priority: 'HIGH', required: true, quantity: 1 },
    { type: 'KITCHEN', name: 'Kitchen', minArea: 110, priority: 'HIGH', required: true, quantity: 1 },
    { type: 'MASTER_BEDROOM', name: 'Master Bedroom', minArea: 200, priority: 'HIGH', required: true, quantity: 1 },
    { type: 'BEDROOM', name: 'Bedroom', minArea: 150, priority: 'HIGH', required: true, quantity: 2 },
    { type: 'BATHROOM', name: 'Bathroom', minArea: 45, priority: 'HIGH', required: true, quantity: 3 },
    { type: 'PARKING', name: 'Car Parking', minArea: 180, priority: 'HIGH', required: true, quantity: 1 },
    { type: 'UTILITY', name: 'Utility Room', minArea: 50, priority: 'MEDIUM', required: true, quantity: 1 },
    { type: 'POOJA', name: 'Pooja Room', minArea: 30, priority: 'MEDIUM', required: true, quantity: 1 },
    { type: 'BALCONY', name: 'Balcony', minArea: 45, priority: 'MEDIUM', required: true, quantity: 1 },
    { type: 'STAIRCASE', name: 'Staircase', minArea: 56, priority: 'HIGH', required: true, quantity: 1 },
  ],
  relationships: [
    { fromRoomType: 'KITCHEN', toRoomType: 'DINING', relationshipType: 'ADJACENT', priority: 'HIGH' },
    { fromRoomType: 'DINING', toRoomType: 'LIVING', relationshipType: 'ADJACENT', priority: 'HIGH' },
    { fromRoomType: 'MASTER_BEDROOM', toRoomType: 'BATHROOM', relationshipType: 'ADJACENT', priority: 'HIGH' },
    { fromRoomType: 'BEDROOM', toRoomType: 'BATHROOM', relationshipType: 'NEAR', priority: 'MEDIUM' },
    { fromRoomType: 'MASTER_BEDROOM', toRoomType: 'BALCONY', relationshipType: 'ADJACENT', priority: 'MEDIUM' },
    { fromRoomType: 'PARKING', toRoomType: 'CORRIDOR', relationshipType: 'ACCESSIBLE_FROM', priority: 'HIGH' },
  ],
  floors: 2,
  floorHeight: 10,
  finishQuality: 'STANDARD',
};
