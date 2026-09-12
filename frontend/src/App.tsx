import { useState, useCallback } from 'react';
import { TopBar } from './components/TopBar';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { AIAssistant } from './components/AIAssistant';
import { FloorTabs } from './components/FloorTabs';
import { RoomDetailPanel } from './components/RoomDetailPanel';
import { FloorPlanSVG } from './visualization/FloorPlanSVG';
import { ThreeScene } from './visualization/ThreeScene';
import type {
  ProjectConfig, FloorPlan, ChatMessage, PlacedRoom,
  ViewMode, ThreeDViewMode
} from './types';
import { DEMO_CONFIG } from './types';
import { generateFloorPlan } from './engine/spatialEngine';
import { validateFloorPlan } from './engine/validationEngine';
import { calculateCost, calculateSpaceAnalysis, formatINR } from './engine/costEngine';

const INITIAL_CONFIG: ProjectConfig = {
  name: 'My House Project',
  plot: {
    width: 40, depth: 60, unit: 'FT', orientation: 'EAST', roadSide: 'EAST',
    frontSetback: 5, rearSetback: 4, leftSetback: 3, rightSetback: 3,
  },
  rooms: [
    { type: 'LIVING', name: 'Living Room', minArea: 200, priority: 'HIGH', required: true, quantity: 1 },
    { type: 'DINING', name: 'Dining Room', minArea: 140, priority: 'HIGH', required: true, quantity: 1 },
    { type: 'KITCHEN', name: 'Kitchen', minArea: 100, priority: 'HIGH', required: true, quantity: 1 },
    { type: 'BEDROOM', name: 'Bedroom', minArea: 150, priority: 'HIGH', required: true, quantity: 2 },
    { type: 'BATHROOM', name: 'Bathroom', minArea: 45, priority: 'HIGH', required: true, quantity: 2 },
    { type: 'PARKING', name: 'Car Parking', minArea: 170, priority: 'HIGH', required: true, quantity: 1 },
    { type: 'STAIRCASE', name: 'Staircase', minArea: 56, priority: 'HIGH', required: true, quantity: 1 },
  ],
  relationships: [
    { fromRoomType: 'KITCHEN', toRoomType: 'DINING', relationshipType: 'ADJACENT', priority: 'HIGH' },
    { fromRoomType: 'DINING', toRoomType: 'LIVING', relationshipType: 'ADJACENT', priority: 'HIGH' },
    { fromRoomType: 'BEDROOM', toRoomType: 'BATHROOM', relationshipType: 'NEAR', priority: 'MEDIUM' },
  ],
  floors: 1,
  floorHeight: 10,
  finishQuality: 'STANDARD',
};

