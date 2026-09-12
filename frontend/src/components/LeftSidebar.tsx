import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Settings, Maximize, Home, Sliders, Layers, Car, Plus, Trash2 } from 'lucide-react';
import { ROOM_COLORS, ROOM_DEFAULTS } from '../types';
import type { ProjectConfig, RoomSpec, RoomType, Priority, FinishQuality, Orientation, Unit } from '../types';

interface LeftSidebarProps {
  config: ProjectConfig;
  onChange: (config: ProjectConfig) => void;
}

const CollapsibleSection: React.FC<{ title: string; icon: React.ReactNode; defaultOpen?: boolean; children: React.ReactNode }> = ({ title, icon, defaultOpen = true, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-700/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium">{title}</span>
        </div>
        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>
      {isOpen && <div className="p-3 pt-1 bg-slate-800/20">{children}</div>}
    </div>
  );
};

const inputClass = "w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-200 focus:border-blue-500 transition-colors";
const labelClass = "text-xs text-slate-400 mb-0.5";

const ROOM_TYPE_OPTIONS: { value: RoomType; label: string }[] = [
  { value: 'LIVING', label: 'Living Room' },
  { value: 'DINING', label: 'Dining Room' },
  { value: 'KITCHEN', label: 'Kitchen' },
  { value: 'MASTER_BEDROOM', label: 'Master Bedroom' },
  { value: 'BEDROOM', label: 'Bedroom' },
  { value: 'BATHROOM', label: 'Bathroom' },
  { value: 'UTILITY', label: 'Utility' },
  { value: 'STUDY', label: 'Study' },
  { value: 'POOJA', label: 'Pooja Room' },
  { value: 'STORE', label: 'Store' },
  { value: 'GUEST_ROOM', label: 'Guest Room' },
  { value: 'FAMILY_LOUNGE', label: 'Family Lounge' },
  { value: 'PARKING', label: 'Car Parking' },
  { value: 'BALCONY', label: 'Balcony' },
  { value: 'STAIRCASE', label: 'Staircase' },
];

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ config, onChange }) => {
  const updatePlot = (key: string, value: number | string) => {
    onChange({ ...config, plot: { ...config.plot, [key]: value } });
  };

  const updateRoom = (idx: number, updates: Partial<RoomSpec>) => {
    const newRooms = [...config.rooms];
    newRooms[idx] = { ...newRooms[idx], ...updates };
    onChange({ ...config, rooms: newRooms });
  };

  const addRoom = () => {
    const newRoom: RoomSpec = {
      type: 'BEDROOM',
      name: 'Bedroom',
      minArea: ROOM_DEFAULTS['BEDROOM'].minArea,
      priority: 'MEDIUM',
      required: true,
      quantity: 1,
    };
    onChange({ ...config, rooms: [...config.rooms, newRoom] });
  };

  const removeRoom = (idx: number) => {
    onChange({ ...config, rooms: config.rooms.filter((_, i) => i !== idx) });
  };

  return (
    <div className="w-[290px] min-w-[290px] h-full bg-slate-900 border-r border-slate-700 flex flex-col overflow-y-auto">
      <div className="p-3 border-b border-slate-700 bg-slate-800/50">
        <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Settings size={16} className="text-slate-400" />
          Project Parameters
        </h2>
      </div>

      {/* Plot Configuration */}
      <CollapsibleSection title="Plot Configuration" icon={<Maximize size={16} className="text-blue-400" />}>
        <div className="grid grid-cols-2 gap-2 mt-1">
          <div className="flex flex-col">
            <label className={labelClass}>Width</label>
            <input
              type="number"
              value={config.plot.width}
              onChange={e => updatePlot('width', Number(e.target.value))}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col">
            <label className={labelClass}>Depth</label>
            <input
              type="number"
              value={config.plot.depth}
              onChange={e => updatePlot('depth', Number(e.target.value))}
              className={inputClass}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="flex flex-col">
            <label className={labelClass}>Unit</label>
            <select value={config.plot.unit} onChange={e => updatePlot('unit', e.target.value as Unit)} className={inputClass}>
              <option value="FT">Feet (FT)</option>
              <option value="M">Meters (M)</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className={labelClass}>Orientation</label>
            <select value={config.plot.orientation} onChange={e => updatePlot('orientation', e.target.value as Orientation)} className={inputClass}>
              <option value="NORTH">North</option>
              <option value="SOUTH">South</option>
              <option value="EAST">East</option>
              <option value="WEST">West</option>
            </select>
          </div>
        </div>
        <div className="mt-2 flex flex-col">
          <label className={labelClass}>Road / Access Side</label>
          <select value={config.plot.roadSide} onChange={e => updatePlot('roadSide', e.target.value)} className={inputClass}>
            <option value="NORTH">North</option>
            <option value="SOUTH">South</option>
            <option value="EAST">East</option>
            <option value="WEST">West</option>
          </select>
        </div>
        <div className="mt-2 p-2 bg-slate-950/50 rounded text-xs text-slate-500">
          Plot Area: <span className="text-slate-300 font-medium">{(config.plot.width * config.plot.depth).toLocaleString()} sq.{config.plot.unit.toLowerCase()}</span>
        </div>
      </CollapsibleSection>

      {/* Setbacks */}
      <CollapsibleSection title="Setback Requirements" icon={<Layers size={16} className="text-purple-400" />}>
        <div className="grid grid-cols-2 gap-2 mt-1">
          {(['frontSetback', 'rearSetback', 'leftSetback', 'rightSetback'] as const).map(key => (
            <div key={key} className="flex flex-col">
              <label className={labelClass}>{key.replace('Setback', '')}</label>
              <input
                type="number"
                value={config.plot[key]}
                onChange={e => updatePlot(key, Number(e.target.value))}
                className={inputClass}
                min={0}
                step={0.5}
              />
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Room Requirements */}
      <CollapsibleSection title="Room Requirements" icon={<Home size={16} className="text-green-400" />}>
        <div className="flex flex-col gap-2 mt-1">
          {config.rooms.map((room, idx) => (
            <div key={idx} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: ROOM_COLORS[room.type]?.stroke || '#888' }}
                  />
                  <select
                    value={room.type}
                    onChange={e => {
                      const type = e.target.value as RoomType;
                      const defaults = ROOM_DEFAULTS[type];
                      updateRoom(idx, {
                        type,
                        name: ROOM_TYPE_OPTIONS.find(o => o.value === type)?.label || type,
                        minArea: defaults?.minArea || 100,
                      });
                    }}
                    className="bg-transparent text-xs font-medium text-slate-300 border-none p-0 focus:ring-0"
                  >
                    {ROOM_TYPE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <button onClick={() => removeRoom(idx)} className="text-slate-600 hover:text-red-400 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <div className="flex flex-col">
                  <label className="text-[10px] text-slate-500">Qty</label>
                  <input
                    type="number"
                    value={room.quantity}
                    onChange={e => updateRoom(idx, { quantity: Math.max(1, Number(e.target.value)) })}
                    className="bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-xs text-slate-200"
                    min={1}
                    max={5}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] text-slate-500">Min Area</label>
                  <input
                    type="number"
                    value={room.minArea}
                    onChange={e => updateRoom(idx, { minArea: Number(e.target.value) })}
                    className="bg-slate-900 border border-slate-700 rounded px-1.5 py-1 text-xs text-slate-200"
                    min={20}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] text-slate-500">Priority</label>
                  <select
                    value={room.priority}
                    onChange={e => updateRoom(idx, { priority: e.target.value as Priority })}
                    className="bg-slate-900 border border-slate-700 rounded px-1 py-1 text-xs text-slate-200"
                  >
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Med</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-[10px] text-slate-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={room.required}
                    onChange={e => updateRoom(idx, { required: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-600 text-blue-500 w-3 h-3"
                  />
                  Required
                </label>
              </div>
            </div>
          ))}
          <button
            onClick={addRoom}
            className="flex items-center justify-center gap-1.5 py-2 border border-dashed border-slate-700 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-colors"
          >
            <Plus size={14} /> Add Room
          </button>
        </div>
      </CollapsibleSection>

      {/* Building Configuration */}
      <CollapsibleSection title="Building Config" icon={<Sliders size={16} className="text-amber-400" />}>
        <div className="flex flex-col gap-3 mt-1">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <label className={labelClass}>Floors</label>
              <input
                type="number"
                value={config.floors}
                onChange={e => onChange({ ...config, floors: Math.max(1, Math.min(3, Number(e.target.value))) })}
                className={inputClass}
                min={1}
                max={3}
              />
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>Floor Height</label>
              <input
                type="number"
                value={config.floorHeight}
                onChange={e => onChange({ ...config, floorHeight: Number(e.target.value) })}
                className={inputClass}
                min={8}
                max={15}
              />
            </div>
          </div>
          <div className="flex flex-col">
            <label className={labelClass}>Finish Quality</label>
            <select
              value={config.finishQuality}
              onChange={e => onChange({ ...config, finishQuality: e.target.value as FinishQuality })}
              className={inputClass}
            >
              <option value="ECONOMY">Economy (×0.7)</option>
              <option value="STANDARD">Standard (×1.0)</option>
              <option value="PREMIUM">Premium (×1.5)</option>
              <option value="LUXURY">Luxury (×2.0)</option>
            </select>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
};
