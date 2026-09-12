import React, { useState, useRef, useEffect } from 'react';
import { TransformWrapper, TransformComponent, useControls } from 'react-zoom-pan-pinch';
import { ROOM_COLORS } from '../types';
import type { PlacedRoom, Plot, ValidationResult, RelationshipSpec } from '../types';
import { getBuildableArea } from '../engine/spatialEngine';
import { SofaSymbol, BedSymbol, DiningTableSymbol, KitchenCounterSymbol, BathroomFixtures, CarSymbol, StaircasePattern } from './FurnitureSymbols';
import { ZoomIn, ZoomOut, Maximize, MousePointer2 } from 'lucide-react';

interface FloorPlanSVGProps {
  rooms: PlacedRoom[];
  plot: Plot;
  activeFloor: number;
  selectedRoom: string | null;
  onSelectRoom: (id: string | null) => void;
  onRoomMove?: (id: string, newX: number, newY: number) => void;
  onRoomDragEnd?: () => void;
  showDimensions: boolean;
  showFurniture: boolean;
  showValidation: boolean;
  validations?: ValidationResult[];
  relationships?: RelationshipSpec[];
}

const Controls = () => {
  const { zoomIn, zoomOut, resetTransform, centerView } = useControls();
  return (
    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 bg-slate-800/90 backdrop-blur rounded-md border border-slate-700 p-1 shadow-lg pointer-events-auto">
      <button onClick={() => zoomIn()} className="p-2 hover:bg-slate-700 rounded text-slate-300" title="Zoom In"><ZoomIn size={16} /></button>
      <button onClick={() => zoomOut()} className="p-2 hover:bg-slate-700 rounded text-slate-300" title="Zoom Out"><ZoomOut size={16} /></button>
      <button onClick={() => resetTransform()} className="p-2 hover:bg-slate-700 rounded text-slate-300" title="100%"><Maximize size={16} /></button>
      <button onClick={() => centerView(1)} className="p-2 hover:bg-slate-700 rounded text-slate-300" title="Fit to Screen"><MousePointer2 size={16} /></button>
    </div>
  );
};

