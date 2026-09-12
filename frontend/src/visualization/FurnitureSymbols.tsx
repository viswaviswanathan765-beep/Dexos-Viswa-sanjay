import React from 'react';
import type { RoomType } from '../types';

export const SofaSymbol = ({ x, y, width, height }: { x: number, y: number, width: number, height: number }) => (
  <g transform={`translate(${x}, ${y})`}>
    <rect x={width * 0.1} y={height * 0.1} width={width * 0.3} height={height * 0.8} fill="#ddd" stroke="#666" />
    <rect x={width * 0.1} y={height * 0.1} width={width * 0.8} height={height * 0.3} fill="#ddd" stroke="#666" />
  </g>
);

export const BedSymbol = ({ x, y, width, height }: { x: number, y: number, width: number, height: number }) => (
  <g transform={`translate(${x}, ${y})`}>
    <rect x={width * 0.2} y={height * 0.2} width={width * 0.6} height={height * 0.6} fill="#eee" stroke="#999" rx={2} />
    <rect x={width * 0.25} y={height * 0.25} width={width * 0.5} height={height * 0.15} fill="#fff" stroke="#999" rx={1} />
    <line x1={width * 0.2} y1={height * 0.45} x2={width * 0.8} y2={height * 0.45} stroke="#999" />
  </g>
);

export const DiningTableSymbol = ({ x, y, width, height }: { x: number, y: number, width: number, height: number }) => (
  <g transform={`translate(${x}, ${y})`}>
    <rect x={width * 0.25} y={height * 0.25} width={width * 0.5} height={height * 0.5} fill="#e5c8a8" stroke="#8b5a2b" rx={3} />
    <circle cx={width * 0.2} cy={height * 0.5} r={Math.min(width, height) * 0.08} fill="#ddd" stroke="#666" />
    <circle cx={width * 0.8} cy={height * 0.5} r={Math.min(width, height) * 0.08} fill="#ddd" stroke="#666" />
    <circle cx={width * 0.5} cy={height * 0.2} r={Math.min(width, height) * 0.08} fill="#ddd" stroke="#666" />
    <circle cx={width * 0.5} cy={height * 0.8} r={Math.min(width, height) * 0.08} fill="#ddd" stroke="#666" />
  </g>
);

export const KitchenCounterSymbol = ({ x, y, width, height }: { x: number, y: number, width: number, height: number }) => (
  <g transform={`translate(${x}, ${y})`}>
    <rect x={0} y={0} width={width * 0.3} height={height} fill="#ccc" stroke="#888" />
    <circle cx={width * 0.15} cy={height * 0.5} r={Math.min(width, height) * 0.1} fill="#eef" stroke="#888" />
  </g>
);

export const BathroomFixtures = ({ x, y, width, height }: { x: number, y: number, width: number, height: number }) => (
  <g transform={`translate(${x}, ${y})`}>
    <ellipse cx={width * 0.5} cy={height * 0.3} rx={width * 0.15} ry={height * 0.2} fill="#fff" stroke="#666" />
    <rect x={width * 0.7} y={height * 0.7} width={width * 0.3} height={height * 0.3} fill="#eef" stroke="#666" />
    <circle cx={width * 0.85} cy={height * 0.85} r={Math.min(width, height) * 0.05} fill="#aad" stroke="#666" />
  </g>
);

export const CarSymbol = ({ x, y, width, height }: { x: number, y: number, width: number, height: number }) => (
  <g transform={`translate(${x}, ${y})`}>
    <rect x={width * 0.2} y={height * 0.1} width={width * 0.6} height={height * 0.8} fill="#999" stroke="#333" rx={width * 0.1} />
    <rect x={width * 0.25} y={height * 0.25} width={width * 0.5} height={height * 0.2} fill="#bbf" stroke="#333" rx={2} />
    <rect x={width * 0.25} y={height * 0.65} width={width * 0.5} height={height * 0.15} fill="#bbf" stroke="#333" rx={2} />
  </g>
);

export const StaircasePattern = ({ x, y, width, height }: { x: number, y: number, width: number, height: number }) => {
  const steps = 8;
  const stepHeight = height / steps;
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x={0} y={0} width={width} height={height} fill="none" stroke="#666" />
      {Array.from({ length: steps }).map((_, i) => (
        <line key={i} x1={0} y1={i * stepHeight} x2={width} y2={i * stepHeight} stroke="#666" />
      ))}
      <line x1={width / 2} y1={0} x2={width / 2} y2={height} stroke="#666" />
    </g>
  );
};
