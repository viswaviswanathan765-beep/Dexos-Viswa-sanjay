import React from 'react';
import { Layers } from 'lucide-react';

interface FloorTabsProps {
  totalFloors: number;
  activeFloor: number;
  onChange: (floorIndex: number) => void;
}

export const FloorTabs: React.FC<FloorTabsProps> = ({ totalFloors, activeFloor, onChange }) => {
  return (
    <div className="absolute top-4 left-4 flex bg-slate-900/80 backdrop-blur border border-slate-700 p-1 rounded-lg shadow-lg z-10">
      <div className="flex items-center px-2 text-slate-400 mr-1 border-r border-slate-700">
        <Layers size={16} />
      </div>
      {Array.from({ length: totalFloors }).map((_, i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeFloor === i 
              ? 'bg-blue-600/20 text-blue-400' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          {i === 0 ? 'Ground Floor' : `Floor ${i}`}
        </button>
      ))}
    </div>
  );
};