export const FloorPlanSVG: React.FC<FloorPlanSVGProps> = ({
  rooms,
  plot,
  activeFloor,
  selectedRoom,
  onSelectRoom,
  onRoomMove,
  onRoomDragEnd,
  showDimensions,
  showFurniture,
  relationships = [],
  validations = [],
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [dragState, setDragState] = useState<{ id: string, startX: number, startY: number, initialRoomX: number, initialRoomY: number } | null>(null);
  const [scale, setScale] = useState(1); 

  const buildable = getBuildableArea(plot);
  const padding = 15;
  const totalW = plot.width + padding * 2;
  const totalH = plot.depth + padding * 2;

  const handlePointerDown = (e: React.PointerEvent, room: PlacedRoom) => {
    if (e.button !== 0) return; 
    e.stopPropagation();
    onSelectRoom(room.id);
    setDragState({
      id: room.id,
      startX: e.clientX,
      startY: e.clientY,
      initialRoomX: room.x,
      initialRoomY: room.y
    });
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState || !onRoomMove) return;
    e.stopPropagation();
    
    const dx = (e.clientX - dragState.startX) / scale;
    const dy = (e.clientY - dragState.startY) / scale;
    
    // Snap to 1 ft grid
    const newX = Math.round((dragState.initialRoomX + dx) * 1) / 1;
    const newY = Math.round((dragState.initialRoomY + dy) * 1) / 1;

    onRoomMove(dragState.id, newX, newY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragState) return;
    e.stopPropagation();
    (e.target as Element).releasePointerCapture(e.pointerId);
    setDragState(null);
    if (onRoomDragEnd) onRoomDragEnd();
  };

  const renderRelationships = () => {
    if (!selectedRoom || !relationships || relationships.length === 0) return null;
    const selected = rooms.find(r => r.id === selectedRoom);
    if (!selected || selected.floor !== activeFloor) return null;

    const rels = relationships.filter(r => r.fromRoomType === selected.type || r.toRoomType === selected.type);
    
    return rels.map((rel, i) => {
      const targetType = rel.fromRoomType === selected.type ? rel.toRoomType : rel.fromRoomType;
      const targetRoom = rooms.find(r => r.type === targetType && r.floor === activeFloor);
      if (!targetRoom) return null;
      
      const x1 = selected.x + selected.width / 2;
      const y1 = selected.y + selected.height / 2;
      const x2 = targetRoom.x + targetRoom.width / 2;
      const y2 = targetRoom.y + targetRoom.height / 2;
      
      let stroke = '#f59e0b'; // orange for NEAR
      if (rel.relationshipType === 'ADJACENT') stroke = '#3b82f6'; // blue
      if (rel.relationshipType === 'CONNECTED') stroke = '#10b981'; // green

      return (
        <g key={`rel-${i}`} pointerEvents="none">
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={Math.max(0.2, 2 / scale)} strokeDasharray="1 1" opacity={0.6} />
          <circle cx={x2} cy={y2} r={Math.max(0.3, 3 / scale)} fill={stroke} opacity={0.8} />
          {scale > 1.5 && (
            <text x={(x1+x2)/2} y={(y1+y2)/2 - 1/scale} fill={stroke} fontSize={Math.max(0.6, 6 / scale)} textAnchor="middle" fontWeight="bold">
              {rel.relationshipType}
            </text>
          )}
        </g>
      );
    });
  };

  const renderFurniture = (room: PlacedRoom) => {
    if (!showFurniture || scale < 0.5) return null; 
    const props = { x: room.x, y: room.y, width: room.width, height: room.height };
    switch (room.type) {
      case 'LIVING': return <SofaSymbol {...props} />;
      case 'MASTER_BEDROOM': case 'BEDROOM': case 'GUEST_ROOM': return <BedSymbol {...props} />;
      case 'DINING': return <DiningTableSymbol {...props} />;
      case 'KITCHEN': return <KitchenCounterSymbol {...props} />;
      case 'BATHROOM': return <BathroomFixtures {...props} />;
      case 'PARKING': return <CarSymbol {...props} />;
      case 'STAIRCASE': return <StaircasePattern {...props} />;
      default: return null;
    }
  };

  const renderDoors = (room: PlacedRoom) => {
    if (scale < 0.3) return null;
    return (room.doors || []).map((door, i) => {
      const r = door.width;
      let arc = '';
      if (door.side === 'RIGHT') {
        const sx = room.x + room.width, sy = room.y + door.y;
        arc = `M ${sx} ${sy} A ${r} ${r} 0 0 1 ${sx} ${sy + r}`;
      } else if (door.side === 'LEFT') {
        const sx = room.x, sy = room.y + door.y;
        arc = `M ${sx} ${sy} A ${r} ${r} 0 0 0 ${sx} ${sy + r}`;
      } else if (door.side === 'BOTTOM') {
        const sx = room.x + door.x, sy = room.y + room.height;
        arc = `M ${sx} ${sy} A ${r} ${r} 0 0 0 ${sx + r} ${sy}`;
      } else {
        const sx = room.x + door.x, sy = room.y;
        arc = `M ${sx} ${sy} A ${r} ${r} 0 0 1 ${sx + r} ${sy}`;
      }
      return <path key={`d-${room.id}-${i}`} d={arc} fill="none" stroke="#8B6914" strokeWidth="0.3" opacity={0.8} />;
    });
  };

  const renderWindows = (room: PlacedRoom) => {
    if (scale < 0.3) return null;
    return (room.windows || []).map((win, i) => {
      const th = 0.6;
      let wx: number, wy: number, ww: number, wh: number;
      if (win.side === 'TOP') { wx = room.x + win.x; wy = room.y - th / 2; ww = win.width; wh = th; }
      else if (win.side === 'BOTTOM') { wx = room.x + win.x; wy = room.y + room.height - th / 2; ww = win.width; wh = th; }
      else if (win.side === 'LEFT') { wx = room.x - th / 2; wy = room.y + win.y; ww = th; wh = win.width; }
      else { wx = room.x + room.width - th / 2; wy = room.y + win.y; ww = th; wh = win.width; }
      return (
        <g key={`w-${room.id}-${i}`}>
          <rect x={wx} y={wy} width={ww} height={wh} fill="#87CEEB" stroke="#4682B4" strokeWidth="0.15" rx="0.1" />
          {(win.side === 'TOP' || win.side === 'BOTTOM') && (
            <line x1={wx} y1={wy + wh / 2} x2={wx + ww} y2={wy + wh / 2} stroke="#4682B4" strokeWidth="0.1" />
          )}
          {(win.side === 'LEFT' || win.side === 'RIGHT') && (
            <line x1={wx + ww / 2} y1={wy} x2={wx + ww / 2} y2={wy + wh} stroke="#4682B4" strokeWidth="0.1" />
          )}
        </g>
      );
    });
  };

  const currentFloorRooms = rooms.filter(r => r.floor === activeFloor);
  const floorLabel = activeFloor === 0 ? 'Ground Floor' : `Floor ${activeFloor}`;

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden relative bg-[#0d1117]"
    >
      <TransformWrapper
        initialScale={15}
        minScale={1}
        maxScale={50}
        centerOnInit
        panning={{ disabled: dragState !== null }}
        wheel={{ step: 0.1 }}
        onTransformed={(ref) => setScale(ref.state.scale)}
      >
        <>
          <Controls />
          <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
            <svg
              width="100%"
              height="100%"
              viewBox={`${-padding} ${-padding} ${totalW} ${totalH}`}
              style={{ overflow: 'visible' }}
            >
              <defs>
                <pattern id="grid-pattern" width="1" height="1" patternUnits="userSpaceOnUse">
                  <path d="M 1 0 L 0 0 0 1" fill="none" stroke="#1e293b" strokeWidth="0.05" />
                </pattern>
                <pattern id="grid-pattern-lg" width="5" height="5" patternUnits="userSpaceOnUse">
                  <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#334155" strokeWidth="0.1" />
                </pattern>
              </defs>

              <g>
                <rect x={-padding * 10} y={-padding * 10} width={totalW * 20} height={totalH * 20} fill="url(#grid-pattern)" />
                <rect x={-padding * 10} y={-padding * 10} width={totalW * 20} height={totalH * 20} fill="url(#grid-pattern-lg)" />

                <rect
                  x={0} y={0} width={plot.width} height={plot.depth}
                  fill="none" stroke="#475569" strokeWidth="0.5" strokeDasharray="2 1"
                />

                <path
                  d={`M 0 0 h ${plot.width} v ${plot.depth} h -${plot.width} Z M ${buildable.x} ${buildable.y} v ${buildable.height} h ${buildable.width} v -${buildable.height} Z`}
                  fill="#1e293b"
                  opacity={0.6}
                  fillRule="evenodd"
                />

                <rect
                  x={buildable.x} y={buildable.y} width={buildable.width} height={buildable.height}
                  fill="none" stroke="#64748b" strokeWidth="0.3" strokeDasharray="1 0.5"
                />

                {scale > 5 && (
                  <>
                    <text x={plot.width / 2} y={-1.5} textAnchor="middle" fontSize="2" fill="#64748b" fontFamily="Inter, sans-serif">
                      {plot.width} {plot.unit.toLowerCase()}
                    </text>
                    <text x={-2} y={plot.depth / 2} textAnchor="middle" fontSize="2" fill="#64748b" fontFamily="Inter, sans-serif"
                      transform={`rotate(-90, -2, ${plot.depth / 2})`}>
                      {plot.depth} {plot.unit.toLowerCase()}
                    </text>
                  </>
                )}

                {currentFloorRooms.map(room => {
                  const isSelected = selectedRoom === room.id;
                  const color = ROOM_COLORS[room.type] || { fill: '#2d3748', stroke: '#718096', label: room.type };
                  return (
                    <g 
                      key={room.id} 
                      onPointerDown={(e) => handlePointerDown(e, room)}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerCancel={handlePointerUp}
                      className="cursor-pointer"
                    >
                      <rect
                        x={room.x} y={room.y} width={room.width} height={room.height}
                        fill={color.fill} fillOpacity={0.85}
                        stroke={isSelected ? '#60a5fa' : color.stroke}
                        strokeWidth={isSelected ? Math.max(0.2, 10 / scale) : Math.max(0.1, 5 / scale)}
                        rx="0.2"
                      />

                      {isSelected && (
                        <rect
                          x={room.x - 0.3} y={room.y - 0.3}
                          width={room.width + 0.6} height={room.height + 0.6}
                          fill="none" stroke="#3b82f6" strokeWidth={Math.max(0.1, 5 / scale)} strokeDasharray="1 0.5" opacity={0.6} rx="0.3"
                        />
                      )}

                      {renderFurniture(room)}
                      {renderDoors(room)}
                      {renderWindows(room)}

                      {scale > 8 && (
                        <text
                          x={room.x + room.width / 2} y={room.y + room.height / 2 - (showDimensions ? 1 : 0)}
                          textAnchor="middle" fontSize={Math.max(1, 20 / scale)} fontWeight="600" fill="#1e293b"
                          fontFamily="Inter, sans-serif" pointerEvents="none"
                        >
                          {color.label}
                        </text>
                      )}

                      {showDimensions && scale > 12 && (
                        <>
                          <text
                            x={room.x + room.width / 2} y={room.y + room.height / 2 + 1}
                            textAnchor="middle" fontSize={Math.max(0.8, 16 / scale)} fill="#475569"
                            fontFamily="Inter, sans-serif" pointerEvents="none"
                          >
                            {room.width.toFixed(1)}′ × {room.height.toFixed(1)}′
                          </text>
                          <text
                            x={room.x + room.width / 2} y={room.y + room.height / 2 + 2.5}
                            textAnchor="middle" fontSize={Math.max(0.6, 14 / scale)} fill="#64748b"
                            fontFamily="Inter, sans-serif" pointerEvents="none"
                          >
                            {room.area.toFixed(0)} sq.ft
                          </text>
                        </>
                      )}
                    </g>
                  );
                })}
                
                {renderRelationships()}

                <text x={plot.width - 1} y={plot.depth + 4} textAnchor="end" fontSize="2" fill="#475569" fontFamily="Inter, sans-serif">
                  {floorLabel}
                </text>
              </g>
            </svg>
          </TransformComponent>
        </>
      </TransformWrapper>

      {/* Compass */}
      <div className="absolute top-4 right-4 w-14 h-14 bg-slate-800/90 backdrop-blur rounded-full border border-slate-700 flex items-center justify-center flex-col text-xs pointer-events-none shadow-lg">
        <span className="text-red-400 font-bold text-[10px] -mb-0.5">N</span>
        <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-l-transparent border-r-transparent border-b-red-400" />
        <div className="w-0.5 h-2 bg-slate-500 -mt-0.5" />
        <span className="text-slate-500 text-[8px] -mt-0.5">S</span>
      </div>
    </div>
  );
};
