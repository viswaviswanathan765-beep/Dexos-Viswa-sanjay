import React from 'react';
import { X, Maximize2, Hash, DoorOpen, Layers, Link as LinkIcon } from 'lucide-react';
import { ROOM_COLORS } from '../types';
import type { PlacedRoom, ValidationResult, RelationshipSpec } from '../types';

interface RoomDetailPanelProps {
  room: PlacedRoom | null;
  validations: ValidationResult[];
  relationships?: RelationshipSpec[];
  onClose: () => void;
}

export const RoomDetailPanel: React.FC<RoomDetailPanelProps> = ({ room, validations, relationships = [], onClose }) => {
  if (!room) return null;

  const roomValidations = validations.filter(v =>
    v.affectedRooms && v.affectedRooms.includes(room.id)
  );
  
  const roomRelationships = relationships.filter(
    r => r.fromRoomType === room.type || r.toRoomType === room.type
  );

  const color = ROOM_COLORS[room.type];

  return (
    <div className="absolute top-4 right-4 w-72 bg-slate-900/95 backdrop-blur border border-slate-700 rounded-lg shadow-2xl z-20 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color?.stroke || '#888' }} />
          <h3 className="font-semibold text-slate-200 text-sm">{room.name}</h3>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white rounded-md hover:bg-slate-700 p-1">
          <X size={16} />
        </button>
      </div>

      <div className="p-3 flex flex-col gap-3 max-h-[70vh] overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800 flex flex-col items-center">
            <Maximize2 size={14} className="text-slate-500 mb-1" />
            <span className="text-[10px] text-slate-400">Dimensions</span>
            <span className="text-xs font-medium text-slate-200">
              {room.width.toFixed(1)} × {room.height.toFixed(1)} ft
            </span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800 flex flex-col items-center">
            <Hash size={14} className="text-slate-500 mb-1" />
            <span className="text-[10px] text-slate-400">Area</span>
            <span className="text-xs font-medium text-slate-200">{room.area.toFixed(0)} sq.ft</span>
          </div>
        </div>

        {roomRelationships.length > 0 && (
          <div className="flex flex-col gap-1.5 mt-1">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              <LinkIcon size={12} />
              Relationships
            </div>
            {roomRelationships.map((r, i) => {
              const target = r.fromRoomType === room.type ? r.toRoomType : r.fromRoomType;
              return (
                <div key={i} className="flex items-center justify-between text-xs p-1.5 rounded bg-slate-800 border border-slate-700">
                  <span className="text-slate-300">{target}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    r.relationshipType === 'ADJACENT' ? 'bg-blue-900/50 text-blue-300' :
                    r.relationshipType === 'CONNECTED' ? 'bg-green-900/50 text-green-300' :
                    'bg-amber-900/50 text-amber-300'
                  }`}>
                    {r.relationshipType}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {roomValidations.length > 0 && (
          <div className="flex flex-col gap-1.5 mt-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Live Issues</span>
            {roomValidations.map((v, i) => (
              <div key={i} className={`text-xs p-2 rounded border ${
                v.severity === 'ERROR' ? 'bg-red-900/20 border-red-900/50 text-red-300' :
                v.severity === 'WARNING' ? 'bg-amber-900/20 border-amber-900/50 text-amber-300' :
                'bg-green-900/20 border-green-900/50 text-green-300'
              }`}>
                {v.message}
                {v.suggestedFix && (
                  <div className="mt-1.5 text-[10px] opacity-80 pt-1.5 border-t border-current">
                    <strong>Suggestion:</strong> {v.suggestedFix}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
