import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Edges, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { ROOM_COLORS } from '../types';
import type { PlacedRoom, Plot, ThreeDViewMode } from '../types';

interface ThreeSceneProps {
  rooms: PlacedRoom[];
  plot: Plot;
  totalFloors: number;
  floorHeight: number;
  activeFloor: number;
  selectedRoom: string | null;
  onSelectRoom: (id: string | null) => void;
  viewMode: ThreeDViewMode;
}

const RoomMesh: React.FC<{
  room: PlacedRoom;
  floorHeight: number;
  selected: boolean;
  onSelect: () => void;
  isWireframe: boolean;
  yOffset: number;
}> = ({ room, floorHeight, selected, onSelect, isWireframe, yOffset }) => {
  const wallHeight = floorHeight * 0.9;
  const colorInfo = ROOM_COLORS[room.type] || { fill: '#ffffff', stroke: '#000000', label: room.type };
  const color = useMemo(() => {
    const c = new THREE.Color(colorInfo.fill);
    if (selected) c.lerp(new THREE.Color('#ffffff'), 0.4);
    return c;
  }, [colorInfo.fill, selected]);

  const yPos = room.floor * floorHeight + wallHeight / 2 + yOffset;

  return (
    <group
      position={[room.x + room.width / 2, yPos, room.y + room.height / 2]}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[room.width, wallHeight, room.height]} />
        <meshStandardMaterial
          color={color}
          wireframe={isWireframe}
          transparent
          opacity={isWireframe ? 0.3 : 0.92}
          roughness={0.7}
          metalness={0.1}
        />
        {!isWireframe && <Edges color={selected ? '#3b82f6' : '#333333'} linewidth={1} />}
      </mesh>

      {/* Room label */}
      <Html position={[0, wallHeight / 2 + 0.5, 0]} center distanceFactor={80}>
        <div className="bg-slate-900/90 text-white px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap pointer-events-none border border-slate-700 shadow-lg">
          {colorInfo.label}
        </div>
      </Html>

      {/* Door indicators */}
      {room.doors.map((door, i) => {
        let dx = 0, dz = 0;
        if (door.side === 'LEFT') { dx = -room.width / 2 - 0.1; dz = door.y - room.height / 2 + door.width / 2; }
        else if (door.side === 'RIGHT') { dx = room.width / 2 + 0.1; dz = door.y - room.height / 2 + door.width / 2; }
        else if (door.side === 'TOP') { dx = door.x - room.width / 2 + door.width / 2; dz = -room.height / 2 - 0.1; }
        else { dx = door.x - room.width / 2 + door.width / 2; dz = room.height / 2 + 0.1; }
        return (
          <mesh key={`door-${i}`} position={[dx, -wallHeight / 4, dz]}>
            <boxGeometry args={[door.side === 'LEFT' || door.side === 'RIGHT' ? 0.3 : door.width, wallHeight / 2, door.side === 'TOP' || door.side === 'BOTTOM' ? 0.3 : door.width]} />
            <meshStandardMaterial color="#8B6914" opacity={0.8} transparent />
          </mesh>
        );
      })}

      {/* Window indicators */}
      {room.windows.map((win, i) => {
        let wx = 0, wz = 0;
        if (win.side === 'LEFT') { wx = -room.width / 2 - 0.1; wz = win.y - room.height / 2 + win.width / 2; }
        else if (win.side === 'RIGHT') { wx = room.width / 2 + 0.1; wz = win.y - room.height / 2 + win.width / 2; }
        else if (win.side === 'TOP') { wx = win.x - room.width / 2 + win.width / 2; wz = -room.height / 2 - 0.1; }
        else { wx = win.x - room.width / 2 + win.width / 2; wz = room.height / 2 + 0.1; }
        return (
          <mesh key={`win-${i}`} position={[wx, wallHeight / 6, wz]}>
            <boxGeometry args={[win.side === 'LEFT' || win.side === 'RIGHT' ? 0.2 : win.width, wallHeight / 3, win.side === 'TOP' || win.side === 'BOTTOM' ? 0.2 : win.width]} />
            <meshStandardMaterial color="#87CEEB" opacity={0.6} transparent />
          </mesh>
        );
      })}
    </group>
  );
};