function App() {
  const [config, setConfig] = useState<ProjectConfig>(INITIAL_CONFIG);
  const [floorPlan, setFloorPlan] = useState<FloorPlan | null>(null);
  const [history, setHistory] = useState<FloorPlan[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const commitHistory = useCallback((newPlan: FloorPlan) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newPlan);
      if (newHistory.length > 20) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 19));
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      setFloorPlan(history[newIdx]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      setFloorPlan(history[newIdx]);
    }
  }, [history, historyIndex]);

  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('2D');
  const [threeDViewMode, setThreeDViewMode] = useState<ThreeDViewMode>('EXTERIOR');
  const [activeFloor, setActiveFloor] = useState(0);
  const [showDimensions, setShowDimensions] = useState(true);
  const [showFurniture, setShowFurniture] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Welcome to ArchPlanner! I\'m your AI planning assistant. Configure your plot and rooms on the left, then click **Generate Plan** to create your floor plan. Or try the **Demo** button for an instant example!', timestamp: new Date().toISOString() },
  ]);

  const runGeneration = useCallback((cfg: ProjectConfig) => {
    setIsGenerating(true);
    // Small delay for visual feedback
    setTimeout(() => {
      try {
        const rooms = generateFloorPlan(cfg.plot, cfg.rooms, cfg.relationships, cfg.floors);
        const { validations, score } = validateFloorPlan(cfg.plot, rooms, cfg.relationships, cfg.floors);
        const cost = calculateCost(rooms, cfg.floors, cfg.finishQuality);
        const analysis = calculateSpaceAnalysis(cfg.plot, rooms, cost, score);

        const plan: FloorPlan = {
          id: `plan-${Date.now()}`,
          projectId: cfg.id || 'local',
          totalFloors: cfg.floors,
          rooms,
          validations,
          cost,
          analysis,
          generatedAt: new Date().toISOString(),
        };
        setFloorPlan(plan);
        commitHistory(plan);
        setActiveFloor(0);
        setSelectedRoom(null);

        setChatMessages(prev => [...prev, {
          role: 'system',
          content: `✅ Plan generated successfully! ${rooms.length} rooms placed across ${cfg.floors} floor(s). Validation score: **${score}/100**. Estimated cost: **${formatINR(cost.totalCost)}**`,
          timestamp: new Date().toISOString(),
        }]);
      } catch (err) {
        console.error('Generation failed:', err);
        setChatMessages(prev => [...prev, {
          role: 'system',
          content: `❌ Plan generation encountered an error: ${err instanceof Error ? err.message : 'Unknown error'}`,
          timestamp: new Date().toISOString(),
        }]);
      } finally {
        setIsGenerating(false);
      }
    }, 800);
  }, []);

  const handleGenerate = useCallback(() => {
    runGeneration(config);
  }, [config, runGeneration]);

  const handleValidate = useCallback(() => {
    if (!floorPlan) return;
    const { validations, score } = validateFloorPlan(config.plot, floorPlan.rooms, config.relationships, config.floors);
    setFloorPlan(prev => prev ? { ...prev, validations, analysis: { ...prev.analysis, validationScore: score } } : null);
  }, [config, floorPlan]);

  const handleDemo = useCallback(() => {
    const demoConfig = { ...DEMO_CONFIG };
    setConfig(demoConfig);
    runGeneration(demoConfig);
  }, [runGeneration]);

  const handleNewProject = useCallback(() => {
    setConfig(INITIAL_CONFIG);
    setFloorPlan(null);
    setSelectedRoom(null);
    setActiveFloor(0);
  }, []);

  const handleRoomMove = useCallback((roomId: string, newX: number, newY: number, commit = false) => {
    setFloorPlan(prev => {
      if (!prev) return prev;
      
      const newRooms = prev.rooms.map(r => {
        if (r.id === roomId) {
          return { ...r, x: newX, y: newY };
        }
        return r;
      });

      // Quick re-validation and space analysis update
      const { validations, score } = validateFloorPlan(config.plot, newRooms, config.relationships, config.floors);
      const cost = calculateCost(newRooms, config.floors, config.finishQuality);
      const analysis = calculateSpaceAnalysis(config.plot, newRooms, cost, score);

      const nextState = {
        ...prev,
        rooms: newRooms,
        validations,
        cost,
        analysis,
      };

      if (commit) {
        commitHistory(nextState);
      }
      return nextState;
    });
  }, [config, commitHistory]);

  const handleChat = useCallback((msg: string) => {
    setChatMessages(prev => [...prev, { role: 'user', content: msg, timestamp: new Date().toISOString() }]);

    setTimeout(() => {
      let response = "I can help you with your architectural plan. Try asking about costs, room sizes, validation issues, or suggestions for improvement.";
      const lower = msg.toLowerCase();

      if (lower.includes('cost') || lower.includes('price') || lower.includes('budget')) {
        if (floorPlan) {
          response = `The estimated construction cost is **${formatINR(floorPlan.cost.totalCost)}** for ${floorPlan.cost.builtUpArea} sq.ft at ${formatINR(floorPlan.cost.ratePerSqFt)}/sq.ft (${floorPlan.cost.finishQuality} finish). Breakdown: Structure ${formatINR(floorPlan.cost.structureCost)}, Flooring ${formatINR(floorPlan.cost.flooringCost)}, Electrical ${formatINR(floorPlan.cost.electricalCost)}, Plumbing ${formatINR(floorPlan.cost.plumbingCost)}, Finishes ${formatINR(floorPlan.cost.finishesCost)}.`;
        } else {
          response = "Please generate a plan first to see cost estimates.";
        }
      } else if (lower.includes('invalid') || lower.includes('issue') || lower.includes('problem') || lower.includes('error') || lower.includes('why')) {
        if (floorPlan) {
          const errors = floorPlan.validations.filter(v => v.severity === 'ERROR');
          const warnings = floorPlan.validations.filter(v => v.severity === 'WARNING');
          if (errors.length === 0 && warnings.length === 0) {
            response = "Your plan looks great! No errors or warnings found. ✅";
          } else {
            response = `Found **${errors.length} error(s)** and **${warnings.length} warning(s)**:\n${errors.map(e => `❌ ${e.message}`).join('\n')}\n${warnings.map(w => `⚠️ ${w.message}`).join('\n')}`;
          }
        } else {
          response = "Please generate a plan first to check for issues.";
        }
      } else if (lower.includes('analyze') || lower.includes('analysis') || lower.includes('space') || lower.includes('utilization')) {
        if (floorPlan) {
          const a = floorPlan.analysis;
          response = `**Space Analysis:**\n• Plot: ${a.plotArea} sq.ft\n• Buildable: ${a.buildableArea} sq.ft\n• Built-up: ${a.builtUpArea} sq.ft\n• Open area: ${a.openArea} sq.ft\n• Utilization: ${a.spaceUtilization}%\n• Rooms: ${a.roomCount}\n• Validation: ${a.validationScore}/100`;
        } else {
          response = "Generate a plan first to see space analysis.";
        }
      } else if (lower.includes('suggest') || lower.includes('improve') || lower.includes('better')) {
        if (floorPlan) {
          const fixes = floorPlan.validations.filter(v => v.suggestedFix).slice(0, 3);
          if (fixes.length > 0) {
            response = `Here are some suggestions:\n${fixes.map(f => `💡 ${f.suggestedFix}`).join('\n')}`;
          } else {
            response = "Your plan is looking solid! Consider adding a balcony or study room to enhance livability.";
          }
        } else {
          response = "Generate a plan first, and I can suggest improvements.";
        }
      } else if (lower.includes('room') || lower.includes('bedroom') || lower.includes('kitchen')) {
        if (floorPlan) {
          const roomList = floorPlan.rooms.map(r => `• ${r.name}: ${r.width.toFixed(0)}×${r.height.toFixed(0)} ft (${r.area.toFixed(0)} sq.ft) — Floor ${r.floor}`);
          response = `**Room Summary (${floorPlan.rooms.length} rooms):**\n${roomList.join('\n')}`;
        } else {
          response = "Generate a plan to see room details.";
        }
      } else if (lower.includes('move') && floorPlan) {
        const words = lower.split(' ');
        const moveIdx = words.indexOf('move');
        if (moveIdx !== -1 && words.length > moveIdx + 2) {
          const roomTypeStr = words[moveIdx + 1].toUpperCase();
          const direction = words[moveIdx + 2];
          const amount = parseInt(words[moveIdx + 3]) || 5;

          const targetRoom = floorPlan.rooms.find(r => r.type === roomTypeStr || r.name.toLowerCase().includes(roomTypeStr.toLowerCase()));
          
          if (targetRoom) {
            let dx = 0, dy = 0;
            if (direction === 'right' || direction === 'east') dx = amount;
            if (direction === 'left' || direction === 'west') dx = -amount;
            if (direction === 'up' || direction === 'north') dy = -amount;
            if (direction === 'down' || direction === 'south') dy = amount;
            
            if (dx !== 0 || dy !== 0) {
              handleRoomMove(targetRoom.id, targetRoom.x + dx, targetRoom.y + dy, true);
              response = `Moved ${targetRoom.name} ${direction} by ${amount} ft.`;
            } else {
              response = `I didn't understand the direction. Try 'move kitchen right 5'.`;
            }
          } else {
            response = `I couldn't find a room matching '${roomTypeStr}'.`;
          }
        }
      }

      setChatMessages(prev => [...prev, { role: 'assistant', content: response, timestamp: new Date().toISOString() }]);
    }, 600);
  }, [floorPlan, handleRoomMove]);

  const handleRoomDragEnd = useCallback(() => {
    setFloorPlan(prev => {
      if (prev) {
        commitHistory(prev);
      }
      return prev;
    });
  }, [commitHistory]);

  const selectedRoomData = floorPlan?.rooms.find(r => r.id === selectedRoom) || null;
  const currentFloorRooms = floorPlan?.rooms.filter(r => r.floor === activeFloor) || [];

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 overflow-hidden text-slate-200">
      <TopBar
        projectName={config.name}
        viewMode={viewMode}
        isGenerating={isGenerating}
        onGenerate={handleGenerate}
        onValidate={handleValidate}
        onSwitchView={setViewMode}
        onNewProject={handleNewProject}
        onDemo={handleDemo}
        onUndo={undo}
        onRedo={redo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <LeftSidebar config={config} onChange={setConfig} />

        {/* Center Canvas */}
        <div className="flex-1 flex flex-col relative bg-slate-900 overflow-hidden">
          <div className="flex-1 relative bg-slate-950 m-1 rounded-lg border border-slate-800 overflow-hidden">
            {/* Floor Tabs */}
            {floorPlan && config.floors > 1 && (
              <FloorTabs
                totalFloors={config.floors}
                activeFloor={activeFloor}
                onChange={setActiveFloor}
              />
            )}

            {/* Room Detail Panel */}
            {selectedRoomData && (
              <RoomDetailPanel
                room={selectedRoomData}
                validations={floorPlan?.validations || []}
                relationships={config.relationships}
                onClose={() => setSelectedRoom(null)}
              />
            )}

            {/* Canvas Content */}
            {!floorPlan ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-3">
                <div className="w-20 h-20 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="9" y1="3" x2="9" y2="21" />
                  </svg>
                </div>
                <p className="text-sm font-medium">No plan generated yet</p>
                <p className="text-xs text-slate-700">Configure parameters and click "Generate Plan" to start</p>
                <button
                  onClick={handleDemo}
                  className="mt-2 px-4 py-2 bg-amber-600/20 text-amber-400 border border-amber-600/30 rounded-lg text-sm hover:bg-amber-600/30 transition-colors"
                >
                  ✨ Try Demo Project
                </button>
              </div>
            ) : viewMode === 'SPLIT' ? (
              <div className="flex w-full h-full">
                <div className="flex-1 relative border-r border-slate-700">
                  <FloorPlanSVG
                    rooms={floorPlan.rooms}
                    plot={config.plot}
                    relationships={config.relationships}
                    activeFloor={activeFloor}
                    selectedRoom={selectedRoom}
                    onSelectRoom={setSelectedRoom}
                    onRoomMove={handleRoomMove}
                    onRoomDragEnd={handleRoomDragEnd}
                    showDimensions={showDimensions}
                    showFurniture={showFurniture}
                    showValidation={true}
                    validations={floorPlan.validations}
                  />
                </div>
                <div className="flex-1 relative">
                  <ThreeScene
                    rooms={floorPlan.rooms}
                    plot={config.plot}
                    totalFloors={config.floors}
                    floorHeight={config.floorHeight}
                    activeFloor={activeFloor}
                    selectedRoom={selectedRoom}
                    onSelectRoom={setSelectedRoom}
                    viewMode={threeDViewMode}
                  />
                </div>
              </div>
            ) : viewMode === '2D' ? (
              <FloorPlanSVG
                rooms={floorPlan.rooms}
                plot={config.plot}
                relationships={config.relationships}
                activeFloor={activeFloor}
                selectedRoom={selectedRoom}
                onSelectRoom={setSelectedRoom}
                onRoomMove={handleRoomMove}
                onRoomDragEnd={handleRoomDragEnd}
                showDimensions={showDimensions}
                showFurniture={showFurniture}
                showValidation={true}
                validations={floorPlan.validations}
              />
            ) : (
              <ThreeScene
                rooms={floorPlan.rooms}
                plot={config.plot}
                totalFloors={config.floors}
                floorHeight={config.floorHeight}
                activeFloor={activeFloor}
                selectedRoom={selectedRoom}
                onSelectRoom={setSelectedRoom}
                viewMode={threeDViewMode}
              />
            )}

            {/* View controls overlay */}
            {floorPlan && (
              <div className="absolute bottom-3 left-3 flex gap-2">
                <button
                  onClick={() => setShowDimensions(d => !d)}
                  className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                    showDimensions
                      ? 'bg-blue-600/30 border-blue-500/50 text-blue-300'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Dimensions
                </button>
                <button
                  onClick={() => setShowFurniture(f => !f)}
                  className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                    showFurniture
                      ? 'bg-blue-600/30 border-blue-500/50 text-blue-300'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Furniture
                </button>
                {viewMode === '3D' && (
                  <select
                    value={threeDViewMode}
                    onChange={e => setThreeDViewMode(e.target.value as ThreeDViewMode)}
                    className="px-3 py-1.5 text-xs rounded-md border bg-slate-800/80 border-slate-700 text-slate-300"
                  >
                    <option value="EXTERIOR">Exterior</option>
                    <option value="FLOOR_BY_FLOOR">Floor by Floor</option>
                    <option value="WIREFRAME">Wireframe</option>
                    <option value="EXPLODED">Exploded</option>
                  </select>
                )}
              </div>
            )}
          </div>

          {/* AI Assistant */}
          <AIAssistant
            messages={chatMessages}
            onSend={handleChat}
            plan={floorPlan}
            config={config}
          />
        </div>

        {/* Right Sidebar */}
        <RightSidebar
          validations={floorPlan?.validations || []}
          spaceAnalysis={floorPlan?.analysis || null}
          costEstimate={floorPlan?.cost || null}
          selectedRoom={selectedRoom}
          rooms={currentFloorRooms}
        />
      </div>

      {/* Disclaimer */}
      <div className="h-6 bg-slate-900 border-t border-slate-800 flex items-center justify-center">
        <span className="text-[10px] text-slate-600">
          ArchPlanner — Indicative conceptual layout. Not a substitute for professional architectural, structural, or legal approval.
        </span>
      </div>
    </div>
  );
}

export default App;