export const ThreeScene: React.FC<ThreeSceneProps> = ({
  rooms,
  plot,
  totalFloors,
  floorHeight,
  activeFloor,
  selectedRoom,
  onSelectRoom,
  viewMode,
}) => {
  const isWireframe = viewMode === 'WIREFRAME';
  const centerX = plot.width / 2;
  const centerZ = plot.depth / 2;

  const visibleRooms = useMemo(() => {
    if (viewMode === 'FLOOR_BY_FLOOR') {
      return rooms.filter(r => r.floor === activeFloor);
    }
    return rooms;
  }, [rooms, activeFloor, viewMode]);

  const explodeOffset = viewMode === 'EXPLODED' ? floorHeight * 0.6 : 0;
  const camDist = Math.max(plot.width, plot.depth) * 1.2;

  return (
    <div className="w-full h-full" style={{ backgroundColor: '#0f1419' }}>
      <Canvas
        camera={{
          position: [camDist * 0.7, camDist * 0.6, camDist * 0.7],
          fov: 50,
          near: 0.1,
          far: 1000,
        }}
        shadows
      >
        <color attach="background" args={['#0f1419']} />
        <fog attach="fog" args={['#0f1419', camDist * 2, camDist * 4]} />

        <ambientLight intensity={0.5} />
        <directionalLight
          position={[50, 80, 30]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <directionalLight position={[-30, 40, -20]} intensity={0.3} />

        <group position={[-centerX, 0, -centerZ]}>
          {/* Ground plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[centerX, -0.1, centerZ]} receiveShadow>
            <planeGeometry args={[plot.width * 3, plot.depth * 3]} />
            <meshStandardMaterial color="#1a1f2e" roughness={0.9} />
          </mesh>

          {/* Grid */}
          <Grid
            position={[centerX, 0, centerZ]}
            args={[plot.width * 2, plot.depth * 2]}
            cellSize={5}
            cellThickness={0.5}
            cellColor="#2a3142"
            sectionSize={10}
            sectionThickness={1}
            sectionColor="#3a4562"
            fadeDistance={200}
            infiniteGrid
          />

          {/* Plot boundary outline */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[centerX, 0.02, centerZ]}>
            <planeGeometry args={[plot.width, plot.depth]} />
            <meshBasicMaterial color="#1e293b" transparent opacity={0.5} />
          </mesh>
          <lineSegments position={[centerX, 0.05, centerZ]}>
            <edgesGeometry args={[new THREE.PlaneGeometry(plot.width, plot.depth)]} />
            <lineBasicMaterial color="#475569" />
          </lineSegments>

          {/* Floor slabs */}
          {Array.from({ length: totalFloors }).map((_, f) => {
            if (viewMode === 'FLOOR_BY_FLOOR' && f !== activeFloor) return null;
            const slabY = f * floorHeight + (viewMode === 'EXPLODED' ? f * explodeOffset : 0);
            return (
              <mesh key={`slab-${f}`} position={[centerX, slabY - 0.15, centerZ]} receiveShadow castShadow>
                <boxGeometry args={[plot.width - plot.leftSetback - plot.rightSetback + 1, 0.3, plot.depth - plot.frontSetback - plot.rearSetback + 1]} />
                <meshStandardMaterial color="#475569" roughness={0.8} />
              </mesh>
            );
          })}

          {/* Roof slab */}
          {(viewMode !== 'FLOOR_BY_FLOOR') && (
            <mesh position={[centerX, totalFloors * floorHeight + (viewMode === 'EXPLODED' ? (totalFloors - 1) * explodeOffset : 0), centerZ]} castShadow>
              <boxGeometry args={[plot.width - plot.leftSetback - plot.rightSetback + 2, 0.4, plot.depth - plot.frontSetback - plot.rearSetback + 2]} />
              <meshStandardMaterial color="#374151" roughness={0.7} />
            </mesh>
          )}

          {/* Rooms */}
          {visibleRooms.map(room => (
            <RoomMesh
              key={room.id}
              room={room}
              floorHeight={floorHeight}
              selected={selectedRoom === room.id}
              onSelect={() => onSelectRoom(selectedRoom === room.id ? null : room.id)}
              isWireframe={isWireframe}
              yOffset={viewMode === 'EXPLODED' ? room.floor * explodeOffset : 0}
            />
          ))}
        </group>

        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.1}
          minDistance={10}
          maxDistance={camDist * 3}
          target={[0, floorHeight * totalFloors / 2, 0]}
        />
      </Canvas>
    </div>
  );
};
